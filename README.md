# Stay Finder

Stay Finder is a full-stack web application for property listings and bookings, designed to connect hosts and guests for short-term stays. The project is organized into three main parts: backend (API), client (guest-facing frontend), and host (host dashboard frontend).

## Features

- Browse and search property listings
- View detailed property information
- Book properties with date and guest selection
- Host dashboard for managing listings
- User authentication (register/login)
- Responsive design

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Node.js (Express), MongoDB (Mongoose)
- **Other:** JWT authentication, CORS, dotenv, Stripe/Razorpay (for payments)

## Folder Structure

```
/back         # Backend API (Express, MongoDB)
  server.js   # Main server file (API endpoints, models)
  package.json
  vercel.json
  ...
/client       # Guest-facing Next.js frontend
  src/
  public/
  ...
/host         # Host dashboard Next.js frontend
  src/
  public/
  ...
```

## Getting Started

### 1. Clone the repository
```sh
git clone <repository-url>
cd glen
```

### 2. Install dependencies
Install backend dependencies:
```sh
cd back
npm install
```
Install client dependencies:
```sh
cd ../client
npm install
```
Install host dashboard dependencies:
```sh
cd ../host
npm install
```

### 3. Environment Variables
Create a `.env` file in `/back` with the following:
```
DB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

### 4. Run the development servers
Start the backend API:
```sh
cd back
npm run dev
```
Start the client (guest) app:
```sh
cd ../client
npm run dev
```
Start the host dashboard app:
```sh
cd ../host
npm run dev
```

### 5. Open your browser
- Guest app: [http://localhost:3000](http://localhost:3000)
- Host dashboard: [http://localhost:3000](http://localhost:3000) (if running separately, may use a different port)
- Backend API: [http://localhost:4998](http://localhost:4998)

## API Endpoints (Backend)
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login
- `GET /api/listings` — Get all listings
- `GET /api/listings/:id` — Get listing by ID
- `POST /api/listings` — Add a new listing
- `PUT /api/listings/:id` — Update a listing
- `DELETE /api/listings/:id` — Delete a listing
- `POST /api/bookings` — Book a listing
- `GET /api/bookings?listingId=...` — Get bookings for a listing

## License

MIT
