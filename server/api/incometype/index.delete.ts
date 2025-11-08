import SqlIncomeType from "~~/server/database/SqlIncomeType"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlIncomeType.delete(query.inCode!.toString())
})