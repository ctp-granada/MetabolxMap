import { D } from "./metabolixData.js";
import { isLipidEntity, renderLipidClinicalSuite, setupLipidClinicalSuite } from "./metabolixLipids.js";
import { renderTissueSuite, setupTissueSuite, TISSUES_DATA, UNIVERSAL_PATHWAYS } from "./metabolixTissues.js";
import { getFlashcardStats, recordFlashcardPractice, resetFlashcardStats, pointsFor, recordQuizPoints, recordQuizBest, getQuizPoints, getRanking, isRegisteredStudent, getStudentProfile, incrementCompletedChallenges } from "./services/storageService";

export function initMetabolix() {

const NS = "http://www.w3.org/2000/svg";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cssify = root => { root.querySelectorAll("[fill*='var('],[stroke*='var('],[stop-color*='var(']").forEach(n=>{ ["fill","stroke","stop-color"].forEach(k=>{ const v=n.getAttribute(k); if(v&&v.includes("var(")){ n.style.setProperty(k,v); n.removeAttribute(k);} }); }); return root; };
const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ======================= Metadatos ======================= */
const PW = {
  glycolysis:{name:"Glucólisis",c:"var(--pw-glycolysis)"},
  gluconeogenesis:{name:"Gluconeogénesis",c:"var(--pw-gluconeogenesis)"},
  pentose_phosphate:{name:"Pentosas fosfato",c:"var(--pw-pentose)"},
  glycogen_metabolism:{name:"Glucógeno",c:"var(--pw-glycogen)"},
  monosaccharide_entry:{name:"Otras hexosas",c:"var(--pw-mono)"},
  mitochondrial_fate:{name:"Destino del piruvato",c:"var(--pw-mito)"},
  krebs_cycle:{name:"Ciclo de Krebs",c:"var(--pw-krebs)"},
  electron_transport:{name:"Cadena respiratoria",c:"var(--pw-etc)"},
  lipid_metabolism:{name:"Lípidos",c:"var(--pw-lipid)"},
  urea_cycle:{name:"Ciclo de la urea",c:"var(--pw-urea)"},
  mas_shuttle:{name:"Lanzadera malato-aspartato",c:"var(--pw-mas)"},
  g3p_shuttle:{name:"Lanzadera del glicerol-3-P",c:"var(--pw-g3p)"},
  transport:{name:"Transporte",c:"var(--pw-transport)"}
};
const MAP_PW = ["glycolysis","gluconeogenesis","pentose_phosphate","glycogen_metabolism","monosaccharide_entry","mitochondrial_fate","krebs_cycle","electron_transport","lipid_metabolism"];
const COMP = {cytosol:"Citosol",mitochondria_membrane:"Membrana mitocondrial",mitochondria_intermembrane:"Espacio intermembrana",mitochondria_matrix:"Matriz mitocondrial",glycogen_granule:"Gránulo de glucógeno",muscle:"Músculo · citosol",blood:"Sangre",liver:"Hepatocito · citosol"};

/* Reacciones de transporte añadidas para cerrar el circuito con la sangre */
const SYN = [
  {id:"rx_glut",name:"Entrada de glucosa por difusión facilitada",ecNumber:"TC 2.A.1.1",fromNodeId:"glucose_ext",toNodeId:"glucose_cyt",reversible:true,deltaG0:0,enzymeName:"Transportadores GLUT (GLUT1–GLUT4)",enzymeAbbreviation:"GLUT",pathway:"glycolysis",compartment:"cytosol",pathWayNotes:"GLUT2 (hígado, páncreas) tiene Km alta (~15–20 mM) y actúa como sensor de glucemia. GLUT4 (músculo, adipocito) se transloca a la membrana en respuesta a la insulina y al ejercicio.",synthetic:true},
  {id:"rx_glut_out",name:"Salida de glucosa a la sangre",ecNumber:"TC 2.A.1.1",fromNodeId:"glucose_free",toNodeId:"glucose_ext",reversible:true,deltaG0:0,enzymeName:"GLUT2 hepático",enzymeAbbreviation:"GLUT2",pathway:"gluconeogenesis",compartment:"cytosol",pathWayNotes:"Solo hígado y riñón (y en menor grado intestino) liberan glucosa libre, porque son los que expresan glucosa-6-fosfatasa. El músculo no puede exportar glucosa.",synthetic:true}
];
const RX = D.REACTIONS.concat(SYN);
const RXM = Object.fromEntries(RX.map(r=>[r.id,r]));
const MET = Object.fromEntries(D.METABOLITES.map(m=>[m.id,m]));

/* ======================= Disposición ======================= */
/* [x, y, posición de etiqueta] en un lienzo de 1800 × 1420 */
const L = {
  glucose_ext:[560,58,"r"], glucose_cyt:[560,180,"r"], g6p:[560,292,"l"], f6p:[560,410,"l"], f16bp:[560,520,"l"],
  dhap:[420,612,"l"], gap:[560,640,"r"], bpg13:[560,742,"l"], pg3:[560,832,"l"], pg2:[560,912,"l"], pep:[560,992,"l"],
  pyruvate_cyt:[560,1092,"b"], lactate_cyt:[395,1092,"b"],
  glucose_free:[400,180,"l"],
  galactose:[140,238,"b"], gal1p:[292,238,"b"], galactitol:[60,160,"l"], mannose:[140,360,"b"], man6p:[300,388,"b"],
  fructose_diet:[140,505,"b"], f1p:[292,545,"b"], glyceraldehyde:[420,728,"b"],
  glycerol_3p:[262,705,"l"], triacylglycerol:[198,858,"b"],
  lactone_6p:[705,196,"t"], gluconate_6p:[845,196,"t"], ru5p:[985,196,"t"], r5p:[1125,196,"t"],
  g1p:[722,326,"b"], udpg:[872,326,"b"], glycogen:[1035,326,"r"],
  oaa_cyt:[690,935,"r"], oxaloacetate_cyt:[690,935,"r"],
  citrate_cyt:[1190,566,"t"], acetyl_coa_cyt:[1330,566,"t"], malonyl_coa:[1470,566,"t"], palmitate:[1610,566,"t"],
  acyl_coa_cyt:[1610,646,"r"], acyl_carnitine:[1610,712,"r"], acyl_coa_mito:[1570,806,"b"],
  pyruvate_mito:[900,1082,"b"], acetyl_coa:[1040,866,"t"], ketone_bodies:[905,800,"b"],
  malate_shuttle_hub:[770,806,"l"],
  complex_1:[880,1240,"t"], complex_2:[1010,1240,"t"], coenzyme_q:[1125,1240,"b"], complex_3:[1240,1240,"t"],
  cytochrome_c:[1345,1290,"r"], complex_4:[1445,1240,"t"], atp_synthase:[1600,1240,"t"], proton_gradient:[1180,1306,"b"]
};
const KC = {x:1250,y:994,r:120};
const KREBS = ["citrate","isocitrate","alpha_ketoglutarate","succinyl_coa","succinate","fumarate","malate","oxaloacetate"];
KREBS.forEach((id,i)=>{ const a=(-90+i*45)*Math.PI/180; const lp=["t","r","r","r","b","l","l","l"][i];
  L[id]=[KC.x+KC.r*Math.cos(a), KC.y+KC.r*Math.sin(a), lp]; });
/* trazados especiales */
const ROUTE = {
  rx_nonox_recycle:{via:[[1190,262],[1196,452],[740,462]]},
  rx_galt:{via:[[430,250],[640,262]]},
  rx_gp:{via:[[878,402]]},
  rx_malate_aspartate_shuttle:{via:[[770,806]]},
  rx_fructose_muscle:{bend:-28},
  rx_glut_out:{bend:-30},
  rx_etc_c1:{bend:-46},
  rx_pfk1:{bend:20}, rx_fbpase1:{bend:20},
  rx_g6pase:{bend:0},
  rx_oaa_export:{bend:-22},
  rx_beta_oxidation:{bend:-26},
  rx_etc_c5:{bend:30},
  rx_aldose_reductase_gal:{bend:-18}
};
const PROTEIN = new Set(["complex_1","complex_2","coenzyme_q","complex_3","complex_4","atp_synthase"]);
const nodeR = id => PROTEIN.has(id)?26 : id==="proton_gradient"?20 : id==="cytochrome_c"?13 : id==="malate_shuttle_hub"||id==="acyl_carnitine"?12 : (MET[id]&&MET[id].isBranchPoint)?19:15;

/* ======================= Estados fisiológicos ======================= */
const GLY_REV = ["rx_pgi","rx_aldo_a","rx_tpi","rx_gapdh","rx_pgk","rx_pgm_glyc","rx_eno"];
const rev = (v)=>Object.fromEntries(GLY_REV.map(k=>[k,v]));
const STATES = [
 {id:"fed",name:"Postprandial",tissue:"Hepatocito",c:"var(--pw-glycolysis)",
  sig:{Insulina:.95,"Glucagón":.1,Adrenalina:.1,"AMP/ATP":.15,"Demanda NADPH":.55},
  pw:{glycolysis:.9,gluconeogenesis:0,pentose_phosphate:.6,glycogen_metabolism:.9,monosaccharide_entry:.45,mitochondrial_fate:.8,krebs_cycle:.7,electron_transport:.7,lipid_metabolism:.85},
  rx:{rx_gp:.04,rx_acc:.9,rx_fas:.9,rx_tag_synth:.75,rx_acyl_coa_synth:0,rx_cpt1:0,rx_cact_cpt2:0,rx_beta_oxidation:0,rx_ketogenesis:0,rx_glut_out:0,rx_ldh:.1,rx_pyruvate_carboxylase:.1,rx_oaa_export:0,rx_pepck:0,rx_g6pase:0,rx_fbpase1:0,rx_galk:.4,rx_galt:.4,rx_aldose_reductase_gal:.02},
  notes:["La insulina activa la proteína fosfatasa 1: la glucógeno sintasa queda desfosforilada (activa) y la fosforilasa inactiva.","La PFK-2 desfosforilada fabrica fructosa-2,6-bisfosfato y la PFK-1 trabaja a pleno rendimiento.","Control recíproco: La ACC1 fabrica Malonil-CoA que bloquea al 100% a la CPT-1 (Ki ≈ 2,7 µM). La síntesis de palmitato está activa y la β-oxidación apagada (evita ciclo fútil)."]},
 {id:"fast",name:"Ayuno nocturno",tissue:"Hepatocito · 12–24 h",c:"var(--pw-gluconeogenesis)",
  sig:{Insulina:.12,"Glucagón":.85,Adrenalina:.3,"AMP/ATP":.35,"Demanda NADPH":.2},
  pw:{glycolysis:.08,gluconeogenesis:1,pentose_phosphate:.15,glycogen_metabolism:.05,monosaccharide_entry:.05,mitochondrial_fate:.4,krebs_cycle:.5,electron_transport:.8,lipid_metabolism:.05},
  rx:Object.assign(rev(-.8),{rx_acc:0,rx_fas:0,rx_citrate_export:0,rx_acly:0,rx_tag_synth:0,rx_ldh:-.8,rx_gp:1,rx_pgm_glycogen:-.9,rx_mpc:.8,rx_pdh:.12,rx_malate_aspartate_shuttle:.3,rx_gpd1:-.6,rx_acyl_coa_synth:.85,rx_cpt1:1,rx_cact_cpt2:1,rx_beta_oxidation:1,rx_ketogenesis:.45,rx_glut:0,rx_glut_out:1}),
  notes:["El glucagón eleva el AMPc y la PKA fosforila la PFK-2 (domina la FBPasa-2), la piruvato quinasa L y la glucógeno sintasa: todas se apagan.","La ACC1 se fosforila e inactiva (AMPK y PKA): la síntesis de palmitato se apaga al 0% y desaparece la Malonil-CoA.","Sin Malonil-CoA, la CPT-1 se desinhibe por completo: los ácidos grasos de la lipólisis adiposa entran a la mitocondria y la β-oxidación genera ATP y NADH para la gluconeogénesis."]},
 {id:"keto",name:"Ayuno prolongado",tissue:"Hepatocito · > 3 días",c:"var(--pw-lipid)",
  sig:{Insulina:.05,"Glucagón":1,Adrenalina:.35,"AMP/ATP":.4,"Demanda NADPH":.15},
  pw:{glycolysis:.05,gluconeogenesis:.8,pentose_phosphate:.1,glycogen_metabolism:.02,monosaccharide_entry:0,mitochondrial_fate:.3,krebs_cycle:.25,electron_transport:.75,lipid_metabolism:.03},
  rx:Object.assign(rev(-.65),{rx_acc:0,rx_fas:0,rx_citrate_export:0,rx_acly:0,rx_tag_synth:0,rx_ldh:-.5,rx_gp:.05,rx_pgm_glycogen:-.05,rx_mpc:.6,rx_pdh:.05,rx_gpd1:-.8,rx_acyl_coa_synth:1,rx_cpt1:1,rx_cact_cpt2:1,rx_beta_oxidation:1,rx_ketogenesis:1,rx_glut:0,rx_glut_out:.7,rx_cs:.2}),
  notes:["El glucógeno hepático se agota en 24–36 h: la glucemia depende solo de la gluconeogénesis.","El oxalacetato se desvía a gluconeogénesis y el acetil-CoA de la β-oxidación no cabe en el ciclo de Krebs: se convierte en cuerpos cetónicos.","El cerebro llega a cubrir cerca de dos tercios de su energía con β-hidroxibutirato y acetoacetato, y así se ahorra proteína muscular."]},
 {id:"run",name:"Sprint",tissue:"Músculo esquelético",c:"var(--pw-krebs)",
  sig:{Insulina:.2,"Glucagón":.2,Adrenalina:1,"AMP/ATP":.95,"Demanda NADPH":.05},
  pw:{glycolysis:1,gluconeogenesis:0,pentose_phosphate:.04,glycogen_metabolism:0,monosaccharide_entry:0,mitochondrial_fate:.7,krebs_cycle:1,electron_transport:1,lipid_metabolism:0},
  rx:{rx_ldh:1,rx_gp:1,rx_pgm_glycogen:-1,rx_glut:.7,rx_pdh:.8,rx_acc:0,rx_fas:0,rx_acyl_coa_synth:.35,rx_cpt1:.35,rx_cact_cpt2:.35,rx_beta_oxidation:.35,rx_malate_aspartate_shuttle:.3},
  notes:["La adrenalina (vía PKA) y el Ca²⁺ de la contracción activan la fosforilasa quinasa: el glucógeno muscular se moviliza en segundos.","El AMP activa por alosterismo la PFK-1 y la fosforilasa b; la AMPK detecta el déficit energético.","Cuando la demanda supera la capacidad oxidativa, la LDH reduce el piruvato a lactato para regenerar NAD⁺ y mantener viva la glucólisis."]},
 {id:"rbc",name:"Estrés oxidativo",tissue:"Eritrocito",c:"var(--pw-pentose)",
  sig:{Insulina:.3,"Glucagón":.3,Adrenalina:.1,"AMP/ATP":.4,"Demanda NADPH":1},
  pw:{glycolysis:.6,gluconeogenesis:0,pentose_phosphate:1,glycogen_metabolism:0,monosaccharide_entry:0,mitochondrial_fate:0,krebs_cycle:0,electron_transport:0,lipid_metabolism:0},
  rx:{rx_ldh:.9,rx_glut:.8},noMito:true,
  notes:["El eritrocito no tiene mitocondrias: todo su ATP sale de la glucólisis anaerobia y termina en lactato.","La G6PDH es su única fuente de NADPH, imprescindible para regenerar el glutatión reducido.","Sin NADPH, la hemoglobina se oxida y precipita (cuerpos de Heinz): es la hemólisis del favismo tras habas, primaquina o infecciones."]},
 {id:"fru",name:"Sobrecarga de fructosa",tissue:"Hepatocito",c:"var(--pw-mono)",
  sig:{Insulina:.5,"Glucagón":.15,Adrenalina:.1,"AMP/ATP":.6,"Demanda NADPH":.7},
  pw:{glycolysis:.9,gluconeogenesis:.1,pentose_phosphate:.4,glycogen_metabolism:.3,monosaccharide_entry:0,mitochondrial_fate:.9,krebs_cycle:.6,electron_transport:.7,lipid_metabolism:1},
  rx:{rx_khk:1,rx_aldolase_b:1,rx_triose_kinase:1,rx_acc:.95,rx_fas:.95,rx_tag_synth:1,rx_acyl_coa_synth:0,rx_cpt1:0,rx_cact_cpt2:0,rx_beta_oxidation:0,rx_hk:.25,rx_pgi:.25,rx_pfk1:.15,rx_aldo_a:.15,rx_gp:0,rx_ketogenesis:0,rx_glut_out:.1,rx_ldh:.3,rx_g6pase:.1,rx_fbpase1:0,rx_pyruvate_carboxylase:.05,rx_oaa_export:0,rx_pepck:0},
  notes:["La fructoquinasa no está regulada y la aldolasa B rompe la fructosa-1-P en triosas que esquivan el control de la PFK-1.","El exceso de triosas alimenta la lipogénesis de novo y la síntesis de triacilgliceroles: es la base de la esteatosis hepática (MASLD).","La fosforilación masiva gasta ATP y fosfato; el AMP sobrante se degrada a ácido úrico (hiperuricemia)."]}
];
let ST = STATES[0];
let focusPw = null;      // ruta aislada
/* al aislar una ruta se ve el camino completo: la gluconeogénesis reutiliza los pasos reversibles
   de la glucólisis, parte del lactato o del glicerol y termina con la glucosa saliendo a la sangre */
const PW_EXTRA = {
  gluconeogenesis: ["rx_ldh","rx_mpc","rx_eno","rx_pgm_glyc","rx_pgk","rx_gapdh","rx_tpi","rx_aldo_a","rx_pgi","rx_gpd1","rx_glut_out"],
};
const inPw = (r, pw) => r.pathway===pw || (PW_EXTRA[pw]||[]).includes(r.id);
function pwNodeIn(id, pw){ return RX.some(r => inPw(r,pw) && (r.fromNodeId===id || r.toNodeId===id)); }
let block = null;        // reacción bloqueada (enfermedad)
let blockAcc = new Set(), blockDef = new Set();
let playing = !RM;

let tissueTab = "matrix";
let tissueSelectedId = "liver";
let tissueFilter = null; // null | "universal" | "liver" | "muscle" | "brain" | "adipose" | "rbc" | "heart" | "kidney"

const TISSUE_PW_MAP = {
  universal: ["glycolysis", "krebs_cycle", "electron_transport", "pentose_phosphate"],
  liver: ["glycolysis", "gluconeogenesis", "pentose_phosphate", "glycogen_metabolism", "monosaccharide_entry", "mitochondrial_fate", "krebs_cycle", "electron_transport", "lipid_metabolism"],
  muscle: ["glycolysis", "glycogen_metabolism", "mitochondrial_fate", "krebs_cycle", "electron_transport", "lipid_metabolism"],
  brain: ["glycolysis", "mitochondrial_fate", "krebs_cycle", "electron_transport", "pentose_phosphate"],
  adipose: ["glycolysis", "pentose_phosphate", "lipid_metabolism", "krebs_cycle", "electron_transport"],
  rbc: ["glycolysis", "pentose_phosphate"],
  heart: ["glycolysis", "mitochondrial_fate", "krebs_cycle", "electron_transport", "lipid_metabolism"],
  kidney: ["glycolysis", "gluconeogenesis", "mitochondrial_fate", "krebs_cycle", "electron_transport", "pentose_phosphate"]
};

function isRxAbsentInTissue(r, tId) {
  if (!tId) return false;
  if (tId === "universal") {
    if (["gluconeogenesis", "lipid_metabolism", "glycogen_metabolism", "monosaccharide_entry"].includes(r.pathway)) return true;
    if (["rx_g6pase", "rx_fbpase1", "rx_pyruvate_carboxylase", "rx_pepck", "rx_ketogenesis"].includes(r.id)) return true;
    return false;
  }
  if (tId === "muscle") {
    if (["rx_g6pase", "rx_fbpase1", "rx_pepck", "rx_pyruvate_carboxylase", "rx_ketogenesis", "rx_glut_out"].includes(r.id)) return true;
  }
  if (tId === "brain") {
    if (r.pathway === "lipid_metabolism" && r.id !== "rx_ketogenesis") return true;
    if (["rx_g6pase", "rx_fbpase1", "rx_pepck", "rx_pyruvate_carboxylase", "rx_glut_out"].includes(r.id)) return true;
  }
  if (tId === "rbc") {
    if (r.compartment !== "cytosol") return true;
    if (["rx_mpc", "rx_citrate_export", "rx_oaa_export", "rx_malate_aspartate_shuttle"].includes(r.id)) return true;
    if (r.pathway === "lipid_metabolism" || r.pathway === "gluconeogenesis" || r.pathway === "glycogen_metabolism") return true;
  }
  if (tId === "adipose") {
    if (["rx_g6pase", "rx_fbpase1", "rx_pepck", "rx_pyruvate_carboxylase", "rx_ketogenesis", "rx_glut_out"].includes(r.id)) return true;
  }
  if (tId === "heart") {
    if (["rx_g6pase", "rx_fbpase1", "rx_pepck", "rx_pyruvate_carboxylase", "rx_ketogenesis", "rx_glut_out"].includes(r.id)) return true;
  }
  return false;
}

function flux(r){
  if(block===r.id) return 0;
  if(tissueFilter && isRxAbsentInTissue(r, tissueFilter)) return 0;
  let f = (r.id in ST.rx) ? ST.rx[r.id] : (ST.pw[r.pathway] ?? 0);
  const noMito = ST.noMito || tissueFilter === "rbc";
  if(noMito && (r.compartment!=="cytosol" || ["rx_mpc","rx_citrate_export","rx_oaa_export","rx_malate_aspartate_shuttle"].includes(r.id))) f = 0;
  if(block && blockDef.has(r.fromNodeId) && r.fromNodeId!==RXM[block].fromNodeId) f *= .25;
  return f;
}

/* ======================= Geometría ======================= */
function catmull(P, seg=14){
  const out=[]; const p=[P[0],...P,P[P.length-1]];
  for(let i=1;i<p.length-2;i++){
    for(let t=0;t<seg;t++){ const s=t/seg, s2=s*s, s3=s2*s;
      const f=(a,b,c,d)=>.5*((2*b)+(-a+c)*s+(2*a-5*b+4*c-d)*s2+(-a+3*b-3*c+d)*s3);
      out.push([f(p[i-1][0],p[i][0],p[i+1][0],p[i+2][0]), f(p[i-1][1],p[i][1],p[i+1][1],p[i+2][1])]); }
  }
  out.push(P[P.length-1]); return out;
}
function quad(a,c,b,n=28){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]);}return o;}
function trim(pts, a, b){
  const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const T=cum[cum.length-1]; if(T<a+b+6) return pts;
  const at=s=>{let i=1;while(i<cum.length-1&&cum[i]<s)i++;const k=(s-cum[i-1])/((cum[i]-cum[i-1])||1);return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*k,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*k];};
  const o=[at(a)]; for(let i=0;i<pts.length;i++) if(cum[i]>a&&cum[i]<T-b) o.push(pts[i]); o.push(at(T-b)); return o;
}
function geom(r){
  const A=L[r.fromNodeId], B=L[r.toNodeId]; if(!A||!B) return null;
  let pts;
  const ia=KREBS.indexOf(r.fromNodeId), ib=KREBS.indexOf(r.toNodeId);
  if(ia>=0 && ib>=0 && r.pathway==="krebs_cycle"){
    let a0=-90+ia*45, a1=-90+ib*45; if(a1<=a0) a1+=360; pts=[];
    for(let i=0;i<=20;i++){const a=(a0+(a1-a0)*i/20)*Math.PI/180; pts.push([KC.x+KC.r*Math.cos(a),KC.y+KC.r*Math.sin(a)]);}
  } else {
    const R=ROUTE[r.id]||{};
    if(R.via){ pts=catmull([A,...R.via,B]); }
    else if(R.bend){ const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2, dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;
      pts=quad(A,[mx-dy/len*R.bend*2,my+dx/len*R.bend*2],B); }
    else pts=[A,B];
  }
  pts = trim(pts, nodeR(r.fromNodeId)+3, nodeR(r.toNodeId)+7);
  const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return {pts,cum,len:cum[cum.length-1],d:"M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")};
}
function pointAt(g,s){ const c=g.cum; let lo=0,hi=c.length-1; while(hi-lo>1){const m=(lo+hi)>>1; if(c[m]<s) lo=m; else hi=m;}
  const k=(s-c[lo])/((c[hi]-c[lo])||1); return [g.pts[lo][0]+(g.pts[hi][0]-g.pts[lo][0])*k, g.pts[lo][1]+(g.pts[hi][1]-g.pts[lo][1])*k]; }

/* ======================= Construcción del SVG ======================= */
const svg = $("#map");
const el = (tag, attrs={}, parent) => { const e=document.createElementNS(NS,tag); for(const k in attrs){ const v=attrs[k]; if((k==="fill"||k==="stroke")&&typeof v==="string"&&v.includes("var(")) e.style.setProperty(k,v); else e.setAttribute(k,v);} if(parent) parent.appendChild(e); return e; };
let VB = {x:-60,y:-190,w:1920,h:1720};
const setVB = ()=>svg.setAttribute("viewBox",`${VB.x} ${VB.y} ${VB.w} ${VB.h}`);
setVB(); svg.setAttribute("preserveAspectRatio","xMidYMid meet");

const defs = el("defs",{},svg);
defs.innerHTML = `
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
 <radialGradient id="mitoFill" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="var(--mito-fill-a)" stop-opacity=".55"/><stop offset="1" stop-color="var(--mito-fill-b)" stop-opacity=".35"/></radialGradient>
 <radialGradient id="cellFill" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="var(--cell-a)" stop-opacity=".7"/><stop offset="1" stop-color="var(--cell-b)" stop-opacity=".2"/></radialGradient>
 <radialGradient id="cytoGrad" cx="44%" cy="40%" r="68%"><stop offset="0" stop-color="var(--cyto-1)"/><stop offset=".72" stop-color="var(--cyto-2)"/><stop offset="1" stop-color="var(--cyto-3)"/></radialGradient>
 <radialGradient id="mitoGrad" cx="40%" cy="32%" r="78%"><stop offset="0" stop-color="var(--mito-1)"/><stop offset="1" stop-color="var(--mito-2)"/></radialGradient>
 <radialGradient id="matrixGrad" cx="42%" cy="36%" r="72%"><stop offset="0" stop-color="var(--matrix-1)"/><stop offset="1" stop-color="var(--matrix-2)"/></radialGradient>
 <radialGradient id="nucGrad" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="var(--nuc-1)"/><stop offset="1" stop-color="var(--nuc-2)"/></radialGradient>
 <radialGradient id="dropGrad" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="var(--drop-1)"/><stop offset=".65" stop-color="var(--drop-2)"/><stop offset="1" stop-color="var(--drop-3)"/></radialGradient>
 <radialGradient id="glyGrad" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="var(--gly-1)"/><stop offset="1" stop-color="var(--gly-2)"/></radialGradient>
 <radialGradient id="shine" cx="34%" cy="26%" r="42%"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <filter id="cellShadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="var(--cell-shadow)" flood-opacity=".28"/></filter>
 <filter id="orgShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="var(--cell-shadow)" flood-opacity=".3"/></filter>
 <filter id="edgeBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="22"/></filter>
 <pattern id="chrom" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="var(--nuc)" stroke-width="1.2" opacity=".35"/></pattern>`;
Object.entries(PW).forEach(([k,v])=>{
  defs.insertAdjacentHTML("beforeend",`<marker id="m-${k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${v.c}"/></marker>`);
});

cssify(defs);
const gGrid = el("g",{class:"atlas-grid"},svg), gComp = el("g",{},svg), gCase=el("g",{class:"casing-g"},svg), gEdges=el("g",{filter:"url(#glow)",class:"edges-g"},svg), gHits=el("g",{},svg), gPart=el("g",{class:"parts-g"},svg), gNodes=el("g",{},svg), gFx=el("g",{class:"fx-g"},svg), gFxMs=el("g",{class:"ms-fx"},svg);


/* cuadrícula de atlas: columnas A–L, filas 1–9 */
const GRID = {x0:10, y0:-20, x1:1790, y1:1430, cols:12, rows:9};
GRID.cw=(GRID.x1-GRID.x0)/GRID.cols; GRID.ch=(GRID.y1-GRID.y0)/GRID.rows;
const gridRef=(x,y)=>{ const c=Math.min(GRID.cols-1,Math.max(0,Math.floor((x-GRID.x0)/GRID.cw))); const r=Math.min(GRID.rows-1,Math.max(0,Math.floor((y-GRID.y0)/GRID.ch))); return "ABCDEFGHIJKL"[c]+(r+1); };
(function drawGrid(){
  const {x0,y0,x1,y1,cols,rows,cw,ch}=GRID, B=11; let h="";
  for(let i=1;i<cols;i++) h+=`<line class="grid-line" x1="${x0+i*cw}" y1="${y0}" x2="${x0+i*cw}" y2="${y1}"/>`;
  for(let j=1;j<rows;j++) h+=`<line class="grid-line" x1="${x0}" y1="${y0+j*ch}" x2="${x1}" y2="${y0+j*ch}"/>`;
  h+=`<rect class="grid-frame" x="${x0-B}" y="${y0-B}" width="${x1-x0+2*B}" height="${y1-y0+2*B}"/>`;
  for(let i=0;i<cols;i++){ const x=x0+i*cw, f=i%2?"grid-band-a":"grid-band-b";
    h+=`<rect class="${f}" x="${x}" y="${y0-B}" width="${cw}" height="${B}"/><rect class="${f}" x="${x}" y="${y1}" width="${cw}" height="${B}"/>`;
    h+=`<text class="grid-lbl" x="${x+cw/2}" y="${y0-B-9}" text-anchor="middle">${"ABCDEFGHIJKL"[i]}</text><text class="grid-lbl" x="${x+cw/2}" y="${y1+B+25}" text-anchor="middle">${"ABCDEFGHIJKL"[i]}</text>`; }
  for(let j=0;j<rows;j++){ const y=y0+j*ch, f=j%2?"grid-band-a":"grid-band-b";
    h+=`<rect class="${f}" x="${x0-B}" y="${y}" width="${B}" height="${ch}"/><rect class="${f}" x="${x1}" y="${y}" width="${B}" height="${ch}"/>`;
    h+=`<text class="grid-lbl" x="${x0-B-10}" y="${y+ch/2+7}" text-anchor="end">${j+1}</text><text class="grid-lbl" x="${x1+B+10}" y="${y+ch/2+7}">${j+1}</text>`; }
  h+=`<rect class="grid-neat" x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}"/>`;
  gGrid.innerHTML=h;
})();

/* compartimentos */
gComp.innerHTML = `
 <text class="comp-lbl" x="1740" y="70" text-anchor="end">Sangre · espacio extracelular</text>
 <g id="cell-3d"></g>
 <text class="comp-lbl comp-region" x="100" y="166">Citosol</text>
 <g opacity=".9"><rect x="540" y="98" width="40" height="28" rx="3" fill="var(--node-fill)" stroke="var(--pw-glycolysis)" stroke-width="1.6"/><text class="lbl-c" x="586" y="117">GLUT</text></g>
 <g><rect x="380" y="98" width="40" height="28" rx="3" fill="var(--node-fill)" stroke="var(--pw-gluconeogenesis)" stroke-width="1.6"/><text class="lbl-c" x="330" y="117">GLUT2</text></g>
 <g id="nuc-3d"></g>
 <text class="comp-lbl comp-region" x="210" y="1256" text-anchor="middle">Núcleo</text>
 <g id="drop-3d"></g>
 <text class="comp-lbl comp-region" x="118" y="770" style="fill:var(--lipid-lbl)">Gota lipídica</text>
 <g id="granule" opacity=".75"></g>
 <g id="mito">
  <g id="mito-3d"></g>
  <path id="inner" d="" fill="none" style="display:none"/>
  <text class="comp-lbl comp-region" x="1112" y="760" style="fill:var(--mito-lbl)">Matriz mitocondrial</text>
  <text class="comp-lbl comp-region" x="860" y="1325" style="fill:var(--mito-lbl)">Espacio intermembrana</text>
  <text id="nomito" class="comp-lbl comp-region" x="1242" y="1030" text-anchor="middle" style="fill:var(--pw-pentose);font-size:24px" opacity="0">Sin mitocondrias en el eritrocito</text>
 </g>
 <g id="lipid-zones">
  <rect x="1145" y="525" width="530" height="74" rx="4" fill="var(--pw-lipid)" fill-opacity=".05" stroke="var(--pw-lipid)" stroke-opacity=".4" stroke-dasharray="4 4"/>
  <text class="comp-lbl" x="1160" y="542" style="fill:var(--lipid-lbl);font-size:12px">Síntesis de palmitato (citosol, posprandial)</text>
  <g id="map-malonyl-inh" style="transition:opacity .3s">
   <path d="M 1470 582 C 1470 670, 1530 670, 1595 670" fill="none" stroke="var(--danger)" stroke-width="2" stroke-dasharray="4 3"/>
   <line x1="1595" y1="663" x2="1595" y2="677" stroke="var(--danger)" stroke-width="3" stroke-linecap="round"/>
   <rect x="1458" y="657" width="130" height="20" rx="3" fill="var(--node-fill)" stroke="var(--danger)" stroke-width="1.2"/>
   <text x="1523" y="671" text-anchor="middle" class="lbl-c" style="fill:var(--danger);font-size:11px;font-weight:700">Malonil-CoA ⊣ CPT-1</text>
  </g>
 </g>`;
cssify(gComp);

/* ===== Célula con volumen: citoplasma, bicapa lipídica y orgánulos ===== */
const CELL3D = (function(){
  let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  // recorrido de un rectángulo redondeado con normales hacia fuera
  function perim(x0,y0,x1,y1,r,step){
    const pts=[]; const segs=[];
    const W=x1-x0-2*r, H=y1-y0-2*r, arc=Math.PI*r/2;
    segs.push(["l",x0+r,y0,1,0,W],["a",x1-r,y0+r,-Math.PI/2,arc],["l",x1,y0+r,0,1,H],["a",x1-r,y1-r,0,arc],
              ["l",x1-r,y1,-1,0,W],["a",x0+r,y1-r,Math.PI/2,arc],["l",x0,y1-r,0,-1,H],["a",x0+r,y0+r,Math.PI,arc]);
    const total=2*W+2*H+4*arc; const n=Math.round(total/step);
    for(let i=0;i<n;i++){
      let d=i*total/n, k=0; while(k<segs.length-1 && d>segs[k][segs[k][0]==="l"?5:4]){ d-=segs[k][segs[k][0]==="l"?5:4]; k++; }
      const S=segs[k];
      if(S[0]==="l"){ const [,sx,sy,dx,dy]=S; pts.push([sx+dx*d, sy+dy*d, dy, -dx, i*total/n]); }
      else { const [,cx,cy,a0]=S; const a=a0+d/r; pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r, Math.cos(a), Math.sin(a), i*total/n]); }
    }
    return pts;
  }
  const off=(pts,o,wob)=>pts.map(([x,y,nx,ny,t])=>{ const w=wob?wob(t):0; return [x+nx*(o+w), y+ny*(o+w)]; });
  const path=(P)=>"M"+P.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join("L")+"Z";
  // bicapa: cabezas polares (puntos) a ambos lados y colas (rayas) en el centro
  function bilayer(g,pts,half,head,wob,cls){
    const mid=path(off(pts,0,wob)), out=path(off(pts,half,wob)), inn=path(off(pts,-half,wob));
    el("path",{d:mid,class:"bl-tail-band "+cls,"stroke-width":half*2-head*.6},g);
    el("path",{d:mid,class:"bl-tails "+cls,"stroke-width":half*2-head*1.4,"stroke-dasharray":`1 ${(head*1.05).toFixed(2)}`},g);
    [out,inn].forEach(d=>el("path",{d,class:"bl-heads "+cls,"stroke-width":head,"stroke-dasharray":`0 ${(head*1.18).toFixed(2)}`},g));
    return {mid,out,inn};
  }
  const wobCell=t=>7*Math.sin(t*.0031)+3.2*Math.sin(t*.0117+1.3);

  /* --- célula --- */
  const gc=$("#cell-3d");
  const cp=perim(60,112,1750,1380,96,6.2);
  const cellD=path(off(cp,0,wobCell));
  el("path",{d:cellD,fill:"url(#cytoGrad)",filter:"url(#cellShadow)"},gc);
  defs.insertAdjacentHTML("beforeend",`<clipPath id="cellClip"><path d="${cellD}"/></clipPath>`);
  const inner=el("g",{"clip-path":"url(#cellClip)"},gc);
  el("path",{d:cellD,class:"cyto-edge",fill:"none","stroke-width":90,filter:"url(#edgeBlur)"},inner);
  // citoesqueleto: filamentos tenues que salen del núcleo
  for(let i=0;i<11;i++){
    const a=-1.5+i*0.16+rnd()*.12, L1=520+rnd()*900;
    const x0=230+Math.cos(a)*170, y0=1235+Math.sin(a)*120;
    const x1=x0+Math.cos(a)*L1, y1=y0+Math.sin(a)*L1*.9;
    const mx=(x0+x1)/2+(rnd()-.5)*520, my=(y0+y1)/2+(rnd()-.5)*520;
    el("path",{d:`M${x0.toFixed(0)} ${y0.toFixed(0)} Q${mx.toFixed(0)} ${my.toFixed(0)} ${x1.toFixed(0)} ${y1.toFixed(0)}`,class:"cytoskel"},inner);
  }
  // ribosomas libres
  const avoid=(x,y)=> (x>750&&x<1735&&y>680&&y<1365) || ((x-210)**2/175**2+(y-1250)**2/130**2<1) || ((x-198)**2+(y-858)**2<95**2);
  let rib="";
  for(let i=0;i<900;i++){ const x=70+rnd()*1670, y=120+rnd()*1250; if(avoid(x,y)) continue; rib+=`M${x.toFixed(0)} ${y.toFixed(0)}h0.01`; }
  el("path",{d:rib,class:"ribo"},inner);
  // retículo endoplásmico rugoso alrededor del núcleo
  for(let k=1;k<=4;k++){
    const rx=140+k*24, ry=96+k*19, a0=2.2, a1=4.75-k*.04; let d="";
    for(let a=a0;a<=a1;a+=0.04){ const w=3*Math.sin(a*9+k); const x=210+Math.cos(a)*(rx+w), y=1250+Math.sin(a)*(ry+w); d+=(d?"L":"M")+x.toFixed(1)+" "+y.toFixed(1); }
    el("path",{d,class:"er-sheet"},inner); el("path",{d,class:"er-ribo"},inner);
  }
  bilayer(gc,cp,8.5,6.2,wobCell,"bl-cell");

  /* --- núcleo --- */
  const gn=$("#nuc-3d");
  el("ellipse",{cx:210,cy:1250,rx:146,ry:102,class:"nuc-env",filter:"url(#orgShadow)"},gn);
  el("ellipse",{cx:210,cy:1250,rx:138,ry:94,fill:"url(#nucGrad)"},gn);
  el("ellipse",{cx:210,cy:1250,rx:138,ry:94,fill:"url(#chrom)",opacity:.6},gn);
  el("ellipse",{cx:250,cy:1228,rx:34,ry:26,class:"nucleolus"},gn);
  el("ellipse",{cx:210,cy:1250,rx:146,ry:102,fill:"none",class:"nuc-mem"},gn);
  el("ellipse",{cx:210,cy:1250,rx:138,ry:94,fill:"none",class:"nuc-mem"},gn);
  for(let a=0;a<Math.PI*2;a+=Math.PI/9){ const x=210+Math.cos(a)*142, y=1250+Math.sin(a)*98; el("circle",{cx:x,cy:y,r:4.2,class:"nuc-pore"},gn); }
  el("ellipse",{cx:210,cy:1250,rx:138,ry:94,fill:"url(#shine)",opacity:.55},gn);

  /* --- gota lipídica --- */
  const gd=$("#drop-3d");
  el("circle",{cx:198,cy:858,r:74,fill:"url(#dropGrad)",filter:"url(#orgShadow)"},gd);
  el("circle",{cx:198,cy:858,r:74,fill:"none",class:"drop-mono"},gd);
  el("circle",{cx:198,cy:858,r:74,fill:"url(#shine)"},gd);

  /* --- mitocondria: membrana externa (bicapa), espacio intermembrana y matriz --- */
  const gm=$("#mito-3d");
  const mp=perim(770,700,1715,1345,150,4.6);
  const wobM=t=>2.2*Math.sin(t*.011+.4);
  const mD=path(off(mp,0,wobM));
  el("path",{d:mD,fill:"url(#mitoGrad)",filter:"url(#orgShadow)"},gm);
  bilayer(gm,mp,5.5,3.8,wobM,"bl-mito");
  return {gm};
})();
cssify(gComp); cssify(defs);
/* membrana interna con crestas */
(function(){
  const x0=796,y0=726,x1=1690,y1=1238,r=126; let d=`M${x0+r} ${y0} H${x1-r} A${r} ${r} 0 0 1 ${x1} ${y0+r}`;
  // crestas en el lado derecho
  let y=y0+r+30; d+=` V${y}`;
  for(let k=0;k<4;k++){ d+=` H${x1-62} a10 10 0 0 0 0 20 H${x1}`; y+=20; d+=` V${y+70}`; y+=70; }
  d+=` V${y1-r} A${r} ${r} 0 0 1 ${x1-r} ${y1} H${x0+r} A${r} ${r} 0 0 1 ${x0} ${y1-r} V${y0+r} A${r} ${r} 0 0 1 ${x0+r} ${y0}Z`;
  $("#inner").setAttribute("d",d);
  const gm=CELL3D.gm;
  el("path",{d,fill:"url(#matrixGrad)"},gm);
  // gránulos de la matriz
  let s2=11; const r2=()=> (s2=(s2*16807)%2147483647)/2147483647; let mg="";
  for(let i=0;i<160;i++){ const x=830+r2()*820, y=760+r2()*460; mg+=`M${x.toFixed(0)} ${y.toFixed(0)}h0.01`; }
  el("path",{d:mg,class:"mito-gran"},gm);
  el("path",{d,class:"im-outer",fill:"none"},gm);
  el("path",{d,class:"im-core",fill:"none"},gm);
  el("path",{d,class:"im-tails",fill:"none"},gm);
  el("rect",{x:830,y:712,width:820,height:230,rx:115,fill:"url(#shine)",opacity:.45},gm);
  cssify(gm);
  const g=$("#granule"); const [gx,gy]=L.glycogen;
  for(let i=0;i<34;i++){ const a=i*2.399, rr=8+Math.sqrt(i)*8.6; el("circle",{cx:gx+Math.cos(a)*rr,cy:gy+Math.sin(a)*rr,r:5.8-i*.06,fill:"url(#glyGrad)",stroke:"var(--gly-2)","stroke-opacity":.6,"stroke-width":.8},g); }
  el("text",{class:"comp-lbl comp-region",x:gx-40,y:gy+80,style:"fill:var(--gly-lbl)"},g).textContent="Gránulo";
})();

/* aristas */
const EDGES = [];
RX.forEach(r=>{
  const g=geom(r); if(!g) return;
  const c=PW[r.pathway].c;
  const cs=el("path",{d:g.d,class:"casing",fill:"none","stroke-linecap":"round"},gCase);
  const p=el("path",{d:g.d,class:"edge",fill:"none",stroke:c,"stroke-linecap":"round"},gEdges);
  if(r.id==="rx_malate_aspartate_shuttle") p.setAttribute("stroke-dasharray","2 9");
  const h=el("path",{d:g.d,class:"hit","data-rx":r.id},gHits);
  h.addEventListener("click",e=>{ if(dragMoved) return; onPick("rx",r.id); });
  h.addEventListener("mouseenter",()=>p.classList.add("edge-hover"));
  h.addEventListener("mouseleave",()=>p.classList.remove("edge-hover"));
  const tt=el("title",{},h); tt.textContent=`${r.enzymeAbbreviation} · ${r.name}`;
  EDGES.push({r,g,p,cs,h,parts:[],f:0});
});
/* complejos de la cadena respiratoria: incrustados en la membrana interna.
   Matriz hacia arriba (y<0), espacio intermembrana hacia abajo (y>0). */
function drawProtein(id,g0){
  const g=el("g",{transform:`scale(${id==="atp_synthase"?1.12:id==="coenzyme_q"?1.15:1.32})`},g0);
  const P=(d,cls)=>el("path",{d,class:cls},g), C=(cx,cy,r,cls)=>el("circle",{cx,cy,r,class:cls},g);
  const T=(x,y,t,cls="prot-num")=>{ const e=el("text",{x,y,"text-anchor":"middle",class:cls},g); e.textContent=t; return e; };
  const pump=(x,lx=x+1)=>{ P(`M${x} -30 V22`,"h-pump"); P(`M${x-4} 16 L${x} 23 L${x+4} 16`,"h-pump-head"); T(lx,35,"H⁺","h-lbl"); };
  let body;
  if(id==="complex_1"){
    // forma de L: brazo de membrana largo y brazo periférico hacia la matriz (NADH → FMN → Fe-S)
    body=P("M-44 -10 Q-46 -12 -40 -12 H6 Q4 -24 6 -36 Q8 -44 18 -44 H24 Q32 -44 31 -34 L28 -6 Q28 12 18 12 H-38 Q-46 12 -46 2 Z","prot");
    [[17,-35],[18,-26],[16,-17],[13,-8]].forEach(([x,y],i)=>C(x,y,i?2.4:3,i?"fes":"fmn"));
    P("M-40 0 H0","prot-groove"); T(-18,4,"I");
    pump(-32); pump(-6);
  } else if(id==="complex_2"){
    // anclaje de membrana y cabeza en la matriz (SDHA con FAD, SDHB con Fe-S); no bombea protones
    body=P("M-12 -9 Q-13 -12 -9 -12 H9 Q13 -12 12 -9 V9 Q12 12 8 12 H-8 Q-12 12 -12 9 Z","prot");
    C(-5,-27,14,"prot"); C(11,-33,10,"prot prot-b");
    C(-5,-27,3,"fmn"); C(11,-33,2.4,"fes"); C(2,-16,2.2,"fes");
    T(0,5,"II");
  } else if(id==="coenzyme_q"){
    // ubiquinona: anillo y cola de isopreno dentro de la bicapa
    P("M-12 2 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4","q-tail");
    body=P("M-24 -9 L-16 -14 L-8 -9 L-8 1 L-16 6 L-24 1 Z","q-ring");
    P("M-16 -14 V-20 M-24 1 L-29 4","q-tail");
    C(26,-1,5,"q-dot"); C(36,4,3.5,"q-dot"); C(-34,4,3.5,"q-dot");
  } else if(id==="complex_3"){
    // dímero (citocromo b y c1) con la proteína de Rieske asomando al espacio intermembrana
    body=P("M-30 -18 Q-32 -26 -22 -26 H-3 Q2 -26 1 -18 V14 Q1 20 -6 20 H-24 Q-31 20 -30 13 Z","prot");
    P("M3 -18 Q2 -26 8 -26 H24 Q32 -26 30 -18 V13 Q31 20 24 20 H6 Q-1 20 3 14 Z","prot prot-b");
    C(-6,24,6,"prot rieske"); C(10,24,6,"prot rieske");
    [[-16,-8],[-16,6],[16,-8],[16,6]].forEach(([x,y])=>P(`M${x-3} ${y} l3 -3 l3 3 l-3 3Z`,"heme"));
    pump(-24); pump(24);
  } else if(id==="complex_4"){
    // citocromo c oxidasa: hemos a y a3 y centros de cobre; reduce O₂ a H₂O en la matriz
    body=P("M-24 -16 Q-26 -26 -14 -26 H14 Q26 -26 24 -16 L22 14 Q20 22 8 22 H-8 Q-20 22 -22 14 Z","prot");
    P("M-3 -2 l3 -3 l3 3 l-3 3Z","heme"); P("M7 -2 l3 -3 l3 3 l-3 3Z","heme"); C(-12,14,2.6,"cu"); C(13,-12,2.4,"cu");
    pump(16,30);
  } else if(id==="atp_synthase"){
    // F₀ (anillo c en la membrana), tallo central γ, estator b y cabeza F₁ (α₃β₃) en la matriz
    body=el("ellipse",{rx:22,ry:12,class:"prot f0"},g);
    for(let i=-16;i<=16;i+=5.4) P(`M${i} -10 V10`,"f0-c");
    P("M-3 -10 V-36 H3 V-10Z","stalk");
    P("M21 -6 Q30 -6 30 -16 V-60 Q30 -68 22 -66","stator");
    for(let k=0;k<6;k++){ const a=k*Math.PI/3+Math.PI/6; C(Math.cos(a)*12,-52+Math.sin(a)*9,9,k%2?"prot f1-a":"prot f1-b"); }
    C(0,-52,4,"stalk");
    P("M-30 24 V-4","h-pump h-in"); P("M-34 2 L-30 -5 L-26 2","h-pump-head"); T(-30,36,"H⁺","h-lbl");
  }
  return body;
}

/* nodos */
const NODES = {};
D.METABOLITES.forEach(m=>{
  const P=L[m.id]; if(!P) return; const [x,y,lp]=P; const c=PW[m.pathways[0]]?.c||"var(--fg)";
  const g=el("g",{class:"node",transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`,tabindex:"0",role:"button","aria-label":m.name,"data-id":m.id},gNodes);
  const halo=el("circle",{class:"halo",r:nodeR(m.id)+14,fill:c,opacity:.0,filter:"url(#soft)"},g);
  let body;
  if(PROTEIN.has(m.id)){
    body = drawProtein(m.id, g);
  } else if(m.id==="proton_gradient"){
    body=el("circle",{r:18,fill:"var(--pw-etc)","fill-opacity":.05,stroke:"var(--pw-etc)","stroke-dasharray":"2 4"},g);
    [[-34,-6],[-14,6],[8,-8],[30,4],[-44,10],[48,-6]].forEach(([dx,dy])=>{ el("text",{x:dx,y:dy,class:"lbl-c",style:"fill:var(--pw-etc);font-size:11px;stroke-width:0;opacity:.6"},g).textContent="H⁺"; });
  } else {
    const R=nodeR(m.id);
    body=el("circle",{r:R,fill:"var(--node-fill)",stroke:c,"stroke-width":m.isBranchPoint?3:2},g);
    if(m.isBranchPoint) el("circle",{r:R+5,fill:"none",stroke:c,"stroke-opacity":.35,"stroke-dasharray":"2 4"},g);
    if(m.id==="cytochrome_c"){ body.setAttribute("class","prot"); body.style.fill=""; body.style.stroke=""; el("path",{d:"M-5 0 L0 -5 L5 0 L0 5Z",class:"heme"},g); }
    else el("circle",{r:R*.38,fill:c,opacity:.85},g);
    el("circle",{r:R-1.5,fill:"url(#shine)",class:"bead-shine"},g);
  }
  const R=nodeR(m.id)+(PROTEIN.has(m.id)?2:0);
  const pos = {b:[0,R+16,"middle"],t:[0,-R-18,"middle"],l:[-R-8,4,"end"],r:[R+8,4,"start"]}[lp||"b"];
  const t=el("text",{class:"lbl",x:pos[0],y:pos[1]+(lp==="t"?({atp_synthase:-33,complex_1:-18,complex_3:-8,complex_4:-8,complex_2:-16})[m.id]||0:0),"text-anchor":pos[2]},g); t.textContent=m.abbreviation;
  if(m.carbons>0){ const c2=el("text",{class:"lbl-c",x:pos[0],y:pos[1]+13+(lp==="t"?-30:0),"text-anchor":pos[2]},g); c2.textContent="C"+m.carbons; if(lp==="t") c2.setAttribute("y",pos[1]-15); }
  g.addEventListener("click",()=>{ if(dragMoved) return; onPick("node",m.id); });
  g.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); onPick("node",m.id);} });
  NODES[m.id]={g,halo,body,m};
});

/* ======================= Etiquetas de enzimas ======================= */
const KEY_MAP = new Set(["rx_hk","rx_pfk1","rx_pk","rx_pdh","rx_g6pdh","rx_gs","rx_gp","rx_cs","rx_idh","rx_akgdh","rx_fbpase1","rx_pyruvate_carboxylase","rx_pepck","rx_g6pase","rx_acc","rx_cpt1","rx_ketogenesis"]);
const isKey = r => r && (r.module ? !!(r.regulation&&r.regulation.isKeyRegulator) : KEY_MAP.has(r.id));
const SHORT = {rx_ketogenesis:"HMGCS2",rx_malate_aspartate_shuttle:"Mal-Asp",rx_citrate_export:"CIC",rx_etc_c5:"ATP sintasa",rx_beta_oxidation:"β-oxidación",rx_tag_synth:"GPAT / DGAT",rx_aldose_reductase_gal:"Aldosa Reductasa"};
const PILL_T = {rx_g6pase:.68,rx_g6pdh:.62,rx_pyruvate_carboxylase:.33,rx_ketogenesis:.6};
const shortAbbr = a => String(a||"").replace(/\s*\([^)]*\)/g,"").trim();
function enzPill(parent,x,y,r,fs){
  const key=isKey(r), dz=!!(r.regulation&&r.regulation.clinical), txt=SHORT[r.id]||shortAbbr(r.enzymeAbbreviation);
  const w=Math.round(txt.length*fs*.6+(key?fs*1.1:0)+fs*1.6), h=Math.round(fs*1.85);
  const g=el("g",{class:"enz pw-"+r.pathway+(key?" key":""),transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`,tabindex:"0",role:"button","aria-label":"Enzima "+r.enzymeName},parent);
  const rc=el("rect",{x:-w/2,y:-h/2,width:w,height:h,rx:3},g); rc.style.fill=PW[r.pathway].c;
  el("rect",{class:"sign-inner",x:-w/2+2.2,y:-h/2+2.2,width:w-4.4,height:h-4.4,rx:1.6},g);
  const t=el("text",{x:0,y:fs*.36,"text-anchor":"middle",style:`font-size:${fs}px`},g);
  if(key){ const s=document.createElementNS(NS,"tspan"); s.setAttribute("class","star"); s.textContent="★ "; t.appendChild(s); }
  t.appendChild(document.createTextNode(txt));
  if(dz) el("circle",{cx:w/2-fs*.2,cy:-h/2+fs*.2,r:fs*.34,class:"dz"},g);
  el("title",{},g).textContent=r.enzymeName+(key?" · paso regulador":"")+(dz?" · "+r.regulation.clinical.diseaseName:"");
  g.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); g.dispatchEvent(new MouseEvent("click")); } });
  return {g,w};
}
const gEnz = el("g",{},svg); svg.insertBefore(gEnz, gNodes);
let enzMode="key";
function drawEnz(){
  gEnz.innerHTML="";
  EDGES.forEach(E=>{ if(enzMode!=="all" && !KEY_MAP.has(E.r.id)) return; if(E.r.synthetic && enzMode!=="all") return; if(E.r.pathway==="electron_transport") return;
    const [x,y]=pointAt(E.g,E.g.len*(PILL_T[E.r.id]||.5)); const P=enzPill(gEnz,x,y,E.r,14); E.pill=P.g;
    P.g.addEventListener("click",()=>{ if(dragMoved) return; onPick("rx",E.r.id); }); });
}
drawEnz();

/* ======================= Aplicar estado ======================= */
function apply(){
  const act={};
  const isRbc = tissueFilter === "rbc" || ST.noMito;
  EDGES.forEach(E=>{
    const f=flux(E.r); E.f=f; const a=Math.abs(f);
    const isTissueIn = !tissueFilter || (TISSUE_PW_MAP[tissueFilter] && TISSUE_PW_MAP[tissueFilter].includes(E.r.pathway) && !isRxAbsentInTissue(E.r, tissueFilter));
    const inFocus = (!focusPw || inPw(E.r, focusPw)) && isTissueIn;
    const on = a>0.02 && isTissueIn;
    const sw = on ? 1.8+a*5.8 : 1.3;
    E.p.setAttribute("stroke-width", sw.toFixed(2));
    E.p.style.opacity = (!inFocus? .05 : on ? (.45+.55*a) : .3);
    E.cs.setAttribute("stroke-width", on ? (sw+2.8).toFixed(2) : 0);
    E.cs.style.opacity = (!inFocus? .04 : on ? (.35+.6*a) : 0);
    E.p.setAttribute("stroke-dasharray", E.r.id==="rx_malate_aspartate_shuttle" ? "2 9" : on? "" : "3 6");
    E.p.style.stroke = block===E.r.id ? "var(--danger)" : PW[E.r.pathway].c;
    const mk = `url(#m-${E.r.pathway})`;
    E.p.removeAttribute("marker-end"); E.p.removeAttribute("marker-start");
    if(on || (!E.r.reversible && isTissueIn)){ if(f<0) E.p.setAttribute("marker-start",mk); else E.p.setAttribute("marker-end",mk); }
    // partículas
    const want = (on && inFocus) ? Math.max(1,Math.round(a*Math.min(5,E.g.len/90))) : 0;
    while(E.parts.length<want){ const c=el("circle",{r:3.3,fill:PW[E.r.pathway].c},gPart); E.parts.push({c,s:Math.random()}); }
    while(E.parts.length>want){ E.parts.pop().c.remove(); }
    E.parts.forEach((P,i)=>{ P.s=(i/want + Math.random()*.15)%1; });
    [E.r.fromNodeId,E.r.toNodeId].forEach(n=>{ act[n]=Math.max(act[n]||0, inFocus?a:0); });
    if(E.pill) E.pill.style.opacity = inFocus? 1 : .12;
  });
  Object.values(NODES).forEach(N=>{
    const a=act[N.m.id]||0;
    const isTissueNode = !tissueFilter || N.m.pathways.some(p => TISSUE_PW_MAP[tissueFilter]?.includes(p));
    const inFocus = (!focusPw || N.m.pathways.includes(focusPw) || pwNodeIn(N.m.id, focusPw)) && isTissueNode;
    N.halo.style.opacity = (a*(document.documentElement.dataset.mode==="dark"?.5:0)).toFixed(2);
    N.g.style.opacity = inFocus ? (a>0.02? 1 : .5) : .14;
  });
  $("#nomito").setAttribute("opacity", isRbc ? 1 : 0);
  $("#mito").style.opacity = isRbc ? .25 : 1;
  const mapInh = $("#map-malonyl-inh");
  if(mapInh) mapInh.style.opacity = (ST.id==="fed" || ST.id==="fru") ? "1" : "0.2";
  drawFx(); drawHud(); placeParticles();
}

/* acumulación y déficit: restablecido a estado basal */
function setBlock(id){
  block=null; blockAcc=new Set(); blockDef=new Set();
  const ds=$("#disease"); if(ds) ds.value = "";
  apply();
}
function drawFx(){
  gFx.innerHTML="";
  if(block){ const r=RXM[block]; const E=EDGES.find(e=>e.r.id===block); if(E){ const [x,y]=pointAt(E.g,E.g.len/2);
      el("circle",{cx:x,cy:y,r:16,fill:"var(--node-fill)",stroke:"var(--danger)","stroke-width":2},gFx);
      el("path",{d:`M${x-7} ${y-7}L${x+7} ${y+7}M${x+7} ${y-7}L${x-7} ${y+7}`,stroke:"var(--danger)","stroke-width":3,"stroke-linecap":"round"},gFx); }
    blockAcc.forEach(id=>{ const P=L[id]; if(!P) return; el("circle",{cx:P[0],cy:P[1],r:nodeR(id)+9,fill:"none",stroke:"var(--danger)","stroke-width":2.5,class:"acc-ring"},gFx);
      const t=el("text",{x:P[0]+nodeR(id)+12,y:P[1]-nodeR(id)-4,class:"lbl-c",style:"fill:var(--danger);font-size:11px"},gFx); t.textContent="▲ acumula"; });
    blockDef.forEach(id=>{ const P=L[id]; if(!P) return; const t=el("text",{x:P[0]+nodeR(id)+12,y:P[1]+nodeR(id)+12,class:"lbl-c",style:"fill:var(--fg-dim);font-size:11px"},gFx); t.textContent="▼ déficit"; });
  }
  if(quiz && quiz.reveal){ const q=quiz.qs[quiz.i]; let x,y; if(q.kind==="rx"){ const E=EDGES.find(e=>e.r.id===q.id); [x,y]=pointAt(E.g,E.g.len/2);} else {[x,y]=L[q.id];}
    el("circle",{cx:x,cy:y,r:24,fill:"none",stroke:quiz.lastOk?"var(--pw-krebs)":"var(--pw-glycogen)","stroke-width":3,class:"pulse-ring"},gFx);
    el("circle",{cx:x,cy:y,r:22,fill:"none",stroke:quiz.lastOk?"var(--pw-krebs)":"var(--pw-glycogen)","stroke-width":2},gFx); }
}

/* animación */
let last=performance.now();
function placeParticles(dt=0){
  for(const E of EDGES){ if(!E.parts.length) continue; const a=Math.abs(E.f); const sp=(28+a*95)/E.g.len; const dir=E.f<0?-1:1;
    for(const P of E.parts){ P.s=(P.s+dir*sp*dt+1)%1; const [x,y]=pointAt(E.g,P.s*E.g.len); P.c.setAttribute("cx",x.toFixed(1)); P.c.setAttribute("cy",y.toFixed(1));
      const edge=Math.min(P.s,1-P.s); P.c.setAttribute("opacity",Math.min(1,edge*8).toFixed(2)); } }
}
function tick(t){ const dt=Math.min(.05,(t-last)/1000); last=t; if(playing && (currentView==="mapa"||currentView==="reto")) placeParticles(dt); if(playing && currentView==="ciclos") placeModParticles(dt); requestAnimationFrame(tick); }
requestAnimationFrame(tick);

/* ======================= Pan / zoom ======================= */
let dragMoved=false, drag=null; const ptrs=new Map();
function toSvg(cx,cy){ const pt=svg.createSVGPoint(); pt.x=cx; pt.y=cy; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
function zoomAt(f,cx,cy){ const p=toSvg(cx,cy); const nw=Math.min(2600,Math.max(260,VB.w*f)); f=nw/VB.w; VB.x=p.x-(p.x-VB.x)*f; VB.y=p.y-(p.y-VB.y)*f; VB.w*=f; VB.h*=f; setVB(); }
svg.addEventListener("wheel",e=>{ e.preventDefault(); zoomAt(Math.exp(e.deltaY*0.0016),e.clientX,e.clientY); },{passive:false});
svg.addEventListener("pointerdown",e=>{ ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); dragMoved=false;
  drag={sx:e.clientX,sy:e.clientY,vx:VB.x,vy:VB.y,scale:1/svg.getScreenCTM().a,pd:null}; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; drag.pd=Math.hypot(a.x-b.x,a.y-b.y); drag.vw=VB.w; } });
window.addEventListener("pointermove",e=>{ if(!drag||!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2 && drag.pd){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); const f=(drag.vw/VB.w)*(drag.pd/d); zoomAt(f,(a.x+b.x)/2,(a.y+b.y)/2); dragMoved=true; return; }
  const dx=e.clientX-drag.sx, dy=e.clientY-drag.sy; if(Math.abs(dx)+Math.abs(dy)>5){ dragMoved=true; svg.classList.add("dragging"); }
  if(dragMoved){ VB.x=drag.vx-dx*drag.scale; VB.y=drag.vy-dy*drag.scale; setVB(); } });
const endPtr=e=>{ ptrs.delete(e.pointerId); if(ptrs.size===0){ drag=null; svg.classList.remove("dragging"); setTimeout(()=>dragMoved=false,0);} };
window.addEventListener("pointerup",endPtr); window.addEventListener("pointercancel",endPtr);
function animVB(to,ms=550){ const from={...VB}, t0=performance.now(); if(RM) ms=0;
  (function st(t){ const k=ms?Math.min(1,(t-t0)/ms):1, e=1-Math.pow(1-k,3); for(const key in VB) VB[key]=from[key]+(to[key]-from[key])*e; setVB(); if(k<1) requestAnimationFrame(st); })(t0); }
const FIT={x:-60,y:-190,w:1920,h:1720};
function fitBox(){ const a=svg.clientHeight/(svg.clientWidth||1); if(a>1.1) return {x:60,y:-40,w:980,h:980*a}; if(currentView==="reto") return {x:-40,y:-290,w:1880,h:1760}; return {...FIT}; }
function focusXY(x,y,w=760){ const r=svg.clientHeight/svg.clientWidth||.7; const h=w*r; const pw=$("#panel").classList.contains("open")&&innerWidth>860?440:0;
  const shift = pw? (pw/svg.clientWidth)*w*.5 : 0; animVB({x:x-w/2+shift,y:y-h/2,w,h}); }
$("#z-in").onclick=()=>{const b=svg.getBoundingClientRect(); zoomAt(.75,b.left+b.width/2,b.top+b.height/2);};
$("#z-out").onclick=()=>{const b=svg.getBoundingClientRect(); zoomAt(1.33,b.left+b.width/2,b.top+b.height/2);};
$("#z-fit").onclick=()=>animVB(fitBox());
$("#z-play").onclick=()=>{ playing=!playing; $("#z-play").innerHTML = playing? '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="3.4" height="10" rx="1" fill="currentColor"/><rect x="8.6" y="2" width="3.4" height="10" rx="1" fill="currentColor"/></svg>' : '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>'; $("#z-play").setAttribute("aria-label",playing?"Pausar animación":"Reanudar animación"); };
if(!playing) $("#z-play").click(), playing=false, $("#z-play").innerHTML='<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>';

/* ======================= Raíl ======================= */
const TISSUE_COLORS = {
  universal: "var(--accent)",
  liver: "#059669",
  muscle: "#2563eb",
  brain: "#9333ea",
  adipose: "#d97706",
  rbc: "#dc2626",
  heart: "#e11d48",
  kidney: "#0d9488"
};

function buildRail(){
  const sb=$("#states");
  STATES.forEach(s=>{ const b=document.createElement("button"); b.className="state"; b.style.setProperty("--sc",s.c); b.setAttribute("aria-pressed",s===ST);
    b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(s===ST)); b.title=`${s.name} · ${s.tissue}`;
    b.innerHTML=`<b>${esc(s.name)}</b><small>${esc(s.tissue)}</small>`; b.onclick=()=>onStateClick(s.id); sb.appendChild(b); });
  const tsel=$("#tissue-select");
  if(tsel){
    const opts=[["all","Organismo completo"],["universal","Rutas universales"]].concat(Object.values(TISSUES_DATA).map(t=>[t.id,t.name]));
    tsel.innerHTML=opts.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join("");
    tsel.value=tissueFilter||"all";
    tsel.onchange=()=>{ tissueFilter = tsel.value==="all" ? null : tsel.value; syncTissueChips(); apply(); };
  }
  const pc=$("#pw-chips");
  Object.entries(PW).filter(([k])=>MAP_PW.includes(k)).forEach(([k,v])=>{ const b=document.createElement("button"); b.className="chip"; b.style.color=v.c; b.dataset.pw=k; b.setAttribute("aria-pressed","false");
    b.innerHTML=`<span class="dot"></span><span style="color:var(--fg)">${esc(v.name)}</span>`; b.onclick=()=>{ focusPw = focusPw===k? null : k; syncChips(); apply(); }; pc.appendChild(b); });

  const tc = $("#tissue-chips");
  if(tc){
    tc.innerHTML = "";
    const bAll = document.createElement("button");
    bAll.className = "tissue-chip";
    bAll.dataset.tissue = "all";
    bAll.setAttribute("aria-pressed", String(!tissueFilter));
    bAll.innerHTML = `<span class="tissue-chip-icon">Org</span><span>Organismo completo</span>`;
    bAll.onclick = () => { tissueFilter = null; syncTissueChips(); apply(); };
    tc.appendChild(bAll);

    const bUni = document.createElement("button");
    bUni.className = "tissue-chip";
    bUni.dataset.tissue = "universal";
    bUni.style.setProperty("--tc", TISSUE_COLORS.universal);
    bUni.setAttribute("aria-pressed", String(tissueFilter === "universal"));
    bUni.innerHTML = `<span class="tissue-chip-icon">Uni</span><span>Rutas universales</span>`;
    bUni.onclick = () => { tissueFilter = tissueFilter === "universal" ? null : "universal"; syncTissueChips(); apply(); };
    tc.appendChild(bUni);

    Object.values(TISSUES_DATA).forEach(t => {
      const b = document.createElement("button");
      b.className = "tissue-chip";
      b.dataset.tissue = t.id;
      const col = TISSUE_COLORS[t.id] || "var(--accent)";
      b.style.setProperty("--tc", col);
      b.setAttribute("aria-pressed", String(tissueFilter === t.id));
      b.innerHTML = `<span class="tissue-chip-icon">${t.icon}</span><span>${esc(t.name.split(" ")[0])}</span>`;
      b.onclick = () => {
        tissueFilter = tissueFilter === t.id ? null : t.id;
        syncTissueChips();
        apply();
      };
      tc.appendChild(b);
    });
  }

  // Wire up learning statistics tabs
  const tPracticed = document.getElementById("tab-stat-practiced");
  if(tPracticed) tPracticed.onclick = () => { learningStatsTab = "practiced"; renderLearningStatsRail(); };
  const tAccuracy = document.getElementById("tab-stat-accuracy");
  if(tAccuracy) tAccuracy.onclick = () => { learningStatsTab = "accuracy"; renderLearningStatsRail(); };

  const btnRailFc = document.getElementById("btn-rail-flashcard");
  if(btnRailFc) {
    btnRailFc.onclick = () => {
      toggleFlashcardMode(true);
    };
  }

  const railToggle = document.getElementById("rail-fc-toggle");
  if(railToggle) {
    railToggle.onclick = () => {
      toggleFlashcardMode();
    };
  }

  const rfcPwBtns = document.querySelectorAll("#rail-fc-pws [data-fc-pw]");
  rfcPwBtns.forEach(btn => {
    btn.onclick = () => {
      rfcPwBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      railFcFilter = btn.getAttribute("data-fc-pw") || "all";
      currentRailFcIndex = 0;
      renderRailFlashcardDeck();
    };
  });

  renderRailFlashcardDeck();
  renderLearningStatsRail();
}

let learningStatsTab = "practiced"; // "practiced" | "accuracy"

function renderLearningStatsRail(){
  const container = document.getElementById("stats-bars-list");
  if(!container) return;
  const pill = document.getElementById("stats-summary-pill");
  const tabPracticed = document.getElementById("tab-stat-practiced");
  const tabAccuracy = document.getElementById("tab-stat-accuracy");

  if(tabPracticed) tabPracticed.classList.toggle("active", learningStatsTab === "practiced");
  if(tabAccuracy) tabAccuracy.classList.toggle("active", learningStatsTab === "accuracy");

  const statsData = getFlashcardStats();
  if(pill) {
    pill.textContent = `${statsData.totalPracticed} repasos · ${statsData.overallAccuracy}% acierto`;
  }

  const items = MAP_PW.map(k => {
    const st = statsData.byPathway[k] || { practiced: 0, correct: 0 };
    const accuracy = st.practiced > 0 ? Math.round((st.correct / st.practiced) * 100) : 0;
    return {
      id: k,
      name: PW[k]?.name || k,
      color: PW[k]?.c || "var(--accent)",
      practiced: st.practiced,
      correct: st.correct,
      accuracy
    };
  });

  if(learningStatsTab === "practiced") {
    items.sort((a,b) => b.practiced - a.practiced || b.accuracy - a.accuracy);
  } else {
    items.sort((a,b) => b.accuracy - a.accuracy || b.practiced - a.practiced);
  }

  const maxPracticed = Math.max(1, ...items.map(x => x.practiced));

  container.innerHTML = items.map(s => {
    const isAct = focusPw === s.id;
    const accClass = s.accuracy >= 80 ? "ok" : s.accuracy >= 60 ? "warn" : "danger";
    if(learningStatsTab === "practiced") {
      const pct = Math.round((s.practiced / maxPracticed) * 100);
      return `
        <div class="stats-row ${isAct ? 'active' : ''}" data-stat-pw="${s.id}" title="Toca para aislar ${esc(s.name)} en el mapa celular">
          <div class="stats-row-header">
            <span class="stats-pw-name-wrap">
              <span class="stats-pw-dot" style="background:${s.color}"></span>
              <span>${esc(s.name)}</span>
            </span>
            <span class="stats-pw-val">
              <b>${s.practiced}</b> <small>tarjetas</small>
              <span class="stats-acc-chip ${accClass}">${s.accuracy}%</span>
            </span>
          </div>
          <div class="stats-track">
            <div class="stats-fill" style="width:${Math.max(s.practiced > 0 ? 6 : 0, pct)}%;background:${s.color}"></div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="stats-row ${isAct ? 'active' : ''}" data-stat-pw="${s.id}" title="Toca para aislar ${esc(s.name)} en el mapa celular">
          <div class="stats-row-header">
            <span class="stats-pw-name-wrap">
              <span class="stats-pw-dot" style="background:${s.color}"></span>
              <span>${esc(s.name)}</span>
            </span>
            <span class="stats-pw-val">
              <span class="stats-acc-badge ${accClass}">${s.accuracy}%</span>
              <small>(${s.correct}/${s.practiced})</small>
            </span>
          </div>
          <div class="stats-track">
            <div class="stats-fill ${accClass}" style="width:${Math.max(s.practiced > 0 ? 5 : 0, s.accuracy)}%"></div>
          </div>
        </div>
      `;
    }
  }).join("");

  container.querySelectorAll("[data-stat-pw]").forEach(row => {
    row.onclick = () => {
      const pw = row.getAttribute("data-stat-pw");
      focusPw = focusPw === pw ? null : pw;
      syncChips();
      apply();
    };
  });
}

function syncChips(){
  document.querySelectorAll("#pw-chips .chip").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.pw===focusPw)));
  document.querySelectorAll("#stats-bars-list .stats-row").forEach(r=>r.classList.toggle("active", r.dataset.statPw===focusPw));
}
function syncTissueChips(){
  const tsel=document.getElementById("tissue-select"); if(tsel){ tsel.value=tissueFilter||"all"; tsel.parentElement.classList.toggle("on",!!tissueFilter); }
  document.querySelectorAll("#tissue-chips .tissue-chip").forEach(b => {
    const isAll = b.dataset.tissue === "all";
    if (isAll) {
      b.setAttribute("aria-pressed", String(!tissueFilter));
    } else {
      b.setAttribute("aria-pressed", String(tissueFilter === b.dataset.tissue));
    }
  });
}


/* ======================= Misiones: sigue la molécula ======================= */
const MISSIONS = [
  { id:"cori", title:"Operación Cori", goal:"Del lactato a la glucosa de la sangre", state:"fast", from:"lactate_cyt", to:"glucose_ext",
    intro:"Tras el ejercicio, el lactato del músculo llega al hígado. Es de noche y llevas horas sin comer: convierte ese lactato en glucosa y devuélvela a la sangre.",
    hints:{
      rx_pdh:"En ayuno la PDH está casi apagada: la PDH quinasa la fosforila y el acetil-CoA y el NADH de la β-oxidación la frenan. El piruvato se reserva para fabricar glucosa.",
      rx_pk:"La piruvato quinasa es irreversible. Para subir de piruvato a PEP hay que dar un rodeo por la mitocondria.",
      rx_pfk1:"La PFK-1 es irreversible. El camino de vuelta lo hace otra enzima que en ayuno está activa porque ha bajado la fructosa-2,6-bisfosfato.",
      rx_hk:"La glucoquinasa no funciona al revés. Para liberar la glucosa hace falta otra enzima, en el retículo endoplásmico."
    },
    takeaways:["Tres rodeos esquivan los pasos irreversibles de la glucólisis: piruvato carboxilasa + PEPCK, FBPasa-1 y glucosa-6-fosfatasa.","El oxalacetato no atraviesa la membrana mitocondrial: sale al citosol como malato.","Fabricar una glucosa a partir de dos lactatos cuesta 6 enlaces de alta energía (4 ATP y 2 GTP)."] },
  { id:"grasa", title:"Fábrica de grasa", goal:"De la glucosa al palmitato", state:"fed", from:"glucose_ext", to:"palmitate",
    intro:"Acabas de comer y sobra glucosa. Lleva sus carbonos desde la sangre hasta el palmitato, el ácido graso que fabrica el hígado.",
    hints:{
      rx_aconitase:"Si sigues por el ciclo de Krebs, el carbono acabará como CO₂. Para fabricar grasa tiene que salir de la mitocondria.",
      rx_pyruvate_carboxylase:"Después de comer la piruvato carboxilasa trabaja poco: el piruvato se dirige a acetil-CoA.",
      rx_g6pdh:"La vía de las pentosas aporta el NADPH que necesita la síntesis de ácidos grasos, pero no lleva los carbonos al palmitato.",
      rx_pgm_glycogen:"Por ahí guardas la glucosa como glucógeno, no como grasa."
    },
    takeaways:["El acetil-CoA no atraviesa la membrana mitocondrial: sale como citrato y la ATP-citrato liasa lo libera en el citosol.","La acetil-CoA carboxilasa es el paso limitante; la activan el citrato y la insulina.","El malonil-CoA que fabrica bloquea la CPT-1, así que la grasa recién hecha no se quema."] },
  { id:"galactosa", title:"La ruta de la leche", goal:"De la galactosa al glucógeno", state:"fed", from:"galactose", to:"glycogen",
    intro:"La lactosa de la leche ha liberado galactosa. Llévala al hígado y guárdala como glucógeno.",
    hints:{
      rx_aldose_reductase_gal:"La aldosa reductasa convierte la galactosa en galactitol, que no se metaboliza y se acumula en el cristalino: así aparecen las cataratas de la galactosemia.",
      rx_pgm_glycogen:"Por ahí vas hacia la glucosa-6-fosfato y la glucólisis. Para guardar glucógeno hay que activar antes la glucosa-1-fosfato."
    },
    takeaways:["La GALT es la enzima que falta en la galactosemia clásica: se acumulan galactosa-1-fosfato y galactitol.","La glucosa-1-fosfato se activa como UDP-glucosa antes de unirse al glucógeno."] },
  { id:"cetonas", title:"Combustible de emergencia", goal:"Del palmitato a los cuerpos cetónicos", state:"keto", from:"palmitate", to:"ketone_bodies",
    intro:"Llevas más de tres días sin comer. El tejido adiposo libera ácidos grasos: convierte el palmitato en cuerpos cetónicos para alimentar al cerebro.",
    hints:{
      rx_cs:"En ayuno prolongado el oxalacetato se gasta en gluconeogénesis y el ciclo de Krebs no da abasto con tanto acetil-CoA: el exceso se desvía.",
      rx_tag_synth:"Esterificar el ácido graso lo guardaría otra vez como triglicérido."
    },
    takeaways:["Sin insulina no hay malonil-CoA, así que la CPT-1 queda libre y los ácidos grasos entran en la mitocondria.","Los cuerpos cetónicos se fabrican en el hígado pero el hígado no los usa: son para el cerebro, el corazón y el músculo."] },
  { id:"sprint", title:"Sprint final", goal:"Del glucógeno muscular al lactato", state:"run", from:"glycogen", to:"lactate_cyt",
    intro:"Últimos 100 metros. El músculo necesita ATP ya y la mitocondria no da abasto: rompe el glucógeno muscular y llega hasta lactato.",
    hints:{
      rx_g6pase:"El músculo no tiene glucosa-6-fosfatasa: su glucógeno no puede salir como glucosa, es solo para él.",
      rx_mpc:"En un sprint la mitocondria no puede oxidar todo el piruvato al ritmo de la glucólisis.",
      rx_g6pdh:"La vía de las pentosas no produce ATP. Ahora lo que hace falta es energía rápida."
    },
    takeaways:["La glucógeno fosforilasa libera glucosa-1-fosfato sin gastar ATP: el glucógeno rinde un ATP más que la glucosa libre.","La LDH regenera el NAD⁺ que necesita la GAPDH para que la glucólisis no se detenga."] },
  { id:"glicerol", title:"Reciclar la grasa", goal:"Del glicerol-3-fosfato a la glucosa", state:"fast", from:"glycerol_3p", to:"glucose_ext",
    intro:"La lipólisis del tejido adiposo libera glicerol, que el hígado fosforila. Conviértelo en glucosa para la sangre.",
    hints:{
      rx_pfk1:"La PFK-1 es irreversible. El camino de vuelta lo hace la FBPasa-1, activa en ayuno.",
      rx_hk:"La glucoquinasa no funciona al revés. La glucosa se libera en el retículo endoplásmico."
    },
    takeaways:["El glicerol entra en la gluconeogénesis a la altura de las triosas: se salta el rodeo de la piruvato carboxilasa y la PEPCK.","Los ácidos grasos de número par no pueden dar glucosa; el glicerol de los triglicéridos sí."] }
];
const MS_SKIP = new Set(["complex_1","complex_2","coenzyme_q","complex_3","cytochrome_c","complex_4","atp_synthase","proton_gradient"]);
const MS_RX = RX.filter(r=>L[r.fromNodeId]&&L[r.toNodeId]&&!MS_SKIP.has(r.fromNodeId)&&!MS_SKIP.has(r.toNodeId));
function signedIn(S,r){
  let f=(r.id in S.rx)? S.rx[r.id] : (S.pw[r.pathway] ?? 0);
  if(S.noMito && (r.compartment!=="cytosol" || ["rx_mpc","rx_citrate_export","rx_oaa_export","rx_malate_aspartate_shuttle"].includes(r.id))) f=0;
  return f;
}
const MS_OPEN=.05;
/* reacciones en equilibrio: funcionan en ambos sentidos si la ruta está encendida */
const MS_EQ=new Set(["rx_tpi"]);
const msOpen=(S,r,dir)=> MS_EQ.has(r.id) ? Math.abs(signedIn(S,r))>MS_OPEN : signedIn(S,r)*dir>MS_OPEN;
function msMoves(S,A){
  const out=[];
  MS_RX.forEach(r=>{
    if(r.fromNodeId===A) out.push({r,dir:1,next:r.toNodeId});
    else if(r.toNodeId===A) out.push({r,dir:-1,next:r.fromNodeId});
  });
  out.forEach(m=>{ m.kind = (m.dir<0 && !m.r.reversible) ? "oneway" : (msOpen(S,m.r,m.dir) ? "open" : "closed"); });
  return out;
}
function msDist(S,target){
  const d={[target]:0}, q=[target];
  while(q.length){ const n=q.shift();
    MS_RX.forEach(r=>{ [[r.fromNodeId,r.toNodeId,1],[r.toNodeId,r.fromNodeId,-1]].forEach(([a,b,dir])=>{
      if(b!==n || a in d) return; if(dir<0 && !r.reversible) return; if(!msOpen(S,r,dir)) return;
      d[a]=d[n]+1; q.push(a); }); }); }
  return d;
}
function msUndist(target){
  const d={[target]:0}, q=[target];
  while(q.length){ const n=q.shift(); MS_RX.forEach(r=>{ [[r.fromNodeId,r.toNodeId],[r.toNodeId,r.fromNodeId]].forEach(([a,b])=>{ if(b===n && !(a in d)){ d[a]=d[n]+1; q.push(a);} }); }); }
  return d;
}
const COF_KEYS=[["ATP",/^(\d+)?\s*(ATP|GTP)\b/],["NADH",/^(\d+)?\s*NADH\b/],["NADPH",/^(\d+)?\s*NADPH\b/],["FADH₂",/^(\d+)?\s*FADH/],["CO₂",/^(\d+)?\s*CO₂/]];
function cofDelta(r,dir){
  const d={}; const add=(list,sgn)=>(list||[]).forEach(t=>{ COF_KEYS.forEach(([k,re])=>{ const m=String(t).trim().match(re); if(m) d[k]=(d[k]||0)+sgn*(+(m[1]||1)); }); });
  add(r.cofactorsConsumed,-dir); add(r.cofactorsProduced,dir);
  return d;
}
let ms=null; // partida en curso
let msPrevState=null;
const msBest=id=>{ try{ return JSON.parse(localStorage.getItem("metabolix_mission_"+id)||"null"); }catch(e){ return null; } };
const msSaveBest=(id,res)=>{ try{ const b=msBest(id); if(!b || res.errors<b.errors) localStorage.setItem("metabolix_mission_"+id,JSON.stringify(res)); }catch(e){} };
const stName=id=>STATES.find(s=>s.id===id);
const nodeName=id=>(MET[id]?.abbreviation||MET[id]?.name||id);

function enterMissions(){
  if(!msPrevState) msPrevState=ST.id;
  svg.classList.add("ms"); { const tb=document.querySelector(".map-topbar"); if(tb) tb.hidden=true; }
  if(ms && !ms.done) renderMission(); else renderMissionList();
}
function leaveMissions(){
  svg.classList.remove("ms"); clearMsMarks(); gFxMs.innerHTML=""; { const tb=document.querySelector(".map-topbar"); if(tb) tb.hidden=false; }
  $("#mission").hidden=true;
  if(msPrevState && ST.id!==msPrevState) setState(msPrevState);
  msPrevState=null;
}
function clearMsMarks(){ svg.querySelectorAll(".ms-opt,.ms-trail,.ms-cur,.ms-target").forEach(e=>e.classList.remove("ms-opt","ms-trail","ms-cur","ms-target")); }
function renderMissionList(){
  ms=null; clearMsMarks(); gFxMs.innerHTML="";
  const box=$("#mission"); box.hidden=false;
  box.innerHTML=`<div class="ms-head"><div><div class="pr-step">Misiones</div><h3>Sigue la molécula</h3>
    <p>Lleva una molécula de un punto a otro del mapa eligiendo en cada cruce la carretera correcta. Cada misión ocurre en un estado fisiológico: algunas carreteras estarán cortadas.</p></div></div>
    <ol class="ms-list">${MISSIONS.map((M,i)=>{ const b=msBest(M.id), S=stName(M.state);
      return `<li><button type="button" data-ms="${M.id}"><span class="ms-n">${i+1}</span><span class="ms-t"><b>${esc(M.title)}</b><small>${esc(M.goal)}</small><em><i style="background:${S?.c||"var(--accent)"}"></i>${esc(S?.name||"")} · ${esc(S?.tissue||"")}</em></span>${b?`<span class="ms-best" title="Tu mejor resultado">${b.errors===0?"Sin fallos":b.errors+(b.errors===1?" fallo":" fallos")}</span>`:""}</button></li>`; }).join("")}</ol>`;
  box.querySelectorAll("[data-ms]").forEach(b=>b.onclick=()=>startMission(b.dataset.ms));
  Object.assign(VB, fitBox()); setVB();
}
function startMission(id){
  const M=MISSIONS.find(m=>m.id===id); if(!M) return;
  setState(M.state);
  ms={M,cur:M.from,trail:[M.from],edges:[],errors:0,hints:0,tally:{},fb:null,done:false,started:false,dist:msDist(ST,M.to),und:msUndist(M.to)};
  renderMission();
}
function msOptions(){
  const {cur,M,und}=ms;
  return msMoves(ST,cur).filter(m=> m.kind!=="oneway" || (und[m.next]??99) < (und[cur]??99));
}
function msChoose(opt){
  if(!ms||ms.done) return;
  const {M}=ms, S=ST, en=opt.r.enzymeAbbreviation||opt.r.enzymeName, hint=M.hints[opt.r.id];
  const toName=nodeName(opt.next);
  if(opt.kind==="oneway"){ ms.errors++; ms.fb={t:"ko",h:"Sentido prohibido",b:hint||`La ${en} es irreversible dentro de la célula. Busca otra forma de llegar a ${toName}.`}; }
  else if(opt.kind==="closed"){ ms.errors++; ms.fb={t:"ko",h:"Carretera cortada",b:hint||`En ${S.name.toLowerCase()} la ${en} no funciona en ese sentido.`}; }
  else if((ms.dist[opt.next]??99) >= (ms.dist[ms.cur]??99)){ ms.errors++; ms.fb={t:"warn",h:"Desvío",b:hint||`La carretera está abierta, pero por ahí te alejas de ${nodeName(M.to)}.`}; }
  else {
    const d=cofDelta(opt.r,opt.dir); Object.entries(d).forEach(([k,v])=>ms.tally[k]=(ms.tally[k]||0)+v);
    const cross = opt.r.compartment==="mitochondria_membrane" || opt.r.id==="rx_glut" || opt.r.id==="rx_glut_out";
    const cof = Object.entries(d).filter(([,v])=>v).map(([k,v])=>`${v>0?"+":"−"}${Math.abs(v)} ${k}`).join(", ");
    ms.fb={t:"ok",h:cross?`Frontera cruzada: ${en}`:`${en}`,b:`${nodeName(ms.cur)} → ${toName}${cof?` · ${cof}`:""}`};
    ms.cur=opt.next; ms.trail.push(opt.next); ms.edges.push(opt.r.id);
    if(ms.cur===M.to){ ms.done=true; msSaveBest(M.id,{errors:ms.errors,hints:ms.hints}); }
  }
  renderMission();
}
function msHint(){
  if(!ms||ms.done) return; ms.hints++;
  const good=msOptions().find(o=>o.kind==="open" && (ms.dist[o.next]??99) < (ms.dist[ms.cur]??99));
  if(good) ms.fb={t:"hint",h:"Pista",b:`Busca la enzima ${good.r.enzymeAbbreviation||good.r.enzymeName}.`};
  renderMission();
}
function renderMission(){
  const box=$("#mission"); if(!ms){ renderMissionList(); return; }
  const {M,cur,trail,errors,hints,tally,fb,done}=ms, S=ST;
  clearMsMarks(); gFxMs.innerHTML="";
  const opts = done? [] : msOptions();
  // marcas en el mapa
  ms.edges.forEach(id=>{ const E=EDGES.find(e=>e.r.id===id); if(E){ E.p.classList.add("ms-trail"); E.cs.classList.add("ms-trail"); E.pill&&E.pill.classList.add("ms-trail"); } });
  trail.forEach(n=>NODES[n]?.g.classList.add("ms-trail"));
  opts.forEach(o=>{ const E=EDGES.find(e=>e.r.id===o.r.id); if(E){ E.p.classList.add("ms-opt"); E.cs.classList.add("ms-opt"); E.pill&&E.pill.classList.add("ms-opt"); } NODES[o.next]?.g.classList.add("ms-opt"); });
  NODES[cur]?.g.classList.add("ms-cur"); NODES[M.to]?.g.classList.add("ms-target");
  [[cur,"ms-ring"],[M.to,"ms-flag"]].forEach(([n,c])=>{ const P=L[n]; if(!P) return; el("circle",{cx:P[0],cy:P[1],r:nodeR(n)+12,class:c},gFxMs); });
  requestAnimationFrame(()=>{ const P=L[cur]; if(P){ const w=innerWidth<860?620:1000, r=svg.clientHeight/svg.clientWidth||.7, h=w*r;
      // deja el nodo en la parte del mapa que no tapa la tarjeta
      const card=box.getBoundingClientRect(), sv=svg.getBoundingClientRect();
      const side = innerWidth>=860 ? ((card.right-sv.left)/sv.width)*w*.5 : 0;
      const down = innerWidth<860 ? ((sv.bottom-card.top)/sv.height)*h*.5 : 0;
      animVB({x:P[0]-w/2-side, y:P[1]-h/2+down, w, h}); } });
  const tallyTxt=["ATP","NADH","NADPH","FADH₂","CO₂"].filter(k=>tally[k]).map(k=>`<span><b>${tally[k]>0?"+":"−"}${Math.abs(tally[k])}</b> ${k==="ATP"?"ATP/GTP":k}</span>`).join("") || `<span class="ms-zero">Aún sin gasto ni ganancia</span>`;
  const optBtns = opts.map((o,i)=>{ const cross=o.r.compartment==="mitochondria_membrane"||o.r.id==="rx_glut"||o.r.id==="rx_glut_out";
    return `<button type="button" class="ms-opt-btn" data-i="${i}"><span class="ms-arrow" style="background:${PW[o.r.pathway]?.c||"var(--fg)"}"></span><span><b>${esc(nodeName(o.next))}</b><small>${esc(o.r.enzymeAbbreviation||o.r.enzymeName)}${cross?" · cruza una membrana":""}</small></span></button>`; }).join("");
  box.hidden=false;
  box.innerHTML = `
    <div class="ms-head">
      <div><div class="pr-step">Misión ${MISSIONS.indexOf(M)+1} · ${esc(M.title)}</div>
        <h3>${esc(M.goal)}</h3>
        <p class="ms-state"><i style="background:${S.c}"></i>${esc(S.name)} · ${esc(S.tissue)}</p></div>
      <button type="button" class="close ms-exit" aria-label="Volver a la lista de misiones">✕</button>
    </div>
    ${trail.length===1 && !fb && !done ? `<p class="ms-intro">${esc(M.intro)}</p>`:""}
    <div class="ms-odo" aria-label="Cuentakilómetros">
      <span><b>${trail.length-1}</b> pasos</span><span><b>${errors}</b> ${errors===1?"fallo":"fallos"}</span>${tallyTxt}
    </div>
    <div class="ms-trailtxt">${trail.map(n=>`<span>${esc(nodeName(n))}</span>`).join('<i>›</i>')}${done?"":`<i>›</i><span class="ms-goal">${esc(nodeName(M.to))}</span>`}</div>
    ${fb?`<div class="ms-fb ${fb.t}" role="status"><b>${esc(fb.h)}</b> ${esc(fb.b)}</div>`:""}
    ${done ? `<div class="ms-win"><h4>Misión cumplida</h4><p>Has llegado en ${trail.length-1} pasos con ${errors} ${errors===1?"fallo":"fallos"}${hints?` y ${hints} ${hints===1?"pista":"pistas"}`:""}.</p><ul>${M.takeaways.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`
           : `<div class="ms-q">Estás en <b>${esc(MET[cur]?.name||cur)}</b>. ¿Por qué carretera sigues?</div><div class="ms-opts">${optBtns}</div>`}
    <div class="pr-foot">
      ${done? `<button type="button" class="btn ms-again">Repetir</button><button type="button" class="btn primary ms-list-btn">Otra misión</button>`
            : `<button type="button" class="btn ms-hint">Pista</button><button type="button" class="btn ms-again">Empezar de nuevo</button>`}
    </div>`;
  box.querySelectorAll(".ms-opt-btn").forEach(b=>b.onclick=()=>msChoose(opts[+b.dataset.i]));
  if(innerWidth<860){ const f=box.querySelector(".ms-fb")||box.querySelector(".ms-q"); if(f) box.scrollTop=Math.max(0,f.offsetTop-12); }
  box.querySelector(".ms-exit").onclick=renderMissionList;
  const a=box.querySelector(".ms-again"); if(a) a.onclick=()=>startMission(M.id);
  const h=box.querySelector(".ms-hint"); if(h) h.onclick=msHint;
  const l=box.querySelector(".ms-list-btn"); if(l) l.onclick=renderMissionList;
}
function msPick(kind,id){
  if(!ms||ms.done) return;
  const opts=msOptions();
  const o = kind==="rx" ? opts.find(x=>x.r.id===id) : opts.find(x=>x.next===id);
  if(o) msChoose(o); else toast("Elige una de las carreteras que salen de tu posición");
}
/* comprobación para quien escriba misiones nuevas: window.__msCheck() devuelve el camino de cada una */
if(typeof window!=="undefined") window.__msCheck=()=>MISSIONS.map(M=>{ const S=stName(M.state); const d=msDist(S,M.to); let cur=M.from, path=[cur], guard=0;
  while(cur!==M.to && guard++<40){ const n=msMoves(S,cur).find(m=>m.kind==="open" && (d[m.next]??99)<(d[cur]??99)); if(!n) break; cur=n.next; path.push(cur+"("+n.r.id+")"); }
  return M.id+": "+(d[M.from]===undefined?"SIN CAMINO":path.join(" → ")); });

/* ======================= Predecir antes de ver ======================= */
/* Procesos que el alumno predice al cambiar de estado; cada uno se mide con
   una reacción representativa (irreversible o con un sentido claro). */
const PRED_ITEMS = [
  {id:"glyc",  name:"Glucólisis",                 rx:"rx_pfk1",            pw:"glycolysis"},
  {id:"gng",   name:"Gluconeogénesis",            rx:"rx_fbpase1",         pw:"gluconeogenesis"},
  {id:"gs",    name:"Síntesis de glucógeno",      rx:"rx_gs",              pw:"glycogen_metabolism"},
  {id:"gp",    name:"Degradación de glucógeno",   rx:"rx_gp",              pw:"glycogen_metabolism"},
  {id:"ppp",   name:"Vía de las pentosas fosfato",rx:"rx_g6pdh",           pw:"pentose_phosphate"},
  {id:"ldh",   name:"Producción de lactato",      rx:"rx_ldh",             pw:"mitochondrial_fate"},
  {id:"krebs", name:"Ciclo de Krebs",             rx:"rx_cs",              pw:"krebs_cycle"},
  {id:"fas",   name:"Síntesis de ácidos grasos",  rx:"rx_fas",             pw:"lipid_metabolism"},
  {id:"box",   name:"β-oxidación",                rx:"rx_beta_oxidation",  pw:"lipid_metabolism"},
  {id:"keto",  name:"Cetogénesis",                rx:"rx_ketogenesis",     pw:"lipid_metabolism"}
].filter(it=>RXM[it.rx]);
function levelIn(S,rxId){
  const r=RXM[rxId]; if(!r) return 0;
  let f=(r.id in S.rx)? S.rx[r.id] : (S.pw[r.pathway] ?? 0);
  if(S.noMito && (r.compartment!=="cytosol" || ["rx_mpc","rx_citrate_export","rx_oaa_export","rx_malate_aspartate_shuttle"].includes(r.id))) f=0;
  return Math.max(0,f);
}
const PRED_T=.15;
/* nivel absoluto en el estado de destino: así la pregunta tiene sentido aunque cambie el tejido */
const lvl=v=> v>=.55?"high": v>=.12?"low":"off";
function predTruth(from,to,it){ return lvl(levelIn(to,it.rx)); }
const PRED_KEYS=["high","low","off"];
const PRED_LBL={high:"Activa",low:"Poco activa",off:"Apagada"};
const _lv=(inner)=>`<svg class="lv" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/>${inner}</svg>`;
const PRED_ICON={high:_lv('<circle cx="6" cy="6" r="4.6" fill="currentColor"/>'),low:_lv('<path d="M6 1.4a4.6 4.6 0 0 1 0 9.2Z" fill="currentColor"/>'),off:_lv("")};
let predictMode = (()=>{ try{ return localStorage.getItem("metabolix_predict_mode")==="predict"; }catch(e){ return false; } })();
let pred=null; // {from,to,answers,checked}

function syncPredictToggle(){
  document.querySelectorAll("#predict-toggle button").forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.pm==="predict")===predictMode)));
  const h=document.getElementById("mc-mode-hint");
  if(h) h.textContent = predictMode ? "Al elegir un estado, primero predices qué rutas cambian y luego lo compruebas en el mapa." : "Al elegir un estado, el mapa cambia al momento.";
}
function setPredictMode(on){
  predictMode=on; try{ localStorage.setItem("metabolix_predict_mode",on?"predict":"view"); }catch(e){}
  if(!on && pred) closePredict();
  syncPredictToggle();
}
function onStateClick(id){
  const to=STATES.find(s=>s.id===id);
  if(!predictMode){ if(pred) closePredict(); setState(id); return; }
  if(to===ST && !pred) return;
  if(pred && pred.to===to) return;
  openPredict(ST,to);
}
function markPending(to){
  document.querySelectorAll(".map-controls .state").forEach((b,i)=>b.classList.toggle("pending", !!to && STATES[i]===to));
}
function openPredict(from,to){
  closePanel(); /* la tarjeta de predicción no debe quedar debajo de una ficha */
  pred={from,to,answers:{},checked:false};
  markPending(to);
  renderPredict();
}
function closePredict(){
  pred=null; markPending(null);
  const box=document.getElementById("predict"); if(box){ box.hidden=true; box.innerHTML=""; }
}
function renderPredict(){
  const box=document.getElementById("predict"); if(!box||!pred) return;
  const {from,to,answers,checked}=pred;
  const n=PRED_ITEMS.length, nAns=Object.keys(answers).length;
  let ok=0;
  const rows=PRED_ITEMS.map(it=>{
    const truth=predTruth(from,to,it), a=answers[it.id];
    if(checked && a===truth) ok++;
    const before=PRED_LBL[lvl(levelIn(from,it.rx))];
    const res = !checked ? "" : `<span class="pr-res ${a===truth?"ok":"ko"}">${a===truth?"✓":(a?"✕":"–")}</span><span class="pr-before">Antes: ${before.toLowerCase()}</span>`;
    const btns=PRED_KEYS.map(k=>`<button type="button" data-it="${it.id}" data-v="${k}" aria-pressed="${a===k}" ${checked?"disabled":""} title="${PRED_LBL[k]}" class="${checked&&k===truth?"truth":""}">${PRED_ICON[k]}<span>${PRED_LBL[k]}</span></button>`).join("");
    return `<div class="pr-row ${checked?(a===truth?"is-ok":"is-ko"):""}">
      <button type="button" class="pr-name" data-pw="${it.pw}" title="Aislar esta ruta en el mapa"><i style="background:${PW[it.pw]?.c||"var(--fg)"}"></i>${esc(it.name)}</button>
      <div class="pr-seg" role="group" aria-label="${esc(it.name)}">${btns}</div>${res}</div>`;
  }).join("");
  box.hidden=false;
  box.innerHTML = `
    <div class="pr-head">
      <div>
        <div class="pr-step">${checked?"Resultado":"Tu predicción"}</div>
        <h3>De ${esc(from.name)} a ${esc(to.name)}</h3>
        <p>${checked
          ? `Has acertado <b>${ok} de ${n}</b>. El mapa ya muestra ${esc(to.name.toLowerCase())}; toca una ruta para aislarla.`
          : `¿Cómo estará cada ruta en ${esc(to.name.toLowerCase())} (${esc(to.tissue)})? Piensa en las hormonas y en la energía de la célula antes de comprobarlo.`}</p>
      </div>
      <button type="button" class="close pr-close" aria-label="Cerrar">✕</button>
    </div>
    <div class="pr-rows">${rows}</div>
    ${checked && to.notes?.length ? `<div class="pr-why"><b>Por qué</b><ul>${to.notes.slice(0,3).map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`:""}
    <div class="pr-foot">
      ${checked
        ? `<button type="button" class="btn pr-again">Repetir</button><button type="button" class="btn primary pr-done">Cerrar</button>`
        : `<button type="button" class="btn pr-skip">Ver sin predecir</button><button type="button" class="btn primary pr-check" ${nAns?"":"disabled"}>Comprobar (${nAns}/${n})</button>`}
    </div>`;
  box.querySelectorAll(".pr-seg button").forEach(b=>b.onclick=()=>{ pred.answers[b.dataset.it]=b.dataset.v; renderPredict(); });
  box.querySelectorAll(".pr-name").forEach(b=>b.onclick=()=>{ if(!pred.checked) return; focusPw = focusPw===b.dataset.pw? null : b.dataset.pw; syncChips(); apply(); });
  box.querySelector(".pr-close").onclick=closePredict;
  const sk=box.querySelector(".pr-skip"); if(sk) sk.onclick=()=>{ const t=pred.to; closePredict(); setState(t.id); };
  const ck=box.querySelector(".pr-check"); if(ck) ck.onclick=()=>{ pred.checked=true; markPending(null); setState(pred.to.id); renderPredict(); };
  const ag=box.querySelector(".pr-again"); if(ag) ag.onclick=()=>{ const {from,to}=pred; setState(from.id); openPredict(from,to); };
  const dn=box.querySelector(".pr-done"); if(dn) dn.onclick=closePredict;
}

function setState(id){ ST=STATES.find(s=>s.id===id); document.querySelectorAll(".state").forEach((b,i)=>{ b.setAttribute("aria-pressed",String(STATES[i]===ST)); b.setAttribute("aria-checked",String(STATES[i]===ST)); }); renderStateInfo(); apply(); }
function renderStateInfo(){
  $("#meters").innerHTML = Object.entries(ST.sig).map(([k,v])=>`<div class="meter" style="--mc:${k==="Insulina"?"var(--pw-glycolysis)":k==="Glucagón"?"var(--pw-gluconeogenesis)":k==="Adrenalina"?"var(--pw-glycogen)":k==="AMP/ATP"?"var(--pw-krebs)":"var(--pw-pentose)"}"><span>${k}</span><i><u style="width:${Math.round(v*100)}%"></u></i><em>${Math.round(v*100)}</em></div>`).join("");
  $("#st-title").textContent = `${ST.name} · ${ST.tissue}`;
  const n=$("#st-notes"); n.style.setProperty("--sc",ST.c); n.innerHTML=ST.notes.map(t=>`<li>${esc(t)}</li>`).join("");
}
function drawHud(){
  $("#hud").hidden = currentView==="reto"||currentView==="misiones"; { const mc=document.getElementById("map-controls"); if(mc) mc.hidden = currentView==="reto"||currentView==="misiones"; if((currentView==="reto"||currentView==="misiones") && pred) closePredict(); } gEnz.style.display = currentView==="reto" ? "none" : "";
  const tName = tissueFilter === "universal" ? "Rutas universales" : (TISSUES_DATA[tissueFilter]?.name || tissueFilter);
  const tColor = TISSUE_COLORS[tissueFilter] || "var(--accent)";
  const tBadge = tissueFilter ? `<button class="pill" id="hud-tf" style="border-color:${tColor};background:color-mix(in srgb,${tColor} 12%,var(--ink-1))"><span class="dot" style="color:${tColor}"></span><b>Filtro:</b> ${esc(tName)} <span style="color:var(--fg-faint);margin-left:4px">✕</span></button>` : "";
  const fcBadge = flashcardMode
    ? `<button class="pill active" id="hud-fc" style="border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 15%,var(--ink-1));pointer-events:auto" title="Modo Flashcard activo: clic para desactivar"><span class="dot" style="background:var(--accent)"></span><b>Flashcards: Activo</b> <span style="margin-left:4px">✓</span></button>`
    : `<button class="pill" id="hud-fc" style="border-color:var(--line);background:var(--ink-1);color:var(--fg-dim);pointer-events:auto" title="Activar Modo Estudio Flashcard (oculta nombres para memorizar)"><span class="dot" style="background:var(--fg-faint)"></span><b>Modo Flashcards</b> <span style="font-size:10px;opacity:0.8;margin-left:4px">Iniciar</span></button>`;

  $("#hud").innerHTML = "" +
   "" +
   fcBadge +
   (focusPw? `<button class="pill" id="hud-pw"><span class="dot" style="color:${PW[focusPw].c}"></span>${esc(PW[focusPw].name)} <span style="color:var(--fg-faint)">✕</span></button>`:"");
  $("#hud").insertAdjacentHTML("beforeend",`<span class="pill seg-mini" role="group" aria-label="Etiquetas de enzimas"><button data-enz="key" aria-pressed="${enzMode==="key"}"><span class="star">★</span> Reguladoras</button><button data-enz="all" aria-pressed="${enzMode==="all"}">Todas las enzimas</button></span>`);
  document.querySelectorAll("[data-enz]").forEach(b=>b.onclick=()=>{ enzMode=b.dataset.enz; drawEnz(); apply(); });
  const a=$("#hud-pw"); if(a) a.onclick=()=>{focusPw=null;syncChips();apply();};
  const htf=$("#hud-tf"); if(htf) htf.onclick=()=>{tissueFilter=null;syncTissueChips();apply();};
  const hfc=$("#hud-fc"); if(hfc) hfc.onclick=()=>{toggleFlashcardMode();};
}

/* ======================= Panel de detalle & Modo Flashcard ======================= */
let flashcardMode = (function() {
  try { return localStorage.getItem("metabolix_flashcard_mode") === "true"; }
  catch(e) { return false; }
})();
let currentPanelItem = null; // { kind: 'rx' | 'node', id: string, fromDisease?: boolean }

const FLASHCARD_ITEMS = [
  {
    id: "fc_pfk1",
    rxId: "rx_pfk1",
    pwId: "glycolysis",
    category: "glycolysis",
    routeLabel: "Glucólisis · Marcapasos",
    prompt: "¿Cuál es la enzima principal limitante y alostérica de la glucólisis, activada por F-2,6-BP y AMP, e inhibida por ATP y citrato?",
    termEnzyme: "Fosfofructocinasa-1 (PFK-1 · EC 2.7.1.11)",
    termReaction: "Fructosa-6-Fosfato + ATP ⟶ Fructosa-1,6-Bisfosfato + ADP",
    termRegulation: "Activadores: Fructosa-2,6-BP (alostérico maestro), AMP, ADP · Inhibidores: ATP, Citrato, H⁺ (acidosis)",
    termClinical: "Enfermedad de Tarui (GSD VII): déficit de isoenzima M muscular, dolor y calambres de esfuerzo con hemólisis",
    coords: { x: 340, y: 390 }
  },
  {
    id: "fc_hk",
    rxId: "rx_hk",
    pwId: "glycolysis",
    category: "glycolysis",
    routeLabel: "Glucólisis · Atrapamiento de Glucosa",
    prompt: "¿Qué enzima atrapa la glucosa intracelular fosforilándola en C6, con alta afinidad (baja Km) e inhibida por su producto G6P?",
    termEnzyme: "Hexocinasa I-III (EC 2.7.1.1) vs Glucocinasa (HK IV)",
    termReaction: "D-Glucosa + ATP ⟶ D-Glucosa-6-Fosfato + ADP",
    termRegulation: "HK I-III: fuertemente inhibida por G6P. Glucocinasa (hepática/pancreática): baja afinidad (alta Km ~10 mM), no inhibida por G6P, regulada por GKRP",
    termClinical: "Diabetes MODY-2 (mutación en gen GCK/Glucocinasa) y anemia hemolítica no esferocítica por déficit de HK eritrocitaria",
    coords: { x: 230, y: 390 }
  },
  {
    id: "fc_pk",
    rxId: "rx_pk",
    pwId: "glycolysis",
    category: "glycolysis",
    routeLabel: "Glucólisis · Tercer Punto Irreversible",
    prompt: "¿Qué cinasa produce ATP por fosforilación a nivel de sustrato a partir de PEP, activada por feed-forward de F1,6BP?",
    termEnzyme: "Piruvato Cinasa (PK · EC 2.7.1.40)",
    termReaction: "Fosfoenolpiruvato (PEP) + ADP ⟶ Piruvato + ATP",
    termRegulation: "Feed-forward positivo por F-1,6-BP. Inhibidores: ATP, Acetil-CoA, Alanina. Glucagón fosforila e inhibe la isoforma L hepática (PKA)",
    termClinical: "Déficit eritrocitario de Piruvato Cinasa: segunda causa enzimática más común de anemia hemolítica congénita no esferocítica",
    coords: { x: 670, y: 390 }
  },
  {
    id: "fc_pdh",
    rxId: "rx_pdh",
    pwId: "mitochondrial_fate",
    category: "krebs",
    routeLabel: "Destino Mitocondrial · Enlace Glucólisis-Krebs",
    prompt: "¿Qué complejo multienzimático mitocondrial de 3 enzimas y 5 coenzimas oxida irreversiblemente el piruvato a acetil-CoA?",
    termEnzyme: "Complejo Piruvato Deshidrogenasa (PDH · E1, E2, E3)",
    termReaction: "Piruvato + CoA-SH + NAD⁺ ⟶ Acetil-CoA + CO₂ + NADH + H⁺",
    termRegulation: "Covalente: PDH-cinasa (inactiva fosforilando por ATP, NADH, Acetil-CoA) y PDH-fosfatasa (activa por Ca²⁺ e insulina). 5 coenzimas: TPP, Lipoato, FAD, NAD⁺, CoA",
    termClinical: "Acidosis láctica congénita por déficit de E1-alfa ligada al X; encefalopatía de Wernicke por deficiencia de tiamina (TPP)",
    coords: { x: 740, y: 520 }
  },
  {
    id: "fc_cs",
    rxId: "rx_cs",
    pwId: "krebs_cycle",
    category: "krebs",
    routeLabel: "Ciclo de Krebs · Entrada de Carbonos",
    prompt: "¿Qué enzima condensante mitocondrial une oxalacetato y acetil-CoA para formar la molécula tricarboxílica de 6 carbonos?",
    termEnzyme: "Citrato Sintasa (CS · EC 2.3.3.1)",
    termReaction: "Oxalacetato + Acetil-CoA + H₂O ⟶ Citrato + CoA-SH + H⁺",
    termRegulation: "Disponibilidad de oxalacetato y acetil-CoA; inhibición por ATP, NADH, Succinil-CoA y citrato (retroalimentación)",
    termClinical: "Biomarcador enzimático estándar de densidad y volumen mitocondrial en biopsias de músculo esquelético",
    coords: { x: 790, y: 640 }
  },
  {
    id: "fc_idh",
    rxId: "rx_idh",
    pwId: "krebs_cycle",
    category: "krebs",
    routeLabel: "Ciclo de Krebs · Paso Limitante",
    prompt: "¿Cuál es el paso limitante de velocidad del ciclo de Krebs que descarboxila oxidativamente el isocitrato liberando el primer CO₂?",
    termEnzyme: "Isocitrato Deshidrogenasa mitocondrial (IDH3 · EC 1.1.1.41)",
    termReaction: "Isocitrato + NAD⁺ ⟶ α-Cetoglutarato + CO₂ + NADH + H⁺",
    termRegulation: "Activador alostérico maestro: ADP (disminuye Km) y Ca²⁺. Inhibidores potentes: ATP y NADH (reflejo de alto estado energético celular)",
    termClinical: "Mutaciones neomórficas en IDH1/IDH2 producen el oncometabolito 2-hidroxiglutarato (2-HG) en gliomas y leucemia mieloide aguda (LMA)",
    coords: { x: 880, y: 700 }
  },
  {
    id: "fc_fbpase1",
    rxId: "rx_fbpase1",
    pwId: "gluconeogenesis",
    category: "gluconeogenesis",
    routeLabel: "Gluconeogénesis · Marcapasos Recíproco",
    prompt: "¿Qué fosfatasa hidroliza el F-1,6-BP en gluconeogénesis y es fuertemente inhibida por F-2,6-BP y AMP?",
    termEnzyme: "Fructosa-1,6-Bisfosfatasa-1 (FBPasa-1 · EC 3.1.3.11)",
    termReaction: "Fructosa-1,6-Bisfosfato + H₂O ⟶ Fructosa-6-Fosfato + Pi",
    termRegulation: "Inhibición alostérica sinérgica por Fructosa-2,6-Bisfosfato y AMP. Activación por Citrato (garantiza regulación recíproca con PFK-1)",
    termClinical: "Deficiencia hereditaria de FBPasa-1: hipoglucemia de ayuno grave con acidosis láctica y hepatomegalia, sin disfunción muscular",
    coords: { x: 380, y: 320 }
  },
  {
    id: "fc_pyruvate_carboxylase",
    rxId: "rx_pyruvate_carboxylase",
    pwId: "gluconeogenesis",
    category: "gluconeogenesis",
    routeLabel: "Gluconeogénesis · Desvío Mitocondrial 1",
    prompt: "¿Qué enzima mitocondrial dependiente de biotina y ATP convierte piruvato en oxalacetato, activada obligatoriamente por acetil-CoA?",
    termEnzyme: "Piruvato Carboxilasa (PC · EC 6.4.1.1)",
    termReaction: "Piruvato + HCO₃⁻ + ATP ⟶ Oxalacetato + ADP + Pi",
    termRegulation: "Activador alostérico obligado absoluto: Acetil-CoA (sin acetil-CoA la enzima carece de actividad catalítica). Coenzima: Biotina (vitamina B7)",
    termClinical: "Deficiencia congénita de Piruvato Carboxilasa: acidosis láctica neonatal, cetosis, hiperamonemia y retraso psicomotor severo",
    coords: { x: 670, y: 470 }
  },
  {
    id: "fc_pepck",
    rxId: "rx_pepck",
    pwId: "gluconeogenesis",
    category: "gluconeogenesis",
    routeLabel: "Gluconeogénesis · Desvío Mitocondrial 2",
    prompt: "¿Qué enzima inducible por glucagón y cortisol convierte oxalacetato en PEP consumiendo GTP y liberando CO₂?",
    termEnzyme: "Fosfoenolpiruvato Carboxicinasa (PEPCK / PCK1 · EC 4.1.1.32)",
    termReaction: "Oxalacetato + GTP ⟶ Fosfoenolpiruvato (PEP) + GDP + CO₂",
    termRegulation: "Regulación transcripcional: inducida por Glucagón (vía AMPc-PKA-CREB) y Glucocorticoides; reprimida por Insulina",
    termClinical: "Sobreexpresión de PEPCK en parénquima hepático contribuye a la hiperglucemia de ayuno refractaria en diabetes mellitus tipo 2",
    coords: { x: 570, y: 360 }
  },
  {
    id: "fc_g6pase",
    rxId: "rx_g6pase",
    pwId: "gluconeogenesis",
    category: "gluconeogenesis",
    routeLabel: "Hígado / Riñón · Liberación a Sangre",
    prompt: "¿Qué enzima luminal del retículo endoplásmico hepático y renal permite liberar glucosa libre a la circulación sistémica?",
    termEnzyme: "Glucosa-6-Fosfatasa (G6Pasa / G6PC · EC 3.1.3.9)",
    termReaction: "Glucosa-6-Fosfato + H₂O ⟶ D-Glucosa libre + Pi",
    termRegulation: "Expresión confinada a hepatocitos, corteza renal y enterocitos (ausente en músculo). Regulada por sustrato y transporte al RE",
    termClinical: "Enfermedad de Von Gierke (GSD Ia): hipoglucemia de ayuno severa extrema, hepatomegalia masiva, acidosis láctica e hiperuricemia",
    coords: { x: 190, y: 320 }
  },
  {
    id: "fc_g6pdh",
    rxId: "rx_g6pdh",
    pwId: "pentose_phosphate",
    category: "pentose",
    routeLabel: "Vía de las Pentosas Fosfato · Fase Oxidativa",
    prompt: "¿Qué enzima genera el NADPH citosólico necesario para mantener el glutatión reducido y proteger contra el estrés oxidativo?",
    termEnzyme: "Glucosa-6-Fosfato Deshidrogenasa (G6PD · EC 1.1.1.49)",
    termReaction: "Glucosa-6-Fosfato + NADP⁺ ⟶ 6-Fosfoglucono-δ-lactona + NADPH + H⁺",
    termRegulation: "Controlada estrictamente por la relación citosólica [NADP⁺]/[NADPH]. El NADPH es un inhibidor competitivo muy potente",
    termClinical: "Favismo / Déficit de G6PD (ligado al X): enzimopatía humana más frecuente (>400M personas); crisis hemolítica ante habas, sulfamidas o infecciones",
    coords: { x: 230, y: 220 }
  },
  {
    id: "fc_gp",
    rxId: "rx_gp",
    pwId: "glycogen_metabolism",
    category: "glycogen",
    routeLabel: "Glucogenólisis · Movilización de Reservas",
    prompt: "¿Qué fosforilasa degrada glucógeno rompiendo enlaces α(1→4) mediante fosforolisis para producir G1P, activada por fosforilación?",
    termEnzyme: "Glucógeno Fosforilasa (GP · EC 2.4.1.1)",
    termReaction: "(Glucógeno)ₙ + Pi ⟶ (Glucógeno)ₙ₋₁ + Glucosa-1-Fosfato",
    termRegulation: "Fosforilasa b (inactiva) ⟶ Fosforilasa a (activa) mediante Fosforilasa Cinasa (activada por Glucagón/Adrenalina vía PKA y Ca²⁺ en músculo). Inhibida por Glucosa libre en hígado",
    termClinical: "Enfermedad de McArdle (GSD V muscular): intolerancia al ejercicio, calambres, mioglobinuria y ausencia de lactato post-esfuerzo. Enf. de Hers (GSD VI hepática)",
    coords: { x: 180, y: 150 }
  },
  {
    id: "fc_gs",
    rxId: "rx_gs",
    pwId: "glycogen_metabolism",
    category: "glycogen",
    routeLabel: "Glucogenogénesis · Síntesis de Reservas",
    prompt: "¿Qué enzima transfiere glucosa desde UDP-glucosa a una cadena de glucógeno formando enlaces α(1→4), activa en estado desfosforilado?",
    termEnzyme: "Glucógeno Sintasa (GS · EC 2.4.1.11)",
    termReaction: "UDP-Glucosa + (Glucógeno)ₙ ⟶ UDP + (Glucógeno)ₙ₊₁",
    termRegulation: "Insulina desfosforila y activa GS (vía PP1 e inhibición de GSK3). Glucagón/Adrenalina (PKA, GSK3, AMPK) fosforilan e inactivan GS. Activador alostérico: G6P",
    termClinical: "Glucogenosis tipo 0 (déficit de GS hepática): hipoglucemia matutina de ayuno con hipercetonemia e hiperglucemia postprandial",
    coords: { x: 260, y: 150 }
  },
  {
    id: "fc_acc",
    rxId: "rx_acc",
    pwId: "lipid_metabolism",
    category: "lipid",
    routeLabel: "Lipogénesis de Novo · Paso Comprometido",
    prompt: "¿Qué carboxilasa dependiente de biotina convierte acetil-CoA en malonil-CoA, activada por citrato y polimerización, e inhibida por AMPK?",
    termEnzyme: "Acetil-CoA Carboxilasa (ACC1 / ACACA · EC 6.4.1.2)",
    termReaction: "Acetil-CoA + HCO₃⁻ + ATP ⟶ Malonil-CoA + ADP + Pi",
    termRegulation: "Activador alostérico maestro: Citrato (promueve polimerización activa). Inhibidor: Palmitoil-CoA. Covalente: AMPK y Glucagón fosforilan e inactivan; Insulina activa",
    termClinical: "El producto Malonil-CoA inhibe alostéricamente a CPT-1, bloqueando la β-oxidación durante la síntesis activa de ácidos grasos (regulación recíproca)",
    coords: { x: 1350, y: 550 }
  },
  {
    id: "fc_cpt1",
    rxId: "rx_cpt1",
    pwId: "lipid_metabolism",
    category: "lipid",
    routeLabel: "β-Oxidación · Lanzadera de Carnitina",
    prompt: "¿Qué enzima de la membrana mitocondrial externa transfiere acilos a la carnitina y es inhibida alostéricamente por malonil-CoA?",
    termEnzyme: "Carnitina Palmitoiltransferasa 1 (CPT-1 · EC 2.3.1.21)",
    termReaction: "Acil-CoA graso + L-Carnitina ⟶ Acilcarnitina + CoA-SH",
    termRegulation: "Inhibidor alostérico fisiológico crucial: Malonil-CoA (evita ciclo fútil de oxidación lipídica durante síntesis de grasas). Insulina disminuye actividad indirectamente",
    termClinical: "Deficiencia congénita de CPT-1 o de Carnitina: crisis de hipoglucemia hipocetósica severa desencadenada por ayuno prolongado o fiebre",
    coords: { x: 1420, y: 640 }
  },
  {
    id: "fc_ketogenesis",
    rxId: "rx_ketogenesis",
    pwId: "lipid_metabolism",
    category: "lipid",
    routeLabel: "Cetogénesis Hepática · Combustible Cerebral de Ayuno",
    prompt: "¿Cuál es la enzima mitocondrial hepática limitante en la síntesis de acetoacetato y β-hidroxibutirato a partir de acetil-CoA?",
    termEnzyme: "HMG-CoA Sintasa Mitocondrial (HMGCS2 · EC 2.3.3.10)",
    termReaction: "Acetoacetil-CoA + Acetil-CoA + H₂O ⟶ HMG-CoA + CoA-SH",
    termRegulation: "Expresión inducida fuertemente en ayuno prolongado y diabetes por Glucagón y PPARα; desacetilada y activada por SIRT3 mitocondrial",
    termClinical: "Cetoacidosis diabética (CAD) por lipólisis y cetogénesis masiva desregulada por deficiencia absoluta de insulina; déficit de HMGCS2 causa hipoglucemia hipocetósica",
    coords: { x: 1480, y: 720 }
  },
  {
    id: "fc_aldose_reductase_gal",
    rxId: "rx_aldose_reductase_gal",
    pwId: "monosaccharide_entry",
    category: "monosaccharide",
    routeLabel: "Entrada de Monosacáridos · Vía del Poliol",
    prompt: "¿Qué enzima dependiente de NADPH reduce la galactosa acumulada a galactitol, causando cataratas congénitas en recién nacidos?",
    termEnzyme: "Aldosa Reductasa (AKR1B1 · EC 1.1.1.21)",
    termReaction: "D-Galactosa + NADPH + H⁺ ⟶ Galactitol + NADP⁺",
    termRegulation: "Baja afinidad por monosacáridos a concentraciones normales; se satura e hiperactiva masivamente en hipergalactosemia o hiperglucemia",
    termClinical: "Galactosemia clásica (déficit de GALT) y déficit de Galactocinasa (GALK): acumulación de galactitol no metabolizable en cristalino causa cataratas osmóticas",
    coords: { x: 140, y: 238 }
  }
];

const FLASHCARD_DECK = FLASHCARD_ITEMS.map(it => it.rxId);
let deckIndex = 0;
let currentRailFcIndex = 0;
let railFcFilter = "all";

function getFilteredFlashcards() {
  if (railFcFilter === "all") return FLASHCARD_ITEMS;
  return FLASHCARD_ITEMS.filter(it => {
    if (railFcFilter === "glycolysis") return it.category === "glycolysis" || it.pwId === "glycolysis";
    if (railFcFilter === "krebs") return it.category === "krebs" || it.pwId === "krebs_cycle" || it.pwId === "mitochondrial_fate";
    if (railFcFilter === "gluconeogenesis") return it.category === "gluconeogenesis" || it.pwId === "gluconeogenesis";
    if (railFcFilter === "lipid") return it.category === "lipid" || it.pwId === "lipid_metabolism";
    if (railFcFilter === "glycogen") return it.category === "glycogen" || it.pwId === "glycogen_metabolism";
    return it.pwId === railFcFilter || it.category === railFcFilter;
  });
}

function openNextFlashcard() {
  if (currentView !== "mapa") {
    go("mapa");
  }
  const deck = getFilteredFlashcards();
  if (!deck.length) return;
  const item = deck[deckIndex % deck.length];
  deckIndex++;
  openRx(item.rxId);
  if (item.coords) {
    focusXY(item.coords.x, item.coords.y, 820);
  } else {
    const E = EDGES.find(e => e.r.id === item.rxId);
    if (E) {
      const pt = pointAt(E.g, E.g.len / 2);
      focusXY(pt[0], pt[1], 820);
    }
  }
  toast(`Ficha ${deckIndex} de ${deck.length}: deduce la enzima y autoevalúate`);
}

function renderRailFlashcardDeck() {
  const container = document.getElementById("rail-fc-card");
  if (!container) return;

  const deck = getFilteredFlashcards();
  if (deck.length === 0) {
    container.innerHTML = `<div style="padding:16px;text-align:center;color:var(--fg-dim);font-size:12px">No hay flashcards para este filtro.</div>`;
    return;
  }

  if (currentRailFcIndex >= deck.length) currentRailFcIndex = 0;
  if (currentRailFcIndex < 0) currentRailFcIndex = deck.length - 1;

  const item = deck[currentRailFcIndex];
  const pwData = PW[item.pwId] || { name: item.routeLabel, c: "var(--accent)" };

  if (!flashcardMode) {
    container.innerHTML = `
      <div class="rfc-card-top">
        <span class="rfc-route-pill" style="color:${pwData.c}">${esc(item.routeLabel)}</span>
        <span class="rfc-counter">${currentRailFcIndex + 1} / ${deck.length}</span>
      </div>
      <div class="rfc-card-prompt">${esc(item.prompt)}</div>
      <div style="background:var(--ink-2);border:1px dashed var(--line);border-radius:8px;padding:12px;margin:10px 0;text-align:center">
        <div style="font-size:11.5px;font-weight:600;color:var(--fg-dim);margin-bottom:6px">Modo de ocultamiento inactivo</div>
        <button type="button" class="btn primary" id="btn-rfc-activate" style="width:100%;font-size:11.5px;padding:6px 12px">
          Activar Ocultamiento de Términos
        </button>
      </div>
      <div class="rfc-nav-bar">
        <button type="button" class="btn-rfc-nav" id="btn-rfc-prev" title="Tarjeta anterior">Anterior</button>
        <button type="button" class="btn-rfc-nav" id="btn-rfc-open-full" title="Ver detalle completo en panel derecho">Ver detalle ↗</button>
        <button type="button" class="btn-rfc-nav" id="btn-rfc-next" title="Siguiente tarjeta">Siguiente</button>
      </div>
    `;

    const btnAct = container.querySelector("#btn-rfc-activate");
    if (btnAct) btnAct.onclick = () => toggleFlashcardMode(true);
    const btnPrev = container.querySelector("#btn-rfc-prev");
    if (btnPrev) btnPrev.onclick = () => { currentRailFcIndex--; renderRailFlashcardDeck(); };
    const btnNext = container.querySelector("#btn-rfc-next");
    if (btnNext) btnNext.onclick = () => { currentRailFcIndex++; renderRailFlashcardDeck(); };
    const btnFull = container.querySelector("#btn-rfc-open-full");
    if (btnFull) btnFull.onclick = () => {
      openRx(item.rxId);
      if (item.coords) focusXY(item.coords.x, item.coords.y, 820);
    };
    return;
  }

  // Flashcard mode is ACTIVE
  container.innerHTML = `
    <div class="rfc-card-top">
      <span class="rfc-route-pill" style="color:${pwData.c}">${esc(item.routeLabel)}</span>
      <span class="rfc-counter">${currentRailFcIndex + 1} / ${deck.length}</span>
    </div>
    <div class="rfc-card-prompt">${esc(item.prompt)}</div>

    <div class="rfc-terms-deck" id="rfc-terms-deck">
      <div class="rfc-term-box masked" data-rfc-box="enzyme">
        <div class="rfc-tb-header">
          <span class="rfc-tb-title">Enzima clave</span>
          <span class="rfc-tb-tag">Toca para ver</span>
        </div>
        <div class="rfc-tb-reveal"><span class="rfc-tb-reveal-txt">Revelar enzima</span></div>
        <div class="rfc-tb-secret">${esc(item.termEnzyme)}</div>
      </div>

      <div class="rfc-term-box masked" data-rfc-box="reaction">
        <div class="rfc-tb-header">
          <span class="rfc-tb-title">Reacción química / EC</span>
          <span class="rfc-tb-tag">Toca para ver</span>
        </div>
        <div class="rfc-tb-reveal"><span class="rfc-tb-reveal-txt">Revelar reacción / EC</span></div>
        <div class="rfc-tb-secret">${esc(item.termReaction)}</div>
      </div>

      <div class="rfc-term-box masked" data-rfc-box="reg">
        <div class="rfc-tb-header">
          <span class="rfc-tb-title">Regulación alostérica / covalente</span>
          <span class="rfc-tb-tag">Toca para ver</span>
        </div>
        <div class="rfc-tb-reveal"><span class="rfc-tb-reveal-txt">Revelar regulación</span></div>
        <div class="rfc-tb-secret">${esc(item.termRegulation)}</div>
      </div>

      <div class="rfc-term-box masked" data-rfc-box="clin">
        <div class="rfc-tb-header">
          <span class="rfc-tb-title">Correlación clínica</span>
          <span class="rfc-tb-tag">Toca para ver</span>
        </div>
        <div class="rfc-tb-reveal"><span class="rfc-tb-reveal-txt">Revelar patología</span></div>
        <div class="rfc-tb-secret">${esc(item.termClinical)}</div>
      </div>
    </div>

    <div class="rfc-self-rate-row">
      <span class="rfc-rate-label">Autoevaluación:</span>
      <button type="button" class="rfc-rate-btn ok" id="btn-rfc-rate-ok" title="Registrar acierto en tus estadísticas">
        <span>✓</span> <span>Me la sabía</span>
      </button>
      <button type="button" class="rfc-rate-btn ko" id="btn-rfc-rate-ko" title="Registrar para repasar en tus estadísticas">
        <span>✕</span> <span>A repasar</span>
      </button>
    </div>
    <div id="rfc-rate-feedback" style="display:none;font-size:11px;padding:4px 8px;border-radius:6px;margin-bottom:8px"></div>

    <div class="rfc-nav-bar">
      <button type="button" class="btn-rfc-nav" id="btn-rfc-prev" title="Tarjeta anterior">Anterior</button>
      <button type="button" class="btn-rfc-nav" id="btn-rfc-reveal-all" title="Revelar todos los términos de esta ficha">Revelar todo</button>
      <button type="button" class="btn-rfc-nav" id="btn-rfc-open-full" title="Ver detalle completo en panel derecho">Abrir ficha</button>
      <button type="button" class="btn-rfc-nav" id="btn-rfc-next" title="Siguiente tarjeta">Siguiente</button>
    </div>
  `;

  // Attach click-to-reveal handlers
  container.querySelectorAll(".rfc-term-box").forEach(box => {
    box.onclick = () => {
      box.classList.toggle("unveiled");
    };
  });

  const btnRevealAll = container.querySelector("#btn-rfc-reveal-all");
  if (btnRevealAll) {
    btnRevealAll.onclick = () => {
      container.querySelectorAll(".rfc-term-box").forEach(box => box.classList.add("unveiled"));
    };
  }

  // Self rating buttons
  const btnRateOk = container.querySelector("#btn-rfc-rate-ok");
  const btnRateKo = container.querySelector("#btn-rfc-rate-ko");
  const rateFeedback = container.querySelector("#rfc-rate-feedback");

  const handleSelfRate = (isCorrect) => {
    const updated = recordFlashcardPractice(item.pwId, isCorrect);
    renderLearningStatsRail();
    if (btnRateOk) { btnRateOk.disabled = true; if (isCorrect) btnRateOk.classList.add("selected"); }
    if (btnRateKo) { btnRateKo.disabled = true; if (!isCorrect) btnRateKo.classList.add("selected"); }
    if (rateFeedback) {
      rateFeedback.style.display = "block";
      rateFeedback.style.background = isCorrect ? "color-mix(in srgb,var(--accent) 15%,transparent)" : "color-mix(in srgb,var(--warn) 15%,transparent)";
      rateFeedback.style.color = isCorrect ? "var(--accent)" : "var(--warn)";
      rateFeedback.innerHTML = isCorrect ? `✓ <b>¡Correcto!</b> Guardado en estadísticas.` : `<b>Anotado</b> para reforzar repaso.`;
    }
    toast(isCorrect ? "¡Acierto registrado en tus estadísticas!" : "Guardado para repaso.");
  };

  if (btnRateOk) btnRateOk.onclick = () => handleSelfRate(true);
  if (btnRateKo) btnRateKo.onclick = () => handleSelfRate(false);

  const btnPrev = container.querySelector("#btn-rfc-prev");
  if (btnPrev) btnPrev.onclick = () => { currentRailFcIndex--; renderRailFlashcardDeck(); };
  const btnNext = container.querySelector("#btn-rfc-next");
  if (btnNext) btnNext.onclick = () => { currentRailFcIndex++; renderRailFlashcardDeck(); };
  const btnFull = container.querySelector("#btn-rfc-open-full");
  if (btnFull) btnFull.onclick = () => {
    openRx(item.rxId);
    if (item.coords) focusXY(item.coords.x, item.coords.y, 820);
  };
}

function syncFlashcardBtn() {
  const btn = document.getElementById("panel-flashcard-btn");
  if (btn) {
    btn.classList.toggle("active", flashcardMode);
    btn.setAttribute("aria-pressed", String(flashcardMode));
    const txt = btn.querySelector(".fc-txt");
    if (txt) txt.textContent = flashcardMode ? "Flashcard ✓" : "Flashcard";
  }

  const hdrBtn = document.getElementById("btn-hdr-flashcard");
  if (hdrBtn) {
    hdrBtn.classList.toggle("active", flashcardMode);
    hdrBtn.setAttribute("aria-pressed", String(flashcardMode));
    const stateEl = document.getElementById("hdr-fc-state");
    if (stateEl) {
      stateEl.textContent = flashcardMode ? "ON" : "OFF";
    }
  }

  const railBtn = document.getElementById("btn-rail-flashcard");
  if (railBtn) {
    railBtn.classList.toggle("active", flashcardMode);
    railBtn.setAttribute("aria-pressed", String(flashcardMode));
    const badge = document.getElementById("rail-fc-badge");
    if (badge) {
      badge.textContent = flashcardMode ? "Sesión activa ✓" : "Abrir tarjeta →";
    }
  }

  const railToggle = document.getElementById("rail-fc-toggle");
  if (railToggle) {
    railToggle.classList.toggle("active", flashcardMode);
    railToggle.setAttribute("aria-checked", String(flashcardMode));
  }

  const railBadge = document.getElementById("rail-fc-state-badge");
  if (railBadge) {
    railBadge.classList.toggle("active", flashcardMode);
    railBadge.textContent = flashcardMode ? "Activado" : "Desactivado";
  }

  renderRailFlashcardDeck();
}

function toggleFlashcardMode(forceState) {
  if (typeof forceState === "boolean") {
    flashcardMode = forceState;
  } else {
    flashcardMode = !flashcardMode;
  }
  try { localStorage.setItem("metabolix_flashcard_mode", String(flashcardMode)); } catch(e) {}
  syncFlashcardBtn();
  drawHud();

  if (flashcardMode) {
    if (currentPanelItem) {
      if (currentPanelItem.kind === "rx") openRx(currentPanelItem.id, currentPanelItem.fromDisease);
      else openNode(currentPanelItem.id);
    } else {
      // Abre de inmediato una ficha de alto impacto pedagógico en el mapa celular
      openNextFlashcard();
    }
    toast("Modo Estudio Flashcard activado: Nombres ocultos. ¡Toca para revelar!");
  } else {
    if (currentPanelItem) {
      if (currentPanelItem.kind === "rx") openRx(currentPanelItem.id, currentPanelItem.fromDisease);
      else openNode(currentPanelItem.id);
    }
    toast("Modo Flashcard desactivado: Nombres visibles.");
  }
}

function setupFlashcardInteractions(container) {
  if (!flashcardMode) return;
  container.querySelectorAll("[data-fc-block]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (el.classList.contains("revealed")) {
        const nodeId = el.getAttribute("data-node");
        const rxId = el.getAttribute("data-rx");
        if (nodeId && (e.target.closest(".fc-eq-secret") || e.target.classList.contains(".fc-eq-secret"))) {
          openNode(nodeId);
          return;
        }
        if (rxId && (e.target.closest(".fc-rx-secret") || e.target.classList.contains(".fc-rx-secret"))) {
          openRx(rxId);
          return;
        }
      }
      el.classList.toggle("revealed");
    });
  });

  const btnNext = container.querySelector("#fc-next-card");
  if (btnNext) {
    btnNext.onclick = (e) => {
      e.stopPropagation();
      openNextFlashcard();
    };
  }

  const btnRevealAll = container.querySelector("#fc-reveal-all");
  if (btnRevealAll) {
    btnRevealAll.onclick = (e) => {
      e.stopPropagation();
      container.querySelectorAll("[data-fc-block]").forEach(el => el.classList.add("revealed"));
    };
  }

  const btnHideAll = container.querySelector("#fc-hide-all");
  if (btnHideAll) {
    btnHideAll.onclick = (e) => {
      e.stopPropagation();
      container.querySelectorAll("[data-fc-block]").forEach(el => el.classList.remove("revealed"));
    };
  }

  const evalBox = container.querySelector("#fc-self-eval-box");
  if (evalBox) {
    const pw = evalBox.getAttribute("data-pw");
    const btnOk = evalBox.querySelector("#btn-fc-eval-ok");
    const btnKo = evalBox.querySelector("#btn-fc-eval-ko");
    const feedback = evalBox.querySelector("#fc-eval-feedback");

    const handleEval = (isCorrect) => {
      if (!pw) return;
      const updated = recordFlashcardPractice(pw, isCorrect);
      renderLearningStatsRail();

      if (btnOk) { btnOk.disabled = true; if (isCorrect) btnOk.classList.add("selected"); }
      if (btnKo) { btnKo.disabled = true; if (!isCorrect) btnKo.classList.add("selected"); }

      if (feedback) {
        feedback.style.display = "block";
        feedback.className = `fc-eval-feedback ${isCorrect ? "ok" : "ko"}`;
        const pwName = PW[pw]?.name || pw;
        feedback.innerHTML = isCorrect 
          ? `✓ <b>¡Excelente retención!</b> Registrado en <b>${esc(pwName)}</b> (${updated.correct}/${updated.practiced} aciertos, ${updated.accuracyRate}%).`
          : `✕ <b>Anotado para repaso.</b> Registrado en <b>${esc(pwName)}</b> (${updated.correct}/${updated.practiced} aciertos, ${updated.accuracyRate}%).`;
      }
      toast(isCorrect ? "¡Acierto registrado en tus estadísticas!" : "Guardado para repaso en tus estadísticas.");
    };

    if (btnOk) btnOk.onclick = (e) => { e.stopPropagation(); handleEval(true); };
    if (btnKo) btnKo.onclick = (e) => { e.stopPropagation(); handleEval(false); };
  }
}

const panel=$("#panel"), pbody=$("#panel-body");
$("#panel-close").onclick=()=>closePanel();
function closePanel(){ panel.classList.remove("open"); $(".body").classList.remove("po"); currentPanelItem = null; }
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ closePanel(); $("#results").hidden=true; } if(e.key==="/" && document.activeElement!==$("#q")){ e.preventDefault(); $("#q").focus(); } });

function onPick(kind,id){
  if(currentView==="misiones"){ msPick(kind,id); return; }
  if(quiz && !quiz.done && !quiz.reveal && currentView==="reto"){ answer(kind,id); return; }
  if(kind==="rx") openRx(id); else openNode(id);
}
function gauge(dg){ const min=-65,max=35; const k=(Math.max(min,Math.min(max,dg))-min)/(max-min)*100; const z=(0-min)/(max-min)*100;
  return `<div class="dg"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="eyebrow">ΔG°′ estándar</span><b class="mono" style="font-size:18px">${dg>0?"+":""}${dg} kJ/mol</b></div>
  <div class="dg-bar"><s style="left:${z}%"></s><i style="left:calc(${k}% - 1.5px)"></i></div><div class="dg-axis"><span>−65 · muy exergónica</span><span>0</span><span>+35</span></div></div>`; }

function openRx(id, fromDisease){
  currentPanelItem = { kind: "rx", id, fromDisease };
  syncFlashcardBtn();
  const r=RXM[id]; const c=PW[r.pathway].c; const reg=r.regulation;
  const A=MET[r.fromNodeId], B=MET[r.toNodeId];
  $("#panel-kind").textContent = "Reacción · enzima";

  let flashcardBanner = "";
  let headerHtml = "";
  let eqHtml = "";

  if (flashcardMode) {
    flashcardBanner = `
      <div class="flashcard-study-banner">
        <div class="fc-banner-top">
          <div class="fc-badge"><span class="fc-dot"></span><b>Modo estudio Flashcard</b></div>
          <div class="fc-banner-actions">
            <button type="button" class="fc-action-btn primary" id="fc-next-card" title="Practicar con la siguiente tarjeta flashcard">Siguiente Flashcard ▶</button>
            <button type="button" class="fc-action-btn" id="fc-reveal-all" title="Revelar todos los nombres de esta ficha">Revelar todo</button>
            <button type="button" class="fc-action-btn" id="fc-hide-all" title="Ocultar de nuevo para volver a memorizar">Ocultar</button>
          </div>
        </div>
        <p class="fc-banner-desc">
          Los nombres de la enzima y metabolitos están ocultos. Deduce la respuesta por su ruta, cofactores y regulación antes de tocar para revelar.
        </p>
      </div>
    `;

    headerHtml = `
      <div>
        <div class="tags">
          <span class="tag" style="color:${c};border-color:color-mix(in srgb,${c} 40%,transparent)">${esc(PW[r.pathway].name)}</span>
          <span class="tag">${esc(COMP[r.compartment]||r.compartment)}</span>
          ${reg&&reg.isKeyRegulator?'<span class="tag k">Punto de control</span>':""}
          ${r.reversible?'<span class="tag">Reversible</span>':'<span class="tag">Irreversible</span>'}
        </div>
        <div class="flashcard-card-block" data-fc-block="title" style="margin-top:8px">
          <div class="fc-card-label">
            <span>¿Qué enzima cataliza este paso?</span>
            <span style="font-size:10px;opacity:0.8">Toca para revelar </span>
          </div>
          <div class="fc-card-trigger">
            <div class="fc-card-cover"><span class="fc-eye"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Revelar nombre de la enzima</span></div>
            <div class="fc-card-secret p-title" style="margin:0">${esc(r.enzymeName)}</div>
          </div>
        </div>
        <div class="flashcard-card-block compact" data-fc-block="sub" style="margin-top:6px">
          <div class="fc-card-label">
            <span>Reacción química y código EC</span>
            <span style="font-size:10px;opacity:0.8">Toca para revelar </span>
          </div>
          <div class="fc-card-trigger">
            <div class="fc-card-cover" style="font-size:11.5px;padding:4px 10px"><span class="fc-eye"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Revelar reacción</span></div>
            <div class="fc-card-secret p-sub" style="margin:0">${esc(r.name)}${r.ecNumber?` · <span class="mono">${esc(r.ecNumber)}</span>`:""}</div>
          </div>
        </div>
      </div>
    `;

    eqHtml = `
      <div class="eq fc-eq" style="--pc:${c}">
        <div class="fc-eq-item" data-fc-block="sub_a" data-node="${A.id}" title="Toca para revelar sustrato (haz clic para navegar tras revelar)">
          <span class="fc-eq-label">Sustrato inicial</span>
          <span class="fc-eq-cover">¿Sustrato? </span>
          <span class="fc-eq-secret">${esc(A.abbreviation)}</span>
        </div>
        <span class="arrow">${r.reversible?"⇌":"⟶"}</span>
        <div class="fc-eq-item" data-fc-block="sub_b" data-node="${B.id}" title="Toca para revelar producto (haz clic para navegar tras revelar)">
          <span class="fc-eq-label">Producto formado</span>
          <span class="fc-eq-cover">¿Producto? </span>
          <span class="fc-eq-secret">${esc(B.abbreviation)}</span>
        </div>
        <div class="fc-eq-item" data-fc-block="enz_abbr" style="margin-left:auto" title="Toca para revelar siglas de la enzima">
          <span class="fc-eq-label">Enzima</span>
          <span class="fc-eq-cover">¿Siglas? </span>
          <span class="fc-eq-secret">${esc(r.enzymeAbbreviation)}</span>
        </div>
      </div>
    `;
  } else {
    headerHtml = `
      <div>
        <div class="tags">
          <span class="tag" style="color:${c};border-color:color-mix(in srgb,${c} 40%,transparent)">${esc(PW[r.pathway].name)}</span>
          <span class="tag">${esc(COMP[r.compartment]||r.compartment)}</span>
          ${reg&&reg.isKeyRegulator?'<span class="tag k">Punto de control</span>':""}
          ${r.reversible?'<span class="tag">Reversible</span>':'<span class="tag">Irreversible</span>'}
          ${rxRef(r.id)?`<span class="tag grid-tag" title="Casilla del mapa">Casilla ${rxRef(r.id)}</span>`:""}
        </div>
        <h2 class="p-title">${esc(r.enzymeName)}</h2>
        <div class="p-sub">${esc(r.name)}${r.ecNumber?` · <span class="mono">${esc(r.ecNumber)}</span>`:""}</div>
      </div>
    `;

    eqHtml = `
      <div class="eq" style="--pc:${c}">
        <button class="lnk" data-node="${A.id}" style="text-decoration:underline dotted;text-underline-offset:3px">${esc(A.abbreviation)}</button>
        <span class="arrow">${r.reversible?"⇌":"⟶"}</span>
        <button class="lnk" data-node="${B.id}" style="text-decoration:underline dotted;text-underline-offset:3px">${esc(B.abbreviation)}</button>
        <span style="margin-left:auto;color:var(--fg-faint);font-size:11px">${esc(r.enzymeAbbreviation)}</span>
      </div>
    `;
  }

  let selfEvalBox = "";
  if (flashcardMode) {
    selfEvalBox = `
      <div class="fc-self-eval-box" id="fc-self-eval-box" data-pw="${r.pathway}">
        <div class="fc-eval-prompt">
          <span class="fc-eval-title">Autoevaluación activa</span>
          <span class="fc-eval-sub">Tras revelar los nombres, ¿recordabas la enzima o sustratos?</span>
        </div>
        <div class="fc-eval-btns">
          <button type="button" class="fc-eval-btn ok" id="btn-fc-eval-ok" title="Registrar como acierto en tus estadísticas de aprendizaje">
            <span>✓</span> <span>Me la sabía</span>
          </button>
          <button type="button" class="fc-eval-btn ko" id="btn-fc-eval-ko" title="Registrar para repasar en tus estadísticas de aprendizaje">
            <span>✕</span> <span>A repasar</span>
          </button>
        </div>
        <div class="fc-eval-feedback" id="fc-eval-feedback" style="display:none"></div>
      </div>
    `;
  }

  let h = flashcardBanner + headerHtml + eqHtml + selfEvalBox + (r.deltaG0!=null?gauge(r.deltaG0):"");

  const cc=[...(r.cofactorsConsumed||[]).map(x=>`<span class="in">− ${esc(x)}</span>`),...(r.cofactorsProduced||[]).map(x=>`<span class="out">+ ${esc(x)}</span>`)];
  if(cc.length) h+=`<div class="blk"><h4>Cofactores</h4><div class="cof">${cc.join("")}</div></div>`;
  if(r.pathWayNotes) h+=`<div class="blk"><h4>Por qué importa</h4><p>${esc(r.pathWayNotes)}</p></div>`;
  if(PORTAL[r.id]) h+=`<button class="btn" data-portal="${PORTAL[r.id]}">Ver en detalle: ${esc(MODM[PORTAL[r.id]].title)} →</button>`;
  const f=r.module?0:flux(r); if(!r.module) h+=`<div class="blk"><h4>En el estado actual</h4><p><b style="color:${ST.c}">${esc(ST.name)}</b> · ${Math.abs(f)<.03?"prácticamente apagada":Math.abs(f)<.35?"flujo bajo":Math.abs(f)<.75?"flujo moderado":"flujo alto"}${f<-.02?" y <b>en sentido inverso</b> (gluconeogénico)":""}.</p></div>`;
  if(reg){
    if(reg.allostericEffectors?.length) {
      if(flashcardMode) {
        h+=`<div class="blk"><h4>Regulación alostérica</h4><div class="eff">${reg.allostericEffectors.map((e, idx)=>`
          <div class="${e.effect==="activator"?"act":"inh"} flashcard-card-block compact" data-fc-block="eff_${idx}">
            <span class="sym">${e.effect==="activator"?"+":"−"}</span>
            <div>
              <div class="fc-card-trigger">
                <span class="fc-card-cover" style="font-size:11px;padding:2px 8px">¿Efector alostérico? </span>
                <b class="fc-card-secret">${esc(e.molecule)}</b>
              </div>
              <p>${esc(e.physiologicalRole)}</p>
              ${e.affinityNote?`<small>${esc(e.affinityNote)}</small>`:""}
            </div>
          </div>`).join("")}</div></div>`;
      } else {
        h+=`<div class="blk"><h4>Regulación alostérica</h4><div class="eff">${reg.allostericEffectors.map(e=>`<div class="${e.effect==="activator"?"act":"inh"}"><span class="sym">${e.effect==="activator"?"+":"−"}</span><div><b>${esc(e.molecule)}</b><p>${esc(e.physiologicalRole)}</p>${e.affinityNote?`<small>${esc(e.affinityNote)}</small>`:""}</div></div>`).join("")}</div></div>`;
      }
    }
    const cv=reg.covalent;
    if(cv&&cv.hasCovalentRegulation) {
      if(flashcardMode) {
        h+=`
          <div class="blk">
            <h4>Control hormonal y covalente</h4>
            <div class="flashcard-card-block compact" data-fc-block="covalent">
              <div class="fc-card-label"><span>¿Qué hormonas activan e inactivan esta enzima?</span><span style="font-size:10px;opacity:0.8">Toca para revelar </span></div>
              <div class="fc-card-trigger">
                <div class="fc-card-cover" style="font-size:11.5px;padding:4px 10px"><span class="fc-eye"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Revelar control hormonal</span></div>
                <div class="fc-card-secret">
                  <div class="cov"><div class="on"><b>Activa · ${esc(cv.activeForm)}</b>${esc(cv.activatingHormone)}</div><div class="off"><b>Inactiva · ${esc(cv.inactiveForm)}</b>${esc(cv.inactivatingHormone)}</div></div>
                  <p style="margin-top:8px">${esc(cv.mechanism)}${cv.targetResidue?` <span class="mono" style="color:var(--fg-faint)">· ${esc(cv.targetResidue)}</span>`:""}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        h+=`<div class="blk"><h4>Control hormonal y covalente</h4><div class="cov"><div class="on"><b>Activa · ${esc(cv.activeForm)}</b>${esc(cv.activatingHormone)}</div><div class="off"><b>Inactiva · ${esc(cv.inactiveForm)}</b>${esc(cv.inactivatingHormone)}</div></div><p style="margin-top:8px">${esc(cv.mechanism)}${cv.targetResidue?` <span class="mono" style="color:var(--fg-faint)">· ${esc(cv.targetResidue)}</span>`:""}</p></div>`;
      }
    }
    if(reg.kinetics) h+=`<div class="blk kin" id="kin"><h4>Cinética ${reg.kinetics.modelType==="hill"?"sigmoide (Hill)":"de Michaelis-Menten"}</h4><div id="kin-plot"></div><label for="kin-s">[${esc(reg.kinetics.substrateName)}]<input type="range" id="kin-s" min="0" max="1000" value="250"><span class="mono" id="kin-sv"></span></label><div class="ctrl" id="kin-ctrl"></div><p id="kin-desc" style="margin-top:8px"></p></div>`;
    const cl=reg.clinical;
    if(cl) {
      if(flashcardMode) {
        h+=`<div class="clin">
          <span class="lab">Correlación clínica${cl.inheritance?` · ${esc(cl.inheritance)}`:""}</span>
          <div class="flashcard-card-block compact" data-fc-block="clin_disease" style="margin:4px 0 8px">
            <div class="fc-card-label"><span>¿Qué patología clínica causa su alteración?</span><span style="font-size:10px;opacity:0.8">Toca para revelar </span></div>
            <div class="fc-card-trigger">
              <div class="fc-card-cover" style="font-size:11.5px;padding:4px 10px"><span class="fc-eye"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Revelar patología asociada</span></div>
              <h5 class="fc-card-secret" style="margin:0">${esc(cl.diseaseName)}</h5>
            </div>
          </div>
          <p style="margin:0;color:var(--fg-dim);font-size:12.5px">${esc(cl.mechanism)}</p>
          ${cl.symptoms?.length?`<span class="lab">Clínica</span><ul>${cl.symptoms.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
          ${cl.diagnosticBiomarkers?.length?`<span class="lab">Diagnóstico</span><ul>${cl.diagnosticBiomarkers.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
          ${cl.treatmentKeys?.length?`<span class="lab">Tratamiento</span><ul>${cl.treatmentKeys.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
        </div>`;
      } else {
        h+=`<div class="clin"><span class="lab">Correlación clínica${cl.inheritance?` · ${esc(cl.inheritance)}`:""}</span><h5>${esc(cl.diseaseName)}</h5><p style="margin:0;color:var(--fg-dim);font-size:12.5px">${esc(cl.mechanism)}</p>
          ${cl.symptoms?.length?`<span class="lab">Clínica</span><ul>${cl.symptoms.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
          ${cl.diagnosticBiomarkers?.length?`<span class="lab">Diagnóstico</span><ul>${cl.diagnosticBiomarkers.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
          ${cl.treatmentKeys?.length?`<span class="lab">Tratamiento</span><ul>${cl.treatmentKeys.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}</div>`;
      }
    }
  }
  if(isLipidEntity(id)) h += renderLipidClinicalSuite(id);
  pbody.innerHTML=h; pbody.scrollTop=0; panel.classList.add("open"); $(".body").classList.add("po");
  pbody.querySelectorAll("[data-node]").forEach(b=>b.onclick=()=>openNode(b.dataset.node));
  pbody.querySelectorAll("[data-portal]").forEach(b=>b.onclick=()=>openModule(b.dataset.portal));
  setupFlashcardInteractions(pbody);
  if(reg&&reg.kinetics) kinetics(reg.kinetics, c);
  if(!fromDisease && currentView!=="reto"){ const E=EDGES.find(e=>e.r.id===id); if(E && innerWidth>860){ /* sin zoom forzado al explorar */ } }
  if(isLipidEntity(id)) {
    setupLipidClinicalSuite(pbody, id, {
      setBlock: bid => { setBlock(bid); apply(); },
      focusLipidArea: () => focusXY(1470, 680, 750),
      toast
    });
  }
}

function openNode(id){
  currentPanelItem = { kind: "node", id };
  syncFlashcardBtn();
  const m=MET[id]; const c=PW[m.pathways[0]]?.c||"var(--fg)";
  $("#panel-kind").textContent="Metabolito";
  const ins=ALLRX.filter(r=>r.toNodeId===id), outs=ALLRX.filter(r=>r.fromNodeId===id);

  const li = (r, dir) => {
    const partnerId = dir === "←" ? r.fromNodeId : r.toNodeId;
    const partner = MET[partnerId];
    if (!flashcardMode) {
      return `<button data-rx="${r.id}"><span class="dot" style="color:${PW[r.pathway].c}"></span><span>${dir} <b>${esc(r.enzymeAbbreviation)}</b> · ${esc(partner?.abbreviation||"")}</span><small>${esc(PW[r.pathway].name)}</small></button>`;
    }
    return `<div class="fc-rx-button" data-fc-block="rx_${r.id}" data-rx="${r.id}" title="Toca para revelar o doble clic para abrir reacción">
      <span class="dot" style="color:${PW[r.pathway].c}"></span>
      <span style="font-weight:700;font-family:var(--f-mono)">${dir}</span>
      <span class="fc-rx-cover">¿Enzima y conector? </span>
      <span class="fc-rx-secret"><b>${esc(r.enzymeAbbreviation)}</b> · ${esc(partner?.abbreviation||"")}</span>
      <small>${esc(PW[r.pathway].name)}</small>
    </div>`;
  };

  let flashcardBanner = "";
  let headerHtml = "";

  if (flashcardMode) {
    flashcardBanner = `
      <div class="flashcard-study-banner">
        <div class="fc-banner-top">
          <div class="fc-badge"><span class="fc-dot"></span><b>Modo estudio Flashcard</b></div>
          <div class="fc-banner-actions">
            <button type="button" class="fc-action-btn primary" id="fc-next-card" title="Practicar con la siguiente tarjeta flashcard">Siguiente Flashcard ▶</button>
            <button type="button" class="fc-action-btn" id="fc-reveal-all" title="Revelar todos los nombres de esta ficha">Revelar todo</button>
            <button type="button" class="fc-action-btn" id="fc-hide-all" title="Ocultar de nuevo para volver a memorizar">Ocultar</button>
          </div>
        </div>
        <p class="fc-banner-desc">
          El nombre y abreviatura de este metabolito están ocultos. Deduce la molécula por su compartimento, número de carbonos (${m.carbons > 0 ? m.carbons + 'C' : 'inorgánico'}), descripción y rutas antes de tocar para revelar.
        </p>
      </div>
    `;

    headerHtml = `
      <div>
        <div class="tags">
          <span class="tag">${esc(COMP[m.compartment]||m.compartment)}</span>
          ${m.isBranchPoint?'<span class="tag k">Encrucijada metabólica</span>':""}
          ${L[m.id]?`<span class="tag grid-tag" title="Casilla del mapa">Casilla ${gridRef(L[m.id][0],L[m.id][1])}</span>`:""}
        </div>
        <div class="flashcard-card-block" data-fc-block="title" style="margin-top:8px">
          <div class="fc-card-label">
            <span>¿Qué metabolito intermedio es este?</span>
            <span style="font-size:10px;opacity:0.8">Toca para revelar </span>
          </div>
          <div class="fc-card-trigger">
            <div class="fc-card-cover"><span class="fc-eye"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Revelar metabolito</span></div>
            <div class="fc-card-secret p-title" style="color:${c};margin:0">${esc(m.name)}</div>
          </div>
        </div>
        <div class="flashcard-card-block compact" data-fc-block="sub" style="margin-top:6px">
          <div class="fc-card-label">
            <span>Abreviatura y fórmula</span>
            <span style="font-size:10px;opacity:0.8">Toca para revelar </span>
          </div>
          <div class="fc-card-trigger">
            <div class="fc-card-cover" style="font-size:11.5px;padding:4px 10px"><span class="fc-eye"><svg class="ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Revelar abreviatura</span></div>
            <div class="fc-card-secret p-sub mono" style="margin:0">${esc(m.abbreviation)}${m.formula?` · ${esc(m.formula)}`:""}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    headerHtml = `
      <div>
        <div class="tags">
          <span class="tag">${esc(COMP[m.compartment]||m.compartment)}</span>
          ${m.isBranchPoint?'<span class="tag k">Encrucijada metabólica</span>':""}
          ${L[m.id]?`<span class="tag grid-tag" title="Casilla del mapa">Casilla ${gridRef(L[m.id][0],L[m.id][1])}</span>`:""}
        </div>
        <h2 class="p-title" style="color:${c}">${esc(m.name)}</h2>
        <div class="p-sub mono">${esc(m.abbreviation)}${m.formula?` · ${esc(m.formula)}`:""}</div>
      </div>
    `;
  }
  let selfEvalBox = "";
  const primaryPw = (m.pathways && m.pathways[0]) || "glycolysis";
  if (flashcardMode) {
    selfEvalBox = `
      <div class="fc-self-eval-box" id="fc-self-eval-box" data-pw="${primaryPw}">
        <div class="fc-eval-prompt">
          <span class="fc-eval-title">Autoevaluación activa</span>
          <span class="fc-eval-sub">Tras revelar el metabolito, ¿recordabas su estructura y función?</span>
        </div>
        <div class="fc-eval-btns">
          <button type="button" class="fc-eval-btn ok" id="btn-fc-eval-ok" title="Registrar como acierto en tus estadísticas de aprendizaje">
            <span>✓</span> <span>Me la sabía</span>
          </button>
          <button type="button" class="fc-eval-btn ko" id="btn-fc-eval-ko" title="Registrar para repasar en tus estadísticas de aprendizaje">
            <span>✕</span> <span>A repasar</span>
          </button>
        </div>
        <div class="fc-eval-feedback" id="fc-eval-feedback" style="display:none"></div>
      </div>
    `;
  }

  let nh = flashcardBanner + headerHtml + selfEvalBox +
   `${m.carbons>0?`<div class="blk"><h4>Esqueleto carbonado</h4><div class="carb">${Array.from({length:m.carbons},()=>`<i style="border-color:${c}"></i>`).join("")}<span class="mono" style="margin-left:8px;color:var(--fg-dim)">${m.carbons} C</span></div></div>`:""}
   <div class="blk"><p style="color:var(--fg);font-size:14px">${esc(m.description)}</p></div>
   <div class="blk"><h4>Rutas</h4><div class="chips">${m.pathways.filter(p=>PW[p]).map(p=>`<span class="chip" style="color:${PW[p].c}"><span class="dot"></span><span style="color:var(--fg)">${esc(PW[p].name)}</span></span>`).join("")}</div></div>
   ${PORTAL[id]?`<button class="btn" data-portal="${PORTAL[id]}">Ver en detalle: ${esc(MODM[PORTAL[id]].title)} →</button>`:""}
   ${ins.length?`<div class="blk"><h4>Se forma por</h4><div class="rxlist">${ins.map(r=>li(r,"←")).join("")}</div></div>`:""}
   ${outs.length?`<div class="blk"><h4>Se transforma en</h4><div class="rxlist">${outs.map(r=>li(r,"→")).join("")}</div></div>`:""}`;
  if(isLipidEntity(id)) nh += renderLipidClinicalSuite(id);
  pbody.innerHTML = nh;
  pbody.scrollTop=0; panel.classList.add("open"); $(".body").classList.add("po");
  pbody.querySelectorAll("[data-rx]").forEach(b=>b.onclick=()=>openRx(b.dataset.rx));
  pbody.querySelectorAll("[data-portal]").forEach(b=>b.onclick=()=>openModule(b.dataset.portal));
  setupFlashcardInteractions(pbody);
  if(isLipidEntity(id)) {
    setupLipidClinicalSuite(pbody, id, {
      setBlock: bid => { setBlock(bid); apply(); },
      focusLipidArea: () => focusXY(1470, 680, 750),
      toast
    });
  }
}

/* gráfica cinética */
function kinetics(k, color){
  const curves=[{name:"Basal",km:k.km,vmax:k.vmax,n:k.modelType==="hill"?(k.hillCoefficient||1):1,c:color,on:true,desc:""}];
  (k.allostericShiftEffectors||[]).forEach(e=>curves.push({name:e.effectorName,km:e.alteredKm,vmax:e.alteredVmax??k.vmax,n:e.alteredHill??(k.modelType==="hill"?(k.hillCoefficient||1):1),c:e.type==="activator"?"var(--pw-krebs)":"var(--danger)",on:true,desc:e.description,type:e.type}));
  const Smax = Math.max(...curves.map(c=>c.km))*4 || 1;
  const Vmax = Math.max(...curves.map(c=>c.vmax))*1.1;
  const W=400,H=220,ml=40,mr=12,mt=12,mb=34; const iw=W-ml-mr, ih=H-mt-mb;
  const X=s=>ml+s/Smax*iw, Y=v=>mt+ih-v/Vmax*ih;
  const v=(c,s)=>c.vmax*Math.pow(s,c.n)/(Math.pow(c.km,c.n)+Math.pow(s,c.n));
  const nice=(m)=>{const p=Math.pow(10,Math.floor(Math.log10(m)));const r=m/p;const st=r>5?2:r>2?1:.5;return st*p;};
  const sx=nice(Smax/4), sy=nice(Vmax/4);
  const ctrl=$("#kin-ctrl"), slider=$("#kin-s");
  function draw(){
    const S=slider.value/1000*Smax;
    let g=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva de velocidad frente a concentración de sustrato">`;
    for(let t=0;t<=Vmax+1e-9;t+=sy){ g+=`<line x1="${ml}" x2="${W-mr}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--grid)"/><text x="${ml-6}" y="${Y(t)+3}" text-anchor="end" font-size="9.5" fill="var(--axis-txt)" font-family="JetBrains Mono, monospace">${+t.toFixed(2)}</text>`; }
    for(let t=0;t<=Smax+1e-9;t+=sx){ g+=`<text x="${X(t)}" y="${H-mb+14}" text-anchor="middle" font-size="9.5" fill="var(--axis-txt)" font-family="JetBrains Mono, monospace">${+t.toFixed(2)}</text>`; }
    g+=`<text x="${ml+iw/2}" y="${H-4}" text-anchor="middle" font-size="10" fill="var(--fg-dim)">[S] (mM)</text><text x="10" y="${mt+ih/2}" font-size="10" fill="var(--fg-dim)" transform="rotate(-90 10 ${mt+ih/2})" text-anchor="middle">v (% Vmáx)</text>`;
    curves.filter(c=>c.on).forEach(c=>{ let d=""; for(let i=0;i<=120;i++){const s=i/120*Smax; d+=(i?"L":"M")+X(s).toFixed(1)+" "+Y(v(c,s)).toFixed(1);} g+=`<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.name==="Basal"?2.6:2}" ${c.name==="Basal"?"":'stroke-dasharray="5 3"'}/>`;
      g+=`<circle cx="${X(S)}" cy="${Y(v(c,S))}" r="4.5" fill="${c.c}" stroke="var(--ink-1)" stroke-width="2"/>`; });
    g+=`<line x1="${X(S)}" x2="${X(S)}" y1="${mt}" y2="${mt+ih}" stroke="var(--fg-dim)" stroke-dasharray="2 3"/>`;
    g+=`<line x1="${X(k.km)}" x2="${X(k.km)}" y1="${Y(k.vmax/2)}" y2="${mt+ih}" stroke="${color}" stroke-opacity=".4"/><text x="${X(k.km)+4}" y="${mt+ih-5}" font-size="9.5" fill="${color}" font-family="JetBrains Mono, monospace">${k.modelType==="hill"?"K₀.₅":"Km"}</text></svg>`;
    $("#kin-plot").innerHTML=g; cssify($("#kin-plot"));
    $("#kin-sv").textContent=S.toFixed(2)+" mM";
    $("#kin-desc").innerHTML=curves.filter(c=>c.on).map(c=>`<span style="color:${c.c}">●</span> ${esc(c.name)}: <b class="mono">${v(c,S).toFixed(0)}%</b>`).join(" &nbsp; ");
  }
  ctrl.innerHTML=curves.slice(1).map((c,i)=>`<button class="chip" aria-pressed="true" data-i="${i+1}" style="color:${c.c}" title="${esc(c.desc)}"><span class="dot"></span><span style="color:var(--fg)">${esc(c.name)}</span></button>`).join("");
  ctrl.querySelectorAll("button").forEach(b=>b.onclick=()=>{ const c=curves[+b.dataset.i]; c.on=!c.on; b.setAttribute("aria-pressed",String(c.on)); draw(); });
  slider.oninput=draw; draw();
}

/* ======================= Búsqueda ======================= */
function rxRef(id){ const E=EDGES.find(e=>e.r.id===id); if(!E) return ""; const [x,y]=pointAt(E.g,E.g.len/2); return gridRef(x,y); }
function resRef(r){ if(r.kind==="node"&&L[r.id]) return gridRef(L[r.id][0],L[r.id][1]); if(r.kind==="rx"||r.kind==="dis") return rxRef(r.id); return ""; }
let IDX = [
  ...D.METABOLITES.map(m=>({kind:"node",id:m.id,label:m.name,sub:m.abbreviation,c:PW[m.pathways[0]]?.c,txt:(m.name+" "+m.abbreviation).toLowerCase()})),
  ...RX.map(r=>({kind:"rx",id:r.id,label:r.enzymeName,sub:r.enzymeAbbreviation,c:PW[r.pathway].c,txt:(r.enzymeName+" "+r.enzymeAbbreviation+" "+r.name).toLowerCase()})),
  ...RX.filter(r=>r.regulation&&r.regulation.clinical).map(r=>({kind:"dis",id:r.id,label:r.regulation.clinical.diseaseName,sub:"Enfermedad",c:"var(--danger)",txt:r.regulation.clinical.diseaseName.toLowerCase()}))
];
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"");
let hl=0, curRes=[];
$("#q").addEventListener("input",()=>{ const q=norm($("#q").value.trim().toLowerCase()); const box=$("#results");
  if(!q){ box.hidden=true; return; } curRes=IDX.filter(i=>norm(i.txt).includes(q)).slice(0,12); hl=0;
  box.innerHTML = curRes.length? curRes.map((r,i)=>`<button data-i="${i}" class="${i===0?"hl":""}"><span class="dot" style="color:${r.c}"></span><span>${esc(r.label)}</span>${resRef(r)?`<span class="res-ref">${resRef(r)}</span>`:""}<small>${({node:"metabolito",rx:"enzima",dis:"enfermedad",mnode:"metabolito · esquema",mrx:"enzima · esquema",mdis:"enfermedad · esquema",mod:"esquema",tissue:"especialización tisular"})[r.kind]||""}</small></button>`).join("") : `<div style="padding:10px;color:var(--fg-faint);font-size:12px">Sin resultados para «${esc($("#q").value)}»</div>`;
  box.hidden=false; box.querySelectorAll("button").forEach(b=>b.onclick=()=>goRes(curRes[+b.dataset.i])); });
$("#q").addEventListener("keydown",e=>{ const box=$("#results"); if(box.hidden||!curRes.length) return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); hl=(hl+(e.key==="ArrowDown"?1:-1)+curRes.length)%curRes.length; box.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("hl",i===hl)); }
  if(e.key==="Enter"){ e.preventDefault(); goRes(curRes[hl]); } });
document.addEventListener("click",e=>{ if(!e.target.closest(".search")) $("#results").hidden=true; });
function goRes(r){ $("#results").hidden=true; $("#q").value=""; $("#q").blur();
  if(r.kind==="tissue"){ tissueSelectedId=r.id; tissueTab="explorer"; go("tejidos"); return; }
  if(r.kind==="mod"){ openModule(r.id); return; }
  if(r.kind==="mnode"){ openModule(modOfNode(r.id).id); openNode(r.id); return; }
  if(r.kind==="mrx"||r.kind==="mdis"){ const rr=RXM[r.id]; openModule(rr.module); openRx(r.id); return; }
  if(currentView!=="mapa") go("mapa");
  if(r.kind==="node"){ openNode(r.id); const [x,y]=L[r.id]; focusXY(x,y,700); }
  else { openRx(r.id); const E=EDGES.find(e=>e.r.id===r.id); const [x,y]=pointAt(E.g,E.g.len/2); focusXY(x,y,760); } }

/* ======================= Reto ======================= */
let quiz=null;
function shuffle(a){ const cp=[...a]; for(let i=cp.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cp[i],cp[j]]=[cp[j],cp[i]];} return cp; }

const BIOCHEM_QUESTIONS = [
  // --- acumulación de metabolitos (Identificar qué metabolito se acumula) ---
  {
    kind: "node", id: "f6p",
    concept: "Acumulación de metabolito",
    prompt: "Si la fosfofructoquinasa-1 (PFK-1) se frena por exceso de ATP o citrato, ¿qué intermediario de 6 carbonos se acumula inmediatamente antes en el citosol?",
    hint: "Toca el metabolito fosforilado en C-6 previo a la PFK-1 en el citosol.",
    explanation: "Al inhibirse la PFK-1, la fructosa-6-P se acumula y se equilibra con la glucosa-6-P, desviando glucosa hacia glucógeno o pentosas fosfato."
  },
  {
    kind: "node", id: "pep",
    concept: "Acumulación de metabolito",
    prompt: "Si la piruvato quinasa está inhibida por fosforilación mediada por glucagón, ¿qué intermediario enólico de altísima energía de hidrólisis se acumula al final de la glucólisis?",
    hint: "Toca el metabolito de 3 carbonos previo a la piruvato quinasa en el citosol.",
    explanation: "El PEP acumulado no se convierte en piruvato, permitiendo que el flujo gluconeogénico lo convierta en 2-PG y ascienda hacia glucosa."
  },
  {
    kind: "node", id: "pyruvate_cyt",
    concept: "Acumulación de metabolito",
    prompt: "Si el complejo piruvato deshidrogenasa (PDH) mitocondrial está bloqueado, ¿qué metabolito de 3 carbonos se acumula en el citosol y se desvía masivamente a lactato?",
    hint: "Toca el metabolito final de la glucólisis citosólica.",
    explanation: "Al no poder descarboxilarse a acetil-CoA, el piruvato citosólico se acumula y la LDH lo reduce a lactato para regenerar NAD⁺."
  },
  {
    kind: "node", id: "g6p",
    concept: "Acumulación de metabolito",
    prompt: "Si la glucosa-6-fosfatasa hepática no funciona durante el ayuno, ¿qué metabolito central de encrucijada queda atrapado y acumulado sin poder liberar glucosa a sangre?",
    hint: "Toca el nodo central de bifurcación de 6 carbonos en el citosol.",
    explanation: "La carga negativa del fosfato impide que la G-6-P cruce la membrana plasmática, acumulándose en el hepatocito e induciendo sobrecarga de glucógeno y acidosis láctica."
  },
  {
    kind: "node", id: "f1p",
    concept: "Acumulación de metabolito",
    prompt: "Si la aldolasa B hepática está inactiva, ¿qué éster fosfórico de 6 carbonos se acumula masivamente en el hepatocito secuestrando fosfato inorgánico libre?",
    hint: "Toca el intermediario fosforilado en C-1 en la entrada de la fructosa.",
    explanation: "La acumulación masiva de fructosa-1-fosfato atrapa el fosfato intracelular, deprimiendo la síntesis de ATP e inhibiendo a la glucógeno fosforilasa."
  },
  {
    kind: "node", id: "gal1p",
    concept: "Acumulación de metabolito",
    prompt: "Si la galactosa-1-fosfato uridiltransferasa (GALT) está bloqueada en la vía de Leloir, ¿qué metabolito fosforilado se acumula ejerciendo toxicidad celular?",
    hint: "Toca el intermediario fosforilado en la entrada de la galactosa.",
    explanation: "La galactosa-1-fosfato acumulada secuestra fosfato inorgánico e inhibe a la fosfoglucomutasa y a la glucosa-6-fosfatasa."
  },
  {
    kind: "node", id: "galactitol",
    concept: "Acumulación de metabolito",
    prompt: "Cuando la vía de Leloir se satura o bloquea, la aldosa reductasa reduce la galactosa acumulando este poliol osmóticamente activo en el cristalino:",
    hint: "Toca el poliol que carece de carbonilo en la vía de la galactosa.",
    explanation: "El galactitol carece de transportador y no es sustrato de la sorbitol deshidrogenasa humana, quedando atrapado en el cristalino y atrayendo agua por ósmosis."
  },
  {
    kind: "node", id: "acyl_coa_cyt",
    concept: "Acumulación de metabolito",
    prompt: "Si la carnitina palmitoiltransferasa 1 (CPT-1) está inhibida alostéricamente por malonil-CoA, ¿qué ácido graso activado queda retenido y acumulado en el citosol?",
    hint: "Toca el acil-CoA graso activado en el citosol.",
    explanation: "El malonil-CoA frena el intercambio por carnitina, asegurando que los ácidos grasos activados no ingresen a la matriz mientras la célula sintetiza lípidos."
  },
  {
    kind: "node", id: "citrate",
    concept: "Acumulación de metabolito",
    prompt: "Si la aconitasa del ciclo de Krebs se inhibe, ¿qué tricarboxilato se acumula en la matriz mitocondrial y sale al citosol para inhibir a la PFK-1?",
    hint: "Toca el primer tricarboxilato formado por condensación en el ciclo de Krebs.",
    explanation: "El citrato acumulado en la matriz se exporta al citosol vía transportador de tricarboxilatos, donde actúa como señal de abundancia energética que inhibe a la PFK-1."
  },
  {
    kind: "node", id: "coenzyme_q",
    concept: "Acumulación de metabolito",
    prompt: "Si se bloquea el complejo III de la cadena respiratoria con antimicina A, ¿qué transportador móvil liposoluble queda saturado y acumulado en su forma reducida (QH₂)?",
    hint: "Toca el pool lipídico móvil entre los complejos I, II y III.",
    explanation: "Al impedirse la transferencia de electrones hacia el citocromo c, todos los electrones procedentes de los complejos I, II y GPD2 quedan atascados en la ubiquinona (QH₂)."
  },
  {
    kind: "node", id: "udpg",
    concept: "Acumulación de metabolito",
    prompt: "Si la glucógeno sintasa está inactiva en el miocito, ¿qué nucleótido azúcar de alta energía se acumula como donante directo de monómeros de glucosa?",
    hint: "Toca la forma activada de glucosa previa al gránulo de glucógeno.",
    explanation: "La UDP-glucosa es la forma metabólicamente activada imprescindible para transferir unidades glucosilo al extremo no reductor del glucógeno."
  },
  {
    kind: "node", id: "acetyl_coa",
    concept: "Acumulación de metabolito",
    prompt: "Si el ciclo de Krebs se frena por falta de oxalacetato (desviado a gluconeogénesis), ¿qué intermediario de 2 carbonos de la PDH y β-oxidación se acumula y se desvía a cetogénesis?",
    hint: "Toca el metabolito condensante de 2 carbonos en la matriz mitocondrial.",
    explanation: "Sin oxalacetato suficiente para la citrato sintasa, el exceso de acetil-CoA en el hepatocito se condensa en acetoacetil-CoA para formar cuerpos cetónicos."
  },
  {
    kind: "node", id: "lactate_cyt",
    concept: "Acumulación de metabolito",
    prompt: "Durante una contracción muscular anaeróbica máxima, ¿qué producto final glucolítico se acumula para que la LDH pueda regenerar el NAD⁺?",
    hint: "Toca el metabolito reducido de 3 carbonos derivado del piruvato.",
    explanation: "El lactato se acumula y sale al torrente sanguíneo hacia el hígado (ciclo de Cori), permitiendo que la GAPDH continúe operando a gran velocidad."
  },

  // --- déficit de producto y consecuencias funcionales ---
  {
    kind: "node", id: "r5p",
    concept: "Consecuencia metabólica",
    prompt: "Si la glucosa-6-fosfato deshidrogenasa (G6PDH) está bloqueada, ¿qué pentosa indispensable para sintetizar nucleótidos (ARN/ADN) y coenzimas deja de formarse por la fase oxidativa?",
    hint: "Toca la aldopentosa producto de la fase oxidativa de pentosas fosfato.",
    explanation: "La rama oxidativa produce ribosa-5-fosfato y 2 NADPH; sin ella, la célula depende exclusivamente de la fase no oxidativa reversible para formar pentosas."
  },
  {
    kind: "node", id: "glucose_free",
    concept: "Consecuencia metabólica",
    prompt: "Durante el ayuno, el hígado debe mantener la glucemia. Si la glucosa-6-fosfatasa no actúa, ¿qué molécula no fosforilada deja de ser liberada al torrente sanguíneo?",
    hint: "Toca la glucosa libre no cargada generada en la gluconeogénesis hepática.",
    explanation: "La glucosa libre desfosforilada es la única forma que puede atravesar el transportador GLUT2 hacia la sangre para evitar la hipoglucemia."
  },
  {
    kind: "node", id: "oxaloacetate",
    concept: "Consecuencia metabólica",
    prompt: "Si la piruvato carboxilasa mitocondrial está inactiva, ¿qué dicarboxilato de 4 carbonos disminuye críticamente en la matriz, frenando la anaplerosis de Krebs?",
    hint: "Toca el aceptor de 4 carbonos que se condensa con acetil-CoA.",
    explanation: "El oxalacetato es el aceptor catalítico del ciclo de Krebs; su reposición anaplerótica por carboxilación del piruvato es indispensable para sostener el ciclo."
  },
  {
    kind: "node", id: "f16bp",
    concept: "Consecuencia metabólica",
    prompt: "Durante la gluconeogénesis hepática, si la fructosa-1,6-bisfosfatasa-1 (FBPasa-1) falla, ¿qué intermediario bisfosforilado no puede desfosforilarse hacia F-6-P?",
    hint: "Toca el metabolito con fosfatos en C-1 y C-6 de la glucólisis/gluconeogénesis.",
    explanation: "La FBPasa-1 hidroliza el fosfato en C-1; su inhibición por fructosa-2,6-bisfosfato frena la síntesis neta de glucosa en el estado alimentado."
  },

  // --- regulación enzimática y marcapasos ---
  {
    kind: "rx", id: "rx_pfk1",
    concept: "Regulación enzimática",
    prompt: "La célula registra abundancia de energía (ATP y citrato elevados). ¿Qué enzima marcapasos irreversible se inhibe alostéricamente para frenar la glucólisis?",
    hint: "Toca la flecha de la fosfofructoquinasa-1 en el citosol.",
    explanation: "La PFK-1 es el principal marcapasos glucolítico; el ATP se une a su sitio alostérico inhibidor estabilizando la conformación tensa (T)."
  },
  {
    kind: "rx", id: "rx_ldh",
    concept: "Respuesta celular",
    prompt: "En ausencia de oxígeno, la glucólisis se detendría por agotamiento de NAD⁺ citosólico. ¿Qué reacción se encarga de regenerar el NAD⁺ reduciendo piruvato?",
    hint: "Toca la flecha que convierte piruvato en lactato.",
    explanation: "La lactato deshidrogenasa (LDH) utiliza NADH para reducir piruvato a lactato, suministrando el NAD⁺ continuo que requiere la GAPDH."
  },
  {
    kind: "rx", id: "rx_g6pdh",
    concept: "Respuesta celular",
    prompt: "Frente a un aumento de especies reactivas de oxígeno (estrés oxidativo), ¿qué enzima irreversible cataliza el paso marcapasos generador de NADPH?",
    hint: "Toca la primera reacción de la vía de las pentosas fosfato.",
    explanation: "La G6PDH oxida G-6-P a 6-fosfogluconolactona y produce el primer NADPH, indispensable para mantener el glutatión en estado reducido (GSH)."
  },
  {
    kind: "rx", id: "rx_pyruvate_carboxylase",
    concept: "Regulación enzimática",
    prompt: "En el ayuno, el hígado inicia la gluconeogénesis desde piruvato. ¿Qué enzima mitocondrial dependiente de biotina y activada por acetil-CoA cataliza la primera reacción?",
    hint: "Toca la flecha en la matriz mitocondrial que convierte piruvato en oxalacetato.",
    explanation: "La piruvato carboxilasa consume 1 ATP y HCO₃⁻ con su grupo prostético biotina, generando oxalacetato para la gluconeogénesis y anaplerosis."
  },
  {
    kind: "rx", id: "rx_cpt1",
    concept: "Regulación enzimática",
    prompt: "Para evitar un ciclo fútil de síntesis y degradación simultánea de lípidos, el malonil-CoA inhibe la entrada de ácidos grasos a la mitocondria. ¿Qué enzima es la diana?",
    hint: "Toca la reacción en la membrana mitocondrial externa que forma acilcarnitina.",
    explanation: "La CPT-1 sustituye la CoA por carnitina; el malonil-CoA la inhibe alostéricamente asegurando que la β-oxidación permanezca apagada durante la lipogénesis."
  },
  {
    kind: "rx", id: "rx_scs",
    concept: "Mecanismo bioenergético",
    prompt: "En el ciclo de Krebs, ¿qué enzima cataliza la única fosforilación a nivel de sustrato escindiendo un tioéster de alta energía para formar GTP o ATP?",
    hint: "Toca la flecha entre succinil-CoA y succinato en el ciclo de Krebs.",
    explanation: "La succinil-CoA sintetasa acopla la ruptura del enlace tioéster de alta energía libre a la fosforilación directa de GDP a GTP (o ADP a ATP)."
  },
  {
    kind: "rx", id: "rx_gs",
    concept: "Regulación hormonal",
    prompt: "Tras una comida rica en carbohidratos, la insulina estimula el almacenamiento de glucosa en hígado y músculo. ¿Qué enzima se activa para sintetizar glucógeno?",
    hint: "Toca la flecha que incorpora UDP-glucosa a la macromolécula de glucógeno.",
    explanation: "La insulina promueve la desfosforilación de la glucógeno sintasa a través de la proteína fosfatasa 1 (PP1), activándola para elongar las cadenas."
  },
  {
    kind: "rx", id: "rx_gp",
    concept: "Regulación hormonal",
    prompt: "Durante el ayuno o el ejercicio, el glucagón y la adrenalina estimulan la liberación de glucosa desde reservas. ¿Qué enzima cataliza la fosforólisis del glucógeno?",
    hint: "Toca la flecha que degrada el glucógeno liberando G-1-P.",
    explanation: "La glucógeno fosforilasa cataliza la ruptura fosforolítica con Pi libre, liberando G-1-P sin consumo directo de ATP celular."
  },
  {
    kind: "rx", id: "rx_acc",
    concept: "Regulación enzimática",
    prompt: "En abundancia de citrato e insulina, ¿qué enzima citosólica dependiente de biotina cataliza el paso limitante de la síntesis de ácidos grasos produciendo malonil-CoA?",
    hint: "Toca la reacción citosólica que carboxila acetil-CoA a malonil-CoA.",
    explanation: "La acetil-CoA carboxilasa (ACC1) es el marcapasos de la lipogénesis; se activa por citrato y es reprimida por fosforilación por AMPK."
  },
  {
    kind: "rx", id: "rx_etc_c1",
    concept: "Mecanismo bioenergético",
    prompt: "Para iniciar la cadena respiratoria y bombear los primeros 4 H⁺ al espacio intermembrana, ¿qué complejo macromolecular mitocondrial oxida al NADH?",
    hint: "Toca el Complejo I (NADH deshidrogenasa) en la membrana interna.",
    explanation: "El Complejo I oxida NADH transfiriendo 2 electrones a la ubiquinona mediante centros Fe-S y translocando 4 protones a través de la membrana interna."
  },
  {
    kind: "rx", id: "rx_gapdh",
    concept: "Mecanismo bioenergético",
    prompt: "¿Qué enzima glucolítica realiza la primera reacción de óxido-reducción generando NADH citosólico y acoplando un fosfato inorgánico libre a un enlace acil-fosfato de alta energía?",
    hint: "Toca la flecha que oxida gliceraldehído-3-fosfato a 1,3-bisfosfoglicerato.",
    explanation: "La GAPDH utiliza NAD⁺ y Pi libre para oxidar el aldehído a un anhídrido mixto de alta energía (1,3-BPG), paso indispensable para generar ATP aguas abajo."
  },
  {
    kind: "rx", id: "rx_acly",
    concept: "Regulación enzimática",
    prompt: "El citrato mitocondrial se exporta al citosol tras una comida. ¿Qué enzima lo escinde con gasto de 1 ATP para generar el acetil-CoA citosólico que abastecerá la lipogénesis?",
    hint: "Toca la reacción citosólica que rompe el citrato en acetil-CoA y oxalacetato.",
    explanation: "La ATP-citrato liasa (ACLY) proporciona el sustrato inicial de dos carbonos en el citosol para la síntesis de ácidos grasos y colesterol."
  },
  {
    kind: "rx", id: "rx_aldose_reductase_gal",
    concept: "Respuesta celular",
    prompt: "Si la vía principal de Leloir no da abasto para procesar la galactosa libre, ¿qué enzima citosólica la reduce a galactitol a expensas de NADPH?",
    hint: "Toca la flecha lateral que desvía la galactosa hacia galactitol.",
    explanation: "La aldosa reductasa reduce el grupo aldehído de la galactosa a alcohol a expensas de NADPH, generando galactitol."
  }
];

/* comprobación para quien escriba preguntas nuevas: window.__quizCheck() lista las que no se pueden responder en el mapa */
if(typeof window!=="undefined") window.__quizCheck=()=>BIOCHEM_QUESTIONS.map((q,i)=>{
  const exists = q.kind==="rx" ? !!RXM[q.id] : !!MET[q.id];
  const onMap = q.kind==="rx" ? EDGES.some(E=>E.r.id===q.id) : !!NODES[q.id];
  return {i, kind:q.kind, id:q.id, exists, onMap};
}).filter(r=>!r.exists||!r.onMap);
const fmtPts = n => { n=Number(n||0); return (n<0?"−":"")+Math.abs(n).toLocaleString("es-ES"); };
const shortDegree = d => (d||"").replace(/^Grado en /,"");
let rankScope = "all";
function rankTable(res, max){
  if(!res) return `<p class="qz-rank-msg">El ranking no está disponible ahora mismo. Tus puntos se siguen guardando.</p>`;
  if(!res.rows.length) return `<p class="qz-rank-msg">Todavía no hay nadie en este ranking. ¡Sé el primero!</p>`;
  const rows = res.rows.slice(0,max);
  let html = `<ol class="qz-rank-list">${rows.map((r,i)=>`<li class="${r.me?"me":""}"><span class="pos">${i+1}</span><span class="nm">${esc(r.name)}${r.me?" (tú)":""}<small>${esc([shortDegree(r.degree), r.course].filter(Boolean).join(" · "))}</small></span><span class="pt">${fmtPts(r.points)}</span></li>`).join("")}</ol>`;
  if(res.myRow && !rows.some(r=>r.me)) html += `<p class="qz-rank-me">Tu posición: <b>${res.myRank ? res.myRank+"º" : "fuera del top"}</b> con ${fmtPts(res.myRow.points)} puntos.</p>`;
  return html;
}
function fillRanking(box, max){
  if(!box) return;
  const reg = isRegisteredStudent();
  const prof = reg ? getStudentProfile() : null;
  const deg = prof && prof.degree ? prof.degree : null;
  if(rankScope==="deg" && !deg) rankScope="all";
  const tabs = deg ? `<div class="seg qz-rank-tabs" role="group" aria-label="Ámbito del ranking">
      <button type="button" data-sc="all" aria-pressed="${rankScope==="all"}">Todos</button>
      <button type="button" data-sc="deg" aria-pressed="${rankScope==="deg"}">${esc(shortDegree(deg))}</button></div>` : "";
  const note = reg ? "" : `<p class="qz-rank-msg">Tus puntos se guardan en este navegador. Para entrar en el ranking, <button type="button" class="qz-link" id="qz-reg">regístrate en Acceso alumno</button>.</p>`;
  box.innerHTML = `<div class="qz-rank-head"><span class="eyebrow">Ranking · mejores puntuaciones</span>${tabs}</div><div class="qz-rank-body"><p class="qz-rank-msg">Cargando…</p></div>${note}`;
  box.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>{ rankScope=b.dataset.sc; fillRanking(box,max); });
  const rg = box.querySelector("#qz-reg"); if(rg) rg.onclick=()=>{ const b=$("#btn-student"); if(b) b.click(); };
  const scope = rankScope;
  /* window.__rankMock permite ver el ranking con datos de ejemplo al probar sin conexión */
  (window.__rankMock ? Promise.resolve(window.__rankMock) : getRanking(scope==="deg"?deg:null)).then(res=>{ if(scope!==rankScope) return; const body=box.querySelector(".qz-rank-body"); if(body) body.innerHTML=rankTable(res,max); });
}
function renderRankCard(Q){
  const tot=getQuizPoints();
  Q.innerHTML=`<div class="quiz-top"><span class="eyebrow">Tu puntuación</span><span class="score">Tienes <b>${fmtPts(tot.points)}</b> puntos · ${tot.correct} aciertos de ${tot.answered}</span></div>
  <p class="qz-rank-msg" style="margin:0">Cada acierto vale 100 puntos, y la racha suma 25 más por cada acierto seguido (hasta +100). Cada fallo resta 25.</p>
  <div class="qz-rank" id="qz-rank"></div>
  <div class="row"><button class="btn pri" id="qz-rank-back">${quiz && !quiz.done ? "Volver a la pregunta" : "Volver"}</button></div>`;
  fillRanking($("#qz-rank"), 10);
  $("#qz-rank-back").onclick=()=>{ quiz.showRank=false; renderQuiz(); };
}
function newQuiz(){
  if(window.metabolixIsSurveyBlocked && window.metabolixIsSurveyBlocked()){
    quiz=null; renderQuiz();
    if(window.metabolixOpenSurvey) window.metabolixOpenSurvey(true);
    return;
  }
  const nodeQs = shuffle(BIOCHEM_QUESTIONS.filter(q => q.kind === "node"));
  const rxQs = shuffle(BIOCHEM_QUESTIONS.filter(q => q.kind === "rx"));
  const selected = shuffle(nodeQs.slice(0, 4).concat(rxQs.slice(0, 4)));
  quiz={qs:selected,i:0,score:0,pts:0,lastPts:0,res:[],reveal:false,done:false,streak:0,showRank:false,bestSaved:false};
  focusPw=null; syncChips(); setBlock(null); closePanel(); animVB(fitBox()); renderQuiz();
}
function renderQuiz(){
  const Q=$("#quiz");
  const blocked = !!(window.metabolixIsSurveyBlocked && window.metabolixIsSurveyBlocked());
  if(!quiz && !blocked){ Q.hidden=true; return; } Q.hidden=false;
  if(quiz && quiz.showRank){ renderRankCard(Q); return; }
  /* la encuesta se pide antes de empezar un reto nuevo, nunca a mitad ni tapando el resultado final */
  if(blocked && (!quiz || (!quiz.done && quiz.i===0 && !quiz.reveal && !quiz.res.length))){
    Q.innerHTML=`<div class="quiz-top">
      <span class="eyebrow" style="color:var(--warn);font-weight:700">Encuesta requerida</span>
      <span class="score" style="color:var(--warn);font-weight:700">3 Retos completados</span>
    </div>
    <div style="margin:14px 0 16px">
      <h3 style="font-family:var(--f-display);font-size:18px;font-weight:800;color:var(--fg);margin:0 0 6px">
        ¡Has completado tus primeros 3 retos!
      </h3>
      <p style="margin:0;font-size:13.5px;color:var(--fg-dim);line-height:1.5;max-width:48ch">
        Para poder continuar realizando más retos y acceder a nuevas preguntas de autoevaluación, es <b>obligatorio cumplimentar la Encuesta de Satisfacción (1 al 5)</b>.
      </p>
    </div>
    <div class="row" style="gap:10px;flex-wrap:wrap">
      <button class="btn pri" id="qz-open-survey" style="background:var(--accent);color:#fff">Rellenar encuesta de satisfacción (obligatorio)</button>
      <button class="btn" id="qz-exit">Volver al mapa</button>
    </div>`;
    const btnSurv=$("#qz-open-survey"); if(btnSurv) btnSurv.onclick=()=>{ if(window.metabolixOpenSurvey) window.metabolixOpenSurvey(true); };
    const btnExit=$("#qz-exit"); if(btnExit) btnExit.onclick=()=>go("mapa");
    return;
  }
  if(quiz.done){ const pct=Math.round(quiz.score/quiz.qs.length*100);
    if(!quiz.bestSaved){ recordQuizBest(quiz.pts); quiz.bestSaved=true; }
    const tot=getQuizPoints();
    Q.innerHTML=`<div class="quiz-top"><span class="eyebrow">Reto de bioquímica general</span><span class="score">${fmtPts(tot.points)} puntos en total</span></div>
    <div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
      <span class="big-score">${quiz.score}<span style="font-size:24px;color:var(--fg-faint)">/${quiz.qs.length}</span></span>
      <div class="qz-pts-sum${quiz.pts<0?" neg":""}"><b>${quiz.pts>=0?"+":"−"}${fmtPts(Math.abs(quiz.pts))}</b> puntos en este reto${quiz.pts>0 && quiz.pts>=tot.best?` · <span class="qz-record">tu mejor reto</span>`:""}</div>
      <p style="margin:0;color:var(--fg-dim);max-width:44ch;flex-basis:100%">
        ${pct>=80 ? "¡Excelente razonamiento metabólico! Dominas las consecuencias de bloqueos, acumulaciones y marcapasos." : pct>=50 ? "Buen nivel. Repasa en el mapa las encrucijadas y enzimas donde dudaste." : "Explora el mapa celular y las fichas de regulación antes de volver a intentarlo."}
      </p>
    </div>
    <div class="qz-rank" id="qz-rank"></div>
    <div class="row" style="margin-top:4px"><button class="btn pri" id="qz-again">Nuevo reto</button><button class="btn" id="qz-exit">Volver al mapa</button></div>`;
    fillRanking($("#qz-rank"), 5);
    $("#qz-again").onclick=()=>newQuiz();
    $("#qz-exit").onclick=()=>go("mapa");
    return;
  }
  const q=quiz.qs[quiz.i];
  const prog=quiz.qs.map((_,i)=>`<i class="${i<quiz.res.length?(quiz.res[i]?"ok":"ko"):i===quiz.i?"cur":""}"></i>`).join("");
  let fb=`<div class="fb" style="color:var(--fg-dim);font-size:12.5px">${esc(q.hint)}</div>`;
  if(quiz.reveal){
    const name = q.kind==="rx"? RXM[q.id].enzymeName : MET[q.id].name;
    const expl = q.explanation ? `<div style="margin-top:5px;font-size:12.5px;color:var(--fg-dim);line-height:1.45">${esc(q.explanation)}</div>` : "";
    const verdict = quiz.lastOk
      ? `<div class="qz-verdict ok"><b>¡Acierto!</b><span>+${quiz.lastPts} puntos${quiz.streak>1?` · racha de ${quiz.streak}`:""}</span></div>`
      : `<div class="qz-verdict ko"><b>Fallo</b><span>${quiz.lastPick?`Has marcado ${esc(quiz.lastPick)}. `:""}−${Math.abs(quiz.lastPts)} puntos</span></div>`;
    fb=`${verdict}<div class="fb">${quiz.lastOk?"":"Respuesta correcta: "}<b>${esc(name)}</b>.${expl}</div>
    <div class="row" style="margin-top:8px"><button class="btn pri" id="qz-next">${quiz.i+1<quiz.qs.length?"Siguiente pregunta →":"Ver resultado final"}</button><button class="btn" id="qz-ficha">Ver ficha</button></div>`;
  }
  Q.innerHTML=`<div class="quiz-top">
    <span class="eyebrow">${esc(q.concept || "Bioquímica General")} · Pregunta ${quiz.i+1} de ${quiz.qs.length}</span>
    <span class="prog">${prog}</span>
    <span class="score"><b>${fmtPts(quiz.pts)}</b> pts${quiz.streak>1?` · racha ${quiz.streak}`:""}</span>
    <button class="qz-rank-btn" id="qz-rank-open" type="button">Ranking</button>
  </div>
  <q style="display:block;margin:6px 0 8px;font-size:16.5px;line-height:1.35;font-weight:700">${esc(q.prompt)}</q>
  ${fb}`;
  const ro=$("#qz-rank-open"); if(ro) ro.onclick=()=>{ quiz.showRank=true; renderQuiz(); };
  const fi=$("#qz-ficha"); if(fi) fi.onclick=()=>{ try{ q.kind==="rx"?openRx(q.id):openNode(q.id); }catch(e){ console.warn(e); } };
  const n=$("#qz-next"); if(n) n.onclick=()=>{
    quiz.reveal=false;
    quiz.i++;
    if(quiz.i>=quiz.qs.length){ quiz.done=true; try { incrementCompletedChallenges(); } catch(e){} }
    closePanel(); animVB(fitBox()); drawFx(); renderQuiz();
  };
}
/* las proteínas de la cadena respiratoria están en el mapa dos veces: como nodo y como reacción.
   Para el reto, tocar cualquiera de las dos es la misma respuesta. */
const SAME_TARGET = [
  ["node:complex_1","rx:rx_etc_c1"],
  ["node:complex_2","rx:rx_etc_c2","rx:rx_sdh"],
  ["node:complex_3","rx:rx_etc_c3"],
  ["node:complex_4","rx:rx_etc_c4"],
  ["node:atp_synthase","rx:rx_etc_c5"],
];
function sameTarget(kind,id,tk,tid){
  if(kind===tk && id===tid) return true;
  const a=`${kind}:${id}`, b=`${tk}:${tid}`;
  return SAME_TARGET.some(g=>g.includes(a)&&g.includes(b));
}
function answer(kind,id){
  const q=quiz.qs[quiz.i]; const ok = sameTarget(kind,id,q.kind,q.id);
  quiz.lastOk=ok; quiz.res.push(ok); if(ok){quiz.score++;quiz.streak++;} else quiz.streak=0; quiz.reveal=true;
  quiz.lastPts=pointsFor(ok,quiz.streak); quiz.pts+=quiz.lastPts;
  try { quiz.lastPick = kind==="rx" ? (RXM[id]?.enzymeName || "") : (MET[id]?.name || ""); } catch(e){ quiz.lastPick=""; }
  try { recordQuizPoints(quiz.lastPts, ok); } catch(e){ console.warn(e); }
  /* primero el veredicto, para que nunca se pierda aunque falle algo después */
  renderQuiz(); toast(ok?`¡Acierto! +${quiz.lastPts} puntos`:`Fallo: −${Math.abs(quiz.lastPts)} puntos`);
  const wide = !window.matchMedia || matchMedia("(min-width: 861px)").matches;
  try {
    if(q.kind==="rx"){ if(wide) openRx(q.id); const E=EDGES.find(e=>e.r.id===q.id); if(E){ const pt=pointAt(E.g,E.g.len/2); focusXY(pt[0],pt[1],900); } }
    else { if(wide) openNode(q.id); if(L[q.id]){ const [x,y]=L[q.id]; focusXY(x,y,900); } }
  } catch(e){ console.warn("Reto: no se pudo abrir la ficha", e); }
  try { drawFx(); } catch(e){}
  try {
    const selName = kind==="rx"? (RXM[id]?.enzymeName || id) : (MET[id]?.name || id);
    const tgtName = q.kind==="rx"? (RXM[q.id]?.enzymeName || q.id) : (MET[q.id]?.name || q.id);
    window.dispatchEvent(new CustomEvent("metabolix:quiz_answered", {
      detail: {
        questionId: q.id,
        concept: q.concept || "Bioquímica General",
        prompt: q.prompt,
        selectedName: selName,
        targetName: tgtName,
        isCorrect: ok,
        explanation: q.explanation || q.hint || ""
      }
    }));
  } catch(e){}
}

/* ======================= Balances ======================= */
const BAL=D.SUBSTRATE_ENERGY_BALANCES; let balSel="glucose_aerobic", shuttle="mas", shuttleTab="glucose";
/* corrección de datos: fructosa y galactosa con la fase mitocondrial y la cadena respiratoria explícitas */
(function(){
  const ETC=(n)=>({step:"Cadena respiratoria y ATP sintasa",enzyme:"Complejos I–IV y ATP sintasa",compartment:"mitochondria_membrane",atpDelta:28,nadhDelta:-10,nadphDelta:0,fadh2Delta:-2,co2Delta:0,note:n});
  const fr=BAL.find(b=>b.id==="fructose_liver");
  if(fr && fr.steps.length===4){ fr.steps[3].atpDelta=2; fr.steps[3].note="PDH y ciclo de Krebs: 2 GTP directos, 8 NADH y 2 FADH₂ mitocondriales, y 6 CO₂."; fr.steps[3].co2Delta=6;
    fr.steps.push(ETC("Oxidación de 10 NADH (2 citosólicos vía lanzadera + 8 mitocondriales) y 2 FADH₂ = 28 ATP. Total neto = 32 ATP.")); }
  const ga=BAL.find(b=>b.id==="galactose_balance");
  if(ga && ga.steps.length===3){ ga.steps[1].step="Vía de Leloir hasta G-6-P y PFK-1"; ga.steps[1].note="GALT y UDP-galactosa 4-epimerasa convierten la Gal-1-P en G-1-P sin gastar ATP; la PFK-1 consume el 2º ATP.";
    ga.steps.splice(2,1,
      {step:"Fase de generación (GAPDH, PGK, PK)",enzyme:"GAPDH, PGK y PK",compartment:"cytosol",atpDelta:4,nadhDelta:2,nadphDelta:0,fadh2Delta:0,co2Delta:0,note:"Igual que la glucosa: 4 ATP por fosforilación a nivel de sustrato y 2 NADH citosólicos."},
      {step:"PDH y ciclo de Krebs",enzyme:"PDH, IDH, α-KGDH, SCS, SDH, MDH",compartment:"mitochondria_matrix",atpDelta:2,nadhDelta:8,nadphDelta:0,fadh2Delta:2,co2Delta:6,note:"2 GTP directos, 8 NADH y 2 FADH₂ mitocondriales."},
      ETC("Oxidación de 10 NADH (2 citosólicos vía lanzadera + 8 mitocondriales) y 2 FADH₂ = 28 ATP. Total neto = 32 ATP.")); }
})();
const SHUTTLE_WHY = {gluconeogenesis_lactate:"No interviene: el NADH que genera la LDH lo consume la GAPDH en el propio citosol.",palmitate_beta_oxidation:"No interviene: todo el NADH de la β-oxidación y del ciclo de Krebs se forma ya en la matriz.",krebs_per_acetyl_coa:"No interviene: todo el NADH se forma en la matriz.",glucose_anaerobic:"No interviene: sin oxígeno, la LDH reoxida el NADH en el citosol.",pentose_shunt:"No interviene: la ruta produce NADPH, no NADH.",glycogen_storage:"No interviene: no se produce NADH."};
const cytNADH = b => Math.max(0, b.steps.filter(s=>s.compartment==="cytosol").reduce((t,s)=>t+s.nadhDelta,0));
function balAdj(b){
  const n=cytNADH(b); if(!n) return b;
  const c=JSON.parse(JSON.stringify(b));
  if(shuttle==="mas"){
    if(c.id==="glucose_aerobic") c.tissue="Hígado / Corazón / Riñón (Lanzadera Malato-Aspartato)";
    return c;
  }
  const loss=n*1; c.aerobicAtpNet=b.aerobicAtpNet-loss;
  const etc=[...c.steps].reverse().find(s=>s.compartment==="mitochondria_membrane"&&s.atpDelta>0);
  if(c.id==="glucose_aerobic") c.tissue="Músculo Esquelético Rápido / Encéfalo (Lanzadera Glicerol-3-P)";
  else c.tissue=c.tissue.replace(/\s*\(Lanzadera[^)]*\)/i," (Lanzadera Glicerol-3-P)");
  c.steps.forEach(st=>{ st.note=st.note.replace("valen ~5 ATP vía lanzadera malato-aspartato y Complejo I","valen ~3 ATP vía lanzadera del glicerol-3-P y CoQ"); });
  if(etc){ etc.atpDelta-=loss; etc.note=etc.note.replace("Total neto = 32 ATP",`Total neto = ${c.aerobicAtpNet} ATP`)+` Con la lanzadera del glicerol-3-P los ${n} NADH citosólicos rinden 1,5 ATP en vez de 2,5: −${loss} ATP.`; }
  return c;
}

function renderShuttleComparisonSuite(currentShuttle, selectedSubstrateId){
  const isMas = currentShuttle === "mas";
  const isGlc = selectedSubstrateId === "glucose_aerobic";
  
  const tabs = [
    { id: "glucose", label: "Rendimiento en glucosa (32 vs 30 ATP)" },
    { id: "matrix", label: "Matriz comparativa frente a frente" },
    { id: "clinical", label: "Bioquímica tisular y clínica" }
  ];
  
  const navHtml = `<div class="clinical-nav-tabs" role="tablist">
    ${tabs.map(t => `<button class="clinical-nav-tab" role="tab" data-sh-tab="${t.id}" aria-selected="${shuttleTab === t.id}">${esc(t.label)}</button>`).join("")}
  </div>`;
  
  let bodyHtml = "";
  if (shuttleTab === "glucose") {
    bodyHtml = `
      <div class="clinical-delta-ribbon">
        <div style="display:flex;align-items:center;gap:10px;flex:1 1 300px">
          <span class="clinical-tag-emerald">${isMas ? "Máxima Eficiencia (32 ATP)" : "Cinética Rápida (30 ATP · Δ = −2)"}</span>
          <div style="font-size:13px;color:var(--fg);font-weight:600">
            ${isMas 
              ? "Lanzadera Malato-Aspartato activa: 2 NADH citosólicos entran al Complejo I (10 H⁺ bombeados) rindiendo 5,0 ATP."
              : "Lanzadera Glicerol-3-P activa: 2 NADH citosólicos entran a CoQ (6 H⁺ bombeados, salta Complejo I) rindiendo 3,0 ATP."}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${!isGlc ? `<button class="clinical-btn-ghost" data-select-glucose="true">Aplicar en D-Glucosa aeróbica</button>` : `<span class="clinical-badge-active">D-Glucosa seleccionada</span>`}
        </div>
      </div>

      <div class="clinical-cards-split">
        <div class="clinical-card-box ${isMas ? 'active-shuttle' : ''}" data-card-sh="mas" title="Pulsa para activar la lanzadera malato-aspartato">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div>
              <span class="clinical-eyebrow">Complejo I · matriz</span>
              <h4 style="margin:2px 0 0;font-size:17px;font-weight:700">Lanzadera Malato-Aspartato (MAS)</h4>
              <p style="margin:2px 0 0;font-size:12px;color:var(--fg-dim)">Hígado, miocardio (corazón) y corteza renal</p>
            </div>
            <div style="text-align:right">
              <span style="font-family:var(--f-mono);font-size:28px;font-weight:800;color:${isMas ? '#059669' : 'var(--fg)'}">32</span>
              <span style="display:block;font-size:10px;color:var(--fg-faint);text-transform:uppercase">ATP / glucosa</span>
            </div>
          </div>

          <div class="clinical-stat-grid">
            <div class="clinical-stat-item">
              <span>Por NADH citosólico</span>
              <b>2,5 ATP</b>
            </div>
            <div class="clinical-stat-item">
              <span>2 NADH de GAPDH</span>
              <b>+5,0 ATP</b>
            </div>
            <div class="clinical-stat-item">
              <span>Translocación H⁺</span>
              <b>10 H⁺ / par e⁻</b>
            </div>
            <div class="clinical-stat-item">
              <span>Punto de entrada</span>
              <b>Complejo I</b>
            </div>
          </div>

          <p style="margin:0;font-size:12.5px;color:var(--fg-dim);line-height:1.45">
            Conserva el 100% de la energía redox del NADH citosólico. Requiere el transportador OGC (malato/α-KG) y citrina/Aralar1 (AGC, aspartato/glutamato + H⁺).
          </p>

          <div style="display:flex;gap:8px;align-items:center;margin-top:auto;flex-wrap:wrap">
            <button class="clinical-btn-action ${isMas ? 'active' : ''}" data-sh="mas">
              ${isMas ? "✓ Activa en balance (32 ATP)" : "Activar en balance (32 ATP)"}
            </button>
            <button class="clinical-btn-outline" data-open-sh="mas">
              Ver circuito animado →
            </button>
          </div>
        </div>

        <div class="clinical-card-box ${!isMas ? 'active-shuttle' : ''}" data-card-sh="g3p" title="Pulsa para activar la lanzadera glicerol-3-fosfato">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div>
              <span class="clinical-eyebrow" style="color:${!isMas ? '#059669' : '#d97706'}">Coenzima Q · cara externa MMI</span>
              <h4 style="margin:2px 0 0;font-size:17px;font-weight:700">Lanzadera Glicerol-3-Fosfato (G3P)</h4>
              <p style="margin:2px 0 0;font-size:12px;color:var(--fg-dim)">Músculo esquelético rápido (IIb), Encéfalo y Grasa parda</p>
            </div>
            <div style="text-align:right">
              <span style="font-family:var(--f-mono);font-size:28px;font-weight:800;color:${!isMas ? '#059669' : '#d97706'}">30</span>
              <span style="display:block;font-size:10px;color:var(--fg-faint);text-transform:uppercase">ATP / glucosa (Δ = −2)</span>
            </div>
          </div>

          <div class="clinical-stat-grid">
            <div class="clinical-stat-item">
              <span>Por NADH citosólico</span>
              <b>1,5 ATP</b>
            </div>
            <div class="clinical-stat-item">
              <span>2 NADH de GAPDH</span>
              <b>+3,0 ATP</b>
            </div>
            <div class="clinical-stat-item">
              <span>Translocación H⁺</span>
              <b>6 H⁺ / par e⁻</b>
            </div>
            <div class="clinical-stat-item">
              <span>Punto de entrada</span>
              <b>CoQ (salta CI)</b>
            </div>
          </div>

          <p style="margin:0;font-size:12.5px;color:var(--fg-dim);line-height:1.45">
            Prioriza la velocidad sobre la eficiencia: la GPD2 mitocondrial usa FAD y dona electrones al CoQ. Esencialmente irreversible y activada alostéricamente por Ca²⁺.
          </p>

          <div style="display:flex;gap:8px;align-items:center;margin-top:auto;flex-wrap:wrap">
            <button class="clinical-btn-action ${!isMas ? 'active' : ''}" data-sh="g3p">
              ${!isMas ? "✓ Activa en balance (30 ATP)" : "Activar en balance (30 ATP)"}
            </button>
            <button class="clinical-btn-outline" data-open-sh="g3p">
              Ver circuito animado →
            </button>
          </div>
        </div>
      </div>

      <div class="clinical-breakdown-box">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <h5 style="margin:0;font-size:14px;font-weight:700">Desglose Estequiométrico Completo (1 mol D-Glucosa)</h5>
            <p style="margin:2px 0 0;font-size:12px;color:var(--fg-dim)">
              Comparativa reacción a reacción: la lanzadera determina exactamente el rendimiento del paso de la GAPDH:
            </p>
          </div>
          <span style="font-family:var(--f-mono);font-size:12px;padding:4px 10px;border-radius:6px;background:var(--ink-3);color:var(--fg);font-weight:700">
            Diferencial neto = −2 ATP por glucosa
          </span>
        </div>

        <div class="clinical-breakdown-table">
          <div class="clinical-bt-head">
            <span>Fase / reacción</span>
            <span>Rendimiento base</span>
            <span>Vía Malato-Aspartato</span>
            <span>Vía Glicerol-3-P</span>
          </div>
          <div class="clinical-bt-row">
            <span>Glucólisis citosólica (a nivel de sustrato)</span>
            <span>+2 ATP netos (4 formados − 2 gastados)</span>
            <b class="pos">+2 ATP</b>
            <b class="pos">+2 ATP</b>
          </div>
          <div class="clinical-bt-row highlight-row">
            <span><b>2 NADH citosólicos (GAPDH)</b></span>
            <span>2 mol NADH en citosol</span>
            <b style="color:#059669">+5,0 ATP (vía complejo I)</b>
            <b style="color:#d97706">+3,0 ATP (vía CoQ, −2 ATP)</b>
          </div>
          <div class="clinical-bt-row">
            <span>Complejo PDH (2 piruvatos en matriz)</span>
            <span>2 NADH mitocondriales</span>
            <b class="pos">+5,0 ATP</b>
            <b class="pos">+5,0 ATP</b>
          </div>
          <div class="clinical-bt-row">
            <span>Ciclo de Krebs (SCS x2)</span>
            <span>2 GTP / ATP directos</span>
            <b class="pos">+2,0 ATP</b>
            <b class="pos">+2,0 ATP</b>
          </div>
          <div class="clinical-bt-row">
            <span>Ciclo de Krebs (SDH x2)</span>
            <span>2 FADH₂ mitocondriales</span>
            <b class="pos">+3,0 ATP</b>
            <b class="pos">+3,0 ATP</b>
          </div>
          <div class="clinical-bt-row">
            <span>Ciclo de Krebs (IDH + α-KGDH + MDH)</span>
            <span>6 NADH mitocondriales</span>
            <b class="pos">+15,0 ATP</b>
            <b class="pos">+15,0 ATP</b>
          </div>
          <div class="clinical-bt-total">
            <span><b>Total neto aeróbico</b></span>
            <span>Estequiometría P/O moderna</span>
            <b style="font-size:15px;color:#059669">32 ATP (100%)</b>
            <b style="font-size:15px;color:#d97706">30 ATP (93,8%)</b>
          </div>
        </div>
      </div>
    `;
  } else if (shuttleTab === "matrix") {
    bodyHtml = `
      <div class="clinical-matrix-wrap">
        <div class="clinical-matrix-header">
          <span>Parámetro fisiológico y bioquímico</span>
          <span style="color:#059669">Lanzadera Malato-Aspartato (MAS)</span>
          <span style="color:#d97706">Lanzadera Glicerol-3-Fosfato (G3P)</span>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Rendimiento neto de ATP (glucosa)</b><small style="color:var(--fg-dim)">Balance aeróbico total por hexosa</small></div>
          <div><b style="color:#059669">32 ATP</b> <span style="font-size:11px;color:var(--fg-dim)">(rendimiento máximo del 100%)</span></div>
          <div><b style="color:#d97706">30 ATP</b> <span style="font-size:11px;color:var(--fg-dim)">(pérdida neta de 2 ATP por glucosa)</span></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Rendimiento por NADH citosólico</b><small style="color:var(--fg-dim)">Equivalente en fosforilación oxidativa</small></div>
          <div><b>2,5 ATP / NADH</b> <span style="font-size:11px;color:var(--fg-dim)">(5,0 ATP por 2 NADH de GAPDH)</span></div>
          <div><b>1,5 ATP / NADH</b> <span style="font-size:11px;color:var(--fg-dim)">(3,0 ATP por 2 NADH de GAPDH)</span></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Punto de Entrada en Cadena de e⁻</b><small style="color:var(--fg-dim)">Aceptor inicial del par de electrones</small></div>
          <div><b>Complejo I (NADH deshidrogenasa)</b><br><small style="color:var(--fg-dim)">El NADH se regenera intacto en la matriz</small></div>
          <div><b>Coenzima Q / pool Q (ubiquinona)</b><br><small style="color:var(--fg-dim)">Vía FAD unido a la enzima GPD2 (salta Complejo I)</small></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Protones bombeados (H⁺)</b><small style="color:var(--fg-dim)">Fuerza protón-motriz por par de electrones</small></div>
          <div><b>10 H⁺ bombeados</b><br><small style="color:var(--fg-dim)">4 H⁺ (CI) + 4 H⁺ (CIII) + 2 H⁺ (CIV)</small></div>
          <div><b>6 H⁺ bombeados</b><br><small style="color:var(--fg-dim)">0 H⁺ (salta CI) + 4 H⁺ (CIII) + 2 H⁺ (CIV)</small></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Enzimas citosólica y mitocondrial</b><small style="color:var(--fg-dim)">Isoenzimas que acoplan el flujo redox</small></div>
          <div><b>MDH1 / MDH2 y AST1 / AST2</b><br><small style="color:var(--fg-dim)">Malato deshidrogenasas + Aspartato aminotransferasas</small></div>
          <div><b>GPD1 y GPD2</b><br><small style="color:var(--fg-dim)">Glicerol-3-P deshidrogenasas citosólica (NAD⁺) y mitocondrial (FAD)</small></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Transportadores de membrana interna</b><small style="color:var(--fg-dim)">Sistemas de translocación en MMI</small></div>
          <div><b>Doble antiporte: OGC + AGC1/Citrina</b><br><small style="color:var(--fg-dim)">OGC (SLC25A11, malato/α-KG) y AGC (SLC25A12/13, asp/glu+H⁺)</small></div>
          <div><b>Ninguno requerido</b><br><small style="color:var(--fg-dim)">GPD2 expuesta a cara externa de MMI; metabolitos cruzan porinas de MME</small></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Distribución tisular clave</b><small style="color:var(--fg-dim)">Órganos donde predomina la lanzadera</small></div>
          <div><b>Hígado, miocardio (corazón) y riñón</b><br><small style="color:var(--fg-dim)">Tejidos estrictamente aeróbicos con máxima exigencia energética</small></div>
          <div><b>Músculo esquelético rápido (IIb), Cerebro y Grasa parda</b><br><small style="color:var(--fg-dim)">Tejidos de respuesta veloz, explosiva o termogénica</small></div>
        </div>

        <div class="clinical-matrix-row">
          <div><b>Cinética y control fisiológico</b><small style="color:var(--fg-dim)">Reversibilidad y efectores alostéricos</small></div>
          <div><b>Reversible in vitro; impulsada por ΔΨm</b><br><small style="color:var(--fg-dim)">El gradiente electroquímico impulsa el simporte electrogénico aspartato/H⁺</small></div>
          <div><b>Irreversible (ΔG°′ ≈ −43 kJ/mol); estimulada por Ca²⁺</b><br><small style="color:var(--fg-dim)">Dominios EF-hand de GPD2 captan Ca²⁺ citosólico durante la contracción</small></div>
        </div>
      </div>
    `;
  } else if (shuttleTab === "clinical") {
    bodyHtml = `
      <div class="clinical-dis-grid">
        <div class="clinical-dis-card">
          <div class="clinical-dis-head">
            <span class="clinical-tag-danger">Gen SLC25A13 · autosómica recesiva</span>
            <h4>Citrulinemia tipo II (CTLN2) & déficit de citrina</h4>
          </div>
          <p>
            La citrina es la isoforma hepática del transportador aspartato-glutamato (AGC2). Su mutación colapsa la lanzadera malato-aspartato en el hepatocito, impidiendo la exportación de aspartato mitocondrial al citosol.
          </p>
          <div class="clinical-bullet-list">
            <div><b>Mecanismo patogénico:</b> Acúmulo masivo de NADH citosólico (relación NADH/NAD⁺ desproporcionada) que inhibe la GAPDH y bloquea el ciclo de la urea en el paso de la ASS1.</div>
            <div><b>Clínica clásica:</b> Crisis recurrentes de hiperamonemia con encefalopatía en adultos jóvenes, delirio, conductas maníacas, hepatomegalia y esteatosis hepática.</div>
            <div><b>Signo cardinal:</b> Aversión innata y peculiar a alimentos ricos en hidratos de carbono (dulces, arroz) y preferencia compulsiva por alimentos ricos en grasas y proteínas.</div>
          </div>
        </div>

        <div class="clinical-dis-card">
          <div class="clinical-dis-head">
            <span class="clinical-tag-danger">Gen SLC25A12 · autosómica recesiva</span>
            <h4>Encefalopatía hipomielinizante por déficit de Aralar1 (AGC1)</h4>
          </div>
          <p>
            Aralar1 (AGC1) es la isoforma predominante en neuronas y oligodendrocitos cerebrales. Se encarga de translocar el aspartato necesario para sintetizar N-acetilaspartato (NAA).
          </p>
          <div class="clinical-bullet-list">
            <div><b>Fisiopatología cerebral:</b> Sin Aralar1, el cerebro carece de aspartato citosólico para fabricar NAA, el precursor obligado de los lípidos que estructuran la vaina de mielina.</div>
            <div><b>Manifestaciones:</b> Microcefalia progresiva en los primeros meses de vida, epilepsia precoz refractaria a fármacos y ausencia de adquisición de hitos motores.</div>
            <div><b>Neuroimagen:</b> Hipomielinización cerebral global severa y colapso del pico de NAA en la espectroscopia por resonancia magnética (¹H-MRS).</div>
          </div>
        </div>

        <div class="clinical-dis-card">
          <div class="clinical-dis-head">
            <span class="clinical-tag-warn">Oncología molecular · efecto Warburg</span>
            <h4>Reprogramación tumoral: Sobreexpresión de GPD2 en glioblastoma</h4>
          </div>
          <p>
            Las células cancerosas de alta malignidad enfrentan una enorme producción de NADH por la glucólisis aeróbica desbocada. Para evitar el bloqueo de la GAPDH, muchas líneas tumorales sobreexpresan GPD2.
          </p>
          <div class="clinical-bullet-list">
            <div><b>Ventaja de selección:</b> Al estar anclada a la cara externa de la membrana mitocondrial interna, la GPD2 reoxida el NADH citosólico a velocidad instantánea sin la limitación de transportadores de metabolitos.</div>
            <div><b>Diana terapéutica:</b> Moléculas inhibidoras selectivas de GPD2 (iGPD2) están en investigación preclínica para forzar el agotamiento de NAD⁺ en tumores sólidos y revertir la ventaja proliferativa.</div>
          </div>
        </div>

        <div class="clinical-dis-card">
          <div class="clinical-dis-head">
            <span class="clinical-tag-warn">Acoplamiento electromecánico</span>
            <h4>Sensibilidad al calcio (Ca²⁺) de la GPD2 & hipertermia maligna</h4>
          </div>
          <p>
            A diferencia de la lanzadera de malato-aspartato, la GPD2 mitocondrial posee dominios reguladores EF-hand orientados al espacio intermembrana que reconocen directamente iones de calcio libre.
          </p>
          <div class="clinical-bullet-list">
            <div><b>Sincronización funcional:</b> Durante el ejercicio intenso, el Ca²⁺ liberado por el retículo sarcoplásmico se une a la GPD2 y la hiperactiva inmediatamente, coordinando la glucólisis rápida con la respiración celular.</div>
            <div><b>Relevancia en hipertermia maligna:</b> Mutaciones en el canal RYR1 provocan liberación incontrolada de Ca²⁺, que hiperestimula a la GPD2 y a la glucogenólisis, produciendo un hipermetabolismo fulminante con acidosis y fiebre extrema.</div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="clinical-shuttle-suite">
      <div class="clinical-head">
        <div>
          
          <h3>Dos lanzaderas, dos rendimientos</h3>
          <p>
            El NADH que fabrica la GAPDH en el citosol no atraviesa la membrana mitocondrial interna. Sus electrones entran por la lanzadera malato-aspartato (<b>32 ATP</b> por glucosa, la vía económica) o por la del glicerol-3-fosfato (<b>30 ATP</b>, la vía rápida).
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <button class="clinical-btn-pill ${isMas ? 'active' : ''}" data-sh="mas" title="Seleccionar lanzadera malato-aspartato">
            <span class="clinical-dot ${isMas ? 'emerald' : ''}"></span>
            <b>Malato-Aspartato</b> · 32 ATP
          </button>
          <button class="clinical-btn-pill ${!isMas ? 'active' : ''}" data-sh="g3p" title="Seleccionar lanzadera glicerol-3-fosfato">
            <span class="clinical-dot ${!isMas ? 'amber' : ''}"></span>
            <b>Glicerol-3-P</b> · 30 ATP
          </button>
        </div>
      </div>

      ${navHtml}

      <div class="clinical-tab-content">
        ${bodyHtml}
      </div>
    </div>
  `;
}

function renderBalances(){
  const BALV=BAL.map(balAdj); const b=BALV.find(x=>x.id===balSel)||BALV[0]; const nC=cytNADH(b);
  const sorted=[...BALV].sort((a,c)=>c.aerobicAtpNet-a.aerobicAtpNet);
  const W=760,H=300,ml=46,mr=16,mt=20,mb=46; const iw=W-ml-mr, ih=H-mt-mb;
  let cum=0; const bars=b.steps.map(s=>{const a=cum; cum+=s.atpDelta; return {a,b:cum,s};});
  const lo=Math.min(0,...bars.map(x=>Math.min(x.a,x.b))), hi=Math.max(1,...bars.map(x=>Math.max(x.a,x.b)));
  const span=hi-lo; const st=span>60?20:span>24?10:span>10?5:span>4?2:1;
  const y0=Math.floor(lo/st)*st, y1=Math.ceil(hi/st)*st; const Y=v=>mt+ih-(v-y0)/(y1-y0)*ih; const bw=iw/bars.length;
  const compC={cytosol:"var(--pw-glycolysis)",mitochondria_matrix:"var(--pw-krebs)",mitochondria_membrane:"var(--pw-etc)",mitochondria_intermembrane:"var(--pw-etc)",glycogen_granule:"var(--pw-glycogen)"};
  let ch=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cascada de ATP acumulado por paso">`;
  for(let t=y0;t<=y1;t+=st) ch+=`<line x1="${ml}" x2="${W-mr}" y1="${Y(t)}" y2="${Y(t)}" stroke="${t===0?"var(--hover-line)":"var(--grid)"}"/><text x="${ml-8}" y="${Y(t)+3.5}" text-anchor="end" font-size="10.5" fill="var(--axis-txt)" font-family="JetBrains Mono, monospace">${t}</text>`;
  bars.forEach((x,i)=>{ const top=Y(Math.max(x.a,x.b)), h=Math.max(2,Math.abs(Y(x.a)-Y(x.b))); const c=x.s.atpDelta>=0?(compC[x.s.compartment]||"var(--pw-krebs)"):"var(--pw-gluconeogenesis)"; const cx=ml+i*bw;
    ch+=`<rect x="${cx+bw*.18}" y="${top}" width="${bw*.64}" height="${h}" rx="4" fill="${c}" fill-opacity="${x.s.atpDelta===0?.25:.85}"/>`;
    if(i<bars.length-1) ch+=`<line x1="${cx+bw*.82}" x2="${cx+bw*1.18}" y1="${Y(x.b)}" y2="${Y(x.b)}" stroke="var(--axis-txt)" stroke-dasharray="2 2"/>`;
    ch+=`<text x="${cx+bw/2}" y="${top-6}" text-anchor="middle" font-size="11" font-weight="700" fill="${x.s.atpDelta>0?"var(--pos-txt)":x.s.atpDelta<0?"var(--neg-txt)":"var(--axis-txt)"}" font-family="JetBrains Mono, monospace">${x.s.atpDelta>0?"+":""}${x.s.atpDelta}</text>`;
    ch+=`<text x="${cx+bw/2}" y="${H-mb+18}" text-anchor="middle" font-size="11" fill="var(--fg-dim)" font-family="JetBrains Mono, monospace">${i+1}</text>`; });
  ch+=`<text x="${ml+iw/2}" y="${H-6}" text-anchor="middle" font-size="11" fill="var(--fg-dim)">Paso (ver lista) · barras = ATP ganado o gastado; la escalera marca el acumulado</text></svg>`;
  /* comparativa */
  const CW=760,CH=sorted.length*34+30, cl=250, cr=50; const mn=Math.min(0,...sorted.map(s=>s.aerobicAtpNet)), mx=Math.max(...sorted.map(s=>s.aerobicAtpNet)); const XS=v=>cl+(v-mn)/(mx-mn)*(CW-cl-cr);
  let cmp=`<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="ATP neto por sustrato">`;
  sorted.forEach((s,i)=>{ const y=10+i*34; const x0=XS(0), x1=XS(s.aerobicAtpNet); const sel=s.id===b.id;
    cmp+=`<g class="cmp-row" data-id="${s.id}" style="cursor:pointer"><rect x="0" y="${y-4}" width="${CW}" height="30" fill="${sel?"var(--grid)":"transparent"}" rx="6"/><text x="${cl-10}" y="${y+15}" text-anchor="end" font-size="12" fill="${sel?"var(--fg)":"var(--fg-dim)"}">${esc(s.name.length>38?s.name.slice(0,36)+"…":s.name)}</text>
      <rect x="${Math.min(x0,x1)}" y="${y+3}" width="${Math.max(2,Math.abs(x1-x0))}" height="16" rx="4" fill="${s.aerobicAtpNet<0?"var(--pw-gluconeogenesis)":"var(--pw-glycogen)"}" fill-opacity="${sel?1:.55}"/>
      <text x="${Math.max(x0,x1)+6}" y="${y+15}" font-size="12" font-weight="700" fill="var(--fg)" font-family="JetBrains Mono, monospace">${s.aerobicAtpNet}</text></g>`; });
  cmp+=`<line x1="${XS(0)}" x2="${XS(0)}" y1="4" y2="${CH-16}" stroke="var(--hover-line)"/></svg>`;

  $("#view-balances").innerHTML=`<div class="bal-wrap">
    <div class="bal-head"><div class="eyebrow">Estequiometría energética</div><h2>¿Cuánto ATP da cada combustible?</h2><p>Elige un sustrato para ver, paso a paso, dónde se gasta y dónde se gana ATP. Se usan los valores P/O actuales: 2,5 ATP por NADH y 1,5 por FADH₂.</p></div>
    
    ${renderShuttleComparisonSuite(shuttle, b.id)}

    <div class="bal-grid">
      <div class="sub-list">${BALV.map(s=>`<button class="sub" data-id="${s.id}" aria-pressed="${s.id===b.id}"><b>${esc(s.name)}</b><small>${esc(s.tissue)}</small><span class="n" style="color:${s.aerobicAtpNet<0?"var(--neg-txt)":"var(--warn)"}">${s.aerobicAtpNet>0?"+":""}${s.aerobicAtpNet}</span></button>`).join("")}</div>
      <div class="bal-card">
        <div class="bal-top"><div style="min-width:0;flex:1 1 300px"><div class="eyebrow">${esc(b.tissue)}</div><h3>${esc(b.name)}</h3><p>${esc(b.description)}</p></div>
          <div class="atp-big"><b id="atp-n">0</b><span>ATP netos ${b.aerobicAtpNet<0?"(coste)":"(aerobio)"}</span></div></div>
        <div class="sh-badge ${nC?"on":""}" style="--mc:${shuttle==="mas"?"var(--pw-mas)":"var(--pw-g3p)"}">${nC?`<span class="dot" style="color:var(--mc)"></span><div><b>Lanzadera usada: ${shuttle==="mas"?"malato-aspartato":"glicerol-3-fosfato"}</b><p>${nC} NADH citosólicos × ${shuttle==="mas"?"2,5":"1,5"} = ${String(nC*(shuttle==="mas"?2.5:1.5)).replace(".",",")} ATP. ${shuttle==="mas"?"Típica de hígado, corazón y riñón.":"Típica de músculo esquelético rápido, cerebro y grasa parda."}</p></div><button class="lnk-btn" data-open-sh="${shuttle}">Ver la lanzadera →</button>`:`<span class="dot" style="color:var(--fg-faint)"></span><div><b>Sin lanzadera</b><p>${esc(SHUTTLE_WHY[b.id]||"No interviene: no hay NADH citosólico neto que llevar a la mitocondria.")}</p></div>`}</div>
        <div class="kpis"><div class="kpi"><b>${b.anaerobicAtpNet}</b><span>ATP sin O₂</span></div><div class="kpi"><b>${b.nadhNet}</b><span>NADH</span></div><div class="kpi"><b>${b.nadphNet}</b><span>NADPH</span></div><div class="kpi"><b>${b.co2Net}</b><span>CO₂</span></div><div class="kpi"><b>${b.steps.length}</b><span>pasos</span></div></div>
        <div class="chart-box">${ch}</div>
        <div class="steps">${b.steps.map((s,i)=>`<div class="step"><span class="i">${i+1}</span><div style="min-width:0"><b>${esc(s.step)}</b><p>${esc(s.note)}</p><p class="mono" style="font-size:10.5px;color:var(--fg-faint)">${esc(s.enzyme)} · ${esc(COMP[s.compartment]||s.compartment)}</p></div><div class="d"><div class="${s.atpDelta>0?"pos":s.atpDelta<0?"neg":""}">${s.atpDelta>0?"+":""}${s.atpDelta} ATP</div>${s.nadhDelta?`<div style="color:var(--fg-dim)">${s.nadhDelta>0?"+":""}${s.nadhDelta} NADH</div>`:""}${s.fadh2Delta?`<div style="color:var(--fg-dim)">${s.fadh2Delta>0?"+":""}${s.fadh2Delta} FADH₂</div>`:""}${s.nadphDelta?`<div style="color:var(--pw-pentose)">${s.nadphDelta>0?"+":""}${s.nadphDelta} NADPH</div>`:""}${s.co2Delta?`<div style="color:var(--fg-faint)">${s.co2Delta>0?"+":""}${s.co2Delta} CO₂</div>`:""}</div></div>`).join("")}</div>
      </div>
    </div>
    <div class="bal-card cmp"><h4>Comparativa · ATP neto por mol de sustrato</h4><div class="chart-box">${cmp}</div></div>
  </div>`;
  cssify($("#view-balances"));
  document.querySelectorAll("[data-sh]").forEach(x=>x.onclick=(e)=>{
    e.stopPropagation();
    shuttle=x.dataset.sh;
    const sc=$("#view-balances").scrollTop;
    renderBalances();
    $("#view-balances").scrollTop=sc;
  });
  document.querySelectorAll("[data-card-sh]").forEach(x=>x.onclick=(e)=>{
    if(e.target.closest("button")) return;
    shuttle=x.dataset.cardSh;
    const sc=$("#view-balances").scrollTop;
    renderBalances();
    $("#view-balances").scrollTop=sc;
  });
  document.querySelectorAll("[data-sh-tab]").forEach(x=>x.onclick=()=>{
    shuttleTab=x.dataset.shTab;
    const sc=$("#view-balances").scrollTop;
    renderBalances();
    $("#view-balances").scrollTop=sc;
  });
  document.querySelectorAll("[data-select-glucose]").forEach(x=>x.onclick=()=>{
    balSel="glucose_aerobic";
    const sc=$("#view-balances").scrollTop;
    renderBalances();
    $("#view-balances").scrollTop=sc;
  });
  document.querySelectorAll("[data-open-sh]").forEach(x=>x.onclick=(e)=>{
    e.stopPropagation();
    openModule(x.dataset.openSh);
  });
  document.querySelectorAll(".sub,.cmp-row").forEach(x=>x.addEventListener("click",()=>{
    balSel=x.dataset.id;
    const sc=$("#view-balances").scrollTop;
    renderBalances();
    $("#view-balances").scrollTop=sc;
  }));
  const target=b.aerobicAtpNet, n=$("#atp-n"); if(RM){ n.textContent=target; return; }
  const t0=performance.now(); (function a(t){ const k=Math.min(1,(t-t0)/900), e=1-Math.pow(1-k,3); n.textContent=Math.round(target*e); if(k<1) requestAnimationFrame(a); })(t0);
}

/* ======================= Ciclos y lanzaderas: contenido ======================= */
const NOREG = {hasCovalentRegulation:false};
const clin = (diseaseName, inheritance, mechanism, symptoms, diagnosticBiomarkers, treatmentKeys) => ({diseaseName, inheritance, mechanism, symptoms, diagnosticBiomarkers, treatmentKeys});
const regOf = (effectors, clinical, key=false) => ({isKeyRegulator:key, allostericEffectors:effectors||[], covalent:NOREG, clinical});
const eff = (molecule, effect, physiologicalRole, affinityNote) => ({molecule, effect, physiologicalRole, affinityNote});

/* metabolitos de los módulos (se registran en MET para reutilizar la ficha) */
const MNODES = {
 /* --- Cori / glucosa-alanina --- */
 m_glc:{name:"Glucosa (músculo)",abbreviation:"Glucosa",carbons:6,compartment:"muscle",pw:"glycolysis",description:"Glucosa captada desde la sangre por el músculo que trabaja (GLUT4, reclutado por la contracción y la insulina) o por el eritrocito (GLUT1)."},
 m_pyr:{name:"Piruvato (músculo)",abbreviation:"Piruvato",carbons:3,compartment:"muscle",pw:"glycolysis",description:"Producto de la glucólisis. Cuando la mitocondria no da abasto, o no existe (eritrocito), se reduce a lactato; en ayuno puede transaminarse a alanina."},
 m_lac:{name:"Lactato (músculo)",abbreviation:"Lactato",carbons:3,compartment:"muscle",pw:"glycolysis",description:"Producto final de la glucólisis anaerobia. No es un desecho: es un combustible y un precursor gluconeogénico que el hígado recicla."},
 m_ala:{name:"Alanina (músculo)",abbreviation:"Alanina",carbons:3,compartment:"muscle",pw:"urea_cycle",description:"Se forma al transaminar el piruvato con el grupo amino de los aminoácidos ramificados que el músculo degrada. Lleva a la vez carbono y nitrógeno al hígado."},
 b_glc:{name:"Glucosa plasmática",abbreviation:"Glucosa",carbons:6,compartment:"blood",pw:"transport",description:"Glucemia normal en ayunas: 70–100 mg/dL (3,9–5,6 mM). En el ciclo de Cori es la glucosa que el hígado devuelve a los tejidos glucolíticos."},
 b_lac:{name:"Lactato plasmático",abbreviation:"Lactato",carbons:3,compartment:"blood",pw:"transport",description:"Normal en reposo: 0,5–2 mmol/L. Durante un esfuerzo máximo puede superar 15 mmol/L y se aclara en minutos si el hígado funciona."},
 b_ala:{name:"Alanina plasmática",abbreviation:"Alanina",carbons:3,compartment:"blood",pw:"urea_cycle",description:"La alanina y la glutamina son los principales transportadores de nitrógeno desde el músculo en ayuno."},
 h_lac:{name:"Lactato (hepatocito)",abbreviation:"Lactato",carbons:3,compartment:"liver",pw:"gluconeogenesis",description:"Entra en el hepatocito por MCT1/MCT2 y se oxida a piruvato. El hígado es el principal órgano que aclara el lactato circulante; el riñón también contribuye."},
 h_pyr:{name:"Piruvato (hepatocito)",abbreviation:"Piruvato",carbons:3,compartment:"liver",pw:"gluconeogenesis",description:"Punto de entrada de la gluconeogénesis: la piruvato carboxilasa mitocondrial lo convierte en oxalacetato."},
 h_glc:{name:"Glucosa (hepatocito)",abbreviation:"Glucosa",carbons:6,compartment:"liver",pw:"gluconeogenesis",description:"Glucosa nueva liberada por la glucosa-6-fosfatasa, que solo expresan hígado, riñón e intestino."},
 h_ala:{name:"Alanina (hepatocito)",abbreviation:"Alanina",carbons:3,compartment:"liver",pw:"urea_cycle",description:"Principal sustrato gluconeogénico de origen proteico en el ayuno."},
 h_nh4:{name:"Amonio hacia el ciclo de la urea",abbreviation:"NH₄⁺",carbons:0,compartment:"liver",pw:"urea_cycle",description:"El grupo amino de la alanina pasa al glutamato y la glutamato deshidrogenasa lo libera como NH₄⁺ en la matriz mitocondrial, donde lo capta la CPS1."},

 /* --- Ciclo de la urea --- */
 u_glu:{name:"L-Glutamato (matriz)",abbreviation:"Glutamato",carbons:5,compartment:"mitochondria_matrix",pw:"urea_cycle",description:"Colector central de grupos amino: las transaminasas los concentran en el glutamato, que los cede como NH₄⁺ (GDH) o como aspartato (AST)."},
 u_nag:{name:"N-Acetilglutamato",abbreviation:"NAG",carbons:7,compartment:"mitochondria_matrix",pw:"urea_cycle",description:"Activador alostérico obligado de la CPS1. Su síntesis (NAGS) aumenta con la arginina y tras una comida rica en proteínas, de modo que el ciclo se acelera cuando llega más nitrógeno."},
 u_nh4:{name:"Ion amonio",abbreviation:"NH₄⁺",carbons:0,compartment:"mitochondria_matrix",pw:"urea_cycle",description:"Primer nitrógeno de la urea. Muy tóxico para el cerebro: por encima de ~100 µmol/L en el adulto aparece encefalopatía."},
 u_cp:{name:"Carbamoil fosfato",abbreviation:"Carbamoil-P",carbons:1,compartment:"mitochondria_matrix",pw:"urea_cycle",description:"Compuesto de alta energía formado por la CPS1. Si la OTC falla, se acumula, sale al citosol y entra en la síntesis de pirimidinas: por eso sube el ácido orótico en orina."},
 u_orn_m:{name:"L-Ornitina (matriz)",abbreviation:"Ornitina",carbons:5,compartment:"mitochondria_matrix",pw:"urea_cycle",description:"Aminoácido no proteico que actúa como transportador del ciclo: se regenera en cada vuelta."},
 u_cit_m:{name:"L-Citrulina (matriz)",abbreviation:"Citrulina",carbons:6,compartment:"mitochondria_matrix",pw:"urea_cycle",description:"Producto de la OTC. Sale al citosol por el transportador ORNT1."},
 u_cit_c:{name:"L-Citrulina (citosol)",abbreviation:"Citrulina",carbons:6,compartment:"cytosol",pw:"urea_cycle",description:"Su concentración plasmática orienta el diagnóstico: baja en déficits de NAGS, CPS1 y OTC; muy alta en la citrulinemia tipo I."},
 u_asp:{name:"L-Aspartato (citosol)",abbreviation:"Aspartato",carbons:4,compartment:"cytosol",pw:"urea_cycle",description:"Aporta el segundo nitrógeno de la urea. Procede de la transaminación del oxalacetato y, en el hígado, sale de la mitocondria por la citrina (AGC2)."},
 u_asa:{name:"Argininosuccinato",abbreviation:"Argininosuccinato",carbons:10,compartment:"cytosol",pw:"urea_cycle",description:"Une los esqueletos de citrulina y aspartato. Se acumula en la aciduria argininosuccínica."},
 u_arg:{name:"L-Arginina",abbreviation:"Arginina",carbons:6,compartment:"cytosol",pw:"urea_cycle",description:"Precursora inmediata de la urea, y también del óxido nítrico y de la creatina. Se vuelve esencial cuando falla el ciclo, por eso se suplementa en muchos de sus déficits."},
 u_orn_c:{name:"L-Ornitina (citosol)",abbreviation:"Ornitina",carbons:5,compartment:"cytosol",pw:"urea_cycle",description:"Regenerada por la arginasa; vuelve a la matriz por ORNT1."},
 u_urea:{name:"Urea",abbreviation:"Urea",carbons:1,compartment:"cytosol",pw:"urea_cycle",description:"Molécula neutra, hidrosoluble y no tóxica que lleva 2 nitrógenos. Pasa a la sangre (BUN 7–20 mg/dL) y se elimina por el riñón: unos 25–30 g al día."},
 u_fum:{name:"Fumarato (citosol)",abbreviation:"Fumarato",carbons:4,compartment:"cytosol",pw:"urea_cycle",description:"Subproducto de la ASL. Enlaza el ciclo de la urea con el de Krebs: se rehidrata a malato y regenera aspartato."},
 u_mal:{name:"Malato (citosol)",abbreviation:"Malato",carbons:4,compartment:"cytosol",pw:"urea_cycle",description:"Producto de la fumarasa citosólica."},
 u_oaa:{name:"Oxalacetato (citosol)",abbreviation:"Oxalacetato",carbons:4,compartment:"cytosol",pw:"urea_cycle",description:"Al transaminarse con glutamato regenera el aspartato que el ciclo necesita."},


 /* --- Cuerpos cetónicos --- */
 k_fa:{name:"Acil-CoA (ácidos grasos)",abbreviation:"Acil-CoA",carbons:16,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Ácidos grasos liberados por el tejido adiposo en ayuno y activados en el hepatocito. Sin malonil-CoA, la CPT-1 los deja entrar en la mitocondria."},
 k_acoa:{name:"Acetil-CoA (hepatocito)",abbreviation:"Acetil-CoA",carbons:2,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Se acumula en ayuno porque el oxalacetato se desvía a la gluconeogénesis y el ciclo de Krebs no puede absorber todo el acetil-CoA de la β-oxidación."},
 k_aacoa:{name:"Acetoacetil-CoA (hepatocito)",abbreviation:"Acetoacetil-CoA",carbons:4,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Condensación de dos acetil-CoA por la tiolasa."},
 k_hmg:{name:"3-Hidroxi-3-metilglutaril-CoA",abbreviation:"HMG-CoA",carbons:6,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Intermediario compartido con la síntesis de colesterol, pero en otro compartimento: el HMG-CoA cetogénico es mitocondrial; el del colesterol es citosólico (HMG-CoA reductasa)."},
 k_acac:{name:"Acetoacetato (hepatocito)",abbreviation:"Acetoacetato",carbons:4,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Primer cuerpo cetónico. Es un β-cetoácido inestable que se descarboxila lentamente a acetona."},
 k_bhb:{name:"β-Hidroxibutirato (hepatocito)",abbreviation:"β-Hidroxibutirato",carbons:4,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Cuerpo cetónico más abundante en sangre. Estrictamente es un hidroxiácido, no una cetona. Su proporción respecto al acetoacetato refleja el estado NADH/NAD⁺ de la mitocondria hepática."},
 k_acetone:{name:"Acetona",abbreviation:"Acetona",carbons:3,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Producto de la descarboxilación espontánea del acetoacetato. Es volátil, no se aprovecha como combustible y se elimina por los pulmones: da el aliento afrutado de la cetoacidosis."},
 kb_acac:{name:"Acetoacetato plasmático",abbreviation:"Acetoacetato",carbons:4,compartment:"blood",pw:"transport",description:"Lo detectan las tiras reactivas de orina con nitroprusiato."},
 kb_bhb:{name:"β-Hidroxibutirato plasmático",abbreviation:"β-Hidroxibutirato",carbons:4,compartment:"blood",pw:"transport",description:"Es el que se mide en sangre capilar. Normal < 0,5 mmol/L; en ayuno prolongado puede llegar a 5–7 mmol/L y en la cetoacidosis diabética supera los 3 mmol/L con acidosis."},
 kt_bhb:{name:"β-Hidroxibutirato (tejido)",abbreviation:"β-Hidroxibutirato",carbons:4,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Captado por MCT1. En el cerebro el transporte a través de la barrera hematoencefálica aumenta durante el ayuno."},
 kt_acac:{name:"Acetoacetato (tejido)",abbreviation:"Acetoacetato",carbons:4,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Sustrato de la SCOT."},
 kt_aacoa:{name:"Acetoacetil-CoA (tejido)",abbreviation:"Acetoacetil-CoA",carbons:4,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Forma activada del acetoacetato, lista para la tiolasa."},
 kt_acoa:{name:"Acetil-CoA (tejido)",abbreviation:"Acetil-CoA",carbons:2,compartment:"mitochondria_matrix",pw:"krebs_cycle",description:"Dos por cada acetoacetato. Entran en el ciclo de Krebs del tejido que usa los cuerpos cetónicos."},
 kt_krebs:{name:"Ciclo de Krebs del tejido periférico",abbreviation:"Ciclo de Krebs",carbons:0,compartment:"mitochondria_matrix",pw:"krebs_cycle",description:"Oxidación completa hasta CO₂: cada acetil-CoA rinde ≈10 ATP."},
 /* --- Lanzadera malato-aspartato --- */
 ma_glu_c:{name:"Glutamato (citosol)",abbreviation:"Glutamato",carbons:5,compartment:"cytosol",pw:"mas_shuttle",description:"Lo forma la AST1 y entra en la matriz por el AGC junto con un H⁺."},
 ma_akg_c:{name:"α-Cetoglutarato (citosol)",abbreviation:"α-KG",carbons:5,compartment:"cytosol",pw:"mas_shuttle",description:"Llega desde la matriz por el OGC a cambio de malato y acepta el grupo amino del aspartato."},
 ma_asp_c:{name:"Aspartato (citosol)",abbreviation:"Aspartato",carbons:4,compartment:"cytosol",pw:"mas_shuttle",description:"Sale de la matriz por el AGC. La AST1 lo transamina de vuelta a oxalacetato."},
 ma_oaa_c:{name:"Oxalacetato (citosol)",abbreviation:"Oxalacetato",carbons:4,compartment:"cytosol",pw:"mas_shuttle",description:"Aceptor de los electrones del NADH citosólico."},
 ma_mal_c:{name:"Malato (citosol)",abbreviation:"Malato",carbons:4,compartment:"cytosol",pw:"mas_shuttle",description:"Es la forma en que viajan los equivalentes reductores: un NADH citosólico convertido en una molécula que sí tiene transportador."},
 ma_mal_m:{name:"Malato (matriz)",abbreviation:"Malato",carbons:4,compartment:"mitochondria_matrix",pw:"mas_shuttle",description:"Dentro de la matriz la MDH2 lo oxida y libera de nuevo el NADH."},
 ma_oaa_m:{name:"Oxalacetato (matriz)",abbreviation:"Oxalacetato",carbons:4,compartment:"mitochondria_matrix",pw:"mas_shuttle",description:"No tiene transportador propio en la membrana interna: para salir debe convertirse en aspartato."},
 ma_asp_m:{name:"Aspartato (matriz)",abbreviation:"Aspartato",carbons:4,compartment:"mitochondria_matrix",pw:"mas_shuttle",description:"Producto de la AST2; sale al citosol por el AGC."},
 ma_glu_m:{name:"Glutamato (matriz)",abbreviation:"Glutamato",carbons:5,compartment:"mitochondria_matrix",pw:"mas_shuttle",description:"Donador del grupo amino para la AST2."},
 ma_akg_m:{name:"α-Cetoglutarato (matriz)",abbreviation:"α-KG",carbons:5,compartment:"mitochondria_matrix",pw:"mas_shuttle",description:"Sale al citosol por el OGC a cambio de malato."},

 /* --- Lanzadera del glicerol-3-P --- */
 g_dhap:{name:"Dihidroxiacetona fosfato",abbreviation:"DHAP",carbons:3,compartment:"cytosol",pw:"g3p_shuttle",description:"Triosa fosfato de la glucólisis que actúa como aceptor de los electrones del NADH citosólico."},
 g_g3p:{name:"Glicerol-3-fosfato",abbreviation:"Glicerol-3-P",carbons:3,compartment:"cytosol",pw:"g3p_shuttle",description:"Transporta los electrones hasta la cara externa de la membrana mitocondrial interna. También es el esqueleto de los triacilgliceroles."},
 g_gpd2:{name:"Glicerol-3-P deshidrogenasa mitocondrial",abbreviation:"GPD2",carbons:0,compartment:"mitochondria_membrane",pw:"g3p_shuttle",description:"Flavoproteína anclada a la cara externa de la membrana interna (mira al espacio intermembrana). Su FAD acepta los electrones y los pasa directamente al CoQ."},
 g_c1:{name:"Complejo I",abbreviation:"Complejo I",carbons:0,compartment:"mitochondria_membrane",pw:"electron_transport",description:"Con esta lanzadera los electrones del NADH citosólico no pasan por el complejo I, y se pierden los 4 H⁺ que bombearía."},
 g_coq:{name:"Coenzima Q (ubiquinona)",abbreviation:"CoQ",carbons:0,compartment:"mitochondria_membrane",pw:"electron_transport",description:"Transportador liposoluble de electrones; recoge los de los complejos I y II, la GPD2 y la ETF de la β-oxidación."},
 g_c3:{name:"Complejo III",abbreviation:"Complejo III",carbons:0,compartment:"mitochondria_membrane",pw:"electron_transport",description:"Citocromo bc1: ciclo Q, bombea 4 H⁺ por cada par de electrones."},
 g_cytc:{name:"Citocromo c",abbreviation:"Cit c",carbons:0,compartment:"mitochondria_intermembrane",pw:"electron_transport",description:"Proteína hidrosoluble del espacio intermembrana que lleva un electrón del complejo III al IV."},
 g_c4:{name:"Complejo IV",abbreviation:"Complejo IV",carbons:0,compartment:"mitochondria_membrane",pw:"electron_transport",description:"Citocromo c oxidasa: reduce el O₂ a H₂O y bombea 2 H⁺ por par de electrones."},

 /* --- β-Oxidación y Síntesis de Palmitato --- */
 lp_cit:{name:"Citrato citosólico",abbreviation:"Citrato",carbons:6,compartment:"cytosol",pw:"lipid_metabolism",description:"Citrato exportado desde la mitocondria; sustrato de ACLY para generar acetil-CoA citosólica."},
 lp_acoa_c:{name:"Acetil-CoA citosólica",abbreviation:"Acetil-CoA",carbons:2,compartment:"cytosol",pw:"lipid_metabolism",description:"Bloque de 2 carbonos inicial para la lipogénesis de novo."},
 lp_mal:{name:"Malonil-CoA",abbreviation:"Malonil-CoA",carbons:3,compartment:"cytosol",pw:"lipid_metabolism",description:"Donante de unidades de elongación para FASN y freno alostérico potente sobre CPT-1."},
 lp_palm:{name:"Palmitato (16:0)",abbreviation:"Palmitato",carbons:16,compartment:"cytosol",pw:"lipid_metabolism",description:"Ácido graso saturado de 16 carbonos producto final de la FASN."},
 lp_tag:{name:"Triacilgliceroles (depósito / VLDL)",abbreviation:"TAG / Depósito",carbons:16,compartment:"cytosol",pw:"lipid_metabolism",description:"Destino fisiológico del palmitato sintetizado en estado posprandial: esterificación en triacilgliceroles para almacenamiento en gotas lipídicas (adipocito) o secreción hepática en VLDL. No entra a la mitocondria en ese momento."},
 lp_adipose_fa:{name:"Ácidos grasos libres (lipólisis adiposa)",abbreviation:"Ácidos Grasos (lipólisis)",carbons:16,compartment:"blood",pw:"lipid_metabolism",description:"En ayuno o ejercicio, el glucagón y la adrenalina activan la lipólisis en el tejido adiposo (ATGL / HSL). Los ácidos grasos libres viajan unidos a albúmina hacia el hepatocito y miocito para β-oxidación mitocondrial."},
 lp_ac_c:{name:"Palmitoil-CoA citosólico",abbreviation:"Acil-CoA (cit)",carbons:16,compartment:"cytosol",pw:"lipid_metabolism",description:"Forma activada por la ACSL en la membrana mitocondrial externa."},
 lp_cpt1:{name:"Palmitoil-carnitina (OMM)",abbreviation:"Acil-Carnitina",carbons:16,compartment:"mitochondria_membrane",pw:"lipid_metabolism",description:"Éster de carnitina formado por CPT-1 capaz de atravesar la membrana mitocondrial."},
 lp_cact:{name:"Antiporte CACT",abbreviation:"CACT (IMM)",carbons:16,compartment:"mitochondria_membrane",pw:"lipid_metabolism",description:"Translocador antiporte que introduce la acilcarnitina a la matriz a cambio de carnitina libre."},
 lp_cpt2:{name:"Palmitoil-CoA regenerado (matriz)",abbreviation:"CPT-2 (mat)",carbons:16,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"La CPT-2 transfiere el grupo acilo de la carnitina a la CoA intramitocondrial."},
 lp_ac_m:{name:"Palmitoil-CoA mitocondrial",abbreviation:"Acil-CoA (mat)",carbons:16,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Sustrato listo para entrar en la espiral de los 4 pasos de la β-oxidación."},
 lp_mcad:{name:"trans-Δ²-Enoil-CoA",abbreviation:"Enoil-CoA",carbons:16,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Intermediario deshidrogenado por MCAD/VLCAD con reducción de FAD a FADH₂ (a CoQ)."},
 lp_enoyl:{name:"L-3-Hidroxiacil-CoA",abbreviation:"3-HO-Acil-CoA",carbons:16,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Intermediario hidratado; sufre la 2ª deshidrogenación rindiendo NADH."},
 lp_thiol:{name:"β-Cetoacil-CoA",abbreviation:"Cetoacil-CoA",carbons:16,compartment:"mitochondria_matrix",pw:"lipid_metabolism",description:"Sustrato de la tiolasa para escisión tiolítica dependiente de CoA-SH."},
 lp_acoa_m:{name:"Acetil-CoA mitocondrial liberada",abbreviation:"Acetil-CoA",carbons:2,compartment:"mitochondria_matrix",pw:"krebs_cycle",description:"8 moléculas de acetil-CoA generadas por cada palmitato (16C) para el Ciclo de Krebs o Cetogénesis."},
 lp_krebs:{name:"Ciclo de Krebs & cuerpos cetónicos",abbreviation:"Krebs / Cetonas",carbons:0,compartment:"mitochondria_matrix",pw:"krebs_cycle",description:"Destinos finales para la producción de ATP o exportación de cetonas al encéfalo."}
};

const MRX_LIST = [
 /* ---------- Cori ---------- */
 {id:"c_glut4",module:"cori",name:"Captación de glucosa por el músculo",enzymeName:"Transportadores GLUT4 (músculo) y GLUT1 (eritrocito)",enzymeAbbreviation:"GLUT4 / GLUT1",ecNumber:"TC 2.A.1.1",fromNodeId:"b_glc",toNodeId:"m_glc",reversible:true,pathway:"transport",compartment:"muscle",
  pathWayNotes:"La contracción muscular, vía AMPK y Ca²⁺, transloca GLUT4 a la membrana aunque no haya insulina. Por eso el ejercicio baja la glucemia en el diabético."},
 {id:"c_glycolysis",module:"cori",name:"Glucólisis anaerobia",enzymeName:"Glucólisis (10 enzimas citosólicas)",enzymeAbbreviation:"Glucólisis",fromNodeId:"m_glc",toNodeId:"m_pyr",reversible:false,pathway:"glycolysis",compartment:"muscle",
  cofactorsConsumed:["2 ADP","2 NAD⁺","2 Pi"],cofactorsProduced:["2 ATP netos","2 NADH"],
  pathWayNotes:"Rinde solo 2 ATP por glucosa, pero mucho más deprisa que la fosforilación oxidativa. Es la fuente de energía del sprint, del músculo blanco y del eritrocito."},
 {id:"c_ldh_m",module:"cori",name:"Reducción de piruvato a lactato",enzymeName:"Lactato deshidrogenasa muscular (LDH-5, subunidades M/LDHA)",enzymeAbbreviation:"LDH",ecNumber:"EC 1.1.1.27",fromNodeId:"m_pyr",toNodeId:"m_lac",reversible:true,deltaG0:-25.1,pathway:"glycolysis",compartment:"muscle",
  cofactorsConsumed:["NADH","H⁺"],cofactorsProduced:["NAD⁺"],
  pathWayNotes:"Regenera el NAD⁺ que la GAPDH necesita. Sin este paso la glucólisis anaerobia se detendría en segundos.",
  regulation:regOf([],clin("Glucogenosis tipo XI (déficit de LDHA)","Autosómica recesiva (gen LDHA)","Sin LDH-M el músculo no puede regenerar NAD⁺ en anaerobiosis y la glucólisis se frena durante el esfuerzo intenso.",["Intolerancia al ejercicio y calambres","Mioglobinuria tras esfuerzos","Lesiones cutáneas eritematosas descamativas"],["LDH sérica anormalmente baja con CK elevada","Prueba de isquemia del antebrazo: el lactato no sube y el piruvato sí"],["Evitar el ejercicio anaerobio intenso","Hidratación en las crisis de rabdomiólisis"]))},
 {id:"c_mct4",module:"cori",name:"Salida del lactato del músculo",enzymeName:"Transportador de monocarboxilatos 4 (MCT4, SLC16A3)",enzymeAbbreviation:"MCT4",fromNodeId:"m_lac",toNodeId:"b_lac",reversible:true,pathway:"transport",compartment:"muscle",
  pathWayNotes:"Cotransporta lactato y H⁺, así que también saca la acidez del músculo. Se induce por hipoxia (HIF-1α) y es abundante en las fibras rápidas y en tumores glucolíticos."},
 {id:"c_mct1",module:"cori",name:"Entrada del lactato en el hepatocito",enzymeName:"Transportadores de monocarboxilatos 1 y 2 (MCT1/MCT2)",enzymeAbbreviation:"MCT1",fromNodeId:"b_lac",toNodeId:"h_lac",reversible:true,pathway:"transport",compartment:"liver",
  pathWayNotes:"El corazón y las fibras oxidativas también captan lactato por MCT1 y lo oxidan directamente: es la lanzadera de lactato célula a célula."},
 {id:"c_ldh_h",module:"cori",name:"Oxidación de lactato a piruvato",enzymeName:"Lactato deshidrogenasa hepática",enzymeAbbreviation:"LDH",ecNumber:"EC 1.1.1.27",fromNodeId:"h_lac",toNodeId:"h_pyr",reversible:true,deltaG0:25.1,pathway:"gluconeogenesis",compartment:"liver",
  cofactorsConsumed:["NAD⁺"],cofactorsProduced:["NADH","H⁺"],
  pathWayNotes:"El sentido depende de la relación NADH/NAD⁺. El etanol eleva el NADH hepático, invierte este paso y frena la gluconeogénesis: por eso el alcohol produce hipoglucemia y acidosis láctica."},
 {id:"c_gng",module:"cori",name:"Gluconeogénesis hepática",enzymeName:"Gluconeogénesis: PC, PEPCK, FBPasa-1 y G-6-Pasa",enzymeAbbreviation:"Gluconeogénesis",fromNodeId:"h_pyr",toNodeId:"h_glc",reversible:false,pathway:"gluconeogenesis",compartment:"liver",
  cofactorsConsumed:["4 ATP","2 GTP","2 NADH"],cofactorsProduced:["1 glucosa por 2 lactatos"],
  pathWayNotes:"Cuesta 6 enlaces de alta energía por glucosa. El hígado los obtiene de la β-oxidación, así que el ciclo de Cori traslada parte del gasto del músculo a la grasa.",
  regulation:regOf([eff("Acetil-CoA","activator","Activa alostéricamente la piruvato carboxilasa: si sobra acetil-CoA (β-oxidación activa), el piruvato se desvía a glucosa."),eff("Fructosa-2,6-bisfosfato","inhibitor","Inhibe la FBPasa-1. El glucagón la hace desaparecer y libera la gluconeogénesis."),eff("AMP","inhibitor","Inhibe la FBPasa-1 cuando falta energía.")],
   clin("Acidosis láctica tipo B (sin hipoxia)","Adquirida o congénita","El lactato se acumula porque el hígado no lo convierte en glucosa: insuficiencia hepática, metformina a dosis tóxicas o con insuficiencia renal, intoxicación etílica (exceso de NADH) y errores congénitos de la gluconeogénesis (G-6-Pasa, FBPasa-1, piruvato carboxilasa).",["Taquipnea (respiración de Kussmaul)","Náuseas, dolor abdominal","Hipotensión y alteración de la conciencia en casos graves"],["Lactato > 4–5 mmol/L","pH < 7,35 con anión GAP elevado","Glucemia baja si la causa es hepática o congénita"],["Tratar la causa y suspender la metformina","Hemodiálisis en la intoxicación grave","Tiamina si hay sospecha de déficit"]),true)},
 {id:"c_glut2",module:"cori",name:"Salida de la glucosa nueva a la sangre",enzymeName:"GLUT2 hepático",enzymeAbbreviation:"GLUT2",fromNodeId:"h_glc",toNodeId:"b_glc",reversible:true,pathway:"transport",compartment:"liver",
  pathWayNotes:"Cierra el ciclo: la glucosa vuelve al músculo. Por cada vuelta el músculo gana 2 ATP y el hígado gasta 6."},
 /* glucosa-alanina */
 {id:"a_alt_m",module:"cori",name:"Transaminación del piruvato a alanina",enzymeName:"Alanina aminotransferasa muscular (ALT / GPT)",enzymeAbbreviation:"ALT",ecNumber:"EC 2.6.1.2",fromNodeId:"m_pyr",toNodeId:"m_ala",reversible:true,pathway:"urea_cycle",compartment:"muscle",
  cofactorsConsumed:["Glutamato"],cofactorsProduced:["α-Cetoglutarato"],
  pathWayNotes:"Necesita piridoxal fosfato (vitamina B6). El glutamato procede de los aminoácidos ramificados (leucina, isoleucina, valina) que el músculo oxida en ayuno."},
 {id:"a_out",module:"cori",name:"Alanina a la sangre",enzymeName:"Transportadores de aminoácidos neutros",enzymeAbbreviation:"Transporte",fromNodeId:"m_ala",toNodeId:"b_ala",reversible:true,pathway:"transport",compartment:"blood",
  pathWayNotes:"El músculo exporta alanina en proporción mucho mayor de la que contienen sus proteínas: la fabrica a propósito para sacar nitrógeno."},
 {id:"a_in",module:"cori",name:"Alanina al hepatocito",enzymeName:"Transportadores de aminoácidos neutros (sistema A)",enzymeAbbreviation:"Transporte",fromNodeId:"b_ala",toNodeId:"h_ala",reversible:true,pathway:"transport",compartment:"liver",
  pathWayNotes:"El glucagón y el cortisol aumentan la captación hepática de alanina en ayuno."},
 {id:"a_alt_h",module:"cori",name:"Transaminación de la alanina a piruvato",enzymeName:"Alanina aminotransferasa hepática (ALT / GPT)",enzymeAbbreviation:"ALT",ecNumber:"EC 2.6.1.2",fromNodeId:"h_ala",toNodeId:"h_pyr",reversible:true,pathway:"urea_cycle",compartment:"liver",
  cofactorsConsumed:["α-Cetoglutarato"],cofactorsProduced:["Glutamato"],
  pathWayNotes:"Devuelve el esqueleto de carbono a la gluconeogénesis y entrega el grupo amino al glutamato.",
  regulation:regOf([],clin("Hipertransaminasemia (lesión hepatocelular)","Adquirida","La ALT es una enzima citosólica casi exclusiva del hepatocito. Cuando la célula se rompe pasa a la sangre, por eso es el marcador más específico de daño hepático.",["Depende de la causa: hepatitis víricas, esteatohepatitis metabólica, fármacos (paracetamol), isquemia hepática"],["ALT > AST en hepatitis vírica y en esteatosis","AST/ALT > 2 sugiere hepatopatía alcohólica","Elevaciones > 1000 U/L: hepatitis aguda, tóxica o isquémica"],["Tratar la causa","Seguimiento seriado de transaminasas"]))},
 {id:"a_n",module:"cori",name:"Liberación del nitrógeno hacia la urea",enzymeName:"Glutamato deshidrogenasa (GDH)",enzymeAbbreviation:"GDH",ecNumber:"EC 1.4.1.3",fromNodeId:"h_ala",toNodeId:"h_nh4",reversible:true,pathway:"urea_cycle",compartment:"liver",
  pathWayNotes:"El glutamato formado por la ALT entra en la mitocondria y la GDH libera el NH₄⁺ junto a la CPS1, que lo incorpora al ciclo de la urea."},

 /* ---------- Ciclo de la urea ---------- */
 {id:"u_gdh",module:"urea",name:"Desaminación oxidativa del glutamato",enzymeName:"Glutamato deshidrogenasa (GDH, GLUD1)",enzymeAbbreviation:"GDH",ecNumber:"EC 1.4.1.3",fromNodeId:"u_glu",toNodeId:"u_nh4",reversible:true,pathway:"urea_cycle",compartment:"mitochondria_matrix",
  cofactorsConsumed:["NAD(P)⁺","H₂O"],cofactorsProduced:["NAD(P)H","α-Cetoglutarato"],
  pathWayNotes:"Libera el amonio justo donde lo necesita la CPS1. Es una de las pocas enzimas que usa indistintamente NAD⁺ y NADP⁺.",
  regulation:regOf([eff("ADP / GDP","activator","Señal de baja carga energética: acelera la oxidación de aminoácidos."),eff("Leucina","activator","Activador alostérico, especialmente relevante en la célula β pancreática."),eff("GTP / ATP","inhibitor","Freno fisiológico cuando sobra energía.")],
   clin("Síndrome de hiperinsulinismo-hiperamonemia (HI/HA)","Autosómica dominante (mutaciones activadoras de GLUD1, a menudo de novo)","La GDH pierde la inhibición por GTP. En la célula β genera α-KG y ATP en exceso y dispara la insulina; en el hígado libera amonio sin control.",["Hipoglucemias recurrentes, sobre todo tras comidas ricas en proteínas (sensibles a leucina)","Hiperamonemia leve y persistente, casi siempre asintomática","Epilepsia"],["Amonio 60–150 µmol/L estable","Insulina inapropiadamente detectable durante la hipoglucemia"],["Diazóxido","Limitar la carga de leucina en la dieta"]))},
 {id:"u_nags",module:"urea",name:"Síntesis de N-acetilglutamato",enzymeName:"N-Acetilglutamato sintasa (NAGS)",enzymeAbbreviation:"NAGS",ecNumber:"EC 2.3.1.1",fromNodeId:"u_glu",toNodeId:"u_nag",reversible:false,pathway:"urea_cycle",compartment:"mitochondria_matrix",
  cofactorsConsumed:["Acetil-CoA"],cofactorsProduced:["CoA"],
  pathWayNotes:"Ajusta la velocidad del ciclo a la carga de proteínas de la dieta.",
  regulation:regOf([eff("L-Arginina","activator","La arginina señala abundancia de aminoácidos y estimula la NAGS: más NAG, más actividad de CPS1.")],
   clin("Déficit de N-acetilglutamato sintasa","Autosómica recesiva (gen NAGS)","Sin NAG la CPS1 está prácticamente inactiva y el amonio no entra en el ciclo.",["Hiperamonemia neonatal o de inicio tardío","Vómitos, letargia, coma"],["Amonio y glutamina elevados","Citrulina baja","Ácido orótico urinario normal"],["Ácido carglúmico (análogo del NAG): corrige el defecto","Dieta controlada en proteínas durante las crisis"]),true)},
 {id:"u_cps1",module:"urea",name:"Síntesis de carbamoil fosfato",enzymeName:"Carbamoil fosfato sintetasa I (CPS1)",enzymeAbbreviation:"CPS1",ecNumber:"EC 6.3.4.16",fromNodeId:"u_nh4",toNodeId:"u_cp",reversible:false,pathway:"urea_cycle",compartment:"mitochondria_matrix",
  cofactorsConsumed:["2 ATP","HCO₃⁻","NH₄⁺"],cofactorsProduced:["2 ADP","Pi"],
  pathWayNotes:"Paso limitante del ciclo. No confundir con la CPS2 citosólica, que usa glutamina y fabrica pirimidinas.",
  regulation:regOf([eff("N-Acetilglutamato","activator","Activador alostérico obligado: sin él la CPS1 no funciona.","Requisito absoluto")],
   clin("Déficit de carbamoil fosfato sintetasa I","Autosómica recesiva (gen CPS1)","Bloquea la entrada del amonio en el ciclo: es la forma más grave de hiperamonemia neonatal.",["Rechazo de tomas, vómitos y letargia en los primeros días","Hiperventilación con alcalosis respiratoria","Convulsiones y coma"],["Amonio > 150 µmol/L","Glutamina elevada, citrulina baja","Ácido orótico bajo o normal (lo distingue del déficit de OTC)"],["Retirar proteínas y aportar calorías (glucosa y lípidos)","Benzoato sódico y fenilbutirato sódico","Arginina o citrulina","Hemodiálisis si el amonio es muy alto","Trasplante hepático"]),true)},
 {id:"u_otc",module:"urea",name:"Formación de citrulina",enzymeName:"Ornitina transcarbamilasa (OTC)",enzymeAbbreviation:"OTC",ecNumber:"EC 2.1.3.3",fromNodeId:"u_cp",toNodeId:"u_cit_m",reversible:false,pathway:"urea_cycle",compartment:"mitochondria_matrix",
  cofactorsConsumed:["Ornitina"],cofactorsProduced:["Pi"],
  pathWayNotes:"Une el carbamoil fosfato a la ornitina dentro de la matriz.",
  regulation:regOf([],clin("Déficit de ornitina transcarbamilasa (OTC)","Ligado al cromosoma X: el trastorno del ciclo de la urea más frecuente","El carbamoil fosfato acumulado sale al citosol y alimenta la síntesis de pirimidinas (CAD): se produce un exceso de ácido orótico.",["Varones: coma hiperamonémico neonatal","Mujeres portadoras: desde asintomáticas a crisis tras ayuno, cirugía, parto o dietas hiperproteicas (inactivación del X)","Aversión a las proteínas, vómitos cíclicos"],["Amonio elevado","Citrulina baja","Ácido orótico urinario muy elevado","Prueba de sobrecarga con alopurinol en portadoras"],["Dieta hipoproteica","Benzoato y fenilbutirato sódicos","Suplementos de citrulina","Trasplante hepático en formas graves"]))},
 {id:"u_ornt1",module:"urea",name:"Intercambio citrulina / ornitina",enzymeName:"Transportador de ornitina ORNT1 (SLC25A15)",enzymeAbbreviation:"ORNT1",fromNodeId:"u_cit_m",toNodeId:"u_cit_c",reversible:true,pathway:"transport",compartment:"mitochondria_membrane",
  pathWayNotes:"Antiporte de la membrana mitocondrial interna: saca citrulina y devuelve ornitina a la matriz.",
  regulation:regOf([],clin("Síndrome HHH (hiperornitinemia-hiperamonemia-homocitrulinuria)","Autosómica recesiva (gen SLC25A15)","La ornitina no vuelve a la matriz: se acumula en el citosol y el carbamoil fosfato reacciona con lisina formando homocitrulina.",["Hiperamonemia tras las comidas","Aversión a las proteínas","Paraparesia espástica progresiva y retraso del desarrollo"],["Ornitina plasmática elevada","Homocitrulina en orina","Amonio elevado"],["Dieta hipoproteica","Citrulina o arginina","Benzoato y fenilbutirato sódicos"]))},
 {id:"u_ass1",module:"urea",name:"Condensación de citrulina y aspartato",enzymeName:"Argininosuccinato sintetasa (ASS1)",enzymeAbbreviation:"ASS1",ecNumber:"EC 6.3.4.5",fromNodeId:"u_cit_c",toNodeId:"u_asa",reversible:false,pathway:"urea_cycle",compartment:"cytosol",
  cofactorsConsumed:["ATP","Aspartato"],cofactorsProduced:["AMP","PPi"],
  pathWayNotes:"Incorpora el segundo nitrógeno. Romper ATP en AMP + PPi equivale a gastar 2 enlaces de alta energía.",
  regulation:regOf([],clin("Citrulinemia tipo I","Autosómica recesiva (gen ASS1)","La citrulina no se condensa con el aspartato y se acumula en grandes cantidades.",["Hiperamonemia neonatal grave o formas tardías leves","Letargia, vómitos, convulsiones"],["Citrulina plasmática muy alta (a menudo > 1000 µmol/L)","Ácido orótico moderadamente elevado"],["Arginina en dosis altas (la vuelve semiesencial)","Benzoato y fenilbutirato sódicos","Dieta hipoproteica"]))},
 {id:"u_asl",module:"urea",name:"Ruptura del argininosuccinato",enzymeName:"Argininosuccinato liasa (ASL)",enzymeAbbreviation:"ASL",ecNumber:"EC 4.3.2.1",fromNodeId:"u_asa",toNodeId:"u_arg",reversible:true,pathway:"urea_cycle",compartment:"cytosol",
  cofactorsProduced:["Fumarato"],
  pathWayNotes:"Libera arginina y fumarato. El fumarato es el puente con el ciclo de Krebs.",
  regulation:regOf([],clin("Aciduria argininosuccínica","Autosómica recesiva (gen ASL)","El argininosuccinato se acumula y sale por la orina. La ASL también participa en la síntesis de óxido nítrico, lo que explica parte de la clínica.",["Hiperamonemia neonatal o crónica","Hepatomegalia y fibrosis hepática","Tricorrexis nodosa (pelo frágil y quebradizo)","Hipertensión arterial y déficit cognitivo"],["Argininosuccinato en plasma y orina","Citrulina moderadamente elevada"],["Arginina","Dieta hipoproteica"]))},
 {id:"u_arg1",module:"urea",name:"Hidrólisis de la arginina",enzymeName:"Arginasa 1 hepática (ARG1)",enzymeAbbreviation:"ARG1",ecNumber:"EC 3.5.3.1",fromNodeId:"u_arg",toNodeId:"u_orn_c",reversible:false,pathway:"urea_cycle",compartment:"cytosol",
  cofactorsConsumed:["H₂O","Mn²⁺"],cofactorsProduced:["Urea"],
  pathWayNotes:"Libera la urea y regenera la ornitina: el ciclo se cierra.",
  regulation:regOf([],clin("Argininemia (déficit de arginasa 1)","Autosómica recesiva (gen ARG1)","Se acumula arginina. A diferencia de los otros déficits, la hiperamonemia es rara o leve y domina la clínica neurológica.",["Diplejía espástica progresiva desde la infancia","Convulsiones","Retraso del desarrollo"],["Arginina plasmática muy elevada","Ácido orótico urinario elevado"],["Dieta pobre en proteínas y arginina","Benzoato y fenilbutirato sódicos","Pegzilarginasa (enzima de sustitución)"]))},
 {id:"u_fh",module:"urea",name:"Hidratación del fumarato",enzymeName:"Fumarasa citosólica",enzymeAbbreviation:"FH",ecNumber:"EC 4.2.1.2",fromNodeId:"u_fum",toNodeId:"u_mal",reversible:true,deltaG0:-3.8,pathway:"urea_cycle",compartment:"cytosol",
  pathWayNotes:"Primer paso de la lanzadera aspartato-argininosuccinato, que conecta el ciclo de la urea con el de Krebs (la «bicicleta de Krebs»)."},
 {id:"u_mdh",module:"urea",name:"Oxidación del malato",enzymeName:"Malato deshidrogenasa citosólica (MDH1)",enzymeAbbreviation:"MDH1",ecNumber:"EC 1.1.1.37",fromNodeId:"u_mal",toNodeId:"u_oaa",reversible:true,deltaG0:29.7,pathway:"urea_cycle",compartment:"cytosol",
  cofactorsConsumed:["NAD⁺"],cofactorsProduced:["NADH","H⁺"],
  pathWayNotes:"El NADH generado aquí rinde unos 2,5 ATP y compensa parte del coste del ciclo."},
 {id:"u_ast",module:"urea",name:"Transaminación de oxalacetato a aspartato",enzymeName:"Aspartato aminotransferasa citosólica (AST1 / GOT1)",enzymeAbbreviation:"AST",ecNumber:"EC 2.6.1.1",fromNodeId:"u_oaa",toNodeId:"u_asp",reversible:true,pathway:"urea_cycle",compartment:"cytosol",
  cofactorsConsumed:["Glutamato"],cofactorsProduced:["α-Cetoglutarato"],
  pathWayNotes:"Regenera el aspartato con el nitrógeno de un glutamato: así el aspartato aporta el segundo nitrógeno de la urea. Requiere piridoxal fosfato."},


 /* ---------- Cuerpos cetónicos ---------- */
 {id:"k_thl",module:"keto",name:"Condensación de dos acetil-CoA",enzymeName:"Acetoacetil-CoA tiolasa mitocondrial (T2, ACAT1)",enzymeAbbreviation:"Tiolasa",ecNumber:"EC 2.3.1.9",fromNodeId:"k_acoa",toNodeId:"k_aacoa",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["2 Acetil-CoA"],cofactorsProduced:["CoA"],
  pathWayNotes:"La misma enzima trabaja en sentido inverso en los tejidos que usan cuerpos cetónicos, y también en la degradación de la isoleucina.",
  regulation:regOf([],clin("Déficit de β-cetotiolasa (T2)","Autosómica recesiva (gen ACAT1)","Falla la ruptura del acetoacetil-CoA en los tejidos periféricos y el último paso de la degradación de la isoleucina.",["Crisis de cetoacidosis grave con infecciones o ayuno, sobre todo entre los 6 y 24 meses","Vómitos, deshidratación, taquipnea","Asintomático entre crisis"],["Cetonemia muy alta con acidosis","2-Metil-3-hidroxibutirato y tiglilglicina en orina"],["Evitar el ayuno","Glucosa intravenosa y bicarbonato en las crisis","Dieta moderada en proteínas"]))},
 {id:"k_hmgcs2",module:"keto",name:"Síntesis de HMG-CoA mitocondrial",enzymeName:"HMG-CoA sintasa mitocondrial (HMGCS2)",enzymeAbbreviation:"HMGCS2",ecNumber:"EC 2.3.3.10",fromNodeId:"k_aacoa",toNodeId:"k_hmg",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["Acetil-CoA","H₂O"],cofactorsProduced:["CoA"],
  pathWayNotes:"Paso limitante de la cetogénesis. Se expresa casi solo en el hígado (y en el epitelio intestinal del recién nacido).",
  regulation:{isKeyRegulator:true,allostericEffectors:[eff("Succinil-CoA","inhibitor","Succinila la enzima y la inactiva; la desacilasa SIRT5 revierte la modificación.")],
   covalent:{hasCovalentRegulation:true,activeForm:"Inducida y desuccinilada",inactiveForm:"Reprimida o succinilada",activatingHormone:"Glucagón, ayuno y dieta cetogénica: el factor PPARα activa la transcripción del gen HMGCS2.",inactivatingHormone:"Insulina: reprime su transcripción en el estado alimentado.",mechanism:"El control es sobre todo transcripcional: la cantidad de enzima se multiplica en horas de ayuno."},
   clinical:clin("Déficit de HMG-CoA sintasa 2","Autosómica recesiva (gen HMGCS2)","El hígado no puede fabricar cuerpos cetónicos: en ayuno el cerebro se queda sin combustible alternativo a la glucosa.",["Hipoglucemia hipocetósica con el ayuno o infecciones, en los primeros años","Hepatomegalia y encefalopatía","Asintomático fuera de las crisis"],["Cuerpos cetónicos inapropiadamente bajos con ácidos grasos libres altos","Perfil de acilcarnitinas normal (lo distingue de los defectos de β-oxidación)"],["Evitar el ayuno prolongado","Aporte de hidratos de carbono en las enfermedades intercurrentes"])}},
 {id:"k_hmgcl",module:"keto",name:"Ruptura del HMG-CoA",enzymeName:"HMG-CoA liasa (HMGCL)",enzymeAbbreviation:"HMGCL",ecNumber:"EC 4.1.3.4",fromNodeId:"k_hmg",toNodeId:"k_acac",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsProduced:["Acetil-CoA"],
  pathWayNotes:"Libera acetoacetato y recupera un acetil-CoA. Es también el último paso de la degradación de la leucina, un aminoácido estrictamente cetogénico.",
  regulation:regOf([],clin("Déficit de HMG-CoA liasa","Autosómica recesiva (gen HMGCL)","Se bloquean a la vez la cetogénesis y la degradación de la leucina.",["Hipoglucemia hipocetósica con acidosis metabólica en el lactante","Vómitos, letargia, coma","Hepatomegalia"],["Ácido 3-hidroxi-3-metilglutárico y 3-metilglutacónico en orina","Hiperamonemia en las crisis"],["Evitar el ayuno","Dieta restringida en leucina y en grasa","Carnitina"]))},
 {id:"k_bdh_h",module:"keto",name:"Reducción del acetoacetato",enzymeName:"β-Hidroxibutirato deshidrogenasa (BDH1), hígado",enzymeAbbreviation:"BDH1",ecNumber:"EC 1.1.1.30",fromNodeId:"k_acac",toNodeId:"k_bhb",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["NADH","H⁺"],cofactorsProduced:["NAD⁺"],
  pathWayNotes:"Cuanto más NADH hay en la mitocondria hepática, más acetoacetato pasa a β-hidroxibutirato. La relación habitual es de 1:1 a 2:1 y en la cetoacidosis diabética sube a 3:1 o más."},
 {id:"k_acetone",module:"keto",name:"Descarboxilación del acetoacetato",enzymeName:"Descarboxilación espontánea (no enzimática)",enzymeAbbreviation:"Espontánea",fromNodeId:"k_acac",toNodeId:"k_acetone",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsProduced:["CO₂"],
  pathWayNotes:"Ocurre sin enzima, de forma lenta. La acetona no se metaboliza de forma útil y se elimina por los pulmones y la orina."},
 {id:"k_mct",module:"keto",name:"Exportación de cuerpos cetónicos",enzymeName:"Transportadores de monocarboxilatos (MCT1, MCT2)",enzymeAbbreviation:"MCT",fromNodeId:"k_acac",toNodeId:"kb_acac",reversible:true,pathway:"transport",compartment:"blood",
  pathWayNotes:"El hígado no tiene SCOT (la 3-cetoacil-CoA transferasa), así que no puede oxidar los cuerpos cetónicos que produce: los exporta todos.",
  regulation:regOf([],clin("Cetoacidosis diabética","Diabetes tipo 1 (debut o abandono de la insulina); también diabetes tipo 2 y fármacos iSGLT2","Sin insulina y con glucagón alto, la lipólisis libera ácidos grasos en masa, la CPT-1 queda desinhibida y la HMGCS2 se induce. La producción de cuerpos cetónicos supera su uso y, como son ácidos (pKa ≈ 3,6–4,4), consumen bicarbonato.",["Poliuria, polidipsia y deshidratación","Náuseas, vómitos y dolor abdominal","Respiración de Kussmaul y aliento afrutado (acetona)","Obnubilación en casos graves"],["Glucemia > 250 mg/dL (puede ser menor con iSGLT2: cetoacidosis euglucémica)","β-Hidroxibutirato > 3 mmol/L","pH < 7,3, bicarbonato < 18 mmol/L y anión GAP elevado","Las tiras de orina no detectan el β-hidroxibutirato y pueden infravalorar el cuadro"],["Fluidoterapia intravenosa","Insulina intravenosa en perfusión","Reposición de potasio","Buscar y tratar el desencadenante"]))},
 {id:"k_mct_in",module:"keto",name:"Captación de cuerpos cetónicos",enzymeName:"Transportadores de monocarboxilatos (MCT1)",enzymeAbbreviation:"MCT1",fromNodeId:"kb_bhb",toNodeId:"kt_bhb",reversible:true,pathway:"transport",compartment:"blood",
  pathWayNotes:"La captación cerebral depende de la concentración en sangre y de la expresión de MCT1 en la barrera hematoencefálica, que aumenta en el ayuno prolongado y en el recién nacido."},
 {id:"k_bdh_t",module:"keto",name:"Oxidación del β-hidroxibutirato",enzymeName:"β-Hidroxibutirato deshidrogenasa (BDH1), tejidos periféricos",enzymeAbbreviation:"BDH1",ecNumber:"EC 1.1.1.30",fromNodeId:"kt_bhb",toNodeId:"kt_acac",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["NAD⁺"],cofactorsProduced:["NADH","H⁺"],
  pathWayNotes:"Genera un NADH (≈2,5 ATP): por eso el β-hidroxibutirato rinde algo más que el acetoacetato."},
 {id:"k_scot",module:"keto",name:"Activación del acetoacetato",enzymeName:"Succinil-CoA:3-cetoácido CoA transferasa (SCOT, OXCT1)",enzymeAbbreviation:"SCOT",ecNumber:"EC 2.8.3.5",fromNodeId:"kt_acac",toNodeId:"kt_aacoa",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["Succinil-CoA"],cofactorsProduced:["Succinato"],
  pathWayNotes:"Paso clave de la cetólisis. Toma el CoA del succinil-CoA, que así no rinde su GTP en el ciclo de Krebs. El hígado no la expresa.",
  regulation:regOf([],clin("Déficit de SCOT","Autosómica recesiva (gen OXCT1)","Los tejidos no pueden usar los cuerpos cetónicos, que se acumulan aunque el hígado los produzca a ritmo normal.",["Crisis recurrentes de cetoacidosis grave desde la lactancia","Cetosis permanente incluso tras comer en las formas graves","Taquipnea, vómitos, letargia"],["Cetonemia elevada con glucemia normal o alta","Actividad SCOT reducida en fibroblastos"],["Evitar el ayuno","Glucosa y bicarbonato intravenosos en las crisis","Dieta moderada en proteínas y grasas"]))},
 {id:"k_thl_t",module:"keto",name:"Ruptura del acetoacetil-CoA",enzymeName:"Acetoacetil-CoA tiolasa mitocondrial (T2, ACAT1)",enzymeAbbreviation:"Tiolasa",ecNumber:"EC 2.3.1.9",fromNodeId:"kt_aacoa",toNodeId:"kt_acoa",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["CoA"],cofactorsProduced:["2 Acetil-CoA"],
  pathWayNotes:"Es la misma enzima que en el hígado, trabajando en sentido inverso. Su déficit provoca crisis de cetoacidosis (ver la ficha de la tiolasa hepática)."},
 /* ---------- Lanzadera malato-aspartato ---------- */
 {id:"m_mdh1",module:"mas",name:"Reducción del oxalacetato en el citosol",enzymeName:"Malato deshidrogenasa citosólica (MDH1)",enzymeAbbreviation:"MDH1",ecNumber:"EC 1.1.1.37",fromNodeId:"ma_oaa_c",toNodeId:"ma_mal_c",reversible:true,deltaG0:-29.7,pathway:"mas_shuttle",compartment:"cytosol",
  cofactorsConsumed:["NADH","H⁺"],cofactorsProduced:["NAD⁺"],
  pathWayNotes:"Recoge el NADH de la GAPDH glucolítica y regenera el NAD⁺ citosólico sin producir lactato."},
 {id:"m_ogc",module:"mas",name:"Entrada de malato a cambio de α-cetoglutarato",enzymeName:"Transportador de oxoglutarato/malato (OGC, SLC25A11)",enzymeAbbreviation:"OGC",fromNodeId:"ma_mal_c",toNodeId:"ma_mal_m",reversible:true,pathway:"transport",compartment:"mitochondria_membrane",
  pathWayNotes:"Antiporte electroneutro de la membrana interna: un malato entra y un α-cetoglutarato sale."},
 {id:"m_mdh2",module:"mas",name:"Oxidación del malato en la matriz",enzymeName:"Malato deshidrogenasa mitocondrial (MDH2)",enzymeAbbreviation:"MDH2",ecNumber:"EC 1.1.1.37",fromNodeId:"ma_mal_m",toNodeId:"ma_oaa_m",reversible:true,deltaG0:29.7,pathway:"mas_shuttle",compartment:"mitochondria_matrix",
  cofactorsConsumed:["NAD⁺"],cofactorsProduced:["NADH","H⁺"],
  pathWayNotes:"Aunque su ΔG°′ es positivo, avanza porque la citrato sintasa y la AST2 retiran el oxalacetato. El NADH formado entra en el complejo I.",
  regulation:regOf([],clin("Encefalopatía por déficit de MDH2","Autosómica recesiva (gen MDH2)","Fallan a la vez el ciclo de Krebs y la lanzadera malato-aspartato.",["Encefalopatía de inicio precoz","Hipotonía y epilepsia","Retraso psicomotor"],["Lactato elevado en sangre y LCR","Malato y fumarato elevados en orina"],["Tratamiento de soporte"]))},
 {id:"m_ast2",module:"mas",name:"Transaminación del oxalacetato en la matriz",enzymeName:"Aspartato aminotransferasa mitocondrial (AST2 / GOT2)",enzymeAbbreviation:"AST2",ecNumber:"EC 2.6.1.1",fromNodeId:"ma_oaa_m",toNodeId:"ma_asp_m",reversible:true,pathway:"mas_shuttle",compartment:"mitochondria_matrix",
  cofactorsConsumed:["Glutamato"],cofactorsProduced:["α-Cetoglutarato"],
  pathWayNotes:"El oxalacetato no tiene transportador: lo convierte en aspartato para que pueda salir. La AST sérica de origen mitocondrial es marcadora de daño celular profundo."},
 {id:"m_agc",module:"mas",name:"Salida de aspartato a cambio de glutamato",enzymeName:"Transportador aspartato/glutamato (AGC1 aralar, SLC25A12; AGC2 citrina, SLC25A13)",enzymeAbbreviation:"AGC",fromNodeId:"ma_asp_m",toNodeId:"ma_asp_c",reversible:false,pathway:"transport",compartment:"mitochondria_membrane",
  pathWayNotes:"Entra glutamato con un H⁺ y sale aspartato. Es electrogénico: el potencial de membrana lo empuja en un solo sentido, y eso hace que toda la lanzadera solo lleve electrones hacia dentro. Aralar predomina en músculo y cerebro; citrina, en el hígado.",
  regulation:regOf([eff("Ca²⁺ citosólico","activator","Sus dominios EF-hand, orientados al espacio intermembrana, detectan el Ca²⁺ y aceleran la lanzadera cuando la célula se activa.")],
   clin("Déficit de citrina (AGC2): NICCD y citrulinemia tipo II","Autosómica recesiva (gen SLC25A13), frecuente en Asia oriental","Falta aspartato en el citosol para la ASS1 y el NADH citosólico no puede entrar en la mitocondria: sube la relación NADH/NAD⁺ hepática.",["Lactante: colestasis intrahepática neonatal (NICCD)","Adulto: hiperamonemia con síntomas neuropsiquiátricos","Aversión a los hidratos y preferencia por proteínas y grasas"],["Citrulina y arginina plasmáticas elevadas","Galactosemia y colestasis en el lactante"],["Dieta pobre en hidratos y rica en proteínas y grasa","Evitar sueros con glucosa o glicerol en dosis altas","Trasplante hepático en la forma del adulto grave"]))},
 {id:"m_ast1",module:"mas",name:"Transaminación del aspartato en el citosol",enzymeName:"Aspartato aminotransferasa citosólica (AST1 / GOT1)",enzymeAbbreviation:"AST1",ecNumber:"EC 2.6.1.1",fromNodeId:"ma_asp_c",toNodeId:"ma_oaa_c",reversible:true,pathway:"mas_shuttle",compartment:"cytosol",
  cofactorsConsumed:["α-Cetoglutarato"],cofactorsProduced:["Glutamato"],
  pathWayNotes:"Regenera el oxalacetato que acepta el siguiente NADH. Requiere piridoxal fosfato."},

 /* ---------- Lanzadera del glicerol-3-P ---------- */
 {id:"g_gpd1",module:"g3p",name:"Reducción de DHAP a glicerol-3-fosfato",enzymeName:"Glicerol-3-fosfato deshidrogenasa citosólica (GPD1)",enzymeAbbreviation:"GPD1",ecNumber:"EC 1.1.1.8",fromNodeId:"g_dhap",toNodeId:"g_g3p",reversible:true,pathway:"g3p_shuttle",compartment:"cytosol",
  cofactorsConsumed:["NADH","H⁺"],cofactorsProduced:["NAD⁺"],
  pathWayNotes:"Recoge el NADH glucolítico. En el hígado y el tejido adiposo este mismo glicerol-3-P se usa para sintetizar triacilgliceroles.",
  regulation:regOf([],clin("Déficit de GPD1","Autosómica recesiva (gen GPD1)","Se altera el reparto de triosas entre glucólisis y síntesis de lípidos en el hígado.",["Hipertrigliceridemia transitoria en la infancia","Hepatomegalia con esteatosis y, a veces, fibrosis"],["Triglicéridos muy elevados en el lactante","Transaminasas elevadas"],["Dieta pobre en grasas en la infancia","Seguimiento hepático"]))},
 {id:"g_gpd2",module:"g3p",name:"Reoxidación del glicerol-3-P en la membrana interna",enzymeName:"Glicerol-3-fosfato deshidrogenasa mitocondrial (GPD2, FAD)",enzymeAbbreviation:"GPD2",ecNumber:"EC 1.1.5.3",fromNodeId:"g_g3p",toNodeId:"g_dhap",reversible:false,pathway:"g3p_shuttle",compartment:"mitochondria_membrane",
  cofactorsConsumed:["FAD"],cofactorsProduced:["FADH₂ → CoQ"],
  pathWayNotes:"Actúa desde la cara externa de la membrana interna, así que el glicerol-3-P no necesita entrar en la matriz. La DHAP vuelve al citosol lista para aceptar otro NADH. Se ha propuesto que la metformina inhibe esta enzima, aunque es un mecanismo discutido.",
  regulation:regOf([eff("Ca²⁺ citosólico","activator","Su dominio EF-hand mira al espacio intermembrana: el Ca²⁺ de la contracción muscular acelera la lanzadera.")],null,true)},
 {id:"g_e1",module:"g3p",name:"Paso de electrones de la GPD2 al CoQ",enzymeName:"GPD2 → ubiquinona",enzymeAbbreviation:"FADH₂ → CoQ",fromNodeId:"g_gpd2",toNodeId:"g_coq",reversible:false,pathway:"electron_transport",compartment:"mitochondria_membrane",
  pathWayNotes:"Igual que el complejo II, la GPD2 no bombea protones. Por eso cada NADH citosólico rinde ≈1,5 ATP en lugar de ≈2,5."},

 /* ---------- β-Oxidación y Síntesis de Palmitato ---------- */
 {id:"l_acly",module:"lipids",name:"Escisión de citrato a acetil-CoA citosólica",enzymeName:"ATP-citrato liasa (ACLY)",enzymeAbbreviation:"ACLY",ecNumber:"EC 2.3.3.8",fromNodeId:"lp_cit",toNodeId:"lp_acoa_c",reversible:false,pathway:"lipid_metabolism",compartment:"cytosol",
  cofactorsConsumed:["ATP","CoA-SH"],cofactorsProduced:["ADP","Pi","Oxalacetato"],
  pathWayNotes:"Paso clave para abastecer de acetil-CoA al citosol para la lipogénesis de novo a partir del citrato exportado desde la mitocondria."},
 {id:"l_acc",module:"lipids",name:"Carboxilación de acetil-CoA a malonil-CoA",enzymeName:"Acetil-CoA carboxilasa 1 (ACC1 / ACACA)",enzymeAbbreviation:"ACC1",ecNumber:"EC 6.4.1.2",fromNodeId:"lp_acoa_c",toNodeId:"lp_mal",reversible:false,pathway:"lipid_metabolism",compartment:"cytosol",
  cofactorsConsumed:["ATP","HCO₃⁻","Biotina"],cofactorsProduced:["ADP","Pi"],
  pathWayNotes:"Paso marcapasos de la síntesis de ácidos grasos. Desfosforilada y activada por insulina (PP2A); fosforilada e inactivada por AMPK y PKA en ayuno o ejercicio."},
 {id:"l_fas",module:"lipids",name:"Síntesis de palmitato por FASN",enzymeName:"Ácido graso sintasa (FASN)",enzymeAbbreviation:"FASN",ecNumber:"EC 2.3.1.85",fromNodeId:"lp_mal",toNodeId:"lp_palm",reversible:false,pathway:"lipid_metabolism",compartment:"cytosol",
  cofactorsConsumed:["14 NADPH","14 H⁺"],cofactorsProduced:["14 NADP⁺","7 CO₂","8 CoA"],
  pathWayNotes:"Complejo homodimérico de 7 dominios catalíticos. Ensambla el palmitato (16:0) mediante 7 ciclos consecutivos de condensación, reducción, deshidratación y reducción."},
 {id:"l_tag",module:"lipids",name:"Esterificación a Triacilgliceroles (TAG)",enzymeName:"Glicerol-3-P aciltransferasas (GPAT / DGAT)",enzymeAbbreviation:"Esterificación TAG",fromNodeId:"lp_palm",toNodeId:"lp_tag",reversible:false,pathway:"lipid_metabolism",compartment:"cytosol",
  cofactorsConsumed:["Glicerol-3-P"],cofactorsProduced:["Triacilgliceroles (TAG)"],
  pathWayNotes:"En abundancia energética el palmitato se esterifica a triglicéridos para almacenamiento o secreción en VLDL. No entra a la mitocondria porque la Malonil-CoA bloquea a la CPT-1."},
 {id:"l_fa_in",module:"lipids",name:"Captación y activación de ácidos grasos del ayuno",enzymeName:"Acil-CoA sintetasa de cadena larga (ACSL1)",enzymeAbbreviation:"ACSL (Lipólisis)",ecNumber:"EC 6.2.1.3",fromNodeId:"lp_adipose_fa",toNodeId:"lp_ac_c",reversible:false,pathway:"lipid_metabolism",compartment:"cytosol",
  cofactorsConsumed:["ATP","CoA-SH"],cofactorsProduced:["AMP","PPi"],
  pathWayNotes:"Los ácidos grasos oxidados en ayunas provienen de la lipólisis en tejido adiposo (estimulada por glucagón/adrenalina), no de la síntesis de novo. Se activan a acil-CoA gastando 2 enlaces ~P."},
 {id:"l_cpt1",module:"lipids",name:"Transesterificación a palmitoil-carnitina",enzymeName:"Carnitina palmitoiltransferasa 1 (CPT-1A)",enzymeAbbreviation:"CPT-1",ecNumber:"EC 2.3.1.21",fromNodeId:"lp_ac_c",toNodeId:"lp_cpt1",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_membrane",
  cofactorsConsumed:["Carnitina"],cofactorsProduced:["CoA-SH citosólico"],
  pathWayNotes:"Paso limitante de la entrada a la mitocondria. Inhibida alostéricamente de forma recíproca por la Malonil-CoA citosólica para evitar ciclos fútiles."},
 {id:"l_cact",module:"lipids",name:"Translocación por CACT",enzymeName:"Carnitina-acilcarnitina translocasa (CACT, SLC25A20)",enzymeAbbreviation:"CACT",fromNodeId:"lp_cpt1",toNodeId:"lp_cact",reversible:true,pathway:"transport",compartment:"mitochondria_membrane",
  pathWayNotes:"Antiporte que introduce la acilcarnitina a la matriz a cambio de carnitina libre hacia el espacio intermembrana."},
 {id:"l_cpt2",module:"lipids",name:"Regeneración de acil-CoA en matriz",enzymeName:"Carnitina palmitoiltransferasa 2 (CPT-2)",enzymeAbbreviation:"CPT-2",ecNumber:"EC 2.3.1.21",fromNodeId:"lp_cact",toNodeId:"lp_cpt2",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["CoA-SH de matriz"],cofactorsProduced:["Carnitina libre"],
  pathWayNotes:"Regenera el palmitoil-CoA mitocondrial en la cara interna de la membrana mitocondrial interna y recicla la carnitina libre."},
 {id:"l_mito",module:"lipids",name:"Entrega de acil-CoA a la β-oxidación",enzymeName:"Difusión a la espiral oxidativa",enzymeAbbreviation:"Sustrato",fromNodeId:"lp_cpt2",toNodeId:"lp_ac_m",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  pathWayNotes:"El acil-CoA mitocondrial ingresa a la espiral de β-oxidación."},
 {id:"l_mcad",module:"lipids",name:"1. Deshidrogenación (Acil-CoA DH)",enzymeName:"Acil-CoA deshidrogenasa (VLCAD / MCAD)",enzymeAbbreviation:"MCAD",ecNumber:"EC 1.3.8.7",fromNodeId:"lp_ac_m",toNodeId:"lp_mcad",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["FAD"],cofactorsProduced:["FADH₂ (a CoQ)"],
  pathWayNotes:"Crea el doble enlace trans-Δ². Sus electrones se transfieren a la flavoproteína ETF y rinden ≈1,5 ATP en la cadena respiratoria."},
 {id:"l_hyd",module:"lipids",name:"2. Hidratación estereoespecífica",enzymeName:"Enoil-CoA hidratasa (crotonasa)",enzymeAbbreviation:"Enoil-DH",ecNumber:"EC 4.2.1.17",fromNodeId:"lp_mcad",toNodeId:"lp_enoyl",reversible:true,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["H₂O"],
  pathWayNotes:"Añade agua al doble enlace formando L-3-hidroxiacil-CoA."},
 {id:"l_thiol",module:"lipids",name:"3. Deshidrogenación y 4. Tiólisis",enzymeName:"3-HO-acil-CoA DH & β-cetotiolasa",enzymeAbbreviation:"Tiolasa",ecNumber:"EC 1.1.1.35 / 2.3.1.16",fromNodeId:"lp_enoyl",toNodeId:"lp_thiol",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  cofactorsConsumed:["NAD⁺","CoA-SH"],cofactorsProduced:["NADH","Acetil-CoA"],
  pathWayNotes:"Genera 1 NADH (≈2,5 ATP) y escinde un Acetil-CoA acortando la cadena en 2 carbonos."},
 {id:"l_out",module:"lipids",name:"Rendimiento final de Acetil-CoA",enzymeName:"Liberación de 8 Acetil-CoA",enzymeAbbreviation:"8 Acetil-CoA",fromNodeId:"lp_thiol",toNodeId:"lp_acoa_m",reversible:false,pathway:"lipid_metabolism",compartment:"mitochondria_matrix",
  pathWayNotes:"Tras 7 ciclos completos de la espiral, 1 palmitato (16C) rinde 8 Acetil-CoA, 7 FADH₂ y 7 NADH (106 ATP netos)."},
 {id:"l_tca",module:"lipids",name:"Destino en Krebs y cetogénesis",enzymeName:"Citrato sintasa / HMGCS2",enzymeAbbreviation:"Krebs / Cetonas",fromNodeId:"lp_acoa_m",toNodeId:"lp_krebs",reversible:false,pathway:"krebs_cycle",compartment:"mitochondria_matrix",
  pathWayNotes:"En ayuno o ejercicio, el acetil-CoA mitocondrial alimenta el Ciclo de Krebs (músculo/corazón) o la Cetogénesis (hígado)."}
];
const MRXM = Object.fromEntries(MRX_LIST.map(r=>[r.id,r]));

/* esquemas */
const MODULES = [
 {id:"cori",title:"Ciclo de Cori",kicker:"Cooperación entre órganos",c:"var(--pw-gluconeogenesis)",vb:[1200,720],
  intro:"El músculo en esfuerzo y el eritrocito fabrican lactato; el hígado lo convierte otra vez en glucosa y se la devuelve. Es un préstamo de energía: el hígado paga lo que el músculo consume deprisa.",
  variants:[{id:"cori",label:"Ciclo de Cori"},{id:"ala",label:"Ciclo glucosa-alanina"}],
  nodes:{m_glc:[220,140,"l"],m_pyr:[220,370,"l"],m_lac:[220,590,"l"],b_glc:[600,140,"b"],b_lac:[600,590,"b"],h_lac:[980,590,"r"],h_pyr:[980,370,"r"],h_glc:[980,140,"r"],m_ala:[350,470,"b"],b_ala:[600,470,"b"],h_ala:[850,470,"b"],h_nh4:[850,290,"l"]},
  edges:[
   {id:"c_glut4",from:"b_glc",to:"m_glc",v:["cori","ala"]},
   {id:"c_glycolysis",from:"m_glc",to:"m_pyr",tag:"+2 ATP",tagC:"pos",v:["cori","ala"]},
   {id:"c_ldh_m",from:"m_pyr",to:"m_lac",tag:"NADH → NAD⁺",v:["cori"]},
   {id:"c_mct4",from:"m_lac",to:"b_lac",tag:"lactato + H⁺",v:["cori"]},
   {id:"c_mct1",from:"b_lac",to:"h_lac",v:["cori"]},
   {id:"c_ldh_h",from:"h_lac",to:"h_pyr",tag:"NAD⁺ → NADH",v:["cori"]},
   {id:"c_gng",from:"h_pyr",to:"h_glc",tag:"−6 ATP",tagC:"neg",v:["cori","ala"]},
   {id:"c_glut2",from:"h_glc",to:"b_glc",v:["cori","ala"]},
   {id:"a_alt_m",from:"m_pyr",to:"m_ala",tag:"Glu → α-KG",v:["ala"]},
   {id:"a_out",from:"m_ala",to:"b_ala",v:["ala"]},
   {id:"a_in",from:"b_ala",to:"h_ala",v:["ala"]},
   {id:"a_alt_h",from:"h_ala",to:"h_pyr",tag:"α-KG → Glu",v:["ala"]},
   {id:"a_n",from:"h_ala",to:"h_nh4",v:["ala"]}
  ],
  bg:`<rect x="40" y="40" width="380" height="640" rx="44" class="mx-box"/><text class="comp-lbl" x="70" y="80">Músculo en esfuerzo · eritrocito<\/text>
   <rect x="470" y="30" width="260" height="660" rx="30" class="mx-blood"/><text class="comp-lbl" x="600" y="70" text-anchor="middle" style="fill:var(--danger);opacity:.7">Sangre<\/text>
   <g class="mx-rbc"><ellipse cx="520" cy="300" rx="16" ry="9"/><ellipse cx="680" cy="250" rx="16" ry="9"/><ellipse cx="545" cy="660" rx="16" ry="9"/><ellipse cx="690" cy="380" rx="16" ry="9"/><ellipse cx="510" cy="420" rx="16" ry="9"/><\/g>
   <rect x="780" y="40" width="380" height="640" rx="44" class="mx-box"/><text class="comp-lbl" x="1130" y="80" text-anchor="end">Hígado<\/text>`,
  ledger:{cori:[["Músculo","+2 ATP","pos"],["Hígado","−6 ATP","neg"],["Balance por vuelta","−4 ATP","neg"]],ala:[["Músculo","+2 ATP","pos"],["Hígado","−6 ATP y coste de la urea","neg"],["Transporta","carbono y nitrógeno",""]]},
  steps:{cori:[
   {e:["c_glut4"],t:"La glucosa llega desde la sangre: GLUT4 en el músculo, GLUT1 en el eritrocito."},
   {e:["c_glycolysis"],t:"La glucólisis anaerobia rinde solo 2 ATP por glucosa, pero muy deprisa."},
   {e:["c_ldh_m"],t:"La LDH reduce el piruvato a lactato y regenera el NAD⁺ que necesita la GAPDH."},
   {e:["c_mct4","c_mct1"],t:"El lactato sale con un H⁺ por MCT4, viaja por la sangre y entra en el hepatocito por MCT1."},
   {e:["c_ldh_h"],t:"En el hígado la LDH lo oxida otra vez a piruvato."},
   {e:["c_gng"],t:"La gluconeogénesis gasta 6 enlaces de alta energía (4 ATP y 2 GTP) para rehacer una glucosa con 2 lactatos. Esa energía sale de la β-oxidación hepática."},
   {e:["c_glut2"],t:"La glucosa nueva vuelve a la sangre por GLUT2 y el ciclo se cierra. El hígado paga 4 ATP netos por vuelta."}],
   ala:[
   {e:["c_glut4","c_glycolysis"],t:"El músculo capta glucosa y la degrada a piruvato."},
   {e:["a_alt_m"],t:"La ALT carga sobre el piruvato el grupo amino de los aminoácidos ramificados que el músculo oxida en ayuno: se forma alanina."},
   {e:["a_out","a_in"],t:"La alanina viaja por la sangre con carbono y nitrógeno a la vez, sin liberar amonio libre."},
   {e:["a_alt_h"],t:"En el hepatocito la ALT devuelve el piruvato."},
   {e:["a_n"],t:"El grupo amino pasa al glutamato y la GDH lo libera como NH₄⁺, que el ciclo de la urea convierte en urea."},
   {e:["c_gng","c_glut2"],t:"El piruvato se convierte en glucosa y regresa al músculo."}]},
  facts:["El eritrocito alimenta el ciclo de forma continua; tras un ejercicio intenso su flujo se multiplica.","Sin hígado funcionante el lactato se acumula: la insuficiencia hepática causa acidosis láctica.","El alcohol bloquea el ciclo porque el exceso de NADH impide oxidar el lactato."]},

 {id:"urea",title:"Ciclo de la urea",kicker:"Eliminación del nitrógeno · hepatocito",c:"var(--pw-urea)",vb:[1200,760],
  intro:"Convierte el amonio tóxico en urea. Empieza en la matriz mitocondrial y termina en el citosol. Cada urea lleva dos nitrógenos: uno del NH₄⁺ y otro del aspartato.",
  nodes:{u_glu:[120,130,"t"],u_nag:[330,130,"r"],u_nh4:[120,330,"l"],u_cp:[300,330,"t"],u_orn_m:[300,630,"b"],u_cit_m:[400,480,"l"],u_cit_c:[630,480,"b"],u_asp:[780,150,"t"],u_asa:[800,340,"l"],u_arg:[900,560,"b"],u_orn_c:[640,640,"b"],u_urea:[1090,640,"b"],u_fum:[1030,340,"r"],u_mal:[1090,170,"r"],u_oaa:[930,80,"t"]},
  edges:[
   {id:"u_gdh",from:"u_glu",to:"u_nh4",tag:"NAD(P)⁺ → NAD(P)H"},
   {id:"u_nags",from:"u_glu",to:"u_nag",tag:"+ acetil-CoA"},
   {id:"u_cps1",from:"u_nh4",to:"u_cp",tag:"HCO₃⁻ + 2 ATP",tagC:"neg"},
   {id:"u_otc",from:"u_cp",to:"u_cit_m"},
   {id:"u_otc_b",rx:"u_otc",from:"u_orn_m",to:"u_cit_m"},
   {id:"u_ornt_a",rx:"u_ornt1",from:"u_cit_m",to:"u_cit_c"},
   {id:"u_ornt_b",rx:"u_ornt1",from:"u_orn_c",to:"u_orn_m"},
   {id:"u_ass1",from:"u_cit_c",to:"u_asa",tag:"ATP → AMP + PPi",tagC:"neg"},
   {id:"u_ass1_b",rx:"u_ass1",from:"u_asp",to:"u_asa"},
   {id:"u_asl",from:"u_asa",to:"u_arg"},
   {id:"u_asl_b",rx:"u_asl",from:"u_asa",to:"u_fum"},
   {id:"u_arg1",from:"u_arg",to:"u_orn_c",tag:"+ H₂O"},
   {id:"u_arg1_b",rx:"u_arg1",from:"u_arg",to:"u_urea"},
   {id:"u_fh",from:"u_fum",to:"u_mal"},
   {id:"u_mdh",from:"u_mal",to:"u_oaa",tag:"NAD⁺ → NADH",tagC:"pos"},
   {id:"u_ast",from:"u_oaa",to:"u_asp",tag:"Glu → α-KG"}
  ],
  bg:`<rect x="30" y="40" width="470" height="680" rx="60" class="mx-mito"/><rect x="48" y="58" width="434" height="644" rx="48" class="mx-inner"/>
   <text class="comp-lbl" x="70" y="700" style="fill:var(--mito-lbl)">Matriz mitocondrial<\/text>
   <text class="comp-lbl" x="560" y="720">Citosol del hepatocito<\/text>
   <rect x="474" y="458" width="34" height="44" rx="9" class="mx-tr"/><rect x="474" y="618" width="34" height="44" rx="9" class="mx-tr"/>
   <text class="lbl-c" x="1090" y="700" text-anchor="middle">→ sangre → riñón<\/text>`,
  fg:`<path d="M330 152 C 300 260, 230 300, 212 320" class="mx-act"/><text class="lbl-c mx-act-t" x="268" y="250">+ activa<\/text>`,
  ledger:[["Coste","3 ATP = 4 enlaces ~P","neg"],["Nitrógenos por urea","2 (NH₄⁺ + aspartato)",""],["Recupera","≈2,5 ATP del NADH de la MDH","pos"]],
  steps:[
   {e:["u_gdh"],t:"La GDH libera el amonio del glutamato en la matriz. También llega NH₄⁺ de la glutamina y, por la vena porta, del intestino."},
   {e:["u_nags"],t:"La NAGS fabrica N-acetilglutamato, el activador obligado de la CPS1. Aumenta tras una comida rica en proteínas."},
   {e:["u_cps1"],t:"La CPS1 une NH₄⁺ y bicarbonato gastando 2 ATP. Es el paso limitante del ciclo."},
   {e:["u_otc","u_otc_b"],t:"La OTC une el carbamoil fosfato a la ornitina y forma citrulina."},
   {e:["u_ornt_a","u_ornt_b"],t:"ORNT1 saca la citrulina al citosol a cambio de ornitina."},
   {e:["u_ass1","u_ass1_b"],t:"La ASS1 incorpora el segundo nitrógeno, que aporta el aspartato. Rompe ATP en AMP + PPi."},
   {e:["u_asl","u_asl_b"],t:"La ASL rompe el argininosuccinato en arginina y fumarato."},
   {e:["u_arg1","u_arg1_b"],t:"La arginasa 1 hidroliza la arginina: libera urea y regenera la ornitina."},
   {e:["u_fh","u_mdh","u_ast"],t:"El fumarato vuelve a aspartato por malato y oxalacetato. Esta lanzadera aspartato-argininosuccinato une el ciclo de la urea con el de Krebs."}],
  facts:["Solo el hígado tiene el ciclo completo.","La hiperamonemia produce encefalopatía, vómitos y alcalosis respiratoria.","El ácido orótico ayuda a localizar el bloqueo: alto en el déficit de OTC, normal o bajo en los de CPS1 y NAGS."]},


 {id:"keto",title:"Cuerpos cetónicos",kicker:"Cetogénesis hepática · cetólisis periférica",c:"var(--pw-lipid)",vb:[1200,770],
  intro:"En ayuno prolongado, diabetes descompensada o dieta cetogénica, el hígado convierte el exceso de acetil-CoA en acetoacetato y β-hidroxibutirato. Son combustibles hidrosolubles que el cerebro, el corazón y el músculo oxidan en sus mitocondrias.",
  nodes:{k_fa:[130,170,"t"],k_acoa:[300,170,"t"],k_aacoa:[300,310,"r"],k_hmg:[300,450,"r"],k_acac:[300,590,"l"],k_bhb:[300,680,"l"],k_acetone:[140,470,"b"],kb_acac:[600,590,"t"],kb_bhb:[600,680,"b"],kt_bhb:[900,680,"r"],kt_acac:[900,590,"r"],kt_aacoa:[900,420,"r"],kt_acoa:[900,250,"l"],kt_krebs:[1060,250,"b"]},
  edges:[
   {id:"k_box",rx:"rx_beta_oxidation",from:"k_fa",to:"k_acoa"},
   {id:"k_thl",from:"k_acoa",to:"k_aacoa",tag:"2 acetil-CoA"},
   {id:"k_hmgcs2",from:"k_aacoa",to:"k_hmg",tag:"+ acetil-CoA"},
   {id:"k_hmgcl",from:"k_hmg",to:"k_acac",tag:"− acetil-CoA"},
   {id:"k_bdh_h",from:"k_acac",to:"k_bhb",tag:"NADH → NAD⁺"},
   {id:"k_acetone",from:"k_acac",to:"k_acetone",tag:"− CO₂"},
   {id:"k_out1",rx:"k_mct",from:"k_acac",to:"kb_acac"},
   {id:"k_out2",rx:"k_mct",from:"k_bhb",to:"kb_bhb"},
   {id:"k_in1",rx:"k_mct_in",from:"kb_acac",to:"kt_acac"},
   {id:"k_in2",rx:"k_mct_in",from:"kb_bhb",to:"kt_bhb"},
   {id:"k_bdh_t",from:"kt_bhb",to:"kt_acac",tag:"NAD⁺ → NADH",tagC:"pos"},
   {id:"k_scot",from:"kt_acac",to:"kt_aacoa",tag:"succinil-CoA → succinato"},
   {id:"k_thl_t",from:"kt_aacoa",to:"kt_acoa",tag:"→ 2 acetil-CoA"},
   {id:"k_tca",rx:"rx_cs",from:"kt_acoa",to:"kt_krebs"}
  ],
  bg:`<rect x="30" y="40" width="440" height="700" rx="40" class="mx-box"/><text class="comp-lbl" x="56" y="74">Hígado<\/text>
   <rect x="56" y="96" width="390" height="624" rx="50" class="mx-mito"/><text class="comp-lbl" x="426" y="708" text-anchor="end" style="fill:var(--mito-lbl)">Mitocondria<\/text>
   <text class="lbl-c" x="250" y="760" text-anchor="middle">Sin SCOT: el hígado fabrica cuerpos cetónicos, pero no los usa<\/text>
   <text class="lbl-c" x="140" y="540" text-anchor="middle">→ aliento afrutado<\/text>
   <rect x="500" y="30" width="200" height="720" rx="30" class="mx-blood"/><text class="comp-lbl" x="600" y="70" text-anchor="middle" style="fill:var(--danger);opacity:.7">Sangre<\/text>
   <g class="mx-rbc"><ellipse cx="540" cy="260" rx="16" ry="9"/><ellipse cx="660" cy="200" rx="16" ry="9"/><ellipse cx="560" cy="420" rx="16" ry="9"/><ellipse cx="655" cy="480" rx="16" ry="9"/><\/g>
   <rect x="730" y="40" width="440" height="700" rx="40" class="mx-box"/><text class="comp-lbl" x="1146" y="74" text-anchor="end">Cerebro · corazón · músculo<\/text>
   <rect x="756" y="96" width="390" height="624" rx="50" class="mx-mito"/><text class="comp-lbl" x="1126" y="124" text-anchor="end" style="fill:var(--mito-lbl)">Mitocondria<\/text>`,
  ledger:[["Cetonemia normal","< 0,5 mmol/L",""],["Ayuno prolongado","hasta 5–7 mmol/L",""],["Cetoacidosis diabética","> 3 mmol/L con pH < 7,3","neg"],["1 β-hidroxibutirato","≈21,5 ATP","pos"]],
  steps:[
   {e:["k_box"],t:"En ayuno el glucagón moviliza los ácidos grasos del tejido adiposo. Sin malonil-CoA la CPT-1 los deja entrar y la β-oxidación hepática produce acetil-CoA a gran velocidad."},
   {e:["k_thl"],t:"El oxalacetato se ha ido a la gluconeogénesis, así que el acetil-CoA no cabe en el ciclo de Krebs. La tiolasa une dos acetil-CoA en acetoacetil-CoA."},
   {e:["k_hmgcs2"],t:"La HMG-CoA sintasa 2 añade un tercer acetil-CoA. Es el paso limitante: el ayuno y PPARα la inducen y la insulina la reprime."},
   {e:["k_hmgcl"],t:"La HMG-CoA liasa libera acetoacetato y devuelve un acetil-CoA."},
   {e:["k_bdh_h","k_acetone"],t:"Parte del acetoacetato se reduce a β-hidroxibutirato con NADH. Una pequeña fracción pierde CO₂ espontáneamente y forma acetona, que sale con el aliento."},
   {e:["k_out1","k_out2","k_in1","k_in2"],t:"El hígado carece de SCOT y no puede usar lo que fabrica: exporta los cuerpos cetónicos por MCT y la sangre los lleva al cerebro, el corazón y el músculo."},
   {e:["k_bdh_t"],t:"En el tejido que los usa, la BDH1 oxida el β-hidroxibutirato a acetoacetato y genera un NADH."},
   {e:["k_scot"],t:"La SCOT activa el acetoacetato pasándole el CoA del succinil-CoA."},
   {e:["k_thl_t","k_tca"],t:"La tiolasa lo rompe en dos acetil-CoA que entran en el ciclo de Krebs. Un β-hidroxibutirato rinde ≈21,5 ATP."}],
  facts:["El cerebro no oxida ácidos grasos, pero sí cuerpos cetónicos: en ayuno prolongado cubren hasta dos tercios de su energía y ahorran proteína muscular.","Las tiras de orina (nitroprusiato) detectan acetoacetato y acetona, no β-hidroxibutirato.","Son ácidos: su exceso consume bicarbonato y produce acidosis metabólica con anión GAP elevado."]},
 {id:"mas",title:"Lanzadera malato-aspartato",kicker:"NADH citosólico → matriz · hígado, corazón, riñón",c:"var(--pw-mas)",vb:[1000,760],
  intro:"La membrana mitocondrial interna es impermeable al NADH. Esta lanzadera pasa sus electrones a la matriz en forma de malato y los entrega de nuevo como NADH al complejo I, sin pérdida de rendimiento.",
  nodes:{ma_glu_c:[150,100,"l"],ma_akg_c:[860,100,"r"],ma_asp_c:[280,240,"t"],ma_oaa_c:[500,240,"t"],ma_mal_c:[720,240,"t"],ma_asp_m:[280,520,"b"],ma_oaa_m:[500,520,"b"],ma_mal_m:[720,520,"b"],ma_glu_m:[150,660,"l"],ma_akg_m:[860,660,"r"]},
  edges:[
   {id:"m_mdh1",from:"ma_oaa_c",to:"ma_mal_c",tag:"NADH → NAD⁺"},
   {id:"m_ogc",from:"ma_mal_c",to:"ma_mal_m"},
   {id:"m_ogc_b",rx:"m_ogc",from:"ma_akg_m",to:"ma_akg_c"},
   {id:"m_mdh2",from:"ma_mal_m",to:"ma_oaa_m",tag:"NAD⁺ → NADH",tagC:"pos"},
   {id:"m_ast2",from:"ma_oaa_m",to:"ma_asp_m"},
   {id:"m_ast2_b",rx:"m_ast2",from:"ma_glu_m",to:"ma_akg_m",tag:"Glu → α-KG"},
   {id:"m_agc",from:"ma_asp_m",to:"ma_asp_c"},
   {id:"m_agc_b",rx:"m_agc",from:"ma_glu_c",to:"ma_glu_m",tag:"+ H⁺"},
   {id:"m_ast1",from:"ma_asp_c",to:"ma_oaa_c"},
   {id:"m_ast1_b",rx:"m_ast1",from:"ma_akg_c",to:"ma_glu_c",tag:"α-KG → Glu"}
  ],
  bg:`<rect x="20" y="20" width="960" height="320" rx="24" class="mx-box"/><text class="comp-lbl" x="44" y="320">Citosol<\/text>
   <rect x="20" y="350" width="960" height="70" rx="14" class="mx-membrane"/><text class="comp-lbl" x="500" y="392" text-anchor="middle">Membrana mitocondrial interna<\/text>
   <rect x="20" y="430" width="960" height="310" rx="24" class="mx-mito"/><text class="comp-lbl" x="44" y="460" style="fill:var(--mito-lbl)">Matriz<\/text>
   <rect x="118" y="346" width="200" height="78" rx="16" class="mx-tr"/><text class="lbl-c" x="236" y="378" text-anchor="start">AGC<\/text><text class="lbl-c" x="236" y="396" text-anchor="start">aralar / citrina<\/text>
   <rect x="688" y="346" width="204" height="78" rx="16" class="mx-tr"/><text class="lbl-c" x="752" y="378" text-anchor="start">OGC<\/text><text class="lbl-c" x="752" y="396" text-anchor="start">malato / α-KG<\/text>
   <text class="lbl-c" x="610" y="170" text-anchor="middle">NADH de la glucólisis (GAPDH)<\/text>`,
  fg:`<rect x="560" y="596" width="100" height="34" rx="10" class="mx-prot"/><text class="lbl-c" x="610" y="618" text-anchor="middle" style="fill:var(--pw-etc);font-size:12px">Complejo I<\/text>
   <path d="M610 540 L610 590" class="mx-e"/>`,
  ledger:[["Por NADH citosólico","≈2,5 ATP","pos"],["1 glucosa","≈32 ATP","pos"],["Sentido","solo hacia la matriz",""]],
  steps:[
   {e:["m_mdh1"],t:"El NADH de la glucólisis no atraviesa la membrana interna. La MDH1 lo usa para reducir el oxalacetato a malato."},
   {e:["m_ogc","m_ogc_b"],t:"El malato entra en la matriz por el OGC a cambio de α-cetoglutarato."},
   {e:["m_mdh2"],t:"La MDH2 reoxida el malato: el NADH reaparece en la matriz y cede sus electrones al complejo I (≈2,5 ATP)."},
   {e:["m_ast2","m_ast2_b"],t:"El oxalacetato no tiene transportador. La AST2 lo transamina a aspartato con el grupo amino del glutamato."},
   {e:["m_agc","m_agc_b"],t:"El aspartato sale por el AGC a cambio de glutamato y un H⁺. Al ser electrogénico, este intercambio obliga a la lanzadera a ir solo hacia dentro."},
   {e:["m_ast1","m_ast1_b"],t:"En el citosol la AST1 regenera el oxalacetato y el glutamato, y el ciclo vuelve a empezar."}],
  facts:["Predomina en hígado, corazón y riñón.","Es más lenta que la del glicerol-3-P, pero conserva todo el rendimiento del NADH.","La citrina hepática (AGC2) conecta esta lanzadera con el ciclo de la urea: su déficit causa citrulinemia tipo II."]},

 {id:"g3p",title:"Lanzadera del glicerol-3-P",kicker:"NADH citosólico → CoQ · músculo blanco, cerebro, grasa parda",c:"var(--pw-g3p)",vb:[1100,700],
  intro:"Es la vía rápida para reoxidar el NADH citosólico. Sus electrones entran en la cadena respiratoria por el CoQ, saltándose el complejo I, así que rinde menos ATP.",
  nodes:{g_dhap:[260,190,"l"],g_g3p:[840,190,"r"],g_gpd2:[550,420,"t"],g_c1:[330,420,"t"],g_coq:[730,420,"t"],g_c3:[880,420,"t"],g_cytc:[965,345,"r"],g_c4:[1040,420,"t"]},
  prot:{g_gpd2:"GPD2",g_c1:"I",g_c3:"III",g_c4:"IV"},ghost:["g_c1"],ellipse:["g_coq"],small:["g_cytc"],
  edges:[
   {id:"g_gpd1",from:"g_dhap",to:"g_g3p",via:[[550,80]],tag:"NADH → NAD⁺"},
   {id:"g_gpd2",from:"g_g3p",to:"g_dhap",via:[[700,330],[400,330]],tag:"FAD → FADH₂"},
   {id:"g_e1",from:"g_gpd2",to:"g_coq",tag:"e⁻"},
   {id:"g_e2",rx:"rx_etc_c3",from:"g_coq",to:"g_c3"},
   {id:"g_e3",rx:"rx_etc_cytc",from:"g_c3",to:"g_cytc"},
   {id:"g_e4",rx:"rx_etc_c4",from:"g_cytc",to:"g_c4"}
  ],
  bg:`<rect x="20" y="20" width="1060" height="270" rx="24" class="mx-box"/><text class="comp-lbl" x="44" y="276">Citosol<\/text>
   <line x1="20" y1="300" x2="1080" y2="300" class="mx-outer"/><text class="lbl-c" x="44" y="320">membrana externa (porosa)<\/text>
   <text class="comp-lbl" x="44" y="372">Espacio intermembrana<\/text>
   <rect x="20" y="392" width="1060" height="56" rx="12" class="mx-membrane"/><text class="lbl-c" x="44" y="426">membrana interna<\/text>
   <rect x="20" y="458" width="1060" height="222" rx="24" class="mx-mito"/><text class="comp-lbl" x="44" y="490" style="fill:var(--mito-lbl)">Matriz<\/text>
   <text class="lbl-c" x="550" y="560" text-anchor="middle" style="font-size:13px">El NADH citosólico nunca entra en la matriz:<\/text>
   <text class="lbl-c" x="550" y="582" text-anchor="middle" style="font-size:13px">sus electrones llegan al CoQ y rinden ≈1,5 ATP en lugar de ≈2,5<\/text>
   <path d="M330 470 l0 60" class="mx-x"/><text class="lbl-c" x="330" y="548" text-anchor="middle">no participa<\/text>`,
  ledger:[["Por NADH citosólico","≈1,5 ATP","neg"],["1 glucosa","≈30 ATP",""],["Ventaja","rapidez, sin depender del gradiente",""]],
  steps:[
   {e:["g_gpd1"],t:"La GPD1 citosólica reduce la DHAP a glicerol-3-fosfato con el NADH de la glucólisis."},
   {e:["g_gpd2"],t:"El glicerol-3-P alcanza la cara externa de la membrana interna. Allí la GPD2 lo reoxida a DHAP y sus electrones pasan al FAD."},
   {e:["g_e1"],t:"El FADH₂ de la GPD2 entrega los electrones directamente al CoQ, sin pasar por el complejo I."},
   {e:["g_e2","g_e3","g_e4"],t:"Desde el CoQ siguen por el complejo III, el citocromo c y el complejo IV. Se bombean 6 H⁺ en lugar de 10."},
   {e:[],t:"Es más rápida pero menos rentable que la de malato-aspartato: con ella la glucosa rinde unos 30 ATP en vez de 32."}],
  facts:["Predomina en el músculo esquelético rápido, el cerebro y la grasa parda.","El Ca²⁺ de la contracción activa la GPD2.","La DHAP regenerada vuelve a la glucólisis o a la síntesis de lípidos."]},

 {id:"lipids",title:"β-Oxidación y síntesis de palmitato",kicker:"Procesos no simultáneos · Regulación recíproca · Malonil-CoA ⊣ CPT-1",c:"var(--pw-lipid)",vb:[1240,740],
  intro:"La síntesis de palmitato y su β-oxidación son rutas metabólicas opuestas y mutuamente excluyentes en la célula. Ocurren en compartimentos separados (citosol vs. matriz) y están reguladas recíprocamente por el Malonil-CoA para impedir un ciclo fútil de despilfarro energético.",
  variants:[
    {id:"reciprocal",label:"Regulación recíproca (No simultáneas)"},
    {id:"synth",label:"1. Síntesis de palmitato (posprandial)"},
    {id:"betaox",label:"2. β-Oxidación Mitocondrial (Ayuno)"}
  ],
  nodes:{
    lp_cit:[130,105,"t"], lp_acoa_c:[300,105,"t"], lp_mal:[480,105,"t"], lp_palm:[680,105,"t"], lp_tag:[880,105,"r"],
    lp_adipose_fa:[1120,75,"r"],
    lp_ac_c:[1120,185,"r"], lp_cpt1:[1120,295,"r"], lp_cact:[1120,400,"r"], lp_cpt2:[1120,505,"r"],
    lp_ac_m:[980,630,"b"], lp_mcad:[780,630,"b"], lp_enoyl:[580,630,"b"], lp_thiol:[390,630,"b"],
    lp_acoa_m:[190,630,"b"], lp_krebs:[85,465,"l"]
  },
  prot:{lp_cpt1:"CPT-1",lp_cact:"CACT",lp_cpt2:"CPT-2",lp_mcad:"MCAD",lp_thiol:"Tiolasa"},
  edges:[
    {id:"l_acly",from:"lp_cit",to:"lp_acoa_c",tag:"ACLY (ATP)",v:["synth","reciprocal"]},
    {id:"l_acc",rx:"rx_acc",from:"lp_acoa_c",to:"lp_mal",tag:"ACC1 (+CO₂)",v:["synth","reciprocal"]},
    {id:"l_fas",rx:"rx_fas",from:"lp_mal",to:"lp_palm",tag:"FASN (14 NADPH)",v:["synth","reciprocal"]},
    {id:"l_tag",rx:"l_tag",from:"lp_palm",to:"lp_tag",tag:"Esterificación a TAG",v:["synth","reciprocal"]},
    {id:"l_fa_in",rx:"l_fa_in",from:"lp_adipose_fa",to:"lp_ac_c",tag:"ACSL (ATP→AMP)",v:["betaox","reciprocal"]},
    {id:"l_cpt1",rx:"rx_cpt1",from:"lp_ac_c",to:"lp_cpt1",tag:"+ Carnitina",v:["betaox","reciprocal"]},
    {id:"l_cact",from:"lp_cpt1",to:"lp_cact",tag:"IMS → IMM",v:["betaox","reciprocal"]},
    {id:"l_cpt2",rx:"rx_cact_cpt2",from:"lp_cact",to:"lp_cpt2",tag:"Regenera CoA",v:["betaox","reciprocal"]},
    {id:"l_mito",from:"lp_cpt2",to:"lp_ac_m",v:["betaox","reciprocal"]},
    {id:"l_mcad",rx:"rx_beta_oxidation",from:"lp_ac_m",to:"lp_mcad",tag:"FAD → FADH₂",v:["betaox","reciprocal"]},
    {id:"l_hyd",from:"lp_mcad",to:"lp_enoyl",tag:"+ H₂O",v:["betaox","reciprocal"]},
    {id:"l_thiol",from:"lp_enoyl",to:"lp_thiol",tag:"NAD⁺ → NADH",v:["betaox","reciprocal"]},
    {id:"l_out",from:"lp_thiol",to:"lp_acoa_m",tag:"+ CoA → 8 Acetil-CoA",v:["betaox","reciprocal"]},
    {id:"l_tca",from:"lp_acoa_m",to:"lp_krebs",tag:"Krebs / Cetonas",v:["betaox","reciprocal"]}
  ],
  bg:{
    reciprocal:`<rect x="20" y="20" width="940" height="175" rx="22" class="mx-box"/><text class="comp-lbl" x="42" y="48">Citosol · síntesis de palmitato (estado posprandial / insulina ↑)</text>
     <text class="lbl-c" x="42" y="170" style="fill:var(--fg-dim);font-size:11px">Insulina activa ACC1 por desfosforilación · El palmitato se almacena en TAG (gota lipídica) o se secreta en VLDL</text>
     <rect x="990" y="20" width="230" height="105" rx="16" class="mx-blood"/><text class="comp-lbl" x="1105" y="46" text-anchor="middle" style="fill:var(--danger)">Sangre · lipólisis (ayuno)</text>
     <rect x="990" y="230" width="230" height="325" rx="16" class="mx-membrane"/><text class="comp-lbl" x="1105" y="254" text-anchor="middle" style="font-size:10px">Membrana mitocondrial (OMM / IMS / IMM)</text>
     <rect x="20" y="430" width="1200" height="290" rx="24" class="mx-mito"/><text class="comp-lbl" x="42" y="460" style="fill:var(--mito-lbl)">Matriz mitocondrial · espiral de β-OXIDACIÓN (ayuno / glucagón ↑)</text>
     <text class="lbl-c" x="42" y="700" style="fill:var(--fg-dim);font-size:11px">4 pasos cíclicos: Acil-CoA DH (FAD) ➔ Enoil hidratasa (+H₂O) ➔ Hidroxiacil DH (NAD⁺) ➔ Tiolasa (+CoA-SH)</text>`,
    synth:`<rect x="20" y="20" width="1200" height="420" rx="24" class="mx-box"/><text class="comp-lbl" x="44" y="52">Citosol del hepatocito / adipocito · lipogénesis de novo (posprandial)</text>
     <text class="lbl-c" x="44" y="230" style="fill:var(--fg-dim);font-size:12px">Activada por insulina mediante desfosforilación de la ACC1 por la proteína fosfatasa 2A (PP2A).</text>
     <text class="lbl-c" x="44" y="255" style="fill:var(--fg-dim);font-size:12px">El producto Malonil-CoA bloquea alostéricamente a la CPT-1 mitocondrial: el palmitato sintetizado no entra a oxidarse.</text>
     <text class="lbl-c" x="44" y="280" style="fill:var(--fg-dim);font-size:12px">Destino posprandial exclusivo: esterificación a triacilgliceroles (TAG) para depósito tisular o secreción en VLDL.</text>`,
    betaox:`<rect x="880" y="20" width="340" height="105" rx="18" class="mx-blood"/><text class="comp-lbl" x="1050" y="46" text-anchor="middle" style="fill:var(--danger)">Sangre · ácidos grasos libres (lipólisis)</text>
     <rect x="880" y="140" width="340" height="420" rx="18" class="mx-membrane"/><text class="comp-lbl" x="1050" y="165" text-anchor="middle">Lanzadera de carnitina (OMM / IMS / IMM)</text>
     <rect x="20" y="430" width="1200" height="290" rx="24" class="mx-mito"/><text class="comp-lbl" x="42" y="460" style="fill:var(--mito-lbl)">Matriz mitocondrial · espiral de β-OXIDACIÓN (ayuno / ejercicio)</text>
     <text class="lbl-c" x="42" y="700" style="fill:var(--fg-dim);font-size:11px">7 ciclos de degradación rinden 8 Acetil-CoA + 7 FADH₂ + 7 NADH = 106 ATP netos para contracción o cetogénesis.</text>`
  },
  fg:{
    reciprocal:`<g class="lipid-reciprocal-fg">
     <path d="M 480 135 C 480 295, 780 295, 1070 295" fill="none" stroke="var(--danger)" stroke-width="2.6" stroke-dasharray="6 4"/>
     <line x1="1070" y1="281" x2="1070" y2="309" stroke="var(--danger)" stroke-width="4.5" stroke-linecap="round"/>
     <rect x="530" y="268" width="450" height="52" rx="12" fill="var(--bg-card)" stroke="var(--danger)" stroke-width="1.8" opacity="0.95"/>
     <text class="lbl-c" x="755" y="289" text-anchor="middle" style="fill:var(--danger);font-weight:700;font-size:12px">Inhibición recíproca: Malonil-CoA ⊣ CPT-1</text>
     <text class="lbl-c" x="755" y="307" text-anchor="middle" style="fill:var(--fg-dim);font-size:10.5px">Evita el ciclo fútil: mientras hay síntesis activa, la entrada a β-oxidación está bloqueada al 100%</text>
    </g>`,
    synth:"",
    betaox:""
  },
  ledger:{
    reciprocal:[["Control metabólico","Rutas mutuamente excluyentes","neg"],["Sensor alostérico","Malonil-CoA citosólico ⊣ CPT-1","neg"],["Estado posprandial","Insulina activa ACC1 ➔ Síntesis","pos"],["Estado de ayuno","AMPK / PKA frenan ACC1 ➔ β-Oxidación","pos"]],
    synth:[["Gasto de síntesis por palmitato (C16)","14 NADPH + 7 ATP + 8 Acetil-CoA","neg"],["Localización subcelular","Citosol (complejo dimérico FASN)",""],["Destino fisiológico","Esterificación a TAG / depósito","pos"],["Inhibición sobre CPT-1","Bloqueo alostérico total por Malonil-CoA","neg"]],
    betaox:[["Origen de sustratos","Lipólisis en tejido adiposo (Glucagón/Adrenalina)",""],["Rendimiento por palmitato (C16)","106 ATP netos (7 FADH₂ + 7 NADH + 8 Ac-CoA)","pos"],["Localización subcelular","Matriz mitocondrial (lanzadera de carnitina)",""],["Desinhibición en ayuno","Sin Malonil-CoA ➔ CPT-1 libre al 100%","pos"]]
  },
  steps:{
    reciprocal:[
     {e:["l_acly","l_acc","l_fas","l_tag"],t:"1. Estado Posprandial (Insulina alta): La glucosa sobrante genera citrato. La ACC1 activada produce Malonil-CoA, y la FASN sintetiza palmitato que se almacena como TAG."},
     {e:[],t:"2. Bloqueo alostérico recíproco: El Malonil-CoA citosólico inhibe potentemente a la CPT-1 en la membrana mitocondrial externa, impidiendo el transporte de acilos a la matriz."},
     {e:["l_fa_in","l_cpt1","l_cact","l_cpt2"],t:"3. Estado de Ayuno (Glucagón / Adrenalina / AMPK altos): La ACC1 se fosforila y apaga. Cae el Malonil-CoA y la CPT-1 queda libre para introducir los ácidos grasos de la lipólisis."},
     {e:["l_mcad","l_hyd","l_thiol","l_out","l_tca"],t:"4. Espiral de β-Oxidación: En la matriz mitocondrial, los 4 pasos liberan 8 Acetil-CoA rindiendo 106 ATP netos para energía celular o cetogénesis sin interferencia."}],
    synth:[
     {e:["l_acly"],t:"Paso 1: La ATP-citrato liasa (ACLY) escinde el citrato citosólico en Acetil-CoA y Oxalacetato con gasto de 1 ATP."},
     {e:["l_acc"],t:"Paso 2: La Acetil-CoA carboxilasa 1 (ACC1, paso marcapasos) carboxila la acetil-CoA a Malonil-CoA con gasto de ATP y HCO₃⁻. Activada por insulina y citrato."},
     {e:["l_fas"],t:"Paso 3: El complejo FASN condensa 1 acetil-CoA cebador con 7 malonil-CoA en 7 ciclos sucesivos, consumiendo 14 NADPH hasta liberar palmitato libre (16:0)."},
     {e:["l_tag"],t:"Paso 4: El palmitato se esterifica con glicerol-3-P para formar triacilgliceroles (TAG) en gotas lipídicas o secreción en VLDL hepática."}],
    betaox:[
     {e:["l_fa_in"],t:"Paso 1: En ayuno, la lipólisis adiposa libera ácidos grasos. La ACSL hepática/muscular activa el palmitato a Palmitoil-CoA citosólico gastando 2 enlaces ~P (ATP→AMP)."},
     {e:["l_cpt1"],t:"Paso 2: Con la ACC1 apagada no hay Malonil-CoA: la CPT-1 transesterifica el acil-CoA a palmitoil-carnitina en la membrana externa."},
     {e:["l_cact","l_cpt2","l_mito"],t:"Paso 3: El translocador antiporte CACT introduce la palmitoil-carnitina a la matriz a cambio de carnitina libre. La CPT-2 regenera Palmitoil-CoA mitocondrial."},
     {e:["l_mcad"],t:"Paso 4 (Espiral 1/4): La Acil-CoA deshidrogenasa (MCAD/VLCAD) genera trans-Δ²-enoil-CoA y reduce FAD a FADH₂ (que cede electrones a la CoQ vía ETF)."},
     {e:["l_hyd"],t:"Paso 5 (Espiral 2/4): La enoil-CoA hidratasa añade una molécula de agua rindiendo L-3-hidroxiacil-CoA."},
     {e:["l_thiol"],t:"Paso 6 (Espiral 3/4 y 4/4): La 3-hidroxiacil-CoA DH produce NADH, y la tiolasa escinde Acetil-CoA con CoA-SH libre, acortando la cadena en 2 carbonos."},
     {e:["l_out","l_tca"],t:"Paso 7: Tras 7 vueltas completas de la espiral, 1 palmitato (16C) rinde 8 Acetil-CoA + 7 FADH₂ + 7 NADH = 106 ATP netos para el ciclo de Krebs o la síntesis de cuerpos cetónicos."}]
  },
  facts:[
    "Incompatibilidad simultánea: La síntesis y la β-oxidación no pueden ocurrir al mismo tiempo en la misma célula; de lo contrario se disiparía la energía en un ciclo fútil sin generar trabajo.",
    "El Malonil-CoA es el sensor alostérico maestro: inhibe a la CPT-1 en concentraciones micromolares. Con síntesis activa, la entrada a la mitocondria queda bloqueada al 100%.",
    "Control hormonal recíproco: La insulina desfosforila y activa la ACC1 (favorece síntesis y frena oxidación); el glucagón, la adrenalina y la AMPK fosforilan e inactivan la ACC1 (desinhiben la CPT-1 y promueven la oxidación).",
    "Relevancia clínica (MCAD / CPT-2): Las deficiencias enzimáticas de la β-oxidación debutan en ayuno prolongado con hipoglucemia hipocetósica severa, letargia y riesgo vital por falta de ATP hepático para la gluconeogénesis."
  ]
 }
];
const MODM = Object.fromEntries(MODULES.map(m=>[m.id,m]));
/* portales desde el mapa celular */
const PORTAL = {
  ketone_bodies:"keto",rx_ketogenesis:"keto",rx_malate_aspartate_shuttle:"mas",malate_shuttle_hub:"mas",lactate_cyt:"cori",rx_ldh:"cori",rx_gpd1:"g3p",glycerol_3p:"g3p",fumarate:"urea",rx_pyruvate_carboxylase:"cori",
  palmitate:"lipids",malonyl_coa:"lipids",acyl_coa_cyt:"lipids",acyl_carnitine:"lipids",acyl_coa_mito:"lipids",rx_acc:"lipids",rx_fas:"lipids",rx_cpt1:"lipids",rx_cact_cpt2:"lipids",rx_beta_oxidation:"lipids"
};

/* ======================= Ciclos y lanzaderas: motor ======================= */
Object.entries(MNODES).forEach(([id,n])=>{ MET[id]={id,name:n.name,abbreviation:n.abbreviation,carbons:n.carbons,compartment:n.compartment,pathways:[n.pw],description:n.description,module:true}; });
MRX_LIST.forEach(r=>{ RXM[r.id]=r; });
const ALLRX = RX.concat(MRX_LIST);
const msvg = $("#mod");
let MOD = MODULES[0], modVar=null, modStep=-1, modBlock=null, modTimer=null, MEDGES=[], MNODEEL={};
const modOfNode = id => MODULES.find(m=>m.nodes[id]);
const mR = id => (MOD.prot&&MOD.prot[id])?26 : (MOD.small||[]).includes(id)?12 : (MOD.ellipse||[]).includes(id)?22 : 17;
function mGeom(e){
  const A=MOD.nodes[e.from], B=MOD.nodes[e.to]; let pts;
  if(e.via) pts=catmull([A,...e.via,B]);
  else if(e.bend){ const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1; pts=quad(A,[mx-dy/len*e.bend*2,my+dx/len*e.bend*2],B); }
  else pts=[[A[0],A[1]],[B[0],B[1]]];
  pts=trim(pts,mR(e.from)+3,mR(e.to)+8);
  const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return {pts,cum,len:cum[cum.length-1],d:"M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")};
}
const modSteps = () => !MOD.steps ? [] : Array.isArray(MOD.steps) ? MOD.steps : MOD.steps[modVar];
const modLedger = () => Array.isArray(MOD.ledger) ? MOD.ledger : MOD.ledger[modVar];
const visEdge = e => !MOD.variants || !e.v || e.v.includes(modVar);

function renderModule(){
  const msvg = document.getElementById("mod") || $("#mod");
  if(!msvg) return;
  const m=MOD; if(m.variants && !modVar) modVar=m.variants[0].id;
  const [W,H]=m.vb; msvg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  const curBg = typeof m.bg==="function"?m.bg(modVar):(typeof m.bg==="object"&&m.bg&&m.bg[modVar])?m.bg[modVar]:(m.bg||"");
  const curFg = typeof m.fg==="function"?m.fg(modVar):(typeof m.fg==="object"&&m.fg&&m.fg[modVar])?m.fg[modVar]:(m.fg||"");
  msvg.innerHTML = `<defs>${Object.entries(PW).map(([k,v])=>`<marker id="mm-${k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.4" markerHeight="4.4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${v.c}"/></marker>`).join("")}<marker id="mm-e" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--pw-etc)"/></marker><filter id="msoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter></defs>
   <g>${curBg}</g><g id="m-edges"></g><g id="m-hits"></g><g id="m-part"></g><g id="m-tags"></g><g id="m-nodes"></g><g>${curFg}</g><g id="m-fx"></g>`;
  const gE=msvg.querySelector("#m-edges")||$("#m-edges"), gH=msvg.querySelector("#m-hits")||$("#m-hits"), gT=msvg.querySelector("#m-tags")||$("#m-tags"), gN=msvg.querySelector("#m-nodes")||$("#m-nodes");
  const edges=m.edges.filter(visEdge); const used=new Set(); edges.forEach(e=>{used.add(e.from);used.add(e.to);});
  MEDGES=[]; const seenRx=new Set();
  edges.forEach(e=>{
    const rxid=e.rx||e.id, r=RXM[rxid]; const pw=(r&&r.pathway)||"transport"; const c=PW[pw].c; const g=mGeom(e);
    const p=el("path",{d:g.d,class:"edge",fill:"none","stroke-linecap":"round","marker-end":`url(#mm-${pw})`},gE); p.style.stroke=c;
    const h=el("path",{d:g.d,class:"hit"},gH); el("title",{},h).textContent=r?`${r.enzymeAbbreviation} · ${r.name}`:"";
    h.addEventListener("click",()=>openRx(rxid)); h.addEventListener("mouseenter",()=>p.classList.add("edge-hover")); h.addEventListener("mouseleave",()=>p.classList.remove("edge-hover"));
    const first = !seenRx.has(rxid); seenRx.add(rxid);
    const showPill = first && r && r.enzymeAbbreviation!=="Transporte";
    const [mx,my]=pointAt(g,g.len/2); let pw2=0;
    if(showPill){ const P=enzPill(gT,mx,my,r,13); pw2=P.w; P.g.addEventListener("click",()=>openRx(rxid)); }
    let tg=null; if(e.tag){ const dx=g.pts[g.pts.length-1][0]-g.pts[0][0], dy=g.pts[g.pts.length-1][1]-g.pts[0][1];
      const vert=Math.abs(dy)>Math.abs(dx); tg=el("text",{x:vert?mx+(pw2?pw2/2+10:12):mx,y:vert?my+4:my-(pw2?24:11),"text-anchor":vert?"start":"middle",class:"lbl-c mx-tag "+(e.tagC||"")},gT); tg.textContent=e.tag; }
    MEDGES.push({e,rxid,g,p,h,tg,parts:[]});
  });
  MNODEEL={};
  Object.entries(m.nodes).forEach(([id,[x,y,lp]])=>{
    if(m.variants && !used.has(id)) return;
    const mt=MET[id]; const c=PW[mt.pathways[0]].c; const R=mR(id);
    const g=el("g",{class:"node",transform:`translate(${x} ${y})`,tabindex:"0",role:"button","aria-label":mt.name},gN);
    const halo=el("circle",{r:R+14,filter:"url(#msoft)",opacity:0},g); halo.style.fill=c;
    const ghost=(m.ghost||[]).includes(id);
    if(m.prot&&m.prot[id]){ const b=el("rect",{x:-28,y:-20,width:56,height:40,rx:12,class:"mx-prot"},g); b.style.stroke=c; if(ghost) b.setAttribute("stroke-dasharray","4 4");
      const t=el("text",{"text-anchor":"middle",y:4,class:"lbl-c",style:"font-size:12px;stroke-width:0"},g); t.style.fill=c; t.textContent=m.prot[id]; }
    else if((m.ellipse||[]).includes(id)){ const b=el("ellipse",{rx:24,ry:15,class:"mx-prot","stroke-width":2},g); b.style.stroke=c; }
    else { const b=el("circle",{r:R,"stroke-width":2.4},g); b.style.fill="var(--node-fill)"; b.style.stroke=c; const d=el("circle",{r:R*.38},g); d.style.fill=c; }
    if(ghost) g.style.opacity=.45;
    const pos={b:[0,R+17,"middle"],t:[0,-R-20,"middle"],l:[-R-9,5,"end"],r:[R+9,5,"start"]}[lp||"b"];
    const inner = m.prot&&m.prot[id]; const label = mt.abbreviation;
    if(!(inner && inner===label)){ const t=el("text",{class:"lbl",x:pos[0],y:pos[1],"text-anchor":pos[2]},g); t.textContent=label; }
    if(mt.carbons>0){ const t=el("text",{class:"lbl-c",x:pos[0],y:lp==="t"?pos[1]-16:pos[1]+14,"text-anchor":pos[2]},g); t.textContent="C"+mt.carbons; }
    g.addEventListener("click",()=>openNode(id)); g.addEventListener("keydown",ev=>{ if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();openNode(id);} });
    MNODEEL[id]={g,halo,ghost};
  });
  cssify(msvg); modApply(); renderModInfo(); buildModTabs(); syncModTabs();
}

function modApply(){
  const msvg = document.getElementById("mod") || $("#mod");
  const st=modSteps()[modStep]; const act=new Set(st?st.e:MEDGES.map(E=>E.e.id));
  const nodeOn=new Set();
  MEDGES.forEach(E=>{
    const on=act.has(E.e.id), blocked=modBlock && E.rxid===modBlock;
    E.p.style.opacity = blocked? .9 : on? 1 : .13;
    E.p.setAttribute("stroke-width", on&&st? 6 : on? 4 : 3);
    E.p.style.stroke = blocked? "var(--danger)" : PW[(RXM[E.rxid]||{}).pathway||"transport"].c;
    if(E.tg) E.tg.style.opacity = on? 1 : .25;
    const want = (on && !blocked) ? 3 : 0;
    const gPart = msvg ? (msvg.querySelector("#m-part") || $("#m-part")) : $("#m-part");
    while(E.parts.length<want){ const c=el("circle",{r:4.2},gPart); c.style.fill=E.p.style.stroke; E.parts.push({c,s:Math.random()}); }
    while(E.parts.length>want) E.parts.pop().c.remove();
    E.parts.forEach((P,i)=>{ P.s=(i/Math.max(1,want))%1; P.c.style.fill=E.p.style.stroke; });
    if(on){ nodeOn.add(E.e.from); nodeOn.add(E.e.to); }
  });
  Object.entries(MNODEEL).forEach(([id,N])=>{ const on=nodeOn.has(id)||N.ghost; N.g.style.opacity = N.ghost? .45 : on? 1 : .3; N.halo.style.opacity = (st && nodeOn.has(id))? (document.documentElement.dataset.mode==="dark"?.5:.28) : 0; });
  /* bloqueo */
  const fx=msvg ? (msvg.querySelector("#m-fx") || $("#m-fx")) : $("#m-fx"); if(!fx) return; fx.innerHTML="";
  if(modBlock){ const Es=MEDGES.filter(E=>E.rxid===modBlock); const acc=new Set(), def=new Set();
    Es.forEach(E=>{ acc.add(E.e.from); def.add(E.e.to); });
    if(Es[0]){ const [x,y]=pointAt(Es[0].g,Es[0].g.len/2); el("circle",{cx:x,cy:y,r:16,fill:"var(--node-fill)",stroke:"var(--danger)","stroke-width":2},fx); el("path",{d:`M${x-7} ${y-7}L${x+7} ${y+7}M${x+7} ${y-7}L${x-7} ${y+7}`,stroke:"var(--danger)","stroke-width":3,"stroke-linecap":"round"},fx); }
    acc.forEach(id=>{ if(def.has(id)) return; const P=MOD.nodes[id]; if(!P) return; el("circle",{cx:P[0],cy:P[1],r:mR(id)+9,fill:"none",stroke:"var(--danger)","stroke-width":2.5,class:"acc-ring"},fx);
      const t=el("text",{x:P[0]+mR(id)+12,y:P[1]-mR(id)-4,class:"lbl-c",style:"fill:var(--danger);font-size:12px"},fx); t.textContent="▲ acumula"; });
    def.forEach(id=>{ const P=MOD.nodes[id]; if(!P||acc.has(id)) return; const t=el("text",{x:P[0]+mR(id)+12,y:P[1]+mR(id)+14,class:"lbl-c",style:"fill:var(--fg-dim);font-size:12px"},fx); t.textContent="▼ déficit"; });
    cssify(fx); }
}
function placeModParticles(dt){
  for(const E of MEDGES){ if(!E.parts.length) continue; const sp=95/E.g.len;
    for(const P of E.parts){ P.s=(P.s+sp*dt)%1; const [x,y]=pointAt(E.g,P.s*E.g.len); P.c.setAttribute("cx",x.toFixed(1)); P.c.setAttribute("cy",y.toFixed(1)); P.c.setAttribute("opacity",Math.min(1,Math.min(P.s,1-P.s)*8).toFixed(2)); } }
}

function renderModInfo(){
  const m=MOD, steps=modSteps(); const st=steps[modStep];
  $("#mod-info").innerHTML = `<div><div class="eyebrow">${esc(m.kicker)}<\/div><h2 class="mod-h">${esc(m.title)}<\/h2><p class="mod-p">${esc(m.intro)}<\/p><\/div>
   <p class="enz-legend"><b>★<\/b> paso regulador · toca cualquier enzima para abrir su ficha<\/p>
   ${m.variants?`<div class="seg" role="group" aria-label="Variante">${m.variants.map(v=>`<button data-var="${v.id}" aria-pressed="${v.id===modVar}">${esc(v.label)}<\/button>`).join("")}<\/div>`:""}
   <div class="player"><div class="row"><button class="btn" id="mp-prev" aria-label="Paso anterior">‹<\/button><button class="btn pri" id="mp-play">${modTimer?"Pausar":"Reproducir paso a paso"}<\/button><button class="btn" id="mp-next" aria-label="Paso siguiente">›<\/button><span class="mono" style="margin-left:auto;font-size:11px;color:var(--fg-faint)">${modStep<0?`${steps.length} pasos`:`Paso ${modStep+1} de ${steps.length}`}<\/span><\/div>
    <div class="dots">${steps.map((_,i)=>`<button data-step="${i}" aria-label="Paso ${i+1}" class="${i===modStep?"on":i<modStep?"done":""}"><\/button>`).join("")}<\/div>
    <p>${st?esc(st.t):"Pulsa <b>Reproducir<\/b> para recorrer el proceso, o toca cualquier flecha para abrir la ficha de su enzima."}<\/p>
    ${modStep>=0?`<button class="lnk-btn" id="mp-all">Ver el esquema completo<\/button>`:""}<\/div>
   <div><div class="eyebrow" style="margin-bottom:8px">Balance<\/div><div class="ledger">${modLedger().map(([k,v,c])=>`<div><span>${esc(k)}<\/span><b class="${c}">${esc(v)}<\/b><\/div>`).join("")}<\/div><\/div>
   <div><div class="eyebrow" style="margin-bottom:8px">Claves<\/div><ul class="notes" style="--sc:${m.c}">${m.facts.map(f=>`<li>${esc(f)}<\/li>`).join("")}<\/ul><\/div>`;
  const I=$("#mod-info");
  I.querySelectorAll("[data-var]").forEach(b=>b.onclick=()=>{ modVar=b.dataset.var; modStep=-1; stopPlay(); modBlock=null; renderModule(); });
  I.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{ stopPlay(); setStep(+b.dataset.step); });
  $("#mp-prev").onclick=()=>{ stopPlay(); setStep(modStep<=0? steps.length-1 : modStep-1); };
  $("#mp-next").onclick=()=>{ stopPlay(); setStep(modStep>=steps.length-1? -1 : modStep+1); };
  $("#mp-play").onclick=()=>{ if(modTimer){ stopPlay(); renderModInfo(); return; } if(modStep>=steps.length-1||modStep<0) modStep=-1; modTimer=setInterval(()=>{ if(modStep>=modSteps().length-1){ stopPlay(); setStep(-1); return; } setStep(modStep+1); }, 3800); setStep(modStep+1); };
  const all=$("#mp-all"); if(all) all.onclick=()=>{ stopPlay(); setStep(-1); };
}
function setStep(i){ modStep=i; modApply(); renderModInfo(); }
function stopPlay(){ if(modTimer){ clearInterval(modTimer); modTimer=null; } }
function setModBlock(id){ modBlock=id||null; stopPlay(); modStep=-1; modApply(); renderModInfo(); }
function syncModTabs(){ document.querySelectorAll(".mod-tab").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mod===MOD.id))); }
function selectModule(id){ MOD=MODM[id]||MODULES[0]; modVar=null; modStep=-1; modBlock=null; stopPlay(); closePanel(); renderModule(); }
function buildModTabs(){
  const mt = $("#mod-tabs");
  if(!mt) return;
  mt.innerHTML = MODULES.map(m=>`<button class="mod-tab" data-mod="${m.id}" style="--mc:${m.c}" aria-pressed="${m.id===MOD.id}"><b><span class="dot" style="color:${m.c}"></span>${esc(m.title)}</b><small>${esc(m.kicker)}</small></button>`).join("");
  mt.querySelectorAll(".mod-tab").forEach(b=>b.onclick=()=>selectModule(b.dataset.mod));
}
buildModTabs();
function openModule(id){ go("ciclos"); selectModule(id); }

/* portales en el mapa celular */
(function(){
  const gP=el("g",{},svg);
  [["cori","Ciclo de Cori",300,1160],["urea","Ciclo de la urea",1430,1128],["keto","Cuerpos cetónicos",935,790],["mas","Lanzadera malato-aspartato",653,878],["g3p","Lanzadera del glicerol-3-P",880,700],["lipids","β-oxidación y palmitato",1410,500]].forEach(([id,label,x,y])=>{
    const w=label.length*8+30; const g=el("g",{class:"portal",transform:`translate(${x} ${y})`,tabindex:"0",role:"button","aria-label":"Abrir "+label},gP);
    const r=el("rect",{x:0,y:-15,width:w,height:30,rx:3},g); r.style.stroke=MODM[id].c;
    const t=el("text",{x:16,y:5,class:"portal-t"},g); t.textContent="↗ "+label;
    g.addEventListener("click",()=>{ if(!dragMoved) openModule(id); }); g.addEventListener("keydown",e=>{ if(e.key==="Enter"){ openModule(id);} });
  });
})();

/* ======================= Vistas ======================= */
let currentView="mapa";
function renderTissues(){
  const vt = $("#view-tejidos");
  if(!vt) return;
  vt.innerHTML = renderTissueSuite(tissueTab, tissueSelectedId);
  cssify(vt);
  setupTissueSuite(vt, {
    onTabChange: (t) => {
      tissueTab = t;
      renderTissues();
    },
    onTissueSelect: (id) => {
      tissueSelectedId = id;
      renderTissues();
    },
    onApplyToMap: (id) => {
      tissueFilter = id;
      syncTissueChips();
      go("mapa");
      apply();
      toast(`Mapa filtrado para: ${TISSUES_DATA[id]?.name || id}`);
    }
  });
}

function go(v){
  if(!["mapa","balances","reto","ciclos","tejidos","misiones"].includes(v)) v="mapa";
  const prev=currentView; currentView=v;
  document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.view===v)));
  const isFullFlow = v==="balances"||v==="ciclos"||v==="tejidos";
  $("#view-mapa").hidden = isFullFlow;
  $("#view-balances").hidden = v!=="balances";
  $("#view-ciclos").hidden = v!=="ciclos";
  const vt = $("#view-tejidos"); if(vt) vt.hidden = v!=="tejidos";
  $("#stage").classList.toggle("flow", isFullFlow);
  $(".body").classList.toggle("norail", isFullFlow);
  if(v!==prev) closePanel();
  if(v==="balances"){ renderBalances(); }
  if(v==="ciclos"){ renderModule(); } else stopPlay();
  if(v==="tejidos"){ renderTissues(); }
  if(v==="reto"){ if(!quiz||quiz.done) newQuiz(); else renderQuiz(); }
  else { $("#quiz").hidden=true; if(quiz){ quiz=null; drawFx(); } }
  if(v==="misiones") enterMissions(); else if(prev==="misiones") leaveMissions();
  drawHud();
  if(location.hash.slice(1)!==v) history.replaceState(null,"","#"+v);
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>go(b.dataset.view));
window.addEventListener("hashchange",()=>go(location.hash.slice(1)));
window.metabolixGo = (v) => go(v);
{ const cb=$("#cite-copy"); if(cb) cb.onclick=()=>{
    const txt=($("#cite-ref")?.textContent||"").trim();
    const done=()=>{ cb.textContent="Copiada"; setTimeout(()=>cb.textContent="Copiar cita",1800); };
    try { navigator.clipboard.writeText(txt).then(done, ()=>toast("No se pudo copiar: selecciona el texto")); } catch(e){ toast("No se pudo copiar: selecciona el texto"); }
  }; }
/* al salir del recorrido guiado: el mapa entero y a la vista, sin fichas abiertas */
window.metabolixShowMap = () => {
  go("mapa"); closePanel(); animVB(fitBox());
  const f=document.querySelector(".map-frame");
  /* en móvil el mapa queda debajo de los controles: se baja hasta él */
  if(f && innerWidth<=860) requestAnimationFrame(()=>f.scrollIntoView({block:"start", behavior:"auto"}));
  else window.scrollTo({top:0});
};
window.metabolixRefreshQuiz = () => { if(currentView === "reto") renderQuiz(); };
window.metabolixNewQuiz = () => { newQuiz(); };

let tt; function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),1800); }

IDX = IDX.concat(
  Object.keys(MNODES).map(id=>({kind:"mnode",id,label:MET[id].name,c:PW[MET[id].pathways[0]].c,txt:(MET[id].name+" "+MET[id].abbreviation).toLowerCase()})),
  MRX_LIST.map(r=>({kind:"mrx",id:r.id,label:r.enzymeName,c:PW[r.pathway].c,txt:(r.enzymeName+" "+r.enzymeAbbreviation+" "+r.name).toLowerCase()})),
  MRX_LIST.filter(r=>r.regulation&&r.regulation.clinical).map(r=>({kind:"mdis",id:r.id,label:r.regulation.clinical.diseaseName,c:"var(--danger)",txt:r.regulation.clinical.diseaseName.toLowerCase()})),
  MODULES.map(m=>({kind:"mod",id:m.id,label:m.title,c:m.c,txt:(m.title+" "+m.kicker).toLowerCase()})),
  Object.values(TISSUES_DATA).map(t=>({kind:"tissue",id:t.id,label:t.name,c:TISSUE_COLORS[t.id]||"var(--accent)",txt:(t.name+" tejido "+t.title+" "+t.fuelFed+" "+t.fuelFasting).toLowerCase()}))
);
/* modo claro / oscuro */
const SUN='<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9L13 13M3 13l1.1-1.1M11.9 4.1L13 3"/></g></svg>';
const MOON='<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" fill="currentColor"/></svg>';
function setMode(m){ document.documentElement.dataset.mode=m; const b=$("#mode"); b.innerHTML = m==="dark"? SUN : MOON; b.setAttribute("aria-label", m==="dark"?"Cambiar a modo claro":"Cambiar a modo oscuro"); b.title=b.getAttribute("aria-label");
  try{ localStorage.setItem("metabolix-mode",m); }catch(e){} apply(); if(MEDGES.length) modApply(); }
$("#mode").onclick=()=>setMode(document.documentElement.dataset.mode==="dark"?"light":"dark");
let m0="light"; try{ m0=localStorage.getItem("metabolix-mode")||"light"; }catch(e){}
/* arranque */
cssify(document.querySelector(".app"));
const fcBtn = document.getElementById("panel-flashcard-btn");
if (fcBtn) {
  fcBtn.onclick = () => toggleFlashcardMode();
}
const hdrFcBtn = document.getElementById("btn-hdr-flashcard");
if (hdrFcBtn) {
  hdrFcBtn.onclick = () => toggleFlashcardMode();
}
syncFlashcardBtn();
buildRail(); renderStateInfo(); setMode(m0);
document.querySelectorAll("#predict-toggle button").forEach(b=>b.onclick=()=>setPredictMode(b.dataset.pm==="predict")); syncPredictToggle();
go(location.hash.slice(1)||"mapa");
Object.assign(VB, fitBox()); setVB();

}
