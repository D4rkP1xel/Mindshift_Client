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
import { SafeAreaView } from "react-native-safe-area-context"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import Entypo from "react-native-vector-icons/Entypo"
import CustomButton from "../components/Button"
import { useState } from "react"
import axios from "../utils/axiosConfig"
import { useNavigation } from "@react-navigation/native"
import useAppStyling from "../utils/useAppStyling"
import CustomStatusBar from "../components/StatusBar"

type Nav = {
  navigate: (value: string) => void
}

function CreateAccountScreen() {
  let [emailInput, setEmailInput] = useState("")
  let [usernameInput, setUsernameInput] = useState("") //cant have @
  let [passwordInput, setPasswordInput] = useState("")
  const navigation = useNavigation<Nav>()
  const {
    fullLogoPath,
    mainColor,
    mainColorHash,
    bgColor,
    buttonRoundness,
    secondaryBorderColor,
  } = useAppStyling()
  async function createAccount(
    emailInputParam: string,
    usernameInputParam: string,
    passwordInputParam: string
  ) {
    if (usernameInputParam.includes("@"))
      return Alert.alert("Username can't have @")
    if (passwordInputParam.length < 3)
      return Alert.alert("Password must be >=3 characters")
    try {
      await axios.post("/user/add", {
        username: usernameInputParam,
        password: passwordInputParam,
        email: emailInputParam,
      })
      Alert.alert("Account created with success.")
      navigation.navigate("Login")
    } catch (err) {
      console.log(err)
      Alert.alert("Server Error. Try again later.")
    }
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className={`${bgColor} h-screen`}>
        <CustomStatusBar />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
          className="justify-center items-center mt-36">
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
              <Entypo name={"mail"} color={mainColorHash} size={20} />
              <TextInput
                className={`px-2 w-full ${mainColor}`}
                value={emailInput}
                placeholderTextColor={mainColorHash}
                placeholder="Email"
                onChangeText={(text) => setEmailInput(text)}
              />
            </View>
            <View
              className={`h-10 px-3 border ${secondaryBorderColor} w-9/12 ${buttonRoundness} items-center flex flex-row`}>
              <FontAwesome name={"user-alt"} color={mainColorHash} size={20} />
              <TextInput
                className={`px-2 w-full ${mainColor}`}
                value={usernameInput}
                placeholderTextColor={mainColorHash}
                placeholder="Username"
                onChangeText={(text) => setUsernameInput(text)}
              />
            </View>
            <View
              className={`h-10 px-3 border ${secondaryBorderColor} w-9/12 ${buttonRoundness} items-center flex flex-row`}>
              <FontAwesome name={"lock"} color={mainColorHash} size={20} />
              <TextInput
                className={`px-2 w-full ${mainColor}`}
                secureTextEntry={true}
                value={passwordInput}
                placeholder="Password"
                placeholderTextColor={mainColorHash}
                onChangeText={(text) => setPasswordInput(text)}
              />
            </View>
            <View className="items-center w-full pt-5">
              <CustomButton
                onPressFunc={async () => {
                  Keyboard.dismiss()
                  await createAccount(emailInput, usernameInput, passwordInput)
                }}
                name="Create Account"
              />
            </View>
          </View>

          <View className="items-center mb-20">
            <Text className={`${mainColor}`}>
              Already created an account?
              <Text
                className="text-blue-500"
                onPress={() => navigation.navigate("Login")}>
                {" "}
                Sign In.
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default CreateAccountScreen
