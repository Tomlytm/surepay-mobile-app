import DynamicTextInput from "@/components/TextInput";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, IconButton, List, Text, ActivityIndicator } from "react-native-paper";
import { useFetchTransactions } from "@/services/queries/transactions";

export default function BuyData() {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Fetch recent data transactions
  const { transactions: recentTransactions, loading: transactionsLoading } = useFetchTransactions({
    transaction_type: 'DATA',
    limit: 2,
    page: 1,
  });

  // Function to get network image based on network name
  const getNetworkImage = (network: string) => {
    const networkName = network?.toLowerCase();
    switch (networkName) {
      case 'mtn':
        return require("@/assets/images/mtn.png");
      case 'airtel':
        return require("@/assets/images/airtel.png");
      case 'glo':
        return require("@/assets/images/glo.png");
      case '9mobile':
        return require("@/assets/images/9mobile.png");
      default:
        return require("@/assets/images/mtn.png"); // fallback
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.backButton, { width: "100%", flexDirection: "row", alignItems: "center" }]}>
        <IconButton  style={{
            borderWidth: 1,
            borderColor: "#E4F2FD",
            borderRadius: 15,
            padding: 8,
            marginRight: 15
          }} icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text style={styles.title}>Buy Data</Text>
      </View>

      <Text style={styles.sectionTitle}>BUY DATA FOR</Text>

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
          onPress={() => router.push('/(tabs)/dashboard/buy_data')}
        />

      )}

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>RECENT PURCHASES</Text>

      {transactionsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading recent purchases...</Text>
        </View>
      ) : recentTransactions?.data && recentTransactions.data.length > 0 ? (
        recentTransactions.data.map((transaction, index) => (
          <View key={transaction.id || index} style={styles.purchaseItem}>
            <View style={styles.purchaseLeft}>
              <Image source={getNetworkImage(transaction.network)} style={styles.icon} />
              <View style={styles.purchaseText}>
                <Text style={styles.bold}>
                  {transaction.network} - {transaction.phone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3')}
                </Text>
                <Text style={styles.subText}>
                  ₦{Number(transaction.amount).toLocaleString()} • {new Date(transaction.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
            </View>
            <Button 
              mode="contained-tonal" 
              style={styles.buyAgainBtn}
              onPress={() => router.push({
                pathname: '/(tabs)/dashboard/buy_data',
                params: {
                  phoneNumber: transaction.phone,
                  amount: transaction.amount.toString(),
                  network: transaction.network?.toLowerCase(),
                  buyAgain: 'true'
                }
              })}
            >
              Buy Again
            </Button>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recent data purchases</Text>
          <Text style={styles.emptyStateSubText}>Your purchases will appear here</Text>
        </View>
      )}
      {showInput && (
        <Button
          mode="contained"
          style={{ backgroundColor: "#34D399", borderRadius: 35, padding: 10, marginTop: 40 }}
          labelStyle={{ color: "#1E3A8A", fontWeight: "bold", fontFamily: "InstrumentSansBold" }}
          onPress={() => { }}
        >
          Buy Data
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
    fontFamily: "InstrumentSans",
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "InstrumentSansSemiBold",
    marginBottom: 4,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "InstrumentSans",
  },
});
