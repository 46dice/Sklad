import { useTypedNavigation } from '@/hooks/useTypedNavigation'
import { Pressable, Text, View } from 'react-native'

export function Home() {
	const { navigate } = useTypedNavigation()
	return (
		<View>
			<Text className='color-primary'>Home</Text>

			<Pressable
				onPress={() => {
					navigate('Auth')
				}}
			>
				<Text>go login</Text>
			</Pressable>
		</View>
	)
}
