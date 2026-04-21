import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/shared/constants/Colors'
import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

export default function Index() {
	const { user, userProfile, isLoading } = useAuth()

	// Показываем загрузку пока профиль не загружен
	if (isLoading || (user && !userProfile)) {
		return (
			<View className='flex-1 items-center justify-center' style={{ backgroundColor: Colors.black }}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		)
	}

	if (user && userProfile) {
		const isCourier = userProfile.role === 'courier'
		return <Redirect href={isCourier ? '/app/(tabs)/income' : '/app/(tabs)/monitoring'} />
	}

	return <Redirect href='/auth' />
}
