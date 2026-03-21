# Tablero de Cobertura de Vacunación Sarampión 2025/2026 (Durango)

Este proyecto es un dashboard interactivo desarrollado en React + Vite para visualizar las coberturas de vacunación de Sarampión en el estado de Durango, permitiendo la consolidación de datos nominales, poblacionales y de regularización (Cubos).

## Estructura del Proyecto

*   `src/`: Código fuente de la aplicación React.
*   `src/utils/dataProcessor.ts`: Lógica principal de procesamiento y cruce de datos.
*   `data/`: Contiene los archivos fuente necesarios para alimentar el tablero (Excel y CSV).
*   `public/`: Archivos estáticos.

## Requisitos Previos

*   [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
*   npm (incluido con Node.js)

## Cómo Ejecutar Localmente

1.  **Instalar dependencias:**
    Abre una terminal en esta carpeta y ejecuta:
    ```bash
    npm install
    ```

2.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

3.  **Ver el Dashboard:**
    La aplicación estará disponible en `http://localhost:5173`.

## Uso del Tablero

Al iniciar la aplicación, se te pedirá cargar tres fuentes de datos que se encuentran en la carpeta `data/`:

1.  **Población:** `Poblacion municipio edad simple y sexo Mexico 2026 CENJSIA EGM.xlsx` (Utiliza la pestaña "Durango").
2.  **Cubos:** `CUBOS ENERO-ABRIL-2025.xlsx` (Para regularización estatal).
3.  **Nominal:** `SRP-SR-2025_21-03-2026 08-11-38.csv` (Datos de dosis aplicadas actualizados).

Una vez cargados, haz clic en **"Generar Tablero"** para visualizar las cifras de universo, meta, dosis aplicadas y el semáforo de cobertura por municipio.

---
Generado con Antigravity.
