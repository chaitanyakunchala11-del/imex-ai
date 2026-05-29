import { useState, useEffect } from "react";

const COUNTRIES = {
  AU:"Australia", US:"United States", IN:"India", GB:"United Kingdom",
  CN:"China", DE:"Germany", FR:"France", IT:"Italy", BR:"Brazil",
  CA:"Canada", JP:"Japan", VN:"Vietnam", BD:"Bangladesh", TR:"Turkey",
  TH:"Thailand", ID:"Indonesia", TW:"Taiwan", SG:"Singapore", AE:"UAE",
};

const CURRENCIES = {
  AUD:{ symbol:"A$", rate:1.53, name:"Australian Dollar" },
  USD:{ symbol:"US$", rate:1.00, name:"US Dollar" },
  INR:{ symbol:"₹", rate:83.1, name:"Indian Rupee" },
  GBP:{ symbol:"£", rate:0.79, name:"British Pound" },
  EUR:{ symbol:"€", rate:0.92, name:"Euro" },
  CNY:{ symbol:"¥", rate:7.24, name:"Chinese Yuan" },
  BRL:{ symbol:"R$", rate:5.05, name:"Brazilian Real" },
  CAD:{ symbol:"C$", rate:1.36, name:"Canadian Dollar" },
  JPY:{ symbol:"¥", rate:149.5, name:"Japanese Yen" },
  SGD:{ symbol:"S$", rate:1.34, name:"Singapore Dollar" },
};

const DEST_CURRENCY = {
  AU:"AUD", US:"USD", IN:"INR", GB:"GBP", DE:"EUR", FR:"EUR",
  IT:"EUR", BR:"BRL", CA:"CAD", JP:"JPY", CN:"CNY", SG:"SGD",
};

const DISPLAY_CURRENCIES = ["AUD","USD","INR","GBP","EUR"];

const PRODUCT_CATEGORIES = [
  { value:"general", label:"General Goods" },
  { value:"electronics", label:"Electronics" },
  { value:"textiles", label:"Textiles / Clothing" },
  { value:"food_spices", label:"Food / Spices" },
  { value:"coffee_tea", label:"Coffee / Tea" },
  { value:"fresh_produce", label:"Fresh Fruit / Vegetables" },
  { value:"cosmetics", label:"Cosmetics" },
  { value:"machinery", label:"Machinery" },
  { value:"chemicals", label:"Chemicals" },
  { value:"ceramics", label:"Ceramics / Glassware" },
  { value:"furniture", label:"Furniture" },
  { value:"toys", label:"Toys / Games" },
  { value:"timber", label:"Timber / Wood Products" },
  { value:"animal_products", label:"Animal Products" },
  { value:"plant_products", label:"Plant Products / Seeds" },
  { value:"agricultural", label:"Agricultural Goods" },
];

const BIO_CATEGORIES = ["food_spices","coffee_tea","fresh_produce","timber","animal_products","plant_products","agricultural","chemicals"];
const FOOD_AG_CATEGORIES = ["food_spices","coffee_tea","fresh_produce","agricultural","plant_products","animal_products","timber"];

const INCOTERMS = [
  { value:"EXW", label:"EXW – Ex Works",
    sea:"Seller makes goods available at their premises. Buyer arranges all sea freight, insurance, export/import customs and destination charges. Highest buyer responsibility.",
    air:"Seller makes goods available at their premises. Buyer arranges all air freight, insurance, export/import customs and destination charges. Highest buyer responsibility.",
    courier:"Seller makes goods available at their premises. Buyer's courier collects and handles all freight, customs and destination charges.",
    road:"Seller makes goods available at their premises. Buyer arranges all road/rail freight, insurance and customs. Highest buyer responsibility." },
  { value:"FOB", label:"FOB – Free on Board",
    sea:"Seller delivers goods to the origin port and clears for export. Buyer pays international sea freight, insurance, import duties, GST/taxes and all destination charges.",
    air:"Seller delivers goods to the origin airport and clears for export. Buyer pays international air freight, insurance, import duties, GST/taxes and destination charges.",
    courier:"Seller hands goods to the courier at the origin dispatch point. Buyer pays international courier freight, insurance, import duties, GST/taxes and destination charges.",
    road:"Seller delivers goods to the origin border/depot. Buyer pays onward road/rail freight, insurance, import duties, GST/taxes and destination charges." },
  { value:"CIF", label:"CIF – Cost Insurance Freight",
    sea:"Seller pays sea freight and insurance to the destination port. Buyer pays import duties, GST/taxes, port handling and local delivery charges on arrival.",
    air:"Seller pays air freight and insurance to the destination airport (CIP equivalent). Buyer pays import duties, taxes and charges from the destination airport.",
    courier:"Seller pays courier freight and insurance to the destination. Buyer pays import duties, GST/taxes and any local clearance charges on arrival.",
    road:"Seller pays road/rail freight and insurance to the destination point. Buyer pays import duties, GST/taxes and local charges on arrival." },
  { value:"DAP", label:"DAP – Delivered at Place",
    sea:"Seller arranges sea freight and delivers to the named destination. Buyer is responsible for import duties, GST/taxes, customs clearance and unloading.",
    air:"Seller arranges air freight and delivers to the named destination. Buyer is responsible for import duties, GST/taxes and customs clearance.",
    courier:"Seller sends via courier to the named destination address. Buyer is responsible for import duties, GST/taxes and customs clearance on delivery.",
    road:"Seller delivers by road/rail to the named destination. Buyer is responsible for import duties, GST/taxes and customs clearance." },
  { value:"DDP", label:"DDP – Delivered Duty Paid",
    sea:"Seller pays all costs — sea freight, insurance, import duties, GST/taxes and delivery to destination. Buyer receives cleared goods with no additional import costs.",
    air:"Seller pays all costs — air freight, insurance, import duties, GST/taxes and delivery to destination. Buyer receives cleared goods at door.",
    courier:"Seller pays all costs via courier including duties and taxes. Buyer receives cleared goods with no additional import charges.",
    road:"Seller pays all road/rail freight, insurance, import duties and taxes. Buyer receives cleared goods at named destination with no additional costs." },
];

const SHIP_MODES = [
  { value:"sea", label:"Sea Freight" },
  { value:"air", label:"Air Freight" },
  { value:"courier", label:"Courier / Express" },
  { value:"road", label:"Road / Rail" },
];

const HS_CODES = {
  general:{ code:null, label:"Unknown / Needs classification" },
  electronics:{ code:"8471.30", label:"8471.30 – Computers / Electronics" },
  textiles:{ code:"6109.10", label:"6109.10 – T-shirts / Cotton Knit" },
  food_spices:{ code:"0910.99", label:"0910.99 – Spices (mixed)" },
  coffee_tea:{ code:"0902.10", label:"0902.10 – Tea / Coffee" },
  fresh_produce:{ code:"0804.50", label:"0804.50 – Fresh Fruit / Veg" },
  cosmetics:{ code:"3304.99", label:"3304.99 – Cosmetics / Beauty" },
  machinery:{ code:"8479.89", label:"8479.89 – Industrial Machinery" },
  chemicals:{ code:"3906.90", label:"3906.90 – Chemicals / Polymers" },
  ceramics:{ code:"6912.00", label:"6912.00 – Ceramic Tableware" },
  furniture:{ code:"9403.20", label:"9403.20 – Furniture" },
  toys:{ code:"9503.00", label:"9503.00 – Toys / Games" },
  timber:{ code:"4407.10", label:"4407.10 – Sawn Timber / Wood" },
  animal_products:{ code:"0511.99", label:"0511.99 – Animal Products (misc.)" },
  plant_products:{ code:"0602.90", label:"0602.90 – Plants / Seeds" },
  agricultural:{ code:"1001.99", label:"1001.99 – Agricultural Goods (est.)" },
};

const DUTY_RATES = {
  AU:{
    IN:{ general:0.05,electronics:0.0,textiles:0.05,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.05,machinery:0.0,chemicals:0.05,ceramics:0.05,furniture:0.05,toys:0.0,timber:0.05,animal_products:0.0,plant_products:0.05,agricultural:0.05 },
    CN:{ general:0.05,electronics:0.0,textiles:0.05,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.05,machinery:0.0,chemicals:0.05,ceramics:0.05,furniture:0.05,toys:0.0,timber:0.05,animal_products:0.0,plant_products:0.05,agricultural:0.05 },
    _default:{ general:0.05,electronics:0.0,textiles:0.05,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.05,machinery:0.0,chemicals:0.05,ceramics:0.05,furniture:0.05,toys:0.0,timber:0.05,animal_products:0.0,plant_products:0.05,agricultural:0.05 },
  },
  US:{
    CN:{ general:0.075,electronics:0.075,textiles:0.17,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.065,machinery:0.025,chemicals:0.065,ceramics:0.088,furniture:0.0,toys:0.0,timber:0.03,animal_products:0.02,plant_products:0.04,agricultural:0.05 },
    IN:{ general:0.065,electronics:0.0,textiles:0.12,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.065,machinery:0.025,chemicals:0.065,ceramics:0.06,furniture:0.0,toys:0.0,timber:0.03,animal_products:0.02,plant_products:0.04,agricultural:0.05 },
    _default:{ general:0.065,electronics:0.0,textiles:0.12,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.065,machinery:0.025,chemicals:0.065,ceramics:0.06,furniture:0.0,toys:0.0,timber:0.03,animal_products:0.02,plant_products:0.04,agricultural:0.05 },
  },
  IN:{
    _default:{ general:0.10,electronics:0.20,textiles:0.20,food_spices:0.30,coffee_tea:0.10,fresh_produce:0.30,cosmetics:0.20,machinery:0.075,chemicals:0.10,ceramics:0.10,furniture:0.25,toys:0.60,timber:0.10,animal_products:0.30,plant_products:0.10,agricultural:0.30 },
  },
  GB:{
    IN:{ general:0.04,electronics:0.0,textiles:0.12,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.065,machinery:0.0,chemicals:0.065,ceramics:0.12,furniture:0.0,toys:0.0,timber:0.03,animal_products:0.02,plant_products:0.04,agricultural:0.05 },
    CN:{ general:0.04,electronics:0.0,textiles:0.12,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.065,machinery:0.0,chemicals:0.065,ceramics:0.12,furniture:0.0,toys:0.0,timber:0.03,animal_products:0.02,plant_products:0.04,agricultural:0.05 },
    _default:{ general:0.04,electronics:0.0,textiles:0.12,food_spices:0.05,coffee_tea:0.0,fresh_produce:0.05,cosmetics:0.065,machinery:0.0,chemicals:0.065,ceramics:0.12,furniture:0.0,toys:0.0,timber:0.03,animal_products:0.02,plant_products:0.04,agricultural:0.05 },
  },
  _default:{
    _default:{ general:0.05,electronics:0.05,textiles:0.10,food_spices:0.08,coffee_tea:0.05,fresh_produce:0.08,cosmetics:0.07,machinery:0.03,chemicals:0.07,ceramics:0.07,furniture:0.05,toys:0.05,timber:0.05,animal_products:0.05,plant_products:0.05,agricultural:0.05 },
  },
};

function getDutyRate(dest, origin, category) {
  const d = DUTY_RATES[dest] || DUTY_RATES._default;
  const o = d[origin] || d._default || DUTY_RATES._default._default;
  return o[category] ?? o.general ?? 0.05;
}

function calcDestTax(dest, category, cifValue, dutyAmt, shipMode) {
  if (dest === "AU") {
    const gst = (cifValue + dutyAmt) * 0.10;
    return { lines:[{ label:"GST 10% (on CIF + Duty)", amount:gst, note:"Australian Goods and Services Tax — applied on customs value + duty + freight + insurance" }], total:gst };
  }
  if (dest === "US") {
    const mpf = Math.min(Math.max(cifValue * 0.003464, 29.66), 575.35);
    const hmf = shipMode === "sea" ? cifValue * 0.00125 : 0;
    return {
      lines:[
        { label:"Merchandise Processing Fee (MPF)", amount:mpf, note:"0.3464% of value — min US$29.66, max US$575.35" },
        ...(hmf > 0 ? [{ label:"Harbor Maintenance Fee (HMF)", amount:hmf, note:"0.125% for sea freight imports" }] : []),
        { label:"No Import VAT / GST for USA", amount:0, note:"State sales tax may apply at point of sale — this is not an import tax" },
      ],
      total:mpf + hmf,
    };
  }
  if (dest === "GB") {
    const vat = (cifValue + dutyAmt) * 0.20;
    return { lines:[{ label:"UK VAT 20%", amount:vat, note:"Applied on CIF value + import duty" }], total:vat };
  }
  if (dest === "IN") {
    const sws = dutyAmt * 0.10;
    const igstRate = ["electronics","cosmetics"].includes(category) ? 0.18 : ["food_spices","coffee_tea","fresh_produce","agricultural"].includes(category) ? 0.05 : 0.12;
    const igst = (cifValue + dutyAmt + sws) * igstRate;
    return {
      lines:[
        { label:"Social Welfare Surcharge (SWS)", amount:sws, note:"10% on Basic Customs Duty" },
        { label:`IGST ${(igstRate*100).toFixed(0)}% (Integrated GST)`, amount:igst, note:"Applied on CIF + BCD + SWS" },
      ],
      total:sws + igst,
    };
  }
  const vatRates = { DE:0.19,FR:0.20,IT:0.22,BR:0.12,CA:0.05,JP:0.10,CN:0.13,SG:0.09 };
  const rate = vatRates[dest] || 0.10;
  if (rate === 0) return { lines:[], total:0 };
  const vat = (cifValue + dutyAmt) * rate;
  return { lines:[{ label:`VAT / Import Tax (${(rate*100).toFixed(0)}%)`, amount:vat, note:"Applied on CIF + duty" }], total:vat };
}

function calcFreight(mode, weightKg, origin, dest) {
  const ROUTES = { "IN-AU":1.1,"AU-IN":1.1,"CN-AU":1.0,"IN-US":1.05,"CN-US":1.0,"IN-GB":0.95,"AU-US":1.0 };
  const key = `${origin}-${dest}`;
  const factor = ROUTES[key] || ROUTES[`${dest}-${origin}`] || 0.85;
  const rates = { sea:2.8,air:9.0,courier:22,road:2.0 };
  const mins  = { sea:380,air:160,courier:55,road:90 };
  return Math.max(mins[mode]||100, (rates[mode]||3)*weightKg*factor);
}

function getShipWarnings(mode, weightKg) {
  const w = [];
  if (mode==="sea" && weightKg < 1) w.push("⚠ Sea freight for under 1 kg is not practical. Minimum charges will far exceed freight value. Use Courier instead.");
  else if (mode==="sea" && weightKg < 20) w.push("⚠ Courier or air freight is recommended for this shipment size. Sea freight may have high minimum charges that significantly increase your landed cost per unit for shipments under 20 kg.");
  else if (mode==="sea" && weightKg < 100) w.push("⚠ Sea freight minimum charges apply for shipments under 100 kg. Consider Air Freight or Courier unless this cargo is non-urgent.");
  if (mode==="courier" && weightKg > 70) w.push("⚠ Courier is not recommended above 70 kg — switch to Air Freight or Sea Freight.");
  if (mode==="air" && weightKg > 500) w.push("⚠ Air freight for 500+ kg will be very expensive. Sea Freight is strongly recommended for heavy non-urgent cargo.");
  if (mode==="air" && weightKg > 100 && weightKg <= 500) w.push("Consider Sea Freight if this shipment is non-urgent — air freight costs increase significantly above 100 kg.");
  return w;
}

function getShipRec(weightKg) {
  if (weightKg < 20)  return "Weight under 20 kg — Courier or Air Freight is strongly recommended. Sea freight minimum charges make it uneconomical at this weight.";
  if (weightKg < 100) return "Weight 20–100 kg — Air Freight or Courier is likely better unless the shipment is non-urgent.";
  if (weightKg < 500) return "Weight 100–500 kg — Sea or Air Freight both viable. Choose Sea for non-urgent cargo to save on freight costs.";
  return "Weight over 500 kg — Sea Freight strongly recommended for non-urgent heavy cargo.";
}

function getConfidence(hsInfo, category, incoterm, dest, origin, shipMode) {
  if (!hsInfo.code)
    return { level:"Low", color:"#c07070", desc:"HS code is unknown — duty rate is a rough estimate only. Verify classification with a licensed customs broker before shipping." };
  if (hsInfo.code && category !== "general" && incoterm && dest && origin && shipMode)
    return { level:"High", color:"#60c890", desc:"HS code, product category, incoterm, route and freight mode all provided. Estimates are more reliable — still confirm with a broker." };
  return { level:"Medium", color:"#c8a96e", desc:"Product category, route and freight mode known. HS code is estimated — confirm classification before shipping." };
}

function getComplianceWarnings(dest, category) {
  const isBio = BIO_CATEGORIES.includes(category);
  const isFoodAg = FOOD_AG_CATEGORIES.includes(category);
  const w = ["Check customs, biosecurity, food safety, labelling and import permit requirements before shipping."];
  if (dest==="AU") {
    w.push("All imports into Australia must comply with DAFF (BICON) biosecurity requirements.");
    if (isBio) {
      w.push("Food, plant, timber, animal and agricultural products may require BICON checks, inspection, treatment, labelling compliance and possible import permits.");
      w.push("Food products must comply with Australian food standards, labelling rules, biosecurity requirements and importer obligations.");
    }
    if (isFoodAg) w.push("Food and agricultural products may require additional documentation, labelling review, inspection, treatment, permits or refusal risk depending on product and country conditions.");
    if (category==="chemicals") w.push("Chemical imports require AICIS assessment and registration in Australia.");
    if (category==="cosmetics") w.push("Cosmetics must comply with TGA and AICIS regulations in Australia.");
    if (category==="timber") w.push("Timber and wood products require a Timber Import Declaration and may require DAFF treatment on arrival.");
    if (category==="electronics") w.push("Electronics must meet ACMA regulatory compliance for the Australian market (e.g. RCM mark).");
  }
  if (dest==="US") {
    if (isBio) w.push("USDA APHIS permits required for food, plant and agricultural imports into the USA.");
    if (category==="cosmetics") w.push("Cosmetics must comply with FDA regulations for the US market.");
    if (category==="electronics") w.push("Electronics must meet FCC standards for the US market.");
  }
  if (dest==="IN") {
    w.push("India requires BIS certification for many electronics, chemicals and consumer goods.");
    if (isBio) w.push("Food imports into India require FSSAI registration and prior approval.");
  }
  if (dest==="GB") {
    w.push("Post-Brexit: UK customs declarations required for all imports. UKCA mark required for relevant products.");
    if (isBio) w.push("Food imports to UK require health certificates and port health authority checks.");
  }
  if (category==="fresh_produce") w.push("Fresh produce has strict phytosanitary and cold-chain requirements at most borders.");
  if (category==="chemicals") w.push("Chemicals may require Material Safety Data Sheets (MSDS) and special handling declarations at customs.");
  return w;
}

function getTips(dest, origin, category, shipMode, dutyRate, hsInfo, weightKg) {
  const t = [];
  if (!hsInfo.code) t.push("⚠ HS code unknown — accurate classification is essential. Incorrect HS codes can lead to penalties and delays. Use a licensed customs broker.");
  if (dutyRate > 0.10) t.push("High duty rate detected. Check if a Free Trade Agreement (FTA) or GSP preference applies to reduce your rate.");
  if (dest==="AU") {
    if (origin==="IN") t.push("Check trade-agreement eligibility, origin rules and required documents (e.g. Certificate of Origin) with your licensed customs broker.");
    if (origin==="CN") t.push("Australia–China ChAFTA may offer reduced tariff rates for eligible goods. Confirm with your broker.");
    t.push("Ensure all wooden packaging meets ISPM-15 phytosanitary standards for entry into Australia.");
  }
  if (dest==="US") t.push("A licensed US Customs Broker can help optimise MPF classification and avoid penalties.");
  if (dest==="IN") t.push("India allows duty drawback on re-exported goods — useful if you plan to re-export.");
  if (dest==="GB") t.push("UK Global Tariff replaced EU tariffs post-Brexit — always verify current UK rates at trade.gov.uk.");
  if (weightKg > 100 && shipMode !== "sea") t.push("Recommend Sea Freight for heavy non-urgent shipments over 100 kg to reduce freight costs significantly.");
  if (weightKg < 20 && shipMode === "sea") t.push("This weight is too low for sea freight to be cost-effective. Switch to Courier or Air Freight.");
  t.push("Always do a small test shipment before committing to a large import order.");
  if (category==="fresh_produce") t.push("Fresh produce requires pre-clearance, dedicated cold-chain logistics and phytosanitary certificates. Plan well in advance.");
  return t;
}

function toUSD(amt, cur) { return amt / (CURRENCIES[cur]?.rate || 1); }
function fromUSD(usd, cur) { return usd * (CURRENCIES[cur]?.rate || 1); }
function fmtC(usd, dc) {
  const c = CURRENCIES[dc] || CURRENCIES.USD;
  return c.symbol + fromUSD(usd, dc).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
}

const S = {
  card:{ background:"#141210", border:"1px solid rgba(200,169,110,0.16)", borderRadius:4, padding:"20px", marginBottom:14 },
  lbl:{ fontSize:10, color:"#c8a96e", letterSpacing:"0.24em", textTransform:"uppercase", marginBottom:12 },
  fl:{ fontSize:10, color:"#7a7060", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:5, display:"block" },
  sel:{ width:"100%", background:"#0e0c0a", border:"1px solid rgba(200,169,110,0.18)", borderRadius:3, padding:"9px 11px", color:"#e8e0d0", fontFamily:"'DM Mono',monospace", fontSize:12, outline:"none" },
  inp:{ width:"100%", background:"#0e0c0a", border:"1px solid rgba(200,169,110,0.18)", borderRadius:3, padding:"9px 11px", color:"#e8e0d0", fontFamily:"'DM Mono',monospace", fontSize:12, outline:"none" },
  g2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  g3:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 },
};

function F({ label, children }) { return <div><span style={S.fl}>{label}</span>{children}</div>; }

function Row({ label, val, note, idx, dimmed, isZero }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", animation:`fu 0.3s ease ${(idx||0)*0.05}s both` }}>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:dimmed?"#5a5248":"#d0c8b8" }}>{label}</div>
        {note && <div style={{ fontSize:10, color:"#5a5040", marginTop:2, lineHeight:1.5 }}>{note}</div>}
      </div>
      <div style={{ fontFamily:"monospace", fontSize:13, fontWeight:600, color:isZero?"#3a3530":dimmed?"#3a3530":"#9a8868", marginLeft:14, whiteSpace:"nowrap" }}>
        {isZero ? "—" : val}
      </div>
    </div>
  );
}

const PRODUCT_NAME_HINTS = [
  { match:["turmeric"], hs:"0910.30", category:"food_spices", label:"Turmeric (spices)", short:"Turmeric" },
  { match:["chilli","chili","chile","cayenne","red pepper"], hs:"0904.22", category:"food_spices", label:"Chilli powder (spices)", short:"Chilli powder" },
  { match:["cumin","jeera"], hs:"0909.31", category:"food_spices", label:"Cumin seeds (spices) — 0909.31 (whole) or 0909.32 (crushed)", short:"Cumin" },
  { match:["coriander","dhania"], hs:"0909.21", category:"food_spices", label:"Coriander (spices) — 0909.21 (seeds) or 0909.22 (crushed/powder)", short:"Coriander" },
  { match:["cardamom","elaichi"], hs:"0908.31", category:"food_spices", label:"Cardamom (spices)", short:"Cardamom" },
  { match:["pepper","peppercorn","kali mirch"], hs:"0904.11", category:"food_spices", label:"Pepper (spices)", short:"Pepper" },
  { match:["ginger"], hs:"0910.11", category:"food_spices", label:"Ginger (spices)", short:"Ginger" },
  { match:["coffee"], hs:"0901", category:"coffee_tea", label:"Coffee", short:"Coffee" },
  { match:["tea","chai"], hs:"0902", category:"coffee_tea", label:"Tea", short:"Tea" },
  { match:["guava"], hs:"0804.50", category:"fresh_produce", label:"Guava (fresh fruit)", short:"Guava" },
  { match:["mango"], hs:"0804.50", category:"fresh_produce", label:"Mango (fresh fruit)", short:"Mango" },
  { match:["banana"], hs:"0803.90", category:"fresh_produce", label:"Banana (fresh fruit)", short:"Banana" },
  { match:["rice","basmati"], hs:"1006.30", category:"agricultural", label:"Rice (agricultural)", short:"Rice" },
  { match:["lentil","dal","dhal"], hs:"0713.40", category:"agricultural", label:"Lentils / Pulses (agricultural)", short:"Lentils" },
  { match:["t-shirt","tshirt","tee shirt"], hs:"6109.10", category:"textiles", label:"T-shirts (textiles)", short:"T-shirts" },
  { match:["shoe","footwear","sneaker"], hs:"6403.99", category:"textiles", label:"Footwear (textiles/leather)", short:"Footwear" },
  { match:["laptop","computer","notebook pc"], hs:"8471.30", category:"electronics", label:"Laptops / Computers (electronics)", short:"Laptops" },
  { match:["phone","mobile","smartphone"], hs:"8517.13", category:"electronics", label:"Mobile phones (electronics)", short:"Mobile phones" },
  { match:["mug","cup","ceramic"], hs:"6912.00", category:"ceramics", label:"Ceramic mugs/tableware", short:"Ceramic mugs" },
];

function suggestFromProductName(name) {
  if (!name || !name.trim()) return null;
  const n = name.toLowerCase().trim();
  for (const hint of PRODUCT_NAME_HINTS) {
    if (hint.match.some(m => n.includes(m))) return hint;
  }
  return null;
}

const PRIORITY_ROUTES = [
  {from:"IN",to:"AU"},{from:"AU",to:"IN"},{from:"IN",to:"US"},{from:"CN",to:"AU"},{from:"IN",to:"GB"},
];

export default function App() {
  const [form, setForm] = useState({
    origin:"IN", dest:"AU", category:"general", shipMode:"sea",
    incoterm:"FOB", qty:"", unitPrice:"", priceCurrency:"USD",
    weight:"", sellingPrice:"", bioFee:"", displayCurrency:"AUD",
    productName:"", pkg100:"0.20", pkg250:"0.25", pkg500:"0.35", pkg1000:"0.50",
  });
  const [result, setResult] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [savedEstimates, setSavedEstimates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("imexSaved") || "[]"); } catch(e) { return []; }
  });
  const [isBrokerFormOpen, setIsBrokerFormOpen] = useState(false);
  const [brokerFields, setBrokerFields] = useState({ name:"", email:"", phone:"", message:"" });
  const [brokerSent, setBrokerSent] = useState(false);

  const set = (k, v) => setForm(f => ({...f, [k]:v}));

  const lsAvailable = (() => { try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); return true; } catch(e) { return false; } })();

  const saveEstimate = (r) => {
    if (!lsAvailable) { alert("Saving is not available in this browser environment."); return; }
    const sym = CURRENCIES[r.displayCurrency]?.symbol || "";
    const fmt2 = (n) => sym + (n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
    const entry = {
      ref: r.refNum,
      date: r.calcDate,
      origin: COUNTRIES[r.origin] || r.origin,
      dest: COUNTRIES[r.dest] || r.dest,
      product: form.productName || r.category,
      hsCode: r.hsInfo?.code || "Unknown",
      qty: r.qtyN,
      totalLanded: fmt2(fromUSD(r.totalLandedUSD, r.displayCurrency)),
      perUnit: fmt2(fromUSD(r.perUnitUSD, r.displayCurrency)),
      sellingPrice: r.profit ? fmt2(r.profit.sellingPriceDisplay) : "—",
      grossProfit: r.profit ? fmt2(r.profit.grossProfit) : "—",
      margin: r.profit ? r.profit.margin.toFixed(1)+"%" : "—",
      currency: r.displayCurrency,
    };
    const updated = [entry, ...savedEstimates].slice(0, 5);
    try {
      localStorage.setItem("imexSaved", JSON.stringify(updated));
      setSavedEstimates(updated);
      alert("Saved: " + r.refNum);
    } catch(e) { alert("Could not save. Storage may be full or unavailable."); }
  };

  const clearSaved = () => {
    try { localStorage.removeItem("imexSaved"); } catch(e) {}
    setSavedEstimates([]);
  };

  const openBrokerForm = () => { setBrokerSent(false); setIsBrokerFormOpen(true); };
  const closeBrokerForm = () => setIsBrokerFormOpen(false);
  const setBF = (k, v) => setBrokerFields(f => ({...f, [k]:v}));

  const handlePrint = (r) => {
    if (!r) return;
    const sym = CURRENCIES[r.displayCurrency]?.symbol || "";
    const fmt = (n) => sym + (n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
    const totalWeight = Math.max(1, parseFloat(form.weight) || r.qtyN * 0.3);
    const totalLandedDisp = fromUSD(r.totalLandedUSD, r.displayCurrency);
    const perUnitDisp = fromUSD(r.perUnitUSD, r.displayCurrency);

    const section = (title, content) => `
      <div style="margin-bottom:20px;page-break-inside:avoid;">
        <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#8a7040;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e0d0a0;">${title}</div>
        ${content}
      </div>`;
    const row = (label, value, strong) => `
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0e8d8;font-size:11px;">
        <span style="color:#5a4a30;">${label}</span>
        <span style="${strong?'font-weight:700;color:#3a2a10;':'color:#3a2a10;'}">${value}</span>
      </div>`;

    const shippingModeLabel = SHIP_MODES.find(m=>m.value===r.shipMode)?.label || r.shipMode;
    const incotermLabel = INCOTERMS.find(i=>i.value===r.incoterm)?.label || r.incoterm;
    const destCountry = COUNTRIES[r.dest] || r.dest;
    const originCountry = COUNTRIES[r.origin] || r.origin;

    const packRows = (() => {
      const landedPerKg = totalLandedDisp / totalWeight;
      const pkgAtoD = (v) => v * (CURRENCIES[r.displayCurrency]?.rate||1) / (CURRENCIES.AUD?.rate||1);
      const packs = [
        {label:"100g",weightKg:0.10,pkg:pkgAtoD(parseFloat(form.pkg100)||0.20)},
        {label:"250g",weightKg:0.25,pkg:pkgAtoD(parseFloat(form.pkg250)||0.25)},
        {label:"500g",weightKg:0.50,pkg:pkgAtoD(parseFloat(form.pkg500)||0.35)},
        {label:"1kg", weightKg:1.00,pkg:pkgAtoD(parseFloat(form.pkg1000)||0.50)},
      ];
      return packs.map(p => {
        const cost = landedPerKg * p.weightKg + p.pkg;
        return `<tr><td style="padding:5px 8px;">${p.label} pack</td><td style="padding:5px 8px;text-align:right;">${fmt(cost)}</td><td style="padding:5px 8px;text-align:right;">${fmt(cost/0.70)}</td><td style="padding:5px 8px;text-align:right;">${fmt(cost/0.50)}</td></tr>`;
      }).join("");
    })();

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>IMEX AI Estimate — ${r.refNum}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Mono',monospace;background:#fff;color:#2a2010;padding:32px 40px;font-size:11px;line-height:1.6;max-width:800px;margin:0 auto;}
    h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:32px;color:#2a1a08;letter-spacing:-0.01em;}
    h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:20px;color:#2a1a08;margin-bottom:4px;}
    .tag{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#a08040;}
    .ref{font-family:'DM Mono',monospace;font-size:13px;color:#a08040;letter-spacing:0.06em;}
    .divider{border:none;border-top:2px solid #c8a030;margin:18px 0;}
    .divider-light{border:none;border-top:1px solid #e8d8a0;margin:14px 0;}
    table{width:100%;border-collapse:collapse;font-size:11px;}
    th{text-align:left;padding:6px 8px;background:#f8f0d8;color:#5a4020;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;}
    td{padding:5px 8px;border-bottom:1px solid #f0e8d0;}
    .total-row{font-weight:700;font-size:13px;background:#f8f0d8;}
    .pill{display:inline-block;padding:2px 8px;border-radius:2px;font-size:9px;letter-spacing:0.1em;margin-left:8px;}
    .high{background:#e8f8f0;color:#2a8040;}
    .medium{background:#f8f4e0;color:#806020;}
    .low{background:#f8e8e0;color:#802020;}
    .warning-box{background:#fff8e8;border:1px solid #e0c060;border-radius:3px;padding:10px 14px;margin:10px 0;}
    .compliance-box{background:#fff4f0;border:1px solid #e08060;border-radius:3px;padding:10px 14px;margin:10px 0;}
    .profit-box{background:#f0f8f0;border:1px solid #60a080;border-radius:3px;padding:10px 14px;margin:10px 0;}
    .disclaimer{font-size:9px;color:#8a8070;border-top:1px solid #e0d0a0;padding-top:12px;margin-top:16px;line-height:1.7;}
    @media print{body{padding:16px 20px;}@page{margin:15mm;size:A4;}}
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
    <div>
      <div class="tag" style="margin-bottom:6px;">◆ IMEX AI</div>
      <h1>Import & Export<br/><em style="color:#c8a030;">Cost Estimate</em></h1>
    </div>
    <div style="text-align:right;">
      <div class="ref">${r.refNum}</div>
      <div style="font-size:10px;color:#8a7050;margin-top:4px;">${r.calcDate}</div>
      <div style="margin-top:6px;"><span class="pill ${r.confidence.level.toLowerCase()}">${r.confidence.level} Confidence</span></div>
    </div>
  </div>
  <hr class="divider"/>

  <!-- Shipment Details -->
  ${section("Shipment Details", `
    ${row("Origin", originCountry)}
    ${row("Destination", destCountry)}
    ${row("Product", form.productName || "—")}
    ${row("Product Category", PRODUCT_CATEGORIES.find(c=>c.value===r.category)?.label||r.category)}
    ${row("HS Code", r.hsInfo?.code ? r.hsInfo.label : "Unknown / Needs classification")}
    ${row("Quantity", r.qtyN.toLocaleString() + " units")}
    ${row("Total Weight", totalWeight.toFixed(1) + " kg")}
    ${row("Shipping Mode", shippingModeLabel)}
    ${row("Incoterm", incotermLabel)}
  `)}

  <!-- Cost Breakdown -->
  ${section("Cost Breakdown — " + r.displayCurrency, `
    <table>
      <tr><th>Item</th><th style="text-align:right;">Amount (${r.displayCurrency})</th><th style="text-align:right;">Notes</th></tr>
      <tr><td>Product / Declared Value</td><td style="text-align:right;">${fmt(fromUSD(r.totalValueUSD,r.displayCurrency))}</td><td style="text-align:right;font-size:10px;color:#8a7050;">${r.qtyN} × ${fmt(fromUSD(r.unitPriceUSD,r.displayCurrency))}</td></tr>
      <tr><td>${r.hsInfo.code?"Estimated Import Duty ("+((r.dutyRate||0)*100).toFixed(1)+"%)":"Estimated Import Duty — verify HS code"}</td><td style="text-align:right;">${fmt(fromUSD(r.dutyAmt,r.displayCurrency))}</td><td style="text-align:right;font-size:10px;color:#8a7050;">${((r.dutyRate||0)*100).toFixed(1)}%</td></tr>
      <tr><td>Freight & Shipping</td><td style="text-align:right;">${fmt(fromUSD(r.freightCost,r.displayCurrency))}</td><td style="text-align:right;font-size:10px;color:#8a7050;">${shippingModeLabel}</td></tr>
      <tr><td>Insurance</td><td style="text-align:right;">${fmt(fromUSD(r.insurance,r.displayCurrency))}</td><td style="text-align:right;font-size:10px;color:#8a7050;">0.5% of cargo</td></tr>
      <tr><td>Customs Broker / Clearance</td><td style="text-align:right;">${fmt(fromUSD(r.customsBroker,r.displayCurrency))}</td><td></td></tr>
      ${r.taxLines.map(t=>`<tr><td>${t.label}</td><td style="text-align:right;">${fmt(fromUSD(t.amount,r.displayCurrency))}</td><td style="text-align:right;font-size:10px;color:#8a7050;">${t.note||""}</td></tr>`).join("")}
      ${r.bioFeeN>0?`<tr><td>Biosecurity / Inspection Fees</td><td style="text-align:right;">${fmt(fromUSD(r.bioFeeN,r.displayCurrency))}</td><td></td></tr>`:""}
      <tr class="total-row"><td>Total Estimated Landed Cost</td><td style="text-align:right;color:#8a6010;">${fmt(totalLandedDisp)}</td><td></td></tr>
      <tr><td>Landed Cost Per Unit</td><td style="text-align:right;font-weight:600;">${fmt(perUnitDisp)}</td><td style="text-align:right;font-size:10px;color:#8a7050;">${r.qtyN} units</td></tr>
    </table>
    <div style="font-size:9px;color:#8a7050;margin-top:6px;">Estimate only — not a customs ruling or freight quote.</div>
  `)}

  ${r.profit ? section("Profit Calculator", `
    <div class="profit-box">
      ${row("Selling Price Per Unit", fmt(r.profit.sellingPriceDisplay))}
      ${row("Total Revenue", fmt(r.profit.totalRevenue))}
      ${row("Profit Per Unit", fmt(r.profit.profitPerUnit), true)}
      ${row("Gross Profit", fmt(r.profit.grossProfit), true)}
      ${row("Profit Margin", r.profit.margin.toFixed(1)+"%", true)}
      ${row("Break-even Price / Unit", fmt(r.profit.breakeven))}
    </div>
  `) : ""}

  <!-- Best Action -->
  ${section("Best Action Recommendation", (() => {
    const margin = r.profit?.margin;
    const gross = r.profit?.grossProfit;
    let title, msg, bg, border;
    if (!r.profit) { title="Enter Selling Price"; msg="Add a selling price to get a buy/wait recommendation."; bg="#fff8e8"; border="#d0b040"; }
    else if (gross < 0) { title="Do Not Order At This Selling Price"; msg="Increase selling price, reduce freight/clearance cost, or increase quantity."; bg="#fff0ee"; border="#e06050"; }
    else if (margin < 10) { title="Very Low Margin"; msg="Only consider for testing or if you expect repeat sales."; bg="#fff4e8"; border="#e09040"; }
    else if (margin < 25) { title="Moderate Margin"; msg="Check all real freight, customs and selling costs before ordering."; bg="#fffff0"; border="#c0b040"; }
    else { title="Potentially Profitable"; msg="Verify HS code, freight quote and compliance before ordering."; bg="#f0fff4"; border="#50a070"; }
    return `<div style="background:${bg};border:1px solid ${border};border-radius:3px;padding:10px 14px;">
      <div style="font-weight:600;font-size:13px;margin-bottom:4px;font-family:'Cormorant Garamond',serif;">${title}</div>
      <div style="font-size:11px;">${msg}</div>
      ${!r.hsInfo.code?'<div style="color:#c06030;font-size:10px;margin-top:6px;">⚠ HS code is missing — this estimate is low confidence.</div>':""}
      ${r.profit?`<div style="font-size:9px;color:#8a7050;margin-top:6px;">Based on margin of ${r.profit.margin.toFixed(1)}%</div>`:""}
    </div>`;
  })())}

  <!-- Pricing Recommendation -->
  ${section("Pricing Recommendation", `
    <table>
      <tr><th>Target</th><th style="text-align:right;">Selling Price Per Unit</th><th>Notes</th></tr>
      <tr><td>Break-even (0%)</td><td style="text-align:right;">${fmt(perUnitDisp)}</td><td style="font-size:10px;color:#8a7050;">No profit, no loss</td></tr>
      <tr><td>20% Margin</td><td style="text-align:right;">${fmt(perUnitDisp/0.80)}</td><td style="font-size:10px;color:#8a7050;">Conservative</td></tr>
      <tr><td>30% Margin</td><td style="text-align:right;font-weight:700;">${fmt(perUnitDisp/0.70)}</td><td style="font-size:10px;color:#5a8050;">Recommended starting point</td></tr>
      <tr><td>50% Margin</td><td style="text-align:right;">${fmt(perUnitDisp/0.50)}</td><td style="font-size:10px;color:#8a7050;">Premium / niche products</td></tr>
    </table>
  `)}

  <!-- Retail Packaging -->
  ${section("Retail Packaging Calculator — Cost Per Pack", `
    <table>
      <tr><th>Pack Size</th><th style="text-align:right;">Cost Per Pack</th><th style="text-align:right;">30% Margin</th><th style="text-align:right;">50% Margin</th></tr>
      ${packRows}
    </table>
    <div style="font-size:9px;color:#8a7050;margin-top:6px;">Retail packaging can increase margin compared with bulk selling, but labelling, food standards, packaging, storage and shelf-life rules must be checked before selling.</div>
  `)}

  <!-- Assumptions -->
  ${section("Assumptions & Caveats", r.assumptions.map(a=>`<div style="font-size:10px;color:#6a5a30;padding:2px 0;line-height:1.6;">· ${a}</div>`).join(""))}

  <!-- Compliance -->
  <div class="compliance-box">
    <div style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#c06040;margin-bottom:6px;">⚑ Compliance Warnings</div>
    ${r.compliance.map(c=>`<div style="font-size:10px;color:#8a4030;padding:2px 0;line-height:1.6;">· ${c}</div>`).join("")}
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    Disclaimer: These calculations are estimates for planning only. Actual duties, taxes, customs fees, quarantine/biosecurity charges and freight costs may vary based on HS code, product type, country rules, incoterms, shipment method and customs assessment. Always confirm with a licensed customs broker or official authority before shipping. This calculator does not support restricted, prohibited, dangerous, controlled or licence-required goods.<br/><br/>
    Generated by IMEX AI Import & Export Cost Calculator · ${r.refNum} · ${r.calcDate}
  </div>

  <script>window.onload=function(){window.print();}</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (w) { w.document.write(html); w.document.close(); }
    else window.print();
  };

  useEffect(() => {
    const dc = DEST_CURRENCY[form.dest];
    if (dc && DISPLAY_CURRENCIES.includes(dc)) set("displayCurrency", dc);
  }, [form.dest]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
      @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      *{box-sizing:border-box;margin:0;padding:0}
      html{-webkit-text-size-adjust:100%}
      body{background:#0e0c0a;overflow-x:hidden}
      select,input,textarea{-webkit-appearance:none;appearance:none}
      select:focus,input:focus,textarea:focus{border-color:rgba(200,169,110,0.5)!important;outline:none}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#1a1714}::-webkit-scrollbar-thumb{background:#3a3530;border-radius:2px}

      /* Responsive grid utilities */
      .imex-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .imex-g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
      .imex-g2-profit{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .imex-g2-saved{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
      .imex-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .imex-broker-contact{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
      .imex-broker-prefill{display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .imex-span2{grid-column:span 2}
      .imex-routes{display:flex;flex-wrap:wrap;gap:5px}
      .imex-confidence{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px}

      /* Scrollable tables on mobile */
      .imex-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
      .imex-table-wrap table{min-width:480px}

      /* Print styles */
      @media print {
        .no-print { display: none !important; }
        .print-report { display: block !important; }
        body { background: #fff !important; color: #000 !important; font-family: 'DM Mono', monospace; }
      }
      .print-report { display: none; }

      /* Mobile — up to 600px */
      @media (max-width:600px) {
        .imex-g2{grid-template-columns:1fr}
        .imex-g3{grid-template-columns:1fr 1fr}
        .imex-g2-profit{grid-template-columns:1fr 1fr}
        .imex-g2-saved{grid-template-columns:1fr 1fr}
        .imex-actions{grid-template-columns:1fr}
        .imex-broker-contact{grid-template-columns:1fr}
        .imex-broker-prefill{grid-template-columns:1fr}
        .imex-span2{grid-column:span 1}
        .imex-confidence{flex-direction:column;align-items:flex-start}
        .imex-table-wrap table{min-width:520px}
      }

      /* Small mobile — up to 400px */
      @media (max-width:400px) {
        .imex-g3{grid-template-columns:1fr}
        .imex-g2-profit{grid-template-columns:1fr}
        .imex-g2-saved{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const calculate = () => { try {
    const { origin, dest, category, shipMode, incoterm, qty, unitPrice, priceCurrency, weight, sellingPrice, bioFee, displayCurrency, productName } = form;
    const qtyN = Math.max(1, parseInt(qty)||1);
    const unitPriceUSD = toUSD(parseFloat(unitPrice)||500, priceCurrency);
    const totalValueUSD = unitPriceUSD * qtyN;
    const weightKg = parseFloat(weight) || Math.max(1, qtyN*0.3);
    const bioFeeN = parseFloat(bioFee)||0;

    const productHint = suggestFromProductName(productName);
    let hsInfo = HS_CODES[category] || HS_CODES.general;
    // Product-name hint is the most specific match — it always wins over the generic category HS code
    if (productHint) {
      hsInfo = { code: productHint.hs, label: productHint.hs + " – " + (productHint.short || productHint.label) };
    }
    const dutyRate = getDutyRate(dest, origin, category);
    const dutyAmt = totalValueUSD * dutyRate;
    const freightCost = calcFreight(shipMode, weightKg, origin, dest);
    const insurance = totalValueUSD * 0.005;
    const customsBroker = Math.min(Math.max(freightCost*0.05+40,55),280);
    const cifValue = totalValueUSD + freightCost + insurance;
    const taxResult = calcDestTax(dest, category, cifValue, dutyAmt, shipMode);
    const totalLandedUSD = totalValueUSD + dutyAmt + freightCost + insurance + customsBroker + taxResult.total + bioFeeN;
    const perUnitUSD = totalLandedUSD / qtyN;

    const confidence = getConfidence(hsInfo, category, incoterm, dest, origin, shipMode);
    const compliance = getComplianceWarnings(dest, category);
    const tips = getTips(dest, origin, category, shipMode, dutyRate, hsInfo, weightKg);
    const shipWarnings = getShipWarnings(shipMode, weightKg);
    const shipRec = getShipRec(weightKg);
    const isBio = BIO_CATEGORIES.includes(category);

    let ftaNote = null;
    if (dest==="AU"&&origin==="IN") ftaNote = "India–Australia ECTA may reduce or eliminate duty for eligible goods, subject to HS code, origin rules and documentation.";
    if (dest==="AU"&&origin==="CN") ftaNote = "Australia–China ChAFTA may offer reduced tariff rates for eligible goods.";

    const incotermObj = INCOTERMS.find(i=>i.value===incoterm);
    const incotermDesc = incotermObj ? (incotermObj[shipMode] || incotermObj.sea) : "";

    // Selling price is entered in DISPLAY currency (destination), not the buying/price currency.
    // Compute profit directly in the display currency to avoid double conversion.
    const sellingPriceDisplay = sellingPrice ? (parseFloat(sellingPrice) || 0) : null;
    const perUnitDisplay = fromUSD(perUnitUSD, displayCurrency);
    const totalLandedDisplay = fromUSD(totalLandedUSD, displayCurrency);
    let profit = null;
    if (sellingPriceDisplay && sellingPriceDisplay > 0) {
      const totalRevenue = sellingPriceDisplay * qtyN;
      const grossProfit = totalRevenue - totalLandedDisplay;
      const profitPerUnit = sellingPriceDisplay - perUnitDisplay;
      profit = {
        sellingPriceDisplay,
        totalRevenue,
        grossProfit,
        profitPerUnit,
        margin: (profitPerUnit / sellingPriceDisplay) * 100,
        breakeven: perUnitDisplay,
      };
    }

    const refNum = "IMEXAI-EST-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random()*9000)+1000);
    const _d = new Date();
    const calcDate = _d.getDate().toString().padStart(2,"0") + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][_d.getMonth()] + " " + _d.getFullYear();

    const assumptions = [
      !hsInfo.code ? "⚠ HS code is unknown — duty rate is a rough estimate only. Verify by HS code classification." : `HS code ${hsInfo.code} used for duty calculation.`,
      dest==="AU"&&!hsInfo.code ? "Common AU duty range: 0–5% for most goods, product dependent." : null,
      `Incoterm: ${incoterm} — ${incotermDesc}`,
      `Freight estimated for ${weightKg.toFixed(1)} kg via ${SHIP_MODES.find(m=>m.value===shipMode)?.label}.`,
      "Insurance estimated at 0.5% of cargo value.",
      "Customs broker/clearance fees are estimated — actual fees vary by broker, entry point and destination location.",
      bioFeeN>0 ? `Biosecurity/inspection fee of ${fmtC(bioFeeN,displayCurrency)} included as entered.` : null,
      ...(shipWarnings.length ? shipWarnings : [shipRec]),
    ].filter(Boolean);

    setResult({
      origin, dest, category, shipMode, incoterm, qtyN,
      totalValueUSD, unitPriceUSD, displayCurrency, priceCurrency,
      dutyRate, dutyAmt, freightCost, insurance, customsBroker,
      taxLines:taxResult.lines, taxTotal:taxResult.total,
      bioFeeN, isBio, totalLandedUSD, perUnitUSD,
      hsInfo, confidence, compliance, tips, assumptions, profit,
      refNum, calcDate, incotermDesc, ftaNote,
    });
    setAnimKey(k=>k+1);
  } catch(err) { alert("Calculation error: " + err.message); } };

  const r = result;
  const incotermObj = INCOTERMS.find(i=>i.value===form.incoterm);
  const incotermDesc = incotermObj ? (incotermObj[form.shipMode] || incotermObj.sea) : "";

  return (
    <div style={{ minHeight:"100vh", background:"#0e0c0a", fontFamily:"'DM Mono',monospace", color:"#e8e0d0", paddingBottom:80 }}>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(200,169,110,0.12)", padding:"22px 16px 18px", background:"linear-gradient(180deg,#161310 0%,#0e0c0a 100%)" }}>
        <div style={{ maxWidth:740, margin:"0 auto" }}>
          <div style={{ fontSize:10, letterSpacing:"0.35em", color:"#c8a96e", textTransform:"uppercase", marginBottom:7 }}>◆ IMEX AI</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(22px,5vw,40px)", fontWeight:400, lineHeight:1.1, color:"#f0e8d8" }}>
            Import & Export<br /><em style={{ color:"#c8a96e" }}>Cost Calculator</em>
          </h1>
          <p style={{ marginTop:9, fontSize:11, color:"#6a6258", lineHeight:1.7 }}>
            Describe your shipment — duties, freight, taxes and landed cost estimated instantly.
          </p>
          <div className="imex-routes" style={{ marginTop:12 }}>
            {PRIORITY_ROUTES.map(({from,to}) => (
              <button key={from+to} onClick={()=>{set("origin",from);set("dest",to);}}
                style={{ background:form.origin===from&&form.dest===to?"rgba(200,169,110,0.14)":"transparent", border:"1px solid rgba(200,169,110,0.18)", borderRadius:2, padding:"3px 9px", color:"#9a8a70", fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer" }}>
                {COUNTRIES[from]} → {COUNTRIES[to]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:740, margin:"0 auto", padding:"20px 14px 0" }}>

        {/* Form */}
        <div style={S.card}>
          <div style={S.lbl}>Shipment Details</div>
          <div className="imex-g2" style={{marginBottom:12}}>
            <F label="Origin Country"><select style={S.sel} value={form.origin} onChange={e=>set("origin",e.target.value)}>{Object.entries(COUNTRIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></F>
            <F label="Destination Country"><select style={S.sel} value={form.dest} onChange={e=>set("dest",e.target.value)}>{Object.entries(COUNTRIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></F>
          </div>
          <div style={{marginBottom:12}}>
            <F label="Product Category"><select style={S.sel} value={form.category} onChange={e=>set("category",e.target.value)}>{PRODUCT_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></F>
          </div>
          <div style={{marginBottom:12}}>
            <F label="Product Name (helps suggest HS code)">
              <input style={S.inp} type="text" placeholder="e.g. turmeric powder, chilli powder, coffee, guava" value={form.productName} onChange={e=>set("productName",e.target.value)} />
            </F>
            {(() => {
              const hint = suggestFromProductName(form.productName);
              if (!hint) return null;
              const isBioCat = ["food_spices","coffee_tea","fresh_produce","agricultural","plant_products","animal_products","timber"].includes(hint.category);
              return (
                <div style={{ marginTop:8, padding:"10px 12px", background:"rgba(96,200,144,0.05)", border:"1px solid rgba(96,200,144,0.22)", borderRadius:3 }}>
                  <div style={{ fontSize:10, color:"#60c890", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>◆ Suggested Match: {hint.label}</div>
                  <div style={{ fontSize:11, color:"#a09080", lineHeight:1.65, marginBottom:6 }}>
                    Suggested HS code: <span style={{ color:"#c8a96e", fontFamily:"monospace", fontWeight:600 }}>{hint.hs}</span> — verify with ABF Tariff Finder or a licensed customs broker.
                  </div>
                  {isBioCat && (
                    <div style={{ fontSize:10, color:"#d8a060", lineHeight:1.6, marginBottom:6 }}>
                      ⚑ Biosecurity / food compliance may apply. Check DAFF BICON before ordering.
                    </div>
                  )}
                  {form.category !== hint.category && (
                    <button type="button" onClick={()=>set("category",hint.category)} style={{ background:"transparent", border:"1px solid rgba(96,200,144,0.35)", borderRadius:2, padding:"4px 10px", color:"#60c890", fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer", letterSpacing:"0.05em" }}>
                      Apply suggested category →
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
          <div className="imex-g3" style={{marginBottom:12}}>
            <F label="Quantity (units)"><input style={S.inp} type="number" min="1" placeholder="e.g. 200" value={form.qty} onChange={e=>set("qty",e.target.value)} /></F>
            <F label="Unit Price"><input style={S.inp} type="number" min="0" placeholder="e.g. 12.50" value={form.unitPrice} onChange={e=>set("unitPrice",e.target.value)} /></F>
            <F label="Price Currency"><select style={S.sel} value={form.priceCurrency} onChange={e=>set("priceCurrency",e.target.value)}>{Object.entries(CURRENCIES).map(([k,v])=><option key={k} value={k}>{k} – {v.symbol}</option>)}</select></F>
          </div>
          <div className="imex-g2" style={{marginBottom:12}}>
            <F label="Total Weight (kg)"><input style={S.inp} type="number" min="0" placeholder="e.g. 150" value={form.weight} onChange={e=>set("weight",e.target.value)} /></F>
            <F label="Shipping Mode"><select style={S.sel} value={form.shipMode} onChange={e=>set("shipMode",e.target.value)}>{SHIP_MODES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></F>
          </div>
          <div style={{marginBottom:12}}>
            <F label="Incoterms"><select style={S.sel} value={form.incoterm} onChange={e=>set("incoterm",e.target.value)}>{INCOTERMS.map(i=><option key={i.value} value={i.value}>{i.label}</option>)}</select></F>
            {form.incoterm && <div style={{ fontSize:10, color:"#6a5e4a", marginTop:5, lineHeight:1.65 }}>{incotermDesc}</div>}
          </div>
          <div className="imex-g2" style={{marginBottom:12}}>
            <F label="Biosecurity / Inspection Fee (optional, USD)">
              <input style={S.inp} type="number" min="0" placeholder={BIO_CATEGORIES.includes(form.category)?"e.g. 180 — may apply":"0"} value={form.bioFee} onChange={e=>set("bioFee",e.target.value)} />
            </F>
            <F label="Display Currency">
              <select style={S.sel} value={form.displayCurrency} onChange={e=>set("displayCurrency",e.target.value)}>
                {DISPLAY_CURRENCIES.map(k=><option key={k} value={k}>{k} – {CURRENCIES[k].name}</option>)}
              </select>
            </F>
          </div>
          <div>
            <F label={`Expected Selling Price Per Unit in ${form.displayCurrency} (optional — for profit calculation)`}>
              <input style={S.inp} type="number" min="0" placeholder="e.g. 45.00" value={form.sellingPrice} onChange={e=>set("sellingPrice",e.target.value)} />
            </F>
          </div>
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:10, color:"#7a7060", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8 }}>Retail Packaging Costs per Pack (AUD) — for packaging calculator</div>
            <div className="imex-g2-profit" style={{ gap:10 }}>
              <F label="100g pack cost (AUD)">
                <input style={S.inp} type="number" min="0" step="0.01" placeholder="0.20" value={form.pkg100} onChange={e=>set("pkg100",e.target.value)} />
              </F>
              <F label="250g pack cost (AUD)">
                <input style={S.inp} type="number" min="0" step="0.01" placeholder="0.25" value={form.pkg250} onChange={e=>set("pkg250",e.target.value)} />
              </F>
              <F label="500g pack cost (AUD)">
                <input style={S.inp} type="number" min="0" step="0.01" placeholder="0.35" value={form.pkg500} onChange={e=>set("pkg500",e.target.value)} />
              </F>
              <F label="1kg pack cost (AUD)">
                <input style={S.inp} type="number" min="0" step="0.01" placeholder="0.50" value={form.pkg1000} onChange={e=>set("pkg1000",e.target.value)} />
              </F>
            </div>
            <div style={{ fontSize:10, color:"#3a3430", marginTop:6, lineHeight:1.55 }}>Defaults: 100g = A$0.20 · 250g = A$0.25 · 500g = A$0.35 · 1kg = A$0.50. Enter your real packaging costs for accurate retail prices.</div>
          </div>
        </div>

        <button onClick={calculate} style={{ width:"100%", background:"linear-gradient(135deg,#c8a96e,#a8893e)", border:"none", borderRadius:3, padding:"13px", color:"#0e0c0a", fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.08em", marginBottom:22 }}>
          Calculate Landed Cost →
        </button>

        {/* Results */}
        {r && (
          <div key={animKey} style={{ animation:"fu 0.4s ease both" }}>

            {/* Ref bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, padding:"8px 14px", background:"#141210", border:"1px solid rgba(200,169,110,0.12)", borderRadius:3 }}>
              <div>
                <span style={{ fontSize:9, color:"#5a5040", letterSpacing:"0.2em", textTransform:"uppercase" }}>Reference</span>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#c8a96e", marginTop:2, letterSpacing:"0.06em" }}>{r.refNum}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontSize:9, color:"#5a5040", letterSpacing:"0.2em", textTransform:"uppercase" }}>Date</span>
                <div style={{ fontSize:12, color:"#7a7060", marginTop:2 }}>{r.calcDate}</div>
              </div>
            </div>

            {/* Confidence + HS */}
            <div style={{...S.card, display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:10}}>
              <div>
                <div style={S.lbl}>Confidence Level</div>
                <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:2, border:`1px solid ${r.confidence.color}`, color:r.confidence.color, fontSize:11, letterSpacing:"0.1em" }}>{r.confidence.level}</span>
                <div style={{ fontSize:10, color:"#5a5248", marginTop:6, maxWidth:380, lineHeight:1.55 }}>{r.confidence.desc}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={S.lbl}>HS Code</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:r.hsInfo.code?"#c8b898":"#c07070" }}>{r.hsInfo.label}</div>
                {!r.hsInfo.code && <div style={{ fontSize:10, color:"#c07070", marginTop:4 }}>⚠ Classification required for accurate duty</div>}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={S.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={S.lbl}>Cost Breakdown — {r.displayCurrency} ({CURRENCIES[r.displayCurrency]?.name})</div>
                <div style={{ fontSize:10, color:"#7a6a50" }}>{r.displayCurrency!=="USD"?`1 USD ≈ ${CURRENCIES[r.displayCurrency]?.rate?.toFixed(4)} ${r.displayCurrency}`:"All values in USD"}</div>
              </div>

              {r.priceCurrency !== r.displayCurrency && (
                <div style={{ fontSize:10, color:"#5a5040", marginBottom:8, lineHeight:1.6, background:"rgba(200,169,110,0.04)", borderRadius:2, padding:"6px 10px" }}>
                  Value entered in {r.priceCurrency} ({CURRENCIES[r.priceCurrency]?.symbol}{(r.unitPriceUSD*(CURRENCIES[r.priceCurrency]?.rate||1)).toFixed(2)} per unit)
                  {r.priceCurrency!=="USD"?" · converted via USD":""}
                  {` · displayed in ${r.displayCurrency}`}
                </div>
              )}

              <Row label="Product / Declared Value" val={fmtC(r.totalValueUSD,r.displayCurrency)} note={`${r.qtyN} units × ${fmtC(r.unitPriceUSD,r.displayCurrency)}`} idx={0} />
              <Row
                label={r.hsInfo.code ? `Estimated Import Duty (${(r.dutyRate*100).toFixed(1)}%)` : "Estimated Import Duty — placeholder rate, verify by HS code"}
                val={fmtC(r.dutyAmt,r.displayCurrency)}
                note={r.hsInfo.code
                  ? `${(r.dutyRate*100).toFixed(1)}% applied — ${COUNTRIES[r.dest]}${r.ftaNote?" · "+r.ftaNote:""}`
                  : `${r.dest==="AU"?"Common AU range: 0–5%, product dependent":"Placeholder — verify by accurate HS code classification"}${r.ftaNote?" · "+r.ftaNote:""}`}
                idx={1}
              />
              <Row label="Freight & Shipping" val={fmtC(r.freightCost,r.displayCurrency)} note={`${SHIP_MODES.find(m=>m.value===r.shipMode)?.label} estimate · Small shipments may attract minimum freight, courier, broker or handling charges, which can make landed cost per unit high.`} idx={2} />
              <Row label="Insurance" val={fmtC(r.insurance,r.displayCurrency)} note="0.5% of cargo value (standard cargo insurance)" idx={3} />
              <Row label="Customs Broker / Clearance Fees" val={fmtC(r.customsBroker,r.displayCurrency)} note="Estimated — varies by broker, entry point and destination location." idx={4} />
              {r.taxLines.map((tl,i)=>(
                <Row key={i} label={tl.label} val={tl.amount===0?null:fmtC(tl.amount,r.displayCurrency)} note={tl.note} idx={5+i} isZero={tl.amount===0} />
              ))}
              <Row
                label="Biosecurity / Inspection Fees"
                val={r.bioFeeN>0?fmtC(r.bioFeeN,r.displayCurrency):null}
                note={r.bioFeeN>0?"As entered — actual fees vary by product, treatment type and port of entry":r.isBio?"May apply — not included unless entered above. Food, spice, plant, animal, timber and agricultural goods commonly attract DAFF/biosecurity inspection fees.":"Not estimated for this product category"}
                idx={5+r.taxLines.length}
                isZero={r.bioFeeN===0}
                dimmed={r.bioFeeN===0&&!r.isBio}
              />

              {/* Totals */}
              <div style={{ paddingTop:14, marginTop:4, borderTop:"1px solid rgba(200,169,110,0.22)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:"#f0e8d8" }}>Total Estimated Landed Cost</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600, color:"#c8a96e" }}>{fmtC(r.totalLandedUSD,r.displayCurrency)}</div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                  <div style={{ fontSize:12, color:"#7a7060" }}>Landed Cost Per Unit</div>
                  <div style={{ fontSize:14, color:"#c8b898", fontFamily:"monospace" }}>{fmtC(r.perUnitUSD,r.displayCurrency)}</div>
                </div>
                {r.displayCurrency!=="USD" && (
                  <div style={{ fontSize:10, color:"#4a4438", textAlign:"right" }}>= US${r.totalLandedUSD.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} USD</div>
                )}
                <div style={{ marginTop:10, fontSize:10, color:"#5a5040", background:"rgba(200,169,110,0.05)", borderRadius:2, padding:"7px 10px", lineHeight:1.6 }}>
                  Estimate only — not a customs ruling or freight quote.
                </div>
                {/* Broker CTA */}
                <div style={{ marginTop:12, padding:"12px 14px", background:"rgba(96,200,144,0.06)", border:"1px solid rgba(96,200,144,0.22)", borderRadius:3, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                  <div style={{ fontSize:11, color:"#507860", lineHeight:1.5 }}>Need an official quote from a licensed customs broker?</div>
                  <button onClick={openBrokerForm} style={{ background:"linear-gradient(135deg,#60c890,#3ea870)", border:"none", borderRadius:3, padding:"8px 16px", color:"#0a140e", fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:600, cursor:"pointer", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>
                    ✦ Request Broker Quote
                  </button>
                </div>
                {r.qtyN===1 && (
                  <div style={{ marginTop:8, fontSize:11, color:"#8a6050", background:"rgba(200,100,60,0.06)", borderRadius:3, padding:"8px 10px", lineHeight:1.6 }}>
                    ⚠ Quantity is 1 — landed cost per unit is very high because all fixed charges are absorbed by a single unit. Consider importing a larger quantity to reduce per-unit cost.
                  </div>
                )}
                {r.qtyN>1&&r.qtyN<20 && (
                  <div style={{ marginTop:6, fontSize:10, color:"#5a5040", lineHeight:1.65 }}>
                    Small shipments often carry high landed cost per unit — fixed customs, broker and freight charges are spread across fewer units.
                  </div>
                )}
                <div style={{ marginTop:4, fontSize:10, color:"#3a3430", lineHeight:1.65 }}>
                  Landed cost per unit = Total landed cost ÷ quantity ({r.qtyN} units).
                </div>
              </div>
            </div>

            {/* Best Action Recommendation */}
            {(() => {
              const hasProfit = r.profit !== null && r.profit !== undefined;
              const margin = hasProfit ? r.profit.margin : null;
              const grossProfit = hasProfit ? r.profit.grossProfit : null;
              const hsUnknown = !r.hsInfo.code;

              // Determine status only when selling price is provided
              let title, message, bg, border, accent, icon;
              if (!hasProfit) {
                title = "Add Selling Price For Action Guidance";
                message = "Enter your expected selling price per unit to get a buy/wait recommendation based on profit margin.";
                bg = "#13110a"; border = "rgba(200,169,110,0.18)"; accent = "#c8a96e"; icon = "ℹ";
              } else if (grossProfit < 0) {
                title = "Do Not Order At This Selling Price";
                message = "Increase selling price, reduce freight/clearance cost, or increase quantity.";
                bg = "#1a0a08"; border = "rgba(200,80,60,0.35)"; accent = "#e07060"; icon = "✕";
              } else if (margin >= 0 && margin < 10) {
                title = "Very Low Margin";
                message = "Only consider this for testing or if you expect repeat sales.";
                bg = "#1a1408"; border = "rgba(200,140,60,0.35)"; accent = "#d8a060"; icon = "⚠";
              } else if (margin >= 10 && margin < 25) {
                title = "Moderate Margin";
                message = "Check all real freight, customs and selling costs before ordering.";
                bg = "#13130a"; border = "rgba(200,169,110,0.30)"; accent = "#c8a96e"; icon = "◆";
              } else {
                title = "Potentially Profitable";
                message = "Verify HS code, freight quote and compliance before ordering.";
                bg = "#0a1310"; border = "rgba(96,200,144,0.30)"; accent = "#60c890"; icon = "✓";
              }

              return (
                <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:4, padding:"16px 18px", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:16, color:accent }}>{icon}</span>
                    <span style={{ fontSize:10, color:accent, letterSpacing:"0.22em", textTransform:"uppercase" }}>Best Action Recommendation</span>
                  </div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:accent, marginBottom:6, lineHeight:1.25 }}>{title}</div>
                  <div style={{ fontSize:12, color:"#a09080", lineHeight:1.7 }}>{message}</div>
                  {hsUnknown && (
                    <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${border}`, fontSize:11, color:"#c07070", lineHeight:1.6 }}>
                      ⚠ HS code is missing, so this is low confidence.
                    </div>
                  )}
                  {hasProfit && (
                    <div style={{ marginTop:8, fontSize:10, color:"#5a5040" }}>
                      Based on profit margin of {margin.toFixed(1)}% at your entered selling price.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Negative Profit Warning */}
            {r.profit && r.profit.grossProfit < 0 && (
              <div style={{ background:"#1a0a08", border:"1px solid rgba(200,80,60,0.4)", borderRadius:4, padding:"18px 20px", marginBottom:14 }}>
                <div style={{ fontSize:10, color:"#e07060", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:10 }}>⚠ Not Profitable At This Selling Price</div>
                <div style={{ fontSize:12, color:"#c08070", lineHeight:1.7, marginBottom:14 }}>
                  Your landed cost is higher than your selling price. Increase selling price, reduce freight/clearance costs, or increase shipment quantity before ordering.
                </div>
                <div className="imex-g2-profit" style={{ gap:10 }}>
                  <div style={{ background:"#0e0c0a", borderRadius:3, padding:"11px 13px", border:"1px solid rgba(200,80,60,0.18)" }}>
                    <div style={{ fontSize:9, color:"#a06050", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:4 }}>Required Minimum Selling Price</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#e08070" }}>
                      {(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.breakeven.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                    </div>
                    <div style={{ fontSize:10, color:"#705048", marginTop:3 }}>Break-even — no profit, no loss</div>
                  </div>
                  <div style={{ background:"#0e0c0a", borderRadius:3, padding:"11px 13px", border:"1px solid rgba(96,200,144,0.18)" }}>
                    <div style={{ fontSize:9, color:"#508870", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:4 }}>Recommended Price (30% Margin)</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#60c890" }}>
                      {(CURRENCIES[r.displayCurrency]?.symbol||"")+(r.profit.breakeven / 0.70).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                    </div>
                    <div style={{ fontSize:10, color:"#506858", marginTop:3 }}>Healthy starting point</div>
                  </div>
                </div>
              </div>
            )}

            {/* Profit Calculator */}
            <div style={S.card}>
              <div style={S.lbl}>Profit Calculator</div>
              {r.profit ? (
                <div>
                  <div style={{ fontSize:10, color:"#5a5040", marginBottom:12, lineHeight:1.65 }}>Based on selling price of {(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.sellingPriceDisplay.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} per unit × {r.qtyN} units (in {r.displayCurrency}).</div>
                  <div className="imex-g2-profit" style={{ gap:10 }}>
                    {[
                      {label:"Selling Price Per Unit", val:(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.sellingPriceDisplay.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})},
                      {label:"Total Revenue", val:(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.totalRevenue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})},
                      {label:"Profit Per Unit", val:(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.profitPerUnit.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}), color:r.profit.profitPerUnit>0?"#60c890":"#c07070"},
                      {label:"Gross Profit", val:(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.grossProfit.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}), color:r.profit.grossProfit>0?"#60c890":"#c07070"},
                      {label:"Profit Margin %", val:r.profit.margin.toFixed(1)+"%", color:r.profit.margin>0?"#60c890":"#c07070"},
                      {label:"Break-even Price / Unit", val:(CURRENCIES[r.displayCurrency]?.symbol||"")+r.profit.breakeven.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})},
                    ].map(({label,val,color})=>(
                      <div key={label} style={{ background:"#0e0c0a", borderRadius:3, padding:"11px 13px" }}>
                        <div style={{ fontSize:9, color:"#4a4440", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:4 }}>{label}</div>
                        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:color||"#c8b898" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize:12, color:"#4a4440", fontStyle:"italic", padding:"6px 0" }}>Enter expected selling price per unit above to calculate profit, margin and break-even.</div>
              )}
            </div>

            {/* Pricing Recommendation */}
            <div style={S.card}>
              <div style={S.lbl}>Pricing Recommendation</div>
              <div style={{ fontSize:10, color:"#5a5040", marginBottom:12, lineHeight:1.65 }}>Suggested selling prices per unit based on landed cost of {fmtC(r.perUnitUSD, r.displayCurrency)}.</div>
              <div className="imex-g2-profit" style={{ gap:10 }}>
                {[
                  { label:"Break-even (0% margin)", val:fmtC(r.perUnitUSD, r.displayCurrency), color:"#c07070", note:"You cover all costs but make no profit" },
                  { label:"20% Margin Price", val:fmtC(r.perUnitUSD / 0.80, r.displayCurrency), color:"#c8a96e", note:"Conservative — fast-moving goods" },
                  { label:"30% Margin Price", val:fmtC(r.perUnitUSD / 0.70, r.displayCurrency), color:"#60c890", note:"Healthy — recommended starting point" },
                  { label:"50% Margin Price", val:fmtC(r.perUnitUSD / 0.50, r.displayCurrency), color:"#60c890", note:"Premium — niche or branded products" },
                ].map(({label, val, color, note}) => (
                  <div key={label} style={{ background:"#0e0c0a", borderRadius:3, padding:"11px 13px" }}>
                    <div style={{ fontSize:9, color:"#4a4440", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:4 }}>{label}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:color }}>{val}</div>
                    <div style={{ fontSize:10, color:"#4a4438", marginTop:3, lineHeight:1.5 }}>{note}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, fontSize:10, color:"#3a3430", lineHeight:1.65 }}>
                Margin is calculated on the selling price (not cost). Formula: Selling Price = Landed Cost ÷ (1 − margin%).
              </div>
            </div>

            {/* Quantity Comparison */}
            {(() => {
              // Compute landed cost for different quantities, holding all other variables constant.
              // Uses the exact same duty rate, freight formula, tax logic and broker logic — just changes qty + proportional weight.
              const baseQty = r.qtyN;
              const baseWeight = Math.max(1, parseFloat(form.weight) || baseQty * 0.3);
              const weightPerUnit = baseWeight / baseQty;
              const compareQtys = [100, 500, 1000, 5000];

              const rows = compareQtys.map((q) => {
                const w = q * weightPerUnit;
                const totalVal = r.unitPriceUSD * q;
                const duty = totalVal * r.dutyRate;
                const freight = calcFreight(r.shipMode, w, r.origin, r.dest);
                const insurance = totalVal * 0.005;
                const broker = Math.min(Math.max(freight * 0.05 + 40, 55), 280);
                const cif = totalVal + freight + insurance;
                const taxRes = calcDestTax(r.dest, r.category, cif, duty, r.shipMode);
                const total = totalVal + duty + freight + insurance + broker + taxRes.total + r.bioFeeN;
                const perUnit = total / q;
                const perUnitDisp = fromUSD(perUnit, r.displayCurrency);
                const totalDisp = fromUSD(total, r.displayCurrency);

                // Profit/loss at current selling price (only if user entered one)
                let profitLoss = null;
                let profitColor = "#7a7060";
                if (r.profit) {
                  const sp = r.profit.sellingPriceDisplay;
                  const profitPerUnit = sp - perUnitDisp;
                  const totalProfit = profitPerUnit * q;
                  profitLoss = totalProfit;
                  profitColor = totalProfit >= 0 ? "#60c890" : "#c07070";
                }

                // Recommendation
                let rec = "—", recColor = "#7a7060";
                if (r.profit) {
                  if (profitLoss > 0) { rec = "Profitable ✓"; recColor = "#60c890"; }
                  else if (profitLoss === 0) { rec = "Break-even"; recColor = "#c8a96e"; }
                  else { rec = "Loss — increase price or qty"; recColor = "#c07070"; }
                } else {
                  rec = q === baseQty ? "Your quantity" : (q > baseQty ? "Larger shipment" : "Smaller shipment");
                  recColor = q === baseQty ? "#c8a96e" : "#7a7060";
                }

                return { q, w, totalDisp, perUnitDisp, profitLoss, profitColor, rec, recColor, isBase: q === baseQty };
              });

              // Check if scaling effect is meaningful (per-unit cost drops as qty grows)
              const showScalingTip = rows[0].perUnitDisp > rows[rows.length - 1].perUnitDisp * 1.02;
              const sym = CURRENCIES[r.displayCurrency]?.symbol || "";
              const fmt = (n) => sym + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

              return (
                <div style={S.card}>
                  <div style={S.lbl}>Quantity Comparison</div>
                  <div style={{ fontSize:10, color:"#5a5040", marginBottom:12, lineHeight:1.65 }}>
                    Estimated landed cost at different shipment sizes — same product, route, duty, GST, freight mode and fees.
                  </div>
                  <div className="imex-table-wrap">
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                      <thead>
                        <tr style={{ borderBottom:"1px solid rgba(200,169,110,0.25)" }}>
                          <th style={{ textAlign:"left", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Quantity</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Total Landed</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Per Unit</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Profit/Loss</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background: row.isBase ? "rgba(200,169,110,0.05)" : "transparent" }}>
                            <td style={{ padding:"10px 6px", color: row.isBase ? "#f0e8d8" : "#c8b898", fontFamily:"'Cormorant Garamond',serif", fontSize:14 }}>
                              {row.q.toLocaleString()} units
                              <div style={{ fontSize:9, color:"#5a5040", fontFamily:"'DM Mono',monospace", marginTop:1 }}>{row.w.toFixed(0)} kg</div>
                            </td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#c8b898", fontFamily:"monospace" }}>{fmt(row.totalDisp)}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#c8a96e", fontFamily:"monospace", fontWeight:600 }}>{fmt(row.perUnitDisp)}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:row.profitColor, fontFamily:"monospace" }}>
                              {row.profitLoss === null ? "—" : (row.profitLoss >= 0 ? "+" : "") + fmt(row.profitLoss)}
                            </td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:row.recColor, fontSize:10 }}>{row.rec}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {showScalingTip && (
                    <div style={{ marginTop:12, padding:"9px 11px", background:"rgba(96,160,200,0.06)", border:"1px solid rgba(96,160,200,0.18)", borderRadius:3, fontSize:11, color:"#7090a0", lineHeight:1.6 }}>
                      ◆ Bigger shipments can reduce landed cost per unit because fixed costs (freight minimums, broker fees, clearance charges) are spread across more units.
                    </div>
                  )}
                  {!r.profit && (
                    <div style={{ marginTop:10, fontSize:10, color:"#4a4438", lineHeight:1.65, fontStyle:"italic" }}>
                      Enter an expected selling price above to see profit/loss at each quantity.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Retail Packaging Calculator */}
            {(() => {
              // Landed cost per kg in display currency
              const totalWeight = Math.max(1, parseFloat(form.weight) || r.qtyN * 0.3);
              const totalLandedDisplay = fromUSD(r.totalLandedUSD, r.displayCurrency);
              const landedCostPerKg = totalLandedDisplay / totalWeight;

              const sym = CURRENCIES[r.displayCurrency]?.symbol || "";
              const fmt = (n) => sym + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

              // Packaging costs: user-entered (AUD) or defaults, converted to display currency
              const packagingAUDtoDisp = (audCost) => audCost * (CURRENCIES[r.displayCurrency]?.rate || 1) / (CURRENCIES.AUD?.rate || 1);
              const pkg = {
                "100g": packagingAUDtoDisp(parseFloat(form.pkg100) || 0.20),
                "250g": packagingAUDtoDisp(parseFloat(form.pkg250) || 0.25),
                "500g": packagingAUDtoDisp(parseFloat(form.pkg500) || 0.35),
                "1kg":  packagingAUDtoDisp(parseFloat(form.pkg1000) || 0.50),
              };

              const packs = [
                { label:"100g pack", weightKg:0.10, packagingCost:pkg["100g"] },
                { label:"250g pack", weightKg:0.25, packagingCost:pkg["250g"] },
                { label:"500g pack", weightKg:0.50, packagingCost:pkg["500g"] },
                { label:"1kg pack",  weightKg:1.00, packagingCost:pkg["1kg"] },
              ];

              const rows = packs.map(p => {
                const productCost = landedCostPerKg * p.weightKg;
                const packCost = productCost + p.packagingCost;
                const price30 = packCost / 0.70;
                const price50 = packCost / 0.50;
                return { ...p, productCost, packCost, price30, price50 };
              });

              return (
                <div style={S.card}>
                  <div style={S.lbl}>Retail Packaging Calculator</div>
                  <div style={{ fontSize:10, color:"#5a5040", marginBottom:12, lineHeight:1.65 }}>
                    Landed cost per kg: <span style={{ color:"#c8a96e", fontFamily:"monospace", fontWeight:600 }}>{fmt(landedCostPerKg)}/kg</span> · packaging costs entered above, in {r.displayCurrency}.
                  </div>
                  <div className="imex-table-wrap">
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                      <thead>
                        <tr style={{ borderBottom:"1px solid rgba(200,169,110,0.25)" }}>
                          <th style={{ textAlign:"left", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Pack Size</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Product Cost</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>+ Packaging</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#c8a96e", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>Cost Per Pack</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#60c890", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>30% Margin</th>
                          <th style={{ textAlign:"right", padding:"8px 6px", color:"#60c890", fontWeight:400, fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase" }}>50% Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding:"10px 6px", color:"#f0e8d8", fontFamily:"'Cormorant Garamond',serif", fontSize:14 }}>{row.label}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#a89070", fontFamily:"monospace" }}>{fmt(row.productCost)}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#7a6a50", fontFamily:"monospace", fontSize:10 }}>{fmt(row.packagingCost)}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#c8a96e", fontFamily:"monospace", fontWeight:600 }}>{fmt(row.packCost)}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#60c890", fontFamily:"monospace", fontWeight:600 }}>{fmt(row.price30)}</td>
                            <td style={{ padding:"10px 6px", textAlign:"right", color:"#60c890", fontFamily:"monospace", fontWeight:600 }}>{fmt(row.price50)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop:12, padding:"10px 12px", background:"rgba(200,140,60,0.05)", border:"1px solid rgba(200,140,60,0.18)", borderRadius:3, fontSize:11, color:"#a08060", lineHeight:1.65 }}>
                    ⚑ Retail packaging can increase margin compared with bulk selling, but labelling, food standards, packaging, storage and shelf-life rules must be checked before selling.
                  </div>
                  <div style={{ marginTop:10, fontSize:10, color:"#3a3430", lineHeight:1.65 }}>
                    Formula: Pack cost = (landed cost per kg × pack weight) + packaging cost. Selling price = pack cost ÷ (1 − margin%). Update packaging costs in the form above to use your real supplier quotes.
                  </div>
                </div>
              );
            })()}

            {/* Assumptions */}
            <div style={S.card}>
              <div style={S.lbl}>⚠ Assumptions & Caveats</div>
              {r.assumptions.map((a,i)=><div key={i} style={{ fontSize:11, color:"#7a6a50", lineHeight:1.7, marginBottom:4 }}>· {a}</div>)}
            </div>

            {/* Compliance */}
            <div style={{...S.card, border:"1px solid rgba(200,90,50,0.18)", background:"#12100a"}}>
              <div style={{...S.lbl, color:"#c07050"}}>⚑ Compliance Warnings</div>
              {r.compliance.map((c,i)=><div key={i} style={{ fontSize:11, color:"#8a6050", lineHeight:1.7, marginBottom:4 }}>· {c}</div>)}
            </div>

            {/* Tips */}
            <div style={{...S.card, border:"1px solid rgba(60,160,100,0.14)", background:"#0a1310"}}>
              <div style={{...S.lbl, color:"#60c890"}}>✦ Tips & Recommendations</div>
              {r.tips.map((t,i)=><div key={i} style={{ fontSize:11, color:"#507860", lineHeight:1.7, marginBottom:4 }}>· {t}</div>)}
            </div>

            {/* Disclaimer */}
            <div style={{ fontSize:10, color:"#2a2820", lineHeight:1.9, marginTop:2, padding:"0 2px" }}>
              Disclaimer: These calculations are estimates for planning only. Actual duties, taxes, customs fees, quarantine/biosecurity charges and freight costs may vary based on HS code, product type, country rules, incoterms, shipment method and customs assessment. Always confirm with a licensed customs broker or official authority before shipping. This calculator does not support restricted, prohibited, dangerous, controlled or licence-required goods.
            </div>

            {/* Action buttons */}
            <div className="imex-actions" style={{ marginTop:20, gap:8 }}>
              <button onClick={()=>handlePrint(r)} style={{ background:"linear-gradient(135deg,#c8a96e,#a8893e)", border:"none", borderRadius:3, padding:"11px 10px", color:"#0e0c0a", fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:500, cursor:"pointer", letterSpacing:"0.06em" }}>
                ↓ Download PDF Estimate
              </button>
              <button onClick={()=>{
                const body = encodeURIComponent(
                  "IMEX AI — Import & Export Estimate\nReference: "+r.refNum+"\nDate: "+r.calcDate+"\n\nRoute: "+r.origin+" → "+r.dest+"\nProduct: "+r.category+"\nQuantity: "+r.qtyN+" units\nShipping: "+r.shipMode+" · Incoterm: "+r.incoterm+"\n\nTotal Estimated Landed Cost (USD): $"+r.totalLandedUSD.toFixed(2)+"\nLanded Cost Per Unit (USD): $"+r.perUnitUSD.toFixed(2)+"\n\nEstimate only — not a customs ruling or freight quote.\nAlways confirm with a licensed customs broker before shipping."
                );
                window.location.href="mailto:?subject=IMEX AI Estimate "+r.refNum+"&body="+body;
              }} style={{ background:"transparent", border:"1px solid rgba(200,169,110,0.25)", borderRadius:3, padding:"11px 10px", color:"#c8a96e", fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", letterSpacing:"0.06em" }}>
                ✉ Email Estimate
              </button>
              <button onClick={openBrokerForm} style={{ background:"transparent", border:"1px solid rgba(96,200,144,0.3)", borderRadius:3, padding:"11px 10px", color:"#60c890", fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:500, cursor:"pointer", letterSpacing:"0.06em" }}>
                ✦ Request Broker Quote
              </button>
              <button onClick={()=>saveEstimate(r)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:3, padding:"11px 10px", color:"#7a7060", fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", letterSpacing:"0.06em" }}>
                ⊕ Save Calculation
              </button>
              <button onClick={()=>setResult(null)} className="imex-span2" style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.07)", borderRadius:3, padding:"11px 10px", color:"#4a4540", fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", letterSpacing:"0.06em", width:"100%" }}>
                ← New Calculation
              </button>
            </div>

            {/* Broker Quote Modal */}
            {isBrokerFormOpen && (
              <div style={{ position:"fixed", inset:0, background:"rgba(6,4,2,0.88)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"12px 10px", overflowY:"auto", WebkitOverflowScrolling:"touch" }} onClick={e=>{if(e.target===e.currentTarget)closeBrokerForm();}}>
                <div style={{ width:"100%", maxWidth:540, background:"#141210", border:"1px solid rgba(200,169,110,0.22)", borderRadius:5, padding:"22px 16px", position:"relative", maxHeight:"92vh", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
                  {/* Close */}
                  <button onClick={closeBrokerForm} style={{ position:"absolute", top:14, right:16, background:"transparent", border:"none", color:"#5a5040", fontSize:20, cursor:"pointer", fontFamily:"monospace", lineHeight:1 }}>✕</button>

                  <div style={{ fontSize:9, color:"#c8a96e", letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:6 }}>◆ IMEX AI</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:"#f0e8d8", fontWeight:400, marginBottom:4 }}>Request Broker Quote</div>
                  <div style={{ fontSize:11, color:"#6a6050", lineHeight:1.7, marginBottom:18 }}>A licensed customs broker will review your details and provide an official quote. Fields marked * are required.</div>

                  {brokerSent ? (
                    <div style={{ textAlign:"center", padding:"28px 0" }}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#60c890", marginBottom:10 }}>✓ Request Ready</div>
                      <div style={{ fontSize:12, color:"#507860", lineHeight:1.8 }}>Your email client should have opened with the pre-filled quote request.<br/>Reference: <span style={{ color:"#c8a96e" }}>{r.refNum}</span></div>
                      <button onClick={closeBrokerForm} style={{ marginTop:18, background:"linear-gradient(135deg,#60c890,#3ea870)", border:"none", borderRadius:3, padding:"9px 22px", color:"#0a140e", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600, cursor:"pointer" }}>Done</button>
                    </div>
                  ) : (
                    <div>
                      {/* Contact */}
                      <div className="imex-broker-contact">
                        {[["Name *","name","Your full name","text"],["Email *","email","you@example.com","email"]].map(([lbl,key,ph,type])=>(
                          <div key={key}><label style={{ fontSize:10, color:"#7a7060", letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginBottom:4 }}>{lbl}</label>
                            <input type={type} value={brokerFields[key]} onChange={e=>setBF(key,e.target.value)} placeholder={ph} style={{ width:"100%", background:"#0e0c0a", border:"1px solid rgba(200,169,110,0.18)", borderRadius:3, padding:"8px 10px", color:"#e8e0d0", fontFamily:"'DM Mono',monospace", fontSize:11, outline:"none" }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom:10 }}>
                        <label style={{ fontSize:10, color:"#7a7060", letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Phone</label>
                        <input type="tel" value={brokerFields.phone} onChange={e=>setBF("phone",e.target.value)} placeholder="+61 4xx xxx xxx" style={{ width:"100%", background:"#0e0c0a", border:"1px solid rgba(200,169,110,0.18)", borderRadius:3, padding:"8px 10px", color:"#e8e0d0", fontFamily:"'DM Mono',monospace", fontSize:11, outline:"none" }} />
                      </div>

                      {/* Pre-filled shipment info (read-only) */}
                      <div style={{ background:"rgba(200,169,110,0.05)", border:"1px solid rgba(200,169,110,0.12)", borderRadius:3, padding:"12px 14px", marginBottom:14 }}>
                        <div style={{ fontSize:9, color:"#c8a96e", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:8 }}>Shipment Details (from estimate)</div>
                        <div className="imex-broker-prefill" style={{ gap:6 }}>
                          {[
                            ["Origin", COUNTRIES[r.origin]||r.origin],
                            ["Destination", COUNTRIES[r.dest]||r.dest],
                            ["Product", form.productName||r.category],
                            ["Category", PRODUCT_CATEGORIES.find(c=>c.value===r.category)?.label||r.category],
                            ["HS Code", r.hsInfo?.code||"Unknown"],
                            ["Quantity", r.qtyN+" units"],
                            ["Weight", (Math.max(1,parseFloat(form.weight)||r.qtyN*0.3).toFixed(1))+" kg"],
                            ["Shipping", SHIP_MODES.find(m=>m.value===r.shipMode)?.label||r.shipMode],
                            ["Incoterm", r.incoterm],
                            ["Ref", r.refNum],
                          ].map(([lbl,val])=>(
                            <div key={lbl}>
                              <div style={{ fontSize:9, color:"#4a4438", textTransform:"uppercase", letterSpacing:"0.12em" }}>{lbl}</div>
                              <div style={{ fontSize:11, color:"#c8b898", marginTop:1 }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div style={{ marginBottom:14 }}>
                        <label style={{ fontSize:10, color:"#7a7060", letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Message / Special Requirements</label>
                        <textarea value={brokerFields.message} onChange={e=>setBF("message",e.target.value)} placeholder="Any special handling, compliance notes, urgency, or questions for the broker..." rows={3} style={{ width:"100%", background:"#0e0c0a", border:"1px solid rgba(200,169,110,0.18)", borderRadius:3, padding:"8px 10px", color:"#e8e0d0", fontFamily:"'DM Mono',monospace", fontSize:11, outline:"none", resize:"vertical" }} />
                      </div>

                      {/* Submit */}
                      <button onClick={()=>{
                        if (!brokerFields.name.trim()||!brokerFields.email.trim()) { alert("Please enter your name and email."); return; }
                        const totalW = Math.max(1,parseFloat(form.weight)||r.qtyN*0.3);
                        const sym = CURRENCIES[r.displayCurrency]?.symbol||"";
                        const fmtV = (n)=>sym+(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
                        const body = encodeURIComponent(
                          "IMEX AI — Broker Quote Request\n"+
                          "Reference: "+r.refNum+"\n\n"+
                          "CONTACT DETAILS\n"+
                          "Name: "+brokerFields.name+"\n"+
                          "Email: "+brokerFields.email+"\n"+
                          "Phone: "+(brokerFields.phone||"Not provided")+"\n\n"+
                          "SHIPMENT DETAILS\n"+
                          "Origin: "+(COUNTRIES[r.origin]||r.origin)+"\n"+
                          "Destination: "+(COUNTRIES[r.dest]||r.dest)+"\n"+
                          "Product: "+(form.productName||r.category)+"\n"+
                          "Category: "+(PRODUCT_CATEGORIES.find(c=>c.value===r.category)?.label||r.category)+"\n"+
                          "HS Code: "+(r.hsInfo?.code||"Unknown — classification required")+"\n"+
                          "Quantity: "+r.qtyN+" units\n"+
                          "Total Weight: "+totalW.toFixed(1)+" kg\n"+
                          "Shipping Mode: "+(SHIP_MODES.find(m=>m.value===r.shipMode)?.label||r.shipMode)+"\n"+
                          "Incoterm: "+r.incoterm+"\n\n"+
                          "ESTIMATE SUMMARY\n"+
                          "Total Landed Cost: "+fmtV(fromUSD(r.totalLandedUSD,r.displayCurrency))+" "+r.displayCurrency+"\n"+
                          "Landed Cost Per Unit: "+fmtV(fromUSD(r.perUnitUSD,r.displayCurrency))+" "+r.displayCurrency+"\n\n"+
                          "MESSAGE / SPECIAL REQUIREMENTS\n"+
                          (brokerFields.message||"None provided")+"\n\n"+
                          "---\n"+
                          "Generated by IMEX AI Import & Export Cost Calculator\n"+
                          "Estimate only — not a customs ruling or freight quote.\n"+
                          "Always confirm with a licensed customs broker before shipping."
                        );
                        window.location.href="mailto:?subject=Imex AI Broker Quote Request - "+r.refNum+"&body="+body;
                        setBrokerSent(true);
                      }} style={{ width:"100%", background:"linear-gradient(135deg,#60c890,#3ea870)", border:"none", borderRadius:3, padding:"12px", color:"#0a140e", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:"0.06em" }}>
                        ✦ Send Quote Request →
                      </button>
                      <div style={{ marginTop:8, fontSize:10, color:"#3a3430", textAlign:"center", lineHeight:1.55 }}>Opens your email client with a pre-filled request. Your details are not stored by IMEX AI.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Saved Estimates */}
        <div style={{ marginTop:32, paddingBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:10, color:"#c8a96e", letterSpacing:"0.24em", textTransform:"uppercase" }}>Saved Estimates</div>
            {savedEstimates.length > 0 && (
              <button onClick={clearSaved} style={{ background:"transparent", border:"1px solid rgba(200,80,60,0.25)", borderRadius:2, padding:"4px 10px", color:"#c07060", fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer", letterSpacing:"0.06em" }}>
                Clear Saved Estimates
              </button>
            )}
          </div>
          {!lsAvailable ? (
            <div style={{ fontSize:11, color:"#5a5040", fontStyle:"italic", padding:"12px 14px", background:"#141210", border:"1px solid rgba(200,169,110,0.1)", borderRadius:3 }}>
              Saving is not available in this browser environment.
            </div>
          ) : savedEstimates.length === 0 ? (
            <div style={{ fontSize:11, color:"#3a3430", fontStyle:"italic", padding:"12px 14px", background:"#141210", border:"1px solid rgba(200,169,110,0.08)", borderRadius:3 }}>
              No saved estimates yet. Click "⊕ Save Calculation" after calculating to save up to 5 estimates.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {savedEstimates.map((e, i) => (
                <div key={e.ref+i} style={{ background:"#141210", border:"1px solid rgba(200,169,110,0.14)", borderRadius:3, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                    <div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#c8a96e", letterSpacing:"0.06em" }}>{e.ref}</div>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:"#f0e8d8", marginTop:2 }}>{e.product || "—"}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:"#5a5040" }}>{e.date}</div>
                      <div style={{ fontSize:11, color:"#7a7060", marginTop:2 }}>{e.origin} → {e.dest}</div>
                    </div>
                  </div>
                  <div className="imex-g2-saved" style={{ gap:8 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#4a4438", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>Total Landed</div>
                      <div style={{ fontSize:12, color:"#c8b898", fontFamily:"monospace" }}>{e.totalLanded}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#4a4438", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>Gross Profit</div>
                      <div style={{ fontSize:12, fontFamily:"monospace", color: e.grossProfit==="—" ? "#5a5040" : (e.grossProfit.startsWith("-") ? "#c07070" : "#60c890") }}>{e.grossProfit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#4a4438", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>Margin</div>
                      <div style={{ fontSize:12, fontFamily:"monospace", color:"#c8a96e" }}>{e.margin}</div>
                    </div>
                  </div>
                  <div style={{ marginTop:8, fontSize:10, color:"#3a3430" }}>
                    HS: {e.hsCode} · Qty: {e.qty} units · Per unit: {e.perUnit} · Selling: {e.sellingPrice}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
