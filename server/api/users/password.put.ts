import SqlUsers from "~~/server/database/SqlUsers"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const id = body.id?.toString().toLowerCase()
    const pwd = body.pwd?.toString()
    const newPwd = body.newPwd?.toString()
    return SqlUsers.changePasswd(id, pwd, newPwd)   
})