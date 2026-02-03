export const useAuth = () => {
    const accessToken = useCookie<string | null>('access_token')
    const refreshToken = useCookie<string | null>('refresh_token')

    const loggedIn = computed(() => !!accessToken.value)

    const login = async (
        username: string,
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
            `${config.public.apiBase}/api/latest/auth/local_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    username,
                    password
                })
            }
        )

        at.value = response.access_token
        rt.value = response.refresh_token

        accessToken.value = response.access_token
        refreshToken.value = response.refresh_token

        await navigateTo('/customers')
    }

    const refresh = async () => {
        if (!refreshToken.value) return

        const config = useRuntimeConfig()

        const response: any = await $fetch(
            `${config.public.apiBase}/api/latest/auth/refresh`,
            {
                method: 'POST',
                body: {
                    refresh_token: refreshToken.value
                }
            }
        )

        accessToken.value = response.access_token
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
