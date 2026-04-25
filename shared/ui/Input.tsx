import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import cn from 'clsx'
import { Text, TextInput, TextInputProps, View } from 'react-native'
import { Colors } from '../constants/Colors'

interface Props extends TextInputProps {
	errorText?: string | null
	searchIcon?: boolean
	secondary?: boolean
	boxClassname?: string
}

export const Input = ({
	errorText,
	searchIcon = false,
	secondary = false,
	boxClassname,
	...rest
}: Props) => {
	const { colors } = useTheme()

	return (
		<>
			<View
				style={{
					backgroundColor: colors.surface,
					borderWidth: 1,
					borderColor: secondary ? Colors.secondary : errorText ? Colors.primary : colors.border,
					borderRadius: 8,
					paddingBottom: 12,
					paddingTop: 10,
					paddingHorizontal: 16
				}}
				className={cn(boxClassname)}
			>
				<View className={cn('absolute left-2 top-3', !searchIcon && 'hidden')}>
					<Feather
						name='search'
						color={secondary ? Colors.secondary : colors.textSecondary}
						size={16}
					/>
				</View>
				<TextInput
					autoCapitalize={'none'}
					style={[
						{ paddingLeft: searchIcon ? 18 : 0, color: colors.text },
					]}
					placeholderTextColor={colors.textSecondary}
					{...rest}
				/>
			</View>
			{errorText && <Text style={{ color: Colors.primary }} className='mb-2'>{errorText}</Text>}
		</>
	)
}
