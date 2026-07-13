import { useCallback, useEffect, useState } from 'react';
import { newRecipe, type Recipe } from '@brewhaus/core';
import { Calculators } from './components/Calculators';
import { Ingredients } from './components/Ingredients';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeList } from './components/RecipeList';
import { WaterPage } from './components/WaterPage';
import { deleteRecipe, listRecipes, saveRecipe } from './lib/store';

type Page = 'recipes' | 'tools' | 'ingredients' | 'water';

const NAV: Array<{ id: Page; label: string; icon: string }> = [
  { id: 'recipes', label: 'Recipes', icon: '🍺' },
  { id: 'tools', label: 'Brewing tools', icon: '🧮' },
  { id: 'ingredients', label: 'Ingredients', icon: '🌾' },
  { id: 'water', label: 'Water', icon: '💧' },
];

export default function App() {
  const [page, setPage] = useState<Page>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [source, setSource] = useState<'cloud' | 'local'>('local');
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const refresh = useCallback(async () => {
    const { recipes: list, source: src } = await listRecipes();
    setRecipes(list);
    setSource(src);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSave = async (recipe: Recipe) => {
    const saved = await saveRecipe(recipe);
    setEditing(saved);
    await refresh();
    showToast(`Saved “${saved.name}”`);
  };

  const handleDelete = async (id: string) => {
    await deleteRecipe(id);
    setEditing(null);
    await refresh();
    showToast('Recipe deleted');
  };

  const handleCreate = () => {
    setEditing(newRecipe({ name: 'New Recipe' }));
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">🍺</span> BrewHaus
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id && !editing ? 'active' : ''}`}
            onClick={() => {
              setEditing(null);
              setPage(item.id);
            }}
          >
            <span className="icon">{item.icon}</span> {item.label}
          </button>
        ))}
        <div className="sidebar-footer">
          {source === 'cloud' ? '☁ Synced with Azure' : '💾 Local device storage'}
        </div>
      </aside>

      <main className="main">
        {editing ? (
          <RecipeEditor
            key={editing.id}
            recipe={editing}
            onSave={handleSave}
            onDelete={handleDelete}
            onBack={() => {
              setEditing(null);
              void refresh();
            }}
          />
        ) : page === 'recipes' ? (
          <RecipeList recipes={recipes} source={source} onOpen={setEditing} onCreate={handleCreate} />
        ) : page === 'tools' ? (
          <Calculators />
        ) : page === 'water' ? (
          <WaterPage />
        ) : (
          <Ingredients />
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
