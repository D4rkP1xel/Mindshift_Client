import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AntDesign from "react-native-vector-icons/AntDesign"
import { useNavigation } from "@react-navigation/native"
import useUserInfo from "../utils/useUserInfo"

type Nav = {
  navigate: (value: string) => void
}

function SettingsScreen() {
  const navigation = useNavigation<Nav>()
  const setUserInfo = useUserInfo((state) => state.setUserInfo)
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView>
          <View className="mt-6 px-8 h-full pb-14">
            <View className="flex-row w-full">
              <View className="h-fit ml-auto">
                <AntDesign
                  name={"close"}
                  color={"black"}
                  size={32}
                  onPress={() => navigation.navigate("Home")}
                />
              </View>
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
                navigation.navigate("Login")
              }}
              className="py-2 px-4 border-2 border-black rounded-lg mt-16 bg-gray-50 flex-row justify-center"
              style={{ elevation: 2 }}>
              <Text className="text-base font-medium">Log out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default SettingsScreen
