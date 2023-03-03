import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AntDesign from "react-native-vector-icons/AntDesign"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import { useUserInfo, useAppStyle } from "../../utils/zustandStateManager"
import useAppStyling from "../../utils/hooks/useAppStyling"
import CustomStatusBar from "../../utils/components/StatusBar"
import { getInternetStatus } from "../../utils/hooks/getInternetStatus"
import Feather from "react-native-vector-icons/Feather"
type Nav = {
  navigate: (value: string) => void
}

function SettingsScreen() {
  const navigation = useNavigation<Nav>()
  const setUserInfo = useUserInfo((state) => state.setUserInfo)
  const getAppStyle = useAppStyle((state) => state.appStyle)
  const setAppStyle = useAppStyle((state) => state.setAppStyle)
  const { isOffline } = getInternetStatus()
  const {
    mainColorHash,
    borderColor,
    bgColor,
    mainColor,
    buttonColor,
    buttonRoundness,
  } = useAppStyling()
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

          <View className={`mt-6 px-8 h-full pb-14 `}>
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
