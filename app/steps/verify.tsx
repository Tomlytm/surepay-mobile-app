import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RadioButton, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import DynamicTextInput from "@/components/TextInput";

export default function SelectionScreen() {
    // const navigation = useNavigation();
    const { user_id, user_type } = useLocalSearchParams();
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState("");
    const [value, setValue] = useState<'NIN' | 'BVN'>('NIN');
    return (
        <View style={styles.container}>
            {/* Step Indicator */}
            <Text style={styles.stepText}>Step 2 of 3</Text>

            {/* Title */}
            <Text style={styles.title}>Verify your NIN/BVN</Text>
            <RadioButton.Group onValueChange={(val) => setValue(val as 'NIN' | 'BVN')} value={value}>
                <View style={styles.radioGroup}>
                    <View style={styles.radioItem}>
                        <RadioButton value="NIN" />
                        <Text style={styles.radioLabel}>NIN</Text>
                    </View>
                    <View style={styles.radioItem}>
                        <RadioButton value="BVN" />
                        <Text style={styles.radioLabel}>BVN</Text>
                    </View>
                </View>
            </RadioButton.Group>
            <DynamicTextInput customStyle={{ flexDirection: 'row', width: '100%' }} label={`Enter your ${value}`} value={selectedOption} inputType="text" onChangeText={setSelectedOption} />

            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={styles.backButton}
                    labelStyle={styles.backLabel}
                    icon="arrow-left"
                >
                    Back
                </Button>
                {/* Continue Button */}

                <Button
                    mode="contained"
                    style={styles.continueButton}
                    onPress={() =>
                        router.push({
                            pathname: "/steps/business_info",
                            params: {
                                user_id, // assuming you have user_id from useLocalSearchParams
                                NIN: value === "NIN" ? selectedOption : null,
                                BVN: value === "BVN" ? selectedOption : null,
                                user_type: user_type || "individual", // default to individual if not provided
                            },
                        })
                    }
                    labelStyle={styles.continueLabel}
                >
                    Continue
                </Button>

            </View>
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
        marginBottom: 100,
        fontFamily: "InstrumentSansSemiBold",
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 15,
        width: "100%",
        marginTop: 50,
        marginBottom: 10,
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
        color: "#1E3A8A",
        fontFamily: "InstrumentSansSemiBold",
    },
    optionSubtitle: {
        fontSize: 12,
        color: "#757575",
        lineHeight: 18,
    },
    continueButton: {
        backgroundColor: "#10B981",
        borderRadius: 40,
        padding: 10,
        // width: "100%",
        // marginTop: 80,
        flex: 1,
        marginLeft: 10,
        // backgroundColor: '#32D74B',
        color: "#1E3A8A",
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        marginTop: 80,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        borderColor: '#E0F2FE', // Lighter border color
        borderWidth: 1,      // Border width
        borderRadius: 8,     // Optional: Rounded corners
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    radioLabel: {
        color: '#fff',
        marginLeft: 4,
        fontFamily: "InstrumentSansBold",
        letterSpacing: 0.8,
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 32,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40
    },
    backButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#E4F2FD',
        // borderColor: '#fff',
        color: '#1E3A8A',
        borderRadius: 40,
        padding: 10,
    },

    backLabel: {
        color: '#1E3A8A',
        fontFamily: "InstrumentSansBold",
    },
    continueLabel: {
        color: '#1E3A8A',
        fontFamily: "InstrumentSansBold",
    },
});

