export const DBMODE = {
    Idle: 0,
    Select: 1,
    Insert: 2,
    Update: 3,
    Delete: 4,
}

export const LEVELS = {
    Disabled: -1,
    Viewer: 0,
    Entry: 1,
    Officer: 2,
    Senior: 3,
    Supervisor: 4,
    Manager: 5,
    Executive: 6,
    Admin: 7,
    Developer: 8,
    Creator: 9,
}

export const LEVEL_ITEMS = Object.entries(LEVELS).map(([key, value]) => {
    return {
        value: value,
        label: `${value < 0 ? "X" : value}-${key}`,
    }
})

const thNum = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"]
const thPos = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"]

export function moneyThaiText(money: number): string {
    if (!money) return ""

    const isNegative = money < 0
    const amount = Math.abs(money).toFixed(2)
    const [baht, satang] = amount.split(".")

    function readNumber(numStr: string): string {
        let text = ""
        const len = numStr.length
        for (let i = 0; i < len; i++) {
            const digit = Number.parseInt(numStr.charAt(i))
            if (digit === 0) continue
            const pos = len - i - 1
            if (pos === 0 && digit === 1 && len > 1) text += "เอ็ด"
            else if (pos === 1 && digit === 2) text += "ยี่"
            else if (pos === 1 && digit === 1) text += ""
            else text += thNum[digit]
            text += thPos[pos]
        }
        return text
    }
    let bahtText = ""
    let bahtInt = baht!
    let chunk = 0
    while (bahtInt.length > 0) {
        const part = bahtInt.slice(-6)
        bahtInt = bahtInt.slice(0, -6)
        const partText = readNumber(part)
        if (chunk > 0 && partText) bahtText = partText + "ล้าน" + bahtText
        else bahtText = partText + bahtText
        chunk++
    }
    bahtText = bahtText || "ศูนย์"
    bahtText += "บาท"
    let satangText = ""
    if (Number.parseInt(satang!) > 0) {
        satangText = readNumber(satang!) + "สตางค์"
    } else {
        satangText = "ถ้วน"
    }
    return (isNegative ? "ลบ" : "") + bahtText + satangText
}

export function round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

export function formatDateTime(date: Date): string {
    // YYYY-MM-DD HH:MM:SS (2025-10-23 14:45:12)
    return date.toLocaleString("sv-SE");
}

export function formatDate(date: Date): string {
    // YYYY-MM-DD (2025-10-23)
    return date.toLocaleDateString("sv-SE");
}