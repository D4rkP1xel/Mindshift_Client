import React from "react"
import { Text, TouchableOpacity } from "react-native"

type props = {
  name: string
  onPressFunc: () => void
}

function Button({ name, onPressFunc }: props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPressFunc}
      className="w-6/12 rounded-full h-12 bg-black justify-center items-center mb-3">
      <Text className="text-white text-base">{name}</Text>
    </TouchableOpacity>
  )
}

export default Button
