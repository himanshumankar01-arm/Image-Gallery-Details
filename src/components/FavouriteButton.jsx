import { useStore } from "../lib/store.jsx";

export default function FavouriteButton({ id, name, withLabel = false }) {
  const { favourites, toggleFavourite } = useStore();
  const on = favourites.includes(id);
  return (
    <button
      type="button"
      className={"fav-btn" + (on ? " on" : "")}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      title={on ? "Remove from favourites" : "Add to favourites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavourite(id);
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 2.7 5 6.1 5c2 0 3.4 1.1 4.2 2.4h.4C11.5 6.1 12.9 5 14.9 5c3.4 0 5.2 3.6 3.7 6.9C19.5 16.4 12 21 12 21z"
          transform="translate(.5 0)"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && <span>{on ? "In favourites" : "Add to favourites"}</span>}
    </button>
  );
}