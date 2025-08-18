import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DynamicTextInput from "@/components/TextInput";
import { useOnboardUser } from "@/services/queries/auth/registration";
import { decryptAESKey, getOrCreateRSAKeyPair } from "@/utils/cryptoHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Dropdown } from 'react-native-element-dropdown';
import { useFetchCities, useFetchStates } from "@/services/queries/extra/utility";
const data = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
    { label: 'Item 4', value: '4' },
    { label: 'Item 5', value: '5' },
    { label: 'Item 6', value: '6' },
    { label: 'Item 7', value: '7' },
    { label: 'Item 8', value: '8' },
];
export default function BusnessInfo() {
    const { user_id, user_type, NIN, BVN } = useLocalSearchParams<{ user_id: string; user_type: "agent" | "individual"; NIN?: string; BVN?: string }>();
    const router = useRouter();
    const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const { states, loading: loadingStates } = useFetchStates();
    const { cities, loading: loadingCities } = useFetchCities(selectedStateId ?? 0);
    console.log(states)
    console.log(cities)
    
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");


    // const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [isFocus2, setIsFocus2] = useState(false);


    const [errors, setErrors] = useState({
        businessName: "",
        address: "",
        state: "",
        city: "",
    });
    const renderLabel = (label: any, isFocus: any) => {
        if (isFocus) {
            return (
                <Text style={[styles.label, isFocus && { color: '#EF8B09' }]}>
                    {label}
                </Text>
            );
        }
        return null;
    };

    const { onboardUser, onboardingUser } = useOnboardUser(
        async (response) => {
            console.log(response, "Onboarding successful");
            const encryptedAesKey = response?.payload?.key;
            const token = response?.payload?.token;
            const user = response?.user;
            // 1. Generate RSA key pair asynchronously
            const { privateKey } = await getOrCreateRSAKeyPair();

            if (!encryptedAesKey || !token || !user) {
                console.error("Invalid response format from server:", response);
                throw new Error("Invalid response format from server.");
            }

            const decryptedAesKey = decryptAESKey(encryptedAesKey, privateKey);

            // 6. Store credentials securely
            await AsyncStorage.setItem("priKey", privateKey);
            await AsyncStorage.setItem("aesKey", decryptedAesKey);
            await AsyncStorage.setItem("jwt", token);
            await AsyncStorage.setItem("user", JSON.stringify(user));
        },
        Number(user_id),
        user_type
    );

    const validate = () => {
        const newErrors = {
            businessName: businessName ? "" : "Business name is required",
            address: address ? "" : "Address is required",
            state: selectedStateId ? "" : "State is required",
            city: selectedCityId ? "" : "City is required",
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleSubmit = async () => {
        if (user_type === "agent" && !validate()) return;

        try {
            // 1. Generate RSA key pair asynchronously
            const { publicKey } = await getOrCreateRSAKeyPair();
            if (user_type === "agent") {
                await onboardUser({
                    key: publicKey, // or another unique key as required
                    business_name: businessName,
                    address,
                    state_id: 1,
                    city_id: 1,
                    nin: NIN || null,
                    bvn: BVN || null,
                });
            } else {
                await onboardUser({
                    key: publicKey,
                });
            }
            router.push("/(tabs)/dashboard");
        } catch (error) {
            // handled in the hook
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.stepText}>Step 3 of 3</Text>
                <Text style={styles.title}>Tell us about your business</Text>

                <DynamicTextInput
                    customStyle={{ flexDirection: 'row', width: '100%' }}
                    label={`Name of Business`}
                    value={businessName}
                    inputType="text"
                    onChangeText={setBusinessName}
                />
                {errors.businessName ? <Text style={styles.errorText}>{errors.businessName}</Text> : null}

                <DynamicTextInput
                    customStyle={{ flexDirection: 'row', width: '100%' }}
                    label={`Address`}
                    value={address}
                    inputType="text"
                    onChangeText={setAddress}
                />
                {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
                <View style={styles.containerr}>
                    {renderLabel("State", isFocus)}
                    <Dropdown
                        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={states?.map((item) => ({ label: item.name, value: item.id })) || []}
                        search
                        maxHeight={300}
                        dropdownPosition="top"
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? "State" : ""}
                        searchPlaceholder="Search..."
                        value={!isFocus ? selectedStateId : ""}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                            setSelectedStateId(item.value);
                            setSelectedCityId(null); // reset city when state changes
                            setIsFocus(false);
                        }}
                    />
                </View>
                {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

                {/* <DynamicTextInput
                    customStyle={{ flexDirection: 'row', width: '100%' }}
                    label={`State`}
                    value={state}
                    inputType="text"
                    onChangeText={setState}
                /> */}
                {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
                <View style={styles.containerr}>
                    {renderLabel("City", isFocus2)}
                    <Dropdown
                        style={[styles.dropdown, isFocus2 && { borderColor: "blue" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={cities?.map((item) => ({ label: item.name, value: item.id })) || []}
                        search
                        dropdownPosition="top"
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus2 ? "City/Town" : ""}
                        searchPlaceholder="Search..."
                        value={!isFocus2 ? selectedCityId : ""}
                        onFocus={() => setIsFocus2(true)}
                        onBlur={() => setIsFocus2(false)}
                        onChange={(item) => {
                            setSelectedCityId(item.value);
                            setIsFocus2(false);
                        }}
                    />
                </View>
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

                {/* <DynamicTextInput
                    customStyle={{ flexDirection: 'row', width: '100%' }}
                    label={`City/Town`}
                    value={city}
                    inputType="text"
                    onChangeText={setCity}
                /> */}
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

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

                    <Button
                        mode="contained"
                        style={styles.continueButton}
                        onPress={handleSubmit}
                        loading={onboardingUser}
                        labelStyle={styles.continueLabel}
                    >
                        Continue
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
        backgroundColor: "#1E3A8A",
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center", // Added to centralize vertically
    },
    containerr: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 16,
        width: '100%',
    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        padding: 12,


    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        //   left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
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
    dropdownText: {
        fontSize: 16,
        color: "#333",
    },
    errorText: {
        color: 'red',
        alignSelf: 'flex-start',
        marginBottom: 10,
        // marginTop: -20,
    },
});
