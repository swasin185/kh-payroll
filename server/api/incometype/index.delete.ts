import SqlIncomeType from "~~/server/database/SqlIncomeType"

export const del = authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlIncomeType.delete(query.inCode!.toString())
})