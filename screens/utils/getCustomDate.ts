export default function getCustomDate(date:Date):string
{
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() +1).toString().padStart(2, '0')}-${(date.getUTCDate()).toString().padStart(2, '0')}`
}