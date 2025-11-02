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
        console.log(1)
        if (authUser && (authUser.passwd == null || authUser.passwd === password)) {
            const company = await SqlCompany.select(authUser.comCode!)
            console.log(2)
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
            console.log(3)
            const sess = await getUserSession(event)
            console.log(4)
            await renewSession(sess?.id, authUser.id)
            console.log(5)
            return true
        } else {
            return false
        }
    } catch (error) {
        throw createError(error as Error)
    }
})
