# Frontend

## Backend connection

The frontend calls the Express API in `src/services/api.js`. Set `VITE_API_URL` to the backend origin (for example, `http://localhost:5001`) in `.env`, or leave it unset to use the Vite development proxy. The proxy forwards `/api/*` and `/uploads/*` to `http://localhost:5001`; override that target with `VITE_API_PROXY_TARGET` if the backend runs on another port or host.

For local development, start the backend from `../backend` and run `npm run dev` in this directory. The backend defaults to port `5001`, and Vite defaults to `5173`.

## API routes used by the frontend

| Feature | Backend request |
| --- | --- |
| Product catalog | `GET /api/products`, `GET /api/products/:id` |
| Categories | `GET /api/categories` |
| Campaigns | `GET /api/campaigns/:category`, `PUT /api/campaigns/:category` |
| Authentication | `/api/auth/*` |
| User profile | `/api/users/:id` |
| Orders | `/api/orders/*` |
| Payments | `/api/payment/create-order`, `/api/payment/verify` |
| Contact form | `POST /api/contact` |
| Admin management | `/api/admin/*` |

Protected requests include the session cookie (`withCredentials`); the backend must allow the frontend origin and credentials.
