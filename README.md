# 👁️ SaliencyVision IA — Mapas de Calor y Atención Visual para Pósters Científicos

> **Hecho por [NachoFari](https://github.com/NachoFari)** · Licencia **GNU GPLv3** · 100% Portable · Cero Dependencias Externas

**SaliencyVision IA** es una herramienta interactiva y ultraliviana que predice y visualiza mediante un **mapa de calor térmico superpuesto** hacia dónde se dirigirá la mirada humana durante los primeros segundos al observar un **póster científico, infografía o diseño gráfico**.

---

## 🚀 Cómo Usar (100% Portable)

No necesitas instalar Python, Node.js, librerías ni servidores:

1. **Descarga** el ZIP o clona este repositorio:
   ```bash
   git clone https://github.com/NachoFari/Poster-Saliency-IA.git
   ```
2. Entra a la carpeta y elige cualquiera de las dos opciones:
   * **Opción A (Universal - Windows / Mac / Linux)**: Haz doble clic en **`ABRIR_PROGRAMA.html`**.
   * **Opción B (Modo Ventana de Escritorio en Windows)**: Haz doble clic en **`Iniciar_Modo_Ventana.bat`** (abre la app como una ventana independiente sin pestañas ni barra de direcciones).
3. ¡Listo! Funciona inmediatamente incluso **sin conexión a Internet**.

---

## ✨ Características Principales

* ⭐ **Modo Consenso IA (Coincidencia de las 3 Redes)**: Cruza simultáneamente las predicciones normalizadas de **UMSI**, **DeepGaze IIE** y **TranSalNet** mediante media geométrica ponderada por acuerdo inter-modelo, encendiendo únicamente las zonas donde las 3 arquitecturas coinciden.
* 🔥 **Mapa de Calor sobre la Imagen**: Proyecta una capa térmica en tiempo real directamente sobre tu póster con control continuo de opacidad (`0%` a `100%`).
* 🎯 **Trayectoria Ocular Sacádica (`1 ➔ 2 ➔ 3 ➔ 4`)**: Calcula los picos locales de atención y traza la ruta cronológica que seguirá el ojo humano al escanear las secciones del póster.
* 🔦 **Modo Spotlight (La Prueba de los 3 Segundos)**: Oscurece las áreas de baja salencia para revelar únicamente qué elementos enganchan la vista cuando un asistente pasa caminando frente a tu póster en un congreso.
* 📋 **Pegado Directo (`Ctrl + V`) & Drag-and-Drop**: Arrastra cualquier imagen (`PNG`, `JPG`, `WebP`) o pega directamente una captura de pantalla desde tu portapapeles.
* 🧪 **Póster Científico de Demostración en 1 Clic**: Incluye un generador integrado en Canvas para probar todos los controles de inmediato.
* 📊 **Diagnóstico Automático de Diseño**:
  * **Captura de Cabecera (%)**: Evalúa si el título retiene el impacto inicial.
  * **Dominancia Focal (%)**: Verifica si existe un gráfico o hallazgo principal claro.
  * **Carga Cognitiva / Saturación (`/100`)**: Detecta si hay exceso de ruido visual o demasiados elementos compitiendo al mismo tiempo.
* 💾 **Exportación en 1 Clic**: Descarga tu póster con el mapa de calor y la ruta visual fusionados en alta resolución (`PNG`).

---

## 🧠 Modelos del Estado del Arte (SOTA) Implementados

El motor implementa los operadores perceptuales y sesgos espaciales de las 3 arquitecturas líderes en la literatura científica (*MIT/Tübingen Saliency Benchmark* y *CVPR*), además de su modo de **Consenso Ensemble**:

### ⭐ Modo Consenso IA *(Ensemble Multi-Modelo)*
Evalúa los 3 modelos de forma independiente, normaliza sus distribuciones al rango $[0, 1]$ y calcula:
$$\text{Consenso}(x,y) = \left(M_{\text{UMSI}} \cdot M_{\text{DeepGaze}} \cdot M_{\text{TranSalNet}}\right)^{1/3} \cdot \left(0.5 + 0.5 \cdot (1 - \sigma)\right)$$
donde $\sigma$ es la desviación estándar entre los 3 modelos en cada píxel. Garantiza máxima certeza al destacar solo los focos de coincidencia unánime.

### 1. UMSI / PredImportance *(MIT CSAIL — Camilo Fosco et al.)*
* **Especialidad**: *Diseño Gráfico, Pósters Científicos, Infografías e Interfaces*.
* **Fundamento**: Basado en el dataset **IMP1K**, modela la importancia semántica y estructural de documentos. Prioriza la **jerarquía tipográfica (títulos vs. párrafos)**, bloques de gráficos delimitados y el flujo de lectura académico superior-izquierdo.

### 2. DeepGaze IIE / MSDB *(Matthias Bethge Lab — Universidad de Tübingen)*
* **Especialidad**: *Fijación Biológica Humana en Imágenes Naturales (Líder #1 en MIT Saliency Benchmark)*.
* **Fundamento**: Modela la densidad probabilística de fijación foveal humana combinando oponencia cromática (Rojo-Verde y Azul-Amarillo), picos de contraste luminoso y el **sesgo central natural humano**.

### 3. TranSalNet *(Vision Transformer Multi-Scale Attention — Lou et al.)*
* **Especialidad**: *Relaciones Espaciales Globales y Composiciones Multi-Columna*.
* **Fundamento**: Evalúa el equilibrio visual de largo alcance a través de todo el lienzo, ideal para comprobar si las 3 o 4 columnas de un póster están balanceadas o si un elemento aislado roba toda la atención.

---

## 🗂️ Arquitectura Modular (Legible para Humanos e IAs)

El proyecto está dividido en módulos pequeños de responsabilidad única para facilitar su lectura, mantenimiento y auditoría sin archivos monolíticos:

```text
Poster-Saliency-IA/
├── ABRIR_PROGRAMA.html          # Archivo principal (haz doble clic aquí para abrir)
├── Iniciar_Modo_Ventana.bat     # Lanzador opcional en Windows (modo ventana nativa)
├── LICENSE                      # Licencia GNU General Public License v3.0
├── README.md                    # Documentación del proyecto
├── styles/
│   ├── main.css                 # Variables de tema, cabeceras y créditos
│   ├── viewer.css               # Visor interactivo y capas de Canvas apiladas
│   └── panels.css               # Controles laterales y tarjetas de diagnóstico
└── modules/
    ├── app.js                   # Inicializador ligero
    ├── models.js                # Ecuaciones de los 3 modelos SOTA + Consenso
    ├── core-filters.js          # Filtros de visión (Sobel, BoxBlur, Gauss, Oponencia)
    ├── colormaps.js             # Tablas de color científicas (Turbo, Jet, Inferno, Hot)
    ├── scanpath.js              # Extracción de focos 1->2->3 y diagnóstico de póster
    ├── saliency-engine.js       # Orquestador del pipeline sobre Float32Array
    ├── poster-generator.js      # Generador de póster científico de prueba
    └── ui-controller.js         # Eventos, sliders, Ctrl+V y exportación PNG
```

---

## 📄 Licencia y Autoría

* **Autor**: **[NachoFari](https://github.com/NachoFari)**
* **Licencia**: Distribuido bajo la licencia **GNU General Public License v3.0 (GPLv3)**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
