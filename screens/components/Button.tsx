import { useState } from "react"
import { Text, TouchableOpacity, ActivityIndicator } from "react-native"

type props = {
  name: string
  onPressFunc: () => void
}

function Button({ name, onPressFunc }: props) {
  const [isLoading, setLoading] = useState(false)
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={async () => {
        if (isLoading === true) return
        setLoading(true)
        await onPressFunc()
        setLoading(false)
      }}
      className="w-6/12 rounded-full h-12 bg-black justify-center items-center mb-3">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-white text-base">{name}</Text>
      )}
    </TouchableOpacity>
  )
}

export default Button
