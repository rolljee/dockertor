#!/usr/bin/env node
/**
 * Writes the release version (computed by semantic-release) into the
 * `version` field of every package.json in the workspace, without touching
 * lockfiles. Invoked from the @semantic-release/exec `prepareCmd`.
 *
 * Usage: node scripts/set-version.mjs <version>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const version = process.argv[2];
if (!version) {
	console.error('Usage: node scripts/set-version.mjs <version>');
	process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = ['package.json', 'api/package.json', 'web/package.json'];

for (const rel of targets) {
	const path = resolve(root, rel);
	const pkg = JSON.parse(readFileSync(path, 'utf8'));
	pkg.version = version;
	writeFileSync(path, JSON.stringify(pkg, null, '\t') + '\n');
	console.log(`set ${rel} -> ${version}`);
}
