import type { NavigationMenuItem } from "@nuxt/ui"

const menuItems: NavigationMenuItem[][] = [
    [
        {
            label: "Setting",
            icon: "i-lucide-settings",
            children: [
                {
                    label: "Login / Out",
                    to: "/login",
                    icon: "i-lucide-lock",
                    disabled: false,
                    level: 0,
                },
                { label: "ผู้ใช้", to: "/user", icon: "i-lucide-users", disabled: true, level: 0 },
                {
                    label: "บริษัท/แผนก",
                    to: "/company",
                    icon: "i-lucide-building-2",
                    disabled: true,
                    level: 0,
                },
                { label: "ตำแหน่งงาน", to: "/position", icon: "i-lucide-boxes", disabled: true },
                {
                    label: "ประเภทเงินได้/หัก",
                    to: "/income",
                    icon: "i-lucide-dollar-sign",
                    disabled: true,
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
    ],
]

export async function setMenuByUserLevel(userLevel: number = -1): Promise<NavigationMenuItem[][]> {
    let permission: any[] = []
    if (userLevel > -1 && userLevel < 9) permission = await $fetch("api/permission")
    // console.log("setMenuByUserLevel ", userLevel, JSON.stringify(permission))
    let group = menuItems[0]!
    for (let item of group)
        if (item.children)
            for (let child of item.children) {
                child.badge = 0
                if (child.to === "/login") child.level = 0
                else if (userLevel === 9) child.level = userLevel
                else if (userLevel > -1 && permission.length > 0) {
                    const perm = permission.find((p) => p.program === child.to)
                    if (perm) {
                        child.level = perm.level
                        child.badge = perm.used
                    } else {
                        child.level = child.to === "/user" || child.to === "/company" ? 0 : -1
                    }
                } else child.level = -1
                child.disabled = child.level < 0
            }
    return menuItems
}

export function getLevel(to: string): number {
    let level = -1
    let group = menuItems[0]!
    for (let item of group)
        if (item.children)
            for (let child of item.children) {
                if (child.to === to && !child.disables) {
                    level = child.level
                    return level
                }
            }
    return level
}
