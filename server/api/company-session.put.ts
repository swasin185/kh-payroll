import { authEventHandler } from "~~/server/utils/authEventHandler"
import { sqlCompany } from "~~/server/database/sqlCompany"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const com = query.comCode as string
    const session = await getUserSession(event)
    const company = await sqlCompany.select(com)
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
    return com
})
