import AddNewClient from '@/components/Clients/AddNewClient/AddNewClient'
import ClientList from '@/components/Clients/ClientList'
import { GoToProfile } from '@/components/screens/profile/GoToProfile'
import { useClients } from '@/hooks/useClients'
import { Input } from '@/shared/ui/Input'
import { useFocusEffect } from '@react-navigation/native'
import { FC, useCallback } from 'react'
import { View } from 'react-native'

type Props = {}

const Agents: FC<Props> = () => {
	const {
		filteredClients,
		isLoading,
		searchClients,
		searchQuery,
		refreshClients
	} = useClients()

	useFocusEffect(
		useCallback(() => {
			refreshClients()
		}, [refreshClients])
	)

	return (
		<View className='flex-1'>
			<View className='ml-auto flex-row gap-4 p-4'>
				<AddNewClient />
				<GoToProfile />
			</View>
			<View className='px-4 mb-4'>
				<Input
					searchIcon
					placeholder='Поиск по клиентам'
					className='text-white'
					value={searchQuery}
					onChangeText={searchClients}
				/>
			</View>
			<View className='flex-1'>
				<ClientList clients={filteredClients} isLoading={isLoading} />
			</View>
		</View>
	)
}

export default Agents
