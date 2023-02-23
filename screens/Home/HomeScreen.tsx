import { useState, useEffect } from "react"
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import Octicons from "react-native-vector-icons/Octicons"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import Entypo from "react-native-vector-icons/Entypo"
import { useUserInfo } from "../utils/zustandStateManager"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import axios from "../utils/axiosConfig"
import getCustomDate, {
  getDatePrettyFormat,
  getYesterday,
} from "../utils/getCustomDate"
import { useQuery } from "react-query"
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
  navigate: (value: string, params: object | void) => void
  addListener: Function
}

function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [selectedDate, changeSelectedDate] = useState(getCustomDate(new Date()))
  const [shownMonthCalendar, setShownMonthCalendar] = useState(
    selectedDate.slice(0, 7)
  )

  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const userInfoState = useUserInfo((state) => state.userInfo)
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

  const { data: tasks, isLoading: isLoadingTasks } = useQuery(
    ["tasks", selectedDate],
    async () => {
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
    }
  )

  useEffect(() => {
    refetchCalendarPerformance()
  }, [shownMonthCalendar])

  return (
    <>
      <Modal transparent={true} visible={isCalendarOpen}>
        <TouchableWithoutFeedback
          className="h-screen w-screen"
          onPress={() => setCalendarOpen(false)}>
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
        </TouchableWithoutFeedback>
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
          task_time={
            tasks.filter((task: task) => task.id === isEditMenuOpen)[0]
              .task_time
          }
        />
      ) : null}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView>
          <View className="pt-6 px-8 pb-6 ">
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
                  <MaterialIcons
                    name={"settings"}
                    color={"black"}
                    size={26}
                    onPress={() => navigation.navigate("Settings")}
                  />
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

                  <Octicons
                    onPress={() =>
                      navigation.navigate("AddTask", {
                        selectedDate: selectedDate,
                      })
                    }
                    name={"plus"}
                    color={"black"}
                    size={26}
                  />
                </View>
              </View>
            </View>
            {/* <Text className="text-sm text-gray-500">
              {tasks != null
                ? `${tasks.filter((task: task) => task.is_done === 1).length}/${
                    tasks.length
                  }`
                : "0/0"}
            </Text> */}
          </View>

          <ScrollView>
            <View className="mt-4 mb-24 px-8">
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
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default HomeScreen
