import { sqlCompany } from "~~/server/database/sqlCompany"
import { authEventHandler } from "~~/server/utils/authEventHandler"
import type { Company } from "~~/shared/schema"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const company = body as Company
    if (!company) {
        throw createError({
            statusCode: 400,
            statusMessage: "company is required.",
        })
    }
    return await sqlCompany.update(company)
})
