import { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { menuData } from './menu.data'
import { MenuItem } from './MenuItem'
import { TypeRootStackParamList } from '@/navigation/navigation.types'

type Props = {
	currentRoute?: string
	nav: (path: keyof TypeRootStackParamList) => void
}

const styles = StyleSheet.create({
	container: {
		borderColor: '#6B7280',
		borderTopWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		justifyContent: 'space-between',
		paddingRight: 3,
		paddingLeft: 3
	}
})

export const BottomMenuNav: FC<Props> = ({ currentRoute, nav }) => {
	const { bottom } = useSafeAreaInsets()
	return (
		<View style={[styles.container, { paddingBottom: bottom + 5 }]}>
			{menuData.map(item => (
				<MenuItem
					key={item.link}
					icon={item.icon}
					link={item.link}
					title={item.title}
					currentRoute={currentRoute}
					nav={nav}
				/>
			))}
		</View>
	)
}
