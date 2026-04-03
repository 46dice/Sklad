import { IContract, INewContractForm } from '@/shared/types/contracts.types'
import { create } from 'zustand'

export const initialFormState: INewContractForm = {
	clientId: '',
	clientName: '',
	contractNumber: '',
	description: '',
	paymentTerms: 'Оплата в течение 30 дней',
	deliveryTerms: 'Доставка в течение 5 рабочих дней',
	price: 0,
	validFrom: new Date().toISOString().split('T')[0],
	validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
		.toISOString()
		.split('T')[0],
	currency: 'RUB'
}

type State = {
	contracts: IContract[]
	newContractFormState: INewContractForm
	editingContractId: string | null
}

type Actions = {
	addContract: (contract: IContract) => void
	updateContract: (id: string, contract: Partial<IContract>) => void
	deleteContract: (id: string) => void
	getContract: (id: string) => IContract | undefined
	updateFormState: (data: Partial<INewContractForm>) => void
	setSubmitFunction: (fn: (data: INewContractForm) => void) => void
	resetForm: () => void
	submitForm: (data: INewContractForm) => void
	setEditingContractId: (id: string | null) => void
}

const useContractStore = create<State & Actions>(set => ({
	contracts: [],
	newContractFormState: initialFormState,
	editingContractId: null,
	submitForm: () => {},

	addContract: contract =>
		set(state => ({
			contracts: [...state.contracts, contract]
		})),

	updateContract: (id, contract) =>
		set(state => ({
			contracts: state.contracts.map(c => (c.id === id ? { ...c, ...contract } : c))
		})),

	deleteContract: id =>
		set(state => ({
			contracts: state.contracts.filter(c => c.id !== id)
		})),

	getContract: id => {
		const state = useContractStore.getState()
		return state.contracts.find(c => c.id === id)
	},

	updateFormState: data =>
		set(state => ({
			newContractFormState: {
				...state.newContractFormState,
				...data
			}
		})),

	resetForm: () => set({ newContractFormState: initialFormState }),

	setSubmitFunction: fn => set({ submitForm: fn }),

	setEditingContractId: id => set({ editingContractId: id })
}))

export default useContractStore
