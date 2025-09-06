// app/receipt.tsx
import { useSearchParams } from "expo-router/build/hooks";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card, Divider, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

export default function Receipt() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const title = searchParams.get("title") || "";
    const status = searchParams.get("status") || "";
    const description = searchParams.get("description") || "";
    const network = searchParams.get("network") || "";
    const amount = searchParams.get("amount") || "";
    const date = searchParams.get("date") || "";
    const icon = searchParams.get("icon") || "";
    const reference = searchParams.get("reference") || "";
    console.log(id, "id from search params");
    return (
        <View style={styles.container}>
            <View style={[styles.backButton,{ width: "100%", flexDirection: "row", alignItems: "center"}]}>

            <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => router.back()}
            />

            <Text style={styles.title}>Transaction Receipt</Text>
            </View>
            <View style={styles.card}>
                <IconButton
                    icon={"cellphone"}
                    size={58}
                    style={{ alignSelf: "center", marginBottom: 16 }}
                />
                <Text style={styles.amountLabel}>Airtime Recharge</Text>
                <Text style={styles.amount}>{amount}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Biller</Text>
                    <Text style={styles.value}>{network}</Text>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text style={styles.label}>Reference</Text>
                    <Text style={styles.val}>{reference}</Text>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text style={styles.label}>Narration</Text>
                    <Text style={styles.value}>{description}</Text>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text style={styles.label}>Transaction Status</Text>
                    <Text style={[styles.value, { color: status === "FAILED" ? "red" : "green" }]}>{status}</Text>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{date}</Text>
                </View>

            </View>

            <Button
                mode="contained-tonal"
                icon="alert-circle"
                
                labelStyle={{ color: '#F63B3B', fontFamily: "InstrumentSansSemiBold" }}
                style={styles.issueButton}
                onPress={() => { }}
            >
                Report an Issue
            </Button>

            <Button
                mode="contained"
                icon="download"
                
                labelStyle={{ color: '#1E3A8A', fontFamily: "InstrumentSansSemiBold" }}
                style={styles.downloadButton}
                onPress={() => { }}
            >
                Download
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "#fff",
    },
    backButton: {
        alignSelf: "flex-start",
        // marginBottom: 8,
        marginTop: 25,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        fontFamily: "InstrumentSansBold",
    },
    card: {
        borderRadius: 12,
        // elevation: 2,
        marginBottom: 24,
    },
    amountLabel: {
        textAlign: "center",
        fontSize: 14,
        color: "#666",
        fontFamily: "InstrumentSans",
    },
    amount: {
        textAlign: "center",
        fontSize: 26,
        // fontWeight: "bold",
        fontFamily: "InstrumentSansSemiBold",
        marginBottom: 24,
        marginTop: 4,
        color: '#1E3A8A'
    },
    row: {
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        color: "#757575",
        fontSize: 15,
        fontFamily: "InstrumentSans",
    },
    value: {
        fontWeight: "500",
        fontFamily: "InstrumentSans",
        color: '#353535',
        fontSize: 15,
    },
    val: {
        fontWeight: "500",
        fontFamily: "InstrumentSans",
        color: '#353535',
        fontSize: 12,
    },
    issueButton: {
        marginBottom: 12,
        marginTop: 20,
        backgroundColor: "#f8f8f8",
        paddingVertical: 12

    },
    downloadButton: {
        backgroundColor: "#E6FFF6",
        color: '#1E3A8A',
        paddingVertical: 12,
        fontSize: 16,
    },
});
