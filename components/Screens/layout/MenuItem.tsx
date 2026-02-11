import { TypeRootStackParamList } from '@/navigation/navigation.types'
import { TypeFeatherIconNames } from '@/shared/types/icon.types'
import { Feather } from '@expo/vector-icons'
import cn from 'clsx'
import { FC } from 'react'
import { Pressable, Text } from 'react-native'

type Props = {
	title: string
	link: keyof TypeRootStackParamList
	icon: TypeFeatherIconNames
	currentRoute?: string
	nav: (path: keyof TypeRootStackParamList) => void
}

export const MenuItem: FC<Props> = ({
	title,
	link,
	icon,
	currentRoute,
	nav
}) => {
	const isActive = currentRoute === link
	return (
		<Pressable
			className={cn('items-center justify-center p-2', {
				'color-primary': isActive
			})}
			onPress={() => nav(link)}
		>
			<Feather name={icon} size={16} color={isActive ? '#BF3335' : '#6a7282'} />
			<Text className={cn('text-gray-500', isActive && 'text-primary')}>
				{title}
			</Text>
		</Pressable>
	)
}
