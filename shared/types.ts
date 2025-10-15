import * as schema from "../server/database/schema"
export type SchemaTypes = {
    [K in keyof typeof schema]: (typeof schema)[K] extends { $inferSelect: infer T } ? T : never
}

export interface LookupItem {
  id: any;
  label: any;
}