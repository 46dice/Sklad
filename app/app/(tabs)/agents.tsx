import AddNewClient from '@/components/AddNewClient/AddNewClient'
import { GoToProfile } from '@/components/screens/profile/GoToProfile'
import { Input } from '@/shared/ui/Input'
import { useRouter } from 'expo-router'
import { FC } from 'react'
import { Text, View } from 'react-native'

type Props = {}

const Agents: FC<Props> = () => {
	const { navigate } = useRouter()
	return (
		<View>
			<View className='ml-auto flex-row gap-4 p-4'>
				<AddNewClient onPress={() => navigate('/app/(NewClient)/modal')} />
				<GoToProfile />
			</View>
			<View className='px-4'>
				<Input
					searchIcon
					placeholder='Поиск по клиентам'
					className='text-white'
				/>
			</View>
		</View>
	)
}

export default Agents
