import useContractStore from '@/components/Contracts/contract.model'
import { ContractStatus, IContract } from '@/shared/types/contracts.types'
import { useCallback, useEffect, useState } from 'react'

interface UseContractsOptions {
	clientId?: string
	status?: ContractStatus
}

export const useContracts = (options?: UseContractsOptions) => {
	const { contracts } = useContractStore()
	const [filteredContracts, setFilteredContracts] = useState<IContract[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		setIsLoading(true)
		try {
			let filtered = [...contracts]

			if (options?.clientId) {
				filtered = filtered.filter(c => c.clientId === options.clientId)
			}

			if (options?.status) {
				filtered = filtered.filter(c => c.status === options.status)
			}

			setFilteredContracts(filtered)
		} finally {
			setIsLoading(false)
		}
	}, [contracts, options?.clientId, options?.status])

	const activeContracts = useCallback(() => {
		return contracts.filter(c => c.status === 'active')
	}, [contracts])

	const expiringSoon = useCallback((daysThreshold = 30) => {
		const now = new Date()
		return contracts.filter(c => {
			const validUntil = new Date(c.terms.validUntil)
			const daysLeft = Math.floor(
				(validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
			)
			return daysLeft > 0 && daysLeft <= daysThreshold
		})
	}, [contracts])

	return {
		contracts: filteredContracts,
		allContracts: contracts,
		isLoading,
		activeContracts: activeContracts(),
		expiringSoon: expiringSoon()
	}
}
