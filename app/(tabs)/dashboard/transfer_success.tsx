import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TransferSuccess() {
    const router = useRouter();
    const { reference, amount, phone, network } = useLocalSearchParams();

    const handleGoToDashboard = () => {
        router.push('/(tabs)/dashboard');
    };

    const handleViewTransaction = () => {
        // Navigate to transaction details page
        router.push(`/(tabs)/explore/${reference}`);
    };

    return (
        <View style={styles.container}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
                <Text style={styles.partyIcon}>🎉</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Success!</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Your airtime purchase is complete.
            </Text>

            {/* Transaction Details */}
            {/* <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reference:</Text>
                    <Text style={styles.detailValue}>{reference}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>₦{Number(amount)?.toLocaleString()}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone Number:</Text>
                    <Text style={styles.detailValue}>{phone}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Network:</Text>
                    <Text style={styles.detailValue}>{network}</Text>
                </View>
            </View> */}

            {/* Info Message */}
            {/* <View style={styles.infoContainer}>
                <MaterialIcons name="info" size={20} color="#1E3A8A" />
                <Text style={styles.infoText}>
                    Your transaction is being processed. You will receive a confirmation SMS shortly.
                </Text>
            </View> */}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleViewTransaction}
                >
                    <Text style={styles.primaryButtonText}>View Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleGoToDashboard}
                >
                    <Text style={styles.secondaryButtonText}>Done</Text>
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
    partyIcon: {
        fontSize: 80,
        textAlign: "center",
    },
    title: {
        fontSize: 28,
        color: "#1E3A8A",
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
    detailsContainer: {
        width: "100%",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    detailLabel: {
        fontSize: 14,
        color: "#64748B",
        fontFamily: "InstrumentSans",
    },
    detailValue: {
        fontSize: 14,
        color: "#0F172A",
        fontFamily: "InstrumentSansSemiBold",
        textAlign: "right",
        flex: 1,
        marginLeft: 10,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EBF8FF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 40,
        borderLeftWidth: 4,
        borderLeftColor: "#1E3A8A",
    },
    infoText: {
        fontSize: 14,
        color: "#1E3A8A",
        fontFamily: "InstrumentSans",
        marginLeft: 10,
        flex: 1,
        lineHeight: 20,
    },
    buttonContainer: {
        width: "100%",
        gap: 16,
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#94BDFF",
        backgroundColor: "transparent",
    },
    primaryButtonText: {
        color: "#1E3A8A",
        fontSize: 16,
        fontFamily: "InstrumentSansBold",
    },
    secondaryButton: {
        backgroundColor: "#34D399",
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#1E3A8A",
        fontSize: 16,
        fontFamily: "InstrumentSansSemiBold",
    },
});