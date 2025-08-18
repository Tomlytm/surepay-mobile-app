import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import DynamicTextInput from "@/components/TextInput";
import Toast from "react-native-toast-message";
import { useUpdatePassword } from "@/services/queries/auth/forgot-password";

export default function ChangePassword() {
  const router = useRouter();
  const { email, token } = useLocalSearchParams() as {
    email: string;
    token: string;
  };

  const [password, setPassword] = useState("");
  const [nPassword, setNPassword] = useState("");

  const { updatePassword, updatePasswordLoading } = useUpdatePassword(() =>
    router.push("/login") // ✅ or "/(tabs)/dashboard"
  );

  const handleSubmit = () => {
    if (!password || !nPassword) {
      return Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Both password fields are required.",
      });
    }

    if (password !== nPassword) {
      return Toast.show({
        type: "error",
        text1: "Mismatch",
        text2: "Passwords do not match.",
      });
    }

    updatePassword({
      email,
      token,
      password,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Change Password</Text>

          <TouchableOpacity>
            <Text style={styles.resetText}>
              Create a new password below.
            </Text>
          </TouchableOpacity>

          <DynamicTextInput
            label="Create New Password"
            value={password}
            inputType="password"
            onChangeText={setPassword}
          />

          <DynamicTextInput
            label="Confirm New Password"
            value={nPassword}
            inputType="password"
            onChangeText={setNPassword}
          />

          <Button
            mode="contained"
            style={styles.confirmButton}
            onPress={handleSubmit}
            loading={updatePasswordLoading}
            disabled={updatePasswordLoading}
          >
            <Text style={{ fontFamily: "InstrumentSansBold" }}>
              {updatePasswordLoading ? "Updating..." : "Create Password"}
            </Text>
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F0FA",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    color: "#052113",
    marginBottom: 20,
    textAlign: "left",
    fontFamily: "InstrumentSansSemiBold",
  },
  resetText: {
    fontSize: 16,
    color: "#353535",
    fontFamily: "InstrumentSans",
    marginBottom: 20,
  },
  linkText: {
    color: "#E5932B",
    fontWeight: "500",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 50,
    paddingVertical: 7,
    marginBottom: 20,
    marginTop: 80,
    width: "100%",
  },
});
