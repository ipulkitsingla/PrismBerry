# StreamFlix: Complete Architecture & Interview Guide

This guide is designed to help you explain every layer, component, and data flow of the StreamFlix application to an interviewer.

---

## 1. High-Level Architecture (The MERN Stack)

The application follows a standard Client-Server architecture using the **MERN** stack.
*   **M (MongoDB)**: Our NoSQL database used to store flexible JSON-like documents (Users and Movies). We use Mongoose as an Object Data Modeling (ODM) library to enforce schemas.
*   **E (Express.js)**: The backend web framework. It handles HTTP requests, routing, and middleware (like JWT verification).
*   **R (React.js)**: The frontend library. It handles the UI, state management, and component lifecycle. Bootstrapped with Vite for extremely fast Hot Module Replacement (HMR).
*   **N (Node.js)**: The runtime environment that executes our Express backend JavaScript code.

---

## 2. Frontend Breakdown (React.js + Tailwind)

The frontend is a Single Page Application (SPA) using `react-router-dom` for navigation.

### Global State (`AuthContext.jsx`)
*   **Purpose**: Manages the user's authentication state globally so any component knows if a user is logged in.
*   **How it works**: Uses React's Context API. When a user logs in, we save their JWT token and user details to `localStorage`. `AuthContext` initializes by reading this `localStorage`. This prevents the user from being logged out when they refresh the page.

### Key Pages & Components
1.  **`App.jsx` (The Root)**
    *   Wraps the entire app in `<AuthProvider>` and `<Router>`.
    *   Defines routes. Notice the `<ProtectedRoute>` and `<AdminRoute>` wrappers—these are Higher-Order Components (HOCs) that check `user.role` from the Context before allowing access to certain pages.
2.  **`Home.jsx` (Discovery & Catalogs)**
    *   **Data Fetching**: Uses `useEffect` and `axios` to fetch movies from `/api/movies` when the component mounts. 
    *   **Personalization**: If `user` exists in Context, it simultaneously fetches `/api/user/profile` to get `myList` and `watchHistory`.
    *   **State**: Uses local state (`useState`) to store `search`, `movies`, `myList`, and `watchHistory`.
    *   **Filtering**: Calculates `filteredMovies` on the fly using `.filter()` and `.includes()` before rendering the grid.
3.  **`Watch.jsx` (The Video Player)**
    *   Reads the movie `id` from the URL params (`useParams()`).
    *   Fetches the specific movie. It uses a regex function `getYouTubeId()` to extract the exact 11-character video ID from a raw YouTube URL.
    *   Passes that ID to `react-youtube` (a wrapper around the official YouTube IFrame Player API).
    *   **Silent History**: Triggers a background POST request to `/api/user/history` on load, pushing this movie ID to the user's "Continue Watching" array.
4.  **`Admin.jsx` (The CMS / OMDB Integration)**
    *   This is the most complex frontend piece.
    *   **Step 1 (Search)**: Admin types a title. Calls our backend `/api/movies/imdb/search`. Displays a grid of results.
    *   **Step 2 (Scrape/Fetch)**: Admin clicks a specific movie. Calls `/api/movies/imdb/scrape?imdbId=tt...`. The backend talks to OMDB and returns the plot, exact poster, and genre.
    *   **Step 3 (Save)**: The form is pre-filled. The Admin pastes a YouTube link and hits Save, sending a POST to `/api/movies`.
5.  **`MovieCard.jsx` (Reusable Component)**
    *   Displays individual posters.
    *   Contains its own local state (`inList`) to handle the "My List" toggle. When clicked, it talks to `/api/user/mylist` to add/remove the movie from the database.

---

## 3. Backend Breakdown (Node.js + Express)

### Server Entry (`server.js`)
*   Sets up Express, enables `cors()` (allowing the frontend on port 5173 to talk to the backend on 5000), and parses incoming JSON using `express.json()`.
*   Connects to MongoDB using `mongoose.connect()`.
*   Mounts the route files (`authRoutes`, `movieRoutes`, `userRoutes`).

### Database Models (`models/`)
1.  **`User.js`**: Contains `email`, `password` (hashed), `role` (admin/user). Recently updated to include `myList` and `watchHistory`, which are Arrays of `mongoose.Schema.Types.ObjectId` referencing the `Movie` collection.
2.  **`Movie.js`**: Contains `title`, `description`, `posterUrl`, `youtubeLink`, `genre`, and `imdbId`.

### Authentication Flow (`routes/auth.js`)
*   **Register**: Checks if the user exists. Uses `bcryptjs` to hash the password securely before saving. *Unique Feature*: Automatically makes the very first user an `admin` by checking `await User.countDocuments() === 0`.
*   **Login**: Finds the user, compares the password using `bcrypt.compare()`. If valid, generates a JWT using `jsonwebtoken`. The JWT payload contains the `user.id` and `role`.

### Security Middleware
*   **`verifyToken`**: Intercepts requests, reads the `Authorization: Bearer <token>` header, and uses `jwt.verify()` to validate it. If valid, it attaches the decoded user object to `req.user` and calls `next()` to proceed.
*   **`verifyAdmin`**: Runs *after* `verifyToken`. Checks if `req.user.role === 'admin'`. If not, rejects with a 403 Forbidden.

### The OMDB Pipeline (`routes/movies.js`)
When an interviewer asks how you populate data:
*   *"Instead of manually typing movie data or dealing with unreliable web scraping (Cheerio/Puppeteer) which gets blocked by CAPTCHAs, I integrated the **OMDB REST API**."*
*   The backend acts as a **Proxy**. The frontend doesn't talk to OMDB directly. Instead, the frontend talks to our Express backend, and the backend talks to OMDB.
*   **Why proxy?** Security. It keeps our API key (`thewdb`) hidden on the server and prevents frontend CORS issues.

### Personalization Logic (`routes/user.js`)
*   **My List (`/mylist`)**: Finds the user. Checks `user.myList.indexOf(movieId)`. If it exists, uses `.splice()` to remove it. If it doesn't, uses `.push()` to add it.
*   **History (`/history`)**: Uses `indexOf` to find the movie and remove it (so we don't have duplicates). Then uses `.unshift()` to place the movie at the absolute beginning of the array (most recently watched). Limits the array to 20 items using `.slice(0, 20)`.

---

## 4. Key Interview Talking Points & "Gotchas"

**Q: How do you handle passwords?**
A: "I never store plain text passwords. I use `bcryptjs` to salt and hash the password on the backend before saving to MongoDB. During login, `bcrypt` compares the hash."

**Q: What happens if the YouTube link is invalid?**
A: "On the Watch page, I wrote a Regex function `getYouTubeId()` that parses out just the 11-character video ID from any standard or shortened YouTube URL. If it fails, the UI gracefully falls back to an 'Invalid Video Link' message rather than crashing the app."

**Q: How did you design the 'Continue Watching' feature?**
A: "I used an array of ObjectIds on the User schema. When a user opens a movie, the frontend fires a silent POST request. The backend removes any existing instance of that movie ID from the array, and uses `unshift` to put it at the 0th index, ensuring the most recently watched movie is always first."

**Q: Why use Context API instead of Redux?**
A: "For this app, the global state is primarily just the User authentication object. Redux would be massive overkill and introduce unnecessary boilerplate. Context API perfectly solves prop-drilling for the user token."
