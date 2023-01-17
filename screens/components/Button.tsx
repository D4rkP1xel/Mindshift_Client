import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

type props = {
  name: string;
  onPress: () => void;
};

function Button({ name, onPress }: props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="w-6/12 rounded-full h-12 bg-black justify-center items-center mb-3"
    >
      <Text className="text-white text-base">{name}</Text>
    </TouchableOpacity>
  );
}

export default Button;
