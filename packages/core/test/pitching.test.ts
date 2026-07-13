import { describe, expect, it } from 'vitest';
import {
  abvFromRefractometer,
  brixToSg,
  cellsNeededBillion,
  fgFromRefractometer,
  kegPsi,
  packCellsBillion,
  primingSugarGramsFor,
  recommendStarter,
  sgToBrix,
  starterFinalBillion,
} from '../src/index.js';

describe('pitch rates', () => {
  it('matches the classic 5 gal / 1.048 ale ballpark (~170 B)', () => {
    const cells = cellsNeededBillion(1.048, 5, 'ale');
    expect(cells).toBeGreaterThan(155);
    expect(cells).toBeLessThan(185);
  });

  it('lagers need double the ale rate', () => {
    expect(cellsNeededBillion(1.05, 5, 'lager')).toBeCloseTo(cellsNeededBillion(1.05, 5, 'ale') * 2, 5);
  });

  it('depreciates liquid packs much faster than dry', () => {
    expect(packCellsBillion(1, 0, 'liquid')).toBeCloseTo(100, 5);
    expect(packCellsBillion(1, 90, 'liquid')).toBeCloseTo(100 * (1 - 0.215 * 3), 1);
    expect(packCellsBillion(1, 90, 'dry')).toBeGreaterThan(190);
    expect(packCellsBillion(2, 3650, 'liquid')).toBeCloseTo(20, 5); // 10% floor
  });

  it('grows a starter but respects caps', () => {
    const grown = starterFinalBillion(100, 2);
    expect(grown).toBeGreaterThan(200);
    expect(grown).toBeLessThanOrEqual(100 + 400);
    expect(starterFinalBillion(10, 1)).toBeLessThanOrEqual(60); // 6x cap
    expect(starterFinalBillion(100, 0)).toBe(100);
  });

  it('recommends the smallest sufficient starter', () => {
    const plan = recommendStarter(180, 200);
    expect(plan.liters).toBe(0); // enough cells already
    const plan2 = recommendStarter(350, 100);
    expect(plan2.liters).toBeGreaterThan(0);
    expect(plan2.sufficient).toBe(true);
    expect(plan2.finalBillion).toBeGreaterThanOrEqual(350);
  });
});

describe('carbonation', () => {
  it('matches carbonation-chart anchor points', () => {
    // 38°F / 2.4 vols ≈ 11-12 PSI on standard charts
    const psi = kegPsi(38, 2.4);
    expect(psi).toBeGreaterThan(10);
    expect(psi).toBeLessThan(13);
    // colder beer needs less pressure
    expect(kegPsi(34, 2.4)).toBeLessThan(psi);
  });

  it('scales priming sugar by type', () => {
    const corn = primingSugarGramsFor('corn', 5, 68, 2.4);
    expect(primingSugarGramsFor('table', 5, 68, 2.4)).toBeCloseTo(corn * 0.91, 5);
    expect(primingSugarGramsFor('dme', 5, 68, 2.4)).toBeCloseTo(corn * 1.54, 5);
  });
});

describe('refractometer', () => {
  it('round-trips Brix and SG with wort correction', () => {
    const sg = brixToSg(12.5);
    expect(sg).toBeGreaterThan(1.047);
    expect(sg).toBeLessThan(1.05);
    expect(sgToBrix(sg) * 1.0).toBeCloseTo(12.5 / 1.04, 1);
  });

  it('computes FG from OB/FB (Terrill linear)', () => {
    // Classic check: OB 12, FB 6 → FG ≈ 1.010
    const fg = fgFromRefractometer(12, 6);
    expect(fg).toBeGreaterThan(1.005);
    expect(fg).toBeLessThan(1.013);
  });

  it('computes ABV from refractometer readings', () => {
    const a = abvFromRefractometer(12, 6);
    expect(a).toBeGreaterThan(4);
    expect(a).toBeLessThan(6);
  });
});
