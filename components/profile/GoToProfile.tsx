import { Text, View } from 'react-native'
import { Button } from '../ui/Button'
import { router } from 'expo-router'

export function GoToProfile() {
	const onGoToProfile = () => {
		console.log(router)
		router.navigate('/app/profile')
	}
	return (
		<View>
			<Button onPress={onGoToProfile} icon='settings'>

			</Button>
		</View>
	)
}
