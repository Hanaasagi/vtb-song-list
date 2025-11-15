// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

const rawBase = process.env.ASTRO_BASE ?? '/';
const normalizedBase =
	rawBase === '/' ? '/' : `/${rawBase.replace(/^\/|\/$/g, '')}`;

const site = process.env.ASTRO_SITE;

// https://astro.build/config
export default defineConfig({
	site,
	base: normalizedBase,
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
});
