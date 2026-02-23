export default defineNuxtRouteMiddleware((to) => {
    const { accessToken } = useAuth()

    // Define public paths
    const isPublicPath = to.path === '/login'

    // If we have a token and try to go to login -> go to customers
    if (accessToken.value && isPublicPath) {
        return navigateTo('/customers')
    }

    // If we don't have a token and try to go to a protected path -> go to login
    if (!accessToken.value && !isPublicPath) {
        return navigateTo('/login')
    }
})
