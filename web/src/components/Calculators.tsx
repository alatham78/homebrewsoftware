import { useState } from 'react';
import {
  abv,
  abvFromRefractometer,
  brixToSg,
  cellsNeededBillion,
  fgFromRefractometer,
  gravityAtVolume,
  hydrometerCorrection,
  kegPsi,
  packCellsBillion,
  PRIMING_SUGARS,
  primingSugarGramsFor,
  recommendStarter,
  strikeWaterTempF,
  type BeerFerment,
  type YeastForm,
} from '@brewhaus/core';

function Num({ label, value, onChange, step = 0.001 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="field">
      {label}
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function AbvCalc() {
  const [og, setOg] = useState(1.052);
  const [fg, setFg] = useState(1.011);
  return (
    <section className="card">
      <h2 className="section-title">ABV</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Num label="Original gravity" value={og} onChange={setOg} />
        <Num label="Final gravity" value={fg} onChange={setFg} />
      </div>
      <div className="calc-result">
        <strong>{abv(og, fg).toFixed(2)}% ABV</strong>
        Apparent attenuation {og > 1 ? (((og - fg) / (og - 1)) * 100).toFixed(0) : 0}%
      </div>
    </section>
  );
}

function StrikeCalc() {
  const [ratio, setRatio] = useState(1.5);
  const [grainTemp, setGrainTemp] = useState(70);
  const [target, setTarget] = useState(152);
  const [grainLb, setGrainLb] = useState(11);
  return (
    <section className="card">
      <h2 className="section-title">Strike water</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Num label="Ratio (qt/lb)" value={ratio} onChange={setRatio} step={0.25} />
        <Num label="Grain weight (lb)" value={grainLb} onChange={setGrainLb} step={0.5} />
        <Num label="Grain temp (°F)" value={grainTemp} onChange={setGrainTemp} step={1} />
        <Num label="Target mash temp (°F)" value={target} onChange={setTarget} step={1} />
      </div>
      <div className="calc-result">
        <strong>{strikeWaterTempF(ratio, grainTemp, target).toFixed(1)} °F</strong>
        Using {(ratio * grainLb).toFixed(1)} qt ({((ratio * grainLb) / 4).toFixed(2)} gal) of strike water
      </div>
    </section>
  );
}

function PrimingCalc() {
  const [gal, setGal] = useState(5);
  const [temp, setTemp] = useState(68);
  const [vols, setVols] = useState(2.4);
  const [sugar, setSugar] = useState('corn');
  const grams = primingSugarGramsFor(sugar, gal, temp, vols);
  const sugarName = PRIMING_SUGARS.find((s) => s.id === sugar)?.name ?? 'sugar';
  return (
    <section className="card">
      <h2 className="section-title">Priming sugar (bottles)</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Num label="Beer volume (gal)" value={gal} onChange={setGal} step={0.25} />
        <Num label="Beer temp (°F)" value={temp} onChange={setTemp} step={1} />
        <Num label="Target CO₂ (vols)" value={vols} onChange={setVols} step={0.1} />
      </div>
      <label className="field" style={{ marginTop: 14 }}>
        Sugar
        <select value={sugar} onChange={(e) => setSugar(e.target.value)}>
          {PRIMING_SUGARS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="calc-result">
        <strong>{grams.toFixed(0)} g {sugarName.toLowerCase()}</strong>
        That’s {(grams / 28.35).toFixed(1)} oz at bottling
      </div>
    </section>
  );
}

function KegCalc() {
  const [temp, setTemp] = useState(38);
  const [vols, setVols] = useState(2.4);
  const psi = kegPsi(temp, vols);
  return (
    <section className="card">
      <h2 className="section-title">Keg force carbonation</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Num label="Keg temp (°F)" value={temp} onChange={setTemp} step={1} />
        <Num label="Target CO₂ (vols)" value={vols} onChange={setVols} step={0.1} />
      </div>
      <div className="calc-result">
        <strong>{psi.toFixed(1)} PSI</strong>
        Set-and-forget regulator pressure; allow ~1–2 weeks to equilibrate
      </div>
    </section>
  );
}

function PitchCalc() {
  const [og, setOg] = useState(1.052);
  const [gal, setGal] = useState(5);
  const [ferment, setFerment] = useState<BeerFerment>('ale');
  const [packs, setPacks] = useState(1);
  const [form, setForm] = useState<YeastForm>('liquid');
  const [ageDays, setAgeDays] = useState(30);

  const needed = cellsNeededBillion(og, gal, ferment);
  const available = packCellsBillion(packs, ageDays, form);
  const plan = recommendStarter(needed, available);

  return (
    <section className="card">
      <h2 className="section-title">Yeast pitch & starter</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Num label="Original gravity" value={og} onChange={setOg} />
        <Num label="Volume (gal)" value={gal} onChange={setGal} step={0.25} />
        <label className="field">
          Fermentation
          <select value={ferment} onChange={(e) => setFerment(e.target.value as BeerFerment)}>
            <option value="ale">ale</option>
            <option value="hybrid">hybrid</option>
            <option value="lager">lager</option>
          </select>
        </label>
        <Num label="Packs" value={packs} onChange={setPacks} step={1} />
        <label className="field">
          Form
          <select value={form} onChange={(e) => setForm(e.target.value as YeastForm)}>
            <option value="liquid">liquid (~100 B)</option>
            <option value="dry">dry (~200 B)</option>
          </select>
        </label>
        <Num label="Pack age (days)" value={ageDays} onChange={setAgeDays} step={1} />
      </div>
      <div className="calc-result">
        <strong>
          {plan.liters === 0
            ? 'No starter needed'
            : plan.sufficient
              ? `Make a ${plan.liters} L starter`
              : `Even a 4 L starter falls short — add a pack`}
        </strong>
        Need ~{Math.round(needed)} B cells · have ~{Math.round(available)} B viable
        {plan.liters > 0 && ` · starter yields ~${Math.round(plan.finalBillion)} B`}
      </div>
    </section>
  );
}

function RefractometerCalc() {
  const [ob, setOb] = useState(12.5);
  const [fb, setFb] = useState(6);
  const [wcf, setWcf] = useState(1.04);
  const og = brixToSg(ob, wcf);
  const fg = fgFromRefractometer(ob, fb, wcf);
  return (
    <section className="card">
      <h2 className="section-title">Refractometer</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Num label="Original (°Brix)" value={ob} onChange={setOb} step={0.1} />
        <Num label="Current (°Brix)" value={fb} onChange={setFb} step={0.1} />
        <Num label="Wort correction" value={wcf} onChange={setWcf} step={0.01} />
      </div>
      <div className="calc-result">
        <strong>{abvFromRefractometer(ob, fb, wcf).toFixed(1)}% ABV</strong>
        OG {og.toFixed(3)} · FG {fg.toFixed(3)} (alcohol-corrected, Terrill linear)
      </div>
    </section>
  );
}

function HydrometerCalc() {
  const [sg, setSg] = useState(1.05);
  const [sample, setSample] = useState(90);
  const [calib, setCalib] = useState(60);
  return (
    <section className="card">
      <h2 className="section-title">Hydrometer correction</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Num label="Measured SG" value={sg} onChange={setSg} />
        <Num label="Sample temp (°F)" value={sample} onChange={setSample} step={1} />
        <Num label="Calibrated at (°F)" value={calib} onChange={setCalib} step={1} />
      </div>
      <div className="calc-result">
        <strong>{hydrometerCorrection(sg, sample, calib).toFixed(4)} SG</strong>
        True gravity corrected for sample temperature
      </div>
    </section>
  );
}

function DilutionCalc() {
  const [sg, setSg] = useState(1.08);
  const [from, setFrom] = useState(5);
  const [to, setTo] = useState(6);
  return (
    <section className="card">
      <h2 className="section-title">Dilution & boil-off</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Num label="Current gravity" value={sg} onChange={setSg} />
        <Num label="Current volume (gal)" value={from} onChange={setFrom} step={0.25} />
        <Num label="New volume (gal)" value={to} onChange={setTo} step={0.25} />
      </div>
      <div className="calc-result">
        <strong>{gravityAtVolume(sg, from, to).toFixed(3)} SG</strong>
        {to > from ? 'After topping up with water' : 'After boiling down'}
      </div>
    </section>
  );
}

export function Calculators() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Brewing tools</h1>
          <p className="page-sub">Quick calculators for brew day and packaging</p>
        </div>
      </div>
      <div className="calc-grid">
        <AbvCalc />
        <StrikeCalc />
        <PitchCalc />
        <PrimingCalc />
        <KegCalc />
        <RefractometerCalc />
        <HydrometerCalc />
        <DilutionCalc />
      </div>
    </>
  );
}
