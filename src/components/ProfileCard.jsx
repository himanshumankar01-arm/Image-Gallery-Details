import FavouriteButton from "./FavouriteButton.jsx";
import Photo from "./Photo.jsx";
import { useStore } from "../lib/store.jsx";
import { categoryOf } from "../lib/utils.js";

export default function ProfileCard({ person, note }) {
  const { categories } = useStore();
  const cat = categoryOf(categories, person.category);
  return (
    <article className="card">
      <a className="card-link" href={`#/profile/${person.id}`} aria-label={`Open profile of ${person.name}`}>
        <div className="card-photo">
          <Photo name={person.name} image={person.image} />
        </div>
        <div className="card-body">
          <span className="eyebrow">{cat ? cat.single : person.category}</span>
          <h3>{person.name}</h3>
          <p>{note || person.tagline}</p>
        </div>
      </a>
      <div className="card-fav">
        <FavouriteButton id={person.id} name={person.name} />
      </div>
    </article>
  );
}