import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CATEGORIES, DEFAULT_PEOPLE } from "../data/people.js";
import { slugify } from "./utils.js";

const KEYS = {
  people: "mf.people.v1",
  favs: "mf.favourites.v1",
  views: "mf.views.v1",
  theme: "mf.theme.v1",
  picks: "mf.picks.v1",
};

function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const Store = createContext(null);
export const useStore = () => useContext(Store);

export function StoreProvider({ children }) {
  // null means "use the defaults from data/people.js".
  const [customPeople, setCustomPeople] = useState(() => load(KEYS.people, null));
  const [favourites, setFavourites] = useState(() => load(KEYS.favs, []));
  const [views, setViews] = useState(() => load(KEYS.views, {}));
  const [theme, setTheme] = useState(() => load(KEYS.theme, "system"));
  const [picks, setPicks] = useState(() => load(KEYS.picks, {}));
  const [saveError, setSaveError] = useState("");

  const people = customPeople || DEFAULT_PEOPLE;

  useEffect(() => {
    if (!save(KEYS.favs, favourites)) setSaveError("Could not save to this browser.");
  }, [favourites]);
  useEffect(() => void save(KEYS.views, views), [views]);
  useEffect(() => void save(KEYS.picks, picks), [picks]);
  useEffect(() => {
    save(KEYS.theme, theme);
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  const commitPeople = useCallback((next) => {
    setCustomPeople(next);
    const ok = save(KEYS.people, next);
    setSaveError(ok ? "" : "Your changes could not be saved (browser storage is full or blocked).");
  }, []);

  const toggleFavourite = useCallback(
    (id) => setFavourites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    []
  );

  const recordView = useCallback((id) => setViews((v) => ({ ...v, [id]: (v[id] || 0) + 1 })), []);

  const savePerson = useCallback(
    (person) => {
      const base = customPeople || DEFAULT_PEOPLE;
      const exists = base.some((p) => p.id === person.id);
      let id = person.id;
      if (!exists) {
        const root = slugify(person.name);
        id = root;
        let n = 2;
        while (base.some((p) => p.id === id)) id = `${root}-${n++}`;
      }
      const record = { ...person, id };
      commitPeople(exists ? base.map((p) => (p.id === id ? record : p)) : [...base, record]);
      return id;
    },
    [customPeople, commitPeople]
  );

  const removePerson = useCallback(
    (id) => {
      commitPeople((customPeople || DEFAULT_PEOPLE).filter((p) => p.id !== id));
      setFavourites((f) => f.filter((x) => x !== id));
    },
    [customPeople, commitPeople]
  );

  const resetPeople = useCallback(() => {
    setCustomPeople(null);
    save(KEYS.people, null);
    setSaveError("");
  }, []);

  const value = useMemo(
    () => ({
      categories: CATEGORIES,
      people,
      isCustomised: customPeople !== null,
      favourites,
      views,
      theme,
      setTheme,
      picks,
      setPicks,
      saveError,
      toggleFavourite,
      recordView,
      savePerson,
      removePerson,
      resetPeople,
      getPerson: (id) => people.find((p) => p.id === id),
    }),
    [people, customPeople, favourites, views, theme, picks, saveError, toggleFavourite, recordView, savePerson, removePerson, resetPeople]
  );

  return <Store.Provider value={value}>{children}</Store.Provider>;
}