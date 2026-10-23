import { useMemo, useState } from "react";
import CategoryFilter from "../components/CategoryFilter.jsx";
import Photo from "../components/Photo.jsx";
import ProfileCard from "../components/ProfileCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useStore } from "../lib/store.jsx";

function matches(p, q) {
  if (!q) return true;
  const hay = [
    p.name,
    p.nickname,
    p.profession,
    p.birthplace,
    ...(p.films || []).map((f) => f.title),
    ...(p.cricket?.teams || []),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

function QuickPick() {
  const { categories, people, picks, setPicks } = useStore();
  const [shown, setShown] = useState(categories[0].id);
  const category = categories.find((c) => c.id === shown);
  // Like the original page, each dropdown starts on its first person until you choose.
  const pickedId = (cat) =>
    picks[cat] !== undefined ? picks[cat] : people.find((p) => p.category === cat)?.id || "";
  const person = people.find((p) => p.id === pickedId(shown));

  function choose(cat, id) {
    setPicks((prev) => ({ ...prev, [cat]: id }));
    setShown(cat);
  }

  return (
    <section aria-labelledby="top-picks">
      <h2 id="top-picks" className="sr-only">
        My top picks
      </h2>
      <div className="selects">
        {categories.map((c) => (
          <div key={c.id} className={"pick" + (c.id === shown ? " active" : "")}>
            <label htmlFor={`sel-${c.id}`}>{c.label}</label>
            <select
              id={`sel-${c.id}`}
              value={pickedId(c.id)}
              onChange={(e) => choose(c.id, e.target.value)}
              onFocus={() => setShown(c.id)}
            >
              <option value="">{c.choose}</option>
              {people
                .filter((p) => p.category === c.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div className="panel" aria-live="polite">
        <div className="frame">
          {person ? (
            <Photo name={person.name} image={person.image} />
          ) : (
            <svg viewBox="0 0 100 70" role="img" aria-label="No selection">
              <text x="50" y="38" textAnchor="middle" fontFamily="Bricolage Grotesque, Trebuchet MS, sans-serif" fontWeight="600" fontSize="7" style={{ fill: "var(--accent)" }}>
                PHOTO
              </text>
            </svg>
          )}
        </div>
        <div className="caption">
          <span className="caption-cat">{category.label}</span>
          <span className="caption-name">{person ? person.name : "Nothing selected"}</span>
          {person && <span className="caption-tag">{person.tagline}</span>}
        </div>
        {person && (
          <a className="btn primary" href={`#/profile/${person.id}`}>
            View full profile
          </a>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { people, views } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name");

  const trending = useMemo(() => {
    // Most viewed in this browser; people not yet viewed keep their listed order.
    return people
      .map((p, i) => ({ p, v: views[p.id] || 0, i }))
      .sort((a, b) => b.v - a.v || a.i - b.i)
      .slice(0, 4)
      .map((x) => ({ person: x.p, views: x.v }));
  }, [people, views]);
  const anyViews = Object.keys(views).length > 0;

  const results = useMemo(() => {
    const list = people.filter((p) => (category === "all" || p.category === category) && matches(p, query));
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      oldest: (a, b) => (a.dob || "").localeCompare(b.dob || ""),
      youngest: (a, b) => (b.dob || "").localeCompare(a.dob || ""),
      viewed: (a, b) => (views[b.id] || 0) - (views[a.id] || 0) || a.name.localeCompare(b.name),
    }[sort];
    return [...list].sort(by);
  }, [people, query, category, sort, views]);

  return (
    <>
      <QuickPick />

      <section aria-labelledby="trending">
        <div className="section-head">
          <h2 id="trending">Trending</h2>
          <span className="muted">{anyViews ? "Most viewed by you" : "Open a profile and it will start counting your most viewed"}</span>
        </div>
        <div className="grid grid-4">
          {trending.map(({ person, views: v }) => (
            <ProfileCard key={person.id} person={person} note={v ? `${v} view${v === 1 ? "" : "s"}` : undefined} />
          ))}
        </div>
      </section>

      <section aria-labelledby="browse">
        <div className="section-head">
          <h2 id="browse">Browse everyone</h2>
          <span className="muted" aria-live="polite">
            {results.length} {results.length === 1 ? "person" : "people"}
          </span>
        </div>
        <div className="toolbar">
          <SearchBar value={query} onChange={setQuery} />
          <div className="sort">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Name (A–Z)</option>
              <option value="oldest">Oldest first</option>
              <option value="youngest">Youngest first</option>
              <option value="viewed">Most viewed</option>
            </select>
          </div>
        </div>
        <CategoryFilter value={category} onChange={setCategory} />
        {results.length ? (
          <div className="grid">
            {results.map((p) => (
              <ProfileCard key={p.id} person={p} />
            ))}
          </div>
        ) : (
          <p className="empty">
            No one matches “{query}”. Try a different name, film or team
            {category !== "all" ? ", or choose All categories" : ""}.
          </p>
        )}
      </section>
    </>
  );
}