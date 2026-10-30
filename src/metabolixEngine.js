// @ts-nocheck
import { D } from "./metabolixData.js";

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
  galactose:[140,238,"b"], gal1p:[292,238,"b"], mannose:[140,360,"b"], man6p:[300,388,"b"],
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
  rx_etc_c5:{bend:30}
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
  rx:{rx_gp:.04,rx_cpt1:.04,rx_cact_cpt2:.04,rx_beta_oxidation:.04,rx_ketogenesis:0,rx_glut_out:0,rx_ldh:.1,rx_pyruvate_carboxylase:.1,rx_oaa_export:0,rx_pepck:0,rx_g6pase:0,rx_fbpase1:0,rx_galk:.4,rx_galt:.4},
  notes:["La insulina activa la proteína fosfatasa 1: la glucógeno sintasa queda desfosforilada (activa) y la fosforilasa inactiva.","La PFK-2 desfosforilada fabrica fructosa-2,6-bisfosfato y la PFK-1 trabaja a pleno rendimiento.","La ACC produce malonil-CoA, que bloquea la CPT-1: los ácidos grasos recién sintetizados no entran en la mitocondria a quemarse."]},
 {id:"fast",name:"Ayuno nocturno",tissue:"Hepatocito · 12–24 h",c:"var(--pw-gluconeogenesis)",
  sig:{Insulina:.12,"Glucagón":.85,Adrenalina:.3,"AMP/ATP":.35,"Demanda NADPH":.2},
  pw:{glycolysis:.08,gluconeogenesis:1,pentose_phosphate:.15,glycogen_metabolism:.05,monosaccharide_entry:.05,mitochondrial_fate:.4,krebs_cycle:.5,electron_transport:.8,lipid_metabolism:.05},
  rx:Object.assign(rev(-.8),{rx_ldh:-.8,rx_gp:1,rx_pgm_glycogen:-.9,rx_mpc:.8,rx_pdh:.12,rx_malate_aspartate_shuttle:.3,rx_gpd1:-.6,rx_acyl_coa_synth:.7,rx_cpt1:1,rx_cact_cpt2:1,rx_beta_oxidation:1,rx_ketogenesis:.45,rx_glut:0,rx_glut_out:1}),
  notes:["El glucagón eleva el AMPc y la PKA fosforila la PFK-2 (domina la FBPasa-2), la piruvato quinasa L y la glucógeno sintasa: todas se apagan.","El glucógeno hepático se degrada y la G-6-Pasa libera glucosa a la sangre.","Lactato (ciclo de Cori), alanina y glicerol dan los esqueletos de carbono; la β-oxidación aporta el ATP y el NADH que la gluconeogénesis consume."]},
 {id:"keto",name:"Ayuno prolongado",tissue:"Hepatocito · > 3 días",c:"var(--pw-lipid)",
  sig:{Insulina:.05,"Glucagón":1,Adrenalina:.35,"AMP/ATP":.4,"Demanda NADPH":.15},
  pw:{glycolysis:.05,gluconeogenesis:.8,pentose_phosphate:.1,glycogen_metabolism:.02,monosaccharide_entry:0,mitochondrial_fate:.3,krebs_cycle:.25,electron_transport:.75,lipid_metabolism:.03},
  rx:Object.assign(rev(-.65),{rx_ldh:-.5,rx_gp:.05,rx_pgm_glycogen:-.05,rx_mpc:.6,rx_pdh:.05,rx_gpd1:-.8,rx_acyl_coa_synth:1,rx_cpt1:1,rx_cact_cpt2:1,rx_beta_oxidation:1,rx_ketogenesis:1,rx_glut:0,rx_glut_out:.7,rx_cs:.2}),
  notes:["El glucógeno hepático se agota en 24–36 h: la glucemia depende solo de la gluconeogénesis.","El oxalacetato se desvía a gluconeogénesis y el acetil-CoA de la β-oxidación no cabe en el ciclo de Krebs: se convierte en cuerpos cetónicos.","El cerebro llega a cubrir cerca de dos tercios de su energía con β-hidroxibutirato y acetoacetato, y así se ahorra proteína muscular."]},
 {id:"run",name:"Sprint",tissue:"Músculo esquelético",c:"var(--pw-krebs)",
  sig:{Insulina:.2,"Glucagón":.2,Adrenalina:1,"AMP/ATP":.95,"Demanda NADPH":.05},
  pw:{glycolysis:1,gluconeogenesis:0,pentose_phosphate:.04,glycogen_metabolism:0,monosaccharide_entry:0,mitochondrial_fate:.7,krebs_cycle:1,electron_transport:1,lipid_metabolism:0},
  rx:{rx_ldh:1,rx_gp:1,rx_pgm_glycogen:-1,rx_glut:.7,rx_pdh:.8,rx_acyl_coa_synth:.35,rx_cpt1:.35,rx_cact_cpt2:.35,rx_beta_oxidation:.35,rx_malate_aspartate_shuttle:.3},
  notes:["La adrenalina (vía PKA) y el Ca²⁺ de la contracción activan la fosforilasa quinasa: el glucógeno muscular se moviliza en segundos.","El AMP activa por alosterismo la PFK-1 y la fosforilasa b; la AMPK detecta el déficit energético.","Cuando la demanda supera la capacidad oxidativa, la LDH reduce el piruvato a lactato para regenerar NAD⁺ y mantener viva la glucólisis."]},
 {id:"rbc",name:"Estrés oxidativo",tissue:"Eritrocito",c:"var(--pw-pentose)",
  sig:{Insulina:.3,"Glucagón":.3,Adrenalina:.1,"AMP/ATP":.4,"Demanda NADPH":1},
  pw:{glycolysis:.6,gluconeogenesis:0,pentose_phosphate:1,glycogen_metabolism:0,monosaccharide_entry:0,mitochondrial_fate:0,krebs_cycle:0,electron_transport:0,lipid_metabolism:0},
  rx:{rx_ldh:.9,rx_glut:.8},noMito:true,
  notes:["El eritrocito no tiene mitocondrias: todo su ATP sale de la glucólisis anaerobia y termina en lactato.","La G6PDH es su única fuente de NADPH, imprescindible para regenerar el glutatión reducido.","Sin NADPH, la hemoglobina se oxida y precipita (cuerpos de Heinz): es la hemólisis del favismo tras habas, primaquina o infecciones."]},
 {id:"fru",name:"Sobrecarga de fructosa",tissue:"Hepatocito",c:"var(--pw-mono)",
  sig:{Insulina:.5,"Glucagón":.15,Adrenalina:.1,"AMP/ATP":.6,"Demanda NADPH":.7},
  pw:{glycolysis:.9,gluconeogenesis:.1,pentose_phosphate:.4,glycogen_metabolism:.3,monosaccharide_entry:0,mitochondrial_fate:.9,krebs_cycle:.6,electron_transport:.7,lipid_metabolism:1},
  rx:{rx_khk:1,rx_aldolase_b:1,rx_triose_kinase:1,rx_hk:.25,rx_pgi:.25,rx_pfk1:.15,rx_aldo_a:.15,rx_gp:0,rx_cpt1:.03,rx_cact_cpt2:.03,rx_beta_oxidation:.03,rx_ketogenesis:0,rx_glut_out:.1,rx_ldh:.3,rx_g6pase:.1,rx_fbpase1:0,rx_pyruvate_carboxylase:.05,rx_oaa_export:0,rx_pepck:0},
  notes:["La fructoquinasa no está regulada y la aldolasa B rompe la fructosa-1-P en triosas que esquivan el control de la PFK-1.","El exceso de triosas alimenta la lipogénesis de novo y la síntesis de triacilgliceroles: es la base de la esteatosis hepática (MASLD).","La fosforilación masiva gasta ATP y fosfato; el AMP sobrante se degrada a ácido úrico (hiperuricemia)."]}
];
let ST = STATES[0];
let focusPw = null;      // ruta aislada
let block = null;        // reacción bloqueada (enfermedad)
let blockAcc = new Set(), blockDef = new Set();
let playing = !RM;

function flux(r){
  if(block===r.id) return 0;
  let f = (r.id in ST.rx) ? ST.rx[r.id] : (ST.pw[r.pathway] ?? 0);
  if(ST.noMito && (r.compartment!=="cytosol" || ["rx_mpc","rx_citrate_export","rx_oaa_export","rx_malate_aspartate_shuttle"].includes(r.id))) f = 0;
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
let VB = {x:20,y:10,w:1760,h:1400};
const setVB = ()=>svg.setAttribute("viewBox",`${VB.x} ${VB.y} ${VB.w} ${VB.h}`);
setVB(); svg.setAttribute("preserveAspectRatio","xMidYMid meet");

const defs = el("defs",{},svg);
defs.innerHTML = `
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
 <radialGradient id="mitoFill" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="var(--mito-fill-a)" stop-opacity=".55"/><stop offset="1" stop-color="var(--mito-fill-b)" stop-opacity=".35"/></radialGradient>
 <radialGradient id="cellFill" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="var(--cell-a)" stop-opacity=".7"/><stop offset="1" stop-color="var(--cell-b)" stop-opacity=".2"/></radialGradient>
 <pattern id="chrom" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.4" fill="var(--nuc)" opacity=".35"/><circle cx="11" cy="10" r="1" fill="var(--nuc)" opacity=".25"/></pattern>`;
Object.entries(PW).forEach(([k,v])=>{
  defs.insertAdjacentHTML("beforeend",`<marker id="m-${k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${v.c}"/></marker>`);
});

cssify(defs);
const gComp = el("g",{},svg), gEdges=el("g",{filter:"url(#glow)",class:"edges-g"},svg), gHits=el("g",{},svg), gPart=el("g",{},svg), gNodes=el("g",{},svg), gFx=el("g",{},svg);

/* compartimentos */
gComp.innerHTML = `
 <text class="comp-lbl" x="1740" y="70" text-anchor="end">SANGRE · ESPACIO EXTRACELULAR</text>
 <rect x="60" y="112" width="1690" height="1268" rx="96" fill="url(#cellFill)" stroke="var(--cell-stroke)" stroke-width="12" stroke-opacity=".35"/>
 <rect x="60" y="112" width="1690" height="1268" rx="96" fill="none" stroke="var(--cell-line)" stroke-width="1.4" stroke-opacity=".55"/>
 <text class="comp-lbl" x="96" y="160">CITOSOL</text>
 <g opacity=".9"><rect x="540" y="98" width="40" height="28" rx="8" fill="var(--node-fill)" stroke="var(--pw-glycolysis)" stroke-opacity=".7"/><text class="lbl-c" x="586" y="117">GLUT</text></g>
 <g><rect x="380" y="98" width="40" height="28" rx="8" fill="var(--node-fill)" stroke="var(--pw-gluconeogenesis)" stroke-opacity=".7"/><text class="lbl-c" x="330" y="117">GLUT2</text></g>
 <ellipse cx="210" cy="1250" rx="140" ry="96" fill="url(#chrom)" stroke="var(--nuc)" stroke-opacity=".5" stroke-width="3"/>
 <ellipse cx="210" cy="1250" rx="140" ry="96" fill="var(--nuc)" opacity=".05"/>
 <text class="comp-lbl" x="150" y="1255">NÚCLEO</text>
 <circle cx="198" cy="858" r="74" fill="var(--pw-lipid)" fill-opacity=".07" stroke="var(--pw-lipid)" stroke-opacity=".35" stroke-width="1.5"/>
 <text class="comp-lbl" x="118" y="770" style="fill:var(--lipid-lbl)">GOTA LIPÍDICA</text>
 <g id="granule" opacity=".75"></g>
 <g id="mito">
  <rect x="770" y="700" width="945" height="645" rx="150" fill="url(#mitoFill)" stroke="var(--mito-stroke)" stroke-opacity=".5" stroke-width="3"/>
  <path id="inner" d="" fill="none" stroke="var(--pw-mito)" stroke-opacity=".55" stroke-width="2.2"/>
  <text class="comp-lbl" x="1112" y="760" style="fill:var(--mito-lbl)">MATRIZ MITOCONDRIAL</text>
  <text class="comp-lbl" x="860" y="1325" style="fill:var(--mito-lbl)">ESPACIO INTERMEMBRANA</text>
  <text id="nomito" class="comp-lbl" x="1242" y="1030" text-anchor="middle" style="fill:var(--pw-pentose);font-size:22px;letter-spacing:.12em" opacity="0">SIN MITOCONDRIAS EN EL ERITROCITO</text>
 </g>`;
cssify(gComp);
/* membrana interna con crestas */
(function(){
  const x0=796,y0=726,x1=1690,y1=1238,r=126; let d=`M${x0+r} ${y0} H${x1-r} A${r} ${r} 0 0 1 ${x1} ${y0+r}`;
  // crestas en el lado derecho
  let y=y0+r+30; d+=` V${y}`;
  for(let k=0;k<4;k++){ d+=` H${x1-62} a10 10 0 0 0 0 20 H${x1}`; y+=20; d+=` V${y+70}`; y+=70; }
  d+=` V${y1-r} A${r} ${r} 0 0 1 ${x1-r} ${y1} H${x0+r} A${r} ${r} 0 0 1 ${x0} ${y1-r} V${y0+r} A${r} ${r} 0 0 1 ${x0+r} ${y0}Z`;
  $("#inner").setAttribute("d",d);
  const g=$("#granule"); const [gx,gy]=L.glycogen;
  for(let i=0;i<34;i++){ const a=i*2.399, rr=8+Math.sqrt(i)*8.6; el("circle",{cx:gx+Math.cos(a)*rr,cy:gy+Math.sin(a)*rr,r:5.5-i*.06,fill:"var(--pw-glycogen)","fill-opacity":.16,stroke:"var(--pw-glycogen)","stroke-opacity":.35},g); }
  el("text",{class:"comp-lbl",x:gx-40,y:gy+80,style:"fill:var(--gly-lbl)"},g).textContent="GRÁNULO";
})();

/* aristas */
const EDGES = [];
RX.forEach(r=>{
  const g=geom(r); if(!g) return;
  const c=PW[r.pathway].c;
  const p=el("path",{d:g.d,class:"edge",fill:"none",stroke:c,"stroke-linecap":"round"},gEdges);
  if(r.id==="rx_malate_aspartate_shuttle") p.setAttribute("stroke-dasharray","2 9");
  const h=el("path",{d:g.d,class:"hit"},gHits);
  h.addEventListener("click",e=>{ if(dragMoved) return; onPick("rx",r.id); });
  h.addEventListener("mouseenter",()=>p.classList.add("edge-hover"));
  h.addEventListener("mouseleave",()=>p.classList.remove("edge-hover"));
  const tt=el("title",{},h); tt.textContent=`${r.enzymeAbbreviation} · ${r.name}`;
  EDGES.push({r,g,p,h,parts:[],f:0});
});
/* nodos */
const NODES = {};
D.METABOLITES.forEach(m=>{
  const P=L[m.id]; if(!P) return; const [x,y,lp]=P; const c=PW[m.pathways[0]]?.c||"var(--fg)";
  const g=el("g",{class:"node",transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`,tabindex:"0",role:"button","aria-label":m.name},gNodes);
  const halo=el("circle",{class:"halo",r:nodeR(m.id)+14,fill:c,opacity:.0,filter:"url(#soft)"},g);
  let body;
  if(PROTEIN.has(m.id)){
    if(m.id==="atp_synthase"){ el("rect",{x:-11,y:-4,width:22,height:30,rx:5,fill:"var(--node-fill)",stroke:"var(--pw-etc)","stroke-opacity":.7},g); body=el("circle",{cy:-22,r:20,fill:"var(--node-fill)",stroke:"var(--pw-etc)","stroke-width":2},g);
      el("path",{d:"M-12 -22 h24 M0 -34 v24",stroke:"var(--pw-etc)","stroke-opacity":.35},g);}
    else if(m.id==="coenzyme_q"){ body=el("ellipse",{rx:22,ry:14,fill:"var(--node-fill)",stroke:"var(--pw-etc)","stroke-width":2},g); }
    else { body=el("rect",{x:-26,y:-20,width:52,height:40,rx:12,fill:"var(--node-fill)",stroke:"var(--pw-etc)","stroke-width":2},g);
      el("text",{class:"lbl-c","text-anchor":"middle",y:4,style:"font-size:12px;fill:var(--pw-etc);stroke-width:0"},g).textContent=({complex_1:"I",complex_2:"II",complex_3:"III",complex_4:"IV"})[m.id]; }
  } else if(m.id==="proton_gradient"){
    body=el("circle",{r:18,fill:"var(--pw-etc)","fill-opacity":.05,stroke:"var(--pw-etc)","stroke-dasharray":"2 4"},g);
    [[-34,-6],[-14,6],[8,-8],[30,4],[-44,10],[48,-6]].forEach(([dx,dy])=>{ el("text",{x:dx,y:dy,class:"lbl-c",style:"fill:var(--pw-etc);font-size:11px;stroke-width:0;opacity:.6"},g).textContent="H⁺"; });
  } else {
    const R=nodeR(m.id);
    body=el("circle",{r:R,fill:"var(--node-fill)",stroke:c,"stroke-width":m.isBranchPoint?3:2},g);
    if(m.isBranchPoint) el("circle",{r:R+5,fill:"none",stroke:c,"stroke-opacity":.35,"stroke-dasharray":"2 4"},g);
    el("circle",{r:R*.38,fill:c,opacity:.85},g);
  }
  const R=nodeR(m.id)+(PROTEIN.has(m.id)?2:0);
  const pos = {b:[0,R+16,"middle"],t:[0,-R-18,"middle"],l:[-R-8,4,"end"],r:[R+8,4,"start"]}[lp||"b"];
  const t=el("text",{class:"lbl",x:pos[0],y:pos[1]+(lp==="t"&&m.id==="atp_synthase"?-26:0),"text-anchor":pos[2]},g); t.textContent=m.abbreviation;
  if(m.carbons>0){ const c2=el("text",{class:"lbl-c",x:pos[0],y:pos[1]+13+(lp==="t"?-30:0),"text-anchor":pos[2]},g); c2.textContent="C"+m.carbons; if(lp==="t") c2.setAttribute("y",pos[1]-15); }
  g.addEventListener("click",()=>{ if(dragMoved) return; onPick("node",m.id); });
  g.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); onPick("node",m.id);} });
  NODES[m.id]={g,halo,body,m};
});

/* ======================= Etiquetas de enzimas ======================= */
const KEY_MAP = new Set(["rx_hk","rx_pfk1","rx_pk","rx_pdh","rx_g6pdh","rx_gs","rx_gp","rx_cs","rx_idh","rx_akgdh","rx_fbpase1","rx_pyruvate_carboxylase","rx_pepck","rx_g6pase","rx_acc","rx_cpt1","rx_ketogenesis"]);
const isKey = r => r && (r.module ? !!(r.regulation&&r.regulation.isKeyRegulator) : KEY_MAP.has(r.id));
const SHORT = {rx_ketogenesis:"HMGCS2",rx_malate_aspartate_shuttle:"Mal-Asp",rx_citrate_export:"CIC",rx_etc_c5:"ATP sintasa",rx_beta_oxidation:"β-oxidación",rx_tag_synth:"GPAT / DGAT"};
const PILL_T = {rx_g6pase:.68,rx_g6pdh:.62,rx_pyruvate_carboxylase:.33,rx_ketogenesis:.6};
const shortAbbr = a => String(a||"").replace(/\s*\([^)]*\)/g,"").trim();
function enzPill(parent,x,y,r,fs){
  const key=isKey(r), dz=!!(r.regulation&&r.regulation.clinical), txt=SHORT[r.id]||shortAbbr(r.enzymeAbbreviation);
  const w=Math.round(txt.length*fs*.64+(key?fs*1.2:0)+fs*1.5), h=Math.round(fs*1.75);
  const g=el("g",{class:"enz pw-"+r.pathway+(key?" key":""),transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`,tabindex:"0",role:"button","aria-label":"Enzima "+r.enzymeName},parent);
  const rc=el("rect",{x:-w/2,y:-h/2,width:w,height:h,rx:h/2},g); rc.style.fill=PW[r.pathway].c;
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
  EDGES.forEach(E=>{
    const f=flux(E.r); E.f=f; const a=Math.abs(f);
    const inFocus = !focusPw || E.r.pathway===focusPw;
    const on = a>0.02;
    E.p.setAttribute("stroke-width", on ? (1.6+a*5.4).toFixed(2) : 1.3);
    E.p.style.opacity = (!inFocus? .05 : on ? (.28+.72*a) : .16);
    E.p.setAttribute("stroke-dasharray", E.r.id==="rx_malate_aspartate_shuttle" ? "2 9" : on? "" : "3 6");
    E.p.style.stroke = block===E.r.id ? "var(--danger)" : PW[E.r.pathway].c;
    const mk = `url(#m-${E.r.pathway})`;
    E.p.removeAttribute("marker-end"); E.p.removeAttribute("marker-start");
    if(on || !E.r.reversible){ if(f<0) E.p.setAttribute("marker-start",mk); else E.p.setAttribute("marker-end",mk); }
    // partículas
    const want = (on && inFocus) ? Math.max(1,Math.round(a*Math.min(5,E.g.len/90))) : 0;
    while(E.parts.length<want){ const c=el("circle",{r:3.3,fill:PW[E.r.pathway].c},gPart); E.parts.push({c,s:Math.random()}); }
    while(E.parts.length>want){ E.parts.pop().c.remove(); }
    E.parts.forEach((P,i)=>{ P.s=(i/want + Math.random()*.15)%1; });
    [E.r.fromNodeId,E.r.toNodeId].forEach(n=>{ act[n]=Math.max(act[n]||0, inFocus?a:0); });
    if(E.pill) E.pill.style.opacity = inFocus? 1 : .12;
  });
  Object.values(NODES).forEach(N=>{
    const a=act[N.m.id]||0; const inFocus=!focusPw || N.m.pathways.includes(focusPw);
    N.halo.style.opacity = (a*(document.documentElement.dataset.mode==="dark"?.55:.22)).toFixed(2);
    N.g.style.opacity = inFocus ? (a>0.02? 1 : .5) : .14;
  });
  $("#nomito").setAttribute("opacity", ST.noMito? 1 : 0);
  $("#mito").style.opacity = ST.noMito? .35 : 1;
  drawFx(); drawHud(); placeParticles();
}

/* acumulación y déficit cuando hay un bloqueo */
function setBlock(id){
  block=id||null; blockAcc=new Set(); blockDef=new Set();
  if(block){ const r=RXM[block];
    blockAcc.add(r.fromNodeId); RX.forEach(x=>{ if(x.toNodeId===r.fromNodeId && x.id!==block && x.fromNodeId!==r.toNodeId && x.pathway!=="gluconeogenesis") blockAcc.add(x.fromNodeId); });
    blockDef.add(r.toNodeId);
  }
  $("#disease").value = block||"";
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
const FIT={x:20,y:-40,w:1760,h:1450};
function fitBox(){ const a=svg.clientHeight/(svg.clientWidth||1); if(a>1.1) return {x:60,y:-40,w:980,h:980*a}; if(currentView==="reto") return {x:20,y:-260,w:1760,h:1680}; return {...FIT}; }
function focusXY(x,y,w=760){ const r=svg.clientHeight/svg.clientWidth||.7; const h=w*r; const pw=$("#panel").classList.contains("open")&&innerWidth>860?440:0;
  const shift = pw? (pw/svg.clientWidth)*w*.5 : 0; animVB({x:x-w/2+shift,y:y-h/2,w,h}); }
$("#z-in").onclick=()=>{const b=svg.getBoundingClientRect(); zoomAt(.75,b.left+b.width/2,b.top+b.height/2);};
$("#z-out").onclick=()=>{const b=svg.getBoundingClientRect(); zoomAt(1.33,b.left+b.width/2,b.top+b.height/2);};
$("#z-fit").onclick=()=>animVB(fitBox());
$("#z-play").onclick=()=>{ playing=!playing; $("#z-play").innerHTML = playing? '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="3.4" height="10" rx="1" fill="currentColor"/><rect x="8.6" y="2" width="3.4" height="10" rx="1" fill="currentColor"/></svg>' : '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>'; $("#z-play").setAttribute("aria-label",playing?"Pausar animación":"Reanudar animación"); };
if(!playing) $("#z-play").click(), playing=false, $("#z-play").innerHTML='<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>';

/* ======================= Raíl ======================= */
function buildRail(){
  const sb=$("#states");
  STATES.forEach(s=>{ const b=document.createElement("button"); b.className="state"; b.style.setProperty("--sc",s.c); b.setAttribute("aria-pressed",s===ST);
    b.innerHTML=`<b>${esc(s.name)}</b><small>${esc(s.tissue)}</small>`; b.onclick=()=>setState(s.id); sb.appendChild(b); });
  const pc=$("#pw-chips");
  Object.entries(PW).filter(([k])=>MAP_PW.includes(k)).forEach(([k,v])=>{ const b=document.createElement("button"); b.className="chip"; b.style.color=v.c; b.dataset.pw=k; b.setAttribute("aria-pressed","false");
    b.innerHTML=`<span class="dot"></span><span style="color:var(--fg)">${esc(v.name)}</span>`; b.onclick=()=>{ focusPw = focusPw===k? null : k; syncChips(); apply(); }; pc.appendChild(b); });
  const ds=$("#disease"); ds.innerHTML=`<option value="">Ninguna · fisiología normal</option>`+
    RX.filter(r=>r.regulation&&r.regulation.clinical).sort((a,b)=>a.regulation.clinical.diseaseName.localeCompare(b.regulation.clinical.diseaseName,"es"))
      .map(r=>`<option value="${r.id}">${esc(r.regulation.clinical.diseaseName)} — ${esc(r.enzymeAbbreviation)}</option>`).join("");
  ds.onchange=()=>{ setBlock(ds.value); if(ds.value){ openRx(ds.value,true); const E=EDGES.find(e=>e.r.id===ds.value); const [x,y]=pointAt(E.g,E.g.len/2); focusXY(x,y,900);} };
}
function syncChips(){ document.querySelectorAll("#pw-chips .chip").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.pw===focusPw))); }
function setState(id){ ST=STATES.find(s=>s.id===id); document.querySelectorAll(".state").forEach((b,i)=>b.setAttribute("aria-pressed",String(STATES[i]===ST))); renderStateInfo(); apply(); }
function renderStateInfo(){
  $("#meters").innerHTML = Object.entries(ST.sig).map(([k,v])=>`<div class="meter" style="--mc:${k==="Insulina"?"var(--pw-glycolysis)":k==="Glucagón"?"var(--pw-gluconeogenesis)":k==="Adrenalina"?"var(--pw-glycogen)":k==="AMP/ATP"?"var(--pw-krebs)":"var(--pw-pentose)"}"><span>${k}</span><i><u style="width:${Math.round(v*100)}%"></u></i><em>${Math.round(v*100)}</em></div>`).join("");
  $("#st-title").textContent = `${ST.name} · ${ST.tissue}`;
  const n=$("#st-notes"); n.style.setProperty("--sc",ST.c); n.innerHTML=ST.notes.map(t=>`<li>${esc(t)}</li>`).join("");
}
function drawHud(){
  $("#hud").hidden = currentView==="reto"; gEnz.style.display = currentView==="reto" ? "none" : "";
  $("#hud").innerHTML = `<span class="pill"><span class="dot" style="color:${ST.c}"></span><b>${esc(ST.name)}</b><span style="color:var(--fg-dim)">${esc(ST.tissue)}</span></span>` +
   (focusPw? `<button class="pill" id="hud-pw"><span class="dot" style="color:${PW[focusPw].c}"></span>${esc(PW[focusPw].name)} <span style="color:var(--fg-faint)">✕</span></button>`:"") +
   (block? `<button class="pill" id="hud-bl" style="border-color:color-mix(in srgb,var(--danger) 45%,transparent)"><span class="dot" style="color:var(--danger)"></span>${esc(RXM[block].regulation.clinical.diseaseName)} <span style="color:var(--fg-faint)">✕</span></button>`:"");
  $("#hud").insertAdjacentHTML("beforeend",`<span class="pill seg-mini" role="group" aria-label="Etiquetas de enzimas"><button data-enz="key" aria-pressed="${enzMode==="key"}"><span class="star">★</span> Reguladoras</button><button data-enz="all" aria-pressed="${enzMode==="all"}">Todas las enzimas</button></span>`);
  document.querySelectorAll("[data-enz]").forEach(b=>b.onclick=()=>{ enzMode=b.dataset.enz; drawEnz(); apply(); });
  const a=$("#hud-pw"); if(a) a.onclick=()=>{focusPw=null;syncChips();apply();};
  const b=$("#hud-bl"); if(b) b.onclick=()=>setBlock(null);
}

/* ======================= Panel de detalle ======================= */
const panel=$("#panel"), pbody=$("#panel-body");
$("#panel-close").onclick=()=>closePanel();
function closePanel(){ panel.classList.remove("open"); $(".body").classList.remove("po"); }
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ closePanel(); $("#results").hidden=true; } if(e.key==="/" && document.activeElement!==$("#q")){ e.preventDefault(); $("#q").focus(); } });

function onPick(kind,id){
  if(quiz && !quiz.done && !quiz.reveal && currentView==="reto"){ answer(kind,id); return; }
  if(kind==="rx") openRx(id); else openNode(id);
}
function gauge(dg){ const min=-65,max=35; const k=(Math.max(min,Math.min(max,dg))-min)/(max-min)*100; const z=(0-min)/(max-min)*100;
  return `<div class="dg"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="eyebrow">ΔG°′ estándar</span><b class="mono" style="font-size:18px">${dg>0?"+":""}${dg} kJ/mol</b></div>
  <div class="dg-bar"><s style="left:${z}%"></s><i style="left:calc(${k}% - 1.5px)"></i></div><div class="dg-axis"><span>−65 · muy exergónica</span><span>0</span><span>+35</span></div></div>`; }

function openRx(id, fromDisease){
  const r=RXM[id]; const c=PW[r.pathway].c; const reg=r.regulation;
  const A=MET[r.fromNodeId], B=MET[r.toNodeId];
  $("#panel-kind").textContent = "Reacción · enzima";
  let h = `<div><div class="tags"><span class="tag" style="color:${c};border-color:color-mix(in srgb,${c} 40%,transparent)">${esc(PW[r.pathway].name)}</span><span class="tag">${esc(COMP[r.compartment]||r.compartment)}</span>${reg&&reg.isKeyRegulator?'<span class="tag k">Punto de control</span>':""}${r.reversible?'<span class="tag">Reversible</span>':'<span class="tag">Irreversible</span>'}</div>
   <h2 class="p-title">${esc(r.enzymeName)}</h2><div class="p-sub">${esc(r.name)}${r.ecNumber?` · <span class="mono">${esc(r.ecNumber)}</span>`:""}</div></div>
   <div class="eq" style="--pc:${c}"><button class="lnk" data-node="${A.id}" style="text-decoration:underline dotted;text-underline-offset:3px">${esc(A.abbreviation)}</button><span class="arrow">${r.reversible?"⇌":"⟶"}</span><button class="lnk" data-node="${B.id}" style="text-decoration:underline dotted;text-underline-offset:3px">${esc(B.abbreviation)}</button><span style="margin-left:auto;color:var(--fg-faint);font-size:11px">${esc(r.enzymeAbbreviation)}</span></div>
   ${r.deltaG0!=null?gauge(r.deltaG0):""}`;
  const cc=[...(r.cofactorsConsumed||[]).map(x=>`<span class="in">− ${esc(x)}</span>`),...(r.cofactorsProduced||[]).map(x=>`<span class="out">+ ${esc(x)}</span>`)];
  if(cc.length) h+=`<div class="blk"><h4>Cofactores</h4><div class="cof">${cc.join("")}</div></div>`;
  if(r.pathWayNotes) h+=`<div class="blk"><h4>Por qué importa</h4><p>${esc(r.pathWayNotes)}</p></div>`;
  if(PORTAL[r.id]) h+=`<button class="btn" data-portal="${PORTAL[r.id]}">Ver en detalle: ${esc(MODM[PORTAL[r.id]].title)} →</button>`;
  const f=r.module?0:flux(r); if(!r.module) h+=`<div class="blk"><h4>En el estado actual</h4><p><b style="color:${ST.c}">${esc(ST.name)}</b> · ${Math.abs(f)<.03?"prácticamente apagada":Math.abs(f)<.35?"flujo bajo":Math.abs(f)<.75?"flujo moderado":"flujo alto"}${f<-.02?" y <b>en sentido inverso</b> (gluconeogénico)":""}.</p></div>`;
  if(reg){
    if(reg.allostericEffectors?.length) h+=`<div class="blk"><h4>Regulación alostérica</h4><div class="eff">${reg.allostericEffectors.map(e=>`<div class="${e.effect==="activator"?"act":"inh"}"><span class="sym">${e.effect==="activator"?"+":"−"}</span><div><b>${esc(e.molecule)}</b><p>${esc(e.physiologicalRole)}</p>${e.affinityNote?`<small>${esc(e.affinityNote)}</small>`:""}</div></div>`).join("")}</div></div>`;
    const cv=reg.covalent; if(cv&&cv.hasCovalentRegulation) h+=`<div class="blk"><h4>Control hormonal y covalente</h4><div class="cov"><div class="on"><b>Activa · ${esc(cv.activeForm)}</b>${esc(cv.activatingHormone)}</div><div class="off"><b>Inactiva · ${esc(cv.inactiveForm)}</b>${esc(cv.inactivatingHormone)}</div></div><p style="margin-top:8px">${esc(cv.mechanism)}${cv.targetResidue?` <span class="mono" style="color:var(--fg-faint)">· ${esc(cv.targetResidue)}</span>`:""}</p></div>`;
    if(reg.kinetics) h+=`<div class="blk kin" id="kin"><h4>Cinética ${reg.kinetics.modelType==="hill"?"sigmoide (Hill)":"de Michaelis-Menten"}</h4><div id="kin-plot"></div><label for="kin-s">[${esc(reg.kinetics.substrateName)}]<input type="range" id="kin-s" min="0" max="1000" value="250"><span class="mono" id="kin-sv"></span></label><div class="ctrl" id="kin-ctrl"></div><p id="kin-desc" style="margin-top:8px"></p></div>`;
    const cl=reg.clinical; if(cl) h+=`<div class="clin"><span class="lab">Correlación clínica${cl.inheritance?` · ${esc(cl.inheritance)}`:""}</span><h5>${esc(cl.diseaseName)}</h5><p style="margin:0;color:var(--fg-dim);font-size:12.5px">${esc(cl.mechanism)}</p>
      ${cl.symptoms?.length?`<span class="lab">Clínica</span><ul>${cl.symptoms.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
      ${cl.diagnosticBiomarkers?.length?`<span class="lab">Diagnóstico</span><ul>${cl.diagnosticBiomarkers.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
      ${cl.treatmentKeys?.length?`<span class="lab">Tratamiento</span><ul>${cl.treatmentKeys.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
      <div>${(r.module?modBlock:block)===r.id?`<button class="btn" id="unblock">Quitar el déficit del mapa</button>`:`<button class="btn red" id="doblock">Simular el déficit en el mapa</button>`}</div></div>`;
  }
  pbody.innerHTML=h; pbody.scrollTop=0; panel.classList.add("open"); $(".body").classList.add("po");
  pbody.querySelectorAll("[data-node]").forEach(b=>b.onclick=()=>openNode(b.dataset.node));
  const db=$("#doblock"); if(db) db.onclick=()=>{ if(r.module){ if(MOD.id!==r.module) selectModule(r.module); setModBlock(r.id);} else setBlock(r.id); openRx(r.id); toast("Déficit simulado: mira dónde se acumulan los metabolitos"); };
  pbody.querySelectorAll("[data-portal]").forEach(b=>b.onclick=()=>openModule(b.dataset.portal));
  const ub=$("#unblock"); if(ub) ub.onclick=()=>{ if(r.module) setModBlock(null); else setBlock(null); openRx(r.id); };
  if(reg&&reg.kinetics) kinetics(reg.kinetics, c);
  if(!fromDisease && currentView!=="reto"){ const E=EDGES.find(e=>e.r.id===id); if(E && innerWidth>860){ /* sin zoom forzado al explorar */ } }
}

function openNode(id){
  const m=MET[id]; const c=PW[m.pathways[0]]?.c||"var(--fg)";
  $("#panel-kind").textContent="Metabolito";
  const ins=ALLRX.filter(r=>r.toNodeId===id), outs=ALLRX.filter(r=>r.fromNodeId===id);
  const li=(r,dir)=>`<button data-rx="${r.id}"><span class="dot" style="color:${PW[r.pathway].c}"></span><span>${dir} <b>${esc(r.enzymeAbbreviation)}</b> · ${esc(MET[dir==="←"?r.fromNodeId:r.toNodeId]?.abbreviation||"")}</span><small>${esc(PW[r.pathway].name)}</small></button>`;
  pbody.innerHTML = `<div><div class="tags"><span class="tag">${esc(COMP[m.compartment]||m.compartment)}</span>${m.isBranchPoint?'<span class="tag k">Encrucijada metabólica</span>':""}</div>
   <h2 class="p-title" style="color:${c}">${esc(m.name)}</h2><div class="p-sub mono">${esc(m.abbreviation)}${m.formula?` · ${esc(m.formula)}`:""}</div></div>
   ${m.carbons>0?`<div class="blk"><h4>Esqueleto carbonado</h4><div class="carb">${Array.from({length:m.carbons},()=>`<i style="border-color:${c}"></i>`).join("")}<span class="mono" style="margin-left:8px;color:var(--fg-dim)">${m.carbons} C</span></div></div>`:""}
   <div class="blk"><p style="color:var(--fg);font-size:14px">${esc(m.description)}</p></div>
   <div class="blk"><h4>Rutas</h4><div class="chips">${m.pathways.filter(p=>PW[p]).map(p=>`<span class="chip" style="color:${PW[p].c}"><span class="dot"></span><span style="color:var(--fg)">${esc(PW[p].name)}</span></span>`).join("")}</div></div>
   ${PORTAL[id]?`<button class="btn" data-portal="${PORTAL[id]}">Ver en detalle: ${esc(MODM[PORTAL[id]].title)} →</button>`:""}
   ${ins.length?`<div class="blk"><h4>Se forma por</h4><div class="rxlist">${ins.map(r=>li(r,"←")).join("")}</div></div>`:""}
   ${outs.length?`<div class="blk"><h4>Se transforma en</h4><div class="rxlist">${outs.map(r=>li(r,"→")).join("")}</div></div>`:""}`;
  pbody.scrollTop=0; panel.classList.add("open"); $(".body").classList.add("po");
  pbody.querySelectorAll("[data-rx]").forEach(b=>b.onclick=()=>openRx(b.dataset.rx));
  pbody.querySelectorAll("[data-portal]").forEach(b=>b.onclick=()=>openModule(b.dataset.portal));
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
let IDX = [
  ...D.METABOLITES.map(m=>({kind:"node",id:m.id,label:m.name,sub:m.abbreviation,c:PW[m.pathways[0]]?.c,txt:(m.name+" "+m.abbreviation).toLowerCase()})),
  ...RX.map(r=>({kind:"rx",id:r.id,label:r.enzymeName,sub:r.enzymeAbbreviation,c:PW[r.pathway].c,txt:(r.enzymeName+" "+r.enzymeAbbreviation+" "+r.name).toLowerCase()})),
  ...RX.filter(r=>r.regulation&&r.regulation.clinical).map(r=>({kind:"dis",id:r.id,label:r.regulation.clinical.diseaseName,sub:"Enfermedad",c:"var(--danger)",txt:r.regulation.clinical.diseaseName.toLowerCase()}))
];
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"");
let hl=0, curRes=[];
$("#q").addEventListener("input",()=>{ const q=norm($("#q").value.trim().toLowerCase()); const box=$("#results");
  if(!q){ box.hidden=true; return; } curRes=IDX.filter(i=>norm(i.txt).includes(q)).slice(0,12); hl=0;
  box.innerHTML = curRes.length? curRes.map((r,i)=>`<button data-i="${i}" class="${i===0?"hl":""}"><span class="dot" style="color:${r.c}"></span><span>${esc(r.label)}</span><small>${({node:"metabolito",rx:"enzima",dis:"enfermedad",mnode:"metabolito · esquema",mrx:"enzima · esquema",mdis:"enfermedad · esquema",mod:"esquema"})[r.kind]}</small></button>`).join("") : `<div style="padding:10px;color:var(--fg-faint);font-size:12px">Sin resultados para «${esc($("#q").value)}»</div>`;
  box.hidden=false; box.querySelectorAll("button").forEach(b=>b.onclick=()=>goRes(curRes[+b.dataset.i])); });
$("#q").addEventListener("keydown",e=>{ const box=$("#results"); if(box.hidden||!curRes.length) return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); hl=(hl+(e.key==="ArrowDown"?1:-1)+curRes.length)%curRes.length; box.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("hl",i===hl)); }
  if(e.key==="Enter"){ e.preventDefault(); goRes(curRes[hl]); } });
document.addEventListener("click",e=>{ if(!e.target.closest(".search")) $("#results").hidden=true; });
function goRes(r){ $("#results").hidden=true; $("#q").value=""; $("#q").blur();
  if(r.kind==="mod"){ openModule(r.id); return; }
  if(r.kind==="mnode"){ openModule(modOfNode(r.id).id); openNode(r.id); return; }
  if(r.kind==="mrx"||r.kind==="mdis"){ const rr=RXM[r.id]; openModule(rr.module); if(r.kind==="mdis") setModBlock(r.id); openRx(r.id); return; }
  if(currentView!=="mapa") go("mapa");
  if(r.kind==="node"){ openNode(r.id); const [x,y]=L[r.id]; focusXY(x,y,700); }
  else { if(r.kind==="dis") setBlock(r.id); openRx(r.id); const E=EDGES.find(e=>e.r.id===r.id); const [x,y]=pointAt(E.g,E.g.len/2); focusXY(x,y,760); } }

/* ======================= Reto ======================= */
let quiz=null;
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function newQuiz(){
  const dis=shuffle(RX.filter(r=>r.regulation&&r.regulation.clinical)).slice(0,6).map(r=>({kind:"rx",id:r.id,prompt:`¿Qué enzima falla en «${r.regulation.clinical.diseaseName}»?`,hint:"Toca la flecha de la reacción en el mapa."}));
  const keyQ=[
    {kind:"rx",id:"rx_pfk1",prompt:"Señala el paso limitante y principal punto de control de la glucólisis.",hint:"Lo activa la fructosa-2,6-bisfosfato."},
    {kind:"rx",id:"rx_g6pdh",prompt:"¿Qué reacción genera el primer NADPH de la ruta de las pentosas fosfato?",hint:"Está en la rama que sale de G-6-P hacia arriba."},
    {kind:"rx",id:"rx_cpt1",prompt:"¿Qué enzima inhibe el malonil-CoA para que no se oxiden los ácidos grasos recién sintetizados?",hint:"Está en la membrana mitocondrial externa."},
    {kind:"rx",id:"rx_pyruvate_carboxylase",prompt:"¿Qué enzima mitocondrial, activada por acetil-CoA, inicia la gluconeogénesis desde piruvato?",hint:"Necesita biotina."},
    {kind:"node",id:"g6p",prompt:"Encuentra el metabolito que reparte la glucosa entre glucólisis, pentosas y glucógeno.",hint:"Es una encrucijada de 6 carbonos."},
    {kind:"node",id:"acetyl_coa",prompt:"Encuentra el metabolito donde convergen glucosa, ácidos grasos y cuerpos cetónicos.",hint:"Tiene 2 carbonos y está en la matriz."},
    {kind:"node",id:"oxaloacetate",prompt:"Encuentra el metabolito que se condensa con el acetil-CoA para formar citrato.",hint:"4 carbonos, en el ciclo."},
    {kind:"node",id:"udpg",prompt:"Encuentra la forma activada de glucosa que usa la glucógeno sintasa.",hint:"Lleva un nucleótido de uridina."},
    {kind:"rx",id:"rx_ldh",prompt:"¿Qué enzima regenera el NAD⁺ citosólico cuando falta oxígeno?",hint:"Produce lactato."}
  ];
  const qs=shuffle(dis.concat(shuffle(keyQ).slice(0,4)));
  quiz={qs,i:0,score:0,res:[],reveal:false,done:false,streak:0};
  focusPw=null; syncChips(); setBlock(null); closePanel(); animVB(fitBox()); renderQuiz();
}
function renderQuiz(){
  const Q=$("#quiz"); if(!quiz){ Q.hidden=true; return; } Q.hidden=false;
  if(quiz.done){ const pct=Math.round(quiz.score/quiz.qs.length*100);
    Q.innerHTML=`<div class="quiz-top"><span class="eyebrow">Reto terminado</span></div><div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap"><span class="big-score">${quiz.score}<span style="font-size:24px;color:var(--fg-faint)">/${quiz.qs.length}</span></span><p style="margin:0;color:var(--fg-dim);max-width:40ch">${pct>=80?"Dominas el mapa: ya puedes cambiar de estado fisiológico y repetir.":pct>=50?"Buen nivel. Repasa las enzimas que fallaste abriendo su ficha.":"Explora el mapa un rato y vuelve a intentarlo."}</p></div><div class="row"><button class="btn pri" id="qz-again">Otro reto</button><button class="btn" id="qz-exit">Volver al mapa</button></div>`;
    $("#qz-again").onclick=newQuiz; $("#qz-exit").onclick=()=>go("mapa"); return; }
  const q=quiz.qs[quiz.i];
  const prog=quiz.qs.map((_,i)=>`<i class="${i<quiz.res.length?(quiz.res[i]?"ok":"ko"):i===quiz.i?"cur":""}"></i>`).join("");
  let fb=`<div class="fb">${esc(q.hint)}</div>`;
  if(quiz.reveal){ const name = q.kind==="rx"? RXM[q.id].enzymeName : MET[q.id].name;
    fb=`<div class="fb">${quiz.lastOk?`<b class="ok">Correcto.</b> `:`<b class="ko">No era esa.</b> La respuesta es `}<b>${esc(name)}</b>. Su ficha está abierta en el panel.</div><div class="row"><button class="btn pri" id="qz-next">${quiz.i+1<quiz.qs.length?"Siguiente":"Ver resultado"}</button></div>`; }
  Q.innerHTML=`<div class="quiz-top"><span class="eyebrow">Pregunta ${quiz.i+1} de ${quiz.qs.length}</span><span class="prog">${prog}</span><span class="score">${quiz.score} aciertos${quiz.streak>1?` · racha ${quiz.streak}`:""}</span></div><q>${esc(q.prompt)}</q>${fb}`;
  const n=$("#qz-next"); if(n) n.onclick=()=>{ quiz.reveal=false; quiz.i++; if(quiz.i>=quiz.qs.length) quiz.done=true; closePanel(); animVB(fitBox()); drawFx(); renderQuiz(); };
}
function answer(kind,id){
  const q=quiz.qs[quiz.i]; const ok = kind===q.kind && id===q.id;
  quiz.lastOk=ok; quiz.res.push(ok); if(ok){quiz.score++;quiz.streak++;} else quiz.streak=0; quiz.reveal=true;
  if(q.kind==="rx"){ openRx(q.id); const E=EDGES.find(e=>e.r.id===q.id); const [x,y]=pointAt(E.g,E.g.len/2); focusXY(x,y,900); }
  else { openNode(q.id); const [x,y]=L[q.id]; focusXY(x,y,900); }
  drawFx(); renderQuiz(); toast(ok?"¡Acierto!":"Fallo: mira dónde estaba");
}

/* ======================= Balances ======================= */
const BAL=D.SUBSTRATE_ENERGY_BALANCES; let balSel="glucose_aerobic", shuttle="mas";
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
  const n=cytNADH(b); if(!n || shuttle==="mas") return b;
  const c=JSON.parse(JSON.stringify(b)); const loss=n*1; c.aerobicAtpNet=b.aerobicAtpNet-loss;
  const etc=[...c.steps].reverse().find(s=>s.compartment==="mitochondria_membrane"&&s.atpDelta>0);
  c.tissue=c.tissue.replace(/\s*\(Lanzadera[^)]*\)/i,"");
  c.steps.forEach(st=>{ st.note=st.note.replace("valen ~5 ATP vía lanzadera malato-aspartato y Complejo I","valen ~3 ATP vía lanzadera del glicerol-3-P y CoQ"); });
  if(etc){ etc.atpDelta-=loss; etc.note+=` Con la lanzadera del glicerol-3-P los ${n} NADH citosólicos rinden 1,5 ATP en vez de 2,5: −${loss} ATP.`; }
  return c;
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
    <div class="shuttle-sel"><span class="eyebrow">Lanzadera del NADH citosólico · ATP por NADH</span><div class="seg" role="group" aria-label="Lanzadera"><button data-sh="mas" aria-pressed="${shuttle==="mas"}">Malato-aspartato · 2,5</button><button data-sh="g3p" aria-pressed="${shuttle==="g3p"}">Glicerol-3-P · 1,5</button></div></div>
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
  document.querySelectorAll("[data-sh]").forEach(x=>x.onclick=()=>{ shuttle=x.dataset.sh; const sc=$("#view-balances").scrollTop; renderBalances(); $("#view-balances").scrollTop=sc; });
  document.querySelectorAll("[data-open-sh]").forEach(x=>x.onclick=()=>openModule(x.dataset.openSh));
  document.querySelectorAll(".sub,.cmp-row").forEach(x=>x.addEventListener("click",()=>{ balSel=x.dataset.id; const sc=$("#view-balances").scrollTop; renderBalances(); $("#view-balances").scrollTop=sc; }));
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
 g_c4:{name:"Complejo IV",abbreviation:"Complejo IV",carbons:0,compartment:"mitochondria_membrane",pw:"electron_transport",description:"Citocromo c oxidasa: reduce el O₂ a H₂O y bombea 2 H⁺ por par de electrones."}
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
  pathWayNotes:"PASO LIMITANTE DEL CICLO. No confundir con la CPS2 citosólica, que usa glutamina y fabrica pirimidinas.",
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
  pathWayNotes:"PASO LIMITANTE DE LA CETOGÉNESIS. Se expresa casi solo en el hígado (y en el epitelio intestinal del recién nacido).",
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
  pathWayNotes:"PASO CLAVE DE LA CETÓLISIS. Toma el CoA del succinil-CoA, que así no rinde su GTP en el ciclo de Krebs. El hígado no la expresa.",
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
  pathWayNotes:"Igual que el complejo II, la GPD2 no bombea protones. Por eso cada NADH citosólico rinde ≈1,5 ATP en lugar de ≈2,5."}
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
  bg:`<rect x="40" y="40" width="380" height="640" rx="44" class="mx-box"/><text class="comp-lbl" x="70" y="80">MÚSCULO EN ESFUERZO · ERITROCITO<\/text>
   <rect x="470" y="30" width="260" height="660" rx="30" class="mx-blood"/><text class="comp-lbl" x="600" y="70" text-anchor="middle" style="fill:var(--danger);opacity:.7">SANGRE<\/text>
   <g class="mx-rbc"><ellipse cx="520" cy="300" rx="16" ry="9"/><ellipse cx="680" cy="250" rx="16" ry="9"/><ellipse cx="545" cy="660" rx="16" ry="9"/><ellipse cx="690" cy="380" rx="16" ry="9"/><ellipse cx="510" cy="420" rx="16" ry="9"/><\/g>
   <rect x="780" y="40" width="380" height="640" rx="44" class="mx-box"/><text class="comp-lbl" x="1130" y="80" text-anchor="end">HÍGADO<\/text>`,
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
   <text class="comp-lbl" x="70" y="700" style="fill:var(--mito-lbl)">MATRIZ MITOCONDRIAL<\/text>
   <text class="comp-lbl" x="560" y="720">CITOSOL DEL HEPATOCITO<\/text>
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
  bg:`<rect x="30" y="40" width="440" height="700" rx="40" class="mx-box"/><text class="comp-lbl" x="56" y="74">HÍGADO<\/text>
   <rect x="56" y="96" width="390" height="624" rx="50" class="mx-mito"/><text class="comp-lbl" x="426" y="708" text-anchor="end" style="fill:var(--mito-lbl)">MITOCONDRIA<\/text>
   <text class="lbl-c" x="250" y="760" text-anchor="middle">Sin SCOT: el hígado fabrica cuerpos cetónicos, pero no los usa<\/text>
   <text class="lbl-c" x="140" y="540" text-anchor="middle">→ aliento afrutado<\/text>
   <rect x="500" y="30" width="200" height="720" rx="30" class="mx-blood"/><text class="comp-lbl" x="600" y="70" text-anchor="middle" style="fill:var(--danger);opacity:.7">SANGRE<\/text>
   <g class="mx-rbc"><ellipse cx="540" cy="260" rx="16" ry="9"/><ellipse cx="660" cy="200" rx="16" ry="9"/><ellipse cx="560" cy="420" rx="16" ry="9"/><ellipse cx="655" cy="480" rx="16" ry="9"/><\/g>
   <rect x="730" y="40" width="440" height="700" rx="40" class="mx-box"/><text class="comp-lbl" x="1146" y="74" text-anchor="end">CEREBRO · CORAZÓN · MÚSCULO<\/text>
   <rect x="756" y="96" width="390" height="624" rx="50" class="mx-mito"/><text class="comp-lbl" x="1126" y="124" text-anchor="end" style="fill:var(--mito-lbl)">MITOCONDRIA<\/text>`,
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
  bg:`<rect x="20" y="20" width="960" height="320" rx="24" class="mx-box"/><text class="comp-lbl" x="44" y="320">CITOSOL<\/text>
   <rect x="20" y="350" width="960" height="70" rx="14" class="mx-membrane"/><text class="comp-lbl" x="500" y="392" text-anchor="middle">MEMBRANA MITOCONDRIAL INTERNA<\/text>
   <rect x="20" y="430" width="960" height="310" rx="24" class="mx-mito"/><text class="comp-lbl" x="44" y="460" style="fill:var(--mito-lbl)">MATRIZ<\/text>
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
  bg:`<rect x="20" y="20" width="1060" height="270" rx="24" class="mx-box"/><text class="comp-lbl" x="44" y="276">CITOSOL<\/text>
   <line x1="20" y1="300" x2="1080" y2="300" class="mx-outer"/><text class="lbl-c" x="44" y="320">membrana externa (porosa)<\/text>
   <text class="comp-lbl" x="44" y="372">ESPACIO INTERMEMBRANA<\/text>
   <rect x="20" y="392" width="1060" height="56" rx="12" class="mx-membrane"/><text class="lbl-c" x="44" y="426">membrana interna<\/text>
   <rect x="20" y="458" width="1060" height="222" rx="24" class="mx-mito"/><text class="comp-lbl" x="44" y="490" style="fill:var(--mito-lbl)">MATRIZ<\/text>
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
  facts:["Predomina en el músculo esquelético rápido, el cerebro y la grasa parda.","El Ca²⁺ de la contracción activa la GPD2.","La DHAP regenerada vuelve a la glucólisis o a la síntesis de lípidos."]}
];
const MODM = Object.fromEntries(MODULES.map(m=>[m.id,m]));
/* portales desde el mapa celular */
const PORTAL = {ketone_bodies:"keto",rx_ketogenesis:"keto",rx_malate_aspartate_shuttle:"mas",malate_shuttle_hub:"mas",lactate_cyt:"cori",rx_ldh:"cori",rx_gpd1:"g3p",glycerol_3p:"g3p",fumarate:"urea",rx_pyruvate_carboxylase:"cori"};

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
  msvg.innerHTML = `<defs>${Object.entries(PW).map(([k,v])=>`<marker id="mm-${k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.4" markerHeight="4.4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${v.c}"/></marker>`).join("")}<marker id="mm-e" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--pw-etc)"/></marker><filter id="msoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter></defs>
   <g>${m.bg}</g><g id="m-edges"></g><g id="m-hits"></g><g id="m-part"></g><g id="m-tags"></g><g id="m-nodes"></g><g>${m.fg||""}</g><g id="m-fx"></g>`;
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
  const dis=[...new Set(MEDGES.map(E=>E.rxid))].map(id=>RXM[id]).filter(r=>r&&r.module&&r.regulation&&r.regulation.clinical);
  $("#mod-info").innerHTML = `<div><div class="eyebrow">${esc(m.kicker)}<\/div><h2 class="mod-h">${esc(m.title)}<\/h2><p class="mod-p">${esc(m.intro)}<\/p><\/div>
   <p class="enz-legend"><b>★<\/b> paso regulador · <span class="dz">●<\/span> enfermedad asociada · toca cualquier enzima para abrir su ficha<\/p>
   ${m.variants?`<div class="seg" role="group" aria-label="Variante">${m.variants.map(v=>`<button data-var="${v.id}" aria-pressed="${v.id===modVar}">${esc(v.label)}<\/button>`).join("")}<\/div>`:""}
   <div class="player"><div class="row"><button class="btn" id="mp-prev" aria-label="Paso anterior">‹<\/button><button class="btn pri" id="mp-play">${modTimer?"Pausar":"Reproducir paso a paso"}<\/button><button class="btn" id="mp-next" aria-label="Paso siguiente">›<\/button><span class="mono" style="margin-left:auto;font-size:11px;color:var(--fg-faint)">${modStep<0?`${steps.length} pasos`:`Paso ${modStep+1} de ${steps.length}`}<\/span><\/div>
    <div class="dots">${steps.map((_,i)=>`<button data-step="${i}" aria-label="Paso ${i+1}" class="${i===modStep?"on":i<modStep?"done":""}"><\/button>`).join("")}<\/div>
    <p>${st?esc(st.t):"Pulsa <b>Reproducir<\/b> para recorrer el proceso, o toca cualquier flecha para abrir la ficha de su enzima."}<\/p>
    ${modStep>=0?`<button class="lnk-btn" id="mp-all">Ver el esquema completo<\/button>`:""}<\/div>
   <div><div class="eyebrow" style="margin-bottom:8px">Balance<\/div><div class="ledger">${modLedger().map(([k,v,c])=>`<div><span>${esc(k)}<\/span><b class="${c}">${esc(v)}<\/b><\/div>`).join("")}<\/div><\/div>
   <div><div class="eyebrow" style="margin-bottom:8px">Claves<\/div><ul class="notes" style="--sc:${m.c}">${m.facts.map(f=>`<li>${esc(f)}<\/li>`).join("")}<\/ul><\/div>
   ${dis.length?`<div><div class="eyebrow" style="margin-bottom:8px">Simular un déficit<\/div><div class="rxlist">${dis.map(r=>`<button data-dis="${r.id}" ${modBlock===r.id?'style="border-color:var(--danger)"':""}><span class="dot" style="color:var(--danger)"><\/span><span>${esc(r.regulation.clinical.diseaseName)}<\/span><small>${esc(r.enzymeAbbreviation)}<\/small><\/button>`).join("")}${modBlock?`<button data-dis=""><span>Quitar el déficit<\/span><\/button>`:""}<\/div><\/div>`:""}`;
  const I=$("#mod-info");
  I.querySelectorAll("[data-var]").forEach(b=>b.onclick=()=>{ modVar=b.dataset.var; modStep=-1; stopPlay(); modBlock=null; renderModule(); });
  I.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{ stopPlay(); setStep(+b.dataset.step); });
  $("#mp-prev").onclick=()=>{ stopPlay(); setStep(modStep<=0? steps.length-1 : modStep-1); };
  $("#mp-next").onclick=()=>{ stopPlay(); setStep(modStep>=steps.length-1? -1 : modStep+1); };
  $("#mp-play").onclick=()=>{ if(modTimer){ stopPlay(); renderModInfo(); return; } if(modStep>=steps.length-1||modStep<0) modStep=-1; modTimer=setInterval(()=>{ if(modStep>=modSteps().length-1){ stopPlay(); setStep(-1); return; } setStep(modStep+1); }, 3800); setStep(modStep+1); };
  const all=$("#mp-all"); if(all) all.onclick=()=>{ stopPlay(); setStep(-1); };
  I.querySelectorAll("[data-dis]").forEach(b=>b.onclick=()=>{ setModBlock(b.dataset.dis||null); if(b.dataset.dis) openRx(b.dataset.dis); });
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
  [["cori","Ciclo de Cori",300,1160],["urea","Ciclo de la urea",1430,1128],["keto","Cuerpos cetónicos",935,790],["mas","Lanzadera malato-aspartato",653,878],["g3p","Lanzadera del glicerol-3-P",880,700]].forEach(([id,label,x,y])=>{
    const w=label.length*7.7+34; const g=el("g",{class:"portal",transform:`translate(${x} ${y})`,tabindex:"0",role:"button","aria-label":"Abrir "+label},gP);
    const r=el("rect",{x:0,y:-15,width:w,height:30,rx:15},g); r.style.stroke=MODM[id].c;
    const t=el("text",{x:16,y:5,class:"portal-t"},g); t.textContent="↗ "+label;
    g.addEventListener("click",()=>{ if(!dragMoved) openModule(id); }); g.addEventListener("keydown",e=>{ if(e.key==="Enter"){ openModule(id);} });
  });
})();

/* ======================= Vistas ======================= */
let currentView="mapa";
function go(v){ if(!["mapa","balances","reto","ciclos"].includes(v)) v="mapa"; const prev=currentView; currentView=v;
  document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.view===v)));
  $("#view-mapa").hidden = v==="balances"||v==="ciclos"; $("#view-balances").hidden = v!=="balances"; $("#view-ciclos").hidden = v!=="ciclos";
  $("#stage").classList.toggle("flow", v==="balances"||v==="ciclos");
  $(".body").classList.toggle("norail", v==="balances"||v==="ciclos");
  if(v!==prev) closePanel();
  if(v==="balances"){ renderBalances(); }
  if(v==="ciclos"){ renderModule(); } else stopPlay();
  if(v==="reto"){ if(!quiz||quiz.done) newQuiz(); else renderQuiz(); }
  else { $("#quiz").hidden=true; if(quiz){ quiz=null; drawFx(); } }
  drawHud();
  if(location.hash.slice(1)!==v) history.replaceState(null,"","#"+v);
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>go(b.dataset.view));
window.addEventListener("hashchange",()=>go(location.hash.slice(1)));

let tt; function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),1800); }

IDX = IDX.concat(
  Object.keys(MNODES).map(id=>({kind:"mnode",id,label:MET[id].name,c:PW[MET[id].pathways[0]].c,txt:(MET[id].name+" "+MET[id].abbreviation).toLowerCase()})),
  MRX_LIST.map(r=>({kind:"mrx",id:r.id,label:r.enzymeName,c:PW[r.pathway].c,txt:(r.enzymeName+" "+r.enzymeAbbreviation+" "+r.name).toLowerCase()})),
  MRX_LIST.filter(r=>r.regulation&&r.regulation.clinical).map(r=>({kind:"mdis",id:r.id,label:r.regulation.clinical.diseaseName,c:"var(--danger)",txt:r.regulation.clinical.diseaseName.toLowerCase()})),
  MODULES.map(m=>({kind:"mod",id:m.id,label:m.title,c:m.c,txt:(m.title+" "+m.kicker).toLowerCase()})));
/* modo claro / oscuro */
const SUN='<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9L13 13M3 13l1.1-1.1M11.9 4.1L13 3"/></g></svg>';
const MOON='<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" fill="currentColor"/></svg>';
function setMode(m){ document.documentElement.dataset.mode=m; const b=$("#mode"); b.innerHTML = m==="dark"? SUN : MOON; b.setAttribute("aria-label", m==="dark"?"Cambiar a modo claro":"Cambiar a modo oscuro"); b.title=b.getAttribute("aria-label");
  try{ localStorage.setItem("metabolix-mode",m); }catch(e){} apply(); if(MEDGES.length) modApply(); }
$("#mode").onclick=()=>setMode(document.documentElement.dataset.mode==="dark"?"light":"dark");
let m0="light"; try{ m0=localStorage.getItem("metabolix-mode")||"light"; }catch(e){}
/* arranque */
cssify(document.querySelector(".app"));
buildRail(); renderStateInfo(); setMode(m0);
go(location.hash.slice(1)||"mapa");
Object.assign(VB, fitBox()); setVB();

}
