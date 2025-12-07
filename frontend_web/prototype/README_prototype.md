# Frontend Prototype

This is a lightweight, development-only prototype so you can quickly test the backend API without running a full npm build.

How to run

- Make sure your Django backend is running at `http://127.0.0.1:8000` (default `python manage.py runserver`).
- From a terminal, serve the `prototype` folder using Python's simple HTTP server:

```powershell
cd C:\Users\Rafa\Desktop\EventoApp_Full\frontend_web\prototype
python -m http.server 3000
```

- Open http://localhost:3000 in your browser.

Notes / troubleshooting

- CORS: If the browser rejects requests to `http://127.0.0.1:8000` due to CORS, either enable `django-cors-headers` in the backend or serve the prototype via Django so both are same-origin.
- This prototype uses React and Axios from CDN and Babel in-browser compilation; it is only for quick testing and not suitable for production. For full frontend development please scaffold a CRA or Vite app and run `npm install`.

What the prototype does

- Login using `/api/token/` (username/password) to obtain JWT tokens.
- Lists events (`/api/events/`) and users (`/api/users/for_select/`).
- Creates `DistributionGroup` via `POST /api/groups/` with selected members.
