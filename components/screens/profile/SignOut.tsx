import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/shared/constants/Colors'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

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
		<Pressable
			onPress={onSignOut}
			className='rounded-xl overflow-hidden active:opacity-80'
			style={{ backgroundColor: Colors.primary }}
		>
			<View className='flex-row items-center justify-center px-6 py-4'>
				<MaterialIcons name='logout' size={20} color={Colors.white} />
				<Text className='text-base font-semibold text-white ml-3'>
					Выйти из аккаунта
				</Text>
			</View>
		</Pressable>
	)
}
