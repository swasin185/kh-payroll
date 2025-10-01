import { Users } from "~~/server/database/Users"
import { Company } from "~~/server/database/Company"
import { increaseActiveUsers } from "~~/server/utils/userCount"

export default eventHandler(async (event) => {
    const body = await readBody(event)
    const inputId = body.id?.toString().toLowerCase()
    const inputPwd = body.pwd?.toString()
    const logLabel = "login: " + inputId + "\t/ " + inputPwd
    if (!inputId || !inputPwd) {
        throw createError({
            status: 400,
            message: "User ID and Password are required.",
        })
    }
    try {
        console.time(logLabel)
        const authUser = await Users.select(inputId)
        if (authUser && (authUser.passwd == null || authUser.passwd === inputPwd)) {
            const company = await Company.select(authUser.comCode)
            await setUserSession(event, {
                // cookie size 4k
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
            await increaseActiveUsers()
            console.timeEnd(logLabel)
            return {
                message: "Login successful!",
                user: { id: authUser.id, name: authUser.name },
            }
        } else {
            await clearUserSession(event)
            console.timeEnd(logLabel)
            return {
                message: "Invalid User ID or Password.",
            }
        }
    } catch (error) {
        console.error("Authentication Error:", error)
        await clearUserSession(event)
        throw createError({
            status: 500,
            message: "Authentication Error : " + error,
        })
    }
})
