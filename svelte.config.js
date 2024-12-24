import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({
		scss: {
			// Uncomment/adjust if you want to inject global SCSS variables, mixins, etc.
			// prependData: `@import 'src/styles/variables.scss';`
		}
	}),
	kit: {
		adapter: adapter()
	}
};

export default config;
