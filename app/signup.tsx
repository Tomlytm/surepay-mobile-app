import DynamicTextInput from "@/components/TextInput";
import { useSignup } from "@/services/queries/auth/registration";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import Toast from "react-native-toast-message";

export default function Signup({ navigation }: any) {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { signUp, signingUp } = useSignup((user) => {
    const userId = user?.id;
    router.push(`/verification?phone=${encodeURIComponent(phoneNumber)}&email=${encodeURIComponent(emailAddress)}&user_id=${encodeURIComponent(userId)}`);
    Toast.show({
      type: 'success',
      text1: 'Successfully registered',
      text2: 'Please verify your email address to continue.',
    });
  }, (error) => {
    console.error("Signup error:", error);
    Toast.show({
      type: 'error',
      text1: 'Signup Failed',
      text2: error?.response?.data?.message || 'An unexpected error occurred.',
    });
  });


  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    password: "",
  });

  const validateFields = () => {
    const newErrors: any = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
    if (!emailAddress.trim()) newErrors.emailAddress = "Email address is required.";
    if (!password.trim()) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateFields()) return;

    try {
      await signUp({
        firstname: firstName,
        lastname: lastName,
        email: emailAddress,
        phone: phoneNumber,
        password: password,
      });
      console.log({
        firstname: firstName,
        lastname: lastName,
        email: emailAddress,
        phone: phoneNumber,
        password: password,
      });
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create an Account</Text>

          <DynamicTextInput
            label="First Name"
            value={firstName}
            inputType="text"
            onChangeText={(text) => {
              setFirstName(text);
              setErrors((prev) => ({ ...prev, firstName: "" }));
            }}
          />
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

          <DynamicTextInput
            label="Last Name"
            value={lastName}
            inputType="text"
            onChangeText={(text) => {
              setLastName(text);
              setErrors((prev) => ({ ...prev, lastName: "" }));
            }}
          />
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

          <DynamicTextInput
            label="Phone Number"
            value={phoneNumber}
            inputType="text"
            onChangeText={(text) => {
              setPhoneNumber(text);
              setErrors((prev) => ({ ...prev, phoneNumber: "" }));
            }}
          />
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}

          <DynamicTextInput
            label="Email Address"
            value={emailAddress}
            inputType="text"
            onChangeText={(text) => {
              setEmailAddress(text);
              setErrors((prev) => ({ ...prev, emailAddress: "" }));
            }}
          />
          {errors.emailAddress ? <Text style={styles.errorText}>{errors.emailAddress}</Text> : null}

          <DynamicTextInput
            label="Password"
            value={password}
            inputType="password"
            secureTextEntry={true}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Text style={styles.termsText}>
            By clicking “Continue”, you agree to our{" "}
            <Text style={styles.termsLink}>Terms & conditions</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policies</Text>
          </Text>

          <TouchableOpacity
            onPress={handleSignup}
            style={styles.continueButton}
            disabled={signingUp}
          >
            <Text style={styles.continueText}>
              {signingUp ? "Signing Up..." : "Continue"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E7F0FA",
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    color: "#052113",
    marginBottom: 30,
    fontFamily: "InstrumentSansSemiBold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "InstrumentSans",
  },
  termsText: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: "InstrumentSans",
  },
  termsLink: {
    color: "#E5932B",
    fontWeight: "500",
    textDecorationColor: "underline",
    fontFamily: "InstrumentSansSemiBold",
  },
  continueButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  continueText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "InstrumentSansBold",
  },
  loginText: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    fontFamily: "InstrumentSans",
  },
  loginLink: {
    color: "#E5932B",
    fontWeight: "bold",
    fontFamily: "InstrumentSansBold",
  },
});
