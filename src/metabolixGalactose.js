// @ts-nocheck
/**
 * Suite Clínica de Dismetabolismo de la Galactosa y Acumulación de Galactitol
 * Estética: Dashboard Clínico Moderno (Apple Health / Software Médico de Alta Gama)
 * Paleta: Blanco puro, gris titanio, azul marino profundo con acentos en verde esmeralda y alertas ámbar/carmín.
 */

export const GALA_ENTITIES = new Set([
  'rx_galt',
  'rx_galk',
  'rx_aldose_reductase_gal',
  'galactose',
  'gal1p',
  'galactitol'
]);

export function isGalactoseEntity(id) {
  return GALA_ENTITIES.has(id);
}

export const GALA_VARIANTS = {
  clasica: {
    id: 'clasica',
    name: 'Clásica (G/G)',
    title: 'Galactosemia Clásica Tipo I',
    genotype: 'G/G (p.Q188R / p.K285N nulos)',
    badge: 'Deficiencia Crítica · Urgencia Neonatal',
    badgeType: 'danger',
    enzyme: 'GALT',
    activityPct: '< 1%',
    activityBar: 1,
    activityStatus: 'Actividad prácticamente nula indetectable (< 1%)',
    gal1pVal: '2.8 - 4.5 mmol/L',
    gal1pStatus: 'Sobrecarga citotóxica crítica (Target: < 0.04 mmol/L)',
    gal1pLevel: 'danger',
    galactitolVal: '> 175 mmol/mol crea',
    galactitolStatus: 'Hiperosmolaridad lenticular masiva',
    galactitolLevel: 'danger',
    blockRx: 'rx_galt',
    galtState: 'blocked',
    galkState: 'normal',
    aldoseFlux: 'high',
    lensRisk: 'Severo · Cataratas bilaterales en "gota de aceite" en 2–4 semanas',
    lensBadge: 'danger',
    liverRisk: 'Fallo hepático agudo, colestasis, coagulopatía y cirrosis',
    liverBadge: 'danger',
    ovaryRisk: 'Fallo Ovárico Prematuro (POI) en >80% de mujeres a pesar de dieta',
    ovaryBadge: 'danger',
    kidneyRisk: 'Disfunción tubular proximal generalizada (Sd. Fanconi)',
    kidneyBadge: 'danger',
    neuroRisk: 'Dispraxia verbal motora, ataxia y déficit en memoria operativa',
    neuroBadge: 'warning',
    sepsisRisk: 'Extrema susceptibilidad a sepsis neonatal por E. coli',
    sepsisBadge: 'danger',
    mechanismLens: 'La aldosa reductasa (AKR1B1) satura su Km reduciendo el exceso de galactosa a galactitol a expensas de NADPH. Al carecer de vía catabólica adicional (no es sustrato de sorbitol deshidrogenasa) y no atravesar membranas, el galactitol queda atrapado en el cristalino atrayendo agua por ósmosis, provocando tumefacción fibrilar y agregación de cristalinas.',
    mechanismVisceral: 'La Gal-1-P se acumula intracelularmente secuestrando fosfatos libres, e inhibe competitivamente a la Fosfoglucomutasa (PGM1) y a la UDP-Glucosa Pirofosforilasa, provocando hipoglucemia, depleción de ATP hepático, insuficiencia renal tubular y apoptosis masiva de células de la granulosa ovárica.',
    managementSummary: 'Retirada inmediata de leche materna o fórmula estándar. Introducir fórmula a base de aislado de soja o elemental. Monitorización trimestral de Gal-1-P eritrocitaria. Cribado oftalmológico urgente con lámpara de hendidura.',
    guidelineRef: 'Guía Clínica Internacional GalNet & Consenso ACMG 2024'
  },
  duarte_dg: {
    id: 'duarte_dg',
    name: 'Duarte (D/G)',
    title: 'Variante Duarte de Galactosemia',
    genotype: 'D2/G (p.N314D + c.-119_-116del en trans con alelo clásico)',
    badge: 'Variante Benigna · Subclínica',
    badgeType: 'warning',
    enzyme: 'GALT',
    activityPct: '15 – 25%',
    activityBar: 20,
    activityStatus: 'Actividad residual suficiente para depuración (15 – 25%)',
    gal1pVal: '0.2 – 0.6 mmol/L',
    gal1pStatus: 'Elevación transitoria subclínica no patológica',
    gal1pLevel: 'warning',
    galactitolVal: '10 – 22 mmol/mol crea',
    galactitolStatus: 'Rango normal a mínimamente limítrofe (sin cataratogénesis)',
    galactitolLevel: 'safe',
    blockRx: null,
    galtState: 'reduced',
    galkState: 'normal',
    aldoseFlux: 'low',
    lensRisk: 'Sin riesgo de cataratas comprobado en cohortes longitudinales',
    lensBadge: 'safe',
    liverRisk: 'Función hepática estrictamente conservada; sin ictericia patológica',
    liverBadge: 'safe',
    ovaryRisk: 'Reserva folicular ovárica y niveles de hormona antimülleriana normales',
    ovaryBadge: 'safe',
    kidneyRisk: 'Función renal óptima sin aminoaciduria ni glucosuria',
    kidneyBadge: 'safe',
    neuroRisk: 'Neurodesarrollo, cociente intelectual y lenguaje idénticos a controles',
    neuroBadge: 'safe',
    sepsisRisk: 'Sin riesgo incrementado de sepsis ni inmunodeficiencia',
    sepsisBadge: 'safe',
    mechanismLens: 'La actividad residual del 15 al 25% de GALT permite metabolizar la galactosa dietética con suficiente rapidez para evitar la hipergalactosemia mantenida. La aldosa reductasa permanece en estado basal no saturado y no se acumula galactitol en concentraciones osmóticamente dañinas.',
    mechanismVisceral: 'La discreta elevación transitoria de Gal-1-P tras la ingesta de leche no alcanza el umbral de inhibición enzimática de la PGM1 ni agota los depósitos de fosfatos energéticos en hepatocitos ni tejido ovárico.',
    managementSummary: 'Consenso Internacional Actual: Dieta libre con lactosa normal. Ensayos clínicos y estudios prospectivos demuestran que la restricción de galactosa es innecesaria y no aporta beneficios clínicos.',
    guidelineRef: 'Recomendación Consensuada ACMG / Estudio Longitudinal Duarte'
  },
  duarte_dd: {
    id: 'duarte_dd',
    name: 'Duarte (D/D)',
    title: 'Duarte Homocigota',
    genotype: 'D2/D2 (p.N314D homocigota)',
    badge: 'Variante Normal · No Patógena',
    badgeType: 'success',
    enzyme: 'GALT',
    activityPct: '45 – 55%',
    activityBar: 50,
    activityStatus: 'Actividad enzimática residual ~50% (fisiológicamente normal)',
    gal1pVal: '< 0.08 mmol/L',
    gal1pStatus: 'Concentración eritrocitaria fisiológica',
    gal1pLevel: 'safe',
    galactitolVal: '< 12 mmol/mol crea',
    galactitolStatus: 'Excreción basal normal',
    galactitolLevel: 'safe',
    blockRx: null,
    galtState: 'mild',
    galkState: 'normal',
    aldoseFlux: 'off',
    lensRisk: 'Ninguno',
    lensBadge: 'safe',
    liverRisk: 'Ninguno',
    liverBadge: 'safe',
    ovaryRisk: 'Ninguno',
    ovaryBadge: 'safe',
    kidneyRisk: 'Ninguno',
    kidneyBadge: 'safe',
    neuroRisk: 'Ninguno',
    sepsisRisk: 'Ninguno',
    sepsisBadge: 'safe',
    mechanismLens: 'El 50% de actividad enzimática procesa la carga diaria de galactosa sin sobrepasar la capacidad de la vía de Leloir. El cristalino permanece libre de estrés hiperosmótico.',
    mechanismVisceral: 'El flujo metabólico hacia Glucosa-1-P es continuo y no existen intermediarios acumulados ni interferencia con la fosfoglucomutasa.',
    managementSummary: 'Variante biológica benigna. No se requiere ninguna intervención médica, cribado adicional ni restricción dietética.',
    guidelineRef: 'Variante No Patógena Clasificada'
  },
  galk: {
    id: 'galk',
    name: 'GALK1 (Tipo II)',
    title: 'Galactosemia Tipo II (Déficit de GALK1)',
    genotype: 'GALK1 -/- (Locus 17q25.1)',
    badge: 'Cataratogénesis Osmótica Pura',
    badgeType: 'danger',
    enzyme: 'GALK1',
    activityPct: '< 3%',
    activityBar: 2,
    activityStatus: 'Actividad quinasa indetectable (< 3%)',
    gal1pVal: '0.00 mmol/L',
    gal1pStatus: 'Completamente ausente (No se fosforila)',
    gal1pLevel: 'safe',
    galactitolVal: '> 220 mmol/mol crea',
    galactitolStatus: 'Desvío extremo a Aldosa Reductasa',
    galactitolLevel: 'danger',
    blockRx: 'rx_galk',
    galtState: 'dormant',
    galkState: 'blocked',
    aldoseFlux: 'maximal',
    lensRisk: 'Extremo y precoz · Catarata bilateral aislada como único signo clínico',
    lensBadge: 'danger',
    liverRisk: 'Cero: Hígado intacto porque no se forma Galactosa-1-P',
    liverBadge: 'safe',
    ovaryRisk: 'Cero: Fertilidad y ovocitos preservados al 100%',
    ovaryBadge: 'safe',
    kidneyRisk: 'Cero: Sin tubulopatía renal ni proteinuria',
    kidneyBadge: 'safe',
    neuroRisk: 'Cero: Cociente intelectual y lenguaje totalmente preservados',
    neuroBadge: 'safe',
    sepsisRisk: 'Sin susceptibilidad incrementada a sepsis neonatal',
    sepsisBadge: 'safe',
    mechanismLens: 'Al no poder fosforilarse a Gal-1-P, la galactosa libre en plasma alcanza concentraciones masivas (>10-25 mM). En el cristalino, la aldosa reductasa actúa a velocidad máxima produciendo ingentes cantidades de galactitol. El gradiente osmótico revienta las membranas de las fibras del cristalino generando cataratas bilaterales nucleares.',
    mechanismVisceral: 'Diagnóstico diferencial clave: La ausencia de Gal-1-P protege totalmente al hepatocito, al riñón y al ovario. No existe secuestro de fosfatos ni fallo multiorgánico.',
    managementSummary: 'Dieta estricta sin galactosa/lactosa de por vida. La supresión precoz de lactosa en las primeras 2-3 semanas de vida revierte las opacidades cristalinianas tempranas sin secuelas visuales.',
    guidelineRef: 'Guía Clínica de Galactosemia Tipo II'
  },
  normal: {
    id: 'normal',
    name: 'Control (N/N)',
    title: 'Metabolismo Fisiológico de la Galactosa',
    genotype: 'N/N (Alelos salvajes / Wild-Type)',
    badge: 'Metabolismo Eufuncional',
    badgeType: 'success',
    enzyme: 'Vía de Leloir',
    activityPct: '100%',
    activityBar: 100,
    activityStatus: 'Capacidad de aclaramiento de Leloir óptima (100%)',
    gal1pVal: '< 0.04 mmol/L',
    gal1pStatus: 'Concentración fisiológica en estado estacionario',
    gal1pLevel: 'safe',
    galactitolVal: '< 10 mmol/mol crea',
    galactitolStatus: 'Excreción basal fisiológica mínima',
    galactitolLevel: 'safe',
    blockRx: null,
    galtState: 'normal',
    galkState: 'normal',
    aldoseFlux: 'off',
    lensRisk: 'Cristalino transparente sin opacidades',
    lensBadge: 'safe',
    liverRisk: 'Función hepática normal',
    liverBadge: 'safe',
    ovaryRisk: 'Función ovárica normal',
    ovaryBadge: 'safe',
    kidneyRisk: 'Función renal normal',
    kidneyBadge: 'safe',
    neuroRisk: 'Neurodesarrollo normal',
    neuroBadge: 'safe',
    sepsisRisk: 'Respuesta inmunitaria normal',
    sepsisBadge: 'safe',
    mechanismLens: 'La galactosa se canaliza de inmediato por la vía de Leloir hepática hacia glucólisis o síntesis de glucógeno. La aldosa reductasa apenas recibe sustrato debido a su baja afinidad (Km alta).',
    mechanismVisceral: 'La Gal-1-P producida por la GALK1 se transfiere instantáneamente por la GALT liberando Glucosa-1-Fosfato sin acumularse jamás por encima del umbral de toxicidad.',
    managementSummary: 'Tolerancia fisiológica completa a productos lácteos y galactosa alimentaria.',
    guidelineRef: 'Fisiología Celular Humana'
  }
};

export function renderGalactoseClinicalSuite(contextId) {
  let defaultVariant = 'clasica';
  if (contextId === 'rx_galk') defaultVariant = 'galk';
  else if (contextId === 'galactitol' || contextId === 'rx_aldose_reductase_gal') defaultVariant = 'clasica';

  const v = GALA_VARIANTS[defaultVariant];

  return `
  <section class="gala-suite" id="gala-suite" data-active-var="${defaultVariant}">
    <!-- Header Clínico Ultra-Pulido -->
    <div class="gala-header">
      <div class="gala-header-top">
        <div class="gala-badge-wrap">
          <span class="gala-chip-dna">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-4-4"/><path d="m7 18 2.5 2.5"/><path d="m3.5 14.5 4 4"/><path d="m20 9 .5.5"/><path d="m6.5 12.5 1 1"/><path d="m16.5 10.5 1 1"/><path d="m10 16 1.5 1.5"/></svg>
            Metabolismo de la Galactosa
          </span>
          <span class="gala-chip-protocol">${v.guidelineRef}</span>
        </div>
        <h3 class="gala-title">Panel clínico: Galactosemias y vía del galactitol</h3>
        <p class="gala-subtitle" id="gala-sub">${v.title} · ${v.genotype}</p>
      </div>

      <!-- Segmented Control de Variantes Genéticas (Apple Health style) -->
      <div class="gala-tabs" role="tablist" aria-label="Variantes genéticas de galactosemia">
        <button class="gala-tab-btn active" data-var="clasica" role="tab" aria-selected="true">
          <span class="gala-tab-dot danger"></span>
          <span class="gala-tab-text">Clásica (G/G)</span>
        </button>
        <button class="gala-tab-btn" data-var="duarte_dg" role="tab" aria-selected="false">
          <span class="gala-tab-dot warning"></span>
          <span class="gala-tab-text">Duarte (D/G)</span>
        </button>
        <button class="gala-tab-btn" data-var="duarte_dd" role="tab" aria-selected="false">
          <span class="gala-tab-dot success"></span>
          <span class="gala-tab-text">Duarte (D/D)</span>
        </button>
        <button class="gala-tab-btn" data-var="galk" data-def="galk" role="tab" aria-selected="false">
          <span class="gala-tab-dot danger"></span>
          <span class="gala-tab-text">GALK1 (tipo II)</span>
        </button>
        <button class="gala-tab-btn" data-var="normal" role="tab" aria-selected="false">
          <span class="gala-tab-dot success"></span>
          <span class="gala-tab-text">Control (N/N)</span>
        </button>
      </div>
    </div>

    <!-- Diagrama Dinámico SVG: Vía de Leloir vs Desvío Osmotóxico del Poliol -->
    <div class="gala-card gala-diagram-card">
      <div class="gala-card-header">
        <div class="gala-card-title-group">
          <span class="gala-card-eyebrow">Diagrama metabólico dinámico</span>
          <h4 class="gala-card-heading">Bifurcación: Vía de Leloir vs desvío osmotóxico por aldosa reductasa</h4>
        </div>
        <div class="gala-live-badge danger" id="gala-live-badge">${v.badge}</div>
      </div>

      <div class="gala-svg-wrap">
        <svg id="gala-svg" viewBox="0 0 540 250" class="gala-schematic" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-card" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="var(--ink-1)" stop-opacity="1"/>
              <stop offset="100%" stop-color="var(--ink-2)" stop-opacity="1"/>
            </linearGradient>
            <linearGradient id="grad-danger" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#b91c1c"/>
            </linearGradient>
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#059669"/>
            </linearGradient>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
            </marker>
            <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
            </marker>
            <filter id="glow-danger" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ef4444" flood-opacity="0.45"/>
            </filter>
            <filter id="glow-warning" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#f59e0b" flood-opacity="0.35"/>
            </filter>
          </defs>

          <!-- Zona Fondo: Shunt Osmótico de Poliol (Superior) -->
          <rect x="130" y="16" width="395" height="74" rx="10" fill="color-mix(in srgb, var(--danger) 5%, transparent)" stroke="color-mix(in srgb, var(--danger) 15%, transparent)" stroke-dasharray="4 3"/>
          <text x="142" y="32" class="gala-svg-lbl-faint">Desvío patológico: VÍA del poliol (cristalino ocular)</text>

          <!-- Zona Fondo: Vía Fisiológica de Leloir (Inferior) -->
          <rect x="130" y="104" width="395" height="132" rx="10" fill="color-mix(in srgb, var(--ok) 5%, transparent)" stroke="color-mix(in srgb, var(--ok) 18%, transparent)"/>
          <text x="142" y="120" class="gala-svg-lbl-faint">VÍA fisiológica DE Leloir (hepatocito y sistémica)</text>

          <!-- nodo 1: D-Galactosa (Origen Común) -->
          <g id="gala-node-gal" class="gala-svg-node" transform="translate(18, 98)">
            <rect width="96" height="52" rx="8" fill="var(--ink-1)" stroke="var(--accent)" stroke-width="2"/>
            <text x="48" y="22" text-anchor="middle" class="gala-svg-node-title">D-Galactosa</text>
            <text x="48" y="38" text-anchor="middle" class="gala-svg-node-sub mono">C₆H₁₂O₆</text>
            <g id="gala-gal-alert" display="none">
              <circle cx="86" cy="10" r="7" fill="#ef4444"/>
              <text x="86" y="13.5" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">!</text>
            </g>
          </g>

          <!-- flecha 1: Hacia arriba -> aldosa reductasa -> Galactitol -->
          <path id="gala-path-aldose" d="M 114 114 C 150 114, 160 54, 210 54" fill="none" stroke="#ef4444" stroke-width="4" marker-end="url(#arrow-red)"/>
          
          <!-- enzima: Aldosa Reductasa (AKR1B1) -->
          <g id="gala-enz-aldose" transform="translate(175, 34)">
            <rect x="-48" y="-12" width="96" height="24" rx="12" fill="var(--ink-1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="0" y="4" text-anchor="middle" class="gala-svg-enz-txt">Aldosa reductasa</text>
            <text x="0" y="-16" text-anchor="middle" class="gala-svg-cof-txt">+ NADPH → NADP⁺</text>
          </g>

          <!-- nodo 2: Galactitol (poliol atrapado) -->
          <g id="gala-node-galactitol" class="gala-svg-node" transform="translate(225, 28)">
            <rect id="gala-rect-galactitol" width="102" height="52" rx="8" fill="var(--ink-1)" stroke="#ef4444" stroke-width="2.2" filter="url(#glow-danger)"/>
            <text x="51" y="21" text-anchor="middle" class="gala-svg-node-title" fill="#ef4444">Galactitol</text>
            <text x="51" y="37" text-anchor="middle" class="gala-svg-node-sub">Poliol osmótico</text>
            <text id="gala-badge-galactitol" x="51" y="48" text-anchor="middle" class="gala-svg-node-extra" fill="#ef4444">↑↑ Acúmulo</text>
          </g>

          <!-- flecha galactitol -> Cristalino -->
          <path id="gala-path-lens" d="M 327 54 L 385 54" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="3 2" marker-end="url(#arrow-red)"/>

          <!-- diana cristalino: Cataratas EN GOTA DE aceite -->
          <g id="gala-node-lens" transform="translate(395, 30)">
            <rect id="gala-rect-lens" width="120" height="48" rx="8" fill="color-mix(in srgb, #ef4444 12%, var(--ink-1))" stroke="#ef4444" stroke-width="1.8"/>
            <text x="60" y="20" text-anchor="middle" class="gala-svg-organ-title">Cristalino</text>
            <text id="gala-lens-diag" x="60" y="36" text-anchor="middle" class="gala-svg-organ-sub" fill="#ef4444">Cataratas bilaterales</text>
          </g>

          <!-- flecha 2: Hacia Leloir -> GALK1 -> GAL-1-P -->
          <path id="gala-path-galk" d="M 114 136 L 200 136" fill="none" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-green)"/>
          
          <!-- enzima: GALK1 -->
          <g id="gala-enz-galk" transform="translate(155, 136)">
            <rect id="gala-rect-galk" x="-32" y="-12" width="64" height="24" rx="12" fill="var(--ink-1)" stroke="#10b981" stroke-width="1.5"/>
            <text id="gala-txt-galk" x="0" y="4" text-anchor="middle" class="gala-svg-enz-txt">GALK1</text>
            <text x="0" y="24" text-anchor="middle" class="gala-svg-cof-txt">+ ATP</text>
            <g id="gala-cross-galk" display="none" transform="translate(18, -10)">
              <circle r="7" fill="#ef4444"/>
              <text y="3" text-anchor="middle" fill="#fff" font-size="9" font-weight="800">✕</text>
            </g>
          </g>

          <!-- nodo 3: Galactosa-1-fosfato (GAL-1-P) -->
          <g id="gala-node-gal1p" class="gala-svg-node" transform="translate(210, 114)">
            <rect id="gala-rect-gal1p" width="98" height="52" rx="8" fill="var(--ink-1)" stroke="#ef4444" stroke-width="2.2" filter="url(#glow-danger)"/>
            <text x="49" y="21" text-anchor="middle" class="gala-svg-node-title" fill="#ef4444">Galactosa-1-P</text>
            <text x="49" y="37" text-anchor="middle" class="gala-svg-node-sub mono">C₆H₁₁O₉P²⁻</text>
            <text id="gala-badge-gal1p" x="49" y="48" text-anchor="middle" class="gala-svg-node-extra" fill="#ef4444">↑↑ Tóxico visceral</text>
          </g>

          <!-- flecha 3: GAL-1-P -> GALT -> G-1-P -->
          <path id="gala-path-galt" d="M 308 136 L 385 136" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#arrow-red)"/>

          <!-- enzima: GALT (punto crítico) -->
          <g id="gala-enz-galt" transform="translate(345, 136)">
            <rect id="gala-rect-galt" x="-32" y="-12" width="64" height="24" rx="12" fill="var(--ink-1)" stroke="#ef4444" stroke-width="2"/>
            <text id="gala-txt-galt" x="0" y="4" text-anchor="middle" class="gala-svg-enz-txt" fill="#ef4444">GALT</text>
            <text x="0" y="24" text-anchor="middle" class="gala-svg-cof-txt">+ UDP-Glc</text>
            <!-- Sello de Bloqueo [X] -->
            <g id="gala-cross-galt" transform="translate(18, -10)">
              <circle r="8" fill="#ef4444"/>
              <text y="3" text-anchor="middle" fill="#fff" font-size="10" font-weight="900">✕</text>
            </g>
          </g>

          <!-- nodo 4: Glucosa-1-Fosfato (Continuación hacia Glucólisis) -->
          <g id="gala-node-g1p" class="gala-svg-node" transform="translate(395, 114)">
            <rect id="gala-rect-g1p" width="120" height="44" rx="8" fill="var(--ink-1)" stroke="#94a3b8" stroke-width="1.4"/>
            <text x="60" y="20" text-anchor="middle" class="gala-svg-node-title">Glucosa-1-P</text>
            <text id="gala-g1p-sub" x="60" y="34" text-anchor="middle" class="gala-svg-node-sub">↓ Agotada</text>
          </g>

          <!-- flecha hacia glucólisis / glucógeno -->
          <path id="gala-path-glyc" d="M 455 158 L 455 190" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 2" marker-end="url(#arrow-gray)"/>
          <text x="455" y="208" text-anchor="middle" class="gala-svg-lbl-faint">Glucosa-6-P · glucólisis</text>

          <!-- Alerta de Toxicidad Visceral Bajo Gal-1-P -->
          <g id="gala-box-tox" transform="translate(210, 178)">
            <rect width="190" height="42" rx="6" fill="color-mix(in srgb, #ef4444 8%, var(--ink-1))" stroke="color-mix(in srgb, #ef4444 25%, transparent)"/>
            <text x="8" y="16" class="gala-svg-tox-title" fill="#ef4444">Toxicidad visceral de Gal-1-P:</text>
            <text x="8" y="30" class="gala-svg-tox-desc">Inhibe PGM1, depleta ATP, lesión hepática y POI ovárica</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- Trío de Tarjetas de Biomarcadores y Constantes Clínicas (Apple Health KPI Cards) -->
    <div class="gala-kpi-grid">
      <!-- Tarjeta 1: Actividad Enzimática -->
      <div class="gala-kpi-card" id="kpi-card-act">
        <div class="gala-kpi-top">
          <span class="gala-kpi-label">Actividad residual GALT</span>
          <span class="gala-kpi-tag danger" id="kpi-tag-act">${v.activityPct}</span>
        </div>
        <div class="gala-kpi-val-row">
          <span class="gala-kpi-num" id="kpi-val-act">${v.activityPct}</span>
          <span class="gala-kpi-unit">de lo normal</span>
        </div>
        <!-- Barra de progreso calibrada -->
        <div class="gala-kpi-bar-track">
          <div class="gala-kpi-bar-fill danger" id="kpi-bar-act" style="width: ${v.activityBar}%"></div>
        </div>
        <p class="gala-kpi-footnote" id="kpi-fn-act">${v.activityStatus}</p>
      </div>

      <!-- Tarjeta 2: Gal-1-P Eritrocitaria -->
      <div class="gala-kpi-card" id="kpi-card-gal1p">
        <div class="gala-kpi-top">
          <span class="gala-kpi-label">Galactosa-1-Fosfato (Gal-1-P)</span>
          <span class="gala-kpi-tag danger" id="kpi-tag-gal1p">Tóxico visceral</span>
        </div>
        <div class="gala-kpi-val-row">
          <span class="gala-kpi-num" id="kpi-val-gal1p">${v.gal1pVal}</span>
        </div>
        <div class="gala-kpi-threshold">
          <span>Target seguro: &lt; 0.04 mmol/L (&lt; 1 mg/dL)</span>
        </div>
        <p class="gala-kpi-footnote" id="kpi-fn-gal1p">${v.gal1pStatus}</p>
      </div>

      <!-- Tarjeta 3: Galactitol Acumulado -->
      <div class="gala-kpi-card" id="kpi-card-galactitol">
        <div class="gala-kpi-top">
          <span class="gala-kpi-label">Galactitol (cristalino / orina)</span>
          <span class="gala-kpi-tag danger" id="kpi-tag-galactitol">Hiperosmolar</span>
        </div>
        <div class="gala-kpi-val-row">
          <span class="gala-kpi-num" id="kpi-val-galactitol">${v.galactitolVal}</span>
        </div>
        <div class="gala-kpi-threshold">
          <span>Referencia fisiológica: &lt; 12 mmol/mol creatinina</span>
        </div>
        <p class="gala-kpi-footnote" id="kpi-fn-galactitol">${v.galactitolStatus}</p>
      </div>
    </div>

    <!-- Comparativa Fisiopatológica Deslizante: Cristalino vs Vísceras -->
    <div class="gala-dual-grid">
      <!-- Tarjeta A: Fisiopatología Lenticular (Galactitol) -->
      <div class="gala-card gala-mech-card" id="card-mech-lens">
        <div class="gala-mech-header">
          <div class="gala-mech-icon-wrap danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2.5 12c2.5-5 6.5-8 9.5-8s7 3 9.5 8c-2.5 5-6.5 8-9.5 8s-7-3-9.5-8z"/></svg>
          </div>
          <div>
            <h5 class="gala-mech-title">Foco cristalino: Osmolaridad de galactitol</h5>
            <span class="gala-mech-subtitle">Patogénesis de las cataratas nucleares</span>
          </div>
        </div>
        <p class="gala-mech-text" id="gala-mech-lens-p">${v.mechanismLens}</p>
        <div class="gala-mech-bullet">
          <b>Signo clave:</b> La aldosa reductasa periférica atrapa galactitol no difusible $\rightarrow$ colapso de cristalinas y catarata bilateral en "gota de aceite".
        </div>
      </div>

      <!-- Tarjeta B: Fisiopatología Visceral (Gal-1-P) -->
      <div class="gala-card gala-mech-card" id="card-mech-visceral">
        <div class="gala-mech-header">
          <div class="gala-mech-icon-wrap warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h5 class="gala-mech-title">Foco visceral: Citotoxicidad de Gal-1-P</h5>
            <span class="gala-mech-subtitle">Hígado, gónadas femeninas y riñón</span>
          </div>
        </div>
        <p class="gala-mech-text" id="gala-mech-visceral-p">${v.mechanismVisceral}</p>
        <div class="gala-mech-bullet">
          <b>Punto clínico crítico:</b> La Gal-1-P inhibe a la PGM1 hepática provocando hipoglucemia neonatal e induce fallo ovárico primario (POI) irreversible en &gt;80% de mujeres.
        </div>
      </div>
    </div>

    <!-- Matriz Clínica de Impacto por Órgano Diana -->
    <div class="gala-card gala-matrix-card">
      <div class="gala-card-header">
        <span class="gala-card-eyebrow">Matriz de impacto clínico por órgano</span>
        <h4 class="gala-card-heading">Manifestaciones sistémicas de la variante activa</h4>
      </div>
      <div class="gala-matrix-grid">
        <div class="gala-matrix-item" id="org-liver">
          <div class="gala-matrix-top">
            <span class="gala-matrix-icon">Hí</span>
            <span class="gala-matrix-org">Hígado</span>
            <span class="gala-status-pill danger" id="org-tag-liver">Severo</span>
          </div>
          <p class="gala-matrix-desc" id="org-desc-liver">${v.liverRisk}</p>
        </div>

        <div class="gala-matrix-item" id="org-lens">
          <div class="gala-matrix-top">
            <span class="gala-matrix-icon">Cr</span>
            <span class="gala-matrix-org">Cristalino</span>
            <span class="gala-status-pill danger" id="org-tag-lens">Alto riesgo</span>
          </div>
          <p class="gala-matrix-desc" id="org-desc-lens">${v.lensRisk}</p>
        </div>

        <div class="gala-matrix-item" id="org-ovary">
          <div class="gala-matrix-top">
            <span class="gala-matrix-icon">Ov</span>
            <span class="gala-matrix-org">Ovario (POI)</span>
            <span class="gala-status-pill danger" id="org-tag-ovary">&gt;80% POI</span>
          </div>
          <p class="gala-matrix-desc" id="org-desc-ovary">${v.ovaryRisk}</p>
        </div>

        <div class="gala-matrix-item" id="org-kidney">
          <div class="gala-matrix-top">
            <span class="gala-matrix-icon">Ri</span>
            <span class="gala-matrix-org">Riñón</span>
            <span class="gala-status-pill danger" id="org-tag-kidney">Sd. Fanconi</span>
          </div>
          <p class="gala-matrix-desc" id="org-desc-kidney">${v.kidneyRisk}</p>
        </div>

        <div class="gala-matrix-item" id="org-neuro">
          <div class="gala-matrix-top">
            <span class="gala-matrix-icon">Ce</span>
            <span class="gala-matrix-org">SNC</span>
            <span class="gala-status-pill warning" id="org-tag-neuro">Dispraxia</span>
          </div>
          <p class="gala-matrix-desc" id="org-desc-neuro">${v.neuroRisk}</p>
        </div>

        <div class="gala-matrix-item" id="org-sepsis">
          <div class="gala-matrix-top">
            <span class="gala-matrix-icon">In</span>
            <span class="gala-matrix-org">Sepsis neonatal</span>
            <span class="gala-status-pill danger" id="org-tag-sepsis">E. coli</span>
          </div>
          <p class="gala-matrix-desc" id="org-desc-sepsis">${v.sepsisRisk}</p>
        </div>
      </div>
    </div>

    <!-- Barra de Conducta Terapéutica y Navegación -->
    <div class="gala-footer-card">
      <div class="gala-footer-info">
        <span class="gala-card-eyebrow">Manejo terapéutico basado EN guías</span>
        <p class="gala-footer-text" id="gala-mgmt-p">${v.managementSummary}</p>
      </div>
      <div class="gala-footer-actions">
        <button class="gala-sim-btn" id="gala-sim-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <span id="gala-sim-lbl">Enfocar vía de la galactosa en el mapa</span>
        </button>
      </div>
    </div>
  </section>
  `;
}

export function setupGalactoseClinicalSuite(container, contextId, actions) {
  const root = container.querySelector('#gala-suite');
  if (!root) return;

  const tabs = root.querySelectorAll('.gala-tab-btn');
  const simBtn = root.querySelector('#gala-sim-btn');

  function updateView(varKey) {
    const v = GALA_VARIANTS[varKey];
    if (!v) return;

    root.dataset.activeVar = varKey;

    // Tabs active state
    tabs.forEach(t => {
      const match = t.dataset.var === varKey;
      t.classList.toggle('active', match);
      t.setAttribute('aria-selected', String(match));
    });

    // Subtitle & Live badge
    const sub = root.querySelector('#gala-sub');
    if (sub) sub.textContent = `${v.title} · ${v.genotype}`;

    const badge = root.querySelector('#gala-live-badge');
    if (badge) {
      badge.textContent = v.badge;
      badge.className = `gala-live-badge ${v.badgeType}`;
    }

    // SVG Schematic Elements
    const crossGalt = root.querySelector('#gala-cross-galt');
    const rectGalt = root.querySelector('#gala-rect-galt');
    const txtGalt = root.querySelector('#gala-txt-galt');
    const crossGalk = root.querySelector('#gala-cross-galk');
    const rectGalk = root.querySelector('#gala-rect-galk');
    const pathAldose = root.querySelector('#gala-path-aldose');
    const rectGalactitol = root.querySelector('#gala-rect-galactitol');
    const badgeGalactitol = root.querySelector('#gala-badge-galactitol');
    const rectGal1p = root.querySelector('#gala-rect-gal1p');
    const badgeGal1p = root.querySelector('#gala-badge-gal1p');
    const pathGalt = root.querySelector('#gala-path-galt');
    const rectLens = root.querySelector('#gala-rect-lens');
    const lensDiag = root.querySelector('#gala-lens-diag');
    const galAlert = root.querySelector('#gala-gal-alert');
    const toxBox = root.querySelector('#gala-box-tox');
    const g1pSub = root.querySelector('#gala-g1p-sub');

    if (varKey === 'clasica') {
      if (crossGalt) crossGalt.style.display = '';
      if (rectGalt) { rectGalt.setAttribute('stroke', '#ef4444'); rectGalt.setAttribute('stroke-width', '2.2'); }
      if (txtGalt) txtGalt.setAttribute('fill', '#ef4444');
      if (crossGalk) crossGalk.style.display = 'none';
      if (rectGalk) { rectGalk.setAttribute('stroke', '#10b981'); rectGalk.setAttribute('stroke-width', '1.5'); }
      if (galAlert) galAlert.style.display = 'none';

      if (pathAldose) { pathAldose.setAttribute('stroke', '#ef4444'); pathAldose.setAttribute('stroke-width', '4'); pathAldose.setAttribute('marker-end', 'url(#arrow-red)'); }
      if (rectGalactitol) { rectGalactitol.setAttribute('stroke', '#ef4444'); rectGalactitol.setAttribute('stroke-width', '2.4'); rectGalactitol.setAttribute('filter', 'url(#glow-danger)'); }
      if (badgeGalactitol) { badgeGalactitol.textContent = '↑↑ Acúmulo masivo'; badgeGalactitol.setAttribute('fill', '#ef4444'); }

      if (rectGal1p) { rectGal1p.setAttribute('stroke', '#ef4444'); rectGal1p.setAttribute('stroke-width', '2.4'); rectGal1p.setAttribute('filter', 'url(#glow-danger)'); }
      if (badgeGal1p) { badgeGal1p.textContent = '↑↑ Tóxico visceral'; badgeGal1p.setAttribute('fill', '#ef4444'); }
      if (pathGalt) { pathGalt.setAttribute('stroke', '#ef4444'); pathGalt.setAttribute('stroke-width', '2'); pathGalt.setAttribute('stroke-dasharray', '4 2'); }

      if (rectLens) { rectLens.setAttribute('stroke', '#ef4444'); rectLens.setAttribute('fill', 'color-mix(in srgb, #ef4444 12%, var(--ink-1))'); }
      if (lensDiag) { lensDiag.textContent = 'Cataratas bilaterales'; lensDiag.setAttribute('fill', '#ef4444'); }
      if (toxBox) toxBox.style.display = '';
      if (g1pSub) g1pSub.textContent = '↓ Bloqueada';
    } else if (varKey === 'duarte_dg') {
      if (crossGalt) crossGalt.style.display = 'none';
      if (rectGalt) { rectGalt.setAttribute('stroke', '#f59e0b'); rectGalt.setAttribute('stroke-width', '2'); }
      if (txtGalt) txtGalt.setAttribute('fill', '#f59e0b');
      if (crossGalk) crossGalk.style.display = 'none';
      if (rectGalk) { rectGalk.setAttribute('stroke', '#10b981'); rectGalk.setAttribute('stroke-width', '1.5'); }
      if (galAlert) galAlert.style.display = 'none';

      if (pathAldose) { pathAldose.setAttribute('stroke', '#94a3b8'); pathAldose.setAttribute('stroke-width', '1.8'); pathAldose.setAttribute('marker-end', 'url(#arrow-gray)'); }
      if (rectGalactitol) { rectGalactitol.setAttribute('stroke', '#94a3b8'); rectGalactitol.setAttribute('stroke-width', '1.2'); rectGalactitol.removeAttribute('filter'); }
      if (badgeGalactitol) { badgeGalactitol.textContent = 'Normal'; badgeGalactitol.setAttribute('fill', '#64748b'); }

      if (rectGal1p) { rectGal1p.setAttribute('stroke', '#f59e0b'); rectGal1p.setAttribute('stroke-width', '1.5'); rectGal1p.removeAttribute('filter'); }
      if (badgeGal1p) { badgeGal1p.textContent = '↑ Leve subclínico'; badgeGal1p.setAttribute('fill', '#f59e0b'); }
      if (pathGalt) { pathGalt.setAttribute('stroke', '#10b981'); pathGalt.setAttribute('stroke-width', '2.2'); pathGalt.removeAttribute('stroke-dasharray'); }

      if (rectLens) { rectLens.setAttribute('stroke', '#10b981'); rectLens.setAttribute('fill', 'color-mix(in srgb, #10b981 8%, var(--ink-1))'); }
      if (lensDiag) { lensDiag.textContent = 'Limpio · Sin cataratas'; lensDiag.setAttribute('fill', '#10b981'); }
      if (toxBox) toxBox.style.display = 'none';
      if (g1pSub) g1pSub.textContent = 'Flujo suficiente';
    } else if (varKey === 'duarte_dd') {
      if (crossGalt) crossGalt.style.display = 'none';
      if (rectGalt) { rectGalt.setAttribute('stroke', '#10b981'); rectGalt.setAttribute('stroke-width', '1.5'); }
      if (txtGalt) txtGalt.setAttribute('fill', '#10b981');
      if (crossGalk) crossGalk.style.display = 'none';
      if (rectGalk) { rectGalk.setAttribute('stroke', '#10b981'); rectGalk.setAttribute('stroke-width', '1.5'); }
      if (galAlert) galAlert.style.display = 'none';

      if (pathAldose) { pathAldose.setAttribute('stroke', '#94a3b8'); pathAldose.setAttribute('stroke-width', '1.2'); pathAldose.setAttribute('marker-end', 'url(#arrow-gray)'); }
      if (rectGalactitol) { rectGalactitol.setAttribute('stroke', '#94a3b8'); rectGalactitol.setAttribute('stroke-width', '1'); rectGalactitol.removeAttribute('filter'); }
      if (badgeGalactitol) { badgeGalactitol.textContent = 'Fisiológico'; badgeGalactitol.setAttribute('fill', '#64748b'); }

      if (rectGal1p) { rectGal1p.setAttribute('stroke', '#10b981'); rectGal1p.setAttribute('stroke-width', '1.2'); rectGal1p.removeAttribute('filter'); }
      if (badgeGal1p) { badgeGal1p.textContent = 'Fisiológico'; badgeGal1p.setAttribute('fill', '#10b981'); }
      if (pathGalt) { pathGalt.setAttribute('stroke', '#10b981'); pathGalt.setAttribute('stroke-width', '2.5'); pathGalt.removeAttribute('stroke-dasharray'); }

      if (rectLens) { rectLens.setAttribute('stroke', '#10b981'); rectLens.setAttribute('fill', 'color-mix(in srgb, #10b981 8%, var(--ink-1))'); }
      if (lensDiag) { lensDiag.textContent = 'Normal'; lensDiag.setAttribute('fill', '#10b981'); }
      if (toxBox) toxBox.style.display = 'none';
      if (g1pSub) g1pSub.textContent = 'Normal';
    } else if (varKey === 'galk') {
      if (crossGalt) crossGalt.style.display = 'none';
      if (rectGalt) { rectGalt.setAttribute('stroke', '#94a3b8'); rectGalt.setAttribute('stroke-width', '1.2'); }
      if (txtGalt) txtGalt.setAttribute('fill', '#94a3b8');
      if (crossGalk) crossGalk.style.display = '';
      if (rectGalk) { rectGalk.setAttribute('stroke', '#ef4444'); rectGalk.setAttribute('stroke-width', '2.2'); }
      if (galAlert) galAlert.style.display = '';

      if (pathAldose) { pathAldose.setAttribute('stroke', '#ef4444'); pathAldose.setAttribute('stroke-width', '5'); pathAldose.setAttribute('marker-end', 'url(#arrow-red)'); }
      if (rectGalactitol) { rectGalactitol.setAttribute('stroke', '#ef4444'); rectGalactitol.setAttribute('stroke-width', '2.5'); rectGalactitol.setAttribute('filter', 'url(#glow-danger)'); }
      if (badgeGalactitol) { badgeGalactitol.textContent = '↑↑ Extremo (Puro)'; badgeGalactitol.setAttribute('fill', '#ef4444'); }

      if (rectGal1p) { rectGal1p.setAttribute('stroke', '#94a3b8'); rectGal1p.setAttribute('stroke-width', '1'); rectGal1p.removeAttribute('filter'); }
      if (badgeGal1p) { badgeGal1p.textContent = '0.0 mmol/L (Sin Daño)'; badgeGal1p.setAttribute('fill', '#10b981'); }
      if (pathGalt) { pathGalt.setAttribute('stroke', '#94a3b8'); pathGalt.setAttribute('stroke-width', '1'); pathGalt.setAttribute('stroke-dasharray', '2 2'); }

      if (rectLens) { rectLens.setAttribute('stroke', '#ef4444'); rectLens.setAttribute('fill', 'color-mix(in srgb, #ef4444 14%, var(--ink-1))'); }
      if (lensDiag) { lensDiag.textContent = 'Catarata Bilateral Precoz'; lensDiag.setAttribute('fill', '#ef4444'); }
      if (toxBox) toxBox.style.display = 'none';
      if (g1pSub) g1pSub.textContent = 'Sin fosforilación';
    } else { // normal
      if (crossGalt) crossGalt.style.display = 'none';
      if (rectGalt) { rectGalt.setAttribute('stroke', '#10b981'); rectGalt.setAttribute('stroke-width', '1.5'); }
      if (txtGalt) txtGalt.setAttribute('fill', '#10b981');
      if (crossGalk) crossGalk.style.display = 'none';
      if (rectGalk) { rectGalk.setAttribute('stroke', '#10b981'); rectGalk.setAttribute('stroke-width', '1.5'); }
      if (galAlert) galAlert.style.display = 'none';

      if (pathAldose) { pathAldose.setAttribute('stroke', '#94a3b8'); pathAldose.setAttribute('stroke-width', '1.2'); pathAldose.setAttribute('marker-end', 'url(#arrow-gray)'); }
      if (rectGalactitol) { rectGalactitol.setAttribute('stroke', '#94a3b8'); rectGalactitol.setAttribute('stroke-width', '1'); rectGalactitol.removeAttribute('filter'); }
      if (badgeGalactitol) { badgeGalactitol.textContent = 'Basal'; badgeGalactitol.setAttribute('fill', '#64748b'); }

      if (rectGal1p) { rectGal1p.setAttribute('stroke', '#10b981'); rectGal1p.setAttribute('stroke-width', '1.5'); rectGal1p.removeAttribute('filter'); }
      if (badgeGal1p) { badgeGal1p.textContent = 'Normal'; badgeGal1p.setAttribute('fill', '#10b981'); }
      if (pathGalt) { pathGalt.setAttribute('stroke', '#10b981'); pathGalt.setAttribute('stroke-width', '2.5'); pathGalt.removeAttribute('stroke-dasharray'); }

      if (rectLens) { rectLens.setAttribute('stroke', '#10b981'); rectLens.setAttribute('fill', 'color-mix(in srgb, #10b981 8%, var(--ink-1))'); }
      if (lensDiag) { lensDiag.textContent = 'Normal transparente'; lensDiag.setAttribute('fill', '#10b981'); }
      if (toxBox) toxBox.style.display = 'none';
      if (g1pSub) g1pSub.textContent = 'A glucólisis';
    }

    // KPI Cards
    const kpiTagAct = root.querySelector('#kpi-tag-act');
    const kpiValAct = root.querySelector('#kpi-val-act');
    const kpiBarAct = root.querySelector('#kpi-bar-act');
    const kpiFnAct = root.querySelector('#kpi-fn-act');

    if (kpiTagAct) { kpiTagAct.textContent = v.activityPct; kpiTagAct.className = `gala-kpi-tag ${v.badgeType}`; }
    if (kpiValAct) kpiValAct.textContent = v.activityPct;
    if (kpiBarAct) { kpiBarAct.style.width = `${v.activityBar}%`; kpiBarAct.className = `gala-kpi-bar-fill ${v.badgeType}`; }
    if (kpiFnAct) kpiFnAct.textContent = v.activityStatus;

    const kpiTagGal1p = root.querySelector('#kpi-tag-gal1p');
    const kpiValGal1p = root.querySelector('#kpi-val-gal1p');
    const kpiFnGal1p = root.querySelector('#kpi-fn-gal1p');
    if (kpiTagGal1p) { kpiTagGal1p.textContent = v.gal1pLevel === 'danger' ? 'Tóxico Visceral' : v.gal1pLevel === 'warning' ? 'Subclínico' : 'Normal'; kpiTagGal1p.className = `gala-kpi-tag ${v.gal1pLevel}`; }
    if (kpiValGal1p) kpiValGal1p.textContent = v.gal1pVal;
    if (kpiFnGal1p) kpiFnGal1p.textContent = v.gal1pStatus;

    const kpiTagGalactitol = root.querySelector('#kpi-tag-galactitol');
    const kpiValGalactitol = root.querySelector('#kpi-val-galactitol');
    const kpiFnGalactitol = root.querySelector('#kpi-fn-galactitol');
    if (kpiTagGalactitol) { kpiTagGalactitol.textContent = v.galactitolLevel === 'danger' ? 'Hiperosmolar' : 'Fisiológico'; kpiTagGalactitol.className = `gala-kpi-tag ${v.galactitolLevel}`; }
    if (kpiValGalactitol) kpiValGalactitol.textContent = v.galactitolVal;
    if (kpiFnGalactitol) kpiFnGalactitol.textContent = v.galactitolStatus;

    // Pathophysiology text
    const pLens = root.querySelector('#gala-mech-lens-p');
    if (pLens) pLens.textContent = v.mechanismLens;
    const pVisc = root.querySelector('#gala-mech-visceral-p');
    if (pVisc) pVisc.textContent = v.mechanismVisceral;

    // Organ Matrix
    const setOrg = (orgId, riskText, badgeType) => {
      const desc = root.querySelector(`#org-desc-${orgId}`);
      const tag = root.querySelector(`#org-tag-${orgId}`);
      if (desc) desc.textContent = riskText;
      if (tag) {
        tag.textContent = badgeType === 'danger' ? 'Severo' : badgeType === 'warning' ? 'Leve / Vigilancia' : 'Normal';
        tag.className = `gala-status-pill ${badgeType}`;
      }
    };
    setOrg('liver', v.liverRisk, v.liverBadge);
    setOrg('lens', v.lensRisk, v.lensBadge);
    setOrg('ovary', v.ovaryRisk, v.ovaryBadge);
    setOrg('kidney', v.kidneyRisk, v.kidneyBadge);
    setOrg('neuro', v.neuroRisk, v.neuroBadge);
    setOrg('sepsis', v.sepsisRisk, v.sepsisBadge);

    // Management Footer
    const pMgmt = root.querySelector('#gala-mgmt-p');
    if (pMgmt) pMgmt.textContent = v.managementSummary;

    // Focus button label & action
    if (simBtn) {
      const lbl = root.querySelector('#gala-sim-lbl');
      simBtn.style.display = '';
      if (lbl) lbl.textContent = `Enfocar vía de la galactosa en el mapa`;
    }
  }

  // Bind tab clicks
  tabs.forEach(t => {
    t.onclick = () => {
      updateView(t.dataset.var);
    };
  });

  // Bind focus button
  if (simBtn) {
    simBtn.onclick = () => {
      if (actions && typeof actions.focusGalactoseArea === 'function') {
        actions.focusGalactoseArea();
      }
      if (actions && typeof actions.toast === 'function') {
        actions.toast('Vía de la galactosa enfocada en el mapa celular');
      }
    };
  }

  // Initial render
  updateView(defaultVariant);
}
