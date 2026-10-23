import { useStore } from "../lib/store.jsx";

export default function CategoryFilter({ value, onChange }) {
  const { categories } = useStore();
  const options = [{ id: "all", plural: "All" }, ...categories];
  return (
    <div className="chips" role="group" aria-label="Filter by category">
      {options.map((c) => (
        <button
          key={c.id}
          type="button"
          className={"chip" + (value === c.id ? " active" : "")}
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
        >
          {c.plural}
        </button>
      ))}
    </div>
  );
}