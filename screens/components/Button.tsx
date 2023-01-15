import React from "react";
import { Text, View } from "react-native";

type props = {
  name: string;
};

function Button({ name }: props) {
  return (
    <View className="w-6/12 rounded-full h-12 bg-black justify-center items-center mb-3">
      <Text className="text-white text-base">{name}</Text>
    </View>
  );
}

export default Button;
