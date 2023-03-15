import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AntDesign from "react-native-vector-icons/AntDesign"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import axios from "../../utils/axiosConfig"
import {
  useUserInfo,
  useAppStyle,
  useOfflineMode,
  useLocalCategories,
  useLocalTasks,
} from "../../utils/zustandStateManager"
import useAppStyling from "../../utils/hooks/useAppStyling"
import CustomStatusBar from "../../utils/components/StatusBar"
import { getInternetStatus } from "../../utils/hooks/getInternetStatus"
import Feather from "react-native-vector-icons/Feather"
import { useQueryClient } from "react-query"
import { task } from "../../utils/types"
import { useState } from "react"

type Nav = {
  navigate: (value: string) => void
}

function SettingsScreen() {
  const navigation = useNavigation<Nav>()
  const [isSavingTasks, setSavingTasks] = useState(false)
  const setUserInfo = useUserInfo((state) => state.setUserInfo)
  const getAppStyle = useAppStyle((state) => state.appStyle)
  const getOfflineMode = useOfflineMode((state) => state.isOfflineMode)
  const setOfflineMode = useOfflineMode((state) => state.setOfflineMode)
  const getNumberLocalTasks = useLocalTasks(
    (state) => state.getNumberLocalTasks
  )
  const setLocalCategories = useLocalCategories(
    (state) => state.setLocalCategories
  )
  const userInfoState = useUserInfo((state) => state.userInfo)
  const getLocalTasksToSave = useLocalTasks((state) => state.getLocalTasks)
  const removeLocalTask = useLocalTasks((state) => state.removeLocalTask)
  const setAppStyle = useAppStyle((state) => state.setAppStyle)
  const { isOffline } = getInternetStatus()
  const queryClient = useQueryClient()
  const {
    mainColorHash,
    borderColor,
    bgColor,
    mainColor,
    buttonColor,
    buttonRoundness,
  } = useAppStyling()

  async function saveLocalTasks(tasks: task[]) {
    for (let i = 0; i < tasks.length; i++) {
      try {
        await axios.post("/task/add", {
          user_id: tasks[i].user_id,
          task_name: tasks[i].name,
          task_date: tasks[i].date,
          is_done: tasks[i].is_done,
          category_name: tasks[i].task_category_name,
          task_time: tasks[i].task_time,
        })
        //task was uploaded successfully
        await removeLocalTask(tasks[i].date, tasks[i].id)
      } catch (err) {
        console.log(err)
        Alert.alert(
          "Task not uploaded",
          `Task with name '${tasks[i].name}' on ${tasks[i].date} was not uploaded. Check if there's already a task with the same name on the same date.`
        )
      }
    }
  }
  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss()
        }}
        accessible={false}>
        <SafeAreaView className={`${bgColor}`}>
          <CustomStatusBar />
          {isOffline ? (
            <View className="absolute top-10 left-10">
              <Feather name={"wifi-off"} color={"red"} size={26} />
            </View>
          ) : null}

          <View
            className={`mt-6 px-8 h-full pb-14 `}
            pointerEvents={isSavingTasks ? "none" : "auto"}>
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
            <View className="flex-row justify-between items-center mt-12">
              <Text className={`text-xl font-medium ${mainColor}`}>
                Dark Mode
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setAppStyle({ darkMode: !getAppStyle.darkMode })
                }>
                {getAppStyle.darkMode === true ? (
                  <MaterialIcons
                    name={"check-box"}
                    color={mainColorHash}
                    size={32}
                  />
                ) : (
                  <MaterialIcons
                    name={"check-box-outline-blank"}
                    color={mainColorHash}
                    size={32}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center mt-6">
              <Text className={`text-xl font-medium ${mainColor}`}>
                Offline Mode
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={async () => {
                  if (!getOfflineMode.offlineMode) {
                    try {
                      //if goes from online to offline, store the categories in the local categories
                      const categories = queryClient.getQueryData("categories")
                      await setLocalCategories({ categories: categories })
                    } catch (err) {
                      console.log(err)
                      Alert.alert(
                        "Server Error",
                        "Categories might be inconsistent with the real values. Turn off offline mode to assure that the data is consistent."
                      )
                    }
                  }
                  setOfflineMode({ offlineMode: !getOfflineMode.offlineMode })
                }}>
                {getOfflineMode.offlineMode === true ? (
                  <MaterialIcons
                    name={"check-box"}
                    color={mainColorHash}
                    size={32}
                  />
                ) : (
                  <MaterialIcons
                    name={"check-box-outline-blank"}
                    color={mainColorHash}
                    size={32}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center mt-6">
              <Text className={`text-xl font-medium ${mainColor} w-44`}>
                {"Number of Tasks not saved: " +
                  getNumberLocalTasks(userInfoState.id)}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  isSavingTasks ||
                  getNumberLocalTasks(userInfoState.id) === 0 ||
                  getOfflineMode.offlineMode
                    ? true
                    : false
                }
                className={
                  getNumberLocalTasks(userInfoState.id) === 0 ||
                  getOfflineMode.offlineMode
                    ? `py-2 px-4 opacity-70 ${borderColor} ${buttonColor} ${buttonRoundness} flex-row justify-center`
                    : `py-2 px-4 ${borderColor} ${buttonColor} ${buttonRoundness} flex-row justify-center`
                }
                style={{ elevation: 2 }}
                onPress={async () => {
                  setSavingTasks(true)
                  await saveLocalTasks(getLocalTasksToSave(userInfoState.id))
                  setSavingTasks(false)
                  queryClient.refetchQueries("tasks")
                }}>
                {isSavingTasks ? (
                  <ActivityIndicator />
                ) : (
                  <Text className={`text-md ${mainColor} font-medium`}>
                    Save Tasks
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setUserInfo({
                  id: null,
                  name: null,
                  email: null,
                  creation_date: new Date(),
                })
                setOfflineMode({ offlineMode: false })
                navigation.navigate("Login")
              }}
              className={`py-2 px-4 ${borderColor} ${buttonColor} ${buttonRoundness} mt-16 flex-row justify-center`}
              style={{ elevation: 2 }}>
              <Text className={`text-base font-medium ${mainColor}`}>
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default SettingsScreen
