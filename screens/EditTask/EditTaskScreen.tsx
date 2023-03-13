import { useState } from "react"
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
import { SafeAreaView } from "react-native-safe-area-context"
import AntDesign from "react-native-vector-icons/AntDesign"
import Fontisto from "react-native-vector-icons/Fontisto"
import { useMutation, useQuery, useQueryClient } from "react-query"
import axios from "../../utils/axiosConfig"
import useAppStyling from "../../utils/hooks/useAppStyling"
import {
  useLocalCategories,
  useLocalTasks,
  useOfflineMode,
  useUserInfo,
} from "../../utils/zustandStateManager"
import SelectedList from "../../utils/components/SelectedList"
import { useNavigation } from "@react-navigation/native"
import CustomStatusBar from "../../utils/components/StatusBar"
import { getInternetStatus } from "../../utils/hooks/getInternetStatus"
import Feather from "react-native-vector-icons/Feather"
import { task } from "../../utils/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
type Nav = {
  navigate: (value: string) => void
}

function EditTaskScreen({ route }: any) {
  const navigation = useNavigation<Nav>()
  const [taskName, setTaskName] = useState(route.params.initialTaskName)
  const { isOffline } = getInternetStatus()
  const getOfflineMode = useOfflineMode((state) => state.isOfflineMode)
  const [isOpenDropDownMenu, setOpenDropDownMenu] = useState<boolean>(false)
  const [is_done_state, set_is_done_state] = useState(route.params.is_done)
  const queryClient = useQueryClient()
  const setLocalTasks = useLocalTasks((state) => state.setLocalTasks)
  const userInfoState = useUserInfo((state) => state.userInfo)
  const getData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null
        ? JSON.parse(jsonValue)[route.params.selectedDate]
        : null
    } catch (e) {
      console.error("Async Store Failed")
    }
  }
  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params.category
  )
  const [isLoadingEditTask, setLoadingEditTask] = useState(false)
  const getLocalCategories = useLocalCategories((state) => state.categories)
  const {
    mainColor,
    mainColorHash,
    bgColor,
    buttonRoundness,
    buttonColor,
    secondaryBorderColor,
    borderColor,
  } = useAppStyling()
  const [taskHoursInput, setTaskHoursInput] = useState(
    Math.floor(route.params.task_time / 60)
  )
  const [isHoursFocused, setIsHoursFocused] = useState(false)
  const [taskHoursFocusInput, setTaskHoursFocusInput] = useState("")
  const [taskMinutesInput, setTaskMinutesInput] = useState(
    route.params.task_time - Math.floor(route.params.task_time / 60) * 60
  )
  const [isMinutesFocused, setIsMinutesFocused] = useState(false)
  const [taskMinutesFocusInput, setTaskMinutesFocusInput] = useState("")
  const tasks: task[] | undefined = queryClient.getQueryData([
    "tasks",
    route.params.selectedDate,
  ])
  const { data: categories } = useQuery(["categories"], async () => {
    return getOfflineMode.offlineMode
      ? getLocalCategories.categories
      : axios
          .post("/category/get", { user_id: userInfoState.id })
          .then((res) => {
            //console.log(res.data.categories)
            return res.data.categories
          })
          .catch((err) => {
            console.log(err)
            navigation.navigate("Home")
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
        if (route.params.initialTaskName.trim() !== params[0].trim()) {
          //change task name
          if (params[0].trim().length < 2) return
          if (
            tasks != null &&
            tasks
              .filter((task: task) => task.id !== route.params.id)
              .map((task: task) => task.name.toLowerCase())
              .includes(params[0].trim().toLowerCase())
          )
            return

          queryClient.cancelQueries({
            queryKey: ["tasks", route.params.selectedDate],
          })
          queryClient.setQueryData(
            ["tasks", route.params.selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === route.params.id) {
                  prev[index].name = params[0]
                  break
                }
              }
              return prev
            }
          )
        }
        if (route.params.is_done !== params[1]) {
          queryClient.cancelQueries({
            queryKey: ["tasks", route.params.selectedDate],
          })
          queryClient.setQueryData(
            ["tasks", route.params.selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === route.params.id) {
                  prev[index].is_done = params[1]
                  break
                }
              }
              return prev
            }
          )
        }
        if (route.params.category !== params[2]) {
          queryClient.cancelQueries({
            queryKey: ["tasks", route.params.selectedDate],
          })
          queryClient.setQueryData(
            ["tasks", route.params.selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === route.params.id) {
                  prev[index].task_category_name = params[2]
                  break
                }
              }
              return prev
            }
          )
        }
        if (route.params.task_time !== params[3]) {
          queryClient.cancelQueries({
            queryKey: ["tasks", route.params.selectedDate],
          })
          queryClient.setQueryData(
            ["tasks", route.params.selectedDate],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === route.params.id) {
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
        queryClient.refetchQueries(["tasks", route.params.selectedDate])
        queryClient.refetchQueries(["calendar_performance"])
      },
    }
  )

  async function saveLocalChanges(
    taskNameAux: string,
    is_done_aux: number,
    selected_category_aux: string,
    task_time_aux: number
  ) {
    Keyboard.dismiss()
    let localTaskAux: task = {
      id: route.params.id,
      date: route.params.selectedDate,
      is_done: route.params.is_done,
      is_local: true,
      name: route.params.initialTaskName,
      task_category_name: route.params.category,
      task_time: route.params.task_time,
      user_id: userInfoState.id || "",
    }
    if (route.params.is_done !== is_done_aux) {
      localTaskAux.is_done = is_done_aux
    }
    if (route.params.initialTaskName.trim() !== taskNameAux.trim()) {
      if (taskNameAux.trim().length < 2) {
        setLoadingEditTask(false)
        return Alert.alert("Minimum task name size is 2 letters.")
      }
      if (
        tasks != null &&
        tasks
          .filter((task: task) => task.id !== route.params.id)
          .map((task: task) => task.name.toLowerCase())
          .includes(taskNameAux.trim().toLowerCase())
      ) {
        setLoadingEditTask(false)
        return Alert.alert("Task name already exists")
      }
      localTaskAux.name = taskNameAux
    }
    if (route.params.category !== selected_category_aux) {
      localTaskAux.task_category_name = selected_category_aux
    }
    if (task_time_aux !== route.params.task_time) {
      localTaskAux.task_time = task_time_aux
    }
    const data = await getData("local_tasks")
    let localTasks = data != null ? data : []
    localTasks = localTasks.map((task: task) => {
      return task.id === route.params.id ? localTaskAux : task
    })
    try {
      await setLocalTasks(localTasks, route.params.selectedDate)
      queryClient.refetchQueries("tasks")
      setLoadingEditTask(false)
      navigation.navigate("Home")
    } catch (err) {
      console.log(err)
    }
  }

  async function saveTask(
    taskNameAux: string,
    is_done_aux: number,
    selected_category_aux: string,
    task_time_aux: number
  ) {
    Keyboard.dismiss()

    if (route.params.is_done !== is_done_aux) {
      try {
        await axios.post("/task/changedone", {
          task_id: route.params.id,
          is_done: is_done_aux,
        })
      } catch (err) {
        setLoadingEditTask(false)
        console.log(err)
        navigation.navigate("Home")
      }
    }
    if (route.params.initialTaskName.trim() !== taskNameAux.trim()) {
      //change name
      //change task name
      if (taskNameAux.trim().length < 2) {
        setLoadingEditTask(false)
        return Alert.alert("Minimum task name size is 2 letters.")
      }

      if (
        tasks != null &&
        tasks
          .filter((task: task) => task.id !== route.params.id)
          .map((task: task) => task.name.toLowerCase())
          .includes(taskNameAux.trim().toLowerCase())
      ) {
        setLoadingEditTask(false)
        return Alert.alert("Task name already exists")
      }

      try {
        await axios.post("/task/changename", {
          task_id: route.params.id,
          task_name: taskNameAux.trim(),
        })
      } catch (err) {
        setLoadingEditTask(false)
        console.log(err)
        navigation.navigate("Home")
        return
      }
    }

    if (route.params.category !== selected_category_aux) {
      //change category
      try {
        await axios.post("/task/changeCategory", {
          task_id: route.params.id,
          task_category_name: selected_category_aux,
        })
      } catch (err) {
        setLoadingEditTask(false)
        console.log(err)
        navigation.navigate("Home")
      }
    }

    if (task_time_aux !== route.params.task_time) {
      //change time
      try {
        await axios.post("/task/changeTaskTime", {
          task_id: route.params.id,
          task_time: task_time_aux,
        })
      } catch (err) {
        setLoadingEditTask(false)
        console.log(err)
        navigation.navigate("Home")
      }
    }
    setLoadingEditTask(false)
    navigation.navigate("Home")
  }
  const { mutate: mutateDeleteTask } = useMutation(
    async (task_id: string) => await deleteTask(task_id),
    {
      onMutate: (task_id: string) => {
        navigation.navigate("Home")
        queryClient.cancelQueries({
          queryKey: ["tasks", route.params.selectedDate],
        })

        queryClient.setQueryData(
          ["tasks", route.params.selectedDate],
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
        queryClient.refetchQueries(["tasks", route.params.selectedDate])
        queryClient.refetchQueries(["calendar_performance"])
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
      navigation.navigate("Home")
      return
    }
  }

  async function deleteLocalTask(idParam: string) {
    try {
      console.log(idParam)
      const data: task[] | null = await getData("local_tasks")
      let localTasks = data != null ? data : []
      if (localTasks == null) navigation.navigate("Home")
      localTasks = localTasks.filter((task: task) => task.id != idParam)
      await setLocalTasks(localTasks, route.params.selectedDate)
      queryClient.refetchQueries("tasks")
      setLoadingEditTask(false)
      navigation.navigate("Home")
    } catch (err) {
      console.log(err)
    }
  }

  function onEndEditingHours(taskHoursFocus: string): number {
    let time_aux = 0
    if (
      !Number.isInteger(parseInt(taskHoursFocus)) ||
      parseInt(taskHoursFocus) == null ||
      parseInt(taskHoursFocus) <= 0
    ) {
      setTaskHoursInput(0)
      time_aux = taskMinutesInput
    } else if (parseInt(taskHoursFocus) >= 23) {
      setTaskHoursInput(23)
      time_aux = 23 * 60 + taskMinutesInput
    } else {
      time_aux = parseInt(taskHoursFocus) * 60 + taskMinutesInput
      setTaskHoursInput(parseInt(taskHoursFocus))
    }

    setIsHoursFocused(false)
    return time_aux
  }

  function onEndEditingMinutes(taskMinutesFocus: string): number {
    let time_aux = 0
    if (
      !Number.isInteger(parseInt(taskMinutesFocus)) ||
      parseInt(taskMinutesFocus) == null ||
      parseInt(taskMinutesFocus) <= 0
    ) {
      time_aux = taskHoursInput * 60
      setTaskMinutesInput(0)
    } else if (parseInt(taskMinutesFocus) >= 60) {
      setTaskMinutesInput(60)
      time_aux = taskHoursInput * 60 + 60
    } else {
      time_aux = taskHoursInput * 60 + parseInt(taskMinutesFocus)
      setTaskMinutesInput(parseInt(taskMinutesFocus))
    }
    setIsMinutesFocused(false)
    return time_aux
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
          {isOffline ? (
            <View className="absolute top-20 right-10">
              <Feather name={"wifi-off"} color={"red"} size={26} />
            </View>
          ) : null}
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
            <View className="flex-row gap-8 items-center">
              <Text className={`font-semibold text-2xl ${mainColor}`}>
                Task:
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  getOfflineMode.offlineMode
                    ? deleteLocalTask(route.params.id)
                    : mutateDeleteTask(route.params.id)
                }
                className="w-2/12 rounded-full h-6 bg-red-500 justify-center items-center"
                style={{ elevation: 2 }}>
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>

            <View className={`border-b ${secondaryBorderColor} w-10/12 mt-4`}>
              <TextInput
                className={`text-base ${mainColor}`}
                onFocus={() => setOpenDropDownMenu(false)}
                multiline={false}
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
                      onEndEditingHours(taskHoursFocusInput)
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
                      onEndEditingMinutes(taskMinutesFocusInput)
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
                  if (isLoadingEditTask === true) return
                  setLoadingEditTask(true)
                  getOfflineMode.offlineMode
                    ? saveLocalChanges(
                        taskName,
                        is_done_state,
                        selectedCategory,
                        isHoursFocused
                          ? onEndEditingHours(taskHoursFocusInput)
                          : isMinutesFocused
                          ? onEndEditingMinutes(taskMinutesFocusInput)
                          : taskHoursInput * 60 + taskMinutesInput
                      )
                    : mutateSaveChanges([
                        taskName,
                        is_done_state,
                        selectedCategory,
                        isHoursFocused
                          ? onEndEditingHours(taskHoursFocusInput)
                          : isMinutesFocused
                          ? onEndEditingMinutes(taskMinutesFocusInput)
                          : taskHoursInput * 60 + taskMinutesInput,
                      ])
                }}
                className="w-4/12 rounded-full h-12 bg-blue-500 justify-center items-center mb-3"
                style={{ elevation: 2 }}>
                {isLoadingEditTask ? (
                  <ActivityIndicator color={"#FFFFFF"} />
                ) : (
                  <Text className="text-white text-lg">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default EditTaskScreen
