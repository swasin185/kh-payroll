import { Company } from "~~/server/database/Company"
import { authEventHandler } from "~~/server/utils/authEventHandler"
import type { SchemaTypes } from "~~/shared/types"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const company = body as SchemaTypes["company"]
    if (!company) {
        throw createError({
            statusCode: 400,
            statusMessage: "company is required.",
        })
    }
    return await Company.update(company)
})
