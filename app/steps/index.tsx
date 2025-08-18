import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RadioButton, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SelectionScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const { user_id } = useLocalSearchParams();
    const [selectedOption, setSelectedOption] = useState("individual");

    return (
        <View style={styles.container}>
            {/* Step Indicator */}
            <Text style={styles.stepText}>Step 1 of 3</Text>

            {/* Title */}
            <Text style={styles.title}>How would you like to Use Surepay?</Text>

            {/* Option 1: Individual */}
            <TouchableOpacity
                style={[
                    styles.optionCard,
                    selectedOption === "individual" && styles.selectedCard,
                ]}
                onPress={() => setSelectedOption("individual")}
            >
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="account-circle" size={24} color="#38BDF8" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>As an Individual</Text>
                    <Text style={styles.optionSubtitle}>
                        Use to make personal top-ups and bills payments
                    </Text>
                </View>
                <RadioButton
                    value="individual"
                    status={selectedOption === "individual" ? "checked" : "unchecked"}
                    color="#38BDF8"
                    onPress={() => setSelectedOption("individual")}
                />
            </TouchableOpacity>

            {/* Option 2: Agent */}
            <TouchableOpacity
                style={[
                    styles.optionCard,
                    selectedOption === "agent" && styles.selectedCard,
                ]}
                onPress={() => setSelectedOption("agent")}
            >
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="account-group" size={24} color="#34D399" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>As an Agent</Text>
                    <Text style={styles.optionSubtitle}>
                        Sell Airtime, Data and earn commission on completed payments
                    </Text>
                </View>
                <RadioButton
                    value="agent"
                    status={selectedOption === "agent" ? "checked" : "unchecked"}
                    color="#38BDF8"
                    onPress={() => setSelectedOption("agent")}
                />
            </TouchableOpacity>

            {/* Continue Button */}
            <Button
                mode="contained"
                style={styles.continueButton}
                onPress={() =>
                    router.push({
                        pathname: "/steps/verify",
                        params: {
                            user_id,
                            user_type: selectedOption,
                        },
                    })
                }
            >
                <Text style={{ fontFamily: "InstrumentSansBold" }}>
                    Continue
                </Text>
            </Button>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E3A8A",
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center", // Added to centralize vertically
    },
    stepText: {
        color: "#34D399",
        fontSize: 18,
        fontWeight: 500,
        fontFamily: "InstrumentSansSemiBold",
    },
    title: {
        fontSize: 24,
        fontWeight: 500,
        color: "#ffffff",
        marginVertical: 10,
        textAlign: "center",
        marginBottom: 80,
        fontFamily: "InstrumentSansSemiBold",
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 15,
        width: "100%",
        marginVertical: 10,
        elevation: 2,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: "#38BDF8",
    },
    iconContainer: {
        marginRight: 10,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "InstrumentSansBold",
        color: "#1E3A8A",
    },
    optionSubtitle: {
        fontSize: 13,
        color: "#757575",
        lineHeight: 18,
        fontFamily: "InstrumentSans",
    },
    continueButton: {
        backgroundColor: "#10B981",
        borderRadius: 40,
        padding: 10,
        // width: "100%",
        marginTop: 80,
        color:"#1E3A8A",
        fontFamily: "InstrumentSansSemiBold",
    },
});
