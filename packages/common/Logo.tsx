import { Image, View } from "react-native";
import LogoPng from "../../assets/logo/logo-xl.png";

export default function Logo() {
  return (
    <View>
      <Image
        source={LogoPng}
        style={{ width: 212, height: 68 }}
        resizeMode="contain"
      />
    </View>
  );
}
