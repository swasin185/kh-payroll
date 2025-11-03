import SqlUsers from "~~/server/database/SqlUsers"
import SqlCompany from "~~/server/database/SqlCompany"
import { renewSession } from "~~/server/utils/sessions"

export default eventHandler(async (event) => {
    const body = await readBody(event)
    const userId = body.id?.toString().toLowerCase()
    const password = body.pwd?.toString()
    if (!userId || !password) {
        throw createError({
            status: 400,
            message: "User ID and Password are required.",
        })
    }
    console.log("LOGIN:", userId)
    try {
        if (await SqlUsers.authPasswd(userId, password)) {
            const authUser = await SqlUsers.select(userId)
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
