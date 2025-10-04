import { defaultMenu, getMenuItem } from "../utils/menu"
export default defineNuxtRouteMiddleware(async (to) => {
    // const title = useState("title", () => "")
    const activeMenu = useState("activeMenu", () => defaultMenu)
    const loginUrl = "/login"
    // title.value = "KH-PAYROLL"
    activeMenu.value = defaultMenu
    if (to.path != loginUrl) {
        const { loggedIn, fetch:refreshUserSession } = useUserSession()
        await refreshUserSession()
        if (!loggedIn.value) return navigateTo(loginUrl)
        const menuSelected = getMenuItem(to.path)
        const menuLevel = menuSelected ? menuSelected.level : 0
        if (menuLevel == -1) return navigateTo(loginUrl)
        if (menuSelected) 
            activeMenu.value = menuSelected 
        // count number of used program when permission 1-8
        if (menuLevel >= 1 && menuLevel <= 8)
            $fetch("/api/permission-used", { method: "PUT", query: { program: to.path } })
    }
})
