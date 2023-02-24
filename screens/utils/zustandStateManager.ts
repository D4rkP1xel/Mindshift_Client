import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface userType {
  id: string | null
  name: string | null
  email: string | null
  creation_date: Date
}
interface appStyleType {
  darkMode: boolean
}
interface userInfoState {
  userInfo: any
  setUserInfo: any
}
interface appStyleState {
  appStyle: any
  setAppStyle: any
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
  userInfo:
    getData("user_info") != null
      ? //@ts-ignore
        getData("user_info")
      : { id: null, name: null, email: null, creation_date: new Date() },
  setUserInfo: (newUserInfo: userType) =>
    set(() => {
      storeData("user_info", newUserInfo)
      return { userInfo: newUserInfo }
    }),
}))

const useAppStyle = create<appStyleState>((set) => ({
  appStyle:
    //@ts-ignore
    getData("app_style") != null && getData("app_style").darkMode !== undefined
      ? //@ts-ignore
        getData("app_style")
      : { darkMode: true },
  setAppStyle: (newAppStyle: appStyleType) =>
    set(() => {
      storeData("app_style", newAppStyle)
      return { appStyle: newAppStyle }
    }),
}))

export { useUserInfo, useAppStyle }
