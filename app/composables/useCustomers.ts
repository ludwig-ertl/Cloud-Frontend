export const useCustomers = () => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()

    const customers = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        pageNumber: 1,
        pageSize: 20,
        totalRecords: 0,
        totalPages: 0
    })

    const fetchCustomers = async (params: {
        pageNumber?: number
        pageSize?: number
        sortBy?: string
        sortDescending?: boolean
        searchTerm?: string
        status?: string
        deviceType?: string // Keeping for consistency with screenshot, maybe unused for customers
    } = {}) => {
        loading.value = true
        error.value = null

        try {
            const queryParams = {
                pageNumber: params.pageNumber || pagination.value.pageNumber,
                pageSize: params.pageSize || pagination.value.pageSize,
                sortBy: params.sortBy || 'DeviceName',
                sortDescending: params.sortDescending ?? false,
                searchTerm: params.searchTerm || '',
                // Add other potential filters if needed
            }

            const response: any = await $fetch(`${config.public.apiBase}/api/v1/Devices`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                query: queryParams
            })

            // Fix: API returns { devices: [...], totalCount: ... }
            const rawData = response.devices || response.data || response

            customers.value = Array.isArray(rawData) ? rawData.map((d: any) => ({
                ...d,
                name: d.deviceName || d.name || 'Unknown Device'
            })) : []

            // Handle pagination from top-level response properties
            if (response.totalCount !== undefined) {
                pagination.value = {
                    pageNumber: response.pageNumber || queryParams.pageNumber,
                    pageSize: response.pageSize || queryParams.pageSize,
                    totalRecords: response.totalCount,
                    totalPages: response.totalPages || 0
                }
            } else if (response.pagination) {
                // ... backup plan if API changes
                pagination.value = {
                    pageNumber: response.pagination.currentPage,
                    pageSize: response.pagination.pageSize,
                    totalRecords: response.pagination.totalCount,
                    totalPages: response.pagination.totalPages
                }
            } else if (response.totalRecords) {
                pagination.value = {
                    pageNumber: queryParams.pageNumber,
                    pageSize: queryParams.pageSize,
                    totalRecords: response.totalRecords,
                    totalPages: Math.ceil(response.totalRecords / queryParams.pageSize)
                }
            }

        } catch (e: any) {
            error.value = e.message || 'Error fetching customers'
            console.error('Fetch customers error details:', e)
            if (e.response) {
                console.error('Fetch customers error response status:', e.response.status)
                console.error('Fetch customers error response data:', e.response._data)
            }
        } finally {
            loading.value = false
        }
    }

    const getCustomer = async (id: number | string) => {
        try {
            return await $fetch(`${config.public.apiBase}/api/v1/Devices/${id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                }
            })
        } catch (e: any) {
            console.error('Get customer error:', e)
            throw e
        }
    }

    const createCustomer = async (customerData: any) => {
        try {
            await $fetch(`${config.public.apiBase}/api/v1/Devices`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                body: customerData
            })
            await fetchCustomers() // Refresh list
        } catch (e: any) {
            console.error('Create customer error:', e)
            throw e
        }
    }

    const updateCustomer = async (id: number | string, customerData: any) => {
        try {
            await $fetch(`${config.public.apiBase}/api/v1/Devices/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                body: customerData
            })
            await fetchCustomers() // Refresh list
        } catch (e: any) {
            console.error('Update customer error:', e)
            throw e
        }
    }

    const deleteCustomer = async (id: number | string) => {
        try {
            await $fetch(`${config.public.apiBase}/api/v1/Devices/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                }
            })
            await fetchCustomers() // Refresh list
        } catch (e: any) {
            console.error('Delete customer error:', e)
            throw e
        }
    }

    return {
        customers,
        loading,
        error,
        pagination,
        fetchCustomers,
        getCustomer,
        createCustomer,
        updateCustomer,
        deleteCustomer
    }
}
