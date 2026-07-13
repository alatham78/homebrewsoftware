import { useMemo, useState } from 'react';
import { FERMENTABLES, HOPS, YEASTS, type Recipe } from '@brewhaus/core';
import {
  INVENTORY_UNITS,
  inventory,
  onHand,
  recipeNeeds,
  useInventory,
  type InventoryKind,
} from '../lib/inventory';

const KINDS: InventoryKind[] = ['fermentable', 'hop', 'yeast', 'misc'];

export function InventoryPage({ recipes }: { recipes: Recipe[] }) {
  const items = useInventory();
  const [kind, setKind] = useState<InventoryKind>('fermentable');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(1);
  const [cost, setCost] = useState<number | ''>('');
  const [shoppingRecipeId, setShoppingRecipeId] = useState('');

  const suggestions =
    kind === 'fermentable' ? FERMENTABLES.map((f) => f.name)
    : kind === 'hop' ? HOPS.map((h) => h.name)
    : kind === 'yeast' ? YEASTS.map((y) => y.name)
    : [];

  const add = () => {
    if (!name.trim() || amount <= 0) return;
    inventory.add({
      kind,
      name: name.trim(),
      amount,
      unit: INVENTORY_UNITS[kind],
      costPerUnit: cost === '' ? undefined : cost,
    });
    setName('');
    setAmount(1);
    setCost('');
  };

  const shoppingRecipe = recipes.find((r) => r.id === shoppingRecipeId);
  const shopping = useMemo(
    () =>
      shoppingRecipe
        ? recipeNeeds(shoppingRecipe).map((n) => ({ ...n, have: onHand(n.kind, n.name) }))
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shoppingRecipe, items],
  );

  const totalValue = items.reduce((s, i) => s + (i.costPerUnit ?? 0) * i.amount, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">
            {items.length} item{items.length === 1 ? '' : 's'} on hand
            {totalValue > 0 && ` · ~$${totalValue.toFixed(2)} in stock`} · stored on this device
          </p>
        </div>
      </div>

      <div className="stack">
        <section className="card">
          <h2 className="section-title">Add stock</h2>
          <div className="field-row" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr auto', alignItems: 'end' }}>
            <label className="field">
              Kind
              <select value={kind} onChange={(e) => setKind(e.target.value as InventoryKind)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k} ({INVENTORY_UNITS[k]})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Ingredient
              <input
                list="inventory-suggestions"
                value={name}
                placeholder="Match recipe ingredient names for auto-deduct"
                onChange={(e) => setName(e.target.value)}
              />
              <datalist id="inventory-suggestions">
                {suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <label className="field">
              Amount ({INVENTORY_UNITS[kind]})
              <input type="number" min={0} step={0.25} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </label>
            <label className="field">
              Cost/unit ($, optional)
              <input
                type="number"
                min={0}
                step={0.01}
                value={cost}
                placeholder="—"
                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
            <button className="btn primary" disabled={!name.trim() || amount <= 0} onClick={add}>
              Add
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">On hand</h2>
          {items.length === 0 ? (
            <p className="empty-hint">Nothing in stock yet — add your grain, hops, and yeast above.</p>
          ) : (
            <table className="ingredients">
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Ingredient</th>
                  <th className="num">Amount</th>
                  <th className="num">Value</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {KINDS.flatMap((k) =>
                  items
                    .filter((i) => i.kind === k)
                    .map((i) => (
                      <tr key={i.id}>
                        <td style={{ color: 'var(--ink-muted)' }}>{i.kind}</td>
                        <td>{i.name}</td>
                        <td className="num">
                          {i.amount} {i.unit}
                        </td>
                        <td className="num">
                          {i.costPerUnit !== undefined ? `$${(i.costPerUnit * i.amount).toFixed(2)}` : '—'}
                        </td>
                        <td className="num">
                          <button
                            className="btn subtle sm danger"
                            aria-label={`Remove ${i.name}`}
                            onClick={() => inventory.remove(i.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )),
                )}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Shopping list</h2>
          <div className="field-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <label className="field">
              For recipe
              <select value={shoppingRecipeId} onChange={(e) => setShoppingRecipeId(e.target.value)}>
                <option value="">— pick a recipe —</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {shopping.length > 0 && (
            <table className="ingredients" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th className="num">Needed</th>
                  <th className="num">On hand</th>
                  <th className="num">To buy</th>
                </tr>
              </thead>
              <tbody>
                {shopping.map((n) => {
                  const short = Math.max(0, Math.round((n.needed - n.have) * 100) / 100);
                  return (
                    <tr key={`${n.kind}:${n.name}`}>
                      <td>{n.name}</td>
                      <td className="num">
                        {n.needed} {n.unit}
                      </td>
                      <td className="num">
                        {n.have} {n.unit}
                      </td>
                      <td className="num">
                        {short > 0 ? (
                          <strong style={{ color: 'var(--meter-out)' }}>
                            {short} {n.unit}
                          </strong>
                        ) : (
                          <span style={{ color: 'var(--meter-in)' }}>✓ stocked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
