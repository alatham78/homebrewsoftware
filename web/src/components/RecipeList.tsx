import { recipeStats, srmToHex, styleById, type Recipe } from '@brewhaus/core';

interface Props {
  recipes: Recipe[];
  source: 'cloud' | 'local';
  onOpen: (recipe: Recipe) => void;
  onCreate: () => void;
}

export function RecipeList({ recipes, source, onOpen, onCreate }: Props) {
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
        <button className="btn primary" onClick={onCreate}>
          + New recipe
        </button>
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
