import { useState } from "react"
import { Text, TouchableOpacity, ActivityIndicator } from "react-native"
import useAppStyling from "../hooks/useAppStyling"

type props = {
  name: string
  onPressFunc: () => void
}

function Button({ name, onPressFunc }: props) {
  const [isLoading, setLoading] = useState(false)
  const { mainColor, buttonColor, buttonRoundness, borderColor } =
    useAppStyling()
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={async () => {
        if (isLoading === true) return
        setLoading(true)
        await onPressFunc()
        setLoading(false)
      }}
      className={`w-6/12 ${buttonRoundness} h-12 ${buttonColor} ${borderColor} justify-center items-center mb-3`}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Text className={`${mainColor} text-base`}>{name}</Text>
      )}
    </TouchableOpacity>
  )
}

export default Button
