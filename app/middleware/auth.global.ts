
export default defineNuxtRouteMiddleware(async (to) => {
    const loginUrl = "/login"
    if (to.path != loginUrl) {
        const { loggedIn, fetch:refreshUserSession } = useUserSession()
        await refreshUserSession()
        if (!loggedIn.value) return navigateTo(loginUrl)
        const { getMenuItemByRoute } = usePayrollMenu()
        const menuSelected = getMenuItemByRoute(to.path)
        const menuLevel = menuSelected ? menuSelected.level : 0
        if (menuLevel == -1) return navigateTo(loginUrl)
        // count number of used program when permission 1-8
        if (menuLevel >= 1 && menuLevel <= 8)
            $fetch("/api/permission-used", { method: "PUT", query: { program: to.path } })
    }
})
