import { useState } from "react"
import { View, Text, Alert, TextInput } from "react-native"
import Ionicons from "react-native-vector-icons/AntDesign"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import useUserInfo from "../utils/useUserInfo"
import axios from "../utils/axiosConfig"

import { useQuery } from "react-query"

function HomeScreen() {
  const [toDoInput, addToDoInput] = useState("")
  const [selectedDate, changeSelectedDate] = useState(Date.now())
  const email = useUserInfo((state) => state.userInfo)
  const { data: toDos, refetch: refreshToDos } = useQuery(
    ["toDos"],
    async () => {
      return axios
        .post("/task/get", { user_id: "userInfo.id", date: selectedDate })
        .then((res) => res.data.tasks)
        .catch((err) => {
          console.log(err)
        })
    }
  )

  function handlePress() {
    if (toDoInput.length < 2) return Alert.alert("Minimum size is 2 letters.")

    //implement route to server that adds the todo and mutates it
  }
  return (
    <View className="mt-6">
      <View className="mt-8 px-8">
        <View className="flex-row w-full">
          <Text className="text-2xl">Today</Text>
          <View className="h-fit ml-auto">
            <FontAwesome
              name={"calendar"}
              color={"black"}
              size={24}
              onPress={() => Alert.alert("yes")}
            />
          </View>
        </View>
        <Text className="text-sm text-gray-500">1/4</Text>
        <View className="mt-6 flex-row w-full">
          <View className="border-b w-10/12">
            <TextInput
              multiline={false}
              value={toDoInput}
              onChangeText={(text) => addToDoInput(text)}></TextInput>
          </View>
          <View className="ml-auto">
            <Ionicons
              onPress={handlePress}
              name={"plus"}
              color={"black"}
              size={24}
            />
          </View>
        </View>
        <View className="mt-8">
          <View className="py-2 border-b border-green-600 mb-4">
            <Text className="text-base">Go to the gym</Text>
          </View>
          <View className="py-2 border-b border-red-600 mb-4">
            <Text className="text-base">Read 1 chapter of a book</Text>
          </View>
          <View className="py-2 border-b border-yellow-500 mb-4">
            <Text className="text-base">Code</Text>
          </View>
          <View className="py-2 border-b border-red-600 mb-4">
            <Text className="text-base">Meditate</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default HomeScreen
