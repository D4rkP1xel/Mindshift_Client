export default function getCustomDate(date:Date):string
{
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() +1).toString().padStart(2, '0')}-${(date.getUTCDate()).toString().padStart(2, '0')}`
}

export function getYesterday():string
{
    let date = new Date()
    date.setDate(date.getDate() - 1)
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() +1).toString().padStart(2, '0')}-${(date.getUTCDate()).toString().padStart(2, '0')}`
}
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function getDatePrettyFormat(date:string):string
{
    const year =  parseInt(date.slice(0,4))
    const month = parseInt(date.slice(5, 7)) 
    const day =  parseInt(date.slice(8))
    const monthShort = months[month-1]
    return `${year === new Date().getUTCFullYear() ? "" : year + " "}${monthShort} ${day} `
}
