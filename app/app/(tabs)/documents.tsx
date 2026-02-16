import { Text, View } from 'react-native'
import { FC, useEffect } from 'react'
import { getCities } from '@/firebase'

type Props = {}

const Documents: FC<Props> = () => {
	
	return (
		<View>
			<Text className='text-white'>Documents</Text>
		</View>
	)
}
export default Documents
