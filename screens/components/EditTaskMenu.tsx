import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign"
import Fontisto from "react-native-vector-icons/Fontisto"
import { useMutation, useQuery, useQueryClient } from "react-query"

import axios from "../utils/axiosConfig"
import useUserInfo from "../utils/useUserInfo"
import SelectedList from "./SelectedList"

interface props {
  setEditMenuOpen: any
  initialTaskName: string
  id: string
  is_done: number
  category: string
  selectedDate: string
  refetchCalendarPerformance: Function
  task_time: number
}

interface task {
  id: string
  name: string
  date: string | number
  user_id: string
  is_done: number
  task_category_name: string
  task_time: number
}

function EditTaskMenu({
  setEditMenuOpen,
  initialTaskName,
  id,
  is_done,
  category,
  selectedDate,
  refetchCalendarPerformance,
  task_time,
}: props) {
  const [taskName, setTaskName] = useState(initialTaskName)
  const [is_done_state, set_is_done_state] = useState(is_done)
  const queryClient = useQueryClient()
  const userInfoState = useUserInfo((state) => state.userInfo)
  const [selectedCategory, setSelectedCategory] = useState<string>(category)
  const [taskHoursInput, setTaskHoursInput] = useState(
    Math.floor(task_time / 60)
  )
  const [taskMinutesInput, setTaskMinutesInput] = useState(
    task_time - Math.floor(task_time / 60) * 60
  )
  const tasks: task[] | undefined = queryClient.getQueryData([
    "tasks",
    selectedDate,
  ])
  const { data: categories } = useQuery(["categories"], async () => {
    return axios
      .post("/category/get", { user_id: userInfoState.id })
      .then((res) => {
        //console.log(res.data.categories)
        return res.data.categories
      })
      .catch((err) => {
        console.log(err)
      })
  })

  const { mutate: mutateSaveChanges } = useMutation(
    async (
      params: [
        taskNameAux: string,
        is_done_aux: number,
        selected_category_aux: string,
        task_time_aux: number
      ]
    ) => await saveTask(...params),
    {
      onMutate: (
        params: [
          taskNameAux: string,
          is_done_aux: number,
          selected_category_aux: string,
          task_time_aux: number
        ]
      ) => {
        if (initialTaskName.trim() !== params[0].trim()) {
          //change task name
          if (params[0].trim().length < 2) return
          if (
            tasks != null &&
            tasks
              .filter((task: task) => task.id !== id)
              .map((task: task) => task.name.toLowerCase())
              .includes(params[0].trim().toLowerCase())
          )
            return

          queryClient.cancelQueries({ queryKey: ["tasks", selectedDate] })
          queryClient.setQueryData(
            ["tasks", selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === id) {
                  prev[index].name = params[0]
                  break
                }
              }
              return prev
            }
          )
        }
        if (is_done !== params[1]) {
          queryClient.cancelQueries({ queryKey: ["tasks", selectedDate] })
          queryClient.setQueryData(
            ["tasks", selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === id) {
                  prev[index].is_done = params[1]
                  break
                }
              }
              return prev
            }
          )
        }
        if (category !== params[2]) {
          queryClient.cancelQueries({ queryKey: ["tasks", selectedDate] })
          queryClient.setQueryData(
            ["tasks", selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === id) {
                  prev[index].task_category_name = params[2]
                  break
                }
              }
              return prev
            }
          )
        }
        if (task_time !== params[3]) {
          queryClient.cancelQueries({ queryKey: ["tasks", selectedDate] })
          queryClient.setQueryData(
            ["tasks", selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === id) {
                  prev[index].task_time = params[3]
                  break
                }
              }
              return prev
            }
          )
        }
      },
      onSuccess: () => {
        refetchCalendarPerformance()
      },
    }
  )

  async function saveTask(
    taskNameAux: string,
    is_done_aux: number,
    selected_category_aux: string,
    task_time_aux: number
  ) {
    if (is_done !== is_done_aux) {
      try {
        await axios.post("/task/changedone", {
          task_id: id,
          is_done: is_done_aux,
        })
      } catch (err) {
        console.log(err)
        setEditMenuOpen("")
      }
    }
    if (initialTaskName.trim() !== taskNameAux.trim()) {
      //change task name
      if (taskNameAux.trim().length < 2)
        return Alert.alert("Minimum task name size is 2 letters.")
      if (
        tasks != null &&
        tasks
          .filter((task: task) => task.id !== id)
          .map((task: task) => task.name.toLowerCase())
          .includes(taskNameAux.trim().toLowerCase())
      )
        return Alert.alert("Task name already exists")
      try {
        await axios.post("/task/changename", {
          task_id: id,
          task_name: taskNameAux.trim(),
        })
      } catch (err) {
        console.log(err)
        setEditMenuOpen("")
        return
      }
    }

    if (category !== selected_category_aux) {
      try {
        await axios.post("/task/changeCategory", {
          task_id: id,
          task_category_name: selected_category_aux,
        })
      } catch (err) {
        console.log(err)
        setEditMenuOpen("")
      }
    }

    if (task_time_aux !== task_time) {
      try {
        await axios.post("/task/changeTaskTime", {
          task_id: id,
          task_time: task_time_aux,
        })
      } catch (err) {
        console.log(err)
        setEditMenuOpen("")
      }
    }
    setEditMenuOpen("")
  }
  const { mutate: mutateDeleteTask } = useMutation(
    async (task_id: string) => await deleteTask(task_id),
    {
      onMutate: (task_id: string) => {
        setEditMenuOpen("")
        queryClient.cancelQueries({ queryKey: ["tasks", selectedDate] })

        queryClient.setQueryData(
          ["tasks", selectedDate],
          (prev: task[] | undefined | void) => {
            if (prev == null) return []

            for (let index = 0; index < prev.length; index++) {
              let task = prev[index]

              if (task.id === task_id) {
                prev.splice(index, 1)
                break
              }
            }
            return prev
          }
        )
      },
      onSuccess: () => {
        refetchCalendarPerformance()
      },
    }
  )
  async function deleteTask(idParam: string) {
    try {
      await axios.post("/task/remove", {
        task_id: idParam,
      })
    } catch (err) {
      console.log(err)
      setEditMenuOpen("")
      return
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            <View className="flex-row gap-8 items-center">
              <Text className="font-semibold text-2xl">Task:</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => mutateDeleteTask(id)}
                className="w-2/12 rounded-full h-6 bg-red-500 justify-center items-center"
                style={{ elevation: 2 }}>
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>

            <View className="border-b w-10/12 mt-4">
              <TextInput
                className="text-base"
                multiline={false}
                value={taskName}
                onChangeText={(text) => setTaskName(text)}></TextInput>
            </View>
            <SelectedList
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              queryClient={queryClient}
              categories={categories}
            />
            <Text className="font-semibold text-2xl mt-8 mb-4">Task time:</Text>

            <View className="flex-row items-center">
              <View className="flex-row items-center gap-2">
                <View className="border-2 border-black rounded-md w-10 bg-white">
                  <TextInput
                    keyboardType="number-pad"
                    className="text-lg w-full"
                    multiline={false}
                    value={taskHoursInput.toString()}
                    onChangeText={(text) => {
                      if (
                        !Number.isInteger(parseInt(text)) ||
                        parseInt(text) == null ||
                        parseInt(text) <= 0
                      )
                        setTaskHoursInput(0)
                      else if (parseInt(text) >= 23) setTaskHoursInput(23)
                      else setTaskHoursInput(parseInt(text))
                    }}></TextInput>
                </View>
                <Text className="text-lg mr-12">hours</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="border-2 border-black rounded-md w-10 bg-white">
                  <TextInput
                    keyboardType="numeric"
                    className="text-lg w-full"
                    multiline={false}
                    value={taskMinutesInput.toString()}
                    onChangeText={(text) => {
                      if (
                        !Number.isInteger(parseInt(text)) ||
                        parseInt(text) == null ||
                        parseInt(text) <= 0
                      )
                        setTaskMinutesInput(0)
                      else if (parseInt(text) >= 60) setTaskMinutesInput(60)
                      else setTaskMinutesInput(parseInt(text))
                    }}></TextInput>
                </View>
                <Text className="text-lg">minutes</Text>
              </View>
            </View>

            <Text className="font-semibold text-2xl mt-8">Status:</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => set_is_done_state(-1)}
              className="py-2 px-4 border-2 border-red-600 rounded-lg mt-6 bg-gray-50 flex-row items-center justify-between"
              style={{ elevation: 2 }}>
              <Text className="text-base font-medium">Not done</Text>
              {is_done_state === -1 ? (
                <Fontisto name="radio-btn-active" color={"black"} size={20} />
              ) : (
                <Fontisto name="radio-btn-passive" color={"black"} size={20} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => set_is_done_state(0)}
              className="py-2 px-4 border-2 border-orange-500 rounded-lg mt-4 bg-gray-50 flex-row items-center justify-between"
              style={{ elevation: 2 }}>
              <Text className="text-base font-medium">
                Currently doing / halfway done
              </Text>
              {is_done_state === 0 ? (
                <Fontisto name="radio-btn-active" color={"black"} size={20} />
              ) : (
                <Fontisto name="radio-btn-passive" color={"black"} size={20} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => set_is_done_state(1)}
              className="py-2 px-4 border-2 border-green-600 rounded-lg mt-4 bg-gray-50 flex-row items-center justify-between"
              style={{ elevation: 2 }}>
              <Text className="text-base font-medium">Completed</Text>
              {is_done_state === 1 ? (
                <Fontisto name="radio-btn-active" color={"black"} size={20} />
              ) : (
                <Fontisto name="radio-btn-passive" color={"black"} size={20} />
              )}
            </TouchableOpacity>

            <View className="mt-auto w-full flex-row-reverse">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  mutateSaveChanges([
                    taskName,
                    is_done_state,
                    selectedCategory,
                    taskHoursInput * 60 + taskMinutesInput,
                  ])
                }
                className="w-4/12 rounded-full h-12 bg-blue-500 justify-center items-center mb-3"
                style={{ elevation: 2 }}>
                <Text className="text-white text-lg">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  )
}

export default EditTaskMenu
