# Metabolix

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23990014.svg)](https://doi.org/10.5281/zenodo.23990014)

Conduce por el metabolismo humano.

Mapa interactivo del metabolismo humano para enseñar Bioquímica en los grados de Ciencias de la Salud. El metabolismo se lee como un mapa de carreteras: cada ruta es una carretera, las enzimas son las señales y el tráfico cambia según el estado fisiológico.

Lo han hecho Jesus M. Torres de Pinedo, Sergio Martinez, Francisco M. Ortuno y Carolina Torres dentro del Proyecto de Innovación Docente PID 26-15 del Departamento de Bioquímica y Biología Molecular III e Inmunología (Facultad de Medicina, Universidad de Granada).

La app está en [metabolxmap.vercel.app](https://metabolxmap.vercel.app).

![El mapa en ayuno nocturno](docs/mapa.jpg)

## Qué puede hacer el alumno

### Mapa

La célula está dibujada con sus compartimentos (citosol, mitocondria, núcleo, gota lipídica) y las rutas como carreteras. El grosor de cada carretera indica el flujo; las rutas apagadas aparecen como caminos punteados y las partículas muestran el sentido neto. Al tocar una enzima o un metabolito se abre su ficha: ecuación, ΔG°′, reguladores, isoenzimas y relevancia clínica. Las enzimas reguladoras llevan ★, y una cuadrícula de atlas (A–L, 1–9) permite decir «la PEPCK está en la casilla H4».

### Estados y tejidos

Encima del mapa están los estados fisiológicos: postprandial, ayuno nocturno, ayuno prolongado, sprint, estrés oxidativo y sobrecarga de fructosa. Cada estado cambia las señales hormonales (insulina, glucagón, adrenalina, AMP/ATP, demanda de NADPH) y con ellas el flujo de todas las rutas. El selector de tejido muestra qué rutas tiene el hígado, el músculo, el corazón, el cerebro, el tejido adiposo, el eritrocito o el riñón.

### Recorrido guiado

Al entrar, la pantalla se oscurece y una flecha va señalando cada parte de la app mientras se explica. Sale cada vez, salvo que el alumno marque «No volver a mostrar al entrar», y el botón «Guía» lo vuelve a abrir.

### Predecir primero

Con el interruptor «Predecir primero», al cambiar de estado el alumno marca antes cada proceso como activo, poco activo o apagado, y después lo comprueba con la explicación de cada caso. Con «Ver directamente», el mapa cambia al momento. La elección se recuerda.

### Misiones

El alumno lleva una molécula de un punto del mapa a otro eligiendo la carretera en cada cruce. Las carreteras se abren o se cortan según el estado fisiológico, los pasos irreversibles son de sentido único y los transportadores son fronteras. Un cuentakilómetros suma ATP, NADH y CO₂ por el camino.

| Misión | Estado | Recorrido |
|---|---|---|
| Operación Cori | Ayuno nocturno | Lactato → glucosa en sangre |
| Fábrica de grasa | Postprandial | Glucosa → palmitato |
| La ruta de la leche | Postprandial | Galactosa → glucógeno |
| Combustible de emergencia | Ayuno prolongado | Palmitato → cuerpos cetónicos |
| Sprint final | Sprint | Glucógeno → lactato |
| Reciclar la grasa | Ayuno nocturno | Glicerol-3-P → glucosa |

![Una misión en curso](docs/mision.jpg)

### Reto

Ocho preguntas de razonamiento que se responden tocando el mapa. Cada acierto vale 100 puntos y la racha suma 25 más por acierto seguido, hasta 100 de bonus; cada fallo resta 25. Los puntos se acumulan, y los alumnos registrados aparecen en un ranking general o por titulación que solo muestra el nombre y la inicial del apellido. Después de tres retos completos se pide la encuesta antes de empezar el siguiente.

### Otras vistas

| Vista | Contenido |
|---|---|
| Tejidos | Rutas universales frente a especialización tisular |
| Ciclos | Cori, urea, cuerpos cetónicos, lanzaderas malato-aspartato y glicerol-3-P, β-oxidación frente a síntesis de palmitato |
| Balances | ATP de cada sustrato, paso a paso |
| Flashcards | Oculta los nombres del mapa para repasar, con estadísticas por ruta |

### Para el profesorado

La encuesta de satisfacción (Likert 1–5, con titulación y curso) se exporta en CSV o JSON. Hay un registro opcional del alumno y un contador común de visitas (una por sesión de navegador), guardado en Firestore.

## Desarrollo

Necesitas Node.js 18 o superior.

```bash
git clone https://github.com/ctp-granada/MetabolxMap.git
cd MetabolxMap
npm install
npm run dev        # http://localhost:3000
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 3000 |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación para revisarla |
| `npm run lint` | Comprobación de tipos con TypeScript |

Vercel publica automáticamente cada cambio que entra en `main`. Para trabajar, crea una rama, abre un pull request y fusiónalo cuando esté revisado.

> El proyecto nació en Google AI Studio, pero ahora la versión de referencia es este repositorio. No vuelvas a guardar desde AI Studio sobre él, porque sobrescribiría los cambios.

### Dónde está cada cosa

```text
src/
├── metabolixData.js        Metabolitos, reacciones y balances de sustratos
├── metabolixEngine.js      Motor: flujos, dibujo del mapa, estados, fichas,
│                           Predecir primero, Misiones y Reto
├── metabolixTemplate.ts    Estructura HTML de la app (pestañas, paneles, mapa)
├── metabolixTissues.js     Perfiles de cada tejido
├── metabolixLipids.js      Vista de lípidos
├── index.css               Diseño: colores, tipografía y estilos del mapa
├── App.tsx, main.tsx       Arranque de React y modales
├── components/             Recorrido guiado, encuesta y acceso del alumno
└── services/
    └── storageService.ts   Guardado local y sincronización opcional con Firestore
```

`src/metabolixTemplate.html` es una copia antigua de la plantilla y no se usa.

### Cambios habituales

- Los estados fisiológicos están en `STATES`, en `metabolixEngine.js`. Cada estado tiene sus señales (`sig`), la actividad de cada ruta (`pw`) y de cada reacción (`rx`), y las notas que aparecen en el panel.
- Los procesos de Predecir primero están en `PRED_ITEMS`, y los umbrales en `levelIn`: activa ≥ 0,55, poco activa ≥ 0,12, y apagada por debajo.
- Las misiones están en `MISSIONS`. Cada una tiene estado, origen, destino, introducción, pistas por reacción e ideas clave. Escribe `__msCheck()` en la consola del navegador para comprobar que todas tienen camino.
- El recorrido guiado está en `STEPS`, en `src/components/GuidedTour.tsx`. Cada paso tiene el selector del elemento que se resalta, la vista donde está, un título y un texto. Si el elemento no se ve en esa pantalla (por ejemplo, en móvil), el paso se salta solo.
- Los colores y la tipografía son variables al principio de `index.css`. Los colores de las rutas (`--pw-*`) llevan información, así que conviene no cambiarlos a la ligera.

### Datos y privacidad

Todo se guarda primero en el navegador (`localStorage`): retos, encuestas, visitas, resultados de las misiones y preferencias. El registro del alumno, las respuestas de los retos y las encuestas se envían además a Firestore (proyecto `metabolix-4ce49`), en las colecciones `student_sessions`, `quiz_responses` y `satisfaction_surveys`. La configuración está en `src/services/storageService.ts`; las variables `VITE_FIREBASE_*` de Vercel, si existen, tienen prioridad. Los puntos de los retos se guardan en la colección `ranking`, identificada por un resumen del correo, de modo que el ranking no expone correos. El contador de visitas es el documento `stats/visits`.

Reglas de Firestore recomendadas: los alumnos solo pueden escribir, salvo el ranking, que pueden leer y que solo admite cambios de entre −25 y +200 puntos por respuesta.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quiz_responses/{id}       { allow create: if true; }
    match /satisfaction_surveys/{id} { allow create: if true; }
    match /student_sessions/{id}     { allow create, update: if true; }
    match /ranking/{id} {
      function valid(d) {
        return d.keys().hasOnly(['name','degree','course','points','answered','correct','updatedAt'])
          && d.name is string && d.name.size() <= 40 && d.points is int;
      }
      allow read: if true;
      allow create: if valid(request.resource.data)
        && request.resource.data.points >= -25 && request.resource.data.points <= 200;
      allow update: if valid(request.resource.data)
        && request.resource.data.points >= resource.data.points - 25
        && request.resource.data.points <= resource.data.points + 200;
    }
    match /stats/visits {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['total']) && request.resource.data.total == 1;
      allow update: if request.resource.data.keys().hasOnly(['total']) && request.resource.data.total == resource.data.total + 1;
    }
    match /{document=**}             { allow read, write: if false; }
  }
}
```

## Diseño

Cada ruta se dibuja como una carretera con arcén, en su color, y las enzimas aparecen como placas de tráfico. El fondo imita el papel de un atlas y el azul es el de las señales de autovía. La tipografía es Barlow, que se inspira en la señalización vial. La célula y la cadena respiratoria tienen relieve para que se reconozcan las estructuras sin tapar las rutas. Hay modo oscuro.

## Cómo citar

Si usas, adaptas o difundes Metabolix, cita su origen:

> Torres de Pinedo, J. M., Martinez, S., Ortuno, F. M., & Torres, C. (2026). *Metabolix: conduce por el metabolismo humano* [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.23990014

GitHub también ofrece la cita con el botón «Cite this repository», a partir de `CITATION.cff`.

## Licencia

El código tiene licencia [Apache 2.0](LICENSE): quien lo redistribuya o lo adapte debe conservar el aviso de autoría del archivo [NOTICE](NOTICE).

Los contenidos docentes (textos, fichas, explicaciones, preguntas, misiones y diseño del mapa) tienen licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es) y se pueden reutilizar y adaptar citando la autoría.

Departamento de Bioquímica y Biología Molecular III e Inmunología · Facultad de Medicina · Universidad de Granada · Proyecto de Innovación Docente PID 26-15
