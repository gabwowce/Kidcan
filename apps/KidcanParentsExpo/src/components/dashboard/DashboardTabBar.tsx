import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function DashboardTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  // pilko BG scale anim kiekvienam tabui
  const scales = React.useRef(
    state.routes.map((_, i) => new Animated.Value(state.index === i ? 1 : 0))
  ).current;

  // flex anim kiekvienam tabui (kad slinktųsi pats tabas)
  const flexes = React.useRef(
    state.routes.map((_, i) => new Animated.Value(state.index === i ? 1.8 : 1))
  ).current;

  React.useEffect(() => {
    const scaleAnimations = scales.map((val, i) =>
      Animated.timing(val, {
        toValue: i === state.index ? 1 : 0,
        duration: 300,
        useNativeDriver: true, // tik scaleX
      })
    );

    const flexAnimations = flexes.map((val, i) =>
      Animated.timing(val, {
        toValue: i === state.index ? 1.8 : 1,
        duration: 300,
        useNativeDriver: false, // flex yra layout prop
      })
    );

    Animated.parallel([...scaleAnimations, ...flexAnimations]).start();
  }, [state.index, scales, flexes]);

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          (options.tabBarLabel as string) ?? options.title ?? route.name;

        let iconName: React.ComponentProps<typeof Feather>["name"];
        switch (route.name) {
          case "DashboardHome":
            iconName = "home";
            break;
          case "Locations":
            iconName = "map";
            break;
          case "Activity":
            iconName = "clock";
            break;
          case "Settings":
          default:
            iconName = "user";
            break;
        }

        const isFocused = state.index === index;
        const scale = scales[index];
        const flex = flexes[index];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Animated.View
            key={route.key}
            style={[styles.tabTouch, { flex }]} // 👈 slenka animuotai
          >
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.9}
              style={styles.touchInner}
            >
              <View style={styles.tabItem}>
                {/* Pilkas pill fonas, kuris iš CENTRO išsiplėčia */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.pillBg,
                    {
                      transform: [{ scaleX: scale }],
                      opacity: scale,
                    },
                  ]}
                />
                <View style={styles.tabContent}>
                  <Feather
                    name={iconName}
                    size={28}
                    color={isFocused ? "#000000" : "#777777"}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelActive,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                  >
                    {label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 88, // buvo 82 – mažiau tuščios vietos
    borderTopWidth: 0,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    paddingHorizontal: 10,
    paddingBottom: 8, // 👈 truputį pakelia tabus nuo apačios
    alignItems: "center",
  },
  tabTouch: {
    height: "100%",
    justifyContent: "center",
  },
  touchInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: 58, // buvo 48 – daugiau vietos ikonai/label viduje
    borderRadius: 10,
    minWidth: 114,
    overflow: "hidden",
    marginBottom: 4, // 👈 papildomas atitraukimas nuo apačios
  },
  pillBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  tabContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16, // truputį platesnis
    paddingVertical: 10, // 👈 daugiau vertikalaus paddingo nuo pilko fono kraštų
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#777777",
    fontFamily: "Gilroy-SemiBold",
  },
  tabLabelActive: {
    color: "#000000",
    fontWeight: "700",
  },
});

export default DashboardTabBar;
