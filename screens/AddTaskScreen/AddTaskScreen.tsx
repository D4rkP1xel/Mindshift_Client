import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign"
import Fontisto from "react-native-vector-icons/Fontisto"
import { useMutation, useQuery, useQueryClient } from "react-query"

import axios from "../utils/axiosConfig"
import { useUserInfo } from "../utils/zustandStateManager"
import SelectedList from "../components/SelectedList"
import { useNavigation } from "@react-navigation/native"
import useAppStyling from "../utils/useAppStyling"
import CustomStatusBar from "../components/StatusBar"

interface task {
  id: string
  name: string
  date: string | number
  user_id: string
  is_done: number
  task_category_name: string
  task_time: number
}

type Nav = {
  navigate: (value: string) => void
}

function AddTaskScreen({ route }: any) {
  const categoriesBlackList = ["none", "all"]
  const {
    mainColor,
    mainColorHash,
    bgColor,
    buttonRoundness,
    buttonColor,
    secondaryBorderColor,
    borderColor,
  } = useAppStyling()
  const [taskName, setTaskName] = useState("")
  const [is_done_state, set_is_done_state] = useState(-1)
  const queryClient = useQueryClient()
  const userInfoState = useUserInfo((state) => state.userInfo)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [taskHoursInput, setTaskHoursInput] = useState(0)
  const [isHoursFocused, setIsHoursFocused] = useState(false)
  const [taskHoursFocusInput, setTaskHoursFocusInput] = useState("")
  const [taskMinutesInput, setTaskMinutesInput] = useState(0)
  const [isMinutesFocused, setIsMinutesFocused] = useState(false)
  const [taskMinutesFocusInput, setTaskMinutesFocusInput] = useState("")
  const navigation = useNavigation<Nav>()
  const [isOpenDropDownMenu, setOpenDropDownMenu] = useState<boolean>(false)
  const [isLoadingNewTask, setLoadingNewTask] = useState(false)
  const tasks: task[] | undefined = queryClient.getQueryData([
    "tasks",
    route.params.selectedDate,
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
  const { mutate: mutateNewTask } = useMutation(
    async (
      params: [
        taskNameAux: string,
        is_done_aux: number,
        selected_category_aux: string,
        task_time_aux: number
      ]
    ) => await addTask(...params),
    {
      onMutate: (params) => {
        let taskNameAux = params[0]
        let is_done_aux = params[1]
        let selected_category_aux = params[2]

        if (taskNameAux.length < 2) return
        if (categoriesBlackList.includes(taskNameAux.toLowerCase().trim())) {
          return
        }
        if (
          tasks != null &&
          Array.isArray(tasks) &&
          tasks.length > 0 &&
          tasks
            .map((task: task) => task.name.toLowerCase())
            .includes(taskNameAux.toLowerCase())
        )
          return
        queryClient.cancelQueries({
          queryKey: ["tasks", route.params.selectedDate],
        })
        queryClient.setQueryData(
          ["tasks", route.params.selectedDate],
          (prev: any) => {
            return prev == null
              ? [
                  {
                    name: taskNameAux,
                    id: Math.round(Math.random() * 10000).toString(),
                    is_done: is_done_aux,
                    task_category_name: selected_category_aux,
                  },
                ]
              : [
                  ...prev,
                  {
                    name: taskNameAux,
                    id: Math.round(Math.random() * 10000).toString(),
                    is_done: is_done_aux,
                    task_category_name: selected_category_aux,
                  },
                ]
          }
        )
      },
      onSuccess: () => {
        queryClient.refetchQueries(["tasks", route.params.selectedDate])
        queryClient.refetchQueries(["calendar_performance"])
      },
      onError: () => {
        queryClient.setQueryData(
          ["tasks", route.params.selectedDate],
          (prev: any) => prev.slice(0, prev.length - 1)
        )
      },
    }
  )
  async function addTask(
    taskNameAux: string,
    is_done_aux: number,
    selected_category_aux: string,
    task_time_aux: number
  ) {
    Keyboard.dismiss()
    if (isHoursFocused) setIsHoursFocused(false)
    if (isMinutesFocused) setIsMinutesFocused(false)
    if (taskNameAux.length < 2) {
      setLoadingNewTask(false)
      return Alert.alert("Minimum size is 2 letters.")
    }
    if (categoriesBlackList.includes(taskNameAux.toLowerCase().trim())) {
      setLoadingNewTask(false)
      return Alert.alert("ERROR: Reserved Category Name")
    }
    if (
      tasks != null &&
      Array.isArray(tasks) &&
      tasks.length > 0 &&
      tasks
        .map((task: task) => task.name.toLowerCase())
        .includes(taskNameAux.toLowerCase())
    ) {
      setLoadingNewTask(false)
      return Alert.alert("Task already exists")
    }

    try {
      await axios.post("/task/add", {
        user_id: userInfoState.id,
        task_name: taskNameAux,
        task_date: route.params.selectedDate,
        is_done: is_done_aux,
        category_name: selected_category_aux,
        task_time: task_time_aux,
      })
      //Alert.alert("Task added with success")
      setLoadingNewTask(false)
      navigation.navigate("Home")
    } catch (err) {
      setLoadingNewTask(false)
      console.log(err)
      Alert.alert("Error adding new task")
      throw new Error("oh noo")
    }
  }

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss()
          setOpenDropDownMenu(false)
        }}
        accessible={false}>
        <SafeAreaView className={`${bgColor}`}>
          <CustomStatusBar />
          <View className="mt-6 px-8 h-full pb-14">
            <View className="flex-row w-full">
              <View className="h-fit ml-auto">
                <AntDesign
                  name={"close"}
                  color={mainColorHash}
                  size={32}
                  onPress={() => navigation.navigate("Home")}
                />
              </View>
            </View>

            <Text className={`font-semibold text-2xl ${mainColor}`}>Task:</Text>

            <View className={`border-b ${secondaryBorderColor} w-10/12 mt-4`}>
              <TextInput
                className={`text-base ${mainColor}`}
                multiline={false}
                onFocus={() => setOpenDropDownMenu(false)}
                value={taskName}
                onChangeText={(text) => setTaskName(text)}></TextInput>
            </View>
            <SelectedList
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              queryClient={queryClient}
              categories={categories}
              isOpenDropDownMenu={isOpenDropDownMenu}
              setOpenDropDownMenu={setOpenDropDownMenu}
            />
            <Text className={`font-semibold text-2xl mt-8 mb-4 ${mainColor}`}>
              Task time:
            </Text>

            <View className="flex-row items-center">
              <View className="flex-row items-center gap-2">
                <View
                  className={`${borderColor} ${buttonRoundness} w-10 ${buttonColor}`}>
                  <TextInput
                    keyboardType="number-pad"
                    className={`text-lg w-full ${mainColor} pl-2`}
                    multiline={false}
                    value={
                      isHoursFocused
                        ? taskHoursFocusInput
                        : taskHoursInput.toString()
                    }
                    onFocus={() => {
                      setTaskHoursFocusInput("")
                      setIsHoursFocused(true)
                    }}
                    onEndEditing={() => {
                      if (
                        !Number.isInteger(parseInt(taskHoursFocusInput)) ||
                        parseInt(taskHoursFocusInput) == null ||
                        parseInt(taskHoursFocusInput) <= 0
                      )
                        setTaskHoursInput(0)
                      else if (parseInt(taskHoursFocusInput) >= 23)
                        setTaskHoursInput(23)
                      else setTaskHoursInput(parseInt(taskHoursFocusInput))

                      setIsHoursFocused(false)
                    }}
                    onChangeText={(text) =>
                      setTaskHoursFocusInput(text)
                    }></TextInput>
                </View>
                <Text className={`text-lg mr-12 ${mainColor}`}>hours</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className={`${borderColor} ${buttonRoundness} w-10 ${buttonColor}`}>
                  <TextInput
                    keyboardType="numeric"
                    className={`text-lg w-full ${mainColor} pl-2`}
                    multiline={false}
                    value={
                      isMinutesFocused
                        ? taskMinutesFocusInput
                        : taskMinutesInput.toString()
                    }
                    onFocus={() => {
                      setTaskMinutesFocusInput("")
                      setIsMinutesFocused(true)
                    }}
                    onEndEditing={() => {
                      if (
                        !Number.isInteger(parseInt(taskMinutesFocusInput)) ||
                        parseInt(taskMinutesFocusInput) == null ||
                        parseInt(taskMinutesFocusInput) <= 0
                      )
                        setTaskMinutesInput(0)
                      else if (parseInt(taskMinutesFocusInput) >= 60)
                        setTaskMinutesInput(60)
                      else setTaskMinutesInput(parseInt(taskMinutesFocusInput))
                      setIsMinutesFocused(false)
                    }}
                    onChangeText={(text) => {
                      setTaskMinutesFocusInput(text)
                    }}></TextInput>
                </View>
                <Text className={`text-lg ${mainColor}`}>minutes</Text>
              </View>
            </View>

            <Text className={`font-semibold text-2xl mt-8 ${mainColor}`}>
              Status:
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                set_is_done_state(-1)
                setOpenDropDownMenu(false)
                Keyboard.dismiss()
              }}
              className={`py-2 px-4 border-2 border-red-600 ${buttonRoundness} mt-6 ${buttonColor} flex-row items-center justify-between`}
              style={{ elevation: 2 }}>
              <Text className={`text-base font-medium ${mainColor}`}>
                Not done
              </Text>
              {is_done_state === -1 ? (
                <Fontisto
                  name="radio-btn-active"
                  color={mainColorHash}
                  size={20}
                />
              ) : (
                <Fontisto
                  name="radio-btn-passive"
                  color={mainColorHash}
                  size={20}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                set_is_done_state(0)
                setOpenDropDownMenu(false)
                Keyboard.dismiss()
              }}
              className={`py-2 px-4 border-2 border-orange-500 ${buttonRoundness} mt-4 ${buttonColor} flex-row items-center justify-between`}
              style={{ elevation: 2 }}>
              <Text className={`text-base font-medium ${mainColor}`}>
                Currently doing / halfway done
              </Text>
              {is_done_state === 0 ? (
                <Fontisto
                  name="radio-btn-active"
                  color={mainColorHash}
                  size={20}
                />
              ) : (
                <Fontisto
                  name="radio-btn-passive"
                  color={mainColorHash}
                  size={20}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                set_is_done_state(1)
                setOpenDropDownMenu(false)
                Keyboard.dismiss()
              }}
              className={`py-2 px-4 border-2 border-green-600 ${buttonRoundness} mt-4 ${buttonColor} flex-row items-center justify-between`}
              style={{ elevation: 2 }}>
              <Text className={`text-base font-medium ${mainColor}`}>
                Completed
              </Text>
              {is_done_state === 1 ? (
                <Fontisto
                  name="radio-btn-active"
                  color={mainColorHash}
                  size={20}
                />
              ) : (
                <Fontisto
                  name="radio-btn-passive"
                  color={mainColorHash}
                  size={20}
                />
              )}
            </TouchableOpacity>

            <View className="mt-auto w-full flex-row-reverse">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (isLoadingNewTask === true) return
                  setLoadingNewTask(true)
                  mutateNewTask([
                    taskName,
                    is_done_state,
                    selectedCategory === "" ? "None" : selectedCategory,
                    taskHoursInput * 60 + taskMinutesInput,
                  ])
                }}
                className="w-4/12 rounded-full h-12 bg-blue-500 justify-center items-center mb-3"
                style={{ elevation: 2 }}>
                {isLoadingNewTask ? (
                  <ActivityIndicator color={"#FFFFFF"} />
                ) : (
                  <Text className="text-white text-lg">Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default AddTaskScreen
