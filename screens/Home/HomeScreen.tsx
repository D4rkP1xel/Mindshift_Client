import { useState, createContext } from "react"
import { View, Text, Alert, TextInput } from "react-native"
import Ionicons from "react-native-vector-icons/AntDesign"
import FontAwesome from "react-native-vector-icons/FontAwesome5"

import useUserInfo from "../utils/useUserInfo"
import axios from "../utils/axiosConfig"
import getCustomDate from "../utils/getCustomDate"
import { useMutation, useQuery, useQueryClient } from "react-query"
import Task from "../components/Task"
import EditTaskMenu from "../components/EditTaskMenu"

interface task {
  id: string
  name: string
  date: string | number
  user_id: string
  is_done: number
  task_category_name: string
}

export const EditMenuContext = createContext<any>(null)

function HomeScreen() {
  const [toDoInput, addToDoInput] = useState("")
  const [selectedDate, changeSelectedDate] = useState(getCustomDate())
  const userInfoState = useUserInfo((state) => state.userInfo)
  const queryClient = useQueryClient()
  const [isEditMenuOpen, setEditMenuOpen] = useState<string>("") //either stores an empty string or the id of the task

  const { data: tasks, isLoading: isLoadingTasks } = useQuery(
    ["tasks"],
    async () => {
      return axios
        .post("/task/get", { user_id: userInfoState.id, date: selectedDate })
        .then((res) => {
          //console.log(res.data.tasks)
          return res.data.tasks
        })
        .catch((err) => {
          console.log(err)
        })
    }
  )

  const { mutate: mutateNewTask } = useMutation(
    async (params) => await handleAddTask(params),
    {
      onMutate: (newTaskName: string) => {
        if (newTaskName.length < 2) return
        if (
          tasks
            .map((task: task) => task.name.toLowerCase())
            .includes(newTaskName.toLowerCase())
        )
          return
        queryClient.cancelQueries({ queryKey: ["tasks"] })
        queryClient.setQueryData(["tasks"], (prev: any) => {
          return prev == null
            ? [
                {
                  name: newTaskName,
                  id: (Math.random() * 1000).toString(),
                  is_done: -1,
                },
              ]
            : [
                ...prev,
                {
                  name: newTaskName,
                  id: (Math.random() * 1000).toString(),
                  is_done: -1,
                },
              ]
        })
      },
      onError: () => {
        queryClient.setQueryData(["tasks"], (prev: any) =>
          prev.slice(0, prev.length - 1)
        )
        setEditMenuOpen("")
      },
    }
  )

  async function handleAddTask(newTaskName: string) {
    if (newTaskName.length < 2) return Alert.alert("Minimum size is 2 letters.")
    if (
      tasks
        .map((task: task) => task.name.toLowerCase())
        .includes(newTaskName.toLowerCase())
    )
      return Alert.alert("Task already exists")
    try {
      await axios.post("/task/add", {
        user_id: userInfoState.id,
        task_name: newTaskName,
        task_date: selectedDate,
      })
      Alert.alert("Task added with success")
      addToDoInput("")
    } catch (err) {
      console.log(err)
      Alert.alert("Error adding new task")
      throw new Error("oh noo")
    }
  }
  return (
    <>
      {isEditMenuOpen !== "" ? (
        <EditTaskMenu
          setEditMenuOpen={setEditMenuOpen}
          initialTaskName={
            tasks.filter((task: task) => task.id === isEditMenuOpen)[0].name ||
            ""
          }
          id={isEditMenuOpen}
          is_done={
            tasks.filter((task: task) => task.id === isEditMenuOpen)[0].is_done
          }
          category={
            tasks.filter((task: task) => task.id === isEditMenuOpen)[0]
              .task_category_name
          }
        />
      ) : null}
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
          <Text className="text-sm text-gray-500">
            {tasks != null
              ? `${tasks.filter((task: task) => task.is_done === 1).length}/${
                  tasks.length
                }`
              : "0/0"}
          </Text>
          <View className="mt-6 flex-row w-full">
            <View className="border-b w-10/12">
              <TextInput
                multiline={false}
                value={toDoInput}
                onChangeText={(text) => addToDoInput(text)}></TextInput>
            </View>
            <View className="ml-auto">
              <Ionicons
                onPress={() => mutateNewTask(toDoInput.trim())}
                name={"plus"}
                color={"black"}
                size={24}
              />
            </View>
          </View>
          <View className="mt-8">
            <EditMenuContext.Provider value={setEditMenuOpen}>
              {tasks != null && Array.isArray(tasks) && tasks.length > 0 ? (
                tasks.map((task: task) => {
                  return (
                    <Task
                      name={task.name}
                      is_done={task.is_done}
                      id={task.id}
                      key={task.id}></Task>
                  )
                })
              ) : isLoadingTasks ? null : (
                <Text>No tasks added for this day</Text>
              )}
            </EditMenuContext.Provider>
          </View>
        </View>
      </View>
    </>
  )
}

export default HomeScreen
