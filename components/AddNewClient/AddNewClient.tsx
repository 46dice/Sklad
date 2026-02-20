import { Feather } from '@expo/vector-icons'
import { Pressable } from 'react-native'

type Props = {} & React.ComponentProps<typeof Pressable>

export default function AddNewClient(props: Props) {
	return (
		<Pressable {...props}>
			<Feather size={24} color={'white'} name='plus' />
		</Pressable>
	)
}
