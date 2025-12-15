import { create } from 'zustand'
import type { Member, Space, ERPReservation, Invoice, Payment, Expense, Inventory, MaintenanceTask, CommunityEvent, Analytics } from '../types/erp'

interface ERPState {
  members: Member[]
  spaces: Space[]
  reservations: ERPReservation[]
  invoices: Invoice[]
  payments: Payment[]
  subscriptions: any[]
  memberships: any[]
  expenses: Expense[]
  inventory: Inventory[]
  maintenanceTasks: MaintenanceTask[]
  maintenanceRequests: MaintenanceTask[]
  staff: any[]
  events: CommunityEvent[]
  analytics: Analytics
  getLowStockItems: () => Inventory[]
  getInvoiceById: (id: string) => Invoice | undefined
  generateInvoice: (memberId: string, items: any[]) => { success: boolean, error?: string }
  markInvoiceAsPaid: (id: string, paymentMethod?: string) => { success: boolean, error?: string }
  addPayment: (invoiceId: string, amount: number, method: string) => { success: boolean, error?: string }
  getPaymentById: (id: string) => Payment | undefined
  processPayment: (memberId: string, amount: number, method: string, invoiceId?: string) => { success: boolean, error?: string }
  refundPayment: (id: string, amount: number, reason: string) => { success: boolean, error?: string }

  // Member actions
  addMember: (member: Member) => void
  updateMember: (id: string, data: Partial<Member>) => void
  deleteMember: (id: string) => void
  getMemberById: (id: string) => Member | undefined
  getMemberSubscription: (memberId: string) => any
  processSubscriptionPayment: (subscriptionId: string, amount: number, method: string) => { success: boolean, error?: string }

  // Space actions
  addSpace: (space: Space) => void
  updateSpace: (id: string, data: Partial<Space>) => void
  deleteSpace: (id: string) => void
  getSpaceById: (id: string) => Space | undefined

  // Reservation actions
  addReservation: (reservation: ERPReservation) => void
  updateReservation: (id: string, data: Partial<ERPReservation>) => void
  deleteReservation: (id: string) => void
  cancelReservation: (id: string) => { success: boolean, error?: string }
  getReservationById: (id: string) => ERPReservation | undefined
  processReservation: (reservationId: string) => { success: boolean, error?: string }
  checkInReservation: (reservationId: string) => { success: boolean, error?: string }
  checkOutReservation: (reservationId: string) => { success: boolean, error?: string }

  // Invoice actions
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  // Expense actions
  addExpense: (expense: Expense) => void
  updateExpense: (id: string, data: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  approveExpense: (expenseId: string) => { success: boolean, error?: string }
  rejectExpense: (expenseId: string, reason?: string) => { success: boolean, error?: string }

  // Inventory actions
  addInventoryItem: (item: Inventory) => void
  updateInventoryItem: (id: string, data: Partial<Inventory>) => void
  deleteInventoryItem: (id: string) => void
  getInventoryItemById: (id: string) => Inventory | undefined
  adjustInventoryQuantity: (id: string, adjustment: number, reason?: string) => { success: boolean, error?: string }

  // Maintenance actions
  addMaintenanceTask: (task: MaintenanceTask) => void
  updateMaintenanceTask: (id: string, data: Partial<MaintenanceTask>) => void
  deleteMaintenanceTask: (id: string) => void
  addMaintenanceRequest: (request: MaintenanceTask) => void
  updateMaintenanceRequest: (id: string, data: Partial<MaintenanceTask>) => void
  deleteMaintenanceRequest: (id: string) => void
  getMaintenanceRequestById: (id: string) => MaintenanceTask | undefined
  assignMaintenanceRequest: (requestId: string, staffId: string) => { success: boolean, error?: string }
  completeMaintenanceRequest: (requestId: string) => { success: boolean, error?: string }
  getStaffMemberById: (id: string) => any

  // Membership actions
  getMembershipById: (id: string) => any

  // Event actions
  addEvent: (event: CommunityEvent) => void
  updateEvent: (id: string, data: Partial<CommunityEvent>) => void
  deleteEvent: (id: string) => void
  getEventById: (id: string) => CommunityEvent | undefined
  registerForEvent: (eventId: string, attendeeData: any) => { success: boolean, error?: string }
  cancelEvent: (eventId: string, reason?: string) => { success: boolean, error?: string }

  // Analytics actions
  getAnalytics: () => Analytics
  generateAnalytics: (period?: string) => void
}

const initialAnalytics: Analytics = {
  occupancyRate: 0,
  revenueBySpace: {},
  memberGrowth: [],
  membershipGrowth: [],
  topSpaces: [],
  monthlyRevenue: [],
  averageBookingValue: 0,
  financialSummary: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingInvoices: 0,
    outstandingInvoices: 0,
    revenue: 0,
    expenses: 0,
    profit: 0
  },
  revenueByMembership: {}
}

export const useERPStore = create<ERPState>()(
    (set, get) => ({
      members: [],
      spaces: [],
      reservations: [],
      invoices: [],
      payments: [],
      subscriptions: [],
      memberships: [],
      expenses: [],
      inventory: [],
      maintenanceTasks: [],
      maintenanceRequests: [],
      staff: [],
      events: [],
      analytics: initialAnalytics,
      getLowStockItems: () => get().inventory.filter(item => item.quantity <= item.minQuantity),
      getInvoiceById: (id) => get().invoices.find(i => i.id === id),
      generateInvoice: (memberId, items) => {
        try {
          const member = get().members.find(m => m.id === memberId)
          if (!member) return { success: false, error: 'Membre non trouvé' }

          const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
          const taxAmount = subtotal * 0.19
          const total = subtotal + taxAmount

          const invoice: Invoice = {
            id: Date.now().toString(),
            invoiceNumber: `INV-${Date.now()}`,
            number: `INV-${Date.now()}`,
            memberId,
            amount: total,
            total,
            subtotal,
            taxAmount,
            discount: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            issueDate: new Date(),
            status: 'pending',
            items: items.map((item: any, idx: number) => ({
              id: `item-${idx}`,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            })),
            createdAt: new Date()
          }

          set((state) => ({ invoices: [...state.invoices, invoice] }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      markInvoiceAsPaid: (id, paymentMethod) => {
        try {
          set((state) => ({
            invoices: state.invoices.map(i => i.id === id ? { ...i, status: 'paid' as const, paidAt: new Date(), paymentMethod } : i)
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      addPayment: (invoiceId, amount, method) => {
        try {
          const invoice = get().invoices.find(i => i.id === invoiceId)
          if (!invoice) return { success: false, error: 'Facture non trouvée' }

          const payment: Payment = {
            id: Date.now().toString(),
            invoiceId,
            memberId: invoice.memberId,
            amount,
            date: new Date(),
            method: method as any,
            paymentMethod: method,
            status: 'completed',
            createdAt: new Date(),
            processedAt: new Date()
          }

          set((state) => ({ payments: [...state.payments, payment] }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      getPaymentById: (id) => get().payments.find(p => p.id === id),
      processPayment: (memberId, amount, method, invoiceId) => {
        try {
          const payment: Payment = {
            id: Date.now().toString(),
            invoiceId: invoiceId || 'direct-payment',
            memberId,
            amount,
            date: new Date(),
            method: method as any,
            paymentMethod: method,
            status: 'completed',
            createdAt: new Date(),
            processedAt: new Date()
          }

          set((state) => ({ payments: [...state.payments, payment] }))

          if (invoiceId) {
            set((state) => ({
              invoices: state.invoices.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const, paidAt: new Date() } : i)
            }))
          }

          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      refundPayment: (id, amount, reason) => {
        try {
          set((state) => ({
            payments: state.payments.map(p => p.id === id ? {
              ...p,
              status: 'refunded' as const,
              refundAmount: amount,
              refundDate: new Date(),
              refundReason: reason
            } : p)
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      // Member actions
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, data) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, ...data } : m)
      })),
      deleteMember: (id) => set((state) => ({
        members: state.members.filter(m => m.id !== id)
      })),
      getMemberById: (id) => get().members.find(m => m.id === id),
      getMemberSubscription: (memberId) => {
        return get().subscriptions.find(s => s.memberId === memberId && s.status === 'active')
      },
      processSubscriptionPayment: (subscriptionId, amount, method) => {
        try {
          const subscription = get().subscriptions.find(s => s.id === subscriptionId)
          if (!subscription) return { success: false, error: 'Abonnement non trouvé' }

          const payment: Payment = {
            id: Date.now().toString(),
            invoiceId: `subscription-${subscriptionId}`,
            memberId: subscription.memberId,
            amount,
            date: new Date(),
            method: method as any,
            paymentMethod: method,
            status: 'completed',
            createdAt: new Date(),
            processedAt: new Date()
          }

          set((state) => ({ payments: [...state.payments, payment] }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      // Space actions
      addSpace: (space) => set((state) => ({ spaces: [...state.spaces, space] })),
      updateSpace: (id, data) => set((state) => ({
        spaces: state.spaces.map(s => s.id === id ? { ...s, ...data } : s)
      })),
      deleteSpace: (id) => set((state) => ({
        spaces: state.spaces.filter(s => s.id !== id)
      })),
      getSpaceById: (id) => get().spaces.find(s => s.id === id),

      // Reservation actions
      addReservation: (reservation) => set((state) => ({
        reservations: [...state.reservations, reservation]
      })),
      updateReservation: (id, data) => set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      deleteReservation: (id) => set((state) => ({
        reservations: state.reservations.filter(r => r.id !== id)
      })),
      getReservationById: (id) => get().reservations.find(r => r.id === id),
      processReservation: (reservationId) => {
        try {
          const reservation = get().reservations.find(r => r.id === reservationId)
          if (!reservation) return { success: false, error: 'Réservation non trouvée' }

          set((state) => ({
            reservations: state.reservations.map(r =>
              r.id === reservationId ? { ...r, status: 'confirmed' as const } : r
            )
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      cancelReservation: (id) => {
        try {
          const reservation = get().reservations.find(r => r.id === id)
          if (!reservation) return { success: false, error: 'Réservation non trouvée' }

          set((state) => ({
            reservations: state.reservations.map(r =>
              r.id === id ? { ...r, status: 'cancelled' as const } : r
            )
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      checkInReservation: (reservationId) => {
        try {
          const reservation = get().reservations.find(r => r.id === reservationId)
          if (!reservation) return { success: false, error: 'Réservation non trouvée' }

          set((state) => ({
            reservations: state.reservations.map(r =>
              r.id === reservationId ? { ...r, checkInTime: new Date() } : r
            )
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      checkOutReservation: (reservationId) => {
        try {
          const reservation = get().reservations.find(r => r.id === reservationId)
          if (!reservation) return { success: false, error: 'Réservation non trouvée' }

          set((state) => ({
            reservations: state.reservations.map(r =>
              r.id === reservationId ? { ...r, checkOutTime: new Date(), status: 'completed' as const } : r
            )
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      // Invoice actions
      addInvoice: (invoice) => set((state) => ({
        invoices: [...state.invoices, invoice]
      })),
      updateInvoice: (id, data) => set((state) => ({
        invoices: state.invoices.map(i => i.id === id ? { ...i, ...data } : i)
      })),
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(i => i.id !== id)
      })),

      // Expense actions
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, expense]
      })),
      updateExpense: (id, data) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date() } : e)
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      approveExpense: (expenseId) => {
        const expense = get().expenses.find(e => e.id === expenseId)

        if (!expense) {
          return { success: false, error: 'Dépense introuvable' }
        }

        get().updateExpense(expenseId, { status: 'approved' })

        return { success: true }
      },

      rejectExpense: (expenseId, _reason) => {
        const expense = get().expenses.find(e => e.id === expenseId)

        if (!expense) {
          return { success: false, error: 'Dépense introuvable' }
        }

        get().updateExpense(expenseId, {
          status: 'rejected'
        })

        return { success: true }
      },

      // Inventory actions
      addInventoryItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      updateInventoryItem: (id, data) => set((state) => ({
        inventory: state.inventory.map(i => i.id === id ? { ...i, ...data } : i)
      })),
      deleteInventoryItem: (id) => set((state) => ({
        inventory: state.inventory.filter(i => i.id !== id)
      })),
      getInventoryItemById: (id) => get().inventory.find(i => i.id === id),
      adjustInventoryQuantity: (id, adjustment, _reason) => {
        try {
          const item = get().inventory.find(i => i.id === id)
          if (!item) return { success: false, error: 'Article non trouvé' }

          const newQuantity = item.quantity + adjustment
          if (newQuantity < 0) {
            return { success: false, error: 'Quantité insuffisante' }
          }

          set((state) => ({
            inventory: state.inventory.map(i =>
              i.id === id
                ? {
                    ...i,
                    quantity: newQuantity,
                    status: newQuantity === 0 ? 'out_of_stock' : newQuantity <= i.minQuantity ? 'low_stock' : 'in_stock',
                    updatedAt: new Date()
                  }
                : i
            )
          }))
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      // Maintenance actions
      addMaintenanceTask: (task) => set((state) => ({
        maintenanceTasks: [...state.maintenanceTasks, task]
      })),
      updateMaintenanceTask: (id, data) => set((state) => ({
        maintenanceTasks: state.maintenanceTasks.map(t => t.id === id ? { ...t, ...data } : t)
      })),
      deleteMaintenanceTask: (id) => set((state) => ({
        maintenanceTasks: state.maintenanceTasks.filter(t => t.id !== id)
      })),
      addMaintenanceRequest: (request) => set((state) => ({
        maintenanceRequests: [...state.maintenanceRequests, request]
      })),
      updateMaintenanceRequest: (id, data) => set((state) => ({
        maintenanceRequests: state.maintenanceRequests.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      deleteMaintenanceRequest: (id) => set((state) => ({
        maintenanceRequests: state.maintenanceRequests.filter(r => r.id !== id)
      })),
      getMaintenanceRequestById: (id) => get().maintenanceRequests.find(r => r.id === id),
      assignMaintenanceRequest: (requestId, staffId) => {
        try {
          const request = get().getMaintenanceRequestById(requestId)
          if (!request) return { success: false, error: 'Demande non trouvée' }

          const staff = get().getStaffMemberById(staffId)
          if (!staff) return { success: false, error: 'Membre du personnel non trouvé' }

          get().updateMaintenanceRequest(requestId, {
            assignedTo: staffId,
            status: 'in_progress'
          })

          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      completeMaintenanceRequest: (requestId) => {
        try {
          const request = get().getMaintenanceRequestById(requestId)
          if (!request) return { success: false, error: 'Demande non trouvée' }

          get().updateMaintenanceRequest(requestId, {
            status: 'completed',
            completedAt: new Date()
          })

          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      getStaffMemberById: (id) => get().staff.find(s => s.id === id),
      getMembershipById: (id) => get().memberships.find(m => m.id === id),

      // Event actions
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, data) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id)
      })),
      getEventById: (id) => get().events.find(e => e.id === id),

      registerForEvent: (eventId, _attendeeData) => {
        const event = get().getEventById(eventId)

        if (!event) {
          return { success: false, error: 'Événement introuvable' }
        }

        if (event.registeredAttendees >= event.capacity) {
          return { success: false, error: 'Événement complet' }
        }

        get().updateEvent(eventId, {
          registeredAttendees: event.registeredAttendees + 1
        })

        return { success: true }
      },

      cancelEvent: (eventId, _reason) => {
        const event = get().getEventById(eventId)

        if (!event) {
          return { success: false, error: 'Événement introuvable' }
        }

        get().updateEvent(eventId, {
          status: 'cancelled'
        })

        return { success: true }
      },

      // Analytics actions
      getAnalytics: () => get().analytics,

      generateAnalytics: (_period) => {
        const state = get()
        const totalRevenue = state.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        const totalExpenses = state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
        const completedReservations = state.reservations.filter(r => r.status === 'completed')
        const occupancyRate = state.spaces.length > 0
          ? Math.round((completedReservations.length / Math.max(state.reservations.length, 1)) * 100)
          : 0
        const pendingInvoices = state.invoices.filter(i => i.status === 'pending').length
        const averageBookingValue = completedReservations.length > 0
          ? Math.round(totalRevenue / completedReservations.length)
          : 0

        const revenueBySpace: Record<string, number> = {}
        state.reservations.forEach(r => {
          if (r.spaceId) {
            revenueBySpace[r.spaceId] = (revenueBySpace[r.spaceId] || 0) + (r.totalAmount || 0)
          }
        })

        const topSpaces = state.spaces.map(space => ({
          id: space.id,
          name: space.name,
          bookings: state.reservations.filter(r => r.spaceId === space.id).length,
          revenue: revenueBySpace[space.id] || 0
        })).sort((a, b) => b.bookings - a.bookings).slice(0, 5)

        const analytics: Analytics = {
          occupancyRate,
          revenueBySpace,
          memberGrowth: [],
          membershipGrowth: [],
          topSpaces,
          monthlyRevenue: [],
          averageBookingValue,
          financialSummary: {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            pendingInvoices,
            outstandingInvoices: pendingInvoices,
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: totalRevenue - totalExpenses
          },
          revenueByMembership: {}
        }

        set({ analytics })
      }
    })
)
