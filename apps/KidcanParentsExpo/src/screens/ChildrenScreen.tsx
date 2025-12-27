// src/screens/ChildrenScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../api/client";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useAppDispatch } from "../store/hooks";
import { logoutThunk } from "../store/slices/authSlice";

type Child = {
  id: number;
  name: string;
  pairingCode?: string;
  expiresAt?: string;
};

type Nav = NativeStackNavigationProp<RootStackParamList, "Children">;

export default function ChildrenScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();

  const [name, setName] = useState("");
  const [children, setChildren] = useState<Child[]>([]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (e) {
      console.log("logout error", e);
      Alert.alert("Klaida", "Nepavyko atsijungti. Bandyk dar kartą.");
    }
  };

  const handleAddChild = async () => {
    if (!name.trim()) return;

    try {
      const res = await api.post("/children/", { name: name.trim() });
      const created: Child = res.data;
      setChildren((prev) => [...prev, created]);
      setName("");
      Alert.alert("Child added", `Created child #${created.id}`);
    } catch (e: any) {
      console.log("Add child error", e.response?.data || e.message);
      Alert.alert("Error", e.response?.data?.detail || "Could not add child");
    }
  };

  const handleGenerateCode = async (child: Child) => {
    try {
      const res = await api.post(`/children/${child.id}/pairing-code`, {});
      const { code, expires_at } = res.data;

      setChildren((prev) =>
        prev.map((c) =>
          c.id === child.id
            ? { ...c, pairingCode: code, expiresAt: expires_at }
            : c
        )
      );

      Alert.alert(
        "Pairing code",
        `Code for ${child.name}: ${code}\n\nGive this code to the Kid app on the child phone.`
      );
    } catch (e: any) {
      console.log("Pairing code error", e.response?.data || e.message);
      Alert.alert(
        "Error",
        e.response?.data?.detail || "Could not generate pairing code"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Kids</Text>
        <Button title="LOGOUT" onPress={handleLogout} />
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Child name"
          value={name}
          onChangeText={setName}
        />
        <Button title="ADD" onPress={handleAddChild} />
      </View>

      <FlatList
        data={children}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.childItem}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ChildDetails", {
                  childId: item.id,
                  childName: item.name,
                })
              }
            >
              <Text style={styles.childName}>{item.name}</Text>
              <Text style={styles.childSubtitle}>id: {item.id}</Text>
              {item.pairingCode && (
                <Text style={styles.childSubtitle}>
                  Last code: {item.pairingCode}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 4, alignSelf: "flex-start" }}>
              <Button
                title="GET CODE"
                onPress={() => handleGenerateCode(item)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ marginTop: 16 }}>No kids added yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: "700" },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  childItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  childName: { fontSize: 16, fontWeight: "600" },
  childSubtitle: { fontSize: 12, color: "#666" },
});
