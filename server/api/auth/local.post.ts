import SqlUsers from "~~/server/database/SqlUsers"
import SqlCompany from "~~/server/database/SqlCompany"
import { renewSession } from "~~/server/utils/sessions"

export default eventHandler(async (event) => {
    const body = await readBody(event)
    const userid = body.id?.toString().toLowerCase()
    const password = body.pwd?.toString()
    console.log("LOGIN:", userid)
    if (!userid || !password) {
        throw createError({
            status: 400,
            message: "User ID and Password are required.",
        })
    }
    try {
        const authUser = await SqlUsers.select(userid)
        if (authUser && (authUser.passwd == null || authUser.passwd === password)) {
            const company = await SqlCompany.select(authUser.comCode!)
            await setUserSession(event, {
                user: {
                    id: authUser.id,
                    name: authUser.name,
                    level: authUser.level,
                    comCode: authUser.comCode,
                    comName: company?.comName,
                    yrPayroll: company?.yrPayroll,
                    mnPayroll: company?.mnPayroll,
                },
            })
            const sess = await getUserSession(event)
            await renewSession(sess?.id, authUser.id)
            return true
        } else {
            return false
        }
    } catch (error) {
        throw createError(error as Error)
    }
})
