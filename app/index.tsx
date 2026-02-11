import { Navigation } from '@/navigation/Navigation'
import { AuthProvider } from '@/providers/auth/AuthProvider'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'

const App = () => {
	return (
		<>
			<AuthProvider>
				<SafeAreaProvider>
					{/* <SafeAreaView>
					<Header />
					</SafeAreaView> */}
					<Navigation />
				</SafeAreaProvider>
			</AuthProvider>
			<StatusBar style='light' />
		</>
	)
}

export default App
