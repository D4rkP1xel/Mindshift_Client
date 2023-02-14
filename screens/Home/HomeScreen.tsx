import { useState, useEffect } from "react"
import {
  View,
  Text,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/AntDesign"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import AntDesign from "react-native-vector-icons/AntDesign"
import Entypo from "react-native-vector-icons/Entypo"
import useUserInfo from "../utils/useUserInfo"
import axios from "../utils/axiosConfig"
import getCustomDate, {
  getDatePrettyFormat,
  getYesterday,
} from "../utils/getCustomDate"
import { useMutation, useQuery, useQueryClient } from "react-query"
import Task from "../components/Task"
import EditTaskMenu from "../components/EditTaskMenu"
import { Calendar } from "react-native-calendars"
import { EditMenuContext } from "../utils/context"
interface task {
  id: string
  name: string
  date: string | number
  user_id: string
  is_done: number
  task_category_name: string
}
type Nav = {
  navigate: (value: string) => void
}

function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [isTaskTimeModal, setTaskTimeModal] = useState("no_id")
  const [toDoInput, addToDoInput] = useState("")
  const [taskHoursInput, setTaskHoursInput] = useState(0)
  const [taskMinutesInput, setTaskMinutesInput] = useState(0)
  const [selectedDate, changeSelectedDate] = useState(getCustomDate(new Date()))
  const [shownMonthCalendar, setShownMonthCalendar] = useState(
    selectedDate.slice(0, 7)
  )
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const userInfoState = useUserInfo((state) => state.userInfo)
  const queryClient = useQueryClient()
  const [isEditMenuOpen, setEditMenuOpen] = useState<string>("") //either stores an empty string or the id of the task
  const { data: calendarPerformance, refetch: refetchCalendarPerformance } =
    useQuery(["calendar_performance"], async () => {
      return axios
        .post("/task/getMonthPerformance", {
          user_id: userInfoState.id,
          date: shownMonthCalendar,
        })
        .then((res) => {
          //console.log(res.data.data, shownMonthCalendar)
          return res.data.data
        })
        .catch((err) => {
          console.log(err)
        })
    })

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useQuery(["tasks", selectedDate], async () => {
    return axios
      .post("/task/get", {
        user_id: userInfoState.id,
        date: selectedDate,
      })
      .then((res) => {
        //console.log(res.data.tasks)
        return res.data.tasks
      })
      .catch((err) => {
        console.log(err)
      })
  })

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
        queryClient.cancelQueries({ queryKey: ["tasks", selectedDate] })
        queryClient.setQueryData(["tasks", selectedDate], (prev: any) => {
          return prev == null
            ? [
                {
                  name: newTaskName,
                  id: "0",
                  is_done: -1,
                  task_category_name: "",
                },
              ]
            : [
                ...prev,
                {
                  name: newTaskName,
                  id: "0",
                  is_done: -1,
                  task_category_name: "",
                },
              ]
        })
      },
      onSuccess: () => {
        refetchTasks()
        refetchCalendarPerformance()
      },
      onError: () => {
        queryClient.setQueryData(["tasks", selectedDate], (prev: any) =>
          prev.slice(0, prev.length - 1)
        )
        setEditMenuOpen("")
      },
    }
  )
  useEffect(() => {
    refetchCalendarPerformance()
  }, [shownMonthCalendar])

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
      <Modal transparent={true} visible={isTaskTimeModal !== "no_id"}>
        <View
          className="h-screen w-screen z-40"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}>
          <View className="mt-32 w-10/12 bg-white mx-auto px-8 pt-8 pb-5">
            <View className="flex-row gap-2 items-center mb-8">
              <AntDesign name={"clockcircleo"} color={"black"} size={28} />
              <Text className="text-lg">Time spent on this task:</Text>
            </View>
            <View className="flex-row items-center justify-evenly">
              <View className="flex-row items-center gap-2">
                <View className="border border-black rounded-md w-8">
                  <TextInput
                    keyboardType="number-pad"
                    className="text-base w-full"
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
                <Text className="text-base">hours</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="border border-black rounded-md w-8">
                  <TextInput
                    keyboardType="numeric"
                    className="text-base w-full"
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
                <Text className="text-base">minutes</Text>
              </View>
            </View>
            <View className="w-full flex-row justify-end mt-6">
              <TouchableOpacity
                style={{ elevation: 2 }}
                activeOpacity={0.7}
                className="rounded-full h-8 bg-blue-500 w-4/12 justify-center items-center"
                onPress={async () => {
                  if (taskHoursInput !== 0 || taskMinutesInput !== 0) {
                    try {
                      await axios.post("/task/changeTaskTime", {
                        task_id: isTaskTimeModal,
                        task_time: taskHoursInput * 60 + taskMinutesInput,
                      })
                      //Alert.alert("success")
                    } catch (err) {
                      console.log(err)
                      Alert.alert("Server Error")
                    }
                  }
                  setTaskTimeModal("no_id")
                }}>
                <Text className="text-white text-base">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={isCalendarOpen}>
        <View
          className="h-screen w-screen"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}>
          <View className="mt-32">
            <Calendar
              disableAllTouchEventsForDisabledDays={true}
              minDate={getCustomDate(new Date(userInfoState.creation_date))}
              initialDate={selectedDate}
              maxDate={getCustomDate(new Date())}
              onDayPress={(date) => {
                changeSelectedDate(date.dateString)
                setCalendarOpen(false)
              }}
              onMonthChange={(date) => {
                setShownMonthCalendar(
                  `${date.year}-${date.month.toString().padStart(2, "0")}`
                )
              }}
              markedDates={
                calendarPerformance != null ? calendarPerformance : null
              }
              hideExtraDays={true}
            />
          </View>
        </View>
      </Modal>
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
          selectedDate={selectedDate}
          refetchCalendarPerformance={refetchCalendarPerformance}
          setTaskTimeModal={setTaskTimeModal}
        />
      ) : null}

      <View className="mt-6">
        <View className="mt-8 px-8">
          <View className="flex-row w-full">
            <Text className="text-2xl">
              {selectedDate === getCustomDate(new Date())
                ? "Today"
                : selectedDate === getYesterday()
                ? "Yesterday"
                : getDatePrettyFormat(selectedDate)}
            </Text>
            <View className="h-fit ml-auto">
              <View className="flex-row gap-6 items-center">
                <Entypo
                  name={"line-graph"}
                  color={"black"}
                  size={26}
                  onPress={() => navigation.navigate("Performance")}
                />
                <FontAwesome
                  name={"calendar"}
                  color={"black"}
                  size={26}
                  onPress={() => setCalendarOpen(true)}
                />
              </View>
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
