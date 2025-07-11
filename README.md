# Stay Finder

A full-stack web application for discovering, listing, and booking short-term stays. Stay Finder connects guests and hosts with a seamless experience, robust authentication, and easy property management.

---

## 🚀 Features

- 🏠 **Browse Listings:** Search and explore available properties with detailed information.
- 📅 **Booking System:** Book stays with date and guest selection, and view your bookings.
- 🧑‍💼 **Host Dashboard:** Hosts can add, edit, and manage their property listings.
- 🔒 **Secure Authentication:** User registration and login with JWT-based security.
- 💬 **Reviews & Ratings:** (Planned) Guests can leave reviews and ratings for properties.
- 📱 **Responsive Design:** Optimized for all devices.

---

## 🛠️ Tech Stack

- **Frontend (Guest):** Next.js, React, Tailwind CSS (`/client`)
- **Frontend (Host):** Next.js, React, Tailwind CSS (`/host`)
- **Backend:** Node.js, Express, Mongoose (`/back`)
- **Database:** MongoDB
- **Authentication:** JWT

---

## 📁 Folder Structure

```
/glen
  /back     # Backend API (Express, MongoDB)
  /client   # Guest-facing Next.js frontend
  /host     # Host dashboard Next.js frontend
```

---

## 🏁 How to Run

### 1. Clone & Install
```bash
git clone https://github.com/abhisheksharmacodes/stayfinder.git
cd glen
```

Install backend dependencies:
```bash
cd back
npm install
```
Install client dependencies:
```bash
cd ../client
npm install
```
Install host dashboard dependencies:
```bash
cd ../host
npm install
```

### 2. Configure Environment

Create a `.env` file in `/back`:
```env
DB_URI=mongodb://localhost:27017/stayfinder
JWT_SECRET=your_jwt_secret
```

### 3. Start the Development Servers

Start the backend API:
```bash
cd back
npm run dev
```
Start the client (guest) app:
```bash
cd ../client
npm run dev
```
Start the host dashboard app:
```bash
cd ../host
npm run dev
```

- Guest app: [http://localhost:3000](http://localhost:3000)
- Host dashboard: [http://localhost:3000](http://localhost:3000) (if running separately, may use a different port)
- Backend API: [http://localhost:4998](http://localhost:4998)

---

## 📦 Deployment

- Deploy frontend apps (client, host) to Vercel or similar platforms.
- Deploy backend (`/back`) to Vercel, Render, or your preferred Node.js host.
- Set all required environment variables in your deployment environment.

---

## 📚 API Endpoints (Backend)
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login
- `GET /api/listings` — Get all listings
- `GET /api/listings/:id` — Get listing by ID
- `POST /api/listings` — Add a new listing
- `PUT /api/listings/:id` — Update a listing
- `DELETE /api/listings/:id` — Delete a listing
- `POST /api/bookings` — Book a listing
- `GET /api/bookings?listingId=...` — Get bookings for a listing

---

> Built with [Next.js](https://nextjs.org), [Express](https://expressjs.com), and [MongoDB](https://www.mongodb.com/).
