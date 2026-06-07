import SqlEmployee from "~~/server/database/SqlEmployee"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlEmployee.select(query.comCode!.toString(), query.empCode!.toString())
})
