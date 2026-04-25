import { SplashScreenController } from '@/components/Splash'
import { AuthProvider } from '@/providers/auth/AuthProvider'
import { ThemeProvider } from '@/providers/theme/ThemeProvider'
import { Slot } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import '../global.css'

export default function Root() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<Toast position='top' />
				<SafeAreaProvider>
					<SplashScreenController />
					<RootNavigator />
				</SafeAreaProvider>
			</AuthProvider>
		</ThemeProvider>
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
