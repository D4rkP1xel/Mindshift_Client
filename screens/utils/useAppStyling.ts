import { useAppStyle } from "./zustandStateManager"

export default function useAppStyling() {
  const { darkMode } = useAppStyle((state) => state.appStyle)
  return {
    mainColor: darkMode ? "text-zinc-100" : "text-zinc-800",
    bgColor: darkMode ? "bg-zinc-800" : "bg-zinc-50",
    mainColorHash: darkMode ? "#fafafa" : "#27272a",
    borderColor: darkMode ? "border-transparent" : "border-zinc-800",
    textInputBorderColor: darkMode ? "border-zinc-50" : "border-zinc-800",
    buttonColor: darkMode ? "bg-zinc-700" : "bg-zinc-50",
    buttonRoundness: "rounded-full",
    fullLogoPath: darkMode
      ? require("../../assets/mindshift-full-logo-white.png")
      : require("../../assets/mindshift-full-logo.png"),
  }
}
