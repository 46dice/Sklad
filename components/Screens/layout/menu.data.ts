import { TypeRootStackParamList } from '@/navigation/navigation.types'
import { TypeFeatherIconNames } from '@/shared/types/icon.types'

type menuItem = {
	icon: TypeFeatherIconNames
	link: keyof TypeRootStackParamList
	title: string
}

export const menuData: menuItem[] = [
	{
		icon: 'monitor',
		link: 'Monitoring',
		title: 'Мониторинг'
	},
	{
		icon: 'download-cloud',
		link: 'Documents',
		title: 'Документы'
	},
	{
		icon: 'shopping-cart',
		link: 'Products',
		title: 'Товары'
	},
	{
		icon: 'user',
		link: 'Agents',
		title: 'Клиенты'
	}
]
