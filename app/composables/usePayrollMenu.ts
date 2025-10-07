import { ref } from "vue"
import type { NavigationMenuItem } from "@nuxt/ui"

// --- 1. CORE MENU DEFINITIONS (Initial State) ---

/**
 * The default menu item used before login or as a fallback.
 */
const defaultMenu: NavigationMenuItem = {
    label: "KH-PAYROLL",
    to: "/login",
    level: 0,
}

const activeMenuItem = ref(defaultMenu)

// --- 2. REACTIVE STATE (The single source of truth) ---
// We use ref() to make the entire array reactive.
const menuState = ref<NavigationMenuItem[]>([
    {
        label: "Setting",
        icon: "i-lucide-settings",
        children: [
            {
                label: "Login / Out",
                to: "/login",
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

// --- 3. COMPOSABLE LOGIC ---

const updateMenuPermission = async (userLevel: number = -1) => {
    let permission: any[] = []

    if (userLevel > -1 && userLevel < 9)
        permission = await $fetch<any[]>("api/permission", { cache: "no-store" })

    for (const item of menuState.value) {
        // item.children?.forEach((child) => {
        for (const child of item.children!) {
            child.badge = 0
            if (userLevel === 9) {
                child.level = userLevel
            } else if (userLevel > -1) {
                const perm = permission.find((p) => p.program === child.to)
                if (perm) {
                    child.level = perm.level
                    child.badge = perm.used
                } else {
                    child.level = (child as any).default ? 0 : -1
                }
            } else {
                child.level = -1
            }
            child.disabled = child.level < 0
        }
    }
}

const getMenuItemByRoute = (to: string): NavigationMenuItem | undefined => {
    for (const item of menuState.value) {
        const menuItem = item.children?.find((i) => i.to === to)
        if (menuItem) {
            activeMenuItem.value = menuItem
            return menuItem as NavigationMenuItem
        }
    }
    activeMenuItem.value = defaultMenu
    return undefined
}

export default function usePayrollMenu() {
    return {
        activeMenuItem,
        menuState,
        updateMenuPermission,
        getMenuItemByRoute,
    }
}
