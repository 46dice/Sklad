import { ComponentType } from 'react'

export type TypeRootStackParamList = {
	Auth: undefined

	Monitoring: undefined
	Documents: undefined
	Products: undefined
	Agents: undefined

	Screen404: undefined
} & TypeRootStackAdminList

type TypeRootStackAdminList = {
	Admin: undefined
}

export interface IRoute {
	name: keyof TypeRootStackParamList
	title: string
	isAdmin?: boolean
}
