/**
 * scanpath.js - Extracción de Puntos Focales, Secuencia de Mirada y Diagnóstico
 * Simula el recorrido ocular sacádico (1 -> 2 -> 3 -> 4) y evalúa el póster.
 */

window.SaliencyApp = window.SaliencyApp || {};

window.SaliencyApp.ScanpathAnalysis = {
    /**
     * Extrae puntos focales máximos y orden cronológico de fijación
     */
    extract(map, width, height, maxPoints = 5) {
        const step = 6;
        const minDistance = Math.min(width, height) * 0.16;
        const candidates = [];

        for (let y = step; y < height - step; y += step) {
            for (let x = step; x < width - step; x += step) {
                const val = map[y * width + x];
                if (val > 0.4) {
                    candidates.push({ x, y, score: val });
                }
            }
        }

        candidates.sort((a, b) => b.score - a.score);

        const hotspots = [];
        for (const c of candidates) {
            let close = false;
            for (const h of hotspots) {
                if (Math.hypot(c.x - h.x, c.y - h.y) < minDistance) {
                    close = true;
                    break;
                }
            }
            if (!close) {
                hotspots.push({
                    x: c.x,
                    y: c.y,
                    score: Math.round(c.score * 100),
                    nx: Math.round((c.x / width) * 100),
                    ny: Math.round((c.y / height) * 100)
                });
                if (hotspots.length >= maxPoints) break;
            }
        }

        // Simula la trayectoria de fijaciones (Scanpath)
        const scanpath = [];
        if (hotspots.length > 0) {
            const pool = [...hotspots];
            pool.sort((a, b) => (b.score * 0.65 + (1 - b.ny / 100) * 35) - (a.score * 0.65 + (1 - a.ny / 100) * 35));
            let current = pool.shift();
            scanpath.push({ ...current, order: 1 });

            let order = 2;
            while (pool.length > 0) {
                pool.sort((a, b) => {
                    const distA = Math.hypot(a.x - current.x, a.y - current.y);
                    const distB = Math.hypot(b.x - current.x, b.y - current.y);
                    const costA = a.score * 1.15 - (distA / width) * 35;
                    const costB = b.score * 1.15 - (distB / width) * 35;
                    return costB - costA;
                });
                current = pool.shift();
                scanpath.push({ ...current, order });
                order++;
            }
        }

        return { hotspots, scanpath };
    },

    /**
     * Calcula métricas diagnósticas específicas para diseño de pósters científicos
     */
    diagnosePoster(map, width, height, hotspots) {
        const total = width * height;
        let sumAtt = 0;
        let highAttCount = 0;

        for (let i = 0; i < total; i++) {
            sumAtt += map[i];
            if (map[i] > 0.6) highAttCount++;
        }

        const cognitiveLoad = Math.min(100, Math.round((highAttCount / total) * 500));

        const p1 = hotspots[0] ? hotspots[0].score : 0;
        const p2 = hotspots[1] ? hotspots[1].score : 0;
        const dominance = p1 > 0 ? Math.round(((p1 - p2) / p1) * 100) : 0;

        let topAtt = 0;
        const topLimit = Math.round(height * 0.25) * width;
        for (let i = 0; i < topLimit; i++) topAtt += map[i];
        const headerShare = Math.round((topAtt / (sumAtt || 1)) * 100);

        let verdict = "Jerarquía Visual Óptima";
        let status = "good";
        const advice = [];

        if (headerShare >= 25) {
            advice.push("El Título/Cabecera retiene el primer impacto visual de forma clara.");
        } else {
            advice.push("El Título compite con otros elementos; aumenta su contraste o tamaño.");
        }

        if (cognitiveLoad > 65) {
            verdict = "Alta Saturación / Ruido Visual";
            status = "warning";
            advice.push("Demasiados elementos llaman la atención a la vez. Considera dejar más espacios en blanco.");
        } else if (dominance < 8 && hotspots.length > 2) {
            verdict = "Falta de Punto Focal Dominante";
            status = "caution";
            advice.push("No hay un elemento ancla claro. Destaca tu gráfico o hallazgo principal.");
        } else {
            advice.push("El recorrido visual fluye naturalmente hacia los resultados centrales.");
        }

        return {
            cognitiveLoad,
            focalDominance: dominance,
            headerShare,
            verdict,
            status,
            advice
        };
    }
};
