import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable } from 'react-native'

export default function AddNewClient() {
	const { navigate } = useRouter()

	return (
		<Pressable onPress={() => navigate('/app/(NewClient)/modal')}>
			<Feather size={24} color={'white'} name='plus' />
		</Pressable>
	)
}
