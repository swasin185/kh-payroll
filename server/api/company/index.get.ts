import SqlCompany from "~~/server/database/SqlCompany"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlCompany.select(query.comCode!.toString())
})