import SqlIncomeType from "~~/server/database/SqlIncomeType"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlIncomeType.select(query.inCode!.toString())
})
