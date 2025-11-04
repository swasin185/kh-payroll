import { ref } from "vue"
import type { NavigationMenuItem } from "@nuxt/ui"

const loginUrl = "/login"

const defaultMenu: NavigationMenuItem = {
    label: "KH-PAYROLL",
    to: loginUrl,
    level: LEVELS.Viewer,
}

const activeMenu = ref<NavigationMenuItem>(defaultMenu)

const mainMenu: NavigationMenuItem[] = [
    {
        label: "Setting",
        icon: "i-lucide-settings",
        children: [
            {
                label: "Login / Out",
                to: loginUrl,
                icon: "i-lucide-lock",
                disabled: false,
                default: true,
            },
            { label: "ผู้ใช้", to: "/user", icon: "i-lucide-users", disabled: true, default: true },
            {
                label: "บริษัท/แผนก",
                to: "/company",
                icon: "i-lucide-building-2",
                disabled: true,
            },
            {
                label: "สิทธิการใช้เมนู",
                to: "/permission",
                icon: "i-lucide-blinds",
                disabled: true,
            },
            { label: "ตำแหน่งงาน", to: "/position", icon: "i-lucide-boxes", disabled: true },
            { label: "ประเภทเงินได้/หัก", to: "/income", icon: "i-lucide-dollar-sign" },
            { label: "วิธีคิดล่วงเวลา", to: "/ottype", icon: "i-lucide-clock", disabled: true },
        ],
    },
    {
        label: "Employee",
        icon: "i-lucide-user-cog",
        children: [
            { label: "ข้อมูลพนักงาน", to: "/employee", icon: "i-lucide-id-card", disabled: true },
            { label: "บันทึกผลงาน", to: "/record", icon: "i-lucide-info", disabled: true },
            {
                label: "ปรับ/เลื่อนตำแหน่ง",
                to: "/promotion",
                icon: "i-lucide-trophy",
                disabled: true,
            },
            { label: "ลาออก/ไล่ออก", to: "/resign", icon: "i-lucide-user-x", disabled: true },
            {
                label: "เงินกู้ยืม หนี้สิน",
                to: "/debit",
                icon: "i-lucide-banknote",
                disabled: true,
            },
        ],
    },
    {
        label: "Attendent",
        icon: "i-lucide-calendar-clock",
        children: [
            { label: "เวลาเข้า/ออก", to: "/timeinout", icon: "i-lucide-clock", disabled: true },
            {
                label: "ขาด/ลา/มาสาย",
                to: "/lateleave",
                icon: "i-lucide-user-minus",
                disabled: true,
            },
            { label: "ทำล่วงเวลา OT", to: "/overtime", icon: "i-lucide-gauge", disabled: true },
            { label: "ตารางเวลา", to: "/schedule", icon: "i-lucide-calendar-days", disabled: true },
        ],
    },
    {
        label: "Payroll",
        icon: "i-lucide-wallet",
        children: [
            { label: "ประมวลผลงวด", to: "/calculate", icon: "i-lucide-calculator", disabled: true },
            {
                label: "เงินได้/หัก ประจำงวด",
                to: "/payrollincome",
                icon: "i-lucide-file-bar-chart-2",
                disabled: true,
            },
            { label: "โบนัส งวดพิเศษ", to: "/bonus", icon: "i-lucide-gift", disabled: true },
            { label: "สลิปเงินเดือน", to: "/payslip", icon: "i-lucide-receipt", disabled: true },
            {
                label: "ส่งออกธนาคาร",
                to: "/export",
                icon: "i-lucide-arrows-up-from-line",
                disabled: true,
            },
        ],
    },
    {
        label: "Document",
        icon: "i-lucide-printer",
        children: [
            {
                label: "ใบรับรองเงินเดือน",
                to: "/attend",
                icon: "i-lucide-file-text",
                disabled: true,
            },
            {
                label: "ใบรับรองภาษี",
                to: "/salary",
                icon: "i-lucide-file-bar-chart",
                disabled: true,
            },
        ],
    },
]

import { reactive } from "vue"
const menuState = reactive<NavigationMenuItem[]>(mainMenu)

const setMenuSession = async () => {
    const { user } = useUserSession()
    await getMenuPermissionBy(mainMenu, user.value?.comCode, user.value?.id, user.value?.level)
}

import { LEVELS } from "../../shared/utils"

const getMenuPermissionBy = async (
    menu: NavigationMenuItem[],
    comCode: string,
    userId: string,
    userLevel: number = LEVELS.Disabled,
): Promise<void> => {
    let permission: any[] = []
    if (userId && comCode && userLevel >= LEVELS.Viewer && userLevel <= LEVELS.Admin)
        permission = await $fetch("api/permission", {
            query: { userId, comCode },
            cache: "no-store",
        })
    // console.log(userId, comCode, permission)
    for (const item of menu)
        for (const child of item.children!) {
            child.badge = undefined
            if (userLevel >= LEVELS.Developer) child.level = userLevel
            else if (userLevel > LEVELS.Disabled) {
                const perm = permission.find((p) => p.program === child.to)
                if (perm) {
                    child.level = perm.level
                    child.badge = perm.used
                } else child.level = (child as any).default ? LEVELS.Viewer : LEVELS.Disabled
            } else child.level = LEVELS.Disabled
            child.disabled = menu == mainMenu ? child.level === LEVELS.Disabled : false
        }
}

const permissionsToMenu = async (
    comCode: string,
    userId: string,
    userLevel: number = LEVELS.Disabled,
): Promise<NavigationMenuItem[]> => {
    const cloneMenu = structuredClone(mainMenu)
    await getMenuPermissionBy(cloneMenu, comCode, userId, userLevel)
    return cloneMenu
}

const isSetPermission = (level: number, def: boolean): boolean => {
    return level > LEVELS.Viewer || (level === LEVELS.Viewer && !def)
}

import type { Permission } from "../../shared/schema"
type TypePermission = Permission
const permissionsFromMenu = (
    comCode: string,
    userId: string,
    menu: Record<string, any>[], // NavigationMenuItem[] is recuresive type-checking problem
): TypePermission[] => {
    const perms: TypePermission[] = []
    for (const item of menu)
        for (const child of item.children!)
            if (isSetPermission(child.level, child.default))
                perms.push({
                    program: child.to,
                    level: child.level,
                } as TypePermission)
    return perms
}

const countPermissions = (menu: NavigationMenuItem[]): number => {
    let count = 0
    for (const item of menu)
        for (const child of item.children!) if (isSetPermission(child.level, child.default)) count++
    return count
}

const getMenuItemByRoute = (to: string): NavigationMenuItem => {
    activeMenu.value = findMenuItem(to) ?? defaultMenu
    return activeMenu.value as NavigationMenuItem
}

const getPermission = (to: string): number => {
    const menu = findMenuItem(to)
    return menu ? menu.level : LEVELS.Disabled
}

const findMenuItem = (to: string): NavigationMenuItem | null => {
    for (const item of menuState) {
        const menuItem = item.children?.find((i) => i.to === to)
        if (menuItem) {
            activeMenu.value = menuItem
            return activeMenu.value as NavigationMenuItem
        }
    }
    return null
}

export default function usePayrollMenu() {
    return {
        loginUrl,
        activeMenu,
        menuState,
        isAdmin: activeMenu.value.level >= LEVELS.Admin,
        setMenuSession,
        permissionsToMenu,
        permissionsFromMenu,
        countPermissions,
        getMenuItemByRoute,
        getPermission,
    }
}
