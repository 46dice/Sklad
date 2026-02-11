import { Button } from '@/components/ui/Button'
import DismissKeyboard from '@/components/ui/DismissKeyboard'
import { Input } from '@/components/ui/Input'
import { validEmail } from '@/shared/reges'
import { IAuthFormData } from '@/shared/types/auth.types'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Text, View } from 'react-native'

enum TypeAuth {
	Register = 'Регистрация',
	Login = 'Войти'
}

export function Auth() {
	const [typeAuth, setTypeAuth] = useState<TypeAuth>(TypeAuth.Register)

	const { control, handleSubmit, reset } = useForm<IAuthFormData>({
		mode: 'onChange'
	})

	const text =
		typeAuth === TypeAuth.Register ? TypeAuth.Register : TypeAuth.Login

	const onToggleTypeAuth = () => {
		setTypeAuth(prev =>
			prev === TypeAuth.Register ? TypeAuth.Login : TypeAuth.Register
		)
	}

	const onSubmit: SubmitHandler<IAuthFormData> = data => {
		console.log(data)
	}

	return (
		<DismissKeyboard>
			<View className='bg-black items-center justify-center h-full'>
				<View className='items-center w-9/12'>
					<Text className='color-white text-6xl mb-3 font-bold'>{text}</Text>

					<Input<IAuthFormData>
						name='email'
						keyboardType='email-address'
						placeholder='Email'
						control={control}
						rules={{
							required: 'Почта обязательна!',
							pattern: {
								value: validEmail,
								message: 'Введите валидную почту'
							}
						}}
					/>
					<Input<IAuthFormData>
						placeholder='Password'
						name='password'
						keyboardType='visible-password'
						control={control}
						rules={{
							required: 'Пароль обязателен!',
							minLength: {
								value: 6,
								message: 'пароль должен быть минимум 6 символов'
							}
						}}
					/>

					<Button onPress={() => handleSubmit(onSubmit)} icon='archive'>
						Начать работу
					</Button>
				</View>
			</View>
		</DismissKeyboard>
	)
}
