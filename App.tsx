import { useState } from "react";
import { Text, View, TextInput } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import Button from "./screens/components/Button";
export default function App() {
  let [emailInput, setEmailInput] = useState("");
  let [passwordInput, setPasswordInput] = useState("");
  return (
    <View className="mt-6">
      <View className="h-screen justify-center items-center">
        <View className="w-full items-center gap-5 mt-60">
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
            <Button name="SIGN IN" />
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
  );
}
