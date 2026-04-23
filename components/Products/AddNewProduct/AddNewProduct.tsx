import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import useProductStore from '../product.model'

export default function AddNewProduct() {
	const { navigate } = useRouter()
	const { resetForm } = useProductStore()

	const handlePress = () => {
		resetForm()
		navigate('/app/(NewProduct)/modal')
	}

	return (
		<TouchableOpacity
			onPress={handlePress}
			className='bg-primary w-10 h-10 rounded-full items-center justify-center'
		>
			<Feather size={20} color='white' name='plus' />
		</TouchableOpacity>
	)
}
