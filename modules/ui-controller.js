/**
 * ui-controller.js - Controlador de Interfaz de Usuario
 * Maneja eventos, controles, drag & drop, paste Ctrl+V y exportación.
 */

window.SaliencyApp = window.SaliencyApp || {};

class UIController {
    constructor() {
        this.engine = new window.SaliencyApp.SaliencyEngine();
        this.generator = window.SaliencyApp.PosterGenerator;
        this.sourceImage = null;
        this.saliencyResult = null;

        this.options = {
            modelId: 'consenso',
            colormap: 'turbo',
            opacity: 0.65,
            blurRadius: 16,
            contrastWeight: 1.0,
            edgeWeight: 1.2,
            readingBias: 0.4,
            centerPrior: 0.2,
            threshold: 0.0,
            spotlightMode: false,
            showScanpath: true
        };

        this.initElements();
        this.bindEvents();
        this.loadSample();
    }

    initElements() {
        this.dom = {
            dropZone: document.getElementById('dropZone'),
            fileInput: document.getElementById('fileInput'),
            btnSample: document.getElementById('btnSample'),
            btnExport: document.getElementById('btnExport'),
            modelSelect: document.getElementById('modelSelect'),
            colormapSelect: document.getElementById('colormapSelect'),
            sliderOpacity: document.getElementById('sliderOpacity'),
            valOpacity: document.getElementById('valOpacity'),
            sliderBlur: document.getElementById('sliderBlur'),
            valBlur: document.getElementById('valBlur'),
            sliderThreshold: document.getElementById('sliderThreshold'),
            valThreshold: document.getElementById('valThreshold'),
            checkScanpath: document.getElementById('checkScanpath'),
            checkSpotlight: document.getElementById('checkSpotlight'),
            modelBadge: document.getElementById('modelBadge'),
            modelDesc: document.getElementById('modelDesc'),
            
            baseCanvas: document.getElementById('baseCanvas'),
            heatCanvas: document.getElementById('heatCanvas'),
            scanpathCanvas: document.getElementById('scanpathCanvas'),

            metricVerdict: document.getElementById('metricVerdict'),
            metricHeader: document.getElementById('metricHeader'),
            metricDominance: document.getElementById('metricDominance'),
            metricClutter: document.getElementById('metricClutter'),
            hotspotsList: document.getElementById('hotspotsList'),
            adviceList: document.getElementById('adviceList')
        };
    }

    bindEvents() {
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.loadFile(e.dataTransfer.files[0]);
            }
        });

        // Pegar imagen directamente desde el portapapeles con Ctrl + V
        window.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    this.loadFile(blob);
                    break;
                }
            }
        });

        this.dom.fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.loadFile(e.target.files[0]);
            }
        });

        this.dom.btnSample.addEventListener('click', () => this.loadSample());

        this.dom.modelSelect.addEventListener('change', (e) => {
            this.options.modelId = e.target.value;
            this.recompute();
        });

        this.dom.colormapSelect.addEventListener('change', (e) => {
            this.options.colormap = e.target.value;
            this.renderHeatmapOnly();
        });

        this.dom.sliderOpacity.addEventListener('input', (e) => {
            this.options.opacity = parseFloat(e.target.value);
            this.dom.valOpacity.textContent = Math.round(this.options.opacity * 100) + '%';
            this.renderHeatmapOnly();
        });

        this.dom.sliderBlur.addEventListener('input', (e) => {
            this.options.blurRadius = parseInt(e.target.value, 10);
            this.dom.valBlur.textContent = this.options.blurRadius + ' px';
            this.recompute();
        });

        this.dom.sliderThreshold.addEventListener('input', (e) => {
            this.options.threshold = parseFloat(e.target.value);
            this.dom.valThreshold.textContent = Math.round(this.options.threshold * 100) + '%';
            this.recompute();
        });

        this.dom.checkScanpath.addEventListener('change', (e) => {
            this.options.showScanpath = e.target.checked;
            this.renderScanpath();
        });

        this.dom.checkSpotlight.addEventListener('change', (e) => {
            this.options.spotlightMode = e.target.checked;
            this.renderHeatmapOnly();
        });

        this.dom.btnExport.addEventListener('click', () => this.exportCombinedPNG());
    }

    loadFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.sourceImage = img;
                this.renderBaseImage();
                this.recompute();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    loadSample() {
        const sampleCanvas = this.generator.createSamplePoster();
        this.sourceImage = sampleCanvas;
        this.renderBaseImage();
        this.recompute();
    }

    renderBaseImage() {
        const w = this.sourceImage.width;
        const h = this.sourceImage.height;

        this.dom.baseCanvas.width = w;
        this.dom.baseCanvas.height = h;
        const ctx = this.dom.baseCanvas.getContext('2d');
        ctx.drawImage(this.sourceImage, 0, 0);

        this.dom.heatCanvas.width = w;
        this.dom.heatCanvas.height = h;

        this.dom.scanpathCanvas.width = w;
        this.dom.scanpathCanvas.height = h;
    }

    recompute() {
        if (!this.sourceImage) return;

        this.saliencyResult = this.engine.process(this.sourceImage, this.options);
        
        const model = this.saliencyResult.modelInfo;
        this.dom.modelBadge.textContent = model.badge;
        this.dom.modelDesc.textContent = model.description;

        this.renderHeatmapOnly();
        this.renderScanpath();
        this.updateMetricsUI();
    }

    renderHeatmapOnly() {
        if (!this.saliencyResult) return;
        this.engine.renderHeatmap(
            this.dom.heatCanvas,
            this.saliencyResult.normalizedMap,
            this.saliencyResult.width,
            this.saliencyResult.height,
            this.options
        );
    }

    renderScanpath() {
        if (!this.saliencyResult) return;
        const canvas = this.dom.scanpathCanvas;
        canvas.width = this.saliencyResult.width;
        canvas.height = this.saliencyResult.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!this.options.showScanpath || !this.saliencyResult.scanpath.length) {
            return;
        }

        const path = this.saliencyResult.scanpath;

        // Trayectoria sacádica
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        path.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Puntos numerados de atención
        path.forEach((pt) => {
            const radius = 22;

            ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius + 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pt.order.toString(), pt.x, pt.y);
        });
    }

    updateMetricsUI() {
        const m = this.saliencyResult.metrics;
        
        this.dom.metricVerdict.textContent = m.verdict;
        this.dom.metricVerdict.className = 'metric-status ' + m.status;

        this.dom.metricHeader.textContent = m.headerShare + '%';
        this.dom.metricDominance.textContent = m.focalDominance + '%';
        this.dom.metricClutter.textContent = m.cognitiveLoad + '/100';

        this.dom.hotspotsList.innerHTML = '';
        this.saliencyResult.hotspots.slice(0, 4).forEach((h, i) => {
            const li = document.createElement('li');
            li.innerHTML = `<span><strong>#${i + 1}</strong> Foco (${h.nx}%, ${h.ny}%)</span> <span class="badge-score">${h.score}%</span>`;
            this.dom.hotspotsList.appendChild(li);
        });

        this.dom.adviceList.innerHTML = '';
        m.advice.forEach((adv) => {
            const li = document.createElement('li');
            li.textContent = adv;
            this.dom.adviceList.appendChild(li);
        });
    }

    exportCombinedPNG() {
        if (!this.sourceImage) return;

        const w = this.dom.baseCanvas.width;
        const h = this.dom.baseCanvas.height;

        const out = document.createElement('canvas');
        out.width = w;
        out.height = h;
        const ctx = out.getContext('2d');

        ctx.drawImage(this.dom.baseCanvas, 0, 0, w, h);
        ctx.drawImage(this.dom.heatCanvas, 0, 0, w, h);
        if (this.options.showScanpath) {
            ctx.drawImage(this.dom.scanpathCanvas, 0, 0, w, h);
        }

        const link = document.createElement('a');
        link.download = `Mapa-Calor-Poster-${this.options.modelId}.png`;
        link.href = out.toDataURL('image/png');
        link.click();
    }
}

window.SaliencyApp.UIController = UIController;
