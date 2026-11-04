/**
 * core-filters.js - Filtros de Visión por Computadora Livianos
 * Operaciones de bajo nivel sobre buffers Float32Array para máxima velocidad.
 */

window.SaliencyApp = window.SaliencyApp || {};

window.SaliencyApp.CoreFilters = {
    /**
     * Extrae canales de luminancia y oponencia de color (R-G, B-Y)
     */
    extractChannels(rgbaData, totalPixels) {
        const lum = new Float32Array(totalPixels);
        const rg = new Float32Array(totalPixels);
        const by = new Float32Array(totalPixels);
        let meanLum = 0;

        for (let i = 0, p = 0; p < totalPixels; p++, i += 4) {
            const r = rgbaData[i] / 255;
            const g = rgbaData[i + 1] / 255;
            const b = rgbaData[i + 2] / 255;

            const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            lum[p] = l;
            meanLum += l;

            rg[p] = Math.max(0, r - (g + b) * 0.5);
            by[p] = Math.max(0, b - (r + g) * 0.5);
        }

        return { lum, rg, by, meanLum: meanLum / totalPixels };
    },

    /**
     * Filtro Sobel para gradientes y densidad de bordes (texto, líneas, diagramas)
     */
    sobelGradients(lum, width, height) {
        const edges = new Float32Array(width * height);
        const stride = width;

        for (let y = 1; y < height - 1; y++) {
            const row = y * stride;
            for (let x = 1; x < width - 1; x++) {
                const idx = row + x;
                const gx = 
                    -lum[idx - stride - 1] + lum[idx - stride + 1]
                    -2 * lum[idx - 1] + 2 * lum[idx + 1]
                    -lum[idx + stride - 1] + lum[idx + stride + 1];
                const gy = 
                    -lum[idx - stride - 1] - 2 * lum[idx - stride] - lum[idx - stride + 1]
                    +lum[idx + stride - 1] + 2 * lum[idx + stride] + lum[idx + stride + 1];
                edges[idx] = Math.sqrt(gx * gx + gy * gy);
            }
        }
        return edges;
    },

    /**
     * Desenfoque en caja (Box Blur) 2D separable en O(N)
     */
    boxBlur(input, width, height, radius) {
        const out = new Float32Array(input.length);
        const tmp = new Float32Array(input.length);

        for (let y = 0; y < height; y++) {
            const row = y * width;
            for (let x = 0; x < width; x++) {
                let sum = 0, count = 0;
                for (let k = -radius; k <= radius; k++) {
                    const nx = x + k;
                    if (nx >= 0 && nx < width) {
                        sum += input[row + nx];
                        count++;
                    }
                }
                tmp[row + x] = sum / count;
            }
        }

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let sum = 0, count = 0;
                for (let k = -radius; k <= radius; k++) {
                    const ny = y + k;
                    if (ny >= 0 && ny < height) {
                        sum += tmp[ny * width + x];
                        count++;
                    }
                }
                out[y * width + x] = sum / count;
            }
        }
        return out;
    },

    /**
     * Suavizado Gaussiano aproximado mediante 3 pasadas de Box Blur
     */
    gaussianBlur(input, width, height, radius) {
        let cur = input;
        const r = Math.max(1, Math.round(radius * 0.57));
        for (let p = 0; p < 3; p++) {
            cur = this.boxBlur(cur, width, height, r);
        }
        return cur;
    }
};
