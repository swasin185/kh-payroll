import { getMenuItem } from "../menu.config"
export default defineNuxtRouteMiddleware((to) => {
    const title = useState("title", () => "")
    const loginUrl = "/login"
    title.value = "KH-PAYROLL"
    if (to.path != loginUrl) {
        const { loggedIn } = useUserSession()
        if (!loggedIn.value) return navigateTo(loginUrl)
            
        const menuSelected = getMenuItem(to.path)
        const menuLevel = menuSelected ? menuSelected.level : 0
        if (menuLevel == -1) return navigateTo(loginUrl)
        title.value = menuSelected ? menuSelected.label : ""
        // count number of used program when permission 1-8
        if (menuLevel >= 1 && menuLevel <= 8)
            $fetch("/api/permission-used", { method: "PUT", query: { program: to.path } })
    }
})
