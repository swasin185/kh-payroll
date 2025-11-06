import SqlCompany from "~~/server/database/SqlCompany"

export const list = authEventHandler(async (event) => {
    return await SqlCompany.selectAll()
})