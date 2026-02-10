/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
	content: ['./app/index.tsx', './components/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		colors: {
			primary: '#BF3335',
			gray: {
				default: '#282828',
				500: '#1D1D1D'
			},
			black: '#030207',
			white: colors.white,
			red: colors.red['500']
		},
		extend: {
			zIndex: {
				1: '1'
			}
		}
	},
	plugins: []
}
