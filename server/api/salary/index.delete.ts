import { SqlSalary } from "~~/server/database/SqlSalary"
import { z } from "zod"

export default authEventHandler(async (event) => {
    const query = await getValidatedQuery(
        event,
        z.object({
            yr: z.coerce.number(),
            mn: z.coerce.number(),
            comCode: z.string(),
            empCode: z.coerce.number(),
            inCode: z.string(),
        }).parse,
    )
    
    const result = await SqlSalary.delete(
        query.yr,
        query.mn,
        query.comCode,
        query.empCode,
        query.inCode,
    )
    
    if (!result) {
        throw createError({ statusCode: 404, statusMessage: "Record not found" })
    }
    return { success: true }
})
