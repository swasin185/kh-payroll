import SqlCompany from "~~/server/database/SqlCompany"

export default authEventHandler(async (event): Promise<any> => {
    return await SqlCompany.selectAll()
})