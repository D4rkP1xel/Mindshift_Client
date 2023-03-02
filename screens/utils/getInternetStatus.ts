import { useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo"

export function getInternetStatus() {
  const [isOfflineIcon, setOfflineIcon] = useState<boolean | null>(false)
  useEffect(() => {
    if (isOfflineIcon === null) {
      refreshIsOffline()
    }
  }, [isOfflineIcon])
  function refreshIsOffline() {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected || !state.isInternetReachable) {
        setOfflineIcon(true)
        console.log("Is connection valid: false")
        return
      }
      setOfflineIcon(false)
      console.log("Is connection valid: true")
    })
  }
  function invalidateConnection() {
    setOfflineIcon(null)
  }

  return { isOffline: isOfflineIcon, invalidateConnection }
}
