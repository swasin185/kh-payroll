import { SqlBonus } from "~~/server/database/SqlBonus"
import { SalarySchema } from "~~/shared/schema"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readValidatedBody(event, SalarySchema.parse)
    const result = await SqlBonus.update(body)
    return result
})
