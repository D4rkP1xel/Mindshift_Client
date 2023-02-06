import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign"
import { useQueryClient } from "react-query"
import axios from "../utils/axiosConfig"

interface props {
  setEditMenuOpen: any
  initialTaskName: string
  id: string
}

interface task {
  id: string
  name: string
  date: string | number
  user_id: string
  is_done: number
}
function EditTaskMenu({ setEditMenuOpen, initialTaskName, id }: props) {
  const [taskName, setTaskName] = useState(initialTaskName)
  const queryClient = useQueryClient()
  const tasks: task[] | undefined = queryClient.getQueryData(["tasks"])
  async function saveTask() {
    if (initialTaskName.trim() !== taskName.trim()) {
      //change task name
      if (taskName.trim().length < 2)
        return Alert.alert("Minimum size is 2 letters.")
      if (
        tasks != null &&
        tasks
          .map((task: task) => task.name.toLowerCase())
          .includes(taskName.trim().toLowerCase())
      )
        return Alert.alert("Task already exists")
      await axios.post("/task/changename", {
        task_id: id,
        task_name: taskName.trim(),
      })
    }
    return
  }
  return (
    <View className="h-screen w-screen fixed">
      <View className="mt-12 px-8 h-full pb-14">
        <View className="flex-row w-full">
          <View className="h-fit ml-auto">
            <AntDesign
              name={"close"}
              color={"black"}
              size={32}
              onPress={() => setEditMenuOpen("")}
            />
          </View>
        </View>

        <Text className="font-semibold text-xl">Task:</Text>
        <View className="border-b w-10/12 mt-2">
          <TextInput
            className="text-base"
            multiline={false}
            value={taskName}
            onChangeText={(text) => setTaskName(text)}></TextInput>
        </View>

        <Text className="font-semibold text-xl mt-8">Status:</Text>
        <View className="py-2 px-4 border-2 border-red-600 rounded-lg mt-4">
          <Text className="text-base font-medium">Not done</Text>
        </View>
        <View className="py-2 px-4 border-2 border-orange-500 rounded-lg mt-4">
          <Text className="text-base font-medium">
            Currently doing / halfway done
          </Text>
        </View>
        <View className="py-2 px-4 border-2 border-green-600 rounded-lg mt-4">
          <Text className="text-base font-medium">Completed</Text>
        </View>
        <View className="mt-auto w-full flex-row-reverse">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => await saveTask()}
            className="w-4/12 rounded-full h-12 bg-blue-500 justify-center items-center mb-3">
            <Text className="text-white text-lg">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default EditTaskMenu
