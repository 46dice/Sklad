import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Colors } from '@/shared/constants/Colors'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

export default function SignOut() {
	const { authFirebase } = useAuth()
	const router = useRouter()
	const { colors } = useTheme()

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
			style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.primary }}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
				<MaterialIcons name='logout' size={20} color='white' />
				<Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginLeft: 12 }}>
					Выйти из аккаунта
				</Text>
			</View>
		</Pressable>
	)
}
