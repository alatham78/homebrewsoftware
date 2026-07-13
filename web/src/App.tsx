import { useCallback, useEffect, useRef, useState } from 'react';
import { newRecipe, newSession, type BrewSession, type Recipe } from '@brewhaus/core';
import { Calculators } from './components/Calculators';
import { Ingredients } from './components/Ingredients';
import { InventoryPage } from './components/InventoryPage';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeList } from './components/RecipeList';
import { SessionsPage } from './components/SessionsPage';
import { SessionView } from './components/SessionView';
import { StylesPage } from './components/StylesPage';
import { WaterPage } from './components/WaterPage';
import {
  deleteRecipe,
  deleteSession,
  listRecipes,
  listSessions,
  saveRecipe,
  saveSession,
} from './lib/store';

type Page = 'recipes' | 'batches' | 'tools' | 'ingredients' | 'water' | 'styles' | 'inventory';

const NAV: Array<{ id: Page; label: string; icon: string }> = [
  { id: 'recipes', label: 'Recipes', icon: '🍺' },
  { id: 'batches', label: 'Batches', icon: '🔥' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'tools', label: 'Brewing tools', icon: '🧮' },
  { id: 'ingredients', label: 'Ingredients', icon: '🌾' },
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'styles', label: 'Style guide', icon: '📖' },
];

export default function App() {
  const [page, setPage] = useState<Page>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sessions, setSessions] = useState<BrewSession[]>([]);
  const [source, setSource] = useState<'cloud' | 'local'>('local');
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [viewingSession, setViewingSession] = useState<BrewSession | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const sessionSaveTimer = useRef<number>();

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const refresh = useCallback(async () => {
    const { recipes: list, source: src } = await listRecipes();
    setRecipes(list);
    setSource(src);
    setSessions(await listSessions());
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

  const handleBrewDay = async (recipe: Recipe) => {
    const session = newSession(recipe);
    session.status = 'brew day';
    await saveSession(session);
    setSessions((s) => [session, ...s]);
    setEditing(null);
    setViewingSession(session);
    setPage('batches');
  };

  const handleSaveSession = (session: BrewSession) => {
    setViewingSession(session);
    setSessions((all) => [session, ...all.filter((s) => s.id !== session.id)]);
    window.clearTimeout(sessionSaveTimer.current);
    sessionSaveTimer.current = window.setTimeout(() => void saveSession(session), 700);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    setViewingSession(null);
    setSessions((all) => all.filter((s) => s.id !== id));
    showToast('Batch deleted');
  };

  const handleImport = async (imported: Recipe[]) => {
    if (imported.length === 0) {
      showToast('Nothing imported — is that a BeerXML or BrewHaus JSON file?');
      return;
    }
    for (const r of imported) await saveRecipe(r);
    await refresh();
    showToast(
      imported.length === 1
        ? `Imported “${imported[0]!.name}”`
        : `Imported ${imported.length} recipes`,
    );
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
            className={`nav-item ${page === item.id && !editing && !viewingSession ? 'active' : ''}`}
            onClick={() => {
              setEditing(null);
              setViewingSession(null);
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
            onBrewDay={(r) => void handleBrewDay(r)}
            onBack={() => {
              setEditing(null);
              void refresh();
            }}
          />
        ) : viewingSession ? (
          <SessionView
            key={viewingSession.id}
            session={viewingSession}
            recipe={recipes.find((r) => r.id === viewingSession.recipeId)}
            onSave={handleSaveSession}
            onDelete={(id) => void handleDeleteSession(id)}
            onBack={() => setViewingSession(null)}
            onToast={showToast}
          />
        ) : page === 'recipes' ? (
          <RecipeList
            recipes={recipes}
            source={source}
            onOpen={setEditing}
            onCreate={handleCreate}
            onImport={(r) => void handleImport(r)}
          />
        ) : page === 'batches' ? (
          <SessionsPage sessions={sessions} onOpen={setViewingSession} />
        ) : page === 'inventory' ? (
          <InventoryPage recipes={recipes} />
        ) : page === 'tools' ? (
          <Calculators />
        ) : page === 'water' ? (
          <WaterPage />
        ) : page === 'styles' ? (
          <StylesPage />
        ) : (
          <Ingredients />
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
