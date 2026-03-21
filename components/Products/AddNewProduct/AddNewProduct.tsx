import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import useProductStore from '../product.model'

export default function AddNewProduct() {
	const { navigate } = useRouter()
	const { resetForm } = useProductStore()

	const handlePress = () => {
		resetForm()
		navigate('/app/(NewProduct)/modal')
	}

	return (
		<Pressable onPress={handlePress}>
			<Feather size={24} color={'white'} name='plus' />
		</Pressable>
	)
}
