import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { useState } from "react"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useUserInfo } from "../../utils/zustandStateManager"
import Octicons from "react-native-vector-icons/Octicons"
import { LineChart } from "react-native-chart-kit"
import axios from "../../utils/axiosConfig"
import { useQuery } from "react-query"
import useAppStyling from "../../utils/hooks/useAppStyling"
import CustomStatusBar from "../../utils/components/StatusBar"
import { getInternetStatus } from "../../utils/hooks/getInternetStatus"
import Feather from "react-native-vector-icons/Feather"
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
  const { isOffline } = getInternetStatus()
  const [performanceType, setPerformanceType] = useState("daily")
  const [isGraphDataLoading, setGraphDataLoading] = useState(true) //this is for the loader in the graph
  const [isOpenPerformanceMenu, setOpenPerformanceMenu] =
    useState<boolean>(false)
  const userInfoState = useUserInfo((state) => state.userInfo)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const {
    mainColor,
    mainColorHash,
    bgColor,
    buttonRoundness,
    borderColor,
    buttonColor,
    dropDownMenuBorderColor,
  } = useAppStyling()
  const { data: categories } = useQuery(["categories"], async () => {
    return axios
      .post("/category/get", { user_id: userInfoState.id })
      .then((res) => {
        //console.log(res.data.categories)
        return res.data.categories
      })
      .catch((err) => {
        console.log(err)
      })
  })

  const { data: performanceStats } = useQuery(
    // data for the stats below the graph
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
    // data for the graphs
    ["performance", [selectedCategory, performanceType]],
    async () => {
      setGraphDataLoading(true)
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
            setGraphDataLoading(false)
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
            setGraphDataLoading(false)
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
          setGraphDataLoading(false)
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
          setGraphDataLoading(false)
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
    color: () => mainColorHash,
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
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss()
      }}
      accessible={false}>
      <SafeAreaView className={`h-screen ${bgColor}`}>
        <CustomStatusBar />
        {isOffline ? (
          <View className="absolute top-[70px] left-14">
            <Feather name={"wifi-off"} color={"red"} size={26} />
          </View>
        ) : null}
        <View className="mt-8">
          <View className="flex-row w-full px-8">
            <Text className={`text-2xl ${mainColor}`}>Your Performance</Text>
            <View className="h-fit ml-auto">
              <Octicons
                name={"home"}
                color={mainColorHash}
                size={26}
                onPress={() => navigation.navigate("Home")}
              />
            </View>
          </View>
          <View
            className={
              isGraphDataLoading
                ? "relative w-screen flex-row"
                : "hidden w-screen flex-row"
            }>
            <ActivityIndicator
              className="absolute left-0 right-0 top-1"
              size={"large"}
            />
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
                className={`w-6/12 ${buttonRoundness} py-2 px-4 ${borderColor} ${buttonColor} flex-row items-center justify-between`}
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
                  setOpenPerformanceMenu(!isOpenPerformanceMenu)
                  setOpenDropDownMenu(false)
                }}
                className={`w-4/12 ${buttonRoundness} py-2 px-4 ${borderColor} ${buttonColor} flex-row items-center justify-between`}
                style={{ elevation: 2 }}>
                <Text className={`text-base font-medium ${mainColor}`}>
                  {performanceType.charAt(0).toUpperCase() +
                    performanceType.slice(1)}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  color={mainColorHash}
                  size={20}
                />
              </TouchableOpacity>
            </View>
            {isOpenDropDownMenu ? ( //CATEGORIES DROP DOWN MENU
              <View className="absolute top-[58px] w-full">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className={`z-50 max-h-[170px] mt-2 w-full ${borderColor} ${buttonColor} overflow-hidden rounded-lg`}>
                  {categories != null && categories.length > 0
                    ? [
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handlePress("All")}
                          className={`py-2 px-4 border-b ${dropDownMenuBorderColor}`}
                          key={Math.round(Math.random() * 10000).toString()}>
                          <Text
                            className={`text-base font-medium ${mainColor}`}>
                            All
                          </Text>
                        </TouchableOpacity>,
                        ...categories.map((value: category) => (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handlePress(value.name)}
                            className={`py-2 px-4 border-b ${dropDownMenuBorderColor}`}
                            key={value.id}>
                            <Text
                              className={`text-base font-medium ${mainColor}`}>
                              {value.name}
                            </Text>
                          </TouchableOpacity>
                        )),
                      ]
                    : null}
                </ScrollView>
              </View>
            ) : null}
            {isOpenPerformanceMenu ? ( //PERFORMANCE TYPE (daily, weekly, monthly) DROP DOWN MENU
              <View className="absolute top-[58px] w-full">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className={`z-50 max-h-[170px] mt-2 w-full ${borderColor} ${buttonColor} overflow-hidden rounded-lg`}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setPerformanceType("daily")
                      setOpenPerformanceMenu(false)
                    }}
                    className={`py-2 px-4 border-b ${dropDownMenuBorderColor}`}>
                    <Text className={`text-base font-medium ${mainColor}`}>
                      Daily
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setPerformanceType("weekly")
                      setOpenPerformanceMenu(false)
                    }}
                    className={`py-2 px-4 border-b ${dropDownMenuBorderColor}`}>
                    <Text className={`text-base font-medium ${mainColor}`}>
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setPerformanceType("monthly")
                      setOpenPerformanceMenu(false)
                    }}
                    className={`py-2 px-4 border-b ${dropDownMenuBorderColor}`}>
                    <Text className={`text-base font-medium ${mainColor}`}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            ) : null}
          </View>
          <View className="mt-6 px-8">
            <Text className={`text-lg ${mainColor}`}>
              Total hours spent in:
            </Text>
            <Text className={`text-base mt-2 ${mainColor}`}>
              Last 7 days:
              <Text className={`font-bold`}>
                {performanceStats != null &&
                performanceStats.total_time_week != null
                  ? ` ${Math.floor(
                      parseInt(performanceStats.total_time_week) / 60
                    )} ${
                      Math.floor(
                        parseInt(performanceStats.total_time_week) / 60
                      ) === 1
                        ? "hour"
                        : "hours"
                    }`
                  : " 0 hours"}
              </Text>
            </Text>
            <Text className={`text-base mt-2 ${mainColor}`}>
              Last 30 days:
              <Text className="font-bold">
                {performanceStats != null &&
                performanceStats.total_time_month != null
                  ? ` ${Math.floor(
                      parseInt(performanceStats.total_time_month) / 60
                    )} ${
                      Math.floor(
                        parseInt(performanceStats.total_time_month) / 60
                      ) === 1
                        ? "hour"
                        : "hours"
                    }`
                  : " 0 hours"}
              </Text>
            </Text>
            <Text className={`mt-12 text-xl ${mainColor}`}>
              Total time spent:{" "}
              <Text className="font-bold">
                {performanceStats != null && performanceStats.total_time != null
                  ? ` ${Math.floor(
                      parseInt(performanceStats.total_time) / 60
                    )} ${
                      Math.floor(parseInt(performanceStats.total_time) / 60) ===
                      1
                        ? "hour"
                        : "hours"
                    }`
                  : " 0 hours"}
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default PerformanceScreen
