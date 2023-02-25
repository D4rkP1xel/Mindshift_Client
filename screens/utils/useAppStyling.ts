import { useAppStyle } from "./zustandStateManager"

export default function useAppStyling() {
  const { darkMode } = useAppStyle((state) => state.appStyle)
  return {
    mainColor: darkMode ? "text-zinc-100" : "text-zinc-800",
    bgColor: darkMode ? "bg-zinc-800" : "bg-zinc-50",
    mainColorHash: darkMode ? "#fafafa" : "#27272a",
    borderColor: darkMode
      ? "border-transparent border-0"
      : "border-zinc-800 border-2",
    secondaryBorderColor: darkMode ? "border-zinc-50" : "border-zinc-800",
    dropDownMenuBorderColor: darkMode ? "border-zinc-800" : "border-zinc-50",
    buttonColor: darkMode ? "bg-zinc-700" : "bg-zinc-50",
    buttonRoundness: "rounded-full",
    fullLogoPath: darkMode
      ? require("../../assets/mindshift-full-logo-white.png")
      : require("../../assets/mindshift-full-logo.png"),
    calendarBg: darkMode ? "#27272a" : "#fafafa",
    calendarDisabledDays: darkMode ? "#3f3f46" : "#d4d4d8",
    calendarEnabledDays: darkMode ? "#fafafa" : "#3f3f46",
  }
}
