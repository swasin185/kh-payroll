import { formatDate } from "./utils"

export default class DateStr {
    private static _TODAY: DateStr

    public static TODAY(): DateStr {
        if (!DateStr._TODAY) DateStr.init()
        return DateStr._TODAY
    }

    // Initilized at plugins
    // DateStr.init(await $fetch("/api/lobby/today"))
    public static init(date: string = formatDate(new Date())) {
        DateStr._TODAY = new DateStr(date)
        console.log("Today is", DateStr._TODAY.localeDate)
    }

    public readonly isoDate: string | null = null

    public readonly localeDate: string = ""

    public readonly day: string | null = null

    public readonly month: string | null = null

    public readonly year: string | null = null

    // prefer YYYY-MM-DD format
    constructor(str: string | null) {
        if (!str) return
        const check = new Date(str)
        if (check && !Number.isNaN(check.getTime())) {
            this.isoDate = formatDate(check)
            this.year = this.isoDate.substring(0, 4)
            this.month = this.isoDate.substring(5, 7)
            this.day = this.isoDate.substring(8, 10)
            this.localeDate = `${this.day}/${this.month}/${this.year}`
        } else
            console.error(`Date Value Invalid ${str}`)
    }
}
