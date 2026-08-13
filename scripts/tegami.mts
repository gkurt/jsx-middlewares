// scripts/tegami.mts — Tegami versioning + changelog config.
//
// Run via the `tegami` package script (`bun tegami …`).
//
// This repo publishes exactly one package: the root `jsx-middlewares`. The other
// workspaces (`website`, `examples/*`) are private and must stay unversioned, so
// there is deliberately no synced group here — the imprint's
// `groups: { all: { syncBump: true } }` would drag those private packages along
// and bump them on every release.

import { tegami } from 'tegami';
import { runCli } from 'tegami/cli';
import { github } from 'tegami/plugins/github';

const paper = tegami({
  npm: {
    client: 'bun',
  },

  plugins: [
    github({
      repo: 'gkurt/jsx-middlewares',
      versionPr: {
        base: 'main',
        // Put the release version in the PR title ("chore: release v3.0.0")
        // instead of Tegami's default "Version Packages", mirroring the old
        // Changesets workflow.
        //
        // `create` runs AFTER the draft is applied, so the graph already holds
        // the bumped versions — read the new version straight off it. Do NOT
        // call `bumpVersion` here: the graph is post-apply, so it would bump a
        // second time (3.0.0 -> 4.0.0).
        create() {
          const version = this.graph.get('npm:jsx-middlewares')?.version;
          return { title: version ? `chore: release v${version}` : 'chore: release' };
        },
      },
    }),
  ],
});

await runCli(paper);
