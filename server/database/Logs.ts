import type { SchemaTypes } from "~~/shared/types"
import { useDrizzle } from "./drizzle"
import { logs } from "./schema"
import { eq } from "drizzle-orm"
export class Logs {
    public static async insert(logsRecord: SchemaTypes["logs"]): Promise<boolean> {
        const db = useDrizzle()
        const result = await db.insert(logs).values(logsRecord)
        return result[0].affectedRows == 1
    }
    public static async selectLogsType(type: string): Promise<SchemaTypes["logs"][]> {
        const db = useDrizzle()
        const logs = await db.query.logs.findMany({
            where: (logsTable) => eq(logsTable.logType, type),
            orderBy: (logsTable) => logsTable.logTime,
            limit: 100,
        })
        return logs
    }
}
