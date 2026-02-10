import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'

enum TypeAuth {
	Register = 'Register',
	Login = 'Login'
}

export function Auth() {
	const [typeAuth, setTypeAuth] = useState<TypeAuth>(TypeAuth.Register)

	const text =
		typeAuth === TypeAuth.Register ? TypeAuth.Register : TypeAuth.Login

	const onToggleTypeAuth = () => {
		setTypeAuth(prev =>
			prev === TypeAuth.Register ? TypeAuth.Login : TypeAuth.Register
		)
	}

	return (
		<View className='bg-black items-center justify-center h-full'>
			<View>
				<Text className='color-white'>{text}</Text>
		
				{/* <TextInput className='color-gray-200'>Email</TextInput> */}
				{/* <TextInput className='color-gray-200'>Password</TextInput> */}

				<Button className='mt-6' icon='archive'>
					Начать работу
				</Button>
			</View>
		</View>
	)
}
