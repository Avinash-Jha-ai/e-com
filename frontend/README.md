# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Vercel deployment

Set the Vercel frontend project root directory to `frontend`. The `vercel.json`
rewrite serves the React app for direct visits to client-side routes such as
`/shop`.

The production build defaults to this public API base URL:

```env
VITE_API_URL=https://e-com-ten-lilac.vercel.app/api
```

You can override it in Vercel → Settings → Environment Variables with
`VITE_API_URL` as a **Config** variable for Production (and Preview if needed).
Use the full API URL above; replace any existing `VITE_API_URL=/api`. Do not
mark it as a Secret; it is a public API address, not a key.

Set the Vercel backend project root directory to `backend`. Its Vercel handler
connects to MongoDB before serving API requests and reuses that connection for
warm function instances.

On the backend deployment, set `FRONTEND_URL` to the deployed frontend origin:

```env
FRONTEND_URL=https://sarees-chi.vercel.app
```

For multiple frontend origins, separate them with commas. Redeploy both
projects after changing environment variables.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
