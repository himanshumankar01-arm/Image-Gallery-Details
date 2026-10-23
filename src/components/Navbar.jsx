import { useStore } from "../lib/store.jsx";

export default function Navbar({ current }) {
  const { favourites, theme, setTheme } = useStore();
  const links = [
    ["home", "#/", "Home"],
    ["favourites", "#/favourites", `Favourites${favourites.length ? ` (${favourites.length})` : ""}`],
    ["manage", "#/manage", "Manage"],
  ];
  const next = { system: "dark", dark: "light", light: "system" }[theme];
  const icon = { system: "◐", dark: "☾", light: "☀" }[theme];
  return (
    <header className="nav">
      <a className="brand" href="#/">
        My Favourites
      </a>
      <nav aria-label="Main">
        {links.map(([id, href, label]) => (
          <a key={id} href={href} className={current === id ? "active" : ""} aria-current={current === id ? "page" : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="theme-btn"
        onClick={() => setTheme(next)}
        aria-label={`Theme: ${theme}. Switch to ${next}`}
        title={`Theme: ${theme} (click for ${next})`}
      >
        <span aria-hidden="true">{icon}</span>
        <span className="theme-label">{theme}</span>
      </button>
    </header>
  );
}