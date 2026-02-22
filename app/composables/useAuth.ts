export const useAuth = () => {
    const accessToken = useCookie<string | null>('access_token')
    const refreshToken = useCookie<string | null>('refresh_token')

    const loggedIn = computed(() => !!accessToken.value)

    const login = async (
        email: string,
        password: string,
        remember = false
    ) => {
        const config = useRuntimeConfig()

        const at = useCookie<string | null>('access_token', {
            maxAge: remember ? 60 * 60 * 24 * 30 : undefined
        })

        const rt = useCookie<string | null>('refresh_token', {
            maxAge: remember ? 60 * 60 * 24 * 30 : undefined
        })

        const response: any = await $fetch(
            `${config.public.apiBase}/api/Token/login`,
            {
                method: 'POST',
                body: {
                    email,
                    password
                }
            }
        )

        at.value = response.token
        rt.value = response.refreshToken

        accessToken.value = response.token
        refreshToken.value = response.refreshToken

        await navigateTo('/customers')
    }

    const refresh = async () => {
        if (!refreshToken.value) return

        const config = useRuntimeConfig()

        try {
            const response: any = await $fetch(
                `${config.public.apiBase}/api/Token/refresh`,
                {
                    method: 'POST',
                    body: {
                        refreshToken: refreshToken.value
                    }
                }
            )

            accessToken.value = response.token
            refreshToken.value = response.refreshToken
        } catch (error) {
            accessToken.value = null
            refreshToken.value = null
            await navigateTo('/login')
        }
    }

    const logout = async () => {
        accessToken.value = null
        refreshToken.value = null
        await navigateTo('/login')
    }

    return {
        accessToken,
        refreshToken,
        loggedIn,
        login,
        refresh,
        logout
    }
}
