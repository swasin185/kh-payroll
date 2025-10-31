import { authEventHandler } from "~~/server/utils/authEventHandler"
import { SqlCompany } from "~~/server/database/SqlCompany"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const comCode = query.comCode?.toString()
    if (!comCode) {
        throw createError({
            statusCode: 400,
            statusMessage: "comCode is required.",
        })
    }
    return await SqlCompany.select(comCode)
})
