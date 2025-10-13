import { ref } from "vue"
import type { NavigationMenuItem } from "@nuxt/ui"

const loginUrl = "/login"

const defaultMenu: NavigationMenuItem = {
    label: "KH-PAYROLL",
    to: loginUrl,
    level: LEVELS.Viewer,
}

const activeMenu = ref(defaultMenu)

const menuState = ref<NavigationMenuItem[]>([
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
                default: true,
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
])

import { LEVELS } from "../../shared/utils"

const updateMenuPermission = async (userLevel: number = LEVELS.Disabled) => {
    let permission: any[] = []

    if (userLevel >= LEVELS.Viewer && userLevel <= LEVELS.Developer)
        permission = await $fetch<any[]>("api/permission", { cache: "no-store" })

    for (const item of menuState.value) {
        for (const child of item.children!) {
            child.badge = 0
            if (userLevel >= LEVELS.Developer) {
                child.level = userLevel
            } else if (userLevel > LEVELS.Disabled) {
                const perm = permission.find((p) => p.program === child.to)
                if (perm) {
                    child.level = perm.level
                    child.badge = perm.used
                } else {
                    child.level = (child as any).default ? LEVELS.Viewer : LEVELS.Disabled
                }
            } else {
                child.level = LEVELS.Disabled
            }
            child.disabled = child.level === LEVELS.Disabled
        }
    }
}

const getMenuItemByRoute = (to: string): NavigationMenuItem | undefined => {
    for (const item of menuState.value) {
        const menuItem = item.children?.find((i) => i.to === to)
        if (menuItem) {
            activeMenu.value = menuItem
            return menuItem as NavigationMenuItem
        }
    }
    activeMenu.value = defaultMenu
    return defaultMenu
}

export default function usePayrollMenu() {
    return {
        loginUrl,
        activeMenu,
        menuState,
        updateMenuPermission,
        getMenuItemByRoute,
    }
}
