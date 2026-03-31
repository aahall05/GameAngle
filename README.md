# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# GameSync
GameSync is a video synchronization and storage platform meant to provide a place for local sports communities to upload and view their games from multiple angles

# How to Run
To run server:
```js
npm run server
```
To run Frontend:
```js
npm run dev
```

For the database side of things, install postgres onto your computer and I would recommend installing pgadmin 4 as well. This link should be the right site and the installer should give the option for pgadmin 4. https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

REMEMBER your password, user/superuser name and port number you set for postgres. Open pgadmin 4, and create a database (open the server section, right click on postgres 18.-- and hit create database). Next go into vs code and install the extension PostgreSQL, should have around 614,000 downloads to differentiate it from the other Postgres extensions. Once that is installed follow the instructions on the extension page to connect it to vs code.

Finally create a .env file in the root folder and make sure its included in .gitignore. In that folder, put this
PGUSER=[yourusername]
PGPASSWORD=[yourpassword]
PGHOST=localhost
PGDATABASE=[yourdatabasename]
PGPORT=[yourportnumber/Usually5432]

Finally try npm testDB and see if it works
Before trying to run the server, if you intend on working with the database, run npm washDB (This clears out the database so don't use this if you want to keep the data you already have) and run npm initDB.

To use the functions, follow the example in test-db.js