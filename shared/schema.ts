export interface Users {
    id: string
    name: string
    descript: string
    level: number
    role: string | null
    passwd?: string | null
    passwdTime?: Date | null
    passwd2?: string | null
    passwd2Time?: Date | null
    created?: Date | null
    stoped?: Date | null
    comCode?: string
}

export interface Company {
    comCode: string
    comName: string
    taxId: string | null
    address: string | null
    phone: string
    email1: string
    email2: string
    email3: string
    yrPayroll?: number
    mnPayroll?: number
}

export interface Permission {
    comCode: string
    userId: string
    program: string
    level: number
    used: number
}

export interface Logs {
    logNr: number
    logTime: number
    logType: string
    userId: string
    program: string
    tableName: string
    changed: string
    comCode: string
}