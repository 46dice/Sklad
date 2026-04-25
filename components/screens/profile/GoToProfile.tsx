import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { TouchableOpacity } from 'react-native'

export function GoToProfile() {
	const { colors } = useTheme()

	return (
		<TouchableOpacity
			onPress={() => router.navigate('/app/profile/profile')}
			style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
		>
			<Feather name='settings' size={20} color='white' />
		</TouchableOpacity>
	)
}
