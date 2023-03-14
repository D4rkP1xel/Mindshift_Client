import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { task } from "./types"

interface userType {
  id: string | null
  name: string | null
  email: string | null
  creation_date: Date
}
interface appStyleType {
  darkMode: boolean
}
interface offlineType {
  offlineMode: boolean
}

interface localCategoriesType {
  categories: string[]
}
interface userInfoState {
  userInfo: userType
  setUserInfo: any
}
interface localCategoriesState {
  categories: { categories: string[] }
  setLocalCategories: any
}

interface appStyleState {
  appStyle: { darkMode: boolean }
  setAppStyle: any
}

interface offlineState {
  isOfflineMode: { offlineMode: boolean }
  setOfflineMode: any
}

interface localTasksState {
  localTasks: any
  setLocalTasks: any
  getNumberLocalTasks: any
  getLocalTasks: any
  removeLocalTask: any
  getLocalTasksWithDate: any
}

// const useUserInfo = create<userInfoState>((set) => ({
//   userInfo: { id: null, name: null, email: null, creation_date: new Date() },
//   setUserInfo: (newUserInfo: userType) =>
//     set(() => ({ userInfo: newUserInfo })),
// }))
const storeData = async (key: string, value: object) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    console.error("Async Store Failed")
  }
}

const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e) {
    console.error("Async Store Failed")
  }
}

const useUserInfo = create<userInfoState>((set) => ({
  userInfo: { id: null, name: null, email: null, creation_date: new Date() },
  setUserInfo: (newUserInfo: userType) =>
    set(() => {
      storeData("user_info", newUserInfo)
      return { userInfo: newUserInfo }
    }),
}))

const useAppStyle = create<appStyleState>((set) => ({
  appStyle: { darkMode: false },
  setAppStyle: (newAppStyle: appStyleType) =>
    set(() => {
      storeData("app_style", newAppStyle)
      return { appStyle: newAppStyle }
    }),
}))

const useOfflineMode = create<offlineState>((set) => ({
  isOfflineMode: { offlineMode: false },
  setOfflineMode: (newOfflineModeState: offlineType) =>
    set(() => {
      storeData("offline_mode", newOfflineModeState)
      return { isOfflineMode: newOfflineModeState }
    }),
}))

const useLocalCategories = create<localCategoriesState>((set) => ({
  categories: { categories: [] }, //example: categories=["gym", "study", ...]
  setLocalCategories: (localCategoriesState: localCategoriesType) =>
    set(() => {
      storeData("local_categories", localCategoriesState)
      return { categories: localCategoriesState }
    }),
}))

const useLocalTasks = create<localTasksState>((set, get) => ({
  localTasks: {},
  setLocalTasks: async (newLocalTasks: { tasks: task[] }, newLocalTasksDate: string) => {
    try {
      let data = await getData("local_tasks")
      const localTasksAux = data !== null ? data : {}
      localTasksAux[newLocalTasksDate] = newLocalTasks //addTaskScreen sends all the tasks of the day and stores them after
      await storeData("local_tasks", localTasksAux)
      set(() => {
        return { localTasks: localTasksAux }
      })
    }
    catch (err) {
      console.log(err)
    }

  },
  getLocalTasksWithDate: (id: string, date: string) => {
    const tasks = get().localTasks
    let tasksToSend = []
    for (let i = 0; i < tasks[date].length; i++) {
      if (tasks[date][i].user_id === id) {
        tasksToSend.push(tasks[date][i])
      }
    }
    return tasksToSend

  },
  getNumberLocalTasks: (id: string) => {
    const tasks = get().localTasks
    let num = 0
    for (let dateTasks in tasks) {
      for (let i = 0; i < tasks[dateTasks].length; i++) {
        if (tasks[dateTasks][i].user_id === id) {
          num++
        }
      }
    }
    return num
  },
  getLocalTasks: (id: string) => {
    const tasks = get().localTasks
    let userTasks = []
    for (let dateTasks in tasks) {
      for (let i = 0; i < tasks[dateTasks].length; i++) {
        if (tasks[dateTasks][i].user_id === id) {
          userTasks.push(tasks[dateTasks][i])
        }
      }
    }
    return userTasks

  },
  removeLocalTask: async (date: string, id: string) => {
    let tasksOnDate: task[] = get().localTasks[date]
    if (tasksOnDate == null) return
    let index = -1;
    for (let i = 0; i < tasksOnDate.length; i++) {
      if (tasksOnDate[i].id === id) {
        index = i
        break
      }
    }
    if (index === -1) return
    tasksOnDate.splice(index, 1)
    try {
      await get().setLocalTasks(tasksOnDate, date)
    }
    catch (err) {
      console.log(err)
    }

  }


}))

export { useUserInfo, useAppStyle, useOfflineMode, useLocalTasks, useLocalCategories }
