import { useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo"

export function getInternetStatus() {
  const [isOfflineIcon, setOfflineIcon] = useState<boolean | null>(false) //when this state is true, an icon indicating there's no connection will appear on the screen

  useEffect(() => {
    //every 10 seconds each react native screen checks if there's connection
    let interval = setInterval(() => {
      refreshIsOffline()
    }, 10000)
    return () => clearInterval(interval)
  }, [isOfflineIcon])
  function refreshIsOffline() {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected || !state.isInternetReachable) {
        setOfflineIcon(true)
        //console.log("Is connection valid: false")
        return
      }
      setOfflineIcon(false)
      //console.log("Is connection valid: true")
    })
  }

  return { isOffline: isOfflineIcon }
}
