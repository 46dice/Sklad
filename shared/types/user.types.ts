export type UserRole = 'owner' | 'manager' | 'courier' | 'viewer'

export interface IUserProfile {
	email: string
	role: UserRole
	name?: string
	phone?: string
	companyId?: string
	permissions: string[]
	isActive: boolean
	createdAt: Date
	updatedAt?: Date
	// Дополнительные поля для курьера
	courierInfo?: {
		vehicleType?: 'car' | 'bike' | 'foot'
		workingHours?: string
		maxDeliveryRadius?: number // в км
	}
	// Данные поставщика для актов отгрузки
	supplierFullName?: string // ФИО или название компании
	supplierInn?: string // ИНН
	supplierAddress?: string // Адрес
	supplierBankName?: string // Название банка
	supplierBik?: string // БИК
	supplierAccountNumber?: string // Расчетный счет
	supplierCorrespondentAccount?: string // Корреспондентский счет
}

export interface IRolePermissions {
	[key: string]: {
		products: ('read' | 'write' | 'delete')[]
		sales: ('read' | 'write' | 'delete')[]
		clients: ('read' | 'write' | 'delete')[]
		contracts: ('read' | 'write' | 'delete')[]
		deliveries: ('read' | 'write' | 'delete' | 'assign' | 'report')[]
		reports: ('read' | 'export')[]
		users: ('read' | 'write' | 'invite')[]
	}
}

export const ROLE_PERMISSIONS: IRolePermissions = {
	owner: {
		products: ['read', 'write', 'delete'],
		sales: ['read', 'write', 'delete'],
		clients: ['read', 'write', 'delete'],
		contracts: ['read', 'write', 'delete'],
		deliveries: ['read', 'write', 'delete', 'assign', 'report'],
		reports: ['read', 'export'],
		users: ['read', 'write', 'invite']
	},
	manager: {
		products: ['read', 'write'],
		sales: ['read', 'write'],
		clients: ['read', 'write'],
		contracts: ['read', 'write'],
		deliveries: ['read', 'write', 'assign', 'report'],
		reports: ['read', 'export'],
		users: ['read']
	},
	courier: {
		products: ['read'],
		sales: [],
		clients: [],
		contracts: [],
		deliveries: ['read', 'report'],
		reports: [],
		users: []
	},
	viewer: {
		products: ['read'],
		sales: ['read'],
		clients: ['read'],
		contracts: ['read'],
		deliveries: ['read'],
		reports: ['read'],
		users: []
	}
}