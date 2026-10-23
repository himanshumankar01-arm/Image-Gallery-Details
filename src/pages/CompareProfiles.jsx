import Photo from "../components/Photo.jsx";
import { useStore } from "../lib/store.jsx";
import { ageFrom, categoryOf, formatDate } from "../lib/utils.js";
import { go } from "../lib/useHashRoute.js";

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[~,+]/g, ""));
  return Number.isNaN(n) ? null : n;
};

function buildRows(a, b, categories) {
  const rows = [
    { label: "Category", a: categoryOf(categories, a.category)?.single, b: categoryOf(categories, b.category)?.single },
    { label: "Born", a: formatDate(a.dob), b: formatDate(b.dob) },
    { label: "Age", a: ageFrom(a.dob), b: ageFrom(b.dob) },
    { label: "Birthplace", a: a.birthplace, b: b.birthplace },
    { label: "Years active", a: a.yearsActive, b: b.yearsActive },
    { label: "Profession", a: a.profession, b: b.profession },
    { label: "Career milestones listed", a: a.achievements?.length ?? 0, b: b.achievements?.length ?? 0, hl: true },
    { label: "Awards and honours listed", a: a.awards?.length ?? 0, b: b.awards?.length ?? 0, hl: true },
  ];

  if (!a.cricket && !b.cricket) {
    rows.push(
      { label: "Films listed", a: a.films?.length ?? 0, b: b.films?.length ?? 0, hl: true },
      { label: "Popular films", a: (a.films || []).filter((f) => f.popular).length, b: (b.films || []).filter((f) => f.popular).length, hl: true }
    );
    const first = (p) => [...(p.films || [])].sort((x, y) => Number(x.year) - Number(y.year))[0];
    rows.push({ label: "Earliest film listed", a: first(a) ? `${first(a).title} (${first(a).year})` : "–", b: first(b) ? `${first(b).title} (${first(b).year})` : "–" });
  }

  if (a.cricket && b.cricket) {
    rows.push(
      { label: "Batting style", a: a.cricket.battingStyle, b: b.cricket.battingStyle },
      { label: "Bowling style", a: a.cricket.bowlingStyle, b: b.cricket.bowlingStyle },
      { label: "Playing role", a: a.cricket.role, b: b.cricket.role }
    );
    ["Tests", "ODIs", "T20Is"].forEach((fmt) => {
      const sa = a.cricket.stats.find((s) => s.format === fmt);
      const sb = b.cricket.stats.find((s) => s.format === fmt);
      if (!sa || !sb) return;
      rows.push(
        { label: `${fmt}: matches`, a: sa.matches, b: sb.matches, hl: true },
        { label: `${fmt}: runs`, a: sa.runs, b: sb.runs, hl: true },
        { label: `${fmt}: batting average`, a: sa.avg, b: sb.avg, hl: true },
        { label: `${fmt}: centuries`, a: sa.hundreds, b: sb.hundreds, hl: true },
        { label: `${fmt}: wickets`, a: sa.wickets, b: sb.wickets, hl: true }
      );
    });
  }
  return rows.filter((r) => !(String(r.a ?? "–") === "–" && String(r.b ?? "–") === "–"));
}

function PersonPicker({ id, value, other, onChange, people, categories }) {
  return (
    <div className="pick">
      <label htmlFor={id}>{id === "cmp-a" ? "First person" : "Second person"}</label>
      <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a person</option>
        {categories.map((c) => (
          <optgroup key={c.id} label={c.plural}>
            {people
              .filter((p) => p.category === c.id)
              .map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === other}>
                  {p.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export default function CompareProfiles({ a: aId, b: bId }) {
  const { people, categories, getPerson } = useStore();
  const a = getPerson(aId);
  const b = getPerson(bId);

  const update = (key, val) => {
    const next = { a: a?.id || "", b: b?.id || "", [key]: val };
    const qs = [next.a && `a=${next.a}`, next.b && `b=${next.b}`].filter(Boolean).join("&");
    go(`/compare${qs ? `?${qs}` : ""}`);
  };

  const rows = a && b ? buildRows(a, b, categories) : [];

  return (
    <section>
      <h1 className="page-title">Compare profiles</h1>
      <p className="muted">Pick any two people. Values that lead in a number-based row are highlighted.</p>
      <div className="selects two">
        <PersonPicker id="cmp-a" value={a?.id} other={b?.id} onChange={(v) => update("a", v)} people={people} categories={categories} />
        <PersonPicker id="cmp-b" value={b?.id} other={a?.id} onChange={(v) => update("b", v)} people={people} categories={categories} />
      </div>

      {a && b ? (
        <div className="table-wrap">
          <table className="compare">
            <caption className="sr-only">
              Comparison of {a.name} and {b.name}
            </caption>
            <thead>
              <tr>
                <td />
                {[a, b].map((p) => (
                  <th key={p.id} scope="col">
                    <a href={`#/profile/${p.id}`} className="cmp-person">
                      <span className="cmp-photo">
                        <Photo name={p.name} image={p.image} />
                      </span>
                      <span>{p.name}</span>
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const na = num(r.a);
                const nb = num(r.b);
                const lead = r.hl && na !== null && nb !== null && na !== nb ? (na > nb ? "a" : "b") : null;
                return (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td className={lead === "a" ? "lead" : ""}>{r.a ?? "–"}</td>
                    <td className={lead === "b" ? "lead" : ""}>{r.b ?? "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">Choose two people above to see them side by side.</p>
      )}
    </section>
  );
}
