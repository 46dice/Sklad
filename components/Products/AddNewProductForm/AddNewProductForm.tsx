import { useAuth } from '@/hooks/useAuth'
import { INewProductForm } from '@/shared/types/products.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Text, View } from 'react-native'
import { useNewProduct } from '../hooks/useNewProduct'
import { useProducts } from '../hooks/useProducts'
import useProductStore from '../product.model'

export default function AddNewProductForm() {
	const { newProductFormState, updateFormState, setSubmitFunction, resetForm, editingProductId } =
		useProductStore()

	const { user } = useAuth()

	const { control, reset } = useForm<INewProductForm>({
		mode: 'onChange',
		defaultValues: newProductFormState
	})

	const { fetchAddNewProduct, fetchUpdateProduct, isLoading } = useNewProduct()
	const { refreshProducts } = useProducts()

	useEffect(() => {
		reset(newProductFormState)
	}, [newProductFormState, reset])

	useEffect(() => {
		setSubmitFunction(async (data: INewProductForm) => {
			if (user) {
				if (editingProductId) {
					// Обновление существующего товара
					await fetchUpdateProduct(user.uid, editingProductId, data)
				} else {
					// Добавление нового товара
					await fetchAddNewProduct(user.uid, data)
				}
				refreshProducts()
			}
			resetForm()
		})
	}, [
		fetchAddNewProduct,
		fetchUpdateProduct,
		refreshProducts,
		resetForm,
		setSubmitFunction,
		user,
		editingProductId
	])

	const onFormChange = (data: Partial<INewProductForm>) => {
		updateFormState(data)
	}

	return (
		<View className='px-4 gap-2'>
			<Text className='text-white text-center mt-4 mb-2'>
				{editingProductId ? 'Редактирование товара' : 'Добавление нового товара'}
			</Text>

			<FormInput<INewProductForm>
				name='name'
				control={control}
				placeholder='Наименование товара'
				rules={{
					required: 'Наименование обязательно!'
				}}
				onChangeText={text => onFormChange({ name: text })}
			/>

			<FormInput<INewProductForm>
				name='sku'
				control={control}
				placeholder='SKU/Артикул'
				rules={{
					required: 'SKU обязательно!'
				}}
				onChangeText={text => onFormChange({ sku: text })}
			/>

			<FormInput<INewProductForm>
				name='quantity'
				control={control}
				placeholder='Количество на складе'
				keyboardType='numeric'
				rules={{
					required: 'Количество обязательно!',
					min: {
						value: 0,
						message: 'Количество не может быть отрицательным'
					}
				}}
				onChangeText={text =>
					onFormChange({ quantity: parseInt(text) || 0 })
				}
			/>

			<FormInput<INewProductForm>
				name='price'
				control={control}
				placeholder='Цена (₽)'
				keyboardType='decimal-pad'
				rules={{
					required: 'Цена обязательна!',
					min: {
						value: 0,
						message: 'Цена не может быть отрицательной'
					}
				}}
				onChangeText={text =>
					onFormChange({ price: parseFloat(text) || 0 })
				}
			/>

			<FormInput<INewProductForm>
				name='category'
				control={control}
				placeholder='Категория (опционально)'
				onChangeText={text => onFormChange({ category: text })}
			/>

			<FormInput<INewProductForm>
				name='description'
				control={control}
				placeholder='Описание (опционально)'
				multiline
				numberOfLines={3}
				onChangeText={text => onFormChange({ description: text })}
			/>

			<Button
				isLoading={isLoading}
				className='mt-4 mb-6 w-full'
			>
				<Text>
					{editingProductId ? 'Сохранить изменения' : 'Добавить товар'}
				</Text>
			</Button>
		</View>
	)
}
