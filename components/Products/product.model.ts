import { INewProductForm } from '@/shared/types/products.types'
import { create } from 'zustand'

export const initialFormState: INewProductForm = {
	name: '',
	sku: '',
	quantity: 0,
	price: 0,
	description: '',
	category: ''
}

type State = {
	newProductFormState: INewProductForm
	editingProductId: string | null
}

type Actions = {
	updateFormState: (data: Partial<INewProductForm>) => void
	setSubmitFunction: (fn: (data: INewProductForm) => void) => void
	resetForm: () => void
	submitForm: (data: INewProductForm) => void
	setEditingProductId: (id: string | null) => void
}

const useProductStore = create<State & Actions>(set => ({
	newProductFormState: initialFormState,
	editingProductId: null,
	submitForm: () => {},

	updateFormState: data =>
		set(state => ({
			newProductFormState: {
				...state.newProductFormState,
				...data
			}
		})),
	resetForm: () =>
		set({
			newProductFormState: initialFormState,
			editingProductId: null
		}),
	setSubmitFunction: fn => set({ submitForm: fn }),
	setEditingProductId: id => set({ editingProductId: id })
}))

export default useProductStore
