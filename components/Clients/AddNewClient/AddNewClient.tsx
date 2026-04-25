import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'

export default function AddNewClient() {
	const { navigate } = useRouter()
	const { colors } = useTheme()

	return (
		<TouchableOpacity
			onPress={() => navigate('/app/(NewClient)/modal')}
			style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
		>
			<Feather size={20} color='white' name='plus' />
		</TouchableOpacity>
	)
}
