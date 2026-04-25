import GoBackArrowButton from '@/components/GoBackArrowButton'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Stack } from 'expo-router'

export default function _layout() {
	const { colors } = useTheme()

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: colors.surface,
				},
				headerTitleStyle: {
					color: colors.text,
				},
				contentStyle: {
					backgroundColor: colors.background,
				}
			}}
		>
			<Stack.Screen
				name='profile'
				options={{
					title: 'Профиль',
					headerLeft: () => (
						<GoBackArrowButton />
					)
				}}
			/>
		</Stack>
	)
}
