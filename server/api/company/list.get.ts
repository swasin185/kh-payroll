import SqlCompany from "~~/server/database/SqlCompany"

export default authEventHandler(async (event) => {
    return await SqlCompany.selectAll()
})