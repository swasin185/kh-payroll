import * as schema from "../server/database/schema"
export type SchemaTypes = {
    [K in keyof typeof schema]: (typeof schema)[K] extends { $inferSelect: infer T } ? T : never
}

export interface LookupItem {
  id: any;
  label: any;
}

export interface ReportParameter {
    app?: string
    db?: string
    report: string
    comCode?: string
    comName?: string
    fromDate?: string
    toDate?: string
    fromId?: string
    toId?: string
    idList?: string
    option?: string
    saveFile?: string
}
