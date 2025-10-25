import { describe, it, expect  } from "vitest"
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
        let x : string = utils.moneyThaiText(-1234567.89)
        expect(x).toBe("ลบหนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์")
        x = utils.moneyThaiText(-234567.8853)
        expect(x).toBe("ลบสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์")
    })

    it("round2", () => {
        expect(utils.roundMoney(0.1+0.2)).toBe(0.3)
        expect(utils.roundMoney(-1.235)).toBe(-1.24)
        expect(utils.roundMoney(-271.495)).toBe(-271.5)
        expect(utils.roundMoney(271.495)).toBe(271.5)

        expect(utils.roundMoney(0.333333, 4)).toBe(0.3333)
        expect(utils.roundMoney(-0.333333, 4)).toBe(-0.3333)

        expect(utils.roundMoney(0.49499999)).toBe(0.5)
        expect(utils.roundMoney(-0.49499999)).toBe(-0.5)
    })
})
