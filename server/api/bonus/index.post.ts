import { SqlBonus } from "~~/server/database/SqlBonus"
import { SalarySchema } from "~~/shared/schema"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readValidatedBody(event, SalarySchema.parse)
    const result = await SqlBonus.insert(body)
    return result
})
