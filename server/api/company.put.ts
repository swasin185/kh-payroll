import { Company } from "~~/server/database/Company"
import { authEventHandler } from "~~/server/utils/authEventHandler"
import { SchemaTypes } from "~~/server/database/drizzle"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const company = query as SchemaTypes["company"]
    if (!company) {
        throw createError({
            statusCode: 400,
            statusMessage: "company is required.",
        })
    }
    const result = await Company.update(company)
})
