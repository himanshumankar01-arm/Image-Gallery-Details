import { useEffect, useMemo, useState } from "react";
import AchievementTimeline from "../components/AchievementTimeline.jsx";
import FavouriteButton from "../components/FavouriteButton.jsx";
import Photo from "../components/Photo.jsx";
import ProfileCard from "../components/ProfileCard.jsx";
import { useStore } from "../lib/store.jsx";
import { ageFrom, categoryOf, formatDate, profileUrl, relatedPeople, wikipediaUrl } from "../lib/utils.js";

function Detail({ label, children }) {
  if (!children) return null;
  return (
    <div className="detail">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Filmography({ films }) {
  const [order, setOrder] = useState("new");
  const [popularOnly, setPopularOnly] = useState(false);
  const list = useMemo(() => {
    const l = films.filter((f) => !popularOnly || f.popular);
    return [...l].sort((a, b) => (order === "new" ? Number(b.year) - Number(a.year) : Number(a.year) - Number(b.year)));
  }, [films, order, popularOnly]);

  if (!films.length) return <p className="muted">No films added yet.</p>;
  return (
    <>
      <div className="film-tools">
        <label>
          <input type="checkbox" checked={popularOnly} onChange={(e) => setPopularOnly(e.target.checked)} /> Popular films only
        </label>
        <label>
          Order{" "}
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
          </select>
        </label>
      </div>
      <ul className="films">
        {list.map((f) => (
          <li key={`${f.title}-${f.year}`}>
            <div className="film-head">
              <strong>{f.title}</strong>
              <span className="film-year">{f.year}</span>
              {f.popular && <span className="badge">Popular</span>}
            </div>
            <div className="film-meta">
              {[f.role && `as ${f.role}`, f.genre, f.language].filter(Boolean).join(" · ")}
            </div>
            <div className="film-meta">
              {f.director && <>Directed by {f.director}</>}
              {f.director && f.costars && " · "}
              {f.costars && <>With {f.costars}</>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function CricketStats({ cricket }) {
  const hasWickets = cricket.stats.some((s) => s.wickets && s.wickets !== "–");
  return (
    <>
      <div className="table-wrap">
        <table className="stats">
          <caption className="sr-only">Career statistics</caption>
          <thead>
            <tr>
              <th scope="col">Format</th>
              <th scope="col">Matches</th>
              <th scope="col">Runs</th>
              <th scope="col">Bat avg</th>
              <th scope="col">100s</th>
              {hasWickets && <th scope="col">Wickets</th>}
            </tr>
          </thead>
          <tbody>
            {cricket.stats.map((s) => (
              <tr key={s.format}>
                <th scope="row">{s.format}</th>
                <td>{s.matches}</td>
                <td>{s.runs}</td>
                <td>{s.avg}</td>
                <td>{s.hundreds}</td>
                {hasWickets && <td>{s.wickets}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cricket.statsAsOf && <p className="muted small">Stats: {cricket.statsAsOf}</p>}
      {cricket.records?.length > 0 && (
        <>
          <h3>Records and milestones</h3>
          <ul className="bullets">
            {cricket.records.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Gallery({ person }) {
  const images = [person.image, ...(person.gallery || [])].filter(Boolean);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  return (
    <>
      <div className="gallery">
        {images.map((img, i) => (
          <button key={i} type="button" className="thumb" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${person.name}`}>
            <Photo name={person.name} image={img} />
          </button>
        ))}
      </div>
      {images.length < 2 && (
        <p className="muted small">
          Add more photos with <code>gallery: ["file.jpg"]</code> in <code>src/data/people.js</code>, or on the Manage page.
        </p>
      )}
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Photo of ${person.name}`} onClick={() => setOpen(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <Photo name={person.name} image={images[open]} />
            <button type="button" className="btn lightbox-close" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProfileDetails({ id }) {
  const { getPerson, people, categories, recordView } = useStore();
  const person = getPerson(id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (person) recordView(person.id);
    // Count one view each time a profile is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (person) document.title = `${person.name} · My Favourites`;
    return () => void (document.title = "My Favourites");
  }, [person]);

  if (!person) {
    return (
      <div className="empty">
        <p>That profile was not found. It may have been removed on the Manage page.</p>
        <a className="btn primary" href="#/">
          Back to home
        </a>
      </div>
    );
  }

  const cat = categoryOf(categories, person.category);
  const age = ageFrom(person.dob);
  const related = relatedPeople(person, people);
  const isCricketer = !!person.cricket;

  async function share() {
    const url = profileUrl(person.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: person.name, text: person.tagline, url });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <article className="profile">
      <a className="back" href="#/">
        ← All people
      </a>

      <header className="profile-head">
        <div className="profile-photo">
          <Photo name={person.name} image={person.image} />
        </div>
        <div className="profile-intro">
          <span className="eyebrow">{cat ? cat.single : person.category}</span>
          <h1 className="page-title">{person.name}</h1>
          {person.nickname && <p className="muted">Also known as {person.nickname}</p>}
          <p className="lead">{person.tagline}</p>
          <div className="actions">
            <FavouriteButton id={person.id} name={person.name} withLabel />
            <button type="button" className="btn" onClick={share}>
              {copied ? "Link copied" : "Share profile"}
            </button>
          </div>
        </div>
      </header>

      <section className="block" aria-labelledby="personal">
        <h2 id="personal">Personal details</h2>
        <dl className="details">
          <Detail label="Full name">{person.name}</Detail>
          <Detail label="Born">{`${formatDate(person.dob)}${age !== null ? ` (age ${age})` : ""}`}</Detail>
          <Detail label="Birthplace">{person.birthplace}</Detail>
          <Detail label="Nationality">{person.nationality}</Detail>
          <Detail label="Profession">{person.profession}</Detail>
          <Detail label="Years active">{person.yearsActive}</Detail>
          {isCricketer && <Detail label="Batting style">{person.cricket.battingStyle}</Detail>}
          {isCricketer && <Detail label="Bowling style">{person.cricket.bowlingStyle}</Detail>}
          {isCricketer && <Detail label="Playing role">{person.cricket.role}</Detail>}
          {isCricketer && <Detail label="Teams">{person.cricket.teams?.join(", ")}</Detail>}
          {isCricketer && <Detail label="Debut">{person.cricket.debut}</Detail>}
        </dl>
      </section>

      <section className="block" aria-labelledby="bio">
        <h2 id="bio">Biography</h2>
        {(Array.isArray(person.bio) ? person.bio : String(person.bio || "").split(/\n{2,}/))
          .filter(Boolean)
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </section>

      <section className="block" aria-labelledby="career">
        <h2 id="career">Career and achievements</h2>
        <h3>Career timeline</h3>
        <AchievementTimeline items={person.achievements} />
        {person.awards?.length > 0 && (
          <>
            <h3>Awards and honours</h3>
            <ul className="bullets">
              {person.awards.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      {isCricketer ? (
        <section className="block" aria-labelledby="stats">
          <h2 id="stats">Cricket statistics</h2>
          <CricketStats cricket={person.cricket} />
        </section>
      ) : (
        <section className="block" aria-labelledby="films">
          <h2 id="films">Filmography</h2>
          <Filmography films={person.films || []} />
        </section>
      )}

      <section className="block" aria-labelledby="photos">
        <h2 id="photos">Photo gallery</h2>
        <Gallery person={person} />
      </section>

      <section className="block" aria-labelledby="links">
        <h2 id="links">Links</h2>
        <ul className="links">
          <li>
            <a href={wikipediaUrl(person.name)} target="_blank" rel="noopener noreferrer">
              Wikipedia
            </a>
          </li>
          {Object.entries(person.social || {})
            .filter(([, url]) => /^https?:\/\//.test(url))
            .map(([label, url]) => (
              <li key={label}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </a>
              </li>
            ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="block" aria-labelledby="related">
          <h2 id="related">Related people</h2>
          <div className="grid grid-4">
            {related.map((r) => (
              <ProfileCard key={r.person.id} person={r.person} note={r.reason} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}