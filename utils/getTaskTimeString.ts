export default function getTaskTimeString(taskTimeMinutes: number) {
    let hours = Math.floor(taskTimeMinutes / 60) > 0 ? Math.floor(taskTimeMinutes / 60) + "h" : ""
    let min = taskTimeMinutes - (Math.floor(taskTimeMinutes / 60) * 60) > 0 ? taskTimeMinutes - (Math.floor(taskTimeMinutes / 60) * 60) + "m" : ""
    return hours + " " + min
}