/**
 * colormaps.js - Tablas de búsqueda (LUT) para mapas de calor
 * Paletas científicas optimizadas en RGB de 256 niveles.
 */

window.SaliencyApp = window.SaliencyApp || {};

window.SaliencyApp.ColorMaps = {
    /**
     * Paleta Turbo (Google Research) - Estándar perceptualmente uniforme
     */
    turbo: (() => {
        const lut = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const x = i / 255;
            const r = Math.max(0, Math.min(1, 0.1357 + x * (4.615 + x * (-42.66 + x * (132.13 + x * (-152.94 + x * 59.28))))));
            const g = Math.max(0, Math.min(1, 0.0914 + x * (2.194 + x * (4.8429 + x * (-14.185 + x * (4.277 + x * 2.829))))));
            const b = Math.max(0, Math.min(1, 0.1066 + x * (12.641 + x * (-60.582 + x * (110.36 + x * (-89.90 + x * 27.34))))));
            lut[i * 3] = Math.round(r * 255);
            lut[i * 3 + 1] = Math.round(g * 255);
            lut[i * 3 + 2] = Math.round(b * 255);
        }
        return lut;
    })(),

    /**
     * Paleta Jet - Térmica tradicional
     */
    jet: (() => {
        const lut = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const x = i / 255;
            const r = Math.min(Math.max(1.5 - Math.abs(x * 4 - 3), 0), 1);
            const g = Math.min(Math.max(1.5 - Math.abs(x * 4 - 2), 0), 1);
            const b = Math.min(Math.max(1.5 - Math.abs(x * 4 - 1), 0), 1);
            lut[i * 3] = Math.round(r * 255);
            lut[i * 3 + 1] = Math.round(g * 255);
            lut[i * 3 + 2] = Math.round(b * 255);
        }
        return lut;
    })(),

    /**
     * Paleta Inferno - Perceptual con fondo oscuro
     */
    inferno: (() => {
        const lut = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const x = i / 255;
            const r = Math.min(1, Math.max(0, x < 0.3 ? x * 1.5 : (x < 0.7 ? 0.45 + (x - 0.3) * 1.3 : 0.97 + (x - 0.7) * 0.1)));
            const g = Math.min(1, Math.max(0, x < 0.4 ? 0 : (x < 0.8 ? (x - 0.4) * 1.8 : 0.72 + (x - 0.8) * 1.4)));
            const b = Math.min(1, Math.max(0, x < 0.2 ? x * 3 : (x < 0.6 ? 0.6 - (x - 0.2) * 1.2 : 0.05)));
            lut[i * 3] = Math.round(r * 255);
            lut[i * 3 + 1] = Math.round(g * 255);
            lut[i * 3 + 2] = Math.round(b * 255);
        }
        return lut;
    })(),

    /**
     * Paleta Hot - Gradiente fuego (Negro -> Rojo -> Amarillo -> Blanco)
     */
    hot: (() => {
        const lut = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const x = i / 255;
            const r = Math.min(1, x * 2.5);
            const g = Math.min(1, Math.max(0, (x - 0.35) * 2.5));
            const b = Math.min(1, Math.max(0, (x - 0.75) * 4));
            lut[i * 3] = Math.round(r * 255);
            lut[i * 3 + 1] = Math.round(g * 255);
            lut[i * 3 + 2] = Math.round(b * 255);
        }
        return lut;
    })()
};
