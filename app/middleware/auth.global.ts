import { getLevel } from "../menu.config"
export default defineNuxtRouteMiddleware((to) => {
    const loginUrl = "/login"
    if (to.path != loginUrl) {
        const { loggedIn } = useUserSession()
        if (!loggedIn.value || getLevel(to.path) == -1) return navigateTo(loginUrl)
        // count number of used program
        $fetch("/api/permission-used", { method: "PUT", query: { program: to.path } })
    }
})
