/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
	content: [
		'./app/**/*.{js,jsx,ts,tsx}', // Expo Router
		'./components/**/*.{js,jsx,ts,tsx}', // Компоненты
		'./shared/**/*.{js,jsx,ts,tsx}', // Shared UI
		'./**/*.css' // CSS файлы
	],
	presets: [require('nativewind/preset')],
	theme: {
		colors: {
			primary: '#BF3335',
			gray: {
				default: '#282828',
				500: '#1D1D1D',
				300: '#D1D5DB',
				400: '#9CA3AF',
				600: '#4B5563',
				700: '#374151'
			},
			black: '#030207',
			white: colors.white,
			red: colors.red['500'],
			green: colors.green,
			blue: colors.blue,
			yellow: colors.yellow,
			transparent: 'transparent'
		},
		extend: {
			colors: {
				primary: '#BF3335',
				gray: {
					default: '#282828',
					500: '#1D1D1D',
					300: '#D1D5DB',
					400: '#9CA3AF',
					600: '#4B5563',
					700: '#374151'
				},
				black: '#030207',
				white: colors.white,
				red: colors.red['500'],
				green: colors.green,
				blue: colors.blue,
				yellow: colors.yellow,
				transparent: 'transparent'
			},
			zIndex: {
				1: '1'
			}
		}
	},
	plugins: []
}
