# For Future India – Admin dashboard (React + Vite)

    cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
    npm install
    npm run dev              # http://localhost:5173   (log in with the admin from the backend seed)

Pages: Login · Home (stats, 7-day chart, actions needed, upcoming, recent registrations, email-change requests) ·
Events (tabs + search) · Add new event · Event page (details, live participants with details, and for past events the
attendance wizard: tick boxes → confirm present → confirm absent → big green "Generate e-certificate" → confirm).

New pages: **Awards**, **Articles** (optional "Read article" link) and **Volunteers** (name, photo, LinkedIn) — under "Website content" in the sidebar.
Photos: upload (goes to S3/CDN, see backend README) or paste a URL. For awards/articles the first photo is the cover; use ← → to reorder.
