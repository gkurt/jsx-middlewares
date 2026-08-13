# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

Run this from the repo root — this is a Bun workspace.

```
$ bun i
```

### Local Development

```
$ bun run --cwd website start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

The site consumes the built `jsx-middlewares` package, so build the library first:

```
$ bun run build
$ bun run --cwd website build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Pushing to `main` builds and deploys the site through the `Deploy to GitHub Pages`
workflow (`.github/workflows/deploy.yml`), which uses `actions/deploy-pages`.
There is no `gh-pages` branch to push to by hand.
