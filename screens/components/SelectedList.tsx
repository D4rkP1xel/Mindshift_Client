import {
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useState } from "react"
import Ionicons from "react-native-vector-icons/AntDesign"
interface props {
  selectedCategory: string
  setSelectedCategory: Function
}
function SelectedList({ selectedCategory, setSelectedCategory }: props) {
  const [isOpenDropDownMenu, setOpenDropDownMenu] = useState<boolean>(false)
  const [isAddCategory, setAddCategory] = useState<boolean>(false)
  const [categoryInput, setCategoryInput] = useState<string>("")
  const data = ["Gym", "Meditation", "Coding", "Guitar", "Music"]

  function handlePress(value: string) {
    setSelectedCategory(value)
    setOpenDropDownMenu(false)
  }
  return (
    <>
      <View className="h-32">
        {!isAddCategory ? (
          <>
            <Text className="font-semibold text-2xl mt-8 mb-4">Category:</Text>
            <View className="flex-row gap-2 w-full items-center justify-between">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOpenDropDownMenu(!isOpenDropDownMenu)}
                className="w-8/12 rounded-lg py-2 px-4 border-2 border-black bg-gray-50 flex-row items-center justify-between"
                style={{ elevation: 2 }}>
                <Text className="text-base font-medium">
                  {selectedCategory === "" ? "None" : selectedCategory}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  color={"black"}
                  size={20}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => null}
                className="rounded-full h-8 bg-black justify-center items-center px-3"
                style={{ elevation: 2 }}>
                <Text
                  className="text-white text-base"
                  onPress={() => {
                    setAddCategory(true)
                    setOpenDropDownMenu(false)
                  }}>
                  Add one
                </Text>
              </TouchableOpacity>
            </View>
            {!isAddCategory && isOpenDropDownMenu ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="z-50 max-h-36 mt-2 w-full border-2 border-black bg-gray-50 overflow-hidden rounded-lg">
                {data.map((value, index) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePress(value)}
                    className="py-2 px-4 border-b border-gray-300 -z-10"
                    key={index}>
                    <Text className="text-base font-medium">{value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between mt-8 mb-4">
              <Text className="font-semibold text-2xl ">Category:</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => null}
                className="rounded-full h-8 bg-black justify-center pl-2 pr-4"
                style={{ elevation: 2 }}>
                <View className="flex-row items-center justify-center gap-1">
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    color={"white"}
                    size={20}
                  />
                  <Text
                    className="text-white text-base"
                    onPress={() => setAddCategory(false)}>
                    Go back
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View className="mt-2 flex-row w-full">
              <View className="border-b w-10/12">
                <TextInput
                  multiline={false}
                  value={categoryInput}
                  onChangeText={(text) => setCategoryInput(text)}></TextInput>
              </View>
              <View className="ml-auto">
                <Ionicons
                  onPress={() => null}
                  name={"plus"}
                  color={"black"}
                  size={24}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </>
  )
}

export default SelectedList
