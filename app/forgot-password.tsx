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
import { useRouter } from "expo-router";
import DynamicTextInput from "@/components/TextInput";
import { useRequestPasswordReset } from "@/services/queries/auth/forgot-password";
import Toast from "react-native-toast-message";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordReset() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const {
        requestPasswordReset,
        requestingPasswordReset,
    } = useRequestPasswordReset();

    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError("");
            return;
        }
        if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email address.");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordReset = async () => {
        // Validate and set error immediately
        if (!email) {
            setEmailError("Please enter your email address.");
            Toast.show({
                type: "error",
                text1: "Missing Email",
                text2: "Please enter your email address.",
            });
            return;
        }
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }
        setEmailError(""); // Clear error if valid

        try {
            await requestPasswordReset({ email });
            router.push({ pathname: "/reset-password", params: { email } });
            // router.push("/steps/business_info");
        } catch (error) {
            // Error handled inside hook
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.centeredContent}>
                    <Text style={styles.title}>Forgot Password</Text>

                    <TouchableOpacity>
                        <Text style={styles.resetText}>
                            Please provide your email address associated with your Gradely account.
                        </Text>
                    </TouchableOpacity>

                    <DynamicTextInput
                        label="Email Address"
                        value={email}
                        inputType="text"
                        onChangeText={value => {
                            setEmail(value);
                        }}
                        // autoCapitalize="none"
                    />
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    <Button
                        mode="contained"
                        style={styles.confirmButton}
                        onPress={handlePasswordReset}
                        loading={requestingPasswordReset}
                        labelStyle={{ color: "white" }} 
                        disabled={requestingPasswordReset}
                    >
                        <Text style={{ fontFamily: "InstrumentSansBold" }}>
                            {requestingPasswordReset ? "Confirming..." : "Confirm"}
                        </Text>
                    </Button>

                    <TouchableOpacity onPress={() => router.push("/login")}>
                        <Text style={styles.linkText}>Back to Login</Text>
                    </TouchableOpacity>
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
        fontFamily: "InstrumentSansBold",
    },
    confirmButton: {
        backgroundColor: "#1E3A8A",
        borderRadius: 50,
        paddingVertical: 7,
        marginBottom: 20,
        marginTop: 80,
        width: "100%",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: 4,
        marginBottom: 8,
        fontFamily: "InstrumentSans",
    },
});
