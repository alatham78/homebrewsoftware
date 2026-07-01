import { useState } from 'react';
import {
  abv,
  gravityAtVolume,
  hydrometerCorrection,
  primingSugarGrams,
  strikeWaterTempF,
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
  const grams = primingSugarGrams(gal, temp, vols);
  return (
    <section className="card">
      <h2 className="section-title">Priming sugar</h2>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Num label="Beer volume (gal)" value={gal} onChange={setGal} step={0.25} />
        <Num label="Beer temp (°F)" value={temp} onChange={setTemp} step={1} />
        <Num label="Target CO₂ (vols)" value={vols} onChange={setVols} step={0.1} />
      </div>
      <div className="calc-result">
        <strong>{grams.toFixed(0)} g corn sugar</strong>
        That’s {(grams / 28.35).toFixed(1)} oz of dextrose at bottling
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
        <PrimingCalc />
        <HydrometerCalc />
        <DilutionCalc />
      </div>
    </>
  );
}
