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
interface userInfoState {
  userInfo: userType
  setUserInfo: any
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
  //addLocalTask: any
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

const useLocalTasks = create<localTasksState>((set) => ({
  localTasks: {},
  setLocalTasks: async (newLocalTasks: { tasks: task[] }, newLocalTasksDate: string) => {
    try {
      const data = await getData("local_tasks")
      const localTasksAux = data !== null ? data : {}
      localTasksAux[newLocalTasksDate] = newLocalTasks //addTaskScreen sends all the tasks of the day and stores them after
      await storeData("local_tasks", localTasksAux)
      set(() => {
        return { localTasks: newLocalTasks }
      })
    }
    catch (err) {
      console.log(err)
    }

  }

  // addLocalTask: (newLocalTask: task) => {
  //   //@ts-ignore
  //   set(async () => {
  //     try {
  //       let currentLocalTasks: task[] = (await getData("local_tasks")).tasks
  //       currentLocalTasks.push(newLocalTask)
  //       storeData("local_tasks", currentLocalTasks)
  //       return { localTasks: currentLocalTasks }
  //     }
  //     catch (err) {
  //       console.log(err)
  //     }
  //   })
  // }
}))

export { useUserInfo, useAppStyle, useOfflineMode, useLocalTasks }
