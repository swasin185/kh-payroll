import { Company } from "~~/server/database/Company"
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
    return await Company.select(comCode)
})
