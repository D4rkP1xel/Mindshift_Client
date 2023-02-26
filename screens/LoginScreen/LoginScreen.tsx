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
import CustomButton from "../components/Button"
import axios from "../utils/axiosConfig"
import { useAppStyle, useUserInfo } from "../utils/zustandStateManager"
import { SafeAreaView } from "react-native-safe-area-context"
import useAppStyling from "../utils/useAppStyling"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
  const navigation = useNavigation<Nav>()
  const setUserInfo = useUserInfo((state) => state.setUserInfo)
  const userInfoState = useUserInfo((state) => state.userInfo)
  const setDarkModeState = useAppStyle((state) => state.setAppStyle)
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
        const jsonValue = await AsyncStorage.getItem("user_info")
        return jsonValue != null && JSON.parse(jsonValue).id != null
          ? navigation.navigate("Home")
          : null
      } catch (e) {
        console.error("Async Store Failed")
      }
    }
    getData()
  }, [userInfoState])

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className={`${bgColor} h-screen`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
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
