export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <label htmlFor="search-input" className="sr-only">
        Search people
      </label>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        id="search-input"
        type="search"
        value={value}
        placeholder="Search by name, nickname, film or team"
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}