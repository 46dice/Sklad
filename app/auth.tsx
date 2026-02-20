import { useAuth } from '@/hooks/useAuth'
import { validEmail } from '@/shared/reges'
import { IAuthFormData } from '@/shared/types/auth.types'
import { Button } from '@/shared/ui/Button'
import DismissKeyboard from '@/shared/ui/DismissKeyboard'
import { FormInput } from '@/shared/ui/FormInput'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Text, View } from 'react-native'

enum TypeAuth {
	Register = 'Регистрация',
	Login = 'Войти'
}

export default function Auth() {
	const [typeAuth, setTypeAuth] = useState<TypeAuth>(TypeAuth.Register)

	const { user, handleLogin, handleRegister, isLoading } = useAuth()

	const { control, handleSubmit, reset } = useForm<IAuthFormData>({
		mode: 'onChange'
	})

	const text =
		typeAuth === TypeAuth.Register ? TypeAuth.Register : TypeAuth.Login

	const isRegister = typeAuth === TypeAuth.Register

	const onToggleTypeAuth = () => {
		setTypeAuth(prev =>
			prev === TypeAuth.Register ? TypeAuth.Login : TypeAuth.Register
		)
	}

	const onSubmit: SubmitHandler<IAuthFormData> = async ({
		email,
		password
	}) => {
		if (isRegister) {
			await handleRegister(email, password)
		} else {
			await handleLogin(email, password)
		}
	}

	// if (isLoading) {
	// 	return <Text>LOADING</Text>
	// }

	if (user) {
		return <Redirect href='/app/(tabs)/monitoring' />
	}

	return (
		<DismissKeyboard>
			<View className='items-center justify-center h-full'>
				<View className='items-center w-9/12'>
					<Text className='color-white text-5xl mb-3 font-bold'>{text}</Text>
					<FormInput<IAuthFormData>
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
					<FormInput<IAuthFormData>
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

					<Text
						onPress={onToggleTypeAuth}
						className='text-gray-500 ml-auto text-sm mb-6'
					>
						{isRegister
							? 'Есть аккаунт? Войти'
							: 'Нет аккаунта? Зарегистрироваться'}
					</Text>

					<Button
						className='w-[250px]'
						isLoading={isLoading}
						onPress={handleSubmit(onSubmit)}
						icon='git-commit'
					>
						{isRegister ? 'Зарегистрироваться' : 'Начать работу'}
					</Button>
				</View>
			</View>
		</DismissKeyboard>
	)
}
