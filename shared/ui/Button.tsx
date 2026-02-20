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
	variant?: 'primary' | 'ghost'
	size?: 'small' | 'medium' | 'large'
}

export const Button: FC<PropsWithChildren<Props>> = ({
	className,
	children,
	icon,
	isLoading = false,
	variant = 'primary',
	size = 'medium',
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
				colors={
					variant === 'primary'
						? ['#DC3F41', '#a6282b']
						: ['transparent', 'transparent']
				}
			>
				<View className='py-3 px-8 text-center flex-row items-center justify-center'>
					{!isLoading && icon && (
						<Feather
							name={icon}
							size={size === 'small' ? 16 : size === 'medium' ? 18 : 24}
							color={'white'}
						/>
					)}
					{!isLoading && (
						<Text
							className={cn('text-white font-medium text-lg', {
								'ml-2': !!icon,
								'text-sm': size === 'small',
								'text-md': size === 'medium',
								'text-lg': size === 'large'
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
