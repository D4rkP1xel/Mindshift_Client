import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { useState } from "react"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import useUserInfo from "../utils/useUserInfo"
import Octicons from "react-native-vector-icons/Octicons"
import { LineChart } from "react-native-chart-kit"
import axios from "../utils/axiosConfig"
import { useQuery } from "react-query"
interface category {
  id: string | number
  name: string
}
type Nav = {
  navigate: (value: string) => void
}

function PerformanceScreen() {
  const navigation = useNavigation<Nav>()
  const [isOpenDropDownMenu, setOpenDropDownMenu] = useState<boolean>(false)
  const userInfoState = useUserInfo((state) => state.userInfo)
  const { data: categories } = useQuery(["categories"], async () => {
    return axios
      .post("/category/get", { user_id: userInfoState.id })
      .then((res) => {
        //console.log(res.data.categories)
        setSelectedCategory(res.data.categories[0].name)
        return res.data.categories
      })
      .catch((err) => {
        console.log(err)
      })
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  function handlePress(value: string) {
    setSelectedCategory(value)
    setOpenDropDownMenu(false)
  }

  const chartConfig = {
    color: () => `rgba(0, 0, 0, 1)`,
    propsForBackgroundLines: { opacity: 0.2 },
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    strokeWidth: 2,
  }
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 20, 30, 64, 29, 56, 97],
      },
    ],
  }
  return (
    <View className="mt-6">
      <View className="mt-8">
        <View className="flex-row w-full px-8">
          <Text className="text-2xl">Your Performance</Text>
          <View className="h-fit ml-auto">
            <Octicons
              name={"home"}
              color={"black"}
              size={26}
              onPress={() => navigation.navigate("Home")}
            />
          </View>
        </View>
        <View className="mt-12 right-2">
          <LineChart
            data={data}
            width={Dimensions.get("window").width}
            height={220}
            chartConfig={chartConfig}
            withOuterLines={false}
            fromZero={true}
            formatYLabel={(prev) => parseInt(prev).toString()}
          />
        </View>
        <View className="relative">
          <View className="mt-2 mx-auto w-8/12">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setOpenDropDownMenu(!isOpenDropDownMenu)}
              className="rounded-lg py-2 px-4 border-2 border-black bg-gray-50 flex-row items-center justify-between"
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
          </View>
          {isOpenDropDownMenu ? (
            <View className="absolute top-[50px] w-full">
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="z-50 max-h-[170px] mt-2 w-full border-2 border-black bg-gray-50 overflow-hidden rounded-lg">
                {categories != null && categories.length > 0
                  ? categories.map((value: category) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handlePress(value.name)}
                        className="py-2 px-4 border-b border-gray-300"
                        key={value.id}>
                        <Text className="text-base font-medium">
                          {value.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  : null}
              </ScrollView>
            </View>
          ) : null}
        </View>
        <View className="mt-6 px-8">
          <Text className="text-lg">Total hours spent in:</Text>
          <Text className="text-base  mt-2">
            Last 7 days:
            <Text className="font-bold"> 20 hours</Text>
          </Text>
          <Text className="text-base mt-2">
            Last 30 days:
            <Text className="font-bold"> 87 hours</Text>
          </Text>
          <Text className="mt-12 text-xl">
            Total time spent: <Text className="font-bold"> 345 hours</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PerformanceScreen
