import SqlEmployee from "~~/server/database/SqlEmployee"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlEmployee.select(query.comCode!.toString(), query.empCode!.toString())
})
