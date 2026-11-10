// @ts-nocheck
/**
 * Especialización Tisular del Metabolismo y Rutas Universales
 * Diseñado para estudiantes de Bioquímica General.
 * Proporciona:
 *  1. Matriz comparativa interactiva tejido a tejido.
 *  2. Catálogo exhaustivo de Rutas Universales (comunes a todas las células).
 *  3. Explorador de especialización tisular (combustibles, enzimas distintivas y ausencias clave).
 */

export const UNIVERSAL_PATHWAYS = [
  {
    id: "glycolysis",
    name: "Glucólisis citosólica (vía de Embden-Meyerhof)",
    badge: "Ubicua al 100% en todas las células humanas",
    badgeType: "universal",
    organelles: "Citosol",
    keyEnzymes: "Hexoquinasa (HK I-III / IV), PFK-1, Piruvato Quinasa (PK)",
    whyUniversal: "Es la vía catabólica ancestral por excelencia. Todas las células del organismo (incluso los eritrocitos maduros que carecen de núcleo y mitocondrias) poseen la maquinaria enzimática glucolítica completa en el citosol. Permite generar ATP de forma rápida tanto en condiciones aerobias como anaerobias mediante fosforilación a nivel de sustrato, además de proveer intermediarios clave (G-6-P, DHAP, 3-PG, PEP, piruvato) para biosíntesis.",
    tissueSpecificNuance: "La especialización reside en las isoenzimas y su regulación: el hígado y las células β pancreáticas expresan Glucoquinasa (HK IV, Km alta ≈ 10 mM, no inhibida por G-6-P, sensor de glucemia), mientras que el músculo y cerebro expresan HK I-III (Km baja < 0.1 mM, saturada a glucemia basal, inhibida alostéricamente por G-6-P)."
  },
  {
    id: "krebs_etc",
    name: "Ciclo de Krebs & cadena respiratoria / fosforilación oxidativa",
    badge: "Universal en todas las células con mitocondrias",
    badgeType: "universal",
    organelles: "Matriz y Membrana Mitocondrial Interna",
    keyEnzymes: "Citrato Sintasa, Isocitrato DH (IDH), α-Cetoglutarato DH, Complejos I–IV, ATP Sintasa",
    whyUniversal: "Constituye el nudo metabólico central de convergencia para la oxidación completa de carbohidratos, lípidos y esqueletos carbonados de aminoácidos a CO₂ y H₂O. Alimenta la fuerza protón-motriz y produce la inmensa mayoría del ATP corporal (~90% en reposo). Se encuentra en toda célula humana nucleada que posea mitocondrias.",
    tissueSpecificNuance: "La única excepción celular relevante en el cuerpo humano es el eritrocito maduro, que pierde sus mitocondrias durante la diferenciación eritroide para maximizar el transporte de O₂ sin consumirlo, dependiendo 100% de la glucólisis anaerobia."
  },
  {
    id: "pentose_phosphate",
    name: "Vía de las pentosas fosfato (fase oxidativa y no oxidativa)",
    badge: "Universal en prácticamente todos los tejidos",
    badgeType: "universal",
    organelles: "Citosol",
    keyEnzymes: "Glucosa-6-Fosfato Deshidrogenasa (G6PDH), 6-Fosfogluconato DH, Transcetolasa",
    whyUniversal: "Cumple dos roles celulares insustituibles: 1) Generar NADPH citosólico para la síntesis de ácidos grasos, colesterol, neurotransmisores y, crucialmente, para mantener el glutatión reducido (GSH) frente a especies reactivas de oxígeno (ROS); 2) Generar D-Ribosa-5-Fosfato para la síntesis obligada de nucleótidos de ARN y ADN y coenzimas (ATP, NAD⁺, FAD, CoA).",
    tissueSpecificNuance: "El flujo varía según la demanda: en el eritrocito es vital como única defensa antioxidante (deficiencia de G6PDH → favismo); en hígado, glándula mamaria lactante y corteza suprarrenal es masiva para lipogénesis y esteroidogénesis; en células en rápida división (médula ósea, epitelios) prima la fase no oxidativa para sintetizar ribosa."
  },
  {
    id: "protein_turnover",
    name: "Recambio proteico basal & transaminaciones Citosólicas/Mitocondriales",
    badge: "Universal en todas las células nucleadas",
    badgeType: "universal",
    organelles: "Citosol, Ribosomas y Matriz Mitocondrial",
    keyEnzymes: "Aminotransferasas (ALT, AST), Complejo Proteasoma-Ubiquitina",
    whyUniversal: "Toda célula viva mantiene un recambio continuo de sus proteínas estructurales, enzimáticas y reguladoras. Las transaminasas (dependientes de fosfato de piridoxal / vit. B6) canalizan reversiblemente los grupos amino de los 20 aminoácidos hacia el glutamato y oxalacetato/piruvato, permitiendo la interconversión y el equilibrio de aminoácidos no esenciales.",
    tissueSpecificNuance: "Aunque las transaminaciones son universales, el destino final del nitrógeno sobrante (amonio NH₄⁺) es estrictamente tisular: solo el hígado posee el ciclo completo de la urea para eliminarlo de forma inocua; los tejidos periféricos deben exportarlo como glutamina o alanina."
  }
];

export const TISSUES_DATA = {
  liver: {
    id: "liver",
    name: "Hígado (Hepatocito)",
    icon: "Hí",
    title: "El centro de mando metabólico del organismo",
    subtitle: "Flexibilidad metabólica total, mantenimiento de la glucemia y detoxificación",
    fuelFed: "Glucosa, Fructosa, Galactosa, Aminoácidos de la dieta",
    fuelFasting: "Ácidos grasos libres (β-oxidación), Lactato, Glicerol, Alanina",
    fuelExported: "Glucosa libre a sangre, Cuerpos cetónicos, Triacilgliceroles (VLDL), Urea",
    storedFuel: "Glucógeno hepático (≈ 70–100 g, reserva sistémica que se agota en 24 h)",
    specificHallmarks: [
      {
        pathway: "Gluconeogénesis completa a sangre",
        status: "exclusive",
        text: "Expresa glucosa-6-fosfatasa (G6Pasa). Es el único órgano junto con la corteza renal capaz de desfosforilar la G-6-P para liberar glucosa libre a la circulación sanguínea a través de GLUT2 y evitar la hipoglucemia."
      },
      {
        pathway: "Cetogénesis (Síntesis de cuerpos cetónicos)",
        status: "exclusive",
        text: "Posee la HMG-CoA sintasa mitocondrial (HMGCS2). En ayuno transforma el exceso de acetil-CoA de la β-oxidación en acetoacetato y β-hidroxibutirato para nutrir al cerebro y músculo."
      },
      {
        pathway: "Ciclo de la Urea completo",
        status: "exclusive",
        text: "Único tejido que expresa el ciclo de la urea en su totalidad (CPS1, OTC, ASS1, ASL y Arginasa 1), eliminando el nitrógeno tóxico de todos los aminoácidos del organismo."
      },
      {
        pathway: "Metabolismo de otras hexosas (Fructosa y Galactosa)",
        status: "specialized",
        text: "Expresa Fructoquinasa (KHK) y Aldolasa B para la fructólisis rápida; y GALK1, GALT y GALE (vía de Leloir) para canalizar la galactosa láctea."
      },
      {
        pathway: "Sensor Glucémico Hepático",
        status: "specialized",
        text: "Combina GLUT2 (Km ≈ 15–20 mM) con Glucoquinasa (HK IV, Km ≈ 10 mM, regulada por GKRP y no inhibida por G-6-P), lo que le permite captar glucosa proporcional a la ingesta sin saturarse."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "Cetólisis (Consumo de cuerpos cetónicos)",
        status: "absent",
        reason: "Carencia de tioforasa (β-cetoacil-CoA transferasa / SCOT). El hepatocito fabrica cuerpos cetónicos para los demás tejidos, pero no puede consumirlos. Esto previene un ciclo fútil de síntesis y degradación simultánea en la matriz mitocondrial."
      }
    ],
    examTip: "En exámenes de Bioquímica suele preguntarse: ¿Por qué el hígado no puede usar los cuerpos cetónicos que él mismo sintetiza? Respuesta: Por ausencia de la enzima tioforasa (SCOT)."
  },

  muscle: {
    id: "muscle",
    name: "Músculo Esquelético (Miocito)",
    icon: "Mú",
    title: "Gran consumidor y generador de trabajo mecánico",
    subtitle: "Almacén de glucógeno para autoconsumo, glucólisis anaerobia rápida y oxidación aeróbica",
    fuelFed: "Glucosa (vía transportador GLUT4 sensible a insulina)",
    fuelFasting: "Ácidos grasos libres (en reposo), Cuerpos cetónicos",
    fuelExported: "Lactato (Ciclo de Cori) y L-Alanina (Ciclo de la glucosa-alanina)",
    storedFuel: "Glucógeno muscular (≈ 300–400 g, la mayor reserva de carbohidratos del cuerpo, estrictamente para autoconsumo)",
    specificHallmarks: [
      {
        pathway: "Glucogenólisis de autoconsumo ultra-rápida",
        status: "specialized",
        text: "La glucógeno fosforilasa muscular (isoenzima b/a) se activa alostéricamente por AMP y covalentemente por adrenalina y Ca²⁺ (calmodulina), movilizando glucosa en milisegundos durante la contracción intensa."
      },
      {
        pathway: "Glucólisis anaerobia masiva a Lactato",
        status: "specialized",
        text: "En esfuerzo intenso o hipoxia, la isoenzima LDH-M reduce piruvato a lactato regenerando NAD⁺ a velocidades vertiginosas para sostener la glucólisis."
      },
      {
        pathway: "Lanzadera del Glicerol-3-Fosfato (G3P)",
        status: "specialized",
        text: "Predomina en fibras musculares rápidas (tipo IIb). Transfiere electrones directamente al pool Q de la membrana mitocondrial interna con alta velocidad (rinde 1,5 ATP/NADH)."
      },
      {
        pathway: "Fosfocreatina / Creatina Quinasa (CK)",
        status: "specialized",
        text: "Reserva inmediata de enlaces fosfato de alta energía para regenerar ATP en los primeros 5–10 segundos de contracción máxima."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "Gluconeogénesis y liberación de glucosa libre a sangre",
        status: "absent",
        reason: "Carencia de glucosa-6-fosfatasa. El músculo no expresa G6Pasa; la glucosa fosforilada queda atrapada para su propia glucólisis. El músculo jamás exporta glucosa a la sangre para aliviar la hipoglucemia."
      },
      {
        pathway: "Ciclo de la Urea",
        status: "absent",
        reason: "No expresa las enzimas del ciclo de la urea. Para eliminar el nitrógeno de los aminoácidos ramificados (BCAA) transamina piruvato a alanina y la exporta al hígado."
      },
      {
        pathway: "Cetogénesis",
        status: "absent",
        reason: "Carece de HMGCS2; no fabrica cuerpos cetónicos, pero en reposo y ayuno es un consumidor prioritario de acetoacetato mediante su tioforasa."
      }
    ],
    examTip: "¿Por qué el glucógeno muscular no puede mantener la glucemia en ayuno? Porque carece de glucosa-6-fosfatasa; la G-6-P solo puede seguir la vía glucolítica muscular."
  },

  brain: {
    id: "brain",
    name: "Cerebro y sistema nervioso central",
    icon: "Ce",
    title: "Consumo continuo de alta prioridad vital",
    subtitle: "Dependencia estricta de glucosa en condiciones normales y adaptación a cuerpos cetónicos",
    fuelFed: "D-Glucosa exclusivamente (≈ 120 g/día, 20% del O₂ corporal en reposo)",
    fuelFasting: "D-Glucosa; en ayuno prolongado (> 3 días) cubre hasta el 60–70% de su energía con Cuerpos Cetónicos",
    fuelExported: "Ninguno (órgano consumidor neto)",
    storedFuel: "Prácticamente nulo (insignificante reserva transitoria de glucógeno en astrocitos)",
    specificHallmarks: [
      {
        pathway: "Transporte basal de glucosa de máxima afinidad",
        status: "specialized",
        text: "Expresa GLUT3 en neuronas (Km extremadamente baja ≈ 1.5 mM), garantizando una tasa de captación constante incluso en hipoglucemia moderada, asistido por GLUT1 en la barrera hematoencefálica (BHE)."
      },
      {
        pathway: "Cetólisis Adaptativa en Ayuno Prolongado",
        status: "specialized",
        text: "Induce los transportadores monocarboxilato (MCT1) y la tioforasa (SCOT), adaptando sus neuronas a quemar acetoacetato y β-hidroxibutirato. Esto disminuye la demanda de glucosa y ahorra masa muscular proteica."
      },
      {
        pathway: "Glucólisis aeróbica estricta y Fosforilación Oxidativa",
        status: "universal",
        text: "Consume el 20% del oxígeno del organismo. Requiere flujo continuo de piruvato hacia PDH, ciclo de Krebs y cadena respiratoria para mantener los potenciales de membrana neuronal."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "β-Oxidación de Ácidos Grasos de cadena larga",
        status: "absent",
        reason: "Los ácidos grasos unidos a albúmina no cruzan eficientemente la barrera hematoencefálica. Además, la β-oxidación en neuronas requiere mayores niveles de O₂ y genera un alto estrés oxidativo (ROS) y daño celular letal. El cerebro no quema ácidos grasos."
      },
      {
        pathway: "Gluconeogénesis",
        status: "absent",
        reason: "No expresa PEPCK ni G6Pasa; es enteramente dependiente del aporte exógeno de glucosa hepática o cuerpos cetónicos."
      }
    ],
    examTip: "El cerebro nunca utiliza ácidos grasos como combustible debido a la BHE y al riesgo de estrés oxidativo por ROS; en ayuno prolongado su único combustible alternativo son los cuerpos cetónicos."
  },

  adipose: {
    id: "adipose",
    name: "Tejido adiposo blanco (adipocito)",
    icon: "Ad",
    title: "El mayor depósito energético de larga duración",
    subtitle: "Esterificación de triacilgliceroles postprandial y lipólisis endocrina en ayuno",
    fuelFed: "Glucosa (vía GLUT4 sensible a insulina), Ácidos grasos de quilomicrones y VLDL (vía LPL)",
    fuelFasting: "Ácidos grasos libres (autoconsumo basal moderado)",
    fuelExported: "Ácidos grasos libres no esterificados (unidos a albúmina) y Glicerol libre",
    storedFuel: "Triacilgliceroles (TAG, reserva energética casi ilimitada: 12–15 kg en un adulto medio, equivalente a ~100.000 kcal)",
    specificHallmarks: [
      {
        pathway: "Lipólisis regulada por hormonas (ATGL & HSL)",
        status: "specialized",
        text: "En ayuno o ejercicio, el glucagón y la adrenalina elevan el AMPc y la PKA fosforila la perilipina y la lipasa sensible a hormonas (HSL), liberando ácidos grasos a la sangre para nutrir a hígado, corazón y músculo."
      },
      {
        pathway: "Esterificación y almacenamiento masivo de TAG",
        status: "specialized",
        text: "En estado postprandial, la insulina activa a la Lipoproteína Lipasa (LPL) endotelial y recluta transportadores GLUT4 para captar glucosa y fabricar grasa de depósito."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "Fosforilación de glicerol libre (Glicerol Quinasa)",
        status: "absent",
        reason: "Carencia de glicerol quinasa. El adipocito carece de esta enzima; por lo tanto, no puede reciclar el glicerol que libera durante la lipólisis. Para formar el esqueleto de Glicerol-3-P necesario para sintetizar TAG, depende obligatoriamente de la glucólisis (reducción de DHAP citosólica por GPD1)."
      },
      {
        pathway: "Gluconeogénesis y Cetogénesis",
        status: "absent",
        reason: "No expresa G6Pasa ni HMGCS2; su glicerol liberado viaja al hígado, donde sí hay glicerol quinasa para incorporarlo a la gluconeogénesis."
      }
    ],
    examTip: "¿Por qué el tejido adiposo necesita captar glucosa para sintetizar triglicéridos? Porque carece de glicerol quinasa y necesita la glucólisis para fabricar Glicerol-3-Fosfato a partir de DHAP."
  },

  rbc: {
    id: "rbc",
    name: "Eritrocito (Glóbulo Rojo)",
    icon: "Er",
    title: "Célula anucleada sin mitocondrias",
    subtitle: "100% de dependencia glucolítica anaerobia y defensa antioxidante estricta",
    fuelFed: "D-Glucosa exclusivamente",
    fuelFasting: "D-Glucosa exclusivamente",
    fuelExported: "L-Lactato continuo (sustrato del ciclo de Cori para el hígado)",
    storedFuel: "Ninguno",
    specificHallmarks: [
      {
        pathway: "Glucólisis anaerobia obligada (100% del ATP)",
        status: "exclusive",
        text: "Todo el piruvato formado en la glucólisis se reduce a lactato por la LDH citosólica. Produce 2 ATP netos por glucosa, necesarios para mantener las bombas Na⁺/K⁺-ATPasa y la forma bicóncava."
      },
      {
        pathway: "Shunt de Rapoport-Luebering (Síntesis de 2,3-BPG)",
        status: "exclusive",
        text: "La bisfosfoglicerato mutasa desvía el 1,3-BPG a 2,3-bisfosfoglicerato (2,3-BPG), efector alostérico maestro que disminuye la afinidad de la hemoglobina por el O₂, facilitando su liberación en tejidos periféricos."
      },
      {
        pathway: "Vía de las Pentosas Fosfato como defensa vital única",
        status: "exclusive",
        text: "La G6PDH eritrocitaria es la única fuente de NADPH. Sin él, la glutatión reductasa no puede mantener reducido el glutatión (GSH) para desintoxicar peróxidos mediante glutatión peroxidasa, provocando hemólisis aguda en favismo."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "Ciclo de Krebs, Cadena de e⁻ y β-Oxidación",
        status: "absent",
        reason: "Carencia total de mitocondrias. El eritrocito las expulsa en su maduración reticulocitaria. No puede consumir oxígeno ni oxidar ácidos grasos."
      },
      {
        pathway: "Gluconeogénesis y Síntesis de Glucógeno",
        status: "absent",
        reason: "Célula puramente consumidora catabólica terminal; carece de núcleo y ribosomas para síntesis proteica de novo."
      }
    ],
    examTip: "El glóbulo rojo transporta oxígeno pero no consume ni una sola molécula de oxígeno para su propio metabolismo: carece de mitocondrias y vive exclusivamente de glucólisis anaerobia a lactato."
  },

  heart: {
    id: "heart",
    name: "Miocardio (Músculo Cardíaco)",
    icon: "Co",
    title: "La bomba aeróbica perpetua e incansable",
    subtitle: "Máxima densidad mitocondrial, avidez por ácidos grasos y reutilización de lactato",
    fuelFed: "Ácidos grasos libres (60–70%), Lactato circulante (15–20%), Glucosa (15–20%)",
    fuelFasting: "Ácidos grasos libres (80%), Cuerpos cetónicos (15–20%)",
    fuelExported: "Ninguno (consumidor ávido)",
    storedFuel: "Mínimo glucógeno y pequeñas gotas lipídicas para emergencias inmediatas",
    specificHallmarks: [
      {
        pathway: "β-Oxidación mitocondrial continua y masiva",
        status: "specialized",
        text: "El corazón obtiene cerca del 70% de su ATP de la oxidación de ácidos grasos en reposo; sus mitocondrias ocupan hasta el 40% del volumen citosólico del miocito."
      },
      {
        pathway: "Consumo prioritario de Lactato exógeno",
        status: "specialized",
        text: "Expresa la isoenzima LDH-H (tetrámero H4) que funciona fisiológicamente en sentido inverso: capta el lactato liberado por el músculo en ejercicio o eritrocitos y lo oxida a piruvato para quemarlo en Krebs."
      },
      {
        pathway: "Lanzadera Malato-Aspartato (MAS) de máxima eficiencia",
        status: "specialized",
        text: "Junto con el hígado, utiliza predominantemente la lanzadera MAS (32 ATP por glucosa) acoplada a Complejo I para exprimir el 100% del rendimiento bioenergético."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "Glucólisis anaerobia sostenida",
        status: "absent",
        reason: "El miocardio no tolera la falta de oxígeno: si se interrumpe el flujo coronario (isquemia), la caída de ATP y la acidosis por acumulación de lactato detienen la contracción en menos de 1 minuto y causan necrosis irreversible (infarto de miocardio)."
      },
      {
        pathway: "Gluconeogénesis y Cetogénesis",
        status: "absent",
        reason: "No expresa G6Pasa ni HMGCS2; es un consumidor omnívoro estricto pero nunca productor."
      }
    ],
    examTip: "El corazón 'limpia' el lactato de la sangre: su isoenzima LDH cardíaca convierte activamente lactato en piruvato para obtener energía aeróbica masiva."
  },

  kidney: {
    id: "kidney",
    name: "Corteza Renal (Riñón)",
    icon: "Ri",
    title: "Filtración activa y reserva gluconeogénica secundaria",
    subtitle: "Gluconeogénesis en ayuno prolongado y amoniogénesis para el control ácido-base",
    fuelFed: "Glucosa, Ácidos grasos, Lactato",
    fuelFasting: "Ácidos grasos libres, Cuerpos cetónicos, Glutamina",
    fuelExported: "Glucosa libre a sangre (durante ayuno prolongado o acidosis), Iones Amonio (NH₄⁺)",
    storedFuel: "Mínimo",
    specificHallmarks: [
      {
        pathway: "Gluconeogénesis en ayuno prolongado y acidosis",
        status: "specialized",
        text: "La corteza renal expresa Glucosa-6-Fosfatasa (G6Pasa) y PEPCK. En ayuno prolongado (> 48–72 h) llega a aportar entre el 20% y el 40% de la glucosa liberada a la sangre, utilizando preferentemente glutamina y lactato."
      },
      {
        pathway: "Amoniogénesis renal y equilibrio ácido-base",
        status: "specialized",
        text: "La glutaminasa renal desamina la glutamina liberando NH₄⁺ a la luz tubular para amortiguar protones en orina y reabsorber bicarbonato (HCO₃⁻) hacia la sangre."
      }
    ],
    absentOrSuppressed: [
      {
        pathway: "Cetogénesis",
        status: "absent",
        reason: "Carece de HMGCS2; no sintetiza cuerpos cetónicos, aunque la corteza y médula los oxidan activamente."
      }
    ],
    examTip: "En ayuno muy prolongado (> 40 horas), el riñón asume una parte sustancial de la producción de glucosa sanguínea (~30-40%), utilizando glutamina como sustrato gluconeogénico."
  }
};

export const TISSUE_MATRIX_DATA = [
  {
    pathway: "Glucólisis",
    category: "Carbohidratos",
    universal: true,
    liver: { status: "active", note: "Glucoquinasa (HK IV, Km alta) + GLUT2; sensor de glucemia." },
    muscle: { status: "active", note: "HK I-II (Km baja) + GLUT4 dependiente de insulina y ejercicio." },
    heart: { status: "active", note: "Activa pero secundaria frente a la β-oxidación de ácidos grasos." },
    adipose: { status: "active", note: "Obligada para producir DHAP y generar Glicerol-3-P para TAG." },
    brain: { status: "active", note: "Consumo preferente primario masivo (GLUT3 de altísima afinidad)." },
    rbc: { status: "exclusive", note: "100% de su energía metabólica; anaerobia estricta a lactato." },
    kidney: { status: "active", note: "Activa en médula renal; corteza prefiere sustratos oxidativos." }
  },
  {
    pathway: "Gluconeogénesis completa a sangre",
    category: "Carbohidratos",
    universal: false,
    liver: { status: "exclusive", note: "Principal órgano. Expresa Glucosa-6-Fosfatasa y libera glucosa." },
    muscle: { status: "absent", note: "Carece de G6Pasa; el glucógeno es para autoconsumo." },
    heart: { status: "absent", note: "No expresa G6Pasa; consumidor aeróbico estricto." },
    adipose: { status: "absent", note: "Carece de la batería de enzimas gluconeogénicas." },
    brain: { status: "absent", note: "Depende del suministro de glucosa hepática o sangre." },
    rbc: { status: "absent", note: "Sin enzimas ni energía para anabolismo de glucosa." },
    kidney: { status: "active", note: "Órgano secundario. Aporta hasta 30-40% en ayuno prolongado." }
  },
  {
    pathway: "Glucogenogénesis & Glucogenólisis",
    category: "Carbohidratos",
    universal: false,
    liver: { status: "exclusive", note: "Reserva sistémica. Aporta glucosa a la sangre durante 24 h." },
    muscle: { status: "exclusive", note: "Reserva. Local (350 g). Estrictamente para trabajo muscular." },
    heart: { status: "active", note: "Mínima reserva de emergencia para episodios de isquemia breve." },
    adipose: { status: "absent", note: "Prácticamente nula; almacena energía en forma de triacilgliceroles." },
    brain: { status: "absent", note: "Mínimo transitorio en astrocitos, nulo en neuronas." },
    rbc: { status: "absent", note: "Carece de gránulos y enzimas de glucógeno." },
    kidney: { status: "absent", note: "Despreciable; no almacena reservas significativas." }
  },
  {
    pathway: "Vía de las Pentosas Fosfato",
    category: "Carbohidratos",
    universal: true,
    liver: { status: "active", note: "Muy activa para abastecer NADPH a la lipogénesis y colesterol." },
    muscle: { status: "active", note: "Actividad moderada para recambio de nucleótidos y defensa ROS." },
    heart: { status: "active", note: "Mantenimiento de glutatión reducido frente a estrés oxidativo." },
    adipose: { status: "active", note: "Alta para generar NADPH necesario para síntesis de novo de TAG." },
    brain: { status: "active", note: "Vital para regenerar glutatión (GSH) en neuronas y mielinización." },
    rbc: { status: "exclusive", note: "Defensa. Vital única. Única fuente de NADPH contra favismo." },
    kidney: { status: "active", note: "Defensa antioxidante tubular y biosíntesis." }
  },
  {
    pathway: "Ciclo de Krebs & Cadena de e⁻",
    category: "Bioenergética Aeróbica",
    universal: true,
    liver: { status: "active", note: "Alta tasa oxidativa e interconversión anaplerótica de metabolitos." },
    muscle: { status: "active", note: "Muy activa en reposo y ejercicio submáximo aeróbico." },
    heart: { status: "exclusive", note: "Máxima densidad. Mitocondrias ocupan el 40% del citoplasma." },
    adipose: { status: "active", note: "Tasa basal moderada para mantener funciones celulares." },
    brain: { status: "active", note: "Continua y masiva; consume el 20% del O₂ corporal en reposo." },
    rbc: { status: "absent", note: "Al 100%. Carece de mitocondrias; no consume oxígeno." },
    kidney: { status: "active", note: "Muy alta para bombear iones en los túbulos renales." }
  },
  {
    pathway: "β-Oxidación de Ácidos Grasos",
    category: "Lípidos",
    universal: false,
    liver: { status: "active", note: "Muy activa en ayuno; aporta el ATP y NADH para la gluconeogénesis." },
    muscle: { status: "active", note: "Combustible principal en reposo y ejercicio aeróbico prolongado." },
    heart: { status: "exclusive", note: "Combustible. Preferente (60-70% del ATP total del miocardio)." },
    adipose: { status: "active", note: "Activa para autoconsumo basal en ayuno." },
    brain: { status: "absent", note: "Los AG no cruzan bien la BHE y generan ROS letal." },
    rbc: { status: "absent", note: "Sin mitocondrias ni enzimas oxidativas." },
    kidney: { status: "active", note: "Combustible mayoritario de la corteza renal aeróbica." }
  },
  {
    pathway: "Cetogénesis (Síntesis de Cuerpos Cetónicos)",
    category: "Lípidos",
    universal: false,
    liver: { status: "exclusive", note: "Exclusiva. Hepática (HMGCS2 mitocondrial). Fabrica cetonas." },
    muscle: { status: "absent", note: "No expresa HMGCS2; no produce cetonas." },
    heart: { status: "absent", note: "No produce cetonas; solo las consume." },
    adipose: { status: "absent", note: "Libera ácidos grasos, no cetonas." },
    brain: { status: "absent", note: "Consume cetonas pero no las sintetiza." },
    rbc: { status: "absent", note: "Sin capacidad cetogénica." },
    kidney: { status: "absent", note: "en condiciones fisiológicas." }
  },
  {
    pathway: "Cetólisis (Utilización de Cuerpos Cetónicos)",
    category: "Lípidos",
    universal: false,
    liver: { status: "absent", note: "Carece de Tioforasa (SCOT); evita ciclo fútil." },
    muscle: { status: "active", note: "Quema acetoacetato en ayuno temprano para ahorrar glucosa." },
    heart: { status: "active", note: "Combustible oxidativo rápido que se quema ávidamente." },
    adipose: { status: "active", note: "Actividad secundaria baja." },
    brain: { status: "exclusive", note: "Adaptación salvadora. Cubre 60-70% del ATP cerebral en ayuno." },
    rbc: { status: "absent", note: "Sin mitocondrias no puede oxidar cetonas." },
    kidney: { status: "active", note: "Oxidación activa en corteza y médula." }
  },
  {
    pathway: "Ciclo de la Urea Completo",
    category: "Nitrógeno",
    universal: false,
    liver: { status: "exclusive", note: "Exclusivo hepático. CPS1, OTC, ASS1, ASL y Arginasa 1." },
    muscle: { status: "absent", note: "Exporta nitrógeno hacia el hígado como alanina." },
    heart: { status: "absent", note: "No desintoxica amonio en forma de urea." },
    adipose: { status: "absent", note: "Ausente." },
    brain: { status: "absent", note: "El amonio en cerebro es extremadamente tóxico." },
    rbc: { status: "absent", note: "Ausente." },
    kidney: { status: "absent", note: "Incompleto (expresa ASS/ASL para arginina, pero no Arginasa 1)." }
  },
  {
    pathway: "Lipogénesis de novo (Palmitato / TAG)",
    category: "Lípidos",
    universal: false,
    liver: { status: "active", note: "Muy activa postprandial (ACC1/FASN); exporta TAG en VLDL." },
    muscle: { status: "absent", note: "Mínima; el músculo capta ácidos grasos pero no sintetiza de novo." },
    heart: { status: "absent", note: "Nula; el miocardio no sintetiza ácidos grasos." },
    adipose: { status: "active", note: "Almacén. Sintetiza TAG a partir de AG circulantes y glucólisis." },
    brain: { status: "absent", note: "Despreciable para almacenamiento de energía." },
    rbc: { status: "absent", note: "Nula." },
    kidney: { status: "absent", note: "Nula." }
  },
  {
    pathway: "Lipólisis de Triacilgliceroles a Sangre",
    category: "Lípidos",
    universal: false,
    liver: { status: "absent", note: "Degrada TAG internamente pero no libera AGL libres a sangre." },
    muscle: { status: "active", note: "Degrada TAG intramiocelulares para su propio consumo contráctil." },
    heart: { status: "active", note: "Degrada mínimas reservas internas para autoconsumo." },
    adipose: { status: "exclusive", note: "Función. Maestra endocrina. ATGL y HSL liberan AGL a la sangre." },
    brain: { status: "absent", note: "Nula." },
    rbc: { status: "absent", note: "Nula." },
    kidney: { status: "absent", note: "Nula." }
  },
  {
    pathway: "Lanzadera Redox Predominante",
    category: "Transporte Mitocondrial",
    universal: true,
    liver: { status: "active", note: "Malato-Aspartato (MAS) · 2,5 ATP/NADH (32 ATP/glucosa)." },
    muscle: { status: "active", note: "Glicerol-3-P (G3P) en fibras rápidas (rápida, 30 ATP/glucosa)." },
    heart: { status: "active", note: "Malato-Aspartato (MAS) para máxima eficiencia energética (32 ATP)." },
    adipose: { status: "active", note: "G3P y MAS moderadas." },
    brain: { status: "active", note: "G3P y MAS en distintas poblaciones neuronales/gliales." },
    rbc: { status: "absent", note: "Ninguna. Sin mitocondrias, LDH oxida NADH en el citosol." },
    kidney: { status: "active", note: "Malato-Aspartato (MAS) predominante." }
  }
];

export function renderTissueSuite(activeSubTab = "matrix", selectedTissueId = "liver") {
  const tabs = [
    { id: "matrix", label: "Tabla de rutas por tejido" },
    { id: "universal", label: "Rutas universales" },
    { id: "explorer", label: "Ficha de cada tejido" }
  ];

  const navHtml = `
    <div class="tissue-nav-tabs" role="tablist">
      ${tabs.map(t => `
        <button class="tissue-nav-tab ${activeSubTab === t.id ? 'active' : ''}" role="tab" data-tissue-tab="${t.id}" aria-selected="${activeSubTab === t.id}">
          ${t.label}
        </button>
      `).join("")}
    </div>
  `;

  let contentHtml = "";

  if (activeSubTab === "matrix") {
    contentHtml = renderMatrixView();
  } else if (activeSubTab === "universal") {
    contentHtml = renderUniversalView();
  } else if (activeSubTab === "explorer") {
    contentHtml = renderExplorerView(selectedTissueId);
  }

  return `
    <div class="tissue-suite-root" id="tissue-suite-root">
      <div class="tissue-header-hero">
        <div class="tissue-badge-ribbon">
        </div>
        <h2 class="tissue-main-title">Qué rutas tiene cada tejido</h2>
        <p class="tissue-main-p">
          Unas rutas son <b>universales</b> y están en todas las células; otras solo existen en ciertos órganos o faltan en ellos. La tabla compara siete tejidos ruta por ruta.
        </p>
      </div>

      ${navHtml}

      <div class="tissue-body-container">
        ${contentHtml}
      </div>
    </div>
  `;
}

function renderMatrixView() {
  const tissues = [
    { id: "liver", name: "Hígado", icon: "Hí" },
    { id: "muscle", name: "Músculo", icon: "Mú" },
    { id: "heart", name: "Corazón", icon: "Co" },
    { id: "adipose", name: "Adiposo", icon: "Ad" },
    { id: "brain", name: "Cerebro", icon: "Ce" },
    { id: "rbc", name: "Eritrocito", icon: "Er" },
    { id: "kidney", name: "Riñón", icon: "Ri" }
  ];

  const getBadgeClass = (status) => {
    switch (status) {
      case "exclusive": return "cell-badge-exclusive";
      case "active": return "cell-badge-active";
      case "absent": return "cell-badge-absent";
      case "specialized": return "cell-badge-specialized";
      default: return "cell-badge-neutral";
    }
  };

  const getBadgeLabel = (status) => {
    switch (status) {
      case "exclusive": return "Exclusiva";
      case "active": return "✓ Activa";
      case "absent": return "Ausente";
      case "specialized": return "Especializada";
      default: return status;
    }
  };

  return `
    <div class="tissue-matrix-card">
      <div class="tissue-matrix-legend">
        <span class="tm-legend-title">Leyenda</span>
        <span class="tm-badge-sample cell-badge-exclusive">Exclusiva</span>
        <span class="tm-badge-sample cell-badge-active">✓ Activa</span>
        <span class="tm-badge-sample cell-badge-absent">✕ Ausente</span>
        <span class="tm-badge-sample cell-badge-universal">Universal (células con mitocondrias)</span>
      </div>

      <div class="tissue-table-scroll">
        <table class="tissue-matrix-table">
          <thead>
            <tr>
              <th class="th-pathway">Ruta metabólica</th>
              ${tissues.map(t => `
                <th class="th-tissue" data-matrix-tissue="${t.id}">
                  <span class="th-icon">${t.icon}</span>
                  <span class="th-name">${t.name}</span>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            ${TISSUE_MATRIX_DATA.map((row) => `
              <tr class="${row.universal ? 'row-universal' : ''}">
                <td class="td-pathway">
                  <div class="td-pathway-title">
                    <b>${row.pathway}</b>
                    ${row.universal ? `<span class="badge-tag-uni" title="Presente en todas las células vivas nucleadas">Universal</span>` : ''}
                  </div>
                  <small class="td-pathway-cat">${row.category}</small>
                </td>
                ${tissues.map(t => {
                  const cell = row[t.id];
                  if (!cell) return `<td>-</td>`;
                  return `
                    <td class="td-matrix-cell ${cell.status === 'absent' ? 'td-absent' : ''}">
                      <span class="cell-status-badge ${getBadgeClass(cell.status)}">
                        ${getBadgeLabel(cell.status)}
                      </span>
                      <p class="cell-mini-note">${cell.note}</p>
                    </td>
                  `;
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="tissue-matrix-footer">
        <div class="tmf-tip">
          <b>Regla mnemotécnica para Bioquímica:</b> El <i>Hígado</i> es el productor altruista (fabrica glucosa y cuerpos cetónicos para los demás, pero no puede consumir cuerpos cetónicos); el <i>Músculo</i> es el consumidor egoísta (su glucógeno es para autoconsumo y carece de G6Pasa); y el <i>Eritrocito</i> es el minimalista estricto (carece de mitocondrias y vive 100% de glucólisis anaerobia).
        </div>
      </div>
    </div>
  `;
}

function renderUniversalView() {
  return `
    <div class="universal-view-grid">
      <div class="universal-intro-card">
        <div class="uic-badge">Fundamento de bioquímica general</div>
        <h3>¿Qué hace que una ruta metabólica sea «Universal»?</h3>
        <p>
          En los seres humanos, una ruta metabólica se considera <b>universal</b> (o ubicua) cuando sus enzimas se expresan en el <b>citosol</b> o las <b>mitocondrias</b> de prácticamente cualquier célula nucleada viva, independientemente de su linaje histológico o diferenciación.
        </p>
        <p>
          Estas vías cubren las necesidades celulares elementales: producción continua de ATP para bombas iónicas y transporte celular, defensa antioxidante mediante equivalentes reductores de NADPH, y síntesis de los bloques monoméricos de ácidos nucleicos y proteínas.
        </p>
      </div>

      <div class="universal-cards-deck">
        ${UNIVERSAL_PATHWAYS.map((p, idx) => `
          <div class="universal-card-item">
            <div class="uci-top">
              <span class="uci-num">0${idx + 1}</span>
              <div class="uci-head-text">
                <span class="uci-badge-tag">${p.badge}</span>
                <h4>${p.name}</h4>
                <div class="uci-organelle">Localización: <b>${p.organelles}</b></div>
              </div>
            </div>

            <div class="uci-enzymes-box">
              <span class="uci-lbl">Enzimas clave y marcapasos:</span>
              <p class="uci-enz-list">${p.keyEnzymes}</p>
            </div>

            <div class="uci-section">
              <span class="uci-lbl">Por qué es universal a todas las células:</span>
              <p class="uci-p">${p.whyUniversal}</p>
            </div>

            <div class="uci-nuance-box">
              <span class="uci-lbl-accent">Matiz y variación tisular:</span>
              <p class="uci-p-accent">${p.tissueSpecificNuance}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderExplorerView(selectedTissueId) {
  const current = TISSUES_DATA[selectedTissueId] || TISSUES_DATA.liver;
  const tissueKeys = Object.keys(TISSUES_DATA);

  return `
    <div class="explorer-layout">
      <!-- Selector de Tejido Lateral / Botones -->
      <div class="explorer-selector-rail">
        <span class="rail-eyebrow">Selecciona un Órgano o Tejido:</span>
        <div class="explorer-buttons-list">
          ${tissueKeys.map(k => {
            const t = TISSUES_DATA[k];
            const isSel = t.id === current.id;
            return `
              <button class="explorer-tissue-btn ${isSel ? 'active' : ''}" data-select-tissue="${t.id}" aria-selected="${isSel}">
                <span class="etb-icon">${t.icon}</span>
                <div class="etb-text">
                  <b>${t.name}</b>
                  <small>${t.title.split(' ')[0]}</small>
                </div>
              </button>
            `;
          }).join("")}
        </div>

        <div class="explorer-map-link-box">
          <div class="eml-title">Ver en el mapa celular</div>
          <p class="eml-desc">Filtra el mapa celular animado para visualizar las rutas activas de este tejido.</p>
          <button class="explorer-btn-map" data-go-map-tissue="${current.id}">
            Aplicar ${current.name} en el Mapa →
          </button>
        </div>
      </div>

      <!-- Ficha de Detalle del Tejido Seleccionado -->
      <div class="explorer-detail-panel">
        <div class="tissue-profile-header">
          <div class="tph-badge-row">
            <span class="tph-icon-big">${current.icon}</span>
            <div>
              <span class="tph-eyebrow">Especialización bioquímica tisular</span>
              <h3 class="tph-title">${current.name}</h3>
              <p class="tph-subtitle">${current.subtitle}</p>
            </div>
          </div>
        </div>

        <!-- Dashboard de Combustibles y Reservas (Apple Health Clean Deck) -->
        <div class="tissue-fuel-deck">
          <div class="tfd-card">
            <div class="tfd-label">Combustibles en estado alimentado (fed)</div>
            <div class="tfd-val">${current.fuelFed}</div>
          </div>
          <div class="tfd-card">
            <div class="tfd-label">⏳ Combustibles en ayuno (fasting)</div>
            <div class="tfd-val">${current.fuelFasting}</div>
          </div>
          <div class="tfd-card highlight-export">
            <div class="tfd-label">Combustibles / metabolitos exportados</div>
            <div class="tfd-val">${current.fuelExported}</div>
          </div>
          <div class="tfd-card">
            <div class="tfd-label">Reserva energética principal</div>
            <div class="tfd-val">${current.storedFuel}</div>
          </div>
        </div>

        <!-- Rutas Distintivas / Especializadas -->
        <div class="tissue-sec-block">
          <div class="tsb-title">
            
            <h4>Rutas metabólicas propias, altamente expresadas o distintivas</h4>
          </div>
          <div class="tsb-cards-grid">
            ${current.specificHallmarks.map(h => `
              <div class="tsb-card-item">
                <div class="tsb-card-top">
                  <b>${h.pathway}</b>
                  <span class="tsb-badge ${h.status}">${h.status === 'exclusive' ? 'Exclusiva / Principal' : 'Especializada'}</span>
                </div>
                <p>${h.text}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Rutas Ausentes o Reprimidas (Preguntas Clásicas de Bioquímica) -->
        <div class="tissue-sec-block danger-block">
          <div class="tsb-title">
            <span class="tsb-icon-red"></span>
            <h4>Rutas Metabólicas Ausentes o Reprimidas y su Causa Bioquímica</h4>
          </div>
          <div class="tsb-cards-grid">
            ${current.absentOrSuppressed.map(a => `
              <div class="tsb-card-item absent-card">
                <div class="tsb-card-top">
                  <b style="color:var(--danger)">${a.pathway}</b>
                  <span class="tsb-badge absent">Ausente / No funcional</span>
                </div>
                <p>${a.reason}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Tarjeta de Tip para el Estudiante / Examen -->
        <div class="tissue-exam-tip-card">
          <div class="tetc-head">
            <span class="tetc-icon"></span>
            <b>Pregunta típica de examen (bioquímica general):</b>
          </div>
          <p>${current.examTip}</p>
        </div>
      </div>
    </div>
  `;
}

export function setupTissueSuite(container, callbacks = {}) {
  const root = container.querySelector('#tissue-suite-root');
  if (!root) return;

  // Tabs de navegación interna (matrix / universal / explorer)
  const tabBtns = root.querySelectorAll('[data-tissue-tab]');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      const tabId = btn.dataset.tissueTab;
      if (callbacks.onTabChange) {
        callbacks.onTabChange(tabId);
      }
    };
  });

  // Selector de tejido en el explorador
  const tissueBtns = root.querySelectorAll('[data-select-tissue]');
  tissueBtns.forEach(btn => {
    btn.onclick = () => {
      const tId = btn.dataset.selectTissue;
      if (callbacks.onTissueSelect) {
        callbacks.onTissueSelect(tId);
      }
    };
  });

  // Clic en tejido desde la cabecera de la matriz
  const matrixHeaders = root.querySelectorAll('[data-matrix-tissue]');
  matrixHeaders.forEach(th => {
    th.onclick = () => {
      const tId = th.dataset.matrixTissue;
      if (callbacks.onTabChange && callbacks.onTissueSelect) {
        callbacks.onTissueSelect(tId);
        callbacks.onTabChange('explorer');
      }
    };
  });

  // Botón para aplicar el tejido en el mapa celular en vivo
  const mapBtn = root.querySelector('[data-go-map-tissue]');
  if (mapBtn) {
    mapBtn.onclick = () => {
      const tId = mapBtn.dataset.goMapTissue;
      if (callbacks.onApplyToMap) {
        callbacks.onApplyToMap(tId);
      }
    };
  }
}
