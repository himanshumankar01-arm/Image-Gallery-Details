# My Favourites

A React app about favourite actors, actresses and cricketers. It started as three dropdowns with a photo; it now has full profiles, search, favourites, comparison and an in-app editor.

## Run it

1. Install Node.js from https://nodejs.org if you don't have it.
2. In this folder run:

   ```
   npm install
   npm run dev
   ```

3. Open the address it prints (usually http://localhost:5173).

`npm run build` makes a production copy in `dist/`.

## Features

- Quick pick: the original three dropdowns with a photo, plus a link to the full profile
- Search (name, nickname, film, team), category filter and sorting
- Profile pages: personal details, biography, career timeline, awards, filmography (actors) or cricket statistics and records (cricketers), photo gallery, related people, Wikipedia link
- Favourites (heart button), saved in your browser
- Compare any two people side by side
- Trending: the profiles you open most
- Share profile (share sheet or copy link)
- Light / dark / system theme
- Manage page: add, edit and delete people, upload photos, reset to defaults

## Project structure

```
src/
  components/  Navbar, SearchBar, CategoryFilter, ProfileCard, AchievementTimeline, Photo, FavouriteButton
  pages/       Home, ProfileDetails, CompareProfiles, Favourites, Manage
  data/        people.js  (default people and their details)
  lib/         store (localStorage), hash router, helpers
```

Pages use hash links (`#/profile/virat-kohli`), so the built site works on any static host.

## Data

- Edit `src/data/people.js` to change the default people. Photos go in `public/images/`; each `image` value is a file name there or a full web address.
- Cricket statistics change over time. Each cricketer has a `statsAsOf` note; please check figures against ESPNcricinfo or the ICC and update them.
- Edits made on the Manage page are saved in this browser (localStorage) and override the file. There is no sign-in, so this is a personal tool, not a multi-user admin. Use "Reset to default list" to discard them.
- Social links are left empty on purpose. Add verified ones in `social: { instagram: "https://…" }`.
