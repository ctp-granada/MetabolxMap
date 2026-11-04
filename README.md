# Metabolix 🧬

> **Plataforma Web Interactiva de Simulación y Docencia del Metabolismo Humano**  
> Diseñada para estudiantes y profesorado de Grados en Ciencias de la Salud.

---

## 📑 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características Principales](#-características-principales)
  - [1. Mapa Celular Interactivo](#1-mapa-celular-interactivo)
  - [2. Estados Fisiológicos y Control Hormonal](#2-estados-fisiológicos-y-control-hormonal)
  - [3. Especialización Tisular vs. Rutas Universales](#3-especialización-tisular-vs-rutas-universales)
  - [4. Lanzaderas de NADH y Balances de ATP](#4-lanzaderas-de-nadh-y-balances-de-atp)
  - [5. Regulación Recíproca del Metabolismo Lipídico](#5-regulación-recíproca-del-metabolismo-lipídico)
  - [6. Patología Molecular y Errores Innatos](#6-patología-molecular-y-errores-innatos)
  - [7. Modo Reto Formativo (Gamificación)](#7-modo-reto-formativo-gamificación)
  - [8. Encuesta de Satisfacción (Tipo Likert 1-5)](#8-encuesta-de-satisfacción-tipo-likert-1-5)
  - [9. Identificación del Alumno y Contador de Visitas](#9-identificación-del-alumno-y-contador-de-visitas)
  - [10. Paseo Guiado / Tutorial de Bienvenida](#10-paseo-guiado--tutorial-de-bienvenida)
  - [11. Modo de Estudio Tipo Flashcard](#11-modo-de-estudio-tipo-flashcard-memoria-activa)
- [Diseño y Estética](#-diseño-y-estética)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
  - [Requisitos previos](#requisitos-previos)
  - [Clonar y ejecutar en local](#clonar-y-ejecutar-en-local)
  - [Scripts disponibles](#scripts-disponibles)
- [Almacenamiento y Privacidad de Datos](#-almacenamiento-y-privacidad-de-datos)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)

---

## 🔬 Acerca del Proyecto

**Metabolix** es una herramienta pedagógica digital creada para facilitar la comprensión integral y visual de la Bioquímica y el Metabolismo Intermediario. Frente a los diagramas estáticos tradicionales de los libros de texto, Metabolix ofrece una **representación celular en vivo** con cálculo en tiempo real de flujos enzimáticos, balances bioenergéticos y reprogramaciones metabólicas según la señalización endocrina.

Su currículo cubre los objetivos de aprendizaje de las asignaturas de Bioquímica y Biología Molecular en los grados universitarios de Ciencias de la Salud.

---

## ✨ Características Principales

### 1. Mapa Celular Interactivo
- **Lienzo Celular SVG Ultra-nítido**: Representación compartimentada del hepatocito/célula estándar (citosol, mitocondria, membrana mitocondrial interna, espacio intermembrana y matriz).
- **Flujos Dinámicos**:
  - El grosor y la luminosidad de cada trazo reflejan la tasa metabólica actual.
  - Partículas animadas que muestran la dirección neta del flujo molecular.
  - Rutas fisiológicamente inhibidas o apagadas se atenúan de forma intuitiva.
- **Enzimas Marcapasos (`★`)**: Destaca visualmente las enzimas clave sometidas a control alostérico y covalente (Hexoquinasa/Glucoquinasa, PFK-1, Piruvato Quinasa, PDH, Citrato Sintasa, ACC1, CPT-1, Glucógeno Sintasa y Fosforilasa).
- **Fichas Moleculares Clínicas**: Al pulsar sobre cualquier enzima o metabolito, se abre un panel lateral con su ecuación estequiométrica, $\Delta G^{\circ\prime}$, moduladores positivos y negativos, isoenzimas y relevancia biomédica.

### 2. Estados Fisiológicos y Control Hormonal
Permite alternar entre cuatro condiciones fisiológicas cardinales con actualización instantánea de todo el mapa y los medidores endocrinos:
1. **Posprandial (Saciedad / Insulina ↑)**: Glucólisis activa, glucogenogénesis, lipogénesis de novo y supresión de rutas catabólicas.
2. **Ayuno temprano (Glucagón ↑)**: Glucogenólisis y gluconeogénesis hepática para mantener la normoglucemia (70-100 mg/dL).
3. **Ayuno prolongado / Dieta Cetogénica**: Activación máxima de la lipólisis adiposa, $\beta$-oxidación acelerada en la matriz mitocondrial y exportación de cuerpos cetónicos (acetoacetato y $\beta$-hidroxibutirato).
4. **Ejercicio muscular vigoroso**: Glucólisis anaerobia con producción de lactato y activación de la vía alostérica del AMP.

### 3. Especialización Tisular vs. Rutas Universales
- **Rutas Universales**: Aislamiento de vías ubicuas a todas las células humanas (Glucólisis, Ciclo de Krebs, Cadena de Transporte de Electrones y Fosforilación Oxidativa, Vía de las Pentosas Fosfato).
- **Perfiles Tisulares Específicos**:
  - **Hígado**: Único con dotación completa que incluye Glucosa-6-Fosfatasa (gluconeogénesis para liberación a sangre), cetogénesis y ciclo de la urea.
  - **Músculo Esquelético y Cardíaco**: Elevada capacidad oxidativa; glucógeno para autoconsumo (sin G6Pasa).
  - **Eritrocito**: Carece de mitocondrias; depende 100% de la glucólisis anaerobia (LDH) y de la vía de las pentosas (G6PDH) para generar NADPH protector frente al estrés oxidativo.
  - **Cerebro**: Consumo preferente de glucosa, sin gluconeogénesis, dependiente de cuerpos cetónicos tras ayuno prolongado.
  - **Tejido Adiposo**: Almacenamiento y liberación de triacilgliceroles según balance insulina/glucagón.

### 4. Lanzaderas de NADH y Balances de ATP
- **Comparativa Estequiométrica de Lanzaderas Citosólicas**:
  - **Lanzadera Malato-Aspartato**: Ingresa electrones al Complejo I vía NADH mitocondrial (rendimiento: $\approx 2.5\text{ ATP/NADH} \rightarrow \mathbf{32\text{ ATP}}$ por molécula de glucosa oxidada en corazón, hígado y riñón).
  - **Lanzadera Glicerol-3-Fosfato**: Ingresa electrones al Complejo III vía $\text{FADH}_2$ (rendimiento: $\approx 1.5\text{ ATP/NADH} \rightarrow \mathbf{30\text{ ATP}}$ por molécula de glucosa en músculo esquelético y cerebro).
- **Desglose Contable de ATP**: Tabla paso a paso de ATP directo por fosforilación a nivel de sustrato frente a fosforilación oxidativa.

### 5. Regulación Recíproca del Metabolismo Lipídico
- Clara diferenciación espacial entre:
  - **Síntesis de novo de palmitato**: Proceso citosólico dependiente de Acetil-CoA carboxilasa (ACC1), Malonil-CoA y NADPH.
  - **$\beta$-Oxidación de ácidos grasos**: Proceso mitocondrial (matriz).
- **Inhibición alostérica clave**: Visualización interactiva de cómo el **Malonil-CoA inhibe fuertemente la Carnitina Palmitoiltransferasa-1 (CPT-1)**, impidiendo el transporte de acil-CoA a la matriz durante la síntesis y previniendo un ciclo fútil.

### 6. Patología Molecular y Errores Innatos
- Módulo de casos clínicos aplicados:
  - **Galactosemias**: Bloqueo enzimático en GALT (Galactosa-1-fosfato uridiltransferasa) con acumulación de galactosa-1-P y reducción a **galactitol** mediante la aldosa reductasa, causante de cataratas precoces y daño hepatocelular.

### 7. Modo Reto Formativo (Gamificación)
- Preguntas dinámicas centradas en razonamiento bioquímico:
  - Identificación de metabolitos acumulados ante inhibición enzimática.
  - Diagnóstico de consecuencias metabólicas en situaciones clínicas reales.
- **Regla Pedagógica de los 3 Retos**: Los alumnos pueden completar hasta 3 retos formativos de evaluación inicial. A partir del 3.º, el sistema solicita cumplimentar la encuesta de satisfacción para desbloquear retos ilimitados.

### 8. Encuesta de Satisfacción (Tipo Likert 1-5)
- Integrada de forma nativa en la interfaz con estética clínica.
- **Variables académicas**:
  - **Titulación**: *Grado en Medicina*, *Grado en Enfermería*, *Grado en Odontología*, *Grado en Fisioterapia*, *Prefiero no responder*.
  - **Curso**: *Primero*, *Segundo*, *Tercero*, *Cuarto*, *Quinto*, *Sexto*, *Prefiero no responder*.
- **Dimensiones evaluadas (Escala Likert 1 al 5)**:
  1. Facilidad de navegación e intuición de la interfaz.
  2. Claridad visual de las rutas metabólicas y enzimas.
  3. Utilidad para comprender la Bioquímica del grado.
  4. Rendimiento técnico y fluidez en el dispositivo.
  5. Satisfacción global con la plataforma Metabolix.
- Campo de sugerencias abiertas.
- **Herramientas de exportación**: Botones para descargar al instante los resultados agregados en formatos **JSON** y **CSV** listos para su análisis estadístico (R, SPSS, Excel).

### 9. Identificación del Alumno y Contador de Visitas
- Registro amigable de datos del alumno (nombre, grado, curso y correo electrónico universitario, p. ej. `@ugr.es`).
- Contador de visitas persistente visible en la cabecera, con desglose de sesiones y visitas totales.

### 10. Paseo Guiado / Tutorial de Bienvenida
- Se abre automáticamente al acceder a la plataforma por primera vez.
- Recorrido en 8 pasos con navegación sincronizada (cambia la vista de fondo automáticamente para mostrar cada sección en su contexto).
- Casilla *"No volver a mostrar automáticamente al entrar"* y botón persistente **`🧭 Paseo / Tutorial`** en el encabezado para repetirlo cuando se desee.

### 11. Modo de Estudio Tipo Flashcard (Memoria Activa)
- Botón **`🎴 Flashcard`** integrado en la cabecera del panel de detalle y recordatorio en el HUD.
- Al activarse, oculta selectivamente los nombres de enzimas, metabolitos, abreviaturas y ecuaciones químicas.
- El estudiante deduce activamente la molécula o enzima a partir de su compartimento, cofactores, balance energético, patología clínica o esqueleto carbonado.
- Clic interactivo para revelar individualmente cada elemento con animación y confirmación visual, o botones *"👁️ Revelar todo"* y *"🔒 Ocultar"* para repasar tantas veces como sea necesario.

### 12. Estadísticas de Aprendizaje (Panel Lateral con Gráficos de Barras)
- Sección permanente en el panel lateral (`rail`) titulada **"Estadísticas de Aprendizaje"**.
- Pestañas conmutables con un clic:
  - **📊 Más practicadas**: Gráficos de barras proporcionales coloreados con el tono cromático distintivo de cada ruta metabólica (Glucólisis, Krebs, Pentosas Fosfato, Lípidos, etc.), mostrando el recuento total de tarjetas repasadas.
  - **🎯 % Aciertos**: Barras de progreso de retención porcentual con código de color semántico (≥80% verde esmeralda, 60-79% ámbar, <60% coral).
- **Interactividad bidireccional**: Al hacer clic sobre cualquier fila del gráfico, el mapa celular aísla y resalta automáticamente esa ruta metabólica (`focusPw`).
- **Autoevaluación Activa en tiempo real**: Al estudiar cualquier ficha en modo flashcard, el estudiante cuenta con botones de feedback rápido (*"✓ Me la sabía"* / *"✕ A repasar"*), actualizando instantáneamente los porcentajes y persistiendo los resultados en `localStorage` y en la exportación de datos.

---

## 🎨 Diseño y Estética

La aplicación sigue el paradigma **Dashboard Clínico Moderno (Limpio y Profesional)**:
- **Atmósfera**: Software médico de alta gama y Apple Health.
- **Paleta de Colores**:
  - Fondo blanco puro y gris titanio (`--ink-0`, `--ink-1`, `--ink-2`).
  - Azul marino profundo para tipografía de alto contraste (`--fg`).
  - Acentos sutiles en **verde esmeralda** (`--accent`, `--ok`).
  - Código cromático estandarizado para cada ruta metabólica (glucólisis en azul cian, gluconeogénesis en ámbar, ciclo de Krebs en índigo, mitocondria en violeta, lípidos en fucsia, etc.).
- **Accesibilidad**: Soporte para Modo Claro y Modo Oscuro conmutables con un solo clic.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Frontend Framework** | React 19 (Hooks, TypeScript) |
| **Bundler & Build Tool** | Vite 8 |
| **Estilos & CSS** | Tailwind CSS v4 + Variables CSS personalizadas en `index.css` |
| **Iconografía** | Lucide React |
| **Animaciones** | Framer Motion / Motion |
| **Motor de Renderizado** | SVG dinámico vectorial con simulación basada en canvas/requestAnimationFrame |
| **Capa de Persistencia** | Arquitectura híbrida *Local-First* con sincronización transparente a **Firebase Firestore** |
| **Backend & Servidor** | Node.js con Express |

---

## 📂 Estructura del Proyecto

```text
metabolix/
├── index.html                   # Entry point HTML con metadatos clínicos y viewport
├── metadata.json                # Metadatos del applet en AI Studio Build
├── package.json                 # Dependencias y scripts del proyecto
├── tsconfig.json                # Configuración de TypeScript
├── vite.config.ts               # Configuración del bundler Vite
├── public/                      # Recursos estáticos
├── src/
│   ├── App.tsx                  # Componente raíz de React (orquestador de modales y eventos)
│   ├── main.tsx                 # Montaje en el DOM
│   ├── index.css                # Sistema de diseño, tokens CSS, paleta clínica y animaciones
│   ├── metabolixTemplate.ts     # Plantilla estructural HTML/SVG del mapa y tabs
│   ├── metabolixEngine.js       # Motor cinético de simulación metabólica, rutas y banco de retos
│   ├── components/
│   │   ├── PlatformGuideAssistant.tsx # Tutorial interactivo paso a paso y guía de referencia
│   │   ├── SatisfactionSurveyModal.tsx# Encuesta Likert 1-5 con selección de Grado/Curso y exportación
│   │   └── StudentAccessModal.tsx     # Modal de perfil de alumno y métricas de visita
│   └── services/
│       ├── storageService.ts    # Capa de almacenamiento local-first y sincronización con Firestore
│       └── firebase.ts          # Inicialización y configuración de Firebase SDK
└── README.md                    # Documentación del proyecto
```

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos previos
- **Node.js** (versión 18.x o superior recomendada)
- Gestor de paquetes **npm**, **bun** o **pnpm**

### Clonar y ejecutar en local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/metabolix.git
   cd metabolix
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

### Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo en el puerto 3000.
- `npm run build`: Compila la aplicación optimizada para producción con TypeScript y Vite.
- `npm run preview`: Sirve localmente la compilación de producción para verificación.
- `npm run lint`: Ejecuta la comprobación estricta de tipos con TypeScript (`tsc --noEmit`).

---

## 🔒 Almacenamiento y Privacidad de Datos

- **Principio Local-First**: La plataforma funciona al 100% sin conexión externa obligatoria. Todos los retos resueltos, respuestas de encuestas, visitas y credenciales del alumno se almacenan en el `localStorage` del navegador con serialización JSON segura.
- **Sincronización Opcional con Firestore**: Si se configuran credenciales válidas en `src/services/firebase.ts`, la aplicación replica de forma asíncrona las respuestas para análisis docente centralizado.
- **Exportación en Cualquier Momento**: Los docentes pueden exportar directamente desde el modal de encuesta los registros en **CSV** o **JSON**.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas para ampliar el catálogo de casos clínicos, añadir nuevas rutas o proponer preguntas de autoevaluación:

1. Haz un Fork del proyecto (`git checkout -b feature/nueva-ruta`).
2. Confirma tus cambios (`git commit -m 'Añade ruta de síntesis de purinas'`).
3. Envía un Pull Request bien documentado.

---

## 📄 Licencia

Distribuido bajo la licencia **Apache 2.0**. Consulta el archivo `LICENSE` para más información.

---

*Desarrollado para la innovación docente en Bioquímica y Metabolismo Humano en Ciencias de la Salud.* 🩺🧪
