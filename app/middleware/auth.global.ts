import { LEVELS } from "~~/shared/utils"
export default defineNuxtRouteMiddleware(async (to) => {
    const { loginUrl } = usePayrollMenu()
    if (to.path != loginUrl) {
        const { loggedIn, fetch: refreshUserSession } = useUserSession()
        await refreshUserSession()
        if (!loggedIn.value) return navigateTo(loginUrl)
        const { getMenuItemByRoute } = usePayrollMenu()
        const menuSelected = getMenuItemByRoute(to.path)
        const menuLevel = menuSelected!.level
        if (menuLevel < LEVELS.Viewer) 
            return navigateTo(loginUrl)
        if (menuLevel >= LEVELS.Entry && menuLevel <= LEVELS.Admin)
            $fetch("/api/permission-used", { method: "PUT", query: { program: to.path } })
    }
})