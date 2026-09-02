# StreamFlix - MERN Video Streaming Platform

StreamFlix is a lightweight, Netflix-inspired video-streaming web application. It allows signed-in users to browse a catalog of movies, view detailed information, and play them via a seamless YouTube embed. The platform includes a robust Admin dashboard for automatically fetching and adding new movies using the OMDB API.

## 🏗️ Architecture Overview

The project is built using the **MERN** stack:
- **MongoDB**: NoSQL database for storing User and Movie data.
- **Express.js**: Backend web framework for Node.js.
- **React.js**: Frontend UI library (bootstrapped with Vite).
- **Node.js**: JavaScript runtime for the backend server.

### State Management & Styling
- **Tailwind CSS v4**: Utility-first CSS framework for a premium, dark-mode responsive design.
- **Zustand / Context API**: Used for lightweight, global authentication state management.
- **Lucide-React**: Modern SVG icons.

---

## ⚙️ How It Works: Features & Data Flow

### 1. Authentication System
- **Registration**: Users sign up with an email and password. Passwords are securely hashed using `bcryptjs`.
- **First-User Admin Rule**: The application automatically grants `admin` privileges to the very first user who registers. Subsequent users are standard `user`s.
- **JWT**: Upon login, a JSON Web Token (JWT) is generated and sent to the frontend. The frontend stores this token in `localStorage` and attaches it as a `Bearer` token to all protected API requests.

### 2. Admin Dashboard & Movie Fetching
The Admin Dashboard (`/admin`) is the core of the content management system. It relies heavily on a custom fetching pipeline to eliminate manual data entry.

**The Fetching Pipeline:**
1. **Search (`GET /api/movies/imdb/search?title=...`)**:
   - The admin types a movie title (e.g., "Avatar") into the search box.
   - The frontend calls the backend search route.
   - The backend proxies the request to the **OMDB API** (`?s=Avatar`) using an educational API key.
   - The backend returns an array of matching movies (Title, Year, Poster, IMDb ID) to the frontend, which displays them as a visual grid.

2. **Scrape Details (`GET /api/movies/imdb/scrape?imdbId=...`)**:
   - The admin clicks on the specific movie they want from the grid.
   - The frontend calls the scrape route using the unique `imdbId`.
   - The backend makes a second request to the OMDB API (`?i=tt0499549`) to fetch the full, detailed metadata (Plot, exact Genre, high-res Poster).
   - The frontend receives this detailed data and pre-fills the "Preview & Edit Details" form.

3. **Saving (`POST /api/movies`)**:
   - The admin pastes a YouTube link for the movie video.
   - The form is submitted to the backend, which saves the complete movie document into MongoDB.

### 3. Browse & Watch Experience
- **Browse Page (`/`)**: Fetches all movies from `GET /api/movies` and renders them in a responsive grid. Includes a real-time client-side search filter that filters by title or genre.
- **Watch Page (`/watch/:id`)**: A protected route. It fetches the specific movie by its MongoDB `_id`. It extracts the 11-character video ID from the stored YouTube URL and uses `react-youtube` to render a borderless, autoplaying, fullscreen-like video player.

---

## 📡 API Reference

### Auth Routes (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate and return JWT token.

### Movie Routes (`/api/movies`)
- `GET /`: Retrieve all movies.
- `GET /:id`: Retrieve a specific movie (Requires Auth).
- `GET /imdb/search?title=X`: Search for movies via OMDB (Requires Admin).
- `GET /imdb/scrape?imdbId=X`: Get detailed movie info via OMDB (Requires Admin).
- `POST /`: Add a new movie to the database (Requires Admin).

---

## 🚀 Running the Project

Ensure you have a local MongoDB instance running on `mongodb://127.0.0.1:27017/prismberry`.

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
