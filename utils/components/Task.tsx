import { View, Text, Keyboard } from "react-native"

interface props {
  name: string
  is_done: number
  id: string
  category: string
  selectedDate: string
  taskTime: number
}
import { useNavigation } from "@react-navigation/native"

import useAppStyling from "../hooks/useAppStyling"
type Nav = {
  navigate: (value: string, params: object | void) => void
  addListener: Function
}

function Task({ name, is_done, id, category, selectedDate, taskTime }: props) {
  const { mainColor } = useAppStyling()
  const navigation = useNavigation<Nav>()
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
          id !== "0"
            ? navigation.navigate("EditTask", {
                id: id,
                initialTaskName: name,
                is_done: is_done,
                category: category,
                selectedDate: selectedDate,
                task_time: taskTime,
              })
            : null
          Keyboard.dismiss()
        }}
        className={`text-lg font-normal ${mainColor}`}>
        {name}
      </Text>
    </View>
  )
}

export default Task
