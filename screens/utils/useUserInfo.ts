import { create } from 'zustand'


interface userType {
    id: string | null
    name: string | null
    email: string | null
    creation_date: Date
  }

interface userInfoState {
    userInfo: userType,
    setUserInfo: any
  }

const useUserInfo = create<userInfoState>((set) => ({
    userInfo: {id: null, name:null, email:null, creation_date: new Date()},
    setUserInfo: (newUserInfo: userType) => set(()=>({ userInfo: newUserInfo })),
}))

export default useUserInfo