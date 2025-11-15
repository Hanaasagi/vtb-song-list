const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{astro,html,js,jsx,ts,tsx}',
		'./src/content/**/*.md',
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
				mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
			},
			colors: {
				background: 'var(--color-background)',
				surface: 'var(--color-surface)',
				'surface-hover': 'var(--color-surface-hover)',
				primary: 'var(--color-primary)',
				accent: 'var(--color-accent)',
				border: 'var(--color-border)',
				highlight: 'var(--color-highlight)',
				text: {
					primary: 'var(--color-text-primary)',
					secondary: 'var(--color-text-secondary)',
					muted: 'var(--color-text-muted)',
				},
				status: {
					featured: 'var(--color-featured)',
					sc: 'var(--color-sc)',
				},
				toast: {
					background: 'var(--color-toast-background)',
					text: 'var(--color-toast-text)',
					border: 'var(--color-toast-border)',
				},
			},
			boxShadow: {
				card: '0 18px 48px rgba(0, 0, 0, 0.3)',
			},
			borderRadius: {
				card: 'var(--radius-card)',
			},
			maxWidth: {
				content: 'var(--layout-max-width)',
			},
		},
	},
	plugins: [],
};

