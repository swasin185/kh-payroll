import SqlCompany from "~~/server/database/SqlCompany"
import { type Company } from "~~/shared/schema"

export const put = authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlCompany.update(body as Company)
})