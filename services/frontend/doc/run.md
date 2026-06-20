# Running the Frontend Locally

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm (comes with Node.js)

## Quick Start

From the repository root:

```bash
# Install dependencies
make install

# Start the dev server
make dev
```

The app will be available at **http://localhost:5173**.

## Available Commands

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `make install`   | Install npm dependencies           |
| `make dev`       | Start Vite development server      |
| `make build`     | TypeScript check + production build|
| `make lint`      | Run ESLint                         |
| `make preview`   | Preview the production build       |
| `make clean`     | Remove node_modules and dist       |
