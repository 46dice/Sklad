import AddNewClientForm from '@/components/Clients/AddNewClientForm/AddNewClientForm'
import { useAuth } from '@/hooks/useAuth'
import { View } from 'react-native'

export default function Modal() {
	const { user } = useAuth()

	return (
		<View className='px-1'>
			<AddNewClientForm />
		</View>
	)
}
