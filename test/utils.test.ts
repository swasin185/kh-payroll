import { describe, it, expect, afterAll } from "vitest"
import * as utils from "../shared/utils"
describe("/shared/utils TEST", async () => {
    it("formatMoney", () => {
        let x = utils.formatMoney(-1234567.8853)
        expect(x).toBe("-1,234,567.89")
        x = utils.formatMoney(9876.445)
        expect(x).toBe("9,876.45")
        x = utils.formatMoney(12000)
        expect(x).toBe("12,000.00")
    })

    it("moneyThaiText", () => {
        let x = utils.moneyThaiText(-1234567.89)
        expect(x).toBe("ลบหนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์")
        x = utils.moneyThaiText(-234567.8853)
        expect(x).toBe("ลบสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์")
    })
})
// console.assert(ShareLib.encode("abcd1234") == "5D59595D5D59595D3433323164636261", "encode() Error")
//         console.log(ShareLib.formatDateTime(new Date()), 'Test...')
//         let y = ShareLib.formatMoney(-1234567.8853)
//         console.assert(y == "-1,234,567.89", y + "  formatMoney() Error")
//         let x = ShareLib.moneyText("-1,234,567.8853")
//         console.assert(
//             ShareLib.moneyThaiText(x) == "ลบหนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์",
//             ShareLib.moneyThaiText(x)
//         )
//         console.assert(x == -1234567.89, x + " moneyText() Error")
//         x = ShareLib.moneyText("-234,567.8853")
//         console.assert(
//             ShareLib.moneyThaiText(x) == "ลบสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์",
//             ShareLib.moneyThaiText(x)
//         )
//         console.assert(ShareLib.moneyThaiText(0) == "", ShareLib.moneyThaiText(0))
//         console.assert(x == -234567.89, x + " moneyText() Error")
//         let z: VatItem = { qty: 1, price: 130, discount: 0, total: 0, item: 0, vat: 0 }
//         ShareLib.calcItem(z, true)
//         // console.info(z)
//         console.assert(ShareLib.moneyThaiText(z.total) == "หนึ่งร้อยสามสิบบาทถ้วน")
//         console.assert(ShareLib.moneyThaiText(z.item) == "หนึ่งร้อยยี่สิบเอ็ดบาทห้าสิบสตางค์")
//         console.assert(ShareLib.moneyThaiText(z.vat) == "แปดบาทห้าสิบสตางค์")
//         console.assert(ShareLib.round(z.item, 6) == 121.495327, z.item + " totalItem Error")
//         console.assert(ShareLib.round(z.vat, 6) == 8.504673, z.vat + " totalVat Error")
//         z = { qty: 1, price: 90, discount: 0, total: 0, item: 0, vat: 0 }
//         ShareLib.calcItem(z, true)
//         console.assert(ShareLib.moneyThaiText(z.total) == "เก้าสิบบาทถ้วน")
//         console.assert(ShareLib.moneyThaiText(z.item) == "แปดสิบสี่บาทสิบเอ็ดสตางค์")
//         console.assert(ShareLib.moneyThaiText(z.vat) == "ห้าบาทแปดสิบเก้าสตางค์")
//         console.assert(ShareLib.round(z.item, 6) == 84.11215, z.item + " totalItem Error")
//         console.assert(ShareLib.round(z.vat, 6) == 5.88785, z.vat + " totalVat Error")
//         const d = new Date("2024-02-29")
//         // const d = new Date(2020,1,29, 7, 0, 0)
//         console.assert(ShareLib.formatDateDB(d) == "2024-02-29", ShareLib.formatDateDB(d) + " formatDateDB() Error!")
//         console.assert(ShareLib.formatDate(d) == "29/02/2024", ShareLib.formatDate(d) + " formatDate() Error!")
//         console.assert(
//             ShareLib.formatDateTime(d) == "29/02/24[07:00:00]",
//             ShareLib.formatDateTime(d) + " formatDateTime() Error!"
//         )

//         console.assert(ShareLib.round(271.495, 2) == 271.5, "positive round Error! " + ShareLib.round(-271.495, 2))
//         console.assert(ShareLib.round(-271.495, 2) == -271.5, "negative round Error! " + ShareLib.round(-271.495, 2))
//         console.assert(ShareLib.round(0.4949999999, 2) == 0.5, "Round Error! " + ShareLib.round(0.4949999999, 2))
