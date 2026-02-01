import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TransferFailed() {
    const router = useRouter();
    const { reference } = useLocalSearchParams();

    const handleGoToDashboard = () => {
        router.push('/(tabs)/dashboard');
    };

    const handleTryAgain = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Failed Icon */}
            <View style={styles.iconContainer}>
                <Text style={styles.failedIcon}>❌</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Payment Failed!</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Your payment could not be processed at this time.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleTryAgain}
                >
                    <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleGoToDashboard}
                >
                    <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        marginBottom: 30,
    },
    failedIcon: {
        fontSize: 80,
        textAlign: "center",
    },
    title: {
        fontSize: 28,
        color: "#DC2626",
        marginBottom: 15,
        fontFamily: "InstrumentSansBold",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        marginBottom: 40,
        textAlign: "center",
        fontFamily: "InstrumentSans",
        lineHeight: 24,
    },
    buttonContainer: {
        width: "100%",
        gap: 16,
    },
    primaryButton: {
        backgroundColor: "#DC2626",
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "InstrumentSansBold",
    },
    secondaryButton: {
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#94BDFF",
        backgroundColor: "transparent",
    },
    secondaryButtonText: {
        color: "#1E3A8A",
        fontSize: 16,
        fontFamily: "InstrumentSansSemiBold",
    },
});