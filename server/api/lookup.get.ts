import { authEventHandler } from "~~/server/utils/authEventHandler"
import type { LookupItem } from "~~/shared/types"
import { SqlUsers } from "~~/server/database/SqlUsers"
import { SqlCompany } from "~~/server/database/SqlCompany"

export default authEventHandler(async (event) : Promise<LookupItem[]> => {
    const query = getQuery(event)
    const name = query.name?.toString()
    if (!name)
        throw createError({ statusCode: 400, statusMessage: "Missing Lookup Name" })
    let result: LookupItem[] = []
    if (name === "user") result = await SqlUsers.lookup()
    else if (name === "role") result = await SqlUsers.lookup()
    else if (name === "company") result = await SqlCompany.lookup()
    return result
})
