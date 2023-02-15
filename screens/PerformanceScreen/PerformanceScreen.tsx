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
  const [performanceType, setPerformanceType] = useState("monthly")
  const userInfoState = useUserInfo((state) => state.userInfo)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
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
  const { data: performance } = useQuery(
    ["performance", [selectedCategory, performanceType]],
    async () => {
      return axios
        .post("/category/getPerformance", {
          user_id: userInfoState.id,
          category_name: selectedCategory,
          type: performanceType,
        })
        .then((res) => {
          //console.log(res.data.categories)
          if (performanceType === "monthly") {
            let dates: string[] = []
            const currentDate = [
              new Date().getUTCFullYear(),
              new Date().getUTCMonth() + 1,
            ]
            for (let i = 12; i >= 0; i--) {
              if (currentDate[1] - i < 1) {
                dates.push(
                  `${currentDate[0] - 1}-${(12 - (i - currentDate[1]))
                    .toString()
                    .padStart(2, "0")}`
                )
              } else {
                dates.push(
                  `${currentDate[0]}-${(currentDate[1] - i)
                    .toString()
                    .padStart(2, "0")}`
                )
              }
            }
            //console.log(dates)

            return dates.map((month: string) => {
              let auxPerformance = res.data.tasks.filter(
                (monthPerformance: { date: string; total_time: number }) =>
                  monthPerformance.date === month
              )
              if (auxPerformance.length === 0) {
                return { date: month, total_time: 0 }
              }
              return {
                date: month,
                total_time:
                  auxPerformance[0].total_time !== 0
                    ? auxPerformance[0].total_time / 60
                    : 0,
              }
            })
          }
          return res.data.tasks
        })
        .catch((err) => {
          console.log(err)
        })
    },
    {
      enabled:
        selectedCategory != null &&
        selectedCategory !== "" &&
        performanceType != null,
    }
  )
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
  const months = [
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
  ]
  let data =
    performance != null && Array.isArray(performance) && performance.length > 0
      ? {
          labels: [
            ...performance.map(
              (monthPerformance: { date: string; total_time: number }) => {
                return months[parseInt(monthPerformance.date.slice(5)) - 1]
              }
            ),
          ],
          datasets: [
            {
              data: [
                ...performance.map(
                  (monthPerformance: { date: string; total_time: number }) => {
                    return monthPerformance.total_time
                  }
                ),
              ],
            },
          ],
        }
      : {
          labels: [...months],
          datasets: [
            {
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
            formatYLabel={(prev) =>
              (Math.round(parseFloat(prev) * 10) / 10).toString() + "h"
            }
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
