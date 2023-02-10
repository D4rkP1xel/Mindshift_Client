import {
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useState } from "react"
import Ionicons from "react-native-vector-icons/AntDesign"
import { useMutation, useQuery } from "react-query"
import useUserInfo from "../utils/useUserInfo"
import axios from "../utils/axiosConfig"
interface props {
  selectedCategory: string
  setSelectedCategory: Function
  queryClient: any
}
interface category {
  id: string | number
  name: string
}
function SelectedList({
  selectedCategory,
  setSelectedCategory,
  queryClient,
}: props) {
  const [isOpenDropDownMenu, setOpenDropDownMenu] = useState<boolean>(false)
  const [isAddCategory, setAddCategory] = useState<boolean>(false)
  const [categoryInput, setCategoryInput] = useState<string>("")
  const userInfoState = useUserInfo((state) => state.userInfo)
  const { data: categories } = useQuery(["categories"], async () => {
    return axios
      .post("/category/get", { user_id: userInfoState.id })
      .then((res) => {
        console.log(res.data.categories)
        return res.data.categories
      })
      .catch((err) => {
        console.log(err)
      })
  })

  function handlePress(value: string) {
    setSelectedCategory(value)
    setOpenDropDownMenu(false)
  }

  const { mutate: mutateAddCategory } = useMutation(
    async (category_name: string) => await addCategory(category_name),
    {
      onMutate: (category_name: string) => {
        if (
          category_name.length < 2 ||
          categories
            .map((category: category) => category.name.toLowerCase())
            .includes(category_name.toLowerCase())
        )
          return
        queryClient.cancelQueries({ queryKey: ["categories"] })
        queryClient.setQueryData(
          ["categories"],
          (prev: category[] | undefined | void) => {
            if (prev == null) return [{ name: category_name, id: null }]
            return [...prev, { name: category_name, id: null }]
          }
        )
      },
    }
  )

  async function addCategory(category_name: string) {
    if (category_name.length < 2)
      return Alert.alert("Category name must have at least 2 letters.")
    if (
      categories
        .map((category: category) => category.name.toLowerCase())
        .includes(category_name.toLowerCase())
    )
      return Alert.alert("Category already exists.")

    try {
      await axios.post("/category/add", {
        user_id: userInfoState.id,
        category_name: category_name,
      })
      setAddCategory(false)
      setCategoryInput("")
      Alert.alert("Category added with success")
    } catch (err) {
      console.log(err)
      Alert.alert("Server Error: cannot add category.")
    }
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
                onPress={() => {
                  setAddCategory(true)
                  setOpenDropDownMenu(false)
                }}
                className="rounded-full h-8 bg-black justify-center items-center px-3"
                style={{ elevation: 2 }}>
                <Text className="text-white text-base">Add one</Text>
              </TouchableOpacity>
            </View>
            {isOpenDropDownMenu ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="z-50 max-h-36 mt-2 w-full border-2 border-black bg-gray-50 overflow-hidden rounded-lg">
                <Text>ywwad</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handlePress("None")}
                  className="py-2 px-4 border-b border-gray-300">
                  <Text className="text-base font-medium">None</Text>
                </TouchableOpacity>
                {categories !== null && categories.length > 0
                  ? [{ name: "None", id: 0 }, ...categories].map(
                      (value: category) => (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handlePress(value.name)}
                          className="py-2 px-4 border-b border-gray-300"
                          key={value.id}>
                          <Text className="text-base font-medium">
                            {value.name}
                          </Text>
                        </TouchableOpacity>
                      )
                    )
                  : null}
              </ScrollView>
            ) : null}
          </>
        ) : (
          //ADD CATEGORY
          <>
            <View className="flex-row items-center justify-between mt-8 mb-4">
              <Text className="font-semibold text-2xl ">Category:</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setAddCategory(false)
                  setCategoryInput("")
                }}
                className="rounded-full h-8 bg-black justify-center pl-2 pr-4"
                style={{ elevation: 2 }}>
                <View className="flex-row items-center justify-center gap-1">
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    color={"white"}
                    size={20}
                  />
                  <Text className="text-white text-base">Go back</Text>
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
                  onPress={() => mutateAddCategory(categoryInput.trim())}
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
