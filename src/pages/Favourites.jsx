import ProfileCard from "../components/ProfileCard.jsx";
import { useStore } from "../lib/store.jsx";

export default function Favourites() {
  const { people, favourites, categories } = useStore();
  const list = favourites.map((id) => people.find((p) => p.id === id)).filter(Boolean);

  return (
    <section>
      <div className="section-head">
        <h1 className="page-title">My favourites</h1>
        <span className="muted">{list.length} saved</span>
      </div>
      {list.length === 0 ? (
        <div className="empty">
          <p>You have not saved anyone yet. Tap the heart on any card or profile to save it here.</p>
          <a className="btn primary" href="#/">
            Browse people
          </a>
        </div>
      ) : (
        <>
          {categories.map((c) => {
            const group = list.filter((p) => p.category === c.id);
            if (!group.length) return null;
            return (
              <div key={c.id} className="group">
                <h2>{c.plural}</h2>
                <div className="grid">
                  {group.map((p) => (
                    <ProfileCard key={p.id} person={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}