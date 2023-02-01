import { create } from 'zustand'

interface userType {
    id: string | null
    name: string | null
    email: string | null
  }

interface userInfoState {
    userInfo: userType
  }

const useUserInfo = create<userInfoState>((set) => ({
    userInfo: {id: null, name:null, email:null},
    setUserInfo: (newUserInfo: userType) => set(() => ({ userInfo: newUserInfo })),
}))