import { useEffect, useState } from "react";
import { hue, imageSrc, initials, slugify } from "../lib/utils.js";

// Generated portrait card, shown when a person's photo file is not found.
export function Portrait({ name }) {
  const h = hue(name);
  const gid = `portrait-${slugify(name)}`;
  return (
    <svg viewBox="0 0 100 70" role="img" aria-label={`Portrait of ${name}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${h},50%,38%)`} />
          <stop offset="100%" stopColor={`hsl(${(h + 40) % 360},55%,24%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="70" fill={`url(#${gid})`} />
      <circle cx="50" cy="27" r="12" fill="rgba(255,255,255,0.16)" />
      <path d="M22 70c0-16 12-26 28-26s28 10 28 26z" fill="rgba(255,255,255,0.16)" />
      <text
        x="50"
        y="40"
        textAnchor="middle"
        fontFamily="Bricolage Grotesque, Trebuchet MS, sans-serif"
        fontWeight="700"
        fontSize="20"
        fill="#ffffff"
      >
        {initials(name)}
      </text>
    </svg>
  );
}

export default function Photo({ name, image, className = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  if (!image || failed) return <Portrait name={name} />;
  return <img className={className} src={imageSrc(image)} alt={name} loading="lazy" onError={() => setFailed(true)} />;
}