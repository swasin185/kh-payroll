import type { NavigationMenuItem } from "@nuxt/ui"

const menuItems: NavigationMenuItem[] = [
    {
        label: "Setting",
        icon: "i-lucide-settings",
        children: [
            {
                label: "Login / Out",
                to: "/login",
                icon: "i-lucide-lock",
                disabled: false,
                default: true, // activated for all permission
            },
            {
                label: "ผู้ใช้",
                to: "/user",
                icon: "i-lucide-users",
                disabled: true,
                default: true,
            },
            {
                label: "บริษัท/แผนก",
                to: "/company",
                icon: "i-lucide-building-2",
                disabled: true,
                default: true,
            },
            { label: "ตำแหน่งงาน", to: "/position", icon: "i-lucide-boxes", disabled: true },
            {
                label: "ประเภทเงินได้/หัก",
                to: "/income",
                icon: "i-lucide-dollar-sign",
            },
            { label: "วิธีคิดล่วงเวลา", to: "/ottype", icon: "i-lucide-clock", disabled: true },
        ],
    },
    {
        label: "Employee",
        icon: "i-lucide-user-cog",
        children: [
            {
                label: "ข้อมูลพนักงาน",
                to: "/employee",
                icon: "i-lucide-id-card",
                disabled: true,
            },
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
            {
                label: "ตารางเวลา",
                to: "/schedule",
                icon: "i-lucide-calendar-days",
                disabled: true,
            },
        ],
    },
    {
        label: "Payroll",
        icon: "i-lucide-wallet",
        children: [
            {
                label: "ประมวลผลงวด",
                to: "/calculate",
                icon: "i-lucide-calculator",
                disabled: true,
            },
            {
                label: "เงินได้/หัก ประจำงวด",
                to: "/payrollincome",
                icon: "i-lucide-file-bar-chart-2",
                disabled: true,
            },
            { label: "โบนัส งวดพิเศษ", to: "/bonus", icon: "i-lucide-gift", disabled: true },
            {
                label: "สลิปเงินเดือน",
                to: "/payslip",
                icon: "i-lucide-receipt",
                disabled: true,
            },
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

export async function setMenuByUserLevel(userLevel: number = -1): Promise<NavigationMenuItem[]> {
    let permission: any[] = []
    if (userLevel > -1 && userLevel < 9) permission = await $fetch("api/permission")
    // console.log("setMenuByUserLevel ", userLevel, JSON.stringify(permission))
    for (const item of menuItems)
        item.children?.forEach((child) => {
            child.badge = 0
            if (userLevel === 9) child.level = userLevel
            else if (userLevel > -1) {
                const perm =
                    permission.length > 0 ? permission.find((p) => p.program === child.to) : false
                if (perm) {
                    child.level = perm.level
                    child.badge = perm.used
                } else {
                    child.level = child.default ? 0 : -1
                }
            } else child.level = -1
            child.disabled = child.level < 0
        })
    return menuItems
}

export function getMenuItem(to: string): any {
    for (const item of menuItems) {
        const menu = item.children?.find((i) => i.to === to)
        if (menu) return menu
    }
    return undefined
}
