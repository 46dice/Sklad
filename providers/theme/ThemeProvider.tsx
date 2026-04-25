import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
	primary: string
	secondary: string
	background: string
	surface: string
	text: string
	textSecondary: string
	border: string
	error: string
	success: string
	warning: string
	info: string
	// Status colors
	statusPending: string
	statusInTransit: string
	statusDelivered: string
	statusFailed: string
	statusDraft: string
	statusActive: string
	statusDefault: string
}

const lightTheme: ThemeColors = {
	primary: '#BF3335',
	secondary: '#FFE773',
	background: '#FFFFFF',
	surface: '#F5F5F5',
	text: '#1A1A1A',
	textSecondary: '#666666',
	border: '#E0E0E0',
	error: '#EF4444',
	success: '#10B981',
	warning: '#F59E0B',
	info: '#3B82F6',
	// Status colors
	statusPending: '#F59E0B',
	statusInTransit: '#3B82F6',
	statusDelivered: '#10B981',
	statusFailed: '#EF4444',
	statusDraft: '#F59E0B',
	statusActive: '#10B981',
	statusDefault: '#9CA3AF'
}

const darkTheme: ThemeColors = {
	primary: '#BF3335',
	secondary: '#FFE773',
	background: '#090909',
	surface: '#1D1D1D',
	text: '#FFFAFA',
	textSecondary: '#9CA3AF',
	border: '#282828',
	error: '#EF4444',
	success: '#10B981',
	warning: '#F59E0B',
	info: '#3B82F6',
	// Status colors
	statusPending: '#F59E0B',
	statusInTransit: '#3B82F6',
	statusDelivered: '#10B981',
	statusFailed: '#EF4444',
	statusDraft: '#F59E0B',
	statusActive: '#10B981',
	statusDefault: '#9CA3AF'
}

interface ThemeContextType {
	theme: ThemeMode
	colors: ThemeColors
	toggleTheme: () => void
	setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@app_theme'

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const systemColorScheme = useColorScheme()
	const [theme, setThemeState] = useState<ThemeMode>('light')

	useEffect(() => {
		loadTheme()
	}, [])

	const loadTheme = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
			if (savedTheme === 'light' || savedTheme === 'dark') {
				setThemeState(savedTheme)
			} else {
				// По умолчанию светлая тема
				setThemeState('light')
			}
		} catch (error) {
			console.error('Error loading theme:', error)
			setThemeState('light')
		}
	}

	const setTheme = async (newTheme: ThemeMode) => {
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
			setThemeState(newTheme)
		} catch (error) {
			console.error('Error saving theme:', error)
		}
	}

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)
	}

	const colors = theme === 'light' ? lightTheme : darkTheme

	return (
		<ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
