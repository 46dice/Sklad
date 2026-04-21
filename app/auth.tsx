import { useAuth } from '@/hooks/useAuth'
import { validEmail } from '@/shared/reges'
import { IAuthFormData } from '@/shared/types/auth.types'
import { UserRole } from '@/shared/types/user.types'
import { Button } from '@/shared/ui/Button'
import DismissKeyboard from '@/shared/ui/DismissKeyboard'
import { FormInput } from '@/shared/ui/FormInput'
import { Feather } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'

enum TypeAuth {
	Register = 'Регистрация',
	Login = 'Войти'
}

export default function Auth() {
	const [typeAuth, setTypeAuth] = useState<TypeAuth>(TypeAuth.Register)
	const [selectedRole, setSelectedRole] = useState<UserRole>('manager')

	const { user, handleLogin, handleRegister, isLoading } = useAuth()

	const { control, handleSubmit } = useForm<IAuthFormData>({
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
			await handleRegister(email, password, selectedRole)
		} else {
			await handleLogin(email, password)
		}
	}

	if (user) {
		return <Redirect href='/app/(tabs)/monitoring' />
	}

	return (
		<DismissKeyboard>
			<View className='items-center justify-center h-full bg-black'>
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
						boxClassname='mb-2'
					/>
					<FormInput<IAuthFormData>
						placeholder='Password'
						control={control}
						name='password'
						secureTextEntry={true}
						rules={{
							required: 'Пароль обязателен!',
							minLength: {
								value: 6,
								message: 'пароль должен быть минимум 6 символов'
							}
						}}
					/>

					{/* Выбор роли при регистрации */}
					{isRegister && (
						<View className='w-full mb-4'>
							<Text className='text-gray-300 text-sm font-medium mb-2'>
								Выберите роль
							</Text>
							<View className='flex-row gap-3'>
								<TouchableOpacity
									onPress={() => setSelectedRole('manager')}
									className={`flex-1 p-4 rounded-lg border-2 ${
										selectedRole === 'manager'
											? 'border-primary bg-primary/20'
											: 'border-gray-600 bg-gray-default'
									}`}
								>
									<View className='items-center'>
										<Feather
											name='briefcase'
											size={32}
											color={selectedRole === 'manager' ? '#BF3335' : '#9CA3AF'}
										/>
										<Text
											className={`mt-2 font-semibold ${
												selectedRole === 'manager' ? 'text-primary' : 'text-gray-400'
											}`}
										>
											Менеджер
										</Text>
										<Text className='text-gray-500 text-xs text-center mt-1'>
											Управление товарами и продажами
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => setSelectedRole('courier')}
									className={`flex-1 p-4 rounded-lg border-2 ${
										selectedRole === 'courier'
											? 'border-primary bg-primary/20'
											: 'border-gray-600 bg-gray-default'
									}`}
								>
									<View className='items-center'>
										<Feather
											name='truck'
											size={32}
											color={selectedRole === 'courier' ? '#BF3335' : '#9CA3AF'}
										/>
										<Text
											className={`mt-2 font-semibold ${
												selectedRole === 'courier' ? 'text-primary' : 'text-gray-400'
											}`}
										>
											Курьер
										</Text>
										<Text className='text-gray-500 text-xs text-center mt-1'>
											Выполнение доставок
										</Text>
									</View>
								</TouchableOpacity>
							</View>
						</View>
					)}

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
