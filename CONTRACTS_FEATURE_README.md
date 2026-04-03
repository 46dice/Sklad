# Система управления договорами с клиентами

## 📋 Описание

Модуль для управления договорами с клиентами в приложении EXPRESS STOREHOUSE. Позволяет создавать, редактировать, просматривать и отслеживать договоры.

## 🎯 Основные функции

### 1. **Просмотр договоров** (`documents.tsx`)
- Список всех договоров с фильтрацией по статусам
- Вкладки: Все, Активные, Подписанные, Черновики
- Быстрое создание нового договора (+ кнопка)

### 2. **Статусы договоров**
- `draft` - Черновик
- `pending_signature` - На подпись
- `signed` - Подписан
- `active` - Активен
- `archived` - Архив

### 3. **Условия договора**
- Условия оплаты (например: "Оплата в течение 30 дней")
- Условия доставки (например: "Доставка в течение 5 рабочих дней")
- Сумма договора и валюта
- Период действия (с какого по какое число)

### 4. **Действия с договорами**
- Просмотр полной информации
- Редактирование (для черновиков)
- Подписание договора
- Активация подписанного договора
- Удаление

## 📁 Структура файлов

```
components/Contracts/
├── contract.model.ts       # Zustand store для управления договорами
├── ContractCard.tsx        # Компонент карточки договора
├── ContractForm.tsx        # Форма создания/редактирования
├── ContractStats.tsx       # Компонент статистики договоров
└── useContracts.ts         # Хук для работы с договорами

app/app/(Contracts)/
├── _layout.tsx             # Layout для группы маршрутов
├── index.tsx               # Индексный файл
├── new.tsx                 # Экран создания договора
├── edit/[id].tsx           # Экран редактирования договора
└── view/[id].tsx           # Экран просмотра договора

shared/types/
└── contracts.types.ts      # TypeScript типы untuk договоров

hooks/
└── useContracts.ts         # Хук для работы контрактами
```

## 🔧 Использование

### Создание нового договора

```tsx
import { useRouter } from 'expo-router'

const router = useRouter()

// Переход на экран создания договора
router.push('/app/(Contracts)/new')
```

### Работа с договорами через store

```tsx
import useContractStore from '@/components/Contracts/contract.model'

const { 
  contracts,           // Все договоры
  addContract,         // Добавить договор
  updateContract,      // Обновить договор
  deleteContract,      // Удалить договор
  getContract          // Получить договор по ID
} = useContractStore()

// Добавить договор
addContract({
  id: 'unique-id',
  contractNumber: '2026-001',
  clientId: 'client-1',
  clientName: 'ООО "Альфа"',
  status: 'draft',
  createdAt: new Date().toISOString(),
  terms: {
    paymentTerms: 'Оплата в течение 30 дней',
    deliveryTerms: 'Доставка в течение 5 рабочих дней',
    price: 50000,
    validFrom: '2026-04-03',
    validUntil: '2027-04-03',
    currency: 'RUB'
  },
  description: 'Описание договора'
})

// Обновить статус договора
updateContract('contract-id', { 
  status: 'signed',
  signedAt: new Date().toISOString()
})
```

### Использование хука `useContracts`

```tsx
import { useContracts } from '@/hooks/useContracts'

const MyComponent = () => {
  // Получить все договоры
  const { contracts, allContracts, isLoading } = useContracts()
  
  // Получить договоры конкретного клиента
  const { contracts: clientContracts } = useContracts({
    clientId: 'client-1'
  })
  
  // Получить договоры со статусом
  const { contracts: activeContracts } = useContracts({
    status: 'active'
  })
  
  // Получить активные договоры и заканчивающиеся договоры
  const { activeContracts, expiringSoon } = useContracts()
}
```

### Использование компонента статистики

```tsx
import { ContractStats } from '@/components/Contracts/ContractStats'

export default function MonitoringScreen() {
  return (
    <ScrollView>
      {/* Отображает карточки со статистикой */}
      <ContractStats showViewDetailsButton={true} />
    </ScrollView>
  )
}
```

## 📊 Типы данных

### IContract
```typescript
interface IContract {
  id: string
  contractNumber: string
  clientId: string
  clientName: string
  status: ContractStatus
  createdAt: string
  signedAt?: string
  expiresAt?: string
  terms: IContractTerms
  description?: string
  attachments?: string[]
}
```

### IContractTerms
```typescript
interface IContractTerms {
  paymentTerms: string
  deliveryTerms: string
  price: number
  validFrom: string
  validUntil: string
  currency: 'RUB' | 'USD' | 'EUR'
}
```

## 🔌 Интеграция с API

Для интеграции с реальным API, отредактируйте:

1. **contract.model.ts** - добавьте методы для fetch договоров
2. **useContracts.ts** - добавьте useEffect с загрузкой с сервера
3. **ContractForm.tsx** - обновите список клиентов из API вместо mock

## ✨ Возможные расширения

- [ ] Экспорт договоров в PDF
- [ ] Отправка договоров по Email
- [ ] Подпись договоров с помощью ЭЦП
- [ ] История изменений договоров
- [ ] Шаблоны договоров
- [ ] Интеграция с платежной системой
- [ ] Напоминания о сроках действия
- [ ] Уведомления на Email при изменении
