import { useRef } from 'react';
import { newRecipe, parseBeerXml, recipeStats, srmToHex, styleById, type Recipe } from '@brewhaus/core';

interface Props {
  recipes: Recipe[];
  source: 'cloud' | 'local';
  onOpen: (recipe: Recipe) => void;
  onCreate: () => void;
  onImport: (recipes: Recipe[]) => void;
}

/** Parse a BeerXML or BrewHaus-JSON file into recipes (fresh ids). */
function parseImport(text: string): Recipe[] {
  if (text.trimStart().startsWith('<')) return parseBeerXml(text);
  const data = JSON.parse(text) as Recipe | Recipe[];
  return (Array.isArray(data) ? data : [data]).map((r) => newRecipe({ ...r, id: undefined as unknown as string }));
}

export function RecipeList({ recipes, source, onOpen, onCreate, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = parseImport(await file.text());
      onImport(imported);
    } catch {
      onImport([]);
    }
    if (fileRef.current) fileRef.current.value = '';
  };
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Recipes</h1>
          <p className="page-sub">
            {recipes.length} recipe{recipes.length === 1 ? '' : 's'} ·{' '}
            {source === 'cloud' ? 'synced to Azure' : 'stored on this device'}
          </p>
        </div>
        <div className="row-actions">
          <input
            ref={fileRef}
            type="file"
            accept=".xml,.json,text/xml,application/json"
            style={{ display: 'none' }}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <button className="btn" title="BeerXML (.xml) from BeerSmith/Brewfather, or BrewHaus JSON" onClick={() => fileRef.current?.click()}>
            ⬆ Import
          </button>
          <button className="btn primary" onClick={onCreate}>
            + New recipe
          </button>
        </div>
      </div>

      <div className="recipe-grid">
        {recipes.map((r) => {
          const stats = recipeStats(r);
          const style = styleById(r.styleId);
          return (
            <button key={r.id} className="card recipe-card" onClick={() => onOpen(r)}>
              <div className="glass">
                <div className="foam" />
                <div className="beer" style={{ background: srmToHex(stats.srm) }} />
              </div>
              <div>
                <h3>{r.name}</h3>
                <p className="style">{style?.name ?? 'Unknown style'} · {r.batchSizeGal} gal</p>
                <div className="badges">
                  <span className="badge">{stats.og.toFixed(3)} OG</span>
                  <span className="badge">{stats.abv.toFixed(1)}% ABV</span>
                  <span className="badge">{Math.round(stats.ibu)} IBU</span>
                  <span className="badge">{stats.srm.toFixed(0)} SRM</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {recipes.length === 0 && (
        <div className="card">
          <p className="empty-hint">No recipes yet. Hit “New recipe” to design your first batch.</p>
        </div>
      )}
    </>
  );
}
