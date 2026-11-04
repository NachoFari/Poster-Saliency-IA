/**
 * saliency-engine.js - Orquestador del Pipeline de Salencia
 * Coordina filtros, modelos individuales, modo Consenso (coincidencia de las 3 redes),
 * colormaps y análisis de scanpath.
 */

window.SaliencyApp = window.SaliencyApp || {};

class SaliencyEngine {
    constructor() {
        this.colormaps = window.SaliencyApp.ColorMaps;
        this.models = window.SaliencyApp.SOTAModels;
        this.filters = window.SaliencyApp.CoreFilters;
        this.scanpathModule = window.SaliencyApp.ScanpathAnalysis;
    }

    /**
     * Normaliza un buffer Float32Array al rango [0, 1]
     */
    normalizeBuffer(buf) {
        const total = buf.length;
        let max = 0, min = Infinity;
        for (let i = 0; i < total; i++) {
            if (buf[i] > max) max = buf[i];
            if (buf[i] < min) min = buf[i];
        }
        const delta = (max - min) || 1;
        const out = new Float32Array(total);
        for (let i = 0; i < total; i++) {
            out[i] = (buf[i] - min) / delta;
        }
        return out;
    }

    /**
     * Evalúa un modelo específico sobre los canales extraídos
     */
    evaluateSingleModel(model, channels, width, height, weights) {
        const { lum, rg, by, meanLum, edges, localBlur, macroBlur } = channels;
        const { contrastWeight, edgeWeight, readingBias, centerPrior } = weights;
        const total = width * height;
        const rawMap = new Float32Array(total);

        for (let y = 0; y < height; y++) {
            const ny = y / height;
            const row = y * width;
            for (let x = 0; x < width; x++) {
                const nx = x / width;
                const idx = row + x;

                const localContrast = Math.abs(lum[idx] - localBlur[idx]);
                const regionalContrast = Math.abs(localBlur[idx] - macroBlur[idx]);
                const colorPop = rg[idx] * 1.6 + by[idx] * 1.3;
                const edge = edges[idx];

                const topBias = Math.exp(-Math.pow(ny / 0.32, 2)) * 1.5;
                const readingFlow = (1.0 - nx * 0.25) * (1.0 - ny * 0.35);
                const cx = (nx - 0.5) * 2;
                const cy = (ny - 0.5) * 2;
                const centerBias = Math.exp(-(cx * cx + cy * cy) / 0.85);

                const score = model.calculatePixelScore({
                    lum: lum[idx],
                    meanLum,
                    localContrast,
                    regionalContrast,
                    colorPop,
                    edge,
                    topBias,
                    readingFlow,
                    centerBias,
                    contrastWeight,
                    edgeWeight,
                    readingBias,
                    centerPrior
                });

                rawMap[idx] = Math.max(0, score);
            }
        }
        return rawMap;
    }

    /**
     * Procesa una imagen y retorna el mapa de atención y sus métricas
     */
    process(sourceElement, options = {}) {
        const {
            modelId = 'consenso',
            blurRadius = 16,
            contrastWeight = 1.0,
            edgeWeight = 1.2,
            readingBias = 0.4,
            centerPrior = 0.2,
            threshold = 0.0
        } = options;

        const model = this.models[modelId] || this.models.consenso;

        // Escalar imagen para procesamiento rápido si es muy grande
        const maxDim = 1000;
        let width = sourceElement.width || sourceElement.naturalWidth;
        let height = sourceElement.height || sourceElement.naturalHeight;

        if (width > maxDim || height > maxDim) {
            if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
        }

        const procCanvas = document.createElement('canvas');
        procCanvas.width = width;
        procCanvas.height = height;
        const ctx = procCanvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(sourceElement, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const total = width * height;

        // 1. Extracción de canales y filtros base
        const { lum, rg, by, meanLum } = this.filters.extractChannels(imgData.data, total);
        const edges = this.filters.sobelGradients(lum, width, height);
        const localBlur = this.filters.boxBlur(lum, width, height, 4);
        const macroBlur = this.filters.boxBlur(lum, width, height, 18);

        const channels = { lum, rg, by, meanLum, edges, localBlur, macroBlur };
        const weights = { contrastWeight, edgeWeight, readingBias, centerPrior };

        let rawMap;

        // 2. Inferencia: Modo Consenso (3 Redes) vs Modelo Individual
        if (modelId === 'consenso') {
            const mapUmsi = this.normalizeBuffer(
                this.evaluateSingleModel(this.models.umsi, channels, width, height, weights)
            );
            const mapDeep = this.normalizeBuffer(
                this.evaluateSingleModel(this.models.deepgaze, channels, width, height, weights)
            );
            const mapTran = this.normalizeBuffer(
                this.evaluateSingleModel(this.models.transalnet, channels, width, height, weights)
            );

            rawMap = new Float32Array(total);
            for (let i = 0; i < total; i++) {
                const u = mapUmsi[i];
                const d = mapDeep[i];
                const t = mapTran[i];

                // Media geométrica (requiere que los 3 modelos activen la zona)
                const geomMean = Math.cbrt(u * d * t);

                // Factor de coincidencia (1 - desviación estándar entre los 3 modelos)
                const mean = (u + d + t) / 3;
                const variance = ((u - mean) ** 2 + (d - mean) ** 2 + (t - mean) ** 2) / 3;
                const agreement = Math.max(0, 1 - Math.sqrt(variance));

                rawMap[i] = geomMean * (0.5 + 0.5 * agreement);
            }
        } else {
            rawMap = this.evaluateSingleModel(model, channels, width, height, weights);
        }

        // 3. Suavizado foveal
        const smoothRadius = Math.max(3, Math.round(blurRadius * (width / 800)));
        const smoothed = this.filters.gaussianBlur(rawMap, width, height, smoothRadius);

        // 4. Normalización no lineal y corte de umbral
        const normSmooth = this.normalizeBuffer(smoothed);
        const normalized = new Float32Array(total);

        for (let i = 0; i < total; i++) {
            let v = Math.pow(normSmooth[i], 1.8);
            if (v < threshold) v = 0;
            normalized[i] = v;
        }

        // 5. Hotspots, trayectoria y diagnóstico
        const { hotspots, scanpath } = this.scanpathModule.extract(normalized, width, height);
        const metrics = this.scanpathModule.diagnosePoster(normalized, width, height, hotspots);

        return {
            width,
            height,
            normalizedMap: normalized,
            hotspots,
            scanpath,
            metrics,
            modelInfo: model
        };
    }

    /**
     * Dibuja el mapa de calor sobre un canvas de salida
     */
    renderHeatmap(targetCanvas, normalizedMap, width, height, options = {}) {
        const {
            colormap = 'turbo',
            opacity = 0.65,
            spotlightMode = false
        } = options;

        targetCanvas.width = width;
        targetCanvas.height = height;
        const ctx = targetCanvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const lut = this.colormaps[colormap] || this.colormaps.turbo;
        const total = width * height;

        for (let p = 0, i = 0; p < total; p++, i += 4) {
            const val = normalizedMap[p];

            if (val <= 0.03) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = spotlightMode ? 190 : 0;
                continue;
            }

            const lutIdx = Math.min(255, Math.max(0, Math.round(val * 255))) * 3;
            data[i] = lut[lutIdx];
            data[i + 1] = lut[lutIdx + 1];
            data[i + 2] = lut[lutIdx + 2];

            const alpha = Math.min(1.0, val * 1.4) * opacity * 255;
            data[i + 3] = Math.round(alpha);
        }

        ctx.putImageData(imgData, 0, 0);
    }
}

window.SaliencyApp.SaliencyEngine = SaliencyEngine;
