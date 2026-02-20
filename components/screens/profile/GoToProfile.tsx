import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, View } from 'react-native'

export function GoToProfile() {
	const onGoToProfile = () => {
		router.navigate('/app/profile/profile')
	}

	return (
		<Pressable>
			<Feather
				name='settings'
				size={24}
				color='white'
				onPress={onGoToProfile}
				className='p-4'
			/>
		</Pressable>
	)
}
