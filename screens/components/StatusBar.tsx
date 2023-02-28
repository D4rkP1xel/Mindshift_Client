import { StatusBar } from "react-native"
import useAppStyling from "../utils/useAppStyling"

function CustomStatusBar() {
  const { bgColorHash, StatusBarColor } = useAppStyling()
  //@ts-ignore
  return <StatusBar backgroundColor={bgColorHash} barStyle={StatusBarColor} />
}

export default CustomStatusBar
