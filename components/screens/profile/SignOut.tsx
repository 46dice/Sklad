import { useAuth } from '@/hooks/useAuth'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

export default function SignOut() {
	const { authFirebase } = useAuth()
	const router = useRouter()

	const onSignOut = async () => {
		try {
			await authFirebase.signOut()
			router.replace('/auth')
		} catch (error) {
			console.error('Ошибка при выходе из аккаунта:', error)
		}
	}

	return (
		<View>
			<Pressable onPress={onSignOut}>
				<Text className='color-primary'>Выйти</Text>
			</Pressable>
		</View>
	)
}
