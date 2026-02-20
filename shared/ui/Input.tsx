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
	return (
		<>
			<View
				className={cn(
					'bg-[#232323] w-full border rounded-lg pb-3 pt-2.5 px-4',
					secondary
						? 'border-secondary'
						: errorText
							? 'border-red'
							: 'border-transparent',
					boxClassname
				)}
			>
				<View className={cn('absolute left-2 top-3', !searchIcon && 'hidden')}>
					<Feather
						name='search'
						color={secondary ? Colors.secondary : Colors.gray500}
						size={16}
					/>
				</View>
				<TextInput
					autoCapitalize={'none'}
					className={cn(
						'text-white placeholder:text-gray-500',
						secondary && 'text-secondary placeholder:text-secondary'
					)}
					style={[{ paddingLeft: searchIcon ? 18 : 0 }]}
					{...rest}
				/>
			</View>
			{errorText && <Text className='text-red mb-2'>{errorText}</Text>}
		</>
	)
}
