import AddNewClient from '@/components/Clients/AddNewClient/AddNewClient'
import ClientList from '@/components/Clients/ClientList'
import { GoToProfile } from '@/components/screens/profile/GoToProfile'
import { useClients } from '@/hooks/useClients'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Input } from '@/shared/ui/Input'
import { useFocusEffect } from '@react-navigation/native'
import { FC, useCallback } from 'react'
import { Text, View } from 'react-native'

type Props = {}

const Agents: FC<Props> = () => {
	const {
		filteredClients,
		isLoading,
		searchClients,
		searchQuery,
		refreshClients
	} = useClients()
	const { colors } = useTheme()

	useFocusEffect(
		useCallback(() => {
			refreshClients()
		}, [refreshClients])
	)

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
				<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>Клиенты</Text>
				<View style={{ flexDirection: 'row', gap: 8 }}>
					<AddNewClient />
					<GoToProfile />
				</View>
			</View>
			<View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
				<Input
					searchIcon
					placeholder='Поиск по клиентам'
					value={searchQuery}
					onChangeText={searchClients}
				/>
			</View>
			<View style={{ flex: 1 }}>
				<ClientList clients={filteredClients} isLoading={isLoading} />
			</View>
		</View>
	)
}

export default Agents
