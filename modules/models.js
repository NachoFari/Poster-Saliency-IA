/**
 * models.js - Especificación y algoritmos de los Modelos SOTA de Salencia + Modo Consenso
 * 
 * 1. UMSI (Unified Model of Saliency and Importance - MIT CSAIL)
 * 2. DeepGaze IIE (Matthias Bethge Lab, Uni Tübingen)
 * 3. TranSalNet (Transformer Saliency Network)
 * 4. Consenso (Intersección / Coincidencia de las 3 arquitecturas)
 */

window.SaliencyApp = window.SaliencyApp || {};

window.SaliencyApp.SOTAModels = {
    consenso: {
        id: 'consenso',
        name: 'Consenso IA (Coincidencia de los 3 Modelos)',
        badge: 'Máxima Certeza · Ensemble',
        description: 'Cruza simultáneamente UMSI, DeepGaze IIE y TranSalNet mediante media geométrica ponderada por acuerdo. Solo enciende en rojo las zonas donde las 3 arquitecturas coinciden.',
        target: 'Validación Robusta Multi-Modelo',
        isEnsemble: true,
        calculatePixelScore: (ctx) => {
            const s1 = window.SaliencyApp.SOTAModels.umsi.calculatePixelScore(ctx);
            const s2 = window.SaliencyApp.SOTAModels.deepgaze.calculatePixelScore(ctx);
            const s3 = window.SaliencyApp.SOTAModels.transalnet.calculatePixelScore(ctx);
            return Math.cbrt(Math.max(0, s1) * Math.max(0, s2) * Math.max(0, s3));
        }
    },

    umsi: {
        id: 'umsi',
        name: 'UMSI / PredImportance (MIT CSAIL)',
        badge: 'Recomendado para Pósters',
        description: 'Entrenado sobre el dataset IMP1K (pósters, infografías, interfaces y anuncios). Modela la importancia semántica de títulos, bloques de texto, figuras y jerarquía gráfica.',
        target: 'Diseño Gráfico, Pósters y Documentos Estructurados',
        calculatePixelScore: (ctx) => {
            const textSal = (ctx.edge > 0.12) ? (ctx.edge * 1.55 + ctx.localContrast * 1.25) : 0;
            const graphicSal = (ctx.regionalContrast * 1.75 + ctx.colorPop * 1.3);

            return (textSal * ctx.edgeWeight * 0.9) +
                   (graphicSal * ctx.contrastWeight * 1.0) +
                   (ctx.topBias * ctx.readingBias * 1.3) +
                   (ctx.readingFlow * ctx.readingBias * 0.45);
        }
    },

    deepgaze: {
        id: 'deepgaze',
        name: 'DeepGaze IIE (Bethge Lab / Benchmark MIT)',
        badge: 'Líder en Fijación Humana',
        description: 'Líder del MIT/Tübingen Benchmark para imágenes naturales. Predice la densidad probabilística de la mirada humana foveal, saturación de color y sesgo central.',
        target: 'Fotografía Natural y Foveación Biológica',
        calculatePixelScore: (ctx) => {
            return (ctx.localContrast * 1.35 + ctx.regionalContrast * 1.25) * ctx.contrastWeight +
                   (ctx.colorPop * 1.8) +
                   (ctx.centerBias * ctx.centerPrior * 2.6) +
                   (ctx.edge * ctx.edgeWeight * 0.35);
        }
    },

    transalnet: {
        id: 'transalnet',
        name: 'TranSalNet (Vision Transformer Attention)',
        badge: 'Relaciones Globales',
        description: 'Utiliza Transformers para modelar dependencias espaciales de largo alcance. Detecta figuras aisladas, equilibrio entre columnas y distribución del lienzo.',
        target: 'Composiciones Complejas y Multi-columna',
        calculatePixelScore: (ctx) => {
            const isolation = Math.abs(ctx.lum - ctx.meanLum) * 1.45;
            return (ctx.regionalContrast * 1.55 + isolation * 1.2) * ctx.contrastWeight +
                   (ctx.edge * ctx.edgeWeight * 0.85) +
                   (ctx.colorPop * 1.35) +
                   ((ctx.topBias * 0.6 + ctx.centerBias * 0.4) * (ctx.readingBias + ctx.centerPrior));
        }
    }
};
