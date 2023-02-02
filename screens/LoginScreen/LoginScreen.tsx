import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Text, View, TextInput, Image, Alert } from "react-native"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import CustomButton from "../components/Button"
import axios from "../utils/axiosConfig"

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

  async function signIn(username: string, password: string) {
    try {
      let response = await axios.post<loginResponse>("/user/login", {
        username: username.includes("@") ? null : username,
        email: username.includes("@") ? username : null,
        password: password,
      })
      if (response.data.message === "User logged with success") {
        navigation.navigate("Home")
      } else {
        Alert.alert("Username and/or Password are wrong.")
      }
    } catch (err) {
      console.log(err)
    }
  }
  return (
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
            <FontAwesome name={"user-alt"} color={"black"} size={20} />
            <TextInput
              className="px-2"
              value={emailInput}
              placeholder="Username/Email"
              onChangeText={(text) => setEmailInput(text)}
            />
          </View>
          <View className="h-10 px-3 border border-black w-9/12 rounded-xl items-center flex flex-row">
            <FontAwesome name={"lock"} color={"black"} size={20} />
            <TextInput
              className="px-2"
              secureTextEntry={true}
              value={passwordInput}
              placeholder="Password"
              onChangeText={(text) => setPasswordInput(text)}
            />
          </View>
          <View className="items-center w-full pt-5">
            <CustomButton
              onPressFunc={async () => await signIn(emailInput, passwordInput)}
              name="SIGN IN"
            />
          </View>
        </View>

        <View className="items-center mt-auto mb-20">
          <Text>
            Don't have an account?
            <Text className="text-blue-500"> Create an account.</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

export default LoginScreen
