import { Text, View } from 'react-native'
import { FC } from 'react'
import { GoToProfile } from '@/components/profile/GoToProfile'

type Props = {}

const Agents: FC<Props> = () => {
	return (
		<View>
			<Text className='text-white'>Agents</Text>
			<GoToProfile />
		</View>
	)
}
export default Agents