import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { TextInput, IconButton, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import DynamicTextInput from "@/components/TextInput";

export default function PasswordReset() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState("");

    // const [secureText, setSecureText] = useState(true);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={[styles.backButton, styles.iconContainer]}
        /> */}

                {/* Centered Content */}
                <View style={styles.centeredContent}>
                    {/* Title */}
                    <Text style={styles.title}>Reset Password</Text>



                    {/* Forgot Password */}
                    <TouchableOpacity>
                        <Text style={styles.resetText}>
                            An email has been sent to the email address “{String(email)}”. Enter the 6 digit code here to confirm password reset.

                        </Text>
                    </TouchableOpacity>
                    {/* Email Input */}
                    {/* <DynamicTextInput label="Email Address" value={email} inputType="text" onChangeText={setEmail} /> */}
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
                    {/* Login Button */}
                    <Button mode="contained"

                        style={[styles.confirmButton, otp.length === 6 ? styles.activeButton : styles.disabledButton]}
                        onPress={() => router.push({ pathname: "/change-password", params: { email, token: encodeURIComponent(otp) } })}>
                        <Text style={{
                            fontFamily: "InstrumentSansBold",
                        }} >
                            Reset Password
                        </Text>

                    </Button>

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
        // marginTop: 10,
    },
    linkText: {
        color: "#E5932B",
        fontWeight: 500,
        textDecorationLine: "underline",
        textAlign: "center",
    },
    otpContainer: {
        marginVertical: 30,
        paddingRight: 20,
        fontFamily: "InstrumentSansSemiBold",
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
        fontFamily: "InstrumentSansSemiBold",
    },
    focusedCell: {
        borderColor: "#E5932B",
    },
    otpText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    confirmButton: {
        backgroundColor: "#1E3A8A",
        borderRadius: 50,
        fontWeight: 500,
        paddingVertical: 7,
        marginBottom: 20,
        marginTop: 80,
        width: "100%",
    },
    createAccount: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
    }, activeButton: {
        backgroundColor: "#1E3A8A",
    },
    disabledButton: {
        backgroundColor: "#A0AEC0",
    },

});
