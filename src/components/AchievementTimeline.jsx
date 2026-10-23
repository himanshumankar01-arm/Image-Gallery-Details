export default function AchievementTimeline({ items = [] }) {
  if (!items.length) return <p className="muted">No milestones added yet.</p>;
  const sorted = [...items].sort((a, b) => Number(a.year) - Number(b.year));
  return (
    <ol className="timeline">
      {sorted.map((a, i) => (
        <li key={i}>
          <span className="timeline-year">{a.year}</span>
          <span className="timeline-text">{a.text}</span>
        </li>
      ))}
    </ol>
  );
}