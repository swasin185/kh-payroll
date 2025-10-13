import { authEventHandler } from "~~/server/utils/authEventHandler"
import { Users } from "~~/server/database/Users"
import type { LookupItem } from "~~/shared/types"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const name = query.name?.toString()
    if (!name)
        throw createError({ statusCode: 400, statusMessage: "Name Lookup 's not identified" })
    let result : LookupItem[] = []
    if (name === 'role' || name === 'user')
        result = await Users.lookup()
    return result
})
