import { authEventHandler } from "~~/server/utils/authEventHandler"
import { Users } from "~~/server/database/Users"
import { Company } from "~~/server/database/Company"
import type { LookupItem } from "~~/shared/types"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const name = query.name?.toString()
    if (!name)
        throw createError({ statusCode: 400, statusMessage: "Missing Lookup Name" })
    let result: LookupItem[] = []
    if (name === "user") result = await Users.lookup()
    else if (name === "role") result = await Users.lookup()
    else if (name === "company") result = await Company.lookup()
    return result
})
