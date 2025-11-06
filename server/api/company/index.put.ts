import SqlCompany from "~~/server/database/SqlCompany"
import { type Company } from "~~/shared/schema"

export const put = authEventHandler(async (event) => {
    const body = await readBody(event)
    const company = body as Company
    return await SqlCompany.update(company)
})