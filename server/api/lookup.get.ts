import { authEventHandler } from "~~/server/utils/authEventHandler"
import type { LookupItem } from "~~/shared/types"
import { sqlUsers } from "~~/server/database/sqlUsers"
import { sqlCompany } from "~~/server/database/sqlCompany"

export default authEventHandler(async (event) : Promise<LookupItem[]> => {
    const query = getQuery(event)
    const name = query.name?.toString()
    if (!name)
        throw createError({ statusCode: 400, statusMessage: "Missing Lookup Name" })
    let result: LookupItem[] = []
    if (name === "user") result = await sqlUsers.lookup()
    else if (name === "role") result = await sqlUsers.lookup()
    else if (name === "company") result = await sqlCompany.lookup()
    return result
})
