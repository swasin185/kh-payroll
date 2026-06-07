import SqlCompany from "~~/server/database/SqlCompany"
import { type Company } from "~~/shared/schema"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    return await SqlCompany.update(body as Company)
})