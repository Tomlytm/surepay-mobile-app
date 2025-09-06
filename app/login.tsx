import DynamicTextInput from "@/components/TextInput";
// import { useLogin } from "@/services/queries/auth/login";
import { decryptAESKey, getOrCreateRSAKeyPair } from "@/utils/cryptoHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("thesuburbanbarber@gmail.com");
  const [password, setPassword] = useState("");

  // const { login, logging, } = useLogin(() => {
  //   router.push("/(tabs)/dashboard");
  // });

  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // 1. Generate RSA key pair natively
    // 1. Load or generate RSA key pair
    const { privateKey, publicKey } = await getOrCreateRSAKeyPair();
    console.log("Public Key:", publicKey);
    // 2. Prepare login data
    const loginData = {
      key: publicKey,
      email,
      password,
    };

    // 3. Make login request
    const response = await axios.post(
      "https://uatapi.sure-pay.org/api/v1/auth/login",
      loginData,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-dev-mode": "true",
        },
      }
    );
console.log("Login response:", response.data);
    // 4. Validate response
    const loginres = response.data;
    const encryptedAesKey = loginres?.payload?.key;
    const token = loginres?.payload?.token;
    const user = loginres?.user;

    if (!encryptedAesKey || !token || !user) {
      throw new Error("Invalid response format from server.");
    }

    // 5. Decrypt AES key using native RSA
    const decryptedAesKey = await decryptAESKey(encryptedAesKey, privateKey);
console.log("Decrypted AES Key:", decryptedAesKey);
    // 6. Store credentials
    await AsyncStorage.setItem("priKey", privateKey);
    await AsyncStorage.setItem("aesKey", decryptedAesKey);
    await AsyncStorage.setItem("jwt", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    // 7. Navigate to dashboard
    router.push("/(tabs)/dashboard");
  } catch (error: any) {
    console.log("Login error:", error?.response.data.message  || error);
    Toast.show({
      type: "error",
      text1: "Login Failed",
      text2: error?.response.data.message  || error || "Please try again later.",
    });
  } finally {
    setLoading(false);
  }
};



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Welcome Back</Text>
          <DynamicTextInput label="Email Address" value={email} inputType="text" onChangeText={setEmail} />
          <DynamicTextInput label="Password" value={password} inputType="password" onChangeText={setPassword} />

          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.forgotPassword}>
              Forgot Password? <Text style={styles.linkText}>Reset it</Text>
            </Text>
          </TouchableOpacity>
            <Button
            mode="contained"
            style={styles.loginButton}
            onPress={handleSubmit}
            loading={loading} // this shows spinner in react-native-paper
            disabled={loading}
            labelStyle={{ color: "white" }} // force text color to white
            >
            {loading ? 'Loading...': 'Login'}
            </Button>
            <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.createAccount}>
            Don’t have an account? <Text style={styles.linkText}>Create an Account</Text>
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F0FA",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 10,
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
  },
  input: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "white",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#1E3A8A",
    // textAlign: "center",
    marginBottom: 50,
    marginTop: 10,
  },
  linkText: {
    color: "#E5932B",
    fontWeight: 500,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 50,
    fontWeight: 500,
    paddingVertical: 7,
    marginBottom: 20,
    width: "100%",
    color: "white",
  },
  createAccount: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  iconContainer: {
    backgroundColor: "white",
    // borderRadius: 50,
    padding: 7,
    elevation: 2,
  },

});
