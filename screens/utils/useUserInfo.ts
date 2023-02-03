import { create } from 'zustand'

interface userType {
    id: string | null
    name: string | null
    email: string | null
    creation_date: number | string | null
  }

interface userInfoState {
    userInfo: userType,
    setUserInfo: any
  }

const useUserInfo = create<userInfoState>((set) => ({
    userInfo: {id: null, name:null, email:null, creation_date: null},
    setUserInfo: (newUserInfo: userType) => set(()=>({ userInfo: newUserInfo })),
}))

export default useUserInfo