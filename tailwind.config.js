/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
	content: [
		'./app/**/*.{js,jsx,ts,tsx}', // Expo Router
		'./components/**/*.{js,jsx,ts,tsx}', // Компоненты
		'./**/*.css' // CSS файлы
	],
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
			zIndex: {
				1: '1'
			}
		}
	},
	plugins: []
}
