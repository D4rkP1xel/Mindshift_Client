import { useContext } from "react"
import { View, Text, Keyboard } from "react-native"

interface props {
  name: string
  is_done: number
  id: string
}
import { EditMenuContext } from "../utils/context"

function Task({ name, is_done, id }: props) {
  const setEditMenuOpen = useContext(EditMenuContext)

  return (
    <View
      className={
        is_done === -1
          ? "py-2 border-b-2 border-red-600 mb-4"
          : is_done === 0
          ? "py-2 border-b-2 border-yellow-500 mb-4"
          : "py-2 border-b-2 border-green-600 mb-4"
      }>
      <Text
        onPress={() => {
          id !== "0" ? setEditMenuOpen(id) : null
          Keyboard.dismiss()
        }}
        className="text-lg font-normal">
        {name}
      </Text>
    </View>
  )
}

export default Task
