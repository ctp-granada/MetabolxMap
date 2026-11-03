export const METABOLIX_TEMPLATE = `<div class="app">
  <header class="top">
    <div class="brand">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="none" stroke="var(--pw-mito)" stroke-width="2"/><circle cx="15" cy="15" r="6.5" fill="none" stroke="var(--pw-krebs)" stroke-width="2" stroke-dasharray="3 2.4"/><circle cx="15" cy="2" r="2.6" fill="var(--pw-glycolysis)"/><circle cx="26" cy="21" r="2.2" fill="var(--pw-lipid)"/><circle cx="5" cy="22" r="2" fill="var(--pw-pentose)"/></svg>
      <b>Metabolix</b><span>Metabolismo humano, en vivo</span>
    </div>
    <nav class="tabs" role="tablist" aria-label="Vistas">
      <button role="tab" data-view="mapa" aria-selected="true">Mapa<span class="lx"> celular</span></button>
      <button role="tab" data-view="tejidos" aria-selected="false">Tejidos<span class="lx"> y rutas</span></button>
      <button role="tab" data-view="ciclos" aria-selected="false">Ciclos<span class="lx"> y lanzaderas</span></button>
      <button role="tab" data-view="balances" aria-selected="false">Balances<span class="lx"> de ATP</span></button>
      <button role="tab" data-view="reto" aria-selected="false">Reto</button>
    </nav>
    <button class="modebtn" id="mode" aria-label="Cambiar a modo oscuro"></button>
    <div class="search">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <input id="q" type="search" placeholder="Buscar enzima, metabolito o ruta   /" autocomplete="off" aria-label="Buscar">
      <div class="results" id="results" hidden></div>
    </div>
  </header>

  <div class="body">
    <aside class="rail" id="rail">
      <div class="sec">
        <div class="eyebrow">Estado fisiológico</div>
        <div class="states" id="states"></div>
      </div>
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
      <div class="sec">
        <div class="eyebrow">Especialización tisular · Mapa</div>
        <div class="tissue-chips" id="tissue-chips"></div>
      </div>
      <div class="sec">
        <div class="eyebrow">Cómo leer el mapa</div>
        <div class="legend">
          <div><svg width="44" height="12"><line x1="2" y1="6" x2="42" y2="6" stroke="var(--pw-glycolysis)" stroke-width="6" stroke-linecap="round"/></svg>Grosor y brillo = flujo de la ruta</div>
          <div><svg width="44" height="12"><line x1="2" y1="6" x2="42" y2="6" stroke="var(--pw-glycolysis)" stroke-width="1.5" stroke-dasharray="3 5" opacity=".5"/></svg>Línea tenue = ruta casi apagada</div>
          <div><svg width="44" height="12"><circle cx="12" cy="6" r="3" fill="var(--pw-krebs)"/><circle cx="26" cy="6" r="3" fill="var(--pw-krebs)" opacity=".6"/></svg>Partículas = sentido del flujo neto</div>
          <div><svg width="44" height="18"><rect x="2" y="3" width="38" height="14" rx="7" fill="var(--pw-glycolysis)"/><text x="8" y="14" font-size="10" fill="var(--pill-ink)">★</text></svg>★ enzima reguladora clave</div>
        </div>
      </div>
    </aside>

    <main class="stage" id="stage">
      <section class="view" id="view-mapa">
        <svg id="map" role="img" aria-label="Mapa metabólico de una célula humana"></svg>
        <div class="map-hud" id="hud"></div>
        <div class="zoom">
          <button id="z-in" aria-label="Acercar">+</button>
          <button id="z-out" aria-label="Alejar">−</button>
          <button id="z-fit" aria-label="Encuadrar todo"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button>
          <button id="z-play" aria-label="Pausar animación"><svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="3.4" height="10" rx="1" fill="currentColor"/><rect x="8.6" y="2" width="3.4" height="10" rx="1" fill="currentColor"/></svg></button>
        </div>
        <div class="hint">Arrastra para mover · rueda o pellizco para zoom · toca una flecha o un nodo</div>
        <div class="quiz" id="quiz" hidden></div>
      </section>
      <section class="view" id="view-tejidos" hidden></section>
      <section class="view" id="view-ciclos" hidden>
        <div class="mod-tabs" id="mod-tabs" role="group" aria-label="Esquemas"></div>
        <div class="mod-grid"><div class="mod-stage"><svg id="mod" role="img" aria-label="Esquema metabólico"></svg></div><aside class="mod-info" id="mod-info"></aside></div>
      </section>
      <section class="view" id="view-balances" hidden></section>
    </main>

    <aside class="panel" id="panel" aria-live="polite">
      <div class="panel-head"><span class="eyebrow" id="panel-kind">Detalle</span><button class="close" id="panel-close" aria-label="Cerrar">✕</button></div>
      <div class="panel-body" id="panel-body"></div>
    </aside>
  </div>
</div>
<div class="toast" id="toast"></div>`;
