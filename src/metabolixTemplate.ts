export const METABOLIX_TEMPLATE = `<div class="app">
  <header class="top">
    <div class="brand">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="none" stroke="var(--pw-mito)" stroke-width="2"/><circle cx="15" cy="15" r="6.5" fill="none" stroke="var(--pw-krebs)" stroke-width="2" stroke-dasharray="3 2.4"/><circle cx="15" cy="2" r="2.6" fill="var(--pw-glycolysis)"/><circle cx="26" cy="21" r="2.2" fill="var(--pw-lipid)"/><circle cx="5" cy="22" r="2" fill="var(--pw-pentose)"/></svg>
      <b>Metabolix</b><span>Mapa de carreteras del metabolismo</span>
    </div>
    <nav class="tabs" role="tablist" aria-label="Vistas">
      <button role="tab" data-view="mapa" aria-selected="true">Mapa<span class="lx"> celular</span></button>
      <button role="tab" data-view="tejidos" aria-selected="false">Tejidos<span class="lx"> y rutas</span></button>
      <button role="tab" data-view="ciclos" aria-selected="false">Ciclos<span class="lx"> y lanzaderas</span></button>
      <button role="tab" data-view="balances" aria-selected="false">Balances<span class="lx"> de ATP</span></button>
      <button role="tab" data-view="reto" aria-selected="false">Reto</button>
    </nav>
    <div class="header-actions">
      <button type="button" class="hdr-btn fc-hdr-btn" id="btn-hdr-flashcard" title="Oculta los nombres de enzimas y metabolitos para repasar de memoria">
        <svg class="ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg><span>Flashcards</span><span class="fc-state-pill" id="hdr-fc-state">OFF</span>
      </button>
      <button type="button" class="hdr-btn" id="btn-guide" title="Recorrido guiado por Metabolix">
        <svg class="ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3 3 5.5v15.5l6-2.5 6 2.5 6-2.5V3l-6 2.5L9 3Z"/><path d="M9 3v15.5M15 5.5V21"/></svg><span>Guía</span>
      </button>
      <button type="button" class="hdr-btn" id="btn-survey" title="Encuesta de satisfacción">
        <svg class="ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/></svg><span>Encuesta</span>
      </button>
      <button type="button" class="hdr-btn hdr-student" id="btn-student" title="Identificación del estudiante">
        <svg class="ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span id="hdr-student-name">Acceso alumno</span><span id="hdr-visits-badge" class="hdr-visits">0</span>
      </button>
    </div>
    <button class="modebtn" id="mode" aria-label="Cambiar a modo oscuro"></button>
    <div class="search">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <input id="q" type="search" placeholder="Buscar enzima, metabolito o ruta" autocomplete="off" aria-label="Buscar">
      <div class="results" id="results" hidden></div>
    </div>
  </header>

  <div class="body">
    <aside class="rail" id="rail">
      <div class="sec">
        <div class="eyebrow">Señales</div>
        <div class="meters" id="meters"></div>
      </div>
      <div class="sec">
        <h3 id="st-title"></h3>
        <ul class="notes" id="st-notes"></ul>
      </div>
      <div class="sec">
        <div class="eyebrow">Rutas · toca para aislar</div>
        <div class="chips" id="pw-chips"></div>
      </div>
      <div class="sec" id="sec-flashcard-study">
        <div class="eyebrow" style="display:flex;align-items:center;justify-content:space-between">
          <span>Flashcards</span>
          <span class="fc-state-badge" id="rail-fc-state-badge">Desactivado</span>
        </div>
        <div class="rail-fc-container">
          <div class="rail-fc-switch-card">
            <div class="rfc-switch-label">
              <span class="rfc-switch-icon"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg></span>
              <div class="rfc-switch-texts">
                <b>Ocultar términos clave</b>
                <small>Memoria activa para deducir enzimas y sustratos</small>
              </div>
            </div>
            <button type="button" class="fc-ios-toggle" id="rail-fc-toggle" role="switch" aria-checked="false" title="Activar o desactivar ocultamiento de términos metabólicos clave">
              <span class="fc-ios-thumb"></span>
            </button>
          </div>

          <div class="rail-fc-pws" id="rail-fc-pws">
            <button type="button" class="rfc-pw-btn active" data-fc-pw="all">Todas</button>
            <button type="button" class="rfc-pw-btn" data-fc-pw="glycolysis" style="--pc:var(--pw-glycolysis)">Glucólisis</button>
            <button type="button" class="rfc-pw-btn" data-fc-pw="krebs_cycle" style="--pc:var(--pw-krebs)">Krebs</button>
            <button type="button" class="rfc-pw-btn" data-fc-pw="gluconeogenesis" style="--pc:var(--pw-gluconeogenesis)">Gluconeogénesis</button>
            <button type="button" class="rfc-pw-btn" data-fc-pw="lipid_metabolism" style="--pc:var(--pw-lipid)">Lípidos</button>
            <button type="button" class="rfc-pw-btn" data-fc-pw="glycogen_metabolism" style="--pc:var(--pw-glycogen)">Glucógeno</button>
          </div>

          <div class="rail-fc-card" id="rail-fc-card"></div>
        </div>
      </div>

      <div class="sec" id="sec-learning-stats">
        <div class="eyebrow" style="display:flex;align-items:center;justify-content:space-between">
          <span>Estadísticas de aprendizaje</span>
          <span class="stats-badge-pill" id="stats-summary-pill">0 repasos</span>
        </div>
        <div class="learning-stats-widget" id="learning-stats-widget">
          <button type="button" class="rail-flashcard-cta" id="btn-rail-flashcard" title="Comenzar sesión de estudio con tarjetas Flashcards interactivas">
            <span class="rfc-cta-left">
              <span class="rfc-icon"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg></span>
              <span class="rfc-title">Estudiar con Flashcards</span>
            </span>
            <span class="rfc-badge" id="rail-fc-badge">Abrir tarjeta →</span>
          </button>
          <div class="stats-tabs-pill">
            <button type="button" class="stats-tab active" data-stat-tab="practiced" id="tab-stat-practiced">Más practicadas</button>
            <button type="button" class="stats-tab" data-stat-tab="accuracy" id="tab-stat-accuracy">% Aciertos</button>
          </div>
          <div class="stats-bars-list" id="stats-bars-list"></div>
        </div>
      </div>
      <div class="sec">
        <div class="eyebrow">Leyenda</div>
        <div class="legend">
          <div><svg width="44" height="14"><line x1="3" y1="7" x2="41" y2="7" stroke="var(--road-casing)" stroke-width="9" stroke-linecap="round"/><line x1="3" y1="7" x2="41" y2="7" stroke="var(--pw-glycolysis)" stroke-width="6" stroke-linecap="round"/></svg>Carretera ancha: ruta con mucho flujo</div>
          <div><svg width="44" height="14"><line x1="3" y1="7" x2="41" y2="7" stroke="var(--road-casing)" stroke-width="4.5" stroke-linecap="round"/><line x1="3" y1="7" x2="41" y2="7" stroke="var(--pw-glycolysis)" stroke-width="2" stroke-linecap="round"/></svg>Carretera estrecha: poco flujo</div>
          <div><svg width="44" height="14"><line x1="3" y1="7" x2="41" y2="7" stroke="var(--pw-glycolysis)" stroke-width="1.4" stroke-dasharray="3 5"/></svg>Camino punteado: ruta casi apagada</div>
          <div><svg width="44" height="14"><circle cx="13" cy="7" r="3" fill="var(--pw-krebs)"/><circle cx="27" cy="7" r="3" fill="var(--pw-krebs)" opacity=".6"/></svg>Puntos: sentido de la circulación</div>
          <div><svg width="44" height="20"><rect x="2" y="2" width="40" height="16" rx="3" fill="var(--pw-glycolysis)"/><rect x="4" y="4" width="36" height="12" rx="1.6" fill="none" stroke="var(--pill-ink)" stroke-width="1"/><text x="9" y="14" font-size="10" fill="var(--pill-ink)">★</text></svg>Señal con ★: enzima reguladora</div>
          <div><svg width="44" height="20"><rect x="8" y="2" width="28" height="16" rx="3" fill="none" stroke="var(--accent)"/><text x="22" y="14.5" font-size="11" font-weight="700" text-anchor="middle" fill="var(--accent)" font-family="Barlow Semi Condensed">D5</text></svg>Casilla: búscala en los bordes del mapa</div>
        </div>
      </div>
    </aside>

    <main class="stage" id="stage">
      <section class="view" id="view-mapa">
        <div class="map-controls" id="map-controls">
          <div class="mc-states" role="radiogroup" aria-label="Estado fisiológico">
            <span class="mc-label">Estado fisiológico</span>
            <div class="states" id="states"></div>
          </div>
        </div>
        <div class="map-frame">
        <svg id="map" role="img" aria-label="Mapa metabólico de una célula humana"></svg>
        <div class="map-topbar">
          <label class="mc-tissue">
            <span class="mc-label">Tejido</span>
            <select id="tissue-select" aria-label="Ver el mapa de un tejido"></select>
          </label>
          <div class="map-hud" id="hud"></div>
        </div>
        <div class="zoom">
          <button id="z-in" aria-label="Acercar">+</button>
          <button id="z-out" aria-label="Alejar">−</button>
          <button id="z-fit" aria-label="Encuadrar todo"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button>
          <button id="z-play" aria-label="Pausar animación"><svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="3.4" height="10" rx="1" fill="currentColor"/><rect x="8.6" y="2" width="3.4" height="10" rx="1" fill="currentColor"/></svg></button>
        </div>
        <div class="hint">Arrastra para moverte, usa la rueda o pellizca para acercar, y toca una carretera o un cruce para ver su ficha</div>
        <div class="quiz" id="quiz" hidden></div>
        </div>
      </section>
      <section class="view" id="view-tejidos" hidden></section>
      <section class="view" id="view-ciclos" hidden>
        <div class="mod-tabs" id="mod-tabs" role="group" aria-label="Esquemas"></div>
        <div class="mod-grid"><div class="mod-stage"><svg id="mod" role="img" aria-label="Esquema metabólico"></svg></div><aside class="mod-info" id="mod-info"></aside></div>
      </section>
      <section class="view" id="view-balances" hidden></section>
    </main>

    <aside class="panel" id="panel" aria-live="polite">
      <div class="panel-head">
        <span class="eyebrow" id="panel-kind">Detalle</span>
        <button type="button" class="fc-toggle-btn" id="panel-flashcard-btn" title="Modo Estudio Flashcard: oculta nombres de enzimas y metabolitos para memorizar y autoevaluarte">
          <span class="fc-ico"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg></span>
          <span class="fc-txt">Flashcard</span>
        </button>
        <button class="close" id="panel-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="panel-body" id="panel-body"></div>
    </aside>
  </div>
</div>
<div class="toast" id="toast"></div>`;
