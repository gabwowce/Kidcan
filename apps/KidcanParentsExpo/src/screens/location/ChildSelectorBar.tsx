import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Child = {
  id: number;
  name: string | null;
  emoji?: string; // jei turi
  color?: string | null;
};

type Props = {
  childrenData: Child[];
  selectedChildId: number | null; // null = All Kids
  onSelect: (childId: number | null) => void;
};

export const ChildSelectorBar: React.FC<Props> = ({
  childrenData,
  selectedChildId,
  onSelect,
}) => {
  // jei tik vienas vaikas – nerodom selectorio visai
  if (childrenData.length <= 1) return null;

  const isAll = selectedChildId == null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pill
        active={isAll}
        label="All Kids"
        onPress={() => onSelect(null)}
        leftIcon={<GridIcon active={isAll} />}
      />

      {childrenData.map((c) => (
        <Pill
          key={c.id}
          active={selectedChildId === c.id}
          label={c.name ?? "Child"}
          onPress={() => onSelect(c.id)}
          leftIcon={
            <View
              style={[styles.avatar, { backgroundColor: c.color ?? "#E9E5DD" }]}
            >
              <Text style={styles.avatarText}>{c.emoji ?? "🧒"}</Text>
            </View>
          }
        />
      ))}
    </ScrollView>
  );
};

const Pill = ({
  active,
  label,
  onPress,
  leftIcon,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  leftIcon?: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.pill, active && styles.pillActive]}
  >
    {leftIcon}
    <Text
      style={[styles.pillText, active && styles.pillTextActive]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const GridIcon = ({ active }: { active: boolean }) => (
  <View style={[styles.gridIcon, active && styles.gridIconActive]}>
    <View style={styles.gridRow}>
      <View style={styles.gridDot} />
      <View style={styles.gridDot} />
    </View>
    <View style={styles.gridRow}>
      <View style={styles.gridDot} />
      <View style={styles.gridDot} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 6,
  },
  pill: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  pillActive: {
    backgroundColor: "#1F2937",
    borderColor: "rgba(0,0,0,0)",
  },
  pillText: {
    maxWidth: 130,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16 },
  gridIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    padding: 4,
  },
  gridIconActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: "#111827",
    opacity: 0.7,
  },
});
