import { Colors } from '@/shared/constants/Colors'
import { TypeFeatherIconNames } from '@/shared/types/icon.types'
import { Feather } from '@expo/vector-icons'
import cn from 'clsx'
import { LinearGradient } from 'expo-linear-gradient'
import { FC, PropsWithChildren } from 'react'
import {
	ActivityIndicator,
	Text,
	TouchableHighlight,
	TouchableHighlightProps,
	View
} from 'react-native'

type Props = TouchableHighlightProps & {
	className?: string
	icon?: TypeFeatherIconNames
	isLoading?: boolean
}

export const Button: FC<PropsWithChildren<Props>> = ({
	className,
	children,
	icon,
	isLoading = false,
	...rest
}) => {
	return (
		<TouchableHighlight
			className={cn('self-center rounded-2xl overflow-hidden', className)}
			{...rest}
		>
			<LinearGradient
				className={cn('w-full items-center ', {
					'flex-row': !!icon
				})}
				start={{ x: 0.1, y: 0.2 }}
				end={{ x: 1, y: 1 }}
				colors={['#DC3F41', '#a6282b']}
			>
				<View className='py-3 px-8 text-center flex-row items-center justify-center'>
					{!isLoading && icon && <Feather name={icon} size={18} color={'white'} />}
					{!isLoading && (
						<Text
							className={cn('text-white font-medium text-lg', {
								'ml-2': !!icon
							})}
						>
							{children}
						</Text>
					)}
					{isLoading && (
						<ActivityIndicator size={'large'} color={Colors.white} />
					)}
				</View>
			</LinearGradient>
		</TouchableHighlight>
	)
}
