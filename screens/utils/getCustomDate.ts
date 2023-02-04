export default function getCustomDate():string
{
    const date = new Date()
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}