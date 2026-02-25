import { validEmail } from '@/shared/reges'
import { INewClientForm } from '@/shared/types/clients.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { Controller, useForm } from 'react-hook-form'
import { Switch, Text, View } from 'react-native'
import { useNewClient } from './useNewClient'
import { useEffect } from 'react'

type Props = {}

export default function AddNewClientForm({}: Props) {
	const { control, handleSubmit, reset, watch, setValue } =
		useForm<INewClientForm>({
			mode: 'onChange',
			defaultValues: {
				isPhysicalPerson: false
			}
		})

	const {
		control: controlINN,
		handleSubmit: handleSubmitINN,
		reset: resetINN,
		formState: formStateINN
	} = useForm<{ inn: string }>({
		mode: 'onChange'
	})
	const { fetchClientINN, data, isLoading } = useNewClient()

	const isPhysicalPerson = watch('isPhysicalPerson')

	useEffect(() => {
		if (data?.suggestions?.[0]) {
			const client = data.suggestions[0]
			const ipData = client.data

			const email = ipData.emails?.[0]?.value || ''
			console.log('email', ipData)
			setValue('name', ipData.name.full)
			setValue('phone', ipData.phones?.[0]?.value || '')
			setValue('email', email)
			setValue('actualAddress', ipData.address.value)
			setValue('fullName', ipData.name.full)
			setValue('legalAddress', ipData.address.value)
			setValue('inn', ipData.inn)
			setValue('ogrn', ipData.ogrn)
			setValue('okpo', ipData.okpo)

		}
	}, [data, setValue])

	const onSubmitSearchInn = async ({ inn }: { inn: string }) => {
		if (!inn.length) {
			return
		}
		await fetchClientINN(inn)
	}

	return (
		<>
			<View className='px-4'>
				<Text className='text-white text-center mt-4 mb-1'>
					Можно заполнить форму автоматически, указав ИНН. Просто введите ИНН
					ниже и нажмите &quot;Заполнить&quot;
				</Text>

				<View className='mx-auto w-full'>
					<FormInput<{ inn: string }>
						name='inn'
						keyboardType='numeric'
						placeholder='ИНН'
						control={controlINN}
						rules={{
							pattern: {
								value: /^\d{10,}$/,
								message: 'ИНН должен состоять минимум из 10 цифр'
							},
							minLength: {
								value: 10,
								message: 'ИНН должен состоять минимум из 10 цифр'
							}
						}}
					/>
				</View>

				<Button
					disabled={!formStateINN.isValid}
					isLoading={isLoading}
					onPress={handleSubmitINN(onSubmitSearchInn)}
					className='mt-2 mb-6 w-full'
				>
					<Text>Заполнить</Text>
				</Button>
			</View>

			<View className='gap-1 mb-2'>
				<FormInput<INewClientForm>
					name='name'
					control={control}
					placeholder='Наименование (Отобразится во вкладке "Клиенты")'
					rules={{
						required: 'Наименование обязательно!'
					}}
				/>
				<FormInput<INewClientForm>
					name='phone'
					control={control}
					placeholder='Телефон'
					keyboardType='phone-pad'
				/>
				<FormInput<INewClientForm>
					name='email'
					control={control}
					placeholder='Email'
					keyboardType='email-address'
					rules={{
						pattern: {
							value: validEmail,
							message: 'Некорректный email'
						}
					}}
				/>
				<FormInput<INewClientForm>
					name='actualAddress'
					control={control}
					placeholder='Фактический Адрес'
				/>
			</View>

			<View className='flex-row items-center justify-between mb-2'>
				<Text className='uppercase text-sm text-white'>Реквизиты</Text>
				<View className='items-center gap-1.5 flex-row'>
					<Text className='text-gray-500 text-sm'>Физическое лицо</Text>
					<View>
						<Controller
							control={control}
							name='isPhysicalPerson'
							render={({ field: { value, onChange } }) => (
								<Switch value={value} onValueChange={onChange} />
							)}
						/>
					</View>
				</View>
			</View>
			{!isPhysicalPerson ? (
				<View className='gap-1'>
					<FormInput<INewClientForm>
						name='fullName'
						control={control}
						placeholder='Полное наименование'
					/>
					<FormInput<INewClientForm>
						name='legalAddress'
						control={control}
						placeholder='Адрес'
					/>
					<FormInput<INewClientForm>
						name='inn'
						control={control}
						placeholder='ИНН'
						keyboardType='numeric'
					/>
					<FormInput<INewClientForm>
						name='kpp'
						control={control}
						placeholder='КПП'
						keyboardType='numeric'
					/>
					<FormInput<INewClientForm>
						name='ogrn'
						control={control}
						placeholder='ОГРН'
						keyboardType='numeric'
					/>
					<FormInput<INewClientForm>
						name='okpo'
						control={control}
						placeholder='ОКПО'
						keyboardType='numeric'
					/>
				</View>
			) : null}
		</>
	)
}
