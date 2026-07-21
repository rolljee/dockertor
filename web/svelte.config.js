import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-node produces a standalone Node server (build/index.js),
		// which is what the production Docker image runs.
		// See https://svelte.dev/docs/kit/adapter-node
		adapter: adapter()
	}
};

export default config;
