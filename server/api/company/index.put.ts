import SqlCompany from "~~/server/database/SqlCompany"
import { type Company } from "~~/shared/schema"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlCompany.update(body as Company)
})