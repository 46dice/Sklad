import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useShipments } from '@/hooks/useShipments'
import { IInvoice, IInvoiceItem, INewInvoiceForm } from '@/shared/types/invoice.types'
import { IShipment } from '@/shared/types/shipment.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export const useInvoices = () => {
	const { user } = useAuth()
	const { shipments } = useShipments()
	const [invoices, setInvoices] = useState<IInvoice[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchInvoices = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const invoicesCollection = collection(db, 'users', user.uid, 'invoices')
			const querySnapshot = await getDocs(invoicesCollection)
			const invoicesList = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					...data,
					id: doc.id
				} as IInvoice
			})
			setInvoices(invoicesList)
		} catch (error) {
			showToast(`Ошибка при загрузке счетов: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	// Получаем акты за период для конкретного контрагента
	const getShipmentsForPeriod = useCallback(
		(clientId: string, periodFrom: string, periodTo: string): IShipment[] => {
			const from = new Date(periodFrom)
			const to = new Date(periodTo)

			return shipments.filter(shipment => {
				if (shipment.clientId !== clientId) return false
				if (shipment.status !== 'completed') return false

				const shipmentDate = new Date(shipment.createdAt)
				return shipmentDate >= from && shipmentDate <= to
			})
		},
		[shipments]
	)

	const saveInvoice = useCallback(
		async (formData: INewInvoiceForm) => {
			if (!user) return null

			try {
				setIsLoading(true)

				// Получаем акты за период
				const periodShipments = getShipmentsForPeriod(
					formData.clientId,
					formData.periodFrom,
					formData.periodTo
				)

				if (periodShipments.length === 0) {
					showToast('Нет актов за выбранный период')
					return null
				}

				// Формируем позиции счета из актов
				const items: IInvoiceItem[] = []
				let totalQuantity = 0
				let totalAmount = 0

				periodShipments.forEach(shipment => {
					shipment.items.forEach(item => {
						items.push({
							actNumber: shipment.actNumber,
							serviceName: item.serviceName,
							quantity: item.quantity,
							price: item.price,
							totalAmount: item.totalAmount
						})
						totalQuantity += item.quantity
						totalAmount += item.totalAmount
					})
				})

				const invoicesCollection = collection(db, 'users', user.uid, 'invoices')
				const allInvoices = await getDocs(invoicesCollection)
				const invoiceNumber = String(allInvoices.size + 1).padStart(5, '0')
				const invoiceDate = new Date().toISOString().split('T')[0]

				const newInvoiceData = {
					invoiceNumber: `Счет № ${invoiceNumber}`,
					invoiceDate,
					clientId: formData.clientId,
					clientName: formData.clientName,
					clientInn: formData.clientInn,
					clientAddress: formData.clientAddress,
					items,
					shipmentIds: periodShipments.map(s => s.id),
					totalQuantity,
					totalAmount,
					periodFrom: formData.periodFrom,
					periodTo: formData.periodTo,
					status: 'draft' as const,
					createdAt: new Date().toISOString(),
					notes: formData.notes || ''
				}

				const docRef = await addDoc(invoicesCollection, newInvoiceData)

				const savedInvoice: IInvoice = {
					...newInvoiceData,
					id: docRef.id
				}

				setInvoices(prev => [...prev, savedInvoice])
				showToast('Счет создан')
				return savedInvoice
			} catch (error) {
				showToast(`Ошибка при создании счета: ${error}`)
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[user, getShipmentsForPeriod]
	)

	const updateInvoice = useCallback(
		async (invoiceId: string, updates: Partial<IInvoice>) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'invoices', invoiceId)
				await updateDoc(docRef, updates)

				setInvoices(prev =>
					prev.map(i => (i.id === invoiceId ? { ...i, ...updates } : i))
				)
				showToast('Счет обновлен')
				return true
			} catch (error) {
				showToast(`Ошибка при обновлении счета: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const deleteInvoice = useCallback(
		async (invoiceId: string) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'invoices', invoiceId)
				await deleteDoc(docRef)

				setInvoices(prev => prev.filter(i => i.id !== invoiceId))
				showToast('Счет удален')
				return true
			} catch (error) {
				showToast(`Ошибка при удалении счета: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	useEffect(() => {
		fetchInvoices()
	}, [fetchInvoices])

	return {
		invoices,
		isLoading,
		fetchInvoices,
		saveInvoice,
		updateInvoice,
		deleteInvoice,
		getShipmentsForPeriod
	}
}
