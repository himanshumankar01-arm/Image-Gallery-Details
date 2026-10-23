export function imageSrc(image) {
  if (!image) return "";
  return /^(https?:|data:)/.test(image) ? image : `${import.meta.env.BASE_URL}images/${image}`;
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function hue(name) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n = (n * 31 + name.charCodeAt(i)) % 360;
  return n;
}

export function slugify(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "person"
  );
}

export function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function formatDate(dob) {
  if (!dob) return "–";
  const d = new Date(dob + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function categoryOf(categories, id) {
  return categories.find((c) => c.id === id);
}

export function wikipediaUrl(name) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/\s+/g, "_"))}`;
}

export function profileUrl(id) {
  return `${window.location.origin}${window.location.pathname}#/profile/${id}`;
}

// People related to `person`: co-stars (actors), teammates (cricketers), same category.
export function relatedPeople(person, all, limit = 4) {
  const lc = (s) => String(s || "").toLowerCase();
  const costars = new Set();
  (person.films || []).forEach((f) =>
    String(f.costars || "")
      .split(",")
      .forEach((c) => costars.add(lc(c.trim())))
  );
  const teams = (person.cricket?.teams || []).filter((t) => t !== "India");

  return all
    .filter((p) => p.id !== person.id)
    .map((p) => {
      let score = 0;
      let reason = "";
      const coStar =
        costars.has(lc(p.name)) ||
        (p.films || []).some((f) => lc(f.costars).includes(lc(person.name)));
      if (coStar) {
        score += 3;
        reason = "Co-star";
      }
      const shared = teams.filter((t) => (p.cricket?.teams || []).includes(t));
      if (shared.length) {
        score += shared.length * 2;
        reason = reason || `Teammate (${shared[0]})`;
      }
      if (p.category === person.category) {
        score += 1;
        reason = reason || "Same category";
      }
      return { person: p, score, reason };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.person.name.localeCompare(b.person.name))
    .slice(0, limit);
}

// ---------- text <-> data helpers for the Manage form ----------
const clean = (s) => s.split("|").map((x) => x.trim());

export function timelineToText(list = []) {
  return list.map((a) => `${a.year} | ${a.text}`).join("\n");
}
export function textToTimeline(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [year, ...rest] = clean(l);
      return { year: Number(year) || year, text: rest.join(" | ") };
    })
    .filter((a) => a.text);
}

export function filmsToText(list = []) {
  return list
    .map((f) =>
      [f.title, f.year, f.role, f.genre, f.language, f.director, f.costars, f.popular ? "popular" : ""].join(" | ")
    )
    .join("\n");
}
export function textToFilms(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [title, year, role, genre, language, director, costars, popular] = clean(l);
      return {
        title,
        year: Number(year) || year || "",
        role: role || "",
        genre: genre || "",
        language: language || "Hindi",
        director: director || "",
        costars: costars || "",
        popular: /^(popular|yes|y|true|1)$/i.test(popular || ""),
      };
    })
    .filter((f) => f.title);
}

export function statsToText(list = []) {
  return list
    .map((s) => [s.format, s.matches, s.runs, s.avg, s.hundreds, s.wickets].join(" | "))
    .join("\n");
}
export function textToStats(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [format, matches, runs, avg, hundreds, wickets] = clean(l);
      return {
        format,
        matches: matches || "–",
        runs: runs || "–",
        avg: avg || "–",
        hundreds: hundreds || "–",
        wickets: wickets || "–",
      };
    })
    .filter((s) => s.format);
}

export const linesToList = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// Photo upload: shrink to keep localStorage small.
export function fileToDataUrl(file, maxSide = 640) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a valid image."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}