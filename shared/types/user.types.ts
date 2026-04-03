export interface IUser {
	_id: string
	email: string
	password: string
	createdAt: string
	isAdmin: boolean
}

export interface IUserEditInput extends Omit<IUser, '_id' | 'createdAt'> {}

export interface IUserProfile {
	email: string
	uid: string
	firstName?: string
	lastName?: string
	inn?: string
	displayName?: string
	createdAt?: Date
}
