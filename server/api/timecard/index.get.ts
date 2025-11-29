import SqlTimeCard from "~~/server/database/SqlTimeCard"
import SqlEmployee from "~~/server/database/SqlEmployee"
import { type Employee } from "~~/shared/schema"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const emp: Employee | null = await SqlEmployee.select(query.comCode!.toString(), query.empCode!.toString()) 
    return await SqlTimeCard.select(query.dateTxt!.toString(), emp!.scanCode!.toString())
})
