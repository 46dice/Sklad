import { TypeFeatherIconNames } from '@/shared/icon.types'
import cn from 'clsx'
import { FC, PropsWithChildren } from 'react'
import { Pressable, PressableProps, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'

type Props = PressableProps & {
	className?: string
	icon?: TypeFeatherIconNames
}

export const Button: FC<PropsWithChildren<Props>> = ({
	className,
	children,
	icon,
	...rest
}) => {
	return (
		<Pressable
			className={cn('self-center rounded-2xl overflow-hidden', className)}
			{...rest}
		>
			<LinearGradient
				className={cn('w-full items-center ', {
					'flex-row': !!icon
				})}
				colors={['#DC3F41', '#a6282b']}
			>
				<View className='flex-row'>
					{icon && <Feather name={icon} size={18} color={'white'} />}
					<Text
						className={cn(
							'text-white py-3 px-8 text-center font-medium text-lg',
							{
								'ml-2': !!icon
							}
						)}
					>
						{children}
					</Text>
				</View>
			</LinearGradient>
		</Pressable>
	)
}
