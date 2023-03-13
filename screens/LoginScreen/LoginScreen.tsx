import { useNavigation } from "@react-navigation/native"
import { useState, useEffect } from "react"
import {
  Text,
  View,
  TextInput,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import CustomButton from "../../utils/components/Button"
import axios from "../../utils/axiosConfig"
import {
  useAppStyle,
  useLocalCategories,
  useLocalTasks,
  useOfflineMode,
  useUserInfo,
} from "../../utils/zustandStateManager"
import { SafeAreaView } from "react-native-safe-area-context"
import useAppStyling from "../../utils/hooks/useAppStyling"
import AsyncStorage from "@react-native-async-storage/async-storage"
import CustomStatusBar from "../../utils/components/StatusBar"
import { getInternetStatus } from "../../utils/hooks/getInternetStatus"
import Feather from "react-native-vector-icons/Feather"
type Nav = {
  navigate: (value: string) => void
}

interface loginResponse {
  message: string | undefined
  user_data:
    | { id: string; email: string; name: string; creation_date: number }
    | undefined
  error: string | undefined
}

function LoginScreen() {
  let [emailInput, setEmailInput] = useState("")
  let [passwordInput, setPasswordInput] = useState("")
  const { isOffline } = getInternetStatus()
  const navigation = useNavigation<Nav>()
  const setUserInfo = useUserInfo((state) => state.setUserInfo)
  const setOfflineMode = useOfflineMode((state) => state.setOfflineMode)
  const setDarkModeState = useAppStyle((state) => state.setAppStyle)
  const setLocalTasks = useLocalTasks((state) => state.setLocalTasks)
  const setLocalCategories = useLocalCategories(
    (state) => state.setLocalCategories
  )
  const {
    fullLogoPath,
    mainColor,
    mainColorHash,
    bgColor,
    buttonRoundness,
    secondaryBorderColor,
  } = useAppStyling()
  // useEffect(() => {
  //   if (userInfoState.id !== undefined && userInfoState.id !== null) {
  //     navigation.navigate("Home")
  //   }
  // }, [userInfoState])
  useEffect(() => {
    const getData = async () => {
      try {
        const isDarkModeValue = await AsyncStorage.getItem("app_style")
        isDarkModeValue != null && JSON.parse(isDarkModeValue).darkMode != null
          ? setDarkModeState(JSON.parse(isDarkModeValue))
          : null
        const offlineModeValue = await AsyncStorage.getItem("offline_mode")
        if (
          offlineModeValue != null &&
          JSON.parse(offlineModeValue).offlineMode != null
        ) {
          setOfflineMode(JSON.parse(offlineModeValue))
          const localTasksValue = await AsyncStorage.getItem("local_tasks")
          if (localTasksValue != null && JSON.parse(localTasksValue) != null) {
            setLocalTasks(JSON.parse(localTasksValue))
          }
          const localCategories = await AsyncStorage.getItem("local_categories")
          if (localCategories != null && JSON.parse(localCategories) != null) {
            setLocalCategories(JSON.parse(localCategories))
          }
        }
        const userInfoValue = await AsyncStorage.getItem("user_info")
        if (userInfoValue != null && JSON.parse(userInfoValue).id != null) {
          setUserInfo(JSON.parse(userInfoValue))
          navigation.navigate("Home")
        }
        return
      } catch (e) {
        console.error("Async Store Failed")
      }
    }
    getData()
  }, [])

  async function signIn(input: string, password: string) {
    let requestBody = input.includes("@")
      ? { email: input, password: password }
      : { username: input, password: password }
    try {
      let response = await axios.post<loginResponse>("/user/login", requestBody)
      if (response.data.message === "User logged with success") {
        setUserInfo({ ...response.data.user_data })
        setEmailInput("")
        setPasswordInput("")
        navigation.navigate("Home")
      } else if (response.data.message === "User doesnt exist") {
        Alert.alert("Username/Email is not registered")
        setEmailInput("")
        setPasswordInput("")
      } else if (response.data.message === "Wrong password") {
        Alert.alert("Wrong Password")
        setPasswordInput("")
      } else {
        Alert.alert("Unknown Error, try again")
      }
    } catch (err) {
      console.log(err)
      Alert.alert("Server Error")
    }
  }
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss()
      }}
      accessible={false}>
      <SafeAreaView className={`${bgColor} h-screen`}>
        <CustomStatusBar />
        {isOffline ? (
          <View className="absolute top-20 right-10">
            <Feather name={"wifi-off"} color={"red"} size={26} />
          </View>
        ) : null}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
          className="justify-center items-center mt-44">
          <View className="w-full items-center gap-5 mb-6">
            <View className="mb-2">
              <Image
                className="w-48"
                resizeMode="contain"
                source={fullLogoPath}
              />
            </View>
            <View
              className={`h-10 px-3 border ${secondaryBorderColor} w-9/12 ${buttonRoundness} items-center flex flex-row`}>
              <FontAwesome name={"user-alt"} color={mainColorHash} size={20} />
              <TextInput
                className={`px-2 w-full ${mainColor}`}
                placeholderTextColor={mainColorHash}
                value={emailInput}
                placeholder="Username/Email"
                onChangeText={(text) => setEmailInput(text)}
              />
            </View>
            <View
              className={`h-10 px-3 border ${secondaryBorderColor} w-9/12 ${buttonRoundness} items-center flex flex-row`}>
              <FontAwesome name={"lock"} color={mainColorHash} size={20} />
              <TextInput
                className={`px-2 w-full ${mainColor}`}
                secureTextEntry={true}
                placeholderTextColor={mainColorHash}
                value={passwordInput}
                placeholder="Password"
                onChangeText={(text) => setPasswordInput(text)}
              />
            </View>
            <View className="items-center w-full pt-5">
              <CustomButton
                onPressFunc={async () => {
                  Keyboard.dismiss()
                  await signIn(emailInput, passwordInput)
                }}
                name="Sign In"
              />
            </View>
          </View>

          <View className={`items-center mb-20`}>
            <Text className={`${mainColor}`}>
              Don't have an account?
              <Text
                className="text-blue-500"
                onPress={() => navigation.navigate("CreateAccount")}>
                {" "}
                Create an account.
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default LoginScreen
