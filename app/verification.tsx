import { useResendOTP, useValidateOTP } from "@/services/queries/auth/registration";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";

export default function OtpVerification() {
  const router = useRouter();
  const { phone, user_id, email } = useLocalSearchParams(); // Ensure `user_id` is passed as a param
  const phoneNumber = phone ? `•••••••${phone.slice(-4)}` : "•••••••0976";
  const [otp, setOtp] = useState("");
  const { validateOtp, validatingOtp } = useValidateOTP(Number(user_id));
  const { resendOtp, resendingOtp } = useResendOTP(Number(user_id));

  const handleVerify = async () => {
    try {
      await validateOtp({ otp, email }); // Assuming `otp` is the required body
      router.push({ pathname: "/steps", params: { user_id: encodeURIComponent(user_id as string) } });
    } catch (error) {
      console.error("OTP validation failed", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Face ID Icon */}
        <MaterialIcons
          name="face"
          size={60}
          color="#1E3A8A"
          style={styles.icon}
        />

        {/* Title */}
        <Text style={styles.title}>Verify your Account</Text>
        {/* OTP Instruction */}
        <Text style={styles.subtitle}>
          A 6 digit code sent to{" "}
          <Text style={styles.highlight}>{phoneNumber}</Text>. Please enter the
          code to complete your account verification.
        </Text>

        {/* OTP Input */}
        <OtpInput
          numberOfDigits={6}
          focusColor="#E5932B"
          onFilled={(code) => setOtp(code)}
          onTextChange={setOtp}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.otpCell,
            pinCodeTextStyle: styles.otpText,
            focusedPinCodeContainerStyle: styles.focusedCell,
          }}
        />

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.length === 6 ? styles.activeButton : styles.disabledButton,
          ]}
          disabled={otp.length !== 6 || validatingOtp}
          onPress={handleVerify}
        >
          <Text style={styles.verifyText}>
            {validatingOtp ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>

        {/* Resend Code */}
        <Text style={styles.resendText}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await resendOtp();
              } catch (error) {
                console.error("Resend OTP failed", error);
              }
            }}
            disabled={resendingOtp}
          >
            <Text style={styles.resendLink}>
              {resendingOtp ? "Resending..." : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </Text>
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
    justifyContent: "center", // Center vertically
  },
  icon: {
    marginBottom: 20,
    // alignSelf: "center", // Center horizontally
  },
  title: {
    fontSize: 32,
    color: "#0F172A",
    marginBottom: 10,
    fontFamily: "InstrumentSansSemiBold",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 20,
    marginTop: 10,
    fontFamily: "InstrumentSans",
  },
  highlight: {
    color: "#E5932B",
    fontWeight: "bold",
  },
  otpContainer: {
    marginTop: 20,
    marginBottom: 90,
  },
  otpCell: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#94BDFF",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  focusedCell: {
    borderColor: "#E5932B",
  },
  otpText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  verifyButton: {
    paddingVertical: 15,
    width: "100%",
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  activeButton: {
    backgroundColor: "#1E3A8A",
  },
  disabledButton: {
    backgroundColor: "#A0AEC0",
  },
  verifyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "InstrumentSansBold",
  },
  resendText: {
    fontSize: 14,
    color: "gray",
    marginLeft: 'auto',
    fontFamily: "InstrumentSans",
  },
  resendLink: {
    color: "#E5932B",
    fontWeight: "500",
    fontFamily: "InstrumentSansBold",
  },
});
