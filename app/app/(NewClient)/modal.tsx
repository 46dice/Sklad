import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'

export default function Modal() {
	return (
		<View className='px-1'>
			<StatusBar style={'light'} />

			<Text className='text-white text-center mt-4 mb-1'>
				Можно заполнить форму автоматически, указав ИНН. Просто введите ИНН ниже
				и нажмите &quot;Заполнить&quot;
			</Text>

			<View className='mx-auto w-full'>
				<Input searchIcon placeholder='ИНН' />
			</View>

			<Button onPress={() => {}} className='mt-2 mb-6 w-full'>
				<Text>Заполнить</Text>
			</Button>

			<View className='gap-1 mb-2'>
				<Input placeholder='Наименование (Отобразится во вкладке "Клиенты")' />
				<Input keyboardType='phone-pad' placeholder='Телефон' />
				<Input keyboardType='email-address' placeholder='Email' />
				<Input placeholder='Фактический Адрес' />
			</View>

			<Text className='uppercase text-sm text-white'>Реквизиты</Text>
			<View className='gap-1'>
				<Input placeholder='Полное наименование' />
				<Input placeholder='Адрес' />
				<Input keyboardType='numeric' placeholder='ИНН' />
				<Input keyboardType='numeric' placeholder='КПП' />
				<Input keyboardType='numeric' placeholder='ОГРН' />
				<Input keyboardType='numeric' placeholder='ОКПО' />
			</View>
		</View>
	)
}
