import Navbar from "./components/Navbar.jsx";
import Favourites from "./pages/Favourites.jsx";
import Home from "./pages/Home.jsx";
import Manage from "./pages/Manage.jsx";
import ProfileDetails from "./pages/ProfileDetails.jsx";
import { StoreProvider } from "./lib/store.jsx";
import { useRoute } from "./lib/useHashRoute.js";

function Router() {
  const { parts } = useRoute();
  const [page, arg] = parts;

  let current = "home";
  let view;
  if (page === "profile" && arg) {
    current = "";
    view = <ProfileDetails id={arg} />;
  } else if (page === "favourites") {
    current = "favourites";
    view = <Favourites />;
  } else if (page === "manage") {
    current = "manage";
    view = <Manage />;
  } else {
    view = (
      <>
        <h1 className="site-title">My Favourites</h1>
        <Home />
      </>
    );
  }

  return (
    <>
      <Navbar current={current} />
      <main className="app" id="main">
        {view}
      </main>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}