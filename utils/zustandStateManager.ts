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
  offline: boolean
}
interface userInfoState {
  userInfo: userType
  setUserInfo: any
}
interface appStyleState {
  appStyle: { darkMode: boolean }
  setAppStyle: any
}

interface offlineState {
  isOffline: { offline: boolean }
  setOffline: any
}

interface localTasksState {
  localTasks: { tasks: task[] }
  setLocalTasks: any
  addLocalTask: any
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

const useOffline = create<offlineState>((set) => ({
  isOffline: { offline: false },
  setOffline: (newOfflineState: offlineType) =>
    set(() => {
      storeData("offline_info", newOfflineState)
      return { isOffline: newOfflineState }
    }),
}))

const useLocalTasks = create<localTasksState>((set) => ({
  localTasks: { tasks: [] },
  setLocalTasks: (newLocalTasks: { tasks: task[] }) =>
    set(() => {
      storeData("local_tasks", newLocalTasks)
      return { localTasks: newLocalTasks }
    }),
  addLocalTask: (newLocalTask: task) => {
    //@ts-ignore
    set(async () => {
      try {
        let currentLocalTasks: task[] = (await getData("local_tasks")).tasks
        currentLocalTasks.push(newLocalTask)
        storeData("local_tasks", currentLocalTasks)
        return { localTasks: currentLocalTasks }
      }
      catch (err) {
        console.log(err)
      }

    })
  }
}))

export { useUserInfo, useAppStyle, useOffline, useLocalTasks }
