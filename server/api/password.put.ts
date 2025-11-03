import SqlUsers from "~~/server/database/SqlUsers"

export default eventHandler(async (event) => {
    const body = await readBody(event)
    const id = body.id?.toString().toLowerCase()
    const pwd = body.pwd?.toString()
    const newPwd = body.newPwd?.toString()
    if (!id || !pwd) {
        throw createError({
            status: 400,
            message: "User ID and Password are required.",
        })
    }
    return SqlUsers.changePasswd(id, pwd, newPwd)
})
