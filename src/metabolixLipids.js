// @ts-nocheck
/**
 * Suite Clínica de β-Oxidación y Biosíntesis de Ácido Palmítico (Lipogénesis de Novo)
 * Estética: Dashboard Clínico Moderno (Apple Health / Software Médico de Alta Gama)
 * Paleta: Blanco puro, gris titanio y azul marino con acentos sutiles en verde esmeralda.
 */

export const LIPID_ENTITIES = new Set([
  'rx_acc',
  'rx_fas',
  'rx_acyl_coa_synth',
  'rx_cpt1',
  'rx_cact_cpt2',
  'rx_beta_oxidation',
  'rx_citrate_export',
  'rx_acly',
  'palmitate',
  'malonyl_coa',
  'acyl_coa_cyt',
  'acyl_carnitine',
  'acyl_coa_mito',
  'citrate_cyt',
  'acetyl_coa_cyt'
]);

export function isLipidEntity(id) {
  return LIPID_ENTITIES.has(id);
}

export const LIPID_SCENARIOS = {
  sintesis_palmitato: {
    id: 'sintesis_palmitato',
    name: 'Síntesis de Novo (ACC & FASN)',
    title: 'Lipogénesis de Novo · Síntesis de Ácido Palmítico',
    subtitle: 'Complejo FASN de 7 dominios & Carboxilación de Acetil-CoA por ACC1',
    badge: 'Anabolismo Postprandial · Consumo de 14 NADPH',
    badgeType: 'emerald',
    state: 'fed',
    blockRx: null,
    accState: 'active',
    fasnState: 'active',
    cpt1State: 'inhibited',
    betaOxState: 'off',
    shuttleState: 'blocked',
    c8Val: '0.08 µmol/L',
    c8Status: 'Concentración fisiológica basal (Normal: < 0.25 µmol/L)',
    c8Level: 'safe',
    c0RatioVal: '4.8',
    c0RatioStatus: 'Cociente Carnitina libre / Acilcarnitinas equilibrado (Target: 2–8)',
    c0RatioLevel: 'safe',
    cpkVal: '75 U/L',
    cpkStatus: 'Integridad del sarcolema muscular preservada (Normal: 30–190 U/L)',
    cpkLevel: 'safe',
    glucoseVal: '115 mg/dL',
    glucoseStatus: 'Euglucemia postprandial adecuada (absorción activa por enterocitos)',
    glucoseLevel: 'safe',
    ketonesVal: '0.10 mmol/L',
    ketonesStatus: 'Cetogénesis hepática suprimida fisiológicamente por insulina',
    ketonesLevel: 'safe',
    dicarboxylicVal: 'Indetectable',
    dicarboxylicStatus: 'Sin sobrecarga de ω-oxidación microsomal',
    dicarboxylicLevel: 'safe',
    atpBalance: 'Gasto: 7 ATP + 14 NADPH por molécula de Palmitato (C16:0)',
    netATP: '-7 ATP netos directos (anabolismo endergónico reductor)',
    stoichiometry: '1 Acetil-CoA + 7 Malonil-CoA + 14 NADPH + 14 H⁺ → Palmitato (16:0) + 7 CO₂ + 14 NADP⁺ + 8 CoA-SH + 6 H₂O',
    activeDom: 'Dominios FASN: KS (β-cetoacil sintasa), MAT (malonil/acetil-transferasa), DH (deshidratasa), ER (enoil reductasa), KR (β-cetoacil reductasa), ACP (proteína transportadora de acilos), TE (tioesterasa final)',
    crossInhibitionText: 'Control recíproco supremo: La Malonil-CoA generada por la ACC1 inhibe alostéricamente a la CPT-1 en la membrana mitocondrial externa (IC₅₀ ≈ 2.7 µM hepática). Esto impide que los ácidos grasos recién nacidos entren a la mitocondria y se degraden en un ciclo fútil.',
    hormonalText: 'La insulina activa a la proteína fosfatasa 2A (PP2A), que desfosforila la Ser-79 de la Acetil-CoA Carboxilasa 1 (ACC1). Los monómeros inactivos se ensamblan en largos filamentos poliméricos activos estimulados por el citrato citosólico.',
    liverImpact: 'Riesgo de Esteatosis Hepática Metabólica (MASLD/NAFLD) ante exceso crónico de fructosa o carbohidratos simples.',
    liverBadge: 'warning',
    muscleImpact: 'Captación de ácidos grasos para síntesis de triglicéridos intramiocelulares de reserva.',
    muscleBadge: 'safe',
    heartImpact: 'Utilización basal moderada; el miocardio conserva flexibilidad de sustratos.',
    heartBadge: 'safe',
    cnsImpact: 'El palmitato libre no atraviesa la barrera hematoencefálica; el encéfalo depende exclusivamente de la glucosa.',
    cnsBadge: 'safe',
    managementSummary: 'Intervención nutricional orientada a reducir azúcares libres y fructosa líquida. En patología esteatósica: activación de AMPK mediante ejercicio aeróbico continuo y análogos de GLP-1/GIP para refosforilar la ACC1 en Ser-79.',
    guidelineRef: 'Consenso Internacional EASL-aasld-EASD para MASLD & Bioquímica Humana Lehninger 8.ª Ed.'
  },
  betaox_normal: {
    id: 'betaox_normal',
    name: 'β-Oxidación Mitocondrial (Fisiológica)',
    title: 'β-Oxidación Mitocondrial Fisiológica',
    subtitle: 'Lanzadera de Carnitina (CPT-1 / CACT / CPT-2) & Ciclo de 4 Pasos',
    badge: 'Catabolismo Fisiológico · 106 ATP Netos',
    badgeType: 'emerald',
    state: 'fasting',
    blockRx: null,
    accState: 'inhibited',
    fasnState: 'off',
    cpt1State: 'active',
    betaOxState: 'active',
    shuttleState: 'active',
    c8Val: '0.12 µmol/L',
    c8Status: 'Metabolismo óptimo de ácidos grasos de cadena media (Normal: < 0.25 µmol/L)',
    c8Level: 'safe',
    c0RatioVal: '5.1',
    c0RatioStatus: 'Pool de carnitina libre y acilcarnitinas en recambio dinámico',
    c0RatioLevel: 'safe',
    cpkVal: '95 U/L',
    cpkStatus: 'Miocitos oxidando acil-CoA sin distrés del sarcolema',
    cpkLevel: 'safe',
    glucoseVal: '84 mg/dL',
    glucoseStatus: 'Glucemia en ayuno perfectamente estabilizada por gluconeogénesis hepática',
    glucoseLevel: 'safe',
    ketonesVal: '2.40 mmol/L',
    ketonesStatus: 'Cetonemia fisiológica protectora (combustible alternativo para cerebro y corazón)',
    ketonesLevel: 'safe',
    dicarboxylicVal: 'Indetectable',
    dicarboxylicStatus: 'La β-oxidación mitocondrial canaliza el 100% de la carga sin fuga a ω-oxidación',
    dicarboxylicLevel: 'safe',
    atpBalance: '+106 ATP netos por Palmitato (C16:0)',
    netATP: '+106 ATP netos (7 FADH₂ + 7 NADH + 8 Acetil-CoA − 2 enlaces ATP de activación)',
    stoichiometry: 'Palmitoil-CoA + 7 FAD + 7 NAD⁺ + 7 H₂O + 7 CoA-SH → 8 Acetil-CoA + 7 FADH₂ + 7 NADH + 7 H⁺',
    activeDom: '4 Pasos de la Espiral: 1. Deshidrogenación (Acil-CoA DH → FADH₂); 2. Hidratación (Enoil-CoA hidratasa); 3. Deshidrogenación (L-3-HO-acil-CoA DH → NADH); 4. Tiólisis (β-cetotiolasa → Acetil-CoA)',
    crossInhibitionText: 'Desbloqueo DE CPT-1: Al caer los niveles de insulina y elevarse el glucagón y el AMP, la AMPK y la PKA fosforilan a la ACC1 en Ser-79, inactivándola. La Malonil-CoA citosólica cae a niveles basales (< 0.5 µM), liberando el freno alostérico sobre la CPT-1.',
    hormonalText: 'El glucagón, la adrenalina y la activación de AMPK por baja carga energética apagan la síntesis de novo y promueven la translocación masiva de acil-carnitinas a través de la membrana mitocondrial interna mediante el translocador CACT.',
    liverImpact: 'Generación copiosa de ATP y Acetil-CoA indispensable para impulsar la gluconeogénesis y síntesis de cuerpos cetónicos.',
    liverBadge: 'safe',
    muscleImpact: 'Combustible preferente en reposo y ejercicio submáximo, preservando el glucógeno muscular.',
    muscleBadge: 'safe',
    heartImpact: 'El miocardio obtiene > 70% de su producción de ATP continuo a partir de la β-oxidación.',
    heartBadge: 'safe',
    cnsImpact: 'El encéfalo consume con avidez el β-hidroxibutirato y acetoacetato exportados por el hígado.',
    cnsBadge: 'safe',
    managementSummary: 'Adaptación homeostática perfecta al ayuno nocturno o intermitente. La β-oxidación ahorra glucosa y minimiza la degradación de proteínas musculares.',
    guidelineRef: 'Fisiología Médica Boron & Tratado de Medicina Interna de Harrison'
  },
  mcad_deficiency: {
    id: 'mcad_deficiency',
    name: 'Déficit de MCAD (MCADD)',
    title: 'Déficit de Acil-CoA Deshidrogenasa de Cadena Media (MCADD)',
    subtitle: 'El defecto congénito más frecuente de la β-oxidación · Mutación c.985A>G (p.Lys329Glu)',
    badge: 'Urgencia Pediátrica · Hipoglucemia Hipocetósica Grave',
    badgeType: 'danger',
    state: 'blocked_mcad',
    blockRx: 'rx_beta_oxidation',
    accState: 'inhibited',
    fasnState: 'off',
    cpt1State: 'active',
    betaOxState: 'blocked',
    shuttleState: 'active',
    c8Val: '3.65 µmol/L',
    c8Status: 'Octanoilcarnitina (C8) masivamente elevada (Patognomónico; Cutoff cribado: > 0.30 µmol/L)',
    c8Level: 'danger',
    c0RatioVal: '0.35',
    c0RatioStatus: 'Depleción severa de carnitina libre (secuestrada en conjugados de acil-C8 tóxicos)',
    c0RatioLevel: 'danger',
    cpkVal: '380 U/L',
    cpkStatus: 'Elevación moderada por distrés celular y lipotoxicidad durante crisis metabólica',
    cpkLevel: 'warning',
    glucoseVal: '22 mg/dL',
    glucoseStatus: 'Hipoglucemia crítica potencialmente letal (Agotamiento de glucógeno sin ATP para gluconeogénesis)',
    glucoseLevel: 'danger',
    ketonesVal: '0.04 mmol/L',
    ketonesStatus: 'Hipocetosis paradójica grave (Ausencia de Acetil-CoA para formar cuerpos cetónicos)',
    ketonesLevel: 'danger',
    dicarboxylicVal: '490 µg/mg crea',
    dicarboxylicStatus: 'Aciduria dicarboxílica masiva en orina (ácidos adípico C6, subérico C8 y sebácico C10)',
    dicarboxylicLevel: 'danger',
    atpBalance: 'Parada abrupta en cadenas de 6–12 carbonos; colapso energético mitocondrial',
    netATP: '< 30% del rendimiento teórico esperado; imposibilidad de sostener la gluconeogénesis',
    stoichiometry: 'Palmitoil-CoA inicia la espiral pero se estanca en octanoil-CoA (C8); no se liberan los 4 acetil-CoA finales',
    activeDom: 'Bloqueo específico: Acil-CoA Deshidrogenasa de Cadena Media (ACADM, EC 1.3.8.7). Las enzimas VLCAD y SCAD permanecen activas pero son incapaces de procesar sustratos de 8 a 10 carbonos.',
    crossInhibitionText: 'Desviación hacia la ω-OXIDACIÓN Y toxicidad: Al no poder oxidarse en la matriz mitocondrial, los ésteres de octanoil-CoA se hidrolizan y salen al retículo endoplásmico para ser oxidados por el citocromo P450 CYP4A en el carbono terminal ω, produciendo ácidos dicarboxílicos citotóxicos.',
    hormonalText: 'Durante el ayuno prolongado (> 10 h) o un episodio febril, el estrés adrenérgico moviliza ácidos grasos hacia el hígado. El bloqueo metabólico impide la síntesis de Acetil-CoA, privando a la Piruvato Carboxilasa de su activador alostérico obligado, congelando la gluconeogénesis.',
    liverImpact: 'Esteatosis microvesicular hepática aguda, hepatomegalia congestiva e hipertransaminasemia (cuadro similar al Síndrome de Reye).',
    liverBadge: 'danger',
    muscleImpact: 'Hipotonía muscular infantil generalizada, letargia y debilidad proximal aguda.',
    muscleBadge: 'warning',
    heartImpact: 'Riesgo severo de arritmias ventriculares letales y paro cardíaco hipoglucémico (causa reconocida de muerte súbita del lactante, SIDS).',
    heartBadge: 'danger',
    cnsImpact: 'Encefalopatía metabólica profunda, edema cerebral, convulsiones hipoglucémicas y coma.',
    cnsBadge: 'danger',
    managementSummary: '1. Nunca someter a ayuno prolongado (> 4 h en neonatos, > 10 h en escolares). 2. Aporte inmediato de Dextrosa al 10% IV o carbohidratos complejos (almidón de maíz crudo) ante cualquier infección febril o vómitos. 3. Suplementación con L-Carnitina monitorizada para reponer el pool libre secuestrado. 4. Portar identificación de emergencia metabólica 24/7.',
    guidelineRef: 'Guía Clínica de Consenso ACMG & Red Europea de Enfermedades Metabólicas (MetabERN)'
  },
  cpt2_deficiency: {
    id: 'cpt2_deficiency',
    name: 'Déficit de CPT-2 (Miopatía / Rabdomiólisis)',
    title: 'Déficit de Carnitina Palmitoiltransferasa 2 (Forma Miopática del Adulto)',
    subtitle: 'Fallo de regeneración de Acil-CoA en matriz mitocondrial muscular · Mutación p.Ser113Leu',
    badge: 'Miopatía Metabólica · Rabdomiólisis Paroxística',
    badgeType: 'warning',
    state: 'blocked_cpt2',
    blockRx: 'rx_cact_cpt2',
    accState: 'inhibited',
    fasnState: 'off',
    cpt1State: 'active',
    betaOxState: 'reduced',
    shuttleState: 'blocked',
    c8Val: '0.11 µmol/L',
    c8Status: 'Cadena media normal dentro de la mitocondria',
    c8Level: 'safe',
    c0RatioVal: '1.20',
    c0RatioStatus: 'Acilcarnitinas de cadena larga (C16, C18:1) acumuladas en plasma',
    c0RatioLevel: 'warning',
    cpkVal: '52,400 U/L',
    cpkStatus: 'Rabdomiólisis masiva con riesgo de fracaso renal agudo (Normal: 30–190 U/L)',
    cpkLevel: 'danger',
    glucoseVal: '76 mg/dL',
    glucoseStatus: 'Glucemia conservada en adultos (forma miopática sin fallo gluconeogénico)',
    glucoseLevel: 'safe',
    ketonesVal: '0.50 mmol/L',
    ketonesStatus: 'Reserva cetogénica disminuida ante ejercicio extenuante',
    ketonesLevel: 'warning',
    dicarboxylicVal: 'Normal',
    dicarboxylicStatus: 'Sin aciduria dicarboxílica típica de los defectos de cadena media',
    dicarboxylicLevel: 'safe',
    atpBalance: 'Colapso bioenergético selectivo del miocito en ejercicio aeróbico prolongado',
    netATP: 'Agotamiento agudo de ATP sarcolémico con despolarización de membrana',
    stoichiometry: 'Palmitoil-carnitina no puede liberar el grupo palmitoilo hacia la CoASH intramitocondrial',
    activeDom: 'Bloqueo en CPT-2 (EC 2.3.1.21), enzima situada en la cara interna de la membrana mitocondrial interna. La isoforma CPT-1 permanece activa conjugando acilos con carnitina.',
    crossInhibitionText: 'Atrapamiento de palmitoil-carnitina: La carnitina queda esterificada con ácidos grasos de cadena larga que no pueden ser desacilados en la matriz. Las acilcarnitinas C16 y C18:1 se fugan al plasma y constituyen el perfil diagnóstico en espectrometría de masas.',
    hormonalText: 'Precipitantes clásicos: Ejercicio físico extenuante continuo, ayuno, exposición al frío ambiental o fiebre. Al agotarse el glucógeno muscular, las fibras tipo I no disponen de ATP de la β-oxidación, entrando en necrosis celular aguda.',
    liverImpact: 'Función hepática preservada en la forma adulta clásica (a diferencia de la forma letal neonatal multisistémica).',
    liverBadge: 'safe',
    muscleImpact: 'Mialgias paroxísticas agudas, rigidez contractural severa, edema muscular y necrosis del sarcolema.',
    muscleBadge: 'danger',
    heartImpact: 'Generalmente respetado en la variante miopática adulta; vigilancia en episodios de rabdomiólisis extrema por hiperpotasemia.',
    heartBadge: 'warning',
    cnsImpact: 'Sensorio conservado; dolor musculoesquelético lacerante.',
    cnsBadge: 'safe',
    managementSummary: '1. Hidratación endovenosa masiva alcalinizada con bicarbonato sódico (objetivo: pH urinario > 7.0 para solubilizar el ferrihemato y prevenir la necrosis tubular aguda). 2. Dieta hiperglucídica antes y durante el esfuerzo físico. 3. Suplementación con Triglicéridos de Cadena Media (MCT) o Triheptanoína.',
    guidelineRef: 'Guía Clínica Internacional de Miopatías Metabólicas (EOMD) & Consenso de Rabdomiólisis'
  },
  cpt1a_deficiency: {
    id: 'cpt1a_deficiency',
    name: 'Déficit de CPT-1A (Hepático)',
    title: 'Déficit de Carnitina Palmitoiltransferasa 1A (Isoenzima Hepática)',
    subtitle: 'Fallo de entrada a la lanzadera de carnitina en hepatocitos · Gen CPT1A (p.Pro479Leu)',
    badge: 'Carnitina Libre Elevada · Hipoglucemia Hipocetósica Neonatal',
    badgeType: 'danger',
    state: 'blocked_cpt1',
    blockRx: 'rx_cpt1',
    accState: 'inhibited',
    fasnState: 'off',
    cpt1State: 'blocked',
    betaOxState: 'off',
    shuttleState: 'blocked',
    c8Val: '0.04 µmol/L',
    c8Status: 'Ausencia total de intermediarios acil-CoA mitocondriales derivados de cadena larga',
    c8Level: 'safe',
    c0RatioVal: '148.0',
    c0RatioStatus: 'Cociente C0 / (C16 + C18) > 100 patognomónico (Carnitina libre sérica muy elevada)',
    c0RatioLevel: 'danger',
    cpkVal: '88 U/L',
    cpkStatus: 'Músculo esquelético indemne (expresa la isoenzima independiente CPT-1B)',
    cpkLevel: 'safe',
    glucoseVal: '26 mg/dL',
    glucoseStatus: 'Hipoglucemia grave en ayunas (Sin soporte de Acetil-CoA para gluconeogénesis)',
    glucoseLevel: 'danger',
    ketonesVal: '0.02 mmol/L',
    ketonesStatus: 'Cetogénesis hepática NULA (Hipocetosis profunda)',
    ketonesLevel: 'danger',
    dicarboxylicVal: 'Moderada',
    dicarboxylicStatus: 'Derivación periférica a ω-oxidación microsomal hepática',
    dicarboxylicLevel: 'warning',
    atpBalance: 'Incapacidad absoluta del hepatocito para extraer energía de grasas en ayuno',
    netATP: '0 ATP derivados de ácidos grasos de cadena larga',
    stoichiometry: 'Palmitoil-CoA citosólico no puede conjugarse con L-carnitina; se acumula en el citosol',
    activeDom: 'Bloqueo exclusivo en CPT-1A (hepática/renal). La isoenzima CPT-1B (músculo y corazón) está codificada por otro gen y no se ve afectada.',
    crossInhibitionText: 'Biomarcador opuesto AL resto de errores congénitos: En todos los demás defectos de la β-oxidación la carnitina libre se agota. En el déficit de CPT-1A, al no consumirse en el hepatocito, la Carnitina Libre (C0) en sangre se encuentra extraordinariamente elevada.',
    hormonalText: 'El hepatocito es incapaz de responder al estímulo del glucagón en ayunas. El piruvato no puede carboxilarse a oxalacetato con suficiente rapidez y el lactato citosólico se acumula.',
    liverImpact: 'Hepatomegalia esteatósica masiva difusa, elevación aguda de transaminasas e hiperamonemia secundaria.',
    liverBadge: 'danger',
    muscleImpact: 'Músculo esquelético completamente normal (expresa la isoforma CPT-1B indemne).',
    muscleBadge: 'safe',
    heartImpact: 'Miocardio funcionalmente respetado (expresa la isoforma CPT-1B).',
    heartBadge: 'safe',
    cnsImpact: 'Encefalopatía hipoglucémica con convulsiones y coma durante periodos de ayuno o diarrea.',
    cnsBadge: 'danger',
    managementSummary: '1. Evitar estrictamente ayunos prolongados con tomas nocturnas frecuentes. 2. Administración obligatoria de Triglicéridos de Cadena Media (MCT): los ácidos grasos octanoato (C8) y decanoato (C10) difunden libremente a través de la membrana mitocondrial sin requerir CPT-1, restaurando la cetogénesis y el ATP hepático. 3. Contraindicada la suplementación con carnitina.',
    guidelineRef: 'Protocolos de Diagnóstico y Tratamiento de Errores Congénitos del Metabolismo (AECOM)'
  }
};

let currentScenarioId = 'sintesis_palmitato';

export function renderLipidClinicalSuite(selectedId) {
  // Pre-select scenario based on clicked entity
  let defaultScenario = 'sintesis_palmitato';
  if (selectedId === 'rx_cpt1') defaultScenario = 'cpt1a_deficiency';
  else if (selectedId === 'rx_cact_cpt2' || selectedId === 'acyl_carnitine') defaultScenario = 'cpt2_deficiency';
  else if (selectedId === 'rx_beta_oxidation' || selectedId === 'acyl_coa_mito') defaultScenario = 'mcad_deficiency';
  else if (selectedId === 'palmitate' || selectedId === 'malonyl_coa' || selectedId === 'rx_acc' || selectedId === 'rx_fas') defaultScenario = 'sintesis_palmitato';
  else defaultScenario = currentScenarioId || 'sintesis_palmitato';

  const sc = LIPID_SCENARIOS[defaultScenario] || LIPID_SCENARIOS.sintesis_palmitato;

  return `
  <div class="lipid-suite" id="lipid-suite-root" data-current-sc="${sc.id}">
    <!-- Cabecera Apple Health Titanium -->
    <div class="lipid-header">
      <div class="lipid-pill-kicker">
        <span class="lipid-pulse-dot"></span>
        <span>Dashboard clínico · metabolismo lipídico</span>
      </div>
      <div class="lipid-title-row">
        <h3 class="lipid-main-title">β-Oxidación & síntesis de palmitato</h3>
        <span class="lipid-badge ${sc.badgeType}">${sc.badge}</span>
      </div>
      <p class="lipid-subtitle">${sc.subtitle}</p>

      <!-- Selector Segmentado Apple Health -->
      <div class="lipid-segmented-control" role="tablist" aria-label="Escenarios Metabólicos Lipídicos">
        <button class="lipid-segment-btn ${sc.id === 'sintesis_palmitato' ? 'active' : ''}" data-lipid-sc="sintesis_palmitato">
          <span class="seg-dot green"></span>
          <span>1. Síntesis (FASN/ACC)</span>
        </button>
        <button class="lipid-segment-btn ${sc.id === 'betaox_normal' ? 'active' : ''}" data-lipid-sc="betaox_normal">
          <span class="seg-dot blue"></span>
          <span>2. β-Oxidación (Ayuno)</span>
        </button>
        <button class="lipid-segment-btn ${sc.id === 'mcad_deficiency' ? 'active' : ''}" data-lipid-sc="mcad_deficiency">
          <span class="seg-dot red"></span>
          <span>3. Déficit de MCAD</span>
        </button>
        <button class="lipid-segment-btn ${sc.id === 'cpt2_deficiency' ? 'active' : ''}" data-lipid-sc="cpt2_deficiency">
          <span class="seg-dot amber"></span>
          <span>4. CPT-2 (Miopatía)</span>
        </button>
        <button class="lipid-segment-btn ${sc.id === 'cpt1a_deficiency' ? 'active' : ''}" data-lipid-sc="cpt1a_deficiency">
          <span class="seg-dot red"></span>
          <span>5. CPT-1A (Hepático)</span>
        </button>
      </div>
    </div>

    <!-- Esquema Vectorial Clínico SVG Ultra-Nítido -->
    <div class="lipid-schematic-card">
      <div class="lipid-card-header">
        <div class="lipid-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>Arquitectura compartimental & lanzadera de carnitina</span>
        </div>
        <div class="lipid-legend">
          <span class="leg-item"><i class="leg-swatch green"></i> Síntesis citosólica</span>
          <span class="leg-item"><i class="leg-swatch blue"></i> Transporte / matriz</span>
          <span class="leg-item"><i class="leg-swatch red"></i> Bloqueo / inhibición</span>
        </div>
      </div>

      <div class="lipid-svg-container" id="lipid-svg-box">
        ${renderLipidSVG(sc)}
      </div>

      <div class="lipid-banner-cross" id="lipid-cross-banner">
        <div class="cross-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="cross-content">
          <b>Regulación alostérica cruzada:</b>
          <p id="lipid-cross-text">${sc.crossInhibitionText}</p>
        </div>
      </div>
    </div>

    <!-- Tarjetas de Datos Deslizables (Apple Health KPI Deck) -->
    <div class="lipid-kpi-deck">
      <!-- Tarjeta 1: Espectrometría de Masas (Acilcarnitinas) -->
      <div class="lipid-kpi-card" id="lipid-card-ms">
        <div class="kpi-top">
          <span class="kpi-label">Tandem MS/MS · acilcarnitinas</span>
          <span class="kpi-tag ${sc.c8Level}">${sc.c8Level === 'danger' ? 'Alerta crítica' : sc.c8Level === 'warning' ? 'Anormal' : 'Rango óptimo'}</span>
        </div>
        <div class="kpi-metric-main">
          <div class="kpi-val mono" id="kpi-c8-val">${sc.c8Val}</div>
          <div class="kpi-unit">C8-Octanoilcarnitina</div>
        </div>
        <div class="kpi-status-txt" id="kpi-c8-status">${sc.c8Status}</div>
        <div class="kpi-bar-track">
          <div class="kpi-bar-fill ${sc.c8Level}" style="width: ${sc.c8Level === 'danger' ? '92%' : sc.c8Level === 'warning' ? '55%' : '18%'}"></div>
        </div>
        <div class="kpi-meta-row">
          <span>Cociente C0/(C16+C18): <b class="mono" id="kpi-c0-ratio">${sc.c0RatioVal}</b></span>
          <span>CPK: <b class="mono" id="kpi-cpk-val">${sc.cpkVal}</b></span>
        </div>
      </div>

      <!-- Tarjeta 2: Glucosa y Cetonemia Plasmática -->
      <div class="lipid-kpi-card" id="lipid-card-glucose">
        <div class="kpi-top">
          <span class="kpi-label">Homeostasis glucídica & cuerpos cetónicos</span>
          <span class="kpi-tag ${sc.glucoseLevel}">${sc.glucoseLevel === 'danger' ? 'Hipoglucemia' : 'Normal'}</span>
        </div>
        <div class="kpi-metric-main">
          <div class="kpi-val mono" id="kpi-glucose-val">${sc.glucoseVal}</div>
          <div class="kpi-unit">Glucemia plasmática</div>
        </div>
        <div class="kpi-status-txt" id="kpi-glucose-status">${sc.glucoseStatus}</div>
        <div class="kpi-grid-sub">
          <div class="sub-col">
            <span class="sub-lbl">Cuerpos cetónicos</span>
            <span class="sub-val mono" id="kpi-ketones-val">${sc.ketonesVal}</span>
            <small id="kpi-ketones-status">${sc.ketonesStatus}</small>
          </div>
          <div class="sub-col">
            <span class="sub-lbl">Aciduria dicarboxílica</span>
            <span class="sub-val mono" id="kpi-dicarboxylic-val">${sc.dicarboxylicVal}</span>
            <small id="kpi-dicarboxylic-status">${sc.dicarboxylicStatus}</small>
          </div>
        </div>
      </div>

      <!-- Tarjeta 3: Rendimiento Bioenergético y Estequiometría -->
      <div class="lipid-kpi-card" id="lipid-card-atp">
        <div class="kpi-top">
          <span class="kpi-label">Bioenergética del palmitato (C16:0)</span>
          <span class="kpi-tag emerald">106 ATP netos</span>
        </div>
        <div class="kpi-metric-main">
          <div class="kpi-val mono" id="kpi-atp-val">${sc.netATP}</div>
          <div class="kpi-unit">Rendimiento por molécula</div>
        </div>
        <div class="kpi-status-txt" id="kpi-atp-status">${sc.atpBalance}</div>
        <div class="kpi-stoich-box" id="kpi-stoich-box">
          <div class="stoich-label">Estequiometría reaccional:</div>
          <div class="stoich-eq mono" id="kpi-stoich-eq">${sc.stoichiometry}</div>
        </div>
      </div>
    </div>

    <!-- Matriz de Daño y Afectación Multiorgánica -->
    <div class="lipid-organ-card">
      <div class="lipid-card-header">
        <div class="lipid-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span>Matriz de afectación tisular & fisiopatología</span>
        </div>
        <span class="lipid-badge-sub">Fenotipo clínico por órgano</span>
      </div>

      <div class="lipid-organ-grid">
        <div class="organ-tile">
          <div class="organ-tile-top">
            <div class="organ-name">
              <span class="organ-icon">Hí</span>
              <b>Hígado & cetogénesis</b>
            </div>
            <span class="organ-badge ${sc.liverBadge}" id="org-badge-liver">${sc.liverBadge.toUpperCase()}</span>
          </div>
          <p class="organ-desc" id="org-desc-liver">${sc.liverImpact}</p>
        </div>

        <div class="organ-tile">
          <div class="organ-tile-top">
            <div class="organ-name">
              <span class="organ-icon">Mú</span>
              <b>Músculo esquelético</b>
            </div>
            <span class="organ-badge ${sc.muscleBadge}" id="org-badge-muscle">${sc.muscleBadge.toUpperCase()}</span>
          </div>
          <p class="organ-desc" id="org-desc-muscle">${sc.muscleImpact}</p>
        </div>

        <div class="organ-tile">
          <div class="organ-tile-top">
            <div class="organ-name">
              <span class="organ-icon">Hí</span>
              <b>Miocardio</b>
            </div>
            <span class="organ-badge ${sc.heartBadge}" id="org-badge-heart">${sc.heartBadge.toUpperCase()}</span>
          </div>
          <p class="organ-desc" id="org-desc-heart">${sc.heartImpact}</p>
        </div>

        <div class="organ-tile">
          <div class="organ-tile-top">
            <div class="organ-name">
              <span class="organ-icon">Ce</span>
              <b>Sistema nervioso central</b>
            </div>
            <span class="organ-badge ${sc.cnsBadge}" id="org-badge-cns">${sc.cnsBadge.toUpperCase()}</span>
          </div>
          <p class="organ-desc" id="org-desc-cns">${sc.cnsImpact}</p>
        </div>
      </div>
    </div>

    <!-- Mecanismos Moleculares y Guías Clínicas -->
    <div class="lipid-clinical-footer">
      <div class="protocol-box">
        <div class="protocol-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Pauta de manejo clínico & recomendaciones</span>
        </div>
        <p class="protocol-text" id="lipid-protocol-text">${sc.managementSummary}</p>
        <div class="protocol-ref" id="lipid-protocol-ref">${sc.guidelineRef}</div>
      </div>

      <div class="lipid-actions-bar">
        <button class="lipid-btn-primary" id="lipid-sim-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Enfocar ruta de lípidos en el mapa celular</span>
        </button>
      </div>
    </div>
  </div>
  `;
}

function renderLipidSVG(sc) {
  const isSintesis = sc.id === 'sintesis_palmitato';
  const isBetaOx = sc.id === 'betaox_normal';
  const isMCAD = sc.id === 'mcad_deficiency';
  const isCPT2 = sc.id === 'cpt2_deficiency';
  const isCPT1A = sc.id === 'cpt1a_deficiency';

  const accColor = isSintesis ? 'var(--pw-lipid, #10b981)' : '#94a3b8';
  const fasnColor = isSintesis ? 'var(--pw-lipid, #10b981)' : '#94a3b8';
  const cpt1Color = isCPT1A ? '#ef4444' : (isSintesis ? '#ef4444' : '#0284c7');
  const cactColor = isCPT2 ? '#f59e0b' : '#0284c7';
  const mcadColor = isMCAD ? '#ef4444' : (isBetaOx ? '#10b981' : '#94a3b8');

  return `
  <svg viewBox="0 0 940 440" width="100%" height="auto" class="lipid-svg-root" preserveAspectRatio="xMidYMid meet">
    <defs>
      <!-- Gradientes Clínicos -->
      <linearGradient id="grad-cyto" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="grad-mito" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="grad-mem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="50%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>

      <!-- Marcadores de Flechas -->
      <marker id="arr-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
        <path d="M0 1.5L8 5L0 8.5z" fill="#10b981"/>
      </marker>
      <marker id="arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
        <path d="M0 1.5L8 5L0 8.5z" fill="#0284c7"/>
      </marker>
      <marker id="arr-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
        <path d="M0 1.5L8 5L0 8.5z" fill="#ef4444"/>
      </marker>
      <marker id="stop-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <line x1="5" y1="1" x2="5" y2="9" stroke="#ef4444" stroke-width="3"/>
      </marker>
    </defs>

    <!-- zonas compartimentales -->
    <!-- Citosol -->
    <rect x="15" y="15" width="470" height="410" rx="16" fill="url(#grad-cyto)" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="35" y="42" font-family="Instrument Sans, sans-serif" font-size="12" font-weight="700" fill="#0f172a" letter-spacing="0.5">Citosol · lipogénesis de novo</text>
    <text x="35" y="58" font-family="Instrument Sans, sans-serif" font-size="10" fill="#64748b">Hepatocito / adipocito · estado postprandial</text>

    <!-- Membranas y Espacio Intermembrana (Shuttle de Carnitina) -->
    <rect x="500" y="15" width="105" height="410" rx="12" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="4 3" stroke-width="1.2"/>
    <text x="552" y="38" font-family="Instrument Sans, sans-serif" font-size="9.5" font-weight="700" fill="#475569" text-anchor="middle">OMM / IMS / IMM</text>
    <text x="552" y="52" font-family="Instrument Sans, sans-serif" font-size="8.5" fill="#94a3b8" text-anchor="middle">Lanzadera carnitina</text>

    <!-- Matriz Mitocondrial -->
    <rect x="620" y="15" width="305" height="410" rx="16" fill="url(#grad-mito)" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="640" y="42" font-family="Instrument Sans, sans-serif" font-size="12" font-weight="700" fill="#0f172a" letter-spacing="0.5">Matriz mitocondrial</text>
    <text x="640" y="58" font-family="Instrument Sans, sans-serif" font-size="10" fill="#64748b">β-Oxidación · 4 pasos cíclicos</text>

    <!-- ruta 1: Citosólica (síntesis de palmitato) -->
    <!-- Nodo Citrato Citosólico -->
    <g class="lipid-svg-node" transform="translate(35, 80)">
      <rect width="100" height="38" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <text x="50" y="20" font-family="Instrument Sans, sans-serif" font-size="11" font-weight="600" fill="#0f172a" text-anchor="middle">Citrato (cit)</text>
      <text x="50" y="32" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#64748b" text-anchor="middle">6 Carbonos</text>
    </g>

    <!-- Flecha Citrato -> Acetil-CoA cit (ACLY) -->
    <path d="M 135 99 L 165 99" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr-green)"/>
    <text x="150" y="88" font-family="Instrument Sans, sans-serif" font-size="8.5" font-weight="600" fill="#059669" text-anchor="middle">ACLY</text>

    <!-- Nodo Acetil-CoA Citosólica -->
    <g class="lipid-svg-node" transform="translate(170, 80)">
      <rect width="110" height="38" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <text x="55" y="20" font-family="Instrument Sans, sans-serif" font-size="11" font-weight="600" fill="#0f172a" text-anchor="middle">Acetil-CoA (cit)</text>
      <text x="55" y="32" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#64748b" text-anchor="middle">2C · Bloque inicial</text>
    </g>

    <!-- Flecha ACC1 con cofactores y hormonas -->
    <path d="M 280 99 L 325 99" fill="none" stroke="${accColor}" stroke-width="${isSintesis ? '3' : '1.8'}" marker-end="url(#arr-green)"/>
    <g transform="translate(282, 60)">
      <rect width="42" height="18" rx="4" fill="${isSintesis ? '#dcfce7' : '#f1f5f9'}" stroke="${accColor}" stroke-width="1"/>
      <text x="21" y="12" font-family="Instrument Sans, sans-serif" font-size="9" font-weight="700" fill="${isSintesis ? '#15803d' : '#64748b'}" text-anchor="middle">ACC1</text>
    </g>
    <text x="303" y="120" font-family="JetBrains Mono, monospace" font-size="7.5" fill="#64748b" text-anchor="middle">+ HCO₃⁻ + ATP</text>
    <text x="303" y="130" font-family="Instrument Sans, sans-serif" font-size="7.5" fill="${isSintesis ? '#16a34a' : '#94a3b8'}" text-anchor="middle">${isSintesis ? 'Insulina: PP2A' : 'AMPK: Fosforilada'}</text>

    <!-- Nodo Malonil-CoA (Encrucijada Clave) -->
    <g class="lipid-svg-node" transform="translate(330, 80)">
      <rect width="135" height="42" rx="8" fill="${isSintesis ? '#f0fdf4' : '#ffffff'}" stroke="${isSintesis ? '#10b981' : '#cbd5e1'}" stroke-width="${isSintesis ? '2' : '1.2'}"/>
      <text x="67" y="20" font-family="Instrument Sans, sans-serif" font-size="11.5" font-weight="700" fill="${isSintesis ? '#065f46' : '#0f172a'}" text-anchor="middle">Malonil-CoA</text>
      <text x="67" y="34" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${isSintesis ? '#059669' : '#64748b'}" text-anchor="middle">3 Carbonos · regulador</text>
    </g>

    <!-- Flecha Malonil-CoA -> FASN -->
    <path d="M 397 122 L 397 170" fill="none" stroke="${fasnColor}" stroke-width="${isSintesis ? '3' : '1.8'}" marker-end="url(#arr-green)"/>

    <!-- Complejo Gigante FASN (Ácido Graso Sintasa) -->
    <g class="lipid-svg-fasn" transform="translate(295, 175)">
      <rect width="205" height="66" rx="10" fill="${isSintesis ? '#ecfdf5' : '#ffffff'}" stroke="${fasnColor}" stroke-width="${isSintesis ? '2' : '1.2'}"/>
      <text x="102" y="20" font-family="Instrument Sans, sans-serif" font-size="11" font-weight="700" fill="${isSintesis ? '#047857' : '#0f172a'}" text-anchor="middle">Ácido graso sintasa (FASN)</text>
      <text x="102" y="34" font-family="JetBrains Mono, monospace" font-size="8" fill="${isSintesis ? '#059669' : '#64748b'}" text-anchor="middle">KS · MAT · DH · ER · KR · ACP · TE</text>
      <rect x="18" y="42" width="169" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
      <text x="102" y="53" font-family="JetBrains Mono, monospace" font-size="8" font-weight="600" fill="#0284c7" text-anchor="middle">Consume 14 NADPH + 7 ATP</text>
    </g>

    <!-- Flecha FASN -> Palmitato -->
    <path d="M 397 241 L 397 280" fill="none" stroke="${fasnColor}" stroke-width="${isSintesis ? '3' : '1.8'}" marker-end="url(#arr-green)"/>

    <!-- Nodo Palmitato (C16:0) -->
    <g class="lipid-svg-node" transform="translate(325, 282)">
      <rect width="145" height="42" rx="8" fill="${isSintesis ? '#dcfce7' : '#ffffff'}" stroke="${isSintesis ? '#10b981' : '#cbd5e1'}" stroke-width="${isSintesis ? '2' : '1.2'}"/>
      <text x="72" y="20" font-family="Instrument Sans, sans-serif" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">Palmitato (C16:0)</text>
      <text x="72" y="34" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#64748b" text-anchor="middle">Ácido graso libre · 16 C</text>
    </g>

    <!-- Flecha Palmitato -> Palmitoil-CoA (ACSL) -->
    <path d="M 397 324 L 397 365" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr-green)"/>
    <text x="350" y="348" font-family="Instrument Sans, sans-serif" font-size="8.5" font-weight="600" fill="#475569" text-anchor="end">ACSL (ATP → AMP + PPi)</text>

    <!-- Nodo Palmitoil-CoA citosólico -->
    <g class="lipid-svg-node" transform="translate(320, 370)">
      <rect width="155" height="38" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <text x="77" y="19" font-family="Instrument Sans, sans-serif" font-size="11" font-weight="600" fill="#0f172a" text-anchor="middle">Palmitoil-CoA (cit)</text>
      <text x="77" y="31" font-family="JetBrains Mono, monospace" font-size="8" fill="#64748b" text-anchor="middle">Activado · Listo para lanzadera</text>
    </g>

    <!-- ARCO de inhibición alostérica cruzada (maloniL-CoA -| CPT-1) -->
    <path d="M 465 101 C 520 101, 520 230, 520 280 L 520 300" fill="none" stroke="#ef4444" stroke-width="${isSintesis ? '2.5' : '1.2'}" stroke-dasharray="${isSintesis ? 'none' : '3 3'}" marker-end="url(#stop-red)"/>
    <g transform="translate(480, 150)">
      <rect width="70" height="26" rx="4" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
      <text x="35" y="12" font-family="Instrument Sans, sans-serif" font-size="7.5" font-weight="700" fill="#dc2626" text-anchor="middle">Inhibición</text>
      <text x="35" y="21" font-family="JetBrains Mono, monospace" font-size="7" fill="#b91c1c" text-anchor="middle">Malonil ⊣ CPT1</text>
    </g>

    <!-- ruta 2: Lanzadera de carnitina -->
    <!-- Enzima CPT-1 en la Membrana Mitocondrial Externa -->
    <g transform="translate(506, 310)">
      <rect width="92" height="42" rx="6" fill="${cpt1Color === '#ef4444' ? '#fee2e2' : '#e0f2fe'}" stroke="${cpt1Color}" stroke-width="${isCPT1A ? '2.5' : '1.5'}"/>
      <text x="46" y="18" font-family="Instrument Sans, sans-serif" font-size="10.5" font-weight="700" fill="${cpt1Color === '#ef4444' ? '#b91c1c' : '#0369a1'}" text-anchor="middle">CPT-1 (OMM)</text>
      <text x="46" y="32" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${cpt1Color === '#ef4444' ? '#dc2626' : '#0284c7'}" text-anchor="middle">${isCPT1A ? 'Bloqueo (<5%)' : isSintesis ? 'Frenada por Malonil' : 'Desinhibida'}</text>
    </g>

    <!-- Flecha Palmitoil-CoA cit -> CPT-1 -> Palmitoil-Carnitina -->
    <path d="M 475 389 L 510 389 L 510 355" fill="none" stroke="${isCPT1A || isSintesis ? '#ef4444' : '#0284c7'}" stroke-width="2" marker-end="url(#arr-blue)"/>

    <!-- Translocador CACT en IMM -->
    <g transform="translate(506, 210)">
      <rect width="92" height="42" rx="6" fill="${isCPT2 ? '#fef3c7' : '#f8fafc'}" stroke="${cactColor}" stroke-width="1.5"/>
      <text x="46" y="18" font-family="Instrument Sans, sans-serif" font-size="10" font-weight="700" fill="#334155" text-anchor="middle">CACT (IMM)</text>
      <text x="46" y="32" font-family="JetBrains Mono, monospace" font-size="7.5" fill="#64748b" text-anchor="middle">Antiporte carnitina</text>
    </g>

    <!-- Enzima CPT-2 en Matriz (Cara interna IMM) -->
    <g transform="translate(506, 120)">
      <rect width="92" height="42" rx="6" fill="${isCPT2 ? '#fee2e2' : '#e0f2fe'}" stroke="${isCPT2 ? '#ef4444' : '#0284c7'}" stroke-width="${isCPT2 ? '2.5' : '1.5'}"/>
      <text x="46" y="18" font-family="Instrument Sans, sans-serif" font-size="10.5" font-weight="700" fill="${isCPT2 ? '#b91c1c' : '#0369a1'}" text-anchor="middle">CPT-2 (IMM)</text>
      <text x="46" y="32" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${isCPT2 ? '#dc2626' : '#0284c7'}" text-anchor="middle">${isCPT2 ? 'Deficit miopático' : 'Regenera Acil-CoA'}</text>
    </g>

    <!-- Flechas del Transporte de Carnitina hacia la matriz -->
    <path d="M 552 310 L 552 255" fill="none" stroke="${isCPT1A ? '#94a3b8' : '#0284c7'}" stroke-width="2" marker-end="url(#arr-blue)"/>
    <path d="M 552 210 L 552 165" fill="none" stroke="${isCPT2 ? '#ef4444' : '#0284c7'}" stroke-width="2" marker-end="url(#arr-blue)"/>
    <path d="M 598 141 L 635 141" fill="none" stroke="${isCPT2 ? '#ef4444' : '#0284c7'}" stroke-width="2" marker-end="url(#arr-blue)"/>

    <!-- ruta 3: Matriz mitocondrial (espiral de β-OXIDACIÓN) -->
    <!-- Nodo Palmitoil-CoA mitocondrial -->
    <g class="lipid-svg-node" transform="translate(640, 120)">
      <rect width="145" height="42" rx="8" fill="#ffffff" stroke="${isBetaOx ? '#10b981' : '#cbd5e1'}" stroke-width="${isBetaOx ? '2' : '1.2'}"/>
      <text x="72" y="20" font-family="Instrument Sans, sans-serif" font-size="11.5" font-weight="700" fill="#0f172a" text-anchor="middle">Palmitoil-CoA (mat)</text>
      <text x="72" y="34" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#64748b" text-anchor="middle">16 Carbonos · En matriz</text>
    </g>

    <!-- Flecha hacia Paso 1 (Deshidrogenación MCAD/VLCAD) -->
    <path d="M 712 162 L 712 195" fill="none" stroke="${mcadColor}" stroke-width="${isBetaOx ? '2.5' : '1.8'}" marker-end="url(#arr-blue)"/>

    <!-- Paso 1: Acil-CoA Deshidrogenasa (MCAD/VLCAD) -->
    <g transform="translate(640, 200)">
      <rect width="145" height="46" rx="8" fill="${isMCAD ? '#fee2e2' : '#ffffff'}" stroke="${mcadColor}" stroke-width="${isMCAD ? '2.5' : '1.5'}"/>
      <text x="72" y="18" font-family="Instrument Sans, sans-serif" font-size="10.5" font-weight="700" fill="${isMCAD ? '#b91c1c' : '#0f172a'}" text-anchor="middle">1. Acil-CoA DH (MCAD)</text>
      <text x="72" y="30" font-family="JetBrains Mono, monospace" font-size="8" fill="${isMCAD ? '#dc2626' : '#059669'}" text-anchor="middle">${isMCAD ? 'Bloqueo en C6–C12' : 'FAD → FADH₂ (a CoQ)'}</text>
      <text x="72" y="40" font-family="Instrument Sans, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Rinde 1.5 ATP vía ETF</text>
    </g>

    <!-- Flecha hacia Paso 2 (Hidratación) -->
    <path d="M 785 223 L 815 223" fill="none" stroke="${isBetaOx ? '#10b981' : '#94a3b8'}" stroke-width="1.8" marker-end="url(#arr-blue)"/>

    <!-- Paso 2 & 3: Hidratación y 2ª Deshidrogenación -->
    <g transform="translate(820, 195)">
      <rect width="95" height="56" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <text x="47" y="16" font-family="Instrument Sans, sans-serif" font-size="9.5" font-weight="600" fill="#0f172a" text-anchor="middle">2. Hidratasa</text>
      <text x="47" y="27" font-family="JetBrains Mono, monospace" font-size="7.5" fill="#64748b" text-anchor="middle">+ H₂O</text>
      <line x1="8" y1="31" x2="87" y2="31" stroke="#f1f5f9"/>
      <text x="47" y="42" font-family="Instrument Sans, sans-serif" font-size="9.5" font-weight="600" fill="#0f172a" text-anchor="middle">3. 3-HO DH</text>
      <text x="47" y="52" font-family="JetBrains Mono, monospace" font-size="7.5" fill="#0284c7" text-anchor="middle">NAD⁺ → NADH</text>
    </g>

    <!-- Flecha hacia Paso 4 (Tiolasa) -->
    <path d="M 867 251 L 867 285 L 805 285" fill="none" stroke="${isBetaOx ? '#10b981' : '#94a3b8'}" stroke-width="1.8" marker-end="url(#arr-blue)"/>

    <!-- Paso 4: β-Cetotiolasa -->
    <g transform="translate(640, 270)">
      <rect width="160" height="44" rx="8" fill="#ffffff" stroke="${isBetaOx ? '#10b981' : '#cbd5e1'}" stroke-width="${isBetaOx ? '2' : '1.2'}"/>
      <text x="80" y="18" font-family="Instrument Sans, sans-serif" font-size="10.5" font-weight="700" fill="#0f172a" text-anchor="middle">4. β-Cetotiolasa (+ CoA-SH)</text>
      <text x="80" y="32" font-family="JetBrains Mono, monospace" font-size="8" fill="#059669" text-anchor="middle">Escinde 1 Acetil-CoA + Acil-CoA (-2c)</text>
    </g>

    <!-- Flecha hacia Acetil-CoA final / Krebs / Cetonas -->
    <path d="M 720 314 L 720 350" fill="none" stroke="${isBetaOx ? '#10b981' : '#94a3b8'}" stroke-width="2" marker-end="url(#arr-green)"/>

    <!-- Destinos de la β-Oxidación: Acetil-CoA (Krebs + Cetogénesis) -->
    <g transform="translate(640, 355)">
      <rect width="270" height="52" rx="8" fill="${isBetaOx ? '#ecfdf5' : '#f8fafc'}" stroke="${isBetaOx ? '#10b981' : '#cbd5e1'}" stroke-width="${isBetaOx ? '2' : '1.2'}"/>
      <text x="135" y="20" font-family="Instrument Sans, sans-serif" font-size="11" font-weight="700" fill="${isBetaOx ? '#047857' : '#0f172a'}" text-anchor="middle">8 Acetil-CoA por palmitato (C16)</text>
      <text x="135" y="34" font-family="Instrument Sans, sans-serif" font-size="9" fill="#475569" text-anchor="middle">Combustible para ciclo de Krebs & cetogénesis hepática</text>
      <text x="135" y="45" font-family="JetBrains Mono, monospace" font-size="8" font-weight="700" fill="${isBetaOx ? '#059669' : '#64748b'}" text-anchor="middle">${isMCAD ? 'Bloqueado: Fallo de cetogénesis e hipoglucemia' : 'Rendimiento: 106 ATP netos'}</text>
    </g>
  </svg>
  `;
}

export function setupLipidClinicalSuite(container, selectedId, actions = {}) {
  const root = container.querySelector('#lipid-suite-root');
  if (!root) return;

  const segBtns = root.querySelectorAll('[data-lipid-sc]');
  segBtns.forEach(btn => {
    btn.onclick = () => {
      const scId = btn.dataset.lipidSc;
      currentScenarioId = scId;
      applyLipidScenario(root, scId, actions);
    };
  });

  const simBtn = root.querySelector('#lipid-sim-btn');
  if (simBtn) {
    simBtn.onclick = () => {
      if (actions.focusLipidArea) actions.focusLipidArea();
      if (actions.toast) actions.toast("Ruta de lípidos enfocada en el mapa celular");
    };
  }
}

function applyLipidScenario(root, scId, actions) {
  const sc = LIPID_SCENARIOS[scId];
  if (!sc) return;

  root.setAttribute('data-current-sc', scId);

  // Actualizar botones de segmento
  root.querySelectorAll('[data-lipid-sc]').forEach(b => {
    b.classList.toggle('active', b.dataset.lipidSc === scId);
  });

  // Actualizar badge superior
  const badgeEl = root.querySelector('.lipid-badge');
  if (badgeEl) {
    badgeEl.className = `lipid-badge ${sc.badgeType}`;
    badgeEl.textContent = sc.badge;
  }

  // Actualizar subtítulo
  const subEl = root.querySelector('.lipid-subtitle');
  if (subEl) subEl.textContent = sc.subtitle;

  // Actualizar SVG
  const svgBox = root.querySelector('#lipid-svg-box');
  if (svgBox) svgBox.innerHTML = renderLipidSVG(sc);

  // Actualizar banner de regulación cruzada
  const crossText = root.querySelector('#lipid-cross-text');
  if (crossText) crossText.textContent = sc.crossInhibitionText;

  // Actualizar KPIs
  const c8Val = root.querySelector('#kpi-c8-val');
  if (c8Val) c8Val.textContent = sc.c8Val;
  const c8Status = root.querySelector('#kpi-c8-status');
  if (c8Status) c8Status.textContent = sc.c8Status;

  const c0Ratio = root.querySelector('#kpi-c0-ratio');
  if (c0Ratio) c0Ratio.textContent = sc.c0RatioVal;

  const cpkVal = root.querySelector('#kpi-cpk-val');
  if (cpkVal) cpkVal.textContent = sc.cpkVal;

  const glucoseVal = root.querySelector('#kpi-glucose-val');
  if (glucoseVal) glucoseVal.textContent = sc.glucoseVal;
  const glucoseStatus = root.querySelector('#kpi-glucose-status');
  if (glucoseStatus) glucoseStatus.textContent = sc.glucoseStatus;

  const ketonesVal = root.querySelector('#kpi-ketones-val');
  if (ketonesVal) ketonesVal.textContent = sc.ketonesVal;
  const ketonesStatus = root.querySelector('#kpi-ketones-status');
  if (ketonesStatus) ketonesStatus.textContent = sc.ketonesStatus;

  const dicarbVal = root.querySelector('#kpi-dicarboxylic-val');
  if (dicarbVal) dicarbVal.textContent = sc.dicarboxylicVal;
  const dicarbStatus = root.querySelector('#kpi-dicarboxylic-status');
  if (dicarbStatus) dicarbStatus.textContent = sc.dicarboxylicStatus;

  const atpVal = root.querySelector('#kpi-atp-val');
  if (atpVal) atpVal.textContent = sc.netATP;
  const atpStatus = root.querySelector('#kpi-atp-status');
  if (atpStatus) atpStatus.textContent = sc.atpBalance;
  const stoichEq = root.querySelector('#kpi-stoich-eq');
  if (stoichEq) stoichEq.textContent = sc.stoichiometry;

  // Actualizar etiquetas de órganos
  const liverB = root.querySelector('#org-badge-liver');
  if (liverB) { liverB.className = `organ-badge ${sc.liverBadge}`; liverB.textContent = sc.liverBadge.toUpperCase(); }
  const liverD = root.querySelector('#org-desc-liver');
  if (liverD) liverD.textContent = sc.liverImpact;

  const muscleB = root.querySelector('#org-badge-muscle');
  if (muscleB) { muscleB.className = `organ-badge ${sc.muscleBadge}`; muscleB.textContent = sc.muscleBadge.toUpperCase(); }
  const muscleD = root.querySelector('#org-desc-muscle');
  if (muscleD) muscleD.textContent = sc.muscleImpact;

  const heartB = root.querySelector('#org-badge-heart');
  if (heartB) { heartB.className = `organ-badge ${sc.heartBadge}`; heartB.textContent = sc.heartBadge.toUpperCase(); }
  const heartD = root.querySelector('#org-desc-heart');
  if (heartD) heartD.textContent = sc.heartImpact;

  const cnsB = root.querySelector('#org-badge-cns');
  if (cnsB) { cnsB.className = `organ-badge ${sc.cnsBadge}`; cnsB.textContent = sc.cnsBadge.toUpperCase(); }
  const cnsD = root.querySelector('#org-desc-cns');
  if (cnsD) cnsD.textContent = sc.cnsImpact;

  // Actualizar protocolo y guías
  const protoText = root.querySelector('#lipid-protocol-text');
  if (protoText) protoText.textContent = sc.managementSummary;
  const protoRef = root.querySelector('#lipid-protocol-ref');
  if (protoRef) protoRef.textContent = sc.guidelineRef;
}
