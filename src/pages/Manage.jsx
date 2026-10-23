import { useState } from "react";
import Photo from "../components/Photo.jsx";
import { useStore } from "../lib/store.jsx";
import { go } from "../lib/useHashRoute.js";
import {
  categoryOf,
  fileToDataUrl,
  filmsToText,
  linesToList,
  statsToText,
  textToFilms,
  textToStats,
  textToTimeline,
  timelineToText,
} from "../lib/utils.js";

function toForm(p, defaultCategory) {
  const c = p?.cricket || {};
  return {
    id: p?.id || "",
    name: p?.name || "",
    category: p?.category || defaultCategory,
    nickname: p?.nickname || "",
    dob: p?.dob || "",
    birthplace: p?.birthplace || "",
    nationality: p?.nationality || "Indian",
    profession: p?.profession || "",
    yearsActive: p?.yearsActive || "",
    image: p?.image || "",
    tagline: p?.tagline || "",
    bio: (Array.isArray(p?.bio) ? p.bio : [p?.bio || ""]).join("\n\n"),
    achievements: timelineToText(p?.achievements),
    awards: (p?.awards || []).join("\n"),
    gallery: (p?.gallery || []).join("\n"),
    social: Object.entries(p?.social || {})
      .map(([k, v]) => `${k} | ${v}`)
      .join("\n"),
    films: filmsToText(p?.films),
    battingStyle: c.battingStyle || "",
    bowlingStyle: c.bowlingStyle || "",
    role: c.role || "",
    teams: (c.teams || []).join(", "),
    debut: c.debut || "",
    statsAsOf: c.statsAsOf || "",
    stats: statsToText(c.stats),
    records: (c.records || []).join("\n"),
    _original: p || null,
  };
}

function fromForm(f) {
  const base = f._original || {};
  const person = {
    ...base,
    id: f.id,
    name: f.name.trim(),
    category: f.category,
    nickname: f.nickname.trim(),
    dob: f.dob,
    birthplace: f.birthplace.trim(),
    nationality: f.nationality.trim(),
    profession: f.profession.trim(),
    yearsActive: f.yearsActive.trim(),
    image: f.image.trim(),
    tagline: f.tagline.trim(),
    bio: f.bio
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean),
    achievements: textToTimeline(f.achievements),
    awards: linesToList(f.awards),
    gallery: linesToList(f.gallery),
    social: Object.fromEntries(
      linesToList(f.social)
        .map((l) => l.split("|").map((x) => x.trim()))
        .filter(([k, v]) => k && v)
    ),
  };
  if (f.category === "cricketer") {
    person.cricket = {
      ...(base.cricket || {}),
      battingStyle: f.battingStyle.trim(),
      bowlingStyle: f.bowlingStyle.trim(),
      role: f.role.trim(),
      teams: f.teams.split(",").map((s) => s.trim()).filter(Boolean),
      debut: f.debut.trim(),
      statsAsOf: f.statsAsOf.trim(),
      stats: textToStats(f.stats),
      records: linesToList(f.records),
    };
    delete person.films;
  } else {
    person.films = textToFilms(f.films);
    delete person.cricket;
  }
  return person;
}

function Field({ label, id, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

function PersonForm({ initial, categories, onSave, onCancel }) {
  const [f, setF] = useState(() => toForm(initial, categories[0].id));
  const [error, setError] = useState("");
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));
  const isCricketer = f.category === "cricketer";

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setF((prev) => ({ ...prev, image: url }));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return setError("Please enter a name.");
    if (f.dob && Number.isNaN(new Date(f.dob).getTime())) return setError("Date of birth is not valid.");
    onSave(fromForm(f));
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>{initial ? `Edit ${initial.name}` : "Add a person"}</h2>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      <div className="form-grid">
        <Field label="Name *" id="f-name">
          <input id="f-name" value={f.name} onChange={set("name")} required />
        </Field>
        <Field label="Category" id="f-cat">
          <select id="f-cat" value={f.category} onChange={set("category")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.single}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nickname(s)" id="f-nick">
          <input id="f-nick" value={f.nickname} onChange={set("nickname")} />
        </Field>
        <Field label="Date of birth" id="f-dob">
          <input id="f-dob" type="date" value={f.dob} onChange={set("dob")} />
        </Field>
        <Field label="Birthplace" id="f-bp">
          <input id="f-bp" value={f.birthplace} onChange={set("birthplace")} />
        </Field>
        <Field label="Nationality" id="f-nat">
          <input id="f-nat" value={f.nationality} onChange={set("nationality")} />
        </Field>
        <Field label="Profession" id="f-prof">
          <input id="f-prof" value={f.profession} onChange={set("profession")} />
        </Field>
        <Field label="Years active" id="f-years" hint="For example 2007–present">
          <input id="f-years" value={f.yearsActive} onChange={set("yearsActive")} />
        </Field>
      </div>

      <Field label="Photo" id="f-image" hint="A file name from public/images, a web address, or upload a photo (it is shrunk and kept in this browser).">
        <div className="photo-field">
          <div className="mini-photo">
            <Photo name={f.name || "New person"} image={f.image} />
          </div>
          <div className="photo-inputs">
            <input id="f-image" value={f.image.startsWith("data:") ? "(uploaded photo)" : f.image} readOnly={f.image.startsWith("data:")} onChange={set("image")} placeholder="name.jpg or https://…" />
            <input type="file" accept="image/*" onChange={onFile} aria-label="Upload a photo" />
          </div>
        </div>
      </Field>

      <Field label="One-line summary" id="f-tag">
        <input id="f-tag" value={f.tagline} onChange={set("tagline")} />
      </Field>
      <Field label="Biography" id="f-bio" hint="Separate paragraphs with a blank line.">
        <textarea id="f-bio" rows={6} value={f.bio} onChange={set("bio")} />
      </Field>
      <Field label="Career timeline" id="f-ach" hint="One per line: year | what happened">
        <textarea id="f-ach" rows={6} value={f.achievements} onChange={set("achievements")} />
      </Field>
      <Field label="Awards and honours" id="f-awards" hint="One per line.">
        <textarea id="f-awards" rows={4} value={f.awards} onChange={set("awards")} />
      </Field>

      {isCricketer ? (
        <fieldset>
          <legend>Cricket details</legend>
          <div className="form-grid">
            <Field label="Batting style" id="f-bat">
              <input id="f-bat" value={f.battingStyle} onChange={set("battingStyle")} />
            </Field>
            <Field label="Bowling style" id="f-bowl">
              <input id="f-bowl" value={f.bowlingStyle} onChange={set("bowlingStyle")} />
            </Field>
            <Field label="Playing role" id="f-role">
              <input id="f-role" value={f.role} onChange={set("role")} />
            </Field>
            <Field label="Teams" id="f-teams" hint="Comma separated">
              <input id="f-teams" value={f.teams} onChange={set("teams")} />
            </Field>
            <Field label="Debut" id="f-debut">
              <input id="f-debut" value={f.debut} onChange={set("debut")} />
            </Field>
            <Field label="Stats are as of" id="f-asof">
              <input id="f-asof" value={f.statsAsOf} onChange={set("statsAsOf")} />
            </Field>
          </div>
          <Field label="Statistics" id="f-stats" hint="One per line: format | matches | runs | bat avg | 100s | wickets">
            <textarea id="f-stats" rows={4} value={f.stats} onChange={set("stats")} />
          </Field>
          <Field label="Records and milestones" id="f-records" hint="One per line.">
            <textarea id="f-records" rows={4} value={f.records} onChange={set("records")} />
          </Field>
        </fieldset>
      ) : (
        <Field
          label="Filmography"
          id="f-films"
          hint="One per line: title | year | character | genre | language | director | co-stars (comma separated) | popular (optional)"
        >
          <textarea id="f-films" rows={8} value={f.films} onChange={set("films")} />
        </Field>
      )}

      <Field label="Extra photos" id="f-gallery" hint="One per line: file name or web address.">
        <textarea id="f-gallery" rows={3} value={f.gallery} onChange={set("gallery")} />
      </Field>
      <Field label="Social links" id="f-social" hint="One per line: label | https://… (only add links you have verified)">
        <textarea id="f-social" rows={3} value={f.social} onChange={set("social")} />
      </Field>

      <div className="actions">
        <button type="submit" className="btn primary">
          Save
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Manage() {
  const { people, categories, savePerson, removePerson, resetPeople, isCustomised, saveError } = useStore();
  const [editing, setEditing] = useState(null); // null | "new" | person id

  if (editing !== null) {
    const initial = editing === "new" ? null : people.find((p) => p.id === editing);
    return (
      <PersonForm
        key={editing}
        initial={initial}
        categories={categories}
        onCancel={() => setEditing(null)}
        onSave={(p) => {
          const id = savePerson(p);
          setEditing(null);
          go(`/profile/${id}`);
        }}
      />
    );
  }

  return (
    <section>
      <div className="section-head">
        <h1 className="page-title">Manage profiles</h1>
        <button type="button" className="btn primary" onClick={() => setEditing("new")}>
          Add a person
        </button>
      </div>
      <p className="muted">
        Changes are saved in this browser only (localStorage). There is no sign-in, so anyone using this browser can edit.
        {isCustomised ? " You are using your edited list." : " You are using the default list."}
      </p>
      {saveError && (
        <p className="alert" role="alert">
          {saveError}
        </p>
      )}

      <ul className="manage-list">
        {people.map((p) => (
          <li key={p.id}>
            <span className="mini-photo">
              <Photo name={p.name} image={p.image} />
            </span>
            <span className="manage-name">
              <strong>{p.name}</strong>
              <span className="muted small">{categoryOf(categories, p.category)?.single}</span>
            </span>
            <span className="manage-actions">
              <button type="button" className="btn" onClick={() => setEditing(p.id)} aria-label={`Edit ${p.name}`}>
                Edit
              </button>
              <button
                type="button"
                className="btn danger"
                aria-label={`Delete ${p.name}`}
                onClick={() => window.confirm(`Delete ${p.name}? This removes them from this browser's list.`) && removePerson(p.id)}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>

      {isCustomised && (
        <p>
          <button
            type="button"
            className="btn"
            onClick={() => window.confirm("Discard all your edits and go back to the default list?") && resetPeople()}
          >
            Reset to default list
          </button>
        </p>
      )}
    </section>
  );
}