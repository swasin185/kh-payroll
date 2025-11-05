import { formatDate } from "~~/shared/utils"
export default eventHandler(() => {
    return formatDate(new Date())
})
