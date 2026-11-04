/**
 * poster-generator.js - Generador de Póster Científico de Demostración
 * Crea un póster en Canvas para que el usuario pueda probar la app de inmediato en 1 clic.
 */

window.SaliencyApp = window.SaliencyApp || {};

window.SaliencyApp.PosterGenerator = {
    createSamplePoster(width = 900, height = 1200) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fondo del póster
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // 1. Cabecera (Header Banner)
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(30, 30, width - 60, 160);

        // Título del póster (Gran impacto tipográfico)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px system-ui, sans-serif';
        ctx.fillText('OPTIMIZACIÓN DE MODELOS DE ATENCIÓN VISUAL', 60, 85);
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('EN LA COMUNICACIÓN DE CIENCIA Y DISEÑO DE PÓSTERS', 60, 120);

        // Autores y afiliación
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Dr. A. Valenzuela, Dra. M. Soto • Laboratorio de Inteligencia Visual • Universidad', 60, 155);

        // 2. Columnas del póster (Layout clásico de 3 columnas)
        const colWidth = (width - 120) / 3;
        const topY = 220;

        // --- Columna 1: Introducción y Metodología ---
        const x1 = 40;
        this.drawCard(ctx, x1, topY, colWidth, 280, '1. INTRODUCCIÓN');
        ctx.fillStyle = '#475569';
        ctx.font = '13px system-ui, sans-serif';
        this.drawTextLines(ctx, [
            'Los pósters científicos compiten por',
            'la atención en congresos masivos.',
            'El 80% de los asistentes solo dedica',
            'entre 3 y 5 segundos antes de decidir',
            'si detenerse a profundizar.'
        ], x1 + 15, topY + 60, 20);

        this.drawCard(ctx, x1, topY + 310, colWidth, 380, '2. METODOLOGÍA');
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x1 + 15, topY + 370, colWidth - 30, 140);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x1 + 30, topY + 410, 50, 60);
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(x1 + 100, topY + 390, 50, 80);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x1 + 170, topY + 430, 50, 40);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText('Fase 1 ➔ Fase 2 ➔ Análisis', x1 + 45, topY + 535);

        // --- Columna 2: Resultados Principales (Punto Focal) ---
        const x2 = x1 + colWidth + 20;
        this.drawCard(ctx, x2, topY, colWidth, 440, '3. RESULTADOS CLAVE', true);
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x2 + 15, topY + 60, colWidth - 30, 250);
        
        // Curvas del gráfico llamativo
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x2 + 30, topY + 270);
        ctx.bezierCurveTo(x2 + 70, topY + 230, x2 + 120, topY + 110, x2 + 200, topY + 90);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x2 + 30, topY + 220);
        ctx.lineTo(x2 + 200, topY + 230);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText('▲ Rendimiento +142% con IA', x2 + 30, topY + 85);

        // Recuadro de conclusión destacada
        ctx.fillStyle = '#ecfdf5';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.fillRect(x2 + 15, topY + 330, colWidth - 30, 85);
        ctx.strokeRect(x2 + 15, topY + 330, colWidth - 30, 85);
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('HALLAZGO PRINCIPAL:', x2 + 25, topY + 355);
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('El flujo en Z incrementa la retención', x2 + 25, topY + 380);
        ctx.fillText('del mensaje en un 64%.', x2 + 25, topY + 400);

        // --- Columna 3: Discusión y Conclusiones ---
        const x3 = x2 + colWidth + 20;
        this.drawCard(ctx, x3, topY, colWidth, 320, '4. CONCLUSIONES');
        this.drawTextLines(ctx, [
            '• La jerarquía visual define el impacto.',
            '• El contraste tipográfico guía el orden.',
            '• Evitar sobrecargar los métodos.',
            '• Un buen gráfico reemplaza 500 palabras.'
        ], x3 + 15, topY + 65, 26);

        // Logos / Referencias
        this.drawCard(ctx, x3, topY + 350, colWidth, 230, 'REFERENCIAS & QR');
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x3 + (colWidth - 100) / 2, topY + 400, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('[ QR CODE ]', x3 + (colWidth - 100) / 2 + 18, topY + 455);

        return canvas;
    },

    drawCard(ctx, x, y, w, h, title, highlight = false) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = highlight ? '#38bdf8' : '#e2e8f0';
        ctx.lineWidth = highlight ? 2 : 1;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = highlight ? '#0284c7' : '#1e293b';
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.fillText(title, x + 15, y + 30);

        ctx.strokeStyle = highlight ? '#38bdf8' : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 40);
        ctx.lineTo(x + w - 15, y + 40);
        ctx.stroke();
    },

    drawTextLines(ctx, lines, x, y, lineHeight) {
        lines.forEach((line, i) => {
            ctx.fillText(line, x, y + (i * lineHeight));
        });
    }
};
