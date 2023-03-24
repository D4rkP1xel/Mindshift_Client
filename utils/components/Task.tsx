import { View, Text, Keyboard, TouchableWithoutFeedback } from "react-native"

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
import getTaskTimeString from "../getTaskTimeString"
type Nav = {
  navigate: (value: string, params: object | void) => void
  addListener: Function
}

function Task({ name, is_done, id, category, selectedDate, taskTime }: props) {
  const { mainColor, homePageTaskTime } = useAppStyling()
  const navigation = useNavigation<Nav>()
  return (
    <TouchableWithoutFeedback
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
      }}>
      <View
        className={
          is_done === -1
            ? "py-2 border-b-2 border-red-600 mb-4 justify-between flex-row pr-1 items-center"
            : is_done === 0
            ? "py-2 border-b-2 border-yellow-500 mb-4 justify-between flex-row pr-1 items-center"
            : "py-2 border-b-2 border-green-600 mb-4 justify-between flex-row pr-1 items-center"
        }>
        <Text className={`text-lg font-normal ${mainColor}`}>{name}</Text>
        <Text className={`text-sm font-normal ${homePageTaskTime}`}>
          {getTaskTimeString(taskTime)}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Task
