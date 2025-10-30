import { sqlCompany } from "~~/server/database/sqlCompany"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const comCode = query.comCode?.toString()
    if (!comCode) {
        throw createError({
            statusCode: 400,
            statusMessage: "comCode is required.",
        })
    }
    return await sqlCompany.select(comCode)
})
