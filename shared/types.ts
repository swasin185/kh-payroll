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
  startDate?: string
  endDate?: string
  fromId?: string
  toId?: string
  idList?: string
  option?: string
  saveFile?: string
}
