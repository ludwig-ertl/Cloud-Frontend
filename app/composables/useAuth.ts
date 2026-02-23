export const useAuth = () => {
    // 1. Check if 'remember me' was selected (30 day persistence for this choice too)
    const authRemember = useCookie<boolean>('auth_remember', {
        default: () => false,
        maxAge: 60 * 60 * 24 * 30
    })

    const cookieOptions = computed(() => ({
        maxAge: authRemember.value ? 60 * 60 * 24 * 30 : undefined,
        path: '/'
    }))

    // 2. Initialize tokens with the current persistence preference
    const accessToken = useCookie<string | null>('access_token', cookieOptions.value)
    const refreshToken = useCookie<string | null>('refresh_token', cookieOptions.value)

    const loggedIn = computed(() => !!accessToken.value)

    const login = async (
        email: string,
        password: string,
        remember = false
    ) => {
        const config = useRuntimeConfig()

        // Update the preference first
        authRemember.value = remember

        const options = {
            maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
            path: '/'
        }

        const at = useCookie<string | null>('access_token', options)
        const rt = useCookie<string | null>('refresh_token', options)

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
            const options = {
                maxAge: authRemember.value ? 60 * 60 * 24 * 30 : undefined,
                path: '/'
            }

            const at = useCookie<string | null>('access_token', options)
            const rt = useCookie<string | null>('refresh_token', options)

            const response: any = await $fetch(
                `${config.public.apiBase}/api/Token/refresh`,
                {
                    method: 'POST',
                    body: {
                        refreshToken: refreshToken.value
                    }
                }
            )

            at.value = response.token
            rt.value = response.refreshToken

            accessToken.value = response.token
            refreshToken.value = response.refreshToken
        } catch (error) {
            accessToken.value = null
            refreshToken.value = null
            await navigateTo('/login')
        }
    }

    const logout = async () => {
        authRemember.value = false
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
