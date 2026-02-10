import { Navigation } from '@/navigation/Navigation'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'

const App = () => {
	return (
		<>
			<SafeAreaProvider>
				{/* <SafeAreaView>
					<Header />
				</SafeAreaView> */}
				<Navigation />
			</SafeAreaProvider>
			<StatusBar style='light' />
		</>
	)
}

export default App
