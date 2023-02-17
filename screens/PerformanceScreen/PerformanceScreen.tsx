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
  const [performanceType, setPerformanceType] = useState("daily")
  const [isOpenPerformanceMenu, setOpenPerformanceMenu] =
    useState<boolean>(false)
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

  const { data: performanceStats } = useQuery(
    ["performance_stats", selectedCategory],
    async () => {
      return axios
        .post("/category/getPerformanceStats", {
          user_id: userInfoState.id,
          category_name: selectedCategory,
        })
        .then((res) => {
          return res.data.data[0]
        })
        .catch((err) => {
          console.log(err)
        })
    },
    { enabled: selectedCategory != null && selectedCategory !== "" }
  )
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
          if (performanceType === "weekly") {
            function getMonday(d: Date) {
              d = new Date(d)
              var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6 : 1)
              let aux = new Date(d.setDate(diff))
              return `${aux.getFullYear()}-${(aux.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${aux.getDate().toString().padStart(2, "0")}`
            }
            const now = new Date()
            let dates = []
            for (let i = 9; i >= 0; i--) {
              dates.push(
                getMonday(
                  new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - 7 * i
                  )
                )
              )
            }

            return dates.map((date) => {
              let auxPerformance = res.data.tasks.filter(
                (weeklyPerformance: { date: string; total_time: number }) =>
                  weeklyPerformance.date.slice(0, 10) === date
              )
              if (auxPerformance.length === 0) {
                return { date: date, total_time: 0 }
              }
              return {
                date: date,
                total_time:
                  auxPerformance[0].total_time !== 0
                    ? auxPerformance[0].total_time / 60
                    : 0,
              }
            })
          } //daily
          let dates = []
          for (let i = 7; i >= 0; i--) {
            let dateAux = new Date()
            dateAux.setDate(dateAux.getDate() - i)
            dates.push(
              `${dateAux.getFullYear()}-${(dateAux.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${dateAux
                .getDate()
                .toString()
                .padStart(2, "0")}`
            )
          }

          return dates.map((date) => {
            let auxPerformance = res.data.tasks.filter(
              (dailyPerformance: { date: string; total_time: number }) =>
                dailyPerformance.date.slice(0, 10) === date
            )
            if (auxPerformance.length === 0) {
              return { date: date, total_time: 0 }
            }
            return {
              date: date,
              total_time:
                auxPerformance[0].total_time !== 0
                  ? auxPerformance[0].total_time / 60
                  : 0,
            }
          })
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
  const daysWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  let data =
    performance != null && Array.isArray(performance) && performance.length > 0
      ? performanceType === "monthly"
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
                    (monthPerformance: {
                      date: string
                      total_time: number
                    }) => {
                      return monthPerformance.total_time
                    }
                  ),
                ],
              },
            ],
          }
        : performanceType === "weekly"
        ? {
            labels: [
              ...performance.map(
                (weeklyPerformance: { date: string; total_time: number }) => {
                  return (
                    months[parseInt(weeklyPerformance.date.slice(5, 7)) - 1] +
                    " " +
                    weeklyPerformance.date.slice(8, 10)
                  )
                }
              ),
            ],
            datasets: [
              {
                data: [
                  ...performance.map(
                    (weeklyPerformance: {
                      date: string
                      total_time: number
                    }) => {
                      return weeklyPerformance.total_time
                    }
                  ),
                ],
              },
            ],
          }
        : performanceType === "daily"
        ? {
            labels: [
              ...performance.map(
                (weeklyPerformance: { date: string; total_time: number }) => {
                  return daysWeek[new Date(weeklyPerformance.date).getDay()]
                }
              ),
            ],
            datasets: [
              {
                data: [
                  ...performance.map(
                    (weeklyPerformance: {
                      date: string
                      total_time: number
                    }) => {
                      return weeklyPerformance.total_time
                    }
                  ),
                ],
              },
            ],
          }
        : {
            labels: [""],
            datasets: [
              {
                data: [0],
              },
            ],
          }
      : {
          labels: [""],
          datasets: [
            {
              data: [0],
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
            height={240}
            chartConfig={chartConfig}
            withOuterLines={false}
            fromZero={true}
            formatYLabel={(prev) =>
              (Math.round(parseFloat(prev) * 10) / 10).toString() + "h"
            }
            xLabelsOffset={performanceType === "weekly" ? 20 : 14}
            verticalLabelRotation={-90}
          />
        </View>
        <View className="relative">
          <View className="mt-4 flex-row justify-evenly w-full">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setOpenDropDownMenu(!isOpenDropDownMenu)
                setOpenPerformanceMenu(false)
              }}
              className="w-6/12 rounded-lg py-2 px-4 border-2 border-black bg-gray-50 flex-row items-center justify-between"
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
                setOpenPerformanceMenu(!isOpenPerformanceMenu)
                setOpenDropDownMenu(false)
              }}
              className="w-4/12 rounded-lg py-2 px-4 border-2 border-black bg-gray-50 flex-row items-center justify-between"
              style={{ elevation: 2 }}>
              <Text className="text-base font-medium">
                {performanceType.charAt(0).toUpperCase() +
                  performanceType.slice(1)}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                color={"black"}
                size={20}
              />
            </TouchableOpacity>
          </View>
          {isOpenDropDownMenu ? (
            <View className="absolute top-[58px] w-full">
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
          {isOpenPerformanceMenu ? (
            <View className="absolute top-[58px] w-full">
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="z-50 max-h-[170px] mt-2 w-full border-2 border-black bg-gray-50 overflow-hidden rounded-lg">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setPerformanceType("daily")
                    setOpenPerformanceMenu(false)
                  }}
                  className="py-2 px-4 border-b border-gray-300">
                  <Text className="text-base font-medium">Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setPerformanceType("weekly")
                    setOpenPerformanceMenu(false)
                  }}
                  className="py-2 px-4 border-b border-gray-300">
                  <Text className="text-base font-medium">Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setPerformanceType("monthly")
                    setOpenPerformanceMenu(false)
                  }}
                  className="py-2 px-4 border-b border-gray-300">
                  <Text className="text-base font-medium">Monthly</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : null}
        </View>
        <View className="mt-6 px-8">
          <Text className="text-lg">Total hours spent in:</Text>
          <Text className="text-base  mt-2">
            Last 7 days:
            <Text className="font-bold">
              {performanceStats != null
                ? ` ${Math.floor(
                    parseInt(performanceStats.total_time_week) / 60
                  )} hours`
                : " 0 hours"}
            </Text>
          </Text>
          <Text className="text-base mt-2">
            Last 30 days:
            <Text className="font-bold">
              {performanceStats != null
                ? ` ${Math.floor(
                    parseInt(performanceStats.total_time_month) / 60
                  )} hours`
                : " 0 hours"}
            </Text>
          </Text>
          <Text className="mt-12 text-xl">
            Total time spent:{" "}
            <Text className="font-bold">
              {performanceStats != null
                ? ` ${Math.floor(
                    parseInt(performanceStats.total_time) / 60
                  )} hours`
                : " 0 hours"}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PerformanceScreen
