import React, { useEffect, useState } from "react";
import * as Animatable from 'react-native-animatable';
import {
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  View as RNView,
  KeyboardAvoidingView,
} from "react-native";
import {
  TextInput,
  Checkbox,
  RadioButton,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import CurrencyInput from "react-native-currency-input";
import * as Contacts from "expo-contacts";
import { StyleSheet, View, Text } from "react-native";
import ReactNativeModal from "react-native-modal";
import MonthYearPicker from "@/components/DateField";
import { useAirtimePurchase } from "@/services/queries/transactions";
import { useValidatePhoneNumber } from "@/services/queries/extra/utility";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSubmitPin } from "@/services/queries/transactions";

export default function BuyAirtime() {
  const [phoneNumber, setPhoneNumber] = useState("0912146818");
  const [amount, setAmount] = useState<number | null>(null);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [network, setNetwork] = useState("MTN");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCardModalVisible, setCardModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("5060990580000217499");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("111");
  const [cardType, setCardType] = useState<'verve' | 'visa' | 'mastercard' | 'unknown'>("unknown");
  // const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [firstname, setFirstname] = useState("Jay");
  const [lastname, setLastname] = useState("Jay");
  const [email, setEmail] = useState("waleyinka55@gmail.com");
  const [cardAddress, setCardAddress] = useState("test address");
  const [cardCity, setCardCity] = useState("lagos");
  const [cardState, setCardState] = useState("lagos");
  const [requirePin, setRequirePin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [modalManuallyClosed, setModalManuallyClosed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reference, setReference] = useState("");
  const normalizedPhone = phoneNumber.startsWith("+234")
    ? phoneNumber.replace("+234", "0")
    : phoneNumber;
  const { submitPin, submitting } = useSubmitPin((response) => {
      setCardModalVisible(false);
    router.push({
      pathname: '/(tabs)/dashboard/otpValidation',
      params: {
        phone: normalizedPhone,
        reference: response?.reference,
        supportMessage: response?.support_message,
        amount
      },
    });
    Toast.show({
      type: "success",
      text1: "PIN Submitted",
      text2: response?.message || "Your PIN was submitted successfully.",
    })
  });
  const handlePinSubmit = () => {
    const payload = {
      pin,
      reference
    }
    submitPin(payload);
  }
  const { purchaseAirtime, purchasing } = useAirtimePurchase((response) => {
    console.log("Airtime purchased successfully:", response);
    if (response?.auth_url === null && response?.transaction?.reference) {
      setRequirePin(true);
      setReference(response.transaction.reference);
    } else {
      router.push(response.auth_url);
      setCardModalVisible(false);
    }
  }, (error) => {
    console.error("Airtime purchase failed:", error);
    Toast.show({
      type: "error",
      text1: "Transaction Failed",
      text2: error?.message[0] || "Please try again later.",
    });
  });

  useEffect(() => {
    if (modalManuallyClosed && requirePin) {
      // Redirect to failed screen
      // Example: navigation.navigate("TransactionFailed");
      Toast.show({
        type: "error",
        text1: "Transaction Failed",
        text2: "Please try again later.",
      });
      console.log("Redirecting to failed transaction screen");
    }
  }, [modalManuallyClosed, requirePin]);

  const getCardType = (number: string) => {
    const clean = number.replace(/\s+/g, "");
    if (/^(506[0-9]|507[8-9]|6500)/.test(clean)) return "verve";
    if (/^4/.test(clean)) return "visa";
    if (/^5[1-5]/.test(clean)) return "mastercard";
    return "unknown";
  };


  const { data: detectedNetwork, refetch, loading } = useValidatePhoneNumber(normalizedPhone);

  useEffect(() => {
    if (normalizedPhone.length === 11) {
      refetch();
    }
  }, [normalizedPhone]);

  useEffect(() => {
    if (detectedNetwork) {
      // Match detected network to label case
      const formatted = detectedNetwork.toLowerCase();
      if (["mtn", "airtel", "glo", "9mobile"].includes(formatted)) {
        setNetwork(formatted);
      }
    }
  }, [detectedNetwork]);

  const renderCardLogo = () => {
    switch (cardType) {
      case "verve":
        return <Image source={require("@/assets/cards/verve.png")} style={styles.cardLogo} />;
      case "visa":
        return <Image source={require("@/assets/cards/visa.png")} style={styles.cardLogo} />;
      case "mastercard":
        return <Image source={require("@/assets/cards/mastercard.png")} style={styles.cardLogo} />;
      default:
        return <Image source={require("@/assets/cards/card.png")} style={styles.cardLogo} />;
    }
  };
  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied to access contacts.");
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const contactsWithPhone = data.filter(
      (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
    );

    setContacts(contactsWithPhone);
    setModalVisible(true);
  };

  const networks = [
    { label: "mtn", icon: require("@/assets/images/mtn.png") },
    { label: "airtel", icon: require("@/assets/images/airtel.png") },
    { label: "9mobile", icon: require("@/assets/images/9mobile.png") },
    { label: "glo", icon: require("@/assets/images/glo.png") },
  ];
  // const handleSelect = (month: number, year: number) => {
  //   const mm = (month + 1).toString().padStart(2, '0');
  //   setExpiry(`${mm} / ${year}`);
  // };
  const handlePay = () => {
    const [expMonth, expYear] = expiry.split("/").map(str => str.trim());

    // Remove first two digits from expYear if it's 4 digits (e.g., 2050 -> 50)
    let formattedExpYear = expYear;
    if (expYear && expYear.length === 4) {
      formattedExpYear = expYear.slice(2);
    }

    const capitalize = (str: string) => {
      if (str.toLowerCase() === "mtn") return str.toUpperCase();
      const match = str.match(/[a-zA-Z]/);
      if (!match) return str;
      const idx = match.index!;
      return str.slice(0, idx) + str.charAt(idx).toUpperCase() + str.slice(idx + 1);
    };

    const payload = {
      network: capitalize(network),
      phone: phoneNumber,
      amount: amount || 0,
      is_beneficiary: saveBeneficiary,
      payment_charge: {
        payment_card: "NEW",
        card_id: 1, // 0 if not using saved card
        card_data: {
          card_number: cardNumber,
          expiry_month: expMonth,
          expiry_year: formattedExpYear,
          security_code: cvv,
          fistname: firstname,
          lastname: lastname,
          email: email,
          phone: phoneNumber,
          address: cardAddress,
          city: cardCity,
          state: cardState,
          save_card: false,
        },
      },
    };

    purchaseAirtime(payload);

  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { }}
          style={{
            borderWidth: 1,
            borderColor: "#E4F2FD",
            borderRadius: 15,
            padding: 8,
          }}
        >
          <Icon name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.title}>Buy Airtime</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.inputWithIcon}>
          <TextInput
            value={phoneNumber}
            // onChangeText={setPhoneNumber}
            onChangeText={(text) => {
              let formatted = text.replace(/\s+/g, ""); // remove spaces
              if (formatted.startsWith("+234")) {
                formatted = formatted.replace("+234", "0");
              }
              setPhoneNumber(formatted);
            }}

            keyboardType="phone-pad"
            style={[styles.input, { flex: 1, paddingVertical: 10 }]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            mode="flat"
            placeholder="Enter phone number"
            placeholderTextColor="#959595"
            theme={{
              roundness: 10,
              fonts: {
                regular: { fontFamily: "InstrumentSans" },
              },
            }}
          />
          <TouchableOpacity onPress={openContactPicker}>
            <Icon
              name="contacts"
              size={24}
              color="#1E3A8A"
              style={styles.contactIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {hasError && (!phoneNumber || normalizedPhone.length !== 11) && (
        <Text style={{ color: "red", fontSize: 13, marginBottom: 6 }}>
          Please enter a valid 11-digit phone number.
        </Text>
      )}
      <View style={styles.checkboxRow}>
        <Checkbox
          status={saveBeneficiary ? "checked" : "unchecked"}
          onPress={() => setSaveBeneficiary(!saveBeneficiary)}
        />
        <Text
          style={{
            color: "#353535",
            fontFamily: "InstrumentSans",
            fontSize: 16,
          }}
        >
          Save as beneficiary
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Select Network Provider</Text>

      <View style={styles.networkRow}>
        {loading && normalizedPhone.length === 11 ? (
          <ActivityIndicator />
        ) : (
          networks.map((item) => (
            <Button
              key={item.label}
              mode={network === item.label ? "contained" : "outlined"}
              onPress={() => setNetwork(item.label)}
              style={[
                styles.networkButton,
                {
                  borderColor:
                    network === item.label ? "#34D399" : "#94BDFF",
                  borderWidth: 1,
                  backgroundColor:
                    network === item.label ? "#E6FFF6" : "#fff",
                },
              ]}
              contentStyle={{
                paddingVertical: 10,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              labelStyle={{
                color: network === item.label ? "#353535" : "#757575",
                fontFamily: "InstrumentSansSemiBold",
                fontSize: 14,
                textTransform: item.label !== "mtn" ? "capitalize" : "uppercase",
                width: "100%",
              }}
              icon={() => (
                <Image source={item.icon} style={styles.networkIcon} />
              )}
            >
              {item.label}
            </Button>
          )))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount</Text>
        <View style={styles.containerr}>
          <Text style={styles.prefix}>₦</Text>
          <CurrencyInput
            value={amount}
            onChangeValue={setAmount}
            delimiter=","
            separator="."
            precision={1}
            minValue={0}
            placeholder="How Much?"
            placeholderTextColor="#959595"
            style={styles.input}
            onChangeText={(formattedValue) => {
              console.log(formattedValue);
            }}
          />
        </View>
        <Text
          style={{
            color: "#1E3A8A",
            fontSize: 12,
            fontFamily: "InstrumentSans",
            marginTop: 5,
          }}
        >
          Maximum amount: ₦35,000
        </Text>
      </View>
      {hasError && (!amount || amount <= 0) && (
        <Text style={{ color: "red", fontSize: 13, marginBottom: 6 }}>
          Please enter a valid amount.
        </Text>
      )}

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <RadioButton.Group
        onValueChange={setPaymentMethod}
        value={paymentMethod}
      >
        <View style={styles.radioRow}>
          <RadioButton value="card" />
          <Text
            style={{
              color: "#353535",
              fontFamily: "InstrumentSans",
              fontSize: 16,
            }}
          >
            Pay with Card
          </Text>
        </View>
      </RadioButton.Group>


      {/* Error messages */}

      {/* {hasError && (!network || !["mtn", "airtel", "glo", "9mobile"].includes(network.toLowerCase())) && (
        <Text style={{ color: "red", fontSize: 13, marginBottom: 6 }}>
          Please select a network provider.
        </Text>
      )} */}

      <Button
        mode="contained"
        style={styles.buyButton}
        labelStyle={styles.buyButtonText}
        onPress={() => {
          let error = false;
          if (!phoneNumber || normalizedPhone.length !== 11) {
            setHasError(true);
            error = true;
          }
          if (!amount || amount <= 0) {
            setHasError(true);
            error = true;
          }
          if (!network || !["mtn", "airtel", "glo", "9mobile"].includes(network.toLowerCase())) {
            setHasError(true);
            error = true;
          }
          if (!error) {
            setHasError(false);
            setCardModalVisible(true);
          }

        }}
      >
        Buy Airtime
      </Button>

      {/* Contact Picker Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <RNView style={styles.modalContainer}>
          <RNView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TextInput
              placeholder="Search contacts"
              style={{ marginBottom: 12, backgroundColor: "#F5F5F5" }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="flat"
              theme={{
                roundness: 10,
                fonts: {
                  regular: { fontFamily: "InstrumentSans" },
                },
              }}
            />
            {(() => {
              const filteredContacts = contacts.filter(
                (contact) =>
                  (contact.name ?? "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  (contact.phoneNumbers?.[0]?.number ?? "")
                    .replace(/\s+/g, "")
                    .includes(searchQuery.replace(/\s+/g, ""))
              );
              if (filteredContacts.length === 0) {
                return (
                  <Text style={{ color: "red", textAlign: "center", marginVertical: 20 }}>
                    No contacts found for &#39;{searchQuery}&#39;.
                  </Text>
                );
              }
              return (
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item: any) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.contactItem}
                      onPress={() => {
                        const number = item.phoneNumbers?.[0]?.number ?? "";
                        setPhoneNumber(number.replace(/\s+/g, ""));
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactNumber}>
                        {item.phoneNumbers?.[0]?.number}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              );
            })()}
            <Button onPress={() => { setModalVisible(false); setSearchQuery(''); }}>Close</Button>
          </RNView>
        </RNView>
      </Modal>
      <ReactNativeModal
        isVisible={isCardModalVisible}
        onBackdropPress={() => {
          setCardModalVisible(false);
          setModalManuallyClosed(true);
          if (requirePin) {
            setRequirePin(false)
            setPin('')
          }
        }}
        onSwipeComplete={() => {
          setCardModalVisible(false);
          setModalManuallyClosed(true);
          if (requirePin) {
            setRequirePin(false)
            setPin('')
          }
        }}
        swipeDirection="down"
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.cardModalWrapper}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // style={{ flex: 1 }}
        >
          <KeyboardAwareScrollView
            contentContainerStyle={styles.cardModal}
            enableOnAndroid={true}
            extraScrollHeight={-30} // Adjust if necessary
            keyboardShouldPersistTaps="handled"
          >
            {/* All modal content goes here */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E5E5" }} />
            </View>
            <Text style={styles.cardModalTitle}>Pay with Card</Text>

            <View style={styles.cardRowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={styles.currency}>₦</Text>
                <Text style={styles.cardDueLabel}>Amount Due</Text>
              </View>
              <Text style={styles.cardDueAmount}>₦{amount?.toLocaleString()}</Text>
            </View>

            <Text style={styles.label}>Card Number</Text>
            <View style={styles.cardRow}>
              {renderCardLogo()}
              <TextInput
                value={cardNumber}

                editable={!requirePin}
                onChangeText={(text) => {
                  setCardNumber(text);
                  setCardType(getCardType(text));
                }}
                theme={{
                  fonts: {
                    regular: { fontFamily: "InstrumentSans" },
                  },
                }}

                placeholderTextColor={'#959595'}
                placeholder="#### #### #### ####"
                style={styles.input}
                underlineColor="transparent"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Expiry Date</Text>

                <MonthYearPicker value={expiry} onChange={setExpiry} />

              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>CVV/CVC</Text>
                <View style={styles.cardRow}>
                  <TextInput
                    value={cvv}
                    editable={!requirePin}
                    onChangeText={setCvv}
                    placeholder="###"
                    placeholderTextColor="#959595"
                    style={styles.input}
                    secureTextEntry
                    keyboardType="number-pad"
                    underlineColor="transparent"
                  />
                </View>
              </View>
            </View>
            {requirePin && (
              <Animatable.View animation="pulse" iterationCount={4} >
                <Text style={styles.label}>Enter Card PIN</Text>
                <View style={[styles.cardRow,
                {
                  borderWidth: 1,
                  borderColor: pinError ? "red" : "#94BDFF",
                  borderRadius: 10,
                }
                ]}>
                  <TextInput
                    value={pin}
                    onChangeText={(value) => {
                      setPin(value);
                      setPinError(value.length < 4 ? "PIN must be 4 digits" : "");
                    }}
                    placeholder="****"
                    secureTextEntry
                    maxLength={4}
                    keyboardType="number-pad"
                    style={[
                      styles.input,
                    ]}
                    underlineColor="transparent"
                  />
                </View>
                {pinError ? (
                  <Text style={{ color: "red", fontSize: 12, marginTop: -14, marginBottom: 20 }}>
                    {pinError}
                  </Text>
                ) : null}
              </Animatable.View>
            )}

            {
              !requirePin ? (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handlePay}
                >
                  {purchasing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.payButtonText}>Pay ₦{amount?.toLocaleString()}</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handlePinSubmit}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.payButtonText}>Submit PIN</Text>
                  )}
                </TouchableOpacity>
              )
            }
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </ReactNativeModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSansBold",
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: "#353535",
    marginBottom: 12,
    fontWeight: "600",
    fontFamily: "InstrumentSansSemiBold",
  },
  containerr: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#94BDFF",
    padding: 15,
  },
  prefix: {
    fontSize: 21,
    color: "#34D399",
    marginRight: 4,
  },
  input: {
    fontSize: 16,
    backgroundColor: "transparent",
    fontFamily: "InstrumentSans",
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#94BDFF",
    borderRadius: 12,
    paddingRight: 10,
    backgroundColor: "white",
    height: 50,
  },
  contactIcon: {
    marginLeft: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#353535",
    marginVertical: 15,
    fontWeight: "600",
    fontFamily: "InstrumentSansSemiBold",
  },
  networkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    marginBottom: 16,
  },
  networkButton: {
    marginRight: 10,
    borderRadius: 15,
    borderColor: "transparent",
    width: 80,
    backgroundColor: "transparent",
  },
  networkIcon: {
    width: 24,
    height: 24,
    marginLeft: -27,
    borderRadius: 5,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buyButton: {
    marginTop: 24,
    backgroundColor: "#34D399",
    borderRadius: 35,
    padding: 10,
  },
  buyButtonText: {
    color: "#1E3A8A",
    fontWeight: "bold",
    fontFamily: "InstrumentSansBold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    minHeight: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "InstrumentSansBold",
    marginBottom: 10,
  },
  contactItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contactName: {
    fontSize: 16,
    fontFamily: "InstrumentSansSemiBold",
  },
  contactNumber: {
    fontSize: 14,
    color: "#666",
    fontFamily: "InstrumentSans",
  },
  label: {
    fontSize: 14,
    marginBottom: 7,
    color: '#353535',
    fontFamily: "InstrumentSansSemiBold",
  },
  cardModalWrapper: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  cardModal: {
    backgroundColor: '#fff',
    padding: 20,
    minHeight: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardModalTitle: {
    color: '#353535',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: "InstrumentSansBold",
    marginBottom: 15,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 30
  },
  currency: {
    color: '#E4F2FD',
    backgroundColor: '#1E3A8A',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 13,
    fontWeight: 600,
    // fontFamily: "InstrumentSansBold",
    fontSize: 22,
    fontStyle: 'italic',
  },
  cardDueLabel: {
    color: '#757575',
    fontFamily: "InstrumentSans",
    fontSize: 14,
  },
  cardDueAmount: {
    color: '#1E3A8A',
    fontFamily: "InstrumentSans",
    fontSize: 21,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#94BDFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 25,
    fontFamily: 'InstrumentSans',
  },
  cardLogo: {
    width: 30,
    height: 24,
    padding: 3
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  payButton: {
    backgroundColor: '#10B981',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    fontFamily: "InstrumentSansBold",
  },
  payButtonText: {
    color: '#fff',
    fontFamily: "InstrumentSansBold",
    fontSize: 16
  }
});
