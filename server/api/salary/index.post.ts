import { SqlSalary } from "~~/server/database/SqlSalary"
import { SalarySchema } from "~~/shared/schema"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readValidatedBody(event, SalarySchema.parse)
    const result = await SqlSalary.insert(body)
    return result
})
