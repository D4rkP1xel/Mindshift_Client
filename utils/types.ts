interface task {
    id: string
    name: string
    date: string  // 22-02-2023
    user_id: string
    is_done: number // -1 (not done), 0 (halfway done), 1 (done)
    task_category_name: string
    task_time: number // in minutes
    is_local: boolean //variable not implemented, but could be used for storing local tasks and online tasks at the same time and distiguish them
}

export { task }