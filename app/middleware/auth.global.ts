import { getLevel } from "../menu.config"
export default defineNuxtRouteMiddleware((to) => {
    const loginUrl = "/login"
    if (to.path != loginUrl && to.path != "/error") {
        const { loggedIn } = useUserSession()
        if (!loggedIn.value || getLevel(to.path) == -1) {
            return navigateTo(loginUrl)
        }
        const menuLevel = getLevel(to.path)
        // count number of used program when permission 1-8
        if (menuLevel >= 1 && menuLevel <= 8)
            $fetch("/api/permission-used", { method: "PUT", query: { program: to.path } })
    }
})
