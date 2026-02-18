import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Platform } from 'react-native'

export default function GoBackScreen() {
	const router = useRouter()
	return (
		<Ionicons
			name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
			size={25}
			onPress={() => router.back()}
		/>
	)
}
