import DynamicTextInput from "@/components/TextInput";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, IconButton, List, Text } from "react-native-paper";

export default function BuyAirtime() {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.backButton, { width: "100%", flexDirection: "row", alignItems: "center" }]}>
        <IconButton  style={{
            borderWidth: 1,
            borderColor: "#E4F2FD",
            borderRadius: 15,
            padding: 8,
            marginRight: 15
          }} icon="arrow-left" size={24} onPress={() => { if (showInput) { setShowInput(false) } }} />
        <Text style={styles.title}>Buy Airtime</Text>
      </View>

      <Text style={styles.sectionTitle}>BUY AIRTIME FOR</Text>

      <List.Item
        title="2348025550113"
        description="Airtel"
        left={() => <Image source={require("@/assets/images/airtel.png")} style={styles.icon} />}
        right={() => <IconButton icon="chevron-right" />}
        onPress={() => { }}
      />
      <List.Item
        title="2348067147289"
        description="MTN"
        left={() => <Image source={require("@/assets/images/mtn.png")} style={styles.icon} />}
        right={() => <IconButton icon="chevron-right" />}
        onPress={() => { }}
      />


      {showInput ? (
        // <TextInput
        //   style={styles.textInput}
        //   placeholder=""
        //   value={phoneNumber}
        //   onChangeText={setPhoneNumber}
        //   keyboardType="phone-pad"
        // />
        <DynamicTextInput
          label="Amount"
          value={phoneNumber}
          inputType="text"
        />
      ) : (
        <List.Item
          title="Buy for a new phone number"
          titleStyle={{ fontFamily: "InstrumentSansSemiBold" }}
          left={() => (
            <View style={{ backgroundColor: "#E6FFF6", padding: 5, borderRadius: 18 }}>
              <IconButton iconColor="#1E3A8A" icon="plus" />
            </View>
          )}
          onPress={() => router.push('/(tabs)/dashboard/buy_airtime')}
        />

      )}

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>RECENT PURCHASES</Text>

      <View style={styles.purchaseItem}>
        <View style={styles.purchaseLeft}>
          <Image source={require("@/assets/images/mtn.png")} style={styles.icon} />
          <View style={styles.purchaseText}>
            <Text style={styles.bold}>MTN - 2348067147306</Text>
            <Text style={styles.subText}>₦35,000 • Mar 18 at 12:34 PM</Text>
          </View>
        </View>
        <Button mode="contained-tonal" style={styles.buyAgainBtn}>
          Buy Again
        </Button>
      </View>

      <View style={styles.purchaseItem}>
        <View style={styles.purchaseLeft}>
          <Image source={require("@/assets/images/airtel.png")} style={styles.icon} />
          <View style={styles.purchaseText}>
            <Text style={styles.bold}>Airtel - 2348025550113</Text>
            <Text style={styles.subText}>₦35,000 • Mar 18 at 12:34 PM</Text>
          </View>
        </View>
        <Button mode="contained-tonal" style={styles.buyAgainBtn}>
          Buy Again
        </Button>
      </View>
      {showInput && (
        <Button
          mode="contained"
          style={{ backgroundColor: "#34D399", borderRadius: 35, padding: 10, marginTop: 40 }}
          labelStyle={{ color: "#1E3A8A", fontWeight: "bold", fontFamily: "InstrumentSansBold" }}
          onPress={() => { }}
        >
          Buy Airtime
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 25,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSansBold",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888",
    marginVertical: 8,
    fontWeight: "600",
    fontFamily: "InstrumentSansSemiBold",
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 6,
    alignSelf: "center",
  },
  divider: {
    marginVertical: 12,
  },
  purchaseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  purchaseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  purchaseText: {
    marginLeft: 8,
  },
  bold: {
    fontWeight: "600",
    fontSize: 15,
    fontFamily: "InstrumentSansSemiBold",
  },
  subText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "InstrumentSans",
  },
  buyAgainBtn: {
    borderRadius: 20,
    backgroundColor: "#e6f7f2",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
});
