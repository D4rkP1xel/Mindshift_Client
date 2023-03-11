interface task {
    id: string
    name: string
    date: string | number
    user_id: string
    is_done: number
    task_category_name: string
    task_time: number
    is_local: boolean
}

export { task }