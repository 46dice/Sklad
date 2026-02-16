import { SplashScreenController } from '@/components/Splash'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/providers/auth/AuthProvider'
import { Slot } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'

export default function Root() {
	return (
		<AuthProvider>
			<SafeAreaProvider>
				<SplashScreenController />
				<RootNavigator />
			</SafeAreaProvider>
		</AuthProvider>
	)
}

function RootNavigator() {
	return (
		// <Stack
		// 	screenOptions={{
		// 		contentStyle: {
		// 			backgroundColor: '#090909'
		// 		}
		// 	}}
		// >
		// 	<Stack.Protected guard={!!user}>
		// 		<Stack.Screen name='(protected)' />
		// 	</Stack.Protected>

		// 	<Stack.Protected guard={!user}>
		// 		<Stack.Screen name='auth' />
		// 	</Stack.Protected>
		// </Stack>
		<Slot />
	)
}

