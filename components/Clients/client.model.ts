import { INewClientForm } from '@/shared/types/clients.types'
import { create } from 'zustand'

export const initialFormState: INewClientForm = {
	name: '',
	email: '',
	phone: '',
	actualAddress: '',
	isPhysicalPerson: false,
	fullName: '',
	legalAddress: '',
	inn: '',
	ogrn: '',
	okpo: '',
	bankAccountNumber: ''
}

type State = {
	newClientFormState: INewClientForm
}

type Actions = {
	updateFormState: (data: Partial<INewClientForm>) => void
	setSubmitFunction: (fn: (data: INewClientForm) => void) => void
	resetForm: () => void 
	submitForm: (data: INewClientForm) => void
}

const useClientStore = create<State & Actions>(set => ({
	newClientFormState: initialFormState,
	submitForm: () => {},

	updateFormState: data =>
		set(state => ({
			newClientFormState: {
				...state.newClientFormState,
				...data
			}
		})),
	resetForm: () => set({ newClientFormState: initialFormState }),
	setSubmitFunction: fn => set({ submitForm: fn })
}))

export default useClientStore
