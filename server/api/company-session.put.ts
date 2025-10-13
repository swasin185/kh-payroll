import { authEventHandler } from "~~/server/utils/authEventHandler"
import { Company } from "~~/server/database/Company"
import { Users } from "~~/server/database/Users"
import { SchemaTypes } from "~~/shared/utils"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const com = query.comCode as string
    const session = await getUserSession(event)
    const company = await Company.select(com)
    await setUserSession(event, {
        user: {
            id: (session.user as any).id,
            name: (session.user as any).name,
            level: (session.user as any).level,
            comCode: com,
            comName: company?.comName,
            yrPayroll: company?.yrPayroll,
            mnPayroll: company?.mnPayroll,
        },
    })
    // update default company for this user too
    await Users.update({ id: (session.user as any).id, comCode: com } as SchemaTypes["users"])
    return com
})
