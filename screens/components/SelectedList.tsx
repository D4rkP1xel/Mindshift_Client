import {
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useState } from "react"
import AntDesign from "react-native-vector-icons/AntDesign"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { useMutation } from "react-query"
import { useUserInfo } from "../utils/zustandStateManager"
import axios from "../utils/axiosConfig"
import useAppStyling from "../utils/useAppStyling"
interface props {
  selectedCategory: string
  setSelectedCategory: Function
  queryClient: any
  categories: category[] | null | undefined
  isOpenDropDownMenu: boolean
  setOpenDropDownMenu: Function
}
interface category {
  id: string | number
  name: string
}
function SelectedList({
  selectedCategory,
  setSelectedCategory,
  queryClient,
  categories,
  isOpenDropDownMenu,
  setOpenDropDownMenu,
}: props) {
  const [isAddCategory, setAddCategory] = useState<boolean>(false)
  const [categoryInput, setCategoryInput] = useState<string>("")
  const userInfoState = useUserInfo((state) => state.userInfo)
  const [isLoadingNewCategory, setLoadingNewCategory] = useState(false)
  const {
    mainColor,
    mainColorHash,
    buttonRoundness,
    buttonColor,
    borderColor,
    secondaryBorderColor,
    dropDownMenuBorderColor,
  } = useAppStyling()
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
          (categories != null &&
            categories
              .map((category: category) => category.name.toLowerCase())
              .includes(category_name.toLowerCase()))
        )
          return
        queryClient.cancelQueries({ queryKey: ["categories"] })
        queryClient.setQueryData(
          ["categories"],
          (prev: category[] | undefined | void) => {
            if (prev == null)
              return [
                {
                  name: category_name,
                  id: Math.round(Math.random() * 10000).toString(),
                },
              ]
            return [
              ...prev,
              {
                name: category_name,
                id: Math.round(Math.random() * 10000).toString(),
              },
            ]
          }
        )
      },
    }
  )

  async function addCategory(category_name: string) {
    if (category_name.length < 2) {
      setLoadingNewCategory(false)
      return Alert.alert("Category name must have at least 2 letters.")
    }

    if (
      categories != null &&
      categories
        .map((category: category) => category.name.toLowerCase())
        .includes(category_name.toLowerCase())
    ) {
      setLoadingNewCategory(false)
      return Alert.alert("Category already exists.")
    }

    try {
      await axios.post("/category/add", {
        user_id: userInfoState.id,
        category_name: category_name,
      })
      setLoadingNewCategory(false)
      setAddCategory(false)
      setCategoryInput("")
    } catch (err) {
      setLoadingNewCategory(false)
      console.log(err)
      Alert.alert("Server Error: cannot add category.")
    }
  }

  const { mutate: mutateRemoveCategory } = useMutation(
    async (category_name: string) => await removeCategory(category_name),
    {
      onMutate: (category_name: string) => {
        if (
          categories == null ||
          !categories
            .map((category: category) => category.name.toLowerCase())
            .includes(category_name.toLowerCase())
        )
          return
        queryClient.cancelQueries({ queryKey: ["categories"] })
        queryClient.setQueryData(
          ["categories"],
          (prev: category[] | undefined | void) => {
            if (prev == null) return prev
            return [
              ...categories.filter(
                (category) =>
                  category.name.toLowerCase() !== category_name.toLowerCase()
              ),
            ]
          }
        )
      },
    }
  )

  async function removeCategory(category_name: string) {
    if (
      categories == null ||
      !categories
        .map((category: category) => category.name.toLowerCase())
        .includes(category_name.toLowerCase())
    )
      return

    try {
      await axios.post("/category/remove", {
        user_id: userInfoState.id,
        category_name: category_name,
      })
    } catch (err) {
      console.log(err)
      Alert.alert("Server Error: cannot remove category.")
    }
  }
  return (
    <>
      <View className="h-32">
        {!isAddCategory ? (
          <>
            <Text className={`font-semibold text-2xl mt-8 mb-4 ${mainColor}`}>
              Category:
            </Text>
            <View className="flex-row gap-2 w-full items-center justify-between">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setOpenDropDownMenu(!isOpenDropDownMenu)
                  Keyboard.dismiss()
                }}
                className={`w-8/12 ${buttonRoundness} py-2 px-4 ${borderColor} ${buttonColor} flex-row items-center justify-between`}
                style={{ elevation: 2 }}>
                <Text className={`text-base font-medium ${mainColor}`}>
                  {selectedCategory === "" ? "None" : selectedCategory}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  color={mainColorHash}
                  size={20}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Keyboard.dismiss()
                  setAddCategory(true)
                  setOpenDropDownMenu(false)
                }}
                className="rounded-full h-8 bg-black justify-center items-center px-3"
                style={{ elevation: 2 }}>
                <Text className="text-white text-base">Add one</Text>
              </TouchableOpacity>
            </View>

            {isOpenDropDownMenu ? (
              <View>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className={`z-50 max-h-36 mt-2 w-full ${borderColor} ${buttonColor} overflow-hidden rounded-lg`}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePress("None")}
                    className={`py-2 px-4 border-b ${dropDownMenuBorderColor}`}>
                    <Text className={`text-base font-medium ${mainColor}`}>
                      None
                    </Text>
                  </TouchableOpacity>
                  {categories != null && categories.length > 0
                    ? categories.map((value: category) => (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handlePress(value.name)}
                          className={`py-2 px-4 border-b ${dropDownMenuBorderColor} flex-row justify-between items-center`}
                          key={value.id}>
                          <Text
                            className={`text-base font-medium ${mainColor}`}>
                            {value.name}
                          </Text>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            className="pl-12 py-1"
                            onPress={() =>
                              Alert.alert(
                                "Delete Category",
                                "Are you sure you want to delete '" +
                                  value.name +
                                  "' ?",
                                [
                                  {
                                    text: "Cancel",
                                    style: "cancel",
                                  },
                                  {
                                    text: "Confirm",

                                    style: "default",
                                    onPress: async () => {
                                      mutateRemoveCategory(value.name)
                                    },
                                  },
                                ],
                                {
                                  cancelable: true,
                                }
                              )
                            }>
                            <FontAwesome5
                              name={"trash"}
                              color={"#fafafa50"}
                              size={16}
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))
                    : null}
                </ScrollView>
              </View>
            ) : null}
          </>
        ) : (
          //ADD CATEGORY
          <>
            <View className="flex-row items-center justify-between mt-8 mb-4">
              <Text className={`font-semibold text-2xl ${mainColor}`}>
                Category:
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Keyboard.dismiss()
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
              <View className={`border-b ${secondaryBorderColor} w-10/12`}>
                <TextInput
                  className={`${mainColor}`}
                  multiline={false}
                  value={categoryInput}
                  onChangeText={(text) => setCategoryInput(text)}></TextInput>
              </View>
              <View className="ml-auto">
                {isLoadingNewCategory ? (
                  <ActivityIndicator />
                ) : (
                  <AntDesign
                    onPress={() => {
                      if (isLoadingNewCategory) return
                      setLoadingNewCategory(true)
                      Keyboard.dismiss()
                      mutateAddCategory(categoryInput.trim())
                    }}
                    name={"plus"}
                    color={mainColorHash}
                    size={24}
                  />
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </>
  )
}

export default SelectedList
