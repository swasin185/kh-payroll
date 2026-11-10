import { SqlBonus } from "~~/server/database/SqlBonus"
import { z } from "zod"

export default authEventHandler(async (event): Promise<any> => {
    const query = await getValidatedQuery(
        event,
        z.object({
            comCode: z.string(),
            empCode: z.coerce.number(),
            inCode: z.string(),
        }).parse,
    )

    const result = await SqlBonus.delete(query.comCode, query.empCode, query.inCode)

    if (!result) {
        throw createError({ statusCode: 404, statusMessage: "Record not found" })
    }
    return { success: true }
})
