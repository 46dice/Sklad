import { useAuth } from '@/hooks/useAuth'
import { SplashScreen } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export function SplashScreenController() {
	const { isLoading } = useAuth()

	if (!isLoading) {
		SplashScreen.hide()
	}

	return null
}
