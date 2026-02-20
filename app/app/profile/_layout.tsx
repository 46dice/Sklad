import GoBackArrowButton from '@/components/GoBackArrowButton'
import { Colors } from '@/shared/constants/Colors'
import { Stack } from 'expo-router'

export default function _layout() {

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: Colors.black,
				},
				contentStyle: {
					backgroundColor: Colors.black,
				}
			}}
		>
			<Stack.Screen
				name='profile'
				options={{
					title:'Профиль',
					headerLeft: () => (
						<GoBackArrowButton />
					)
				}}
			/>
		</Stack>
	)
}
