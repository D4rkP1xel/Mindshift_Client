import {
  Text,
  View,
  TextInput,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import Entypo from "react-native-vector-icons/Entypo"
import CustomButton from "../components/Button"
import { useState } from "react"
import axios from "../utils/axiosConfig"
import { useNavigation } from "@react-navigation/native"

type Nav = {
  navigate: (value: string) => void
}

function CreateAccountScreen() {
  let [emailInput, setEmailInput] = useState("")
  let [usernameInput, setUsernameInput] = useState("") //cant have @
  let [passwordInput, setPasswordInput] = useState("")
  const navigation = useNavigation<Nav>()
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
      <View className="mt-6">
        <View className="h-screen justify-center items-center">
          <View className="w-full items-center gap-5 mt-36">
            <View className="mb-6">
              <Image
                className="w-48"
                resizeMode="contain"
                source={require("../../assets/mindshift-full-logo.png")}
              />
            </View>
            <View className="h-10 px-3 border border-black w-9/12 rounded-xl items-center flex flex-row">
              <Entypo name={"mail"} color={"black"} size={20} />
              <TextInput
                className="px-2 w-full"
                value={emailInput}
                placeholder="Email"
                onChangeText={(text) => setEmailInput(text)}
              />
            </View>
            <View className="h-10 px-3 border border-black w-9/12 rounded-xl items-center flex flex-row">
              <FontAwesome name={"user-alt"} color={"black"} size={20} />
              <TextInput
                className="px-2 w-full"
                value={usernameInput}
                placeholder="Username"
                onChangeText={(text) => setUsernameInput(text)}
              />
            </View>
            <View className="h-10 px-3 border border-black w-9/12 rounded-xl items-center flex flex-row">
              <FontAwesome name={"lock"} color={"black"} size={20} />
              <TextInput
                className="px-2 w-full"
                secureTextEntry={true}
                value={passwordInput}
                placeholder="Password"
                onChangeText={(text) => setPasswordInput(text)}
              />
            </View>
            <View className="items-center w-full pt-5">
              <CustomButton
                onPressFunc={async () =>
                  await createAccount(emailInput, usernameInput, passwordInput)
                }
                name="Create Account"
              />
            </View>
          </View>

          <View className="items-center mt-auto mb-20">
            <Text>
              Already created an account?
              <Text
                className="text-blue-500"
                onPress={() => navigation.navigate("Login")}>
                {" "}
                Sign In.
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default CreateAccountScreen
