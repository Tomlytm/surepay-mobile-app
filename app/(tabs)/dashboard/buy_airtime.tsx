import MonthYearPicker from "@/components/DateField";
import { useValidatePhoneNumber } from "@/services/queries/extra/utility";
import { AirtimePurchasePayload, useAirtimePurchase, useSubmitPin } from "@/services/queries/transactions";
import * as Contacts from "expo-contacts";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  View as RNView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from 'react-native-animatable';
import CurrencyInput from "react-native-currency-input";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ReactNativeModal from "react-native-modal";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { WebView } from "react-native-webview";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function BuyAirtime() {
  const params = useLocalSearchParams();
  
  const [phoneNumber, setPhoneNumber] = useState(params.phoneNumber as string || "0912146818");
  const [amount, setAmount] = useState<number | null>(params.amount ? Number(params.amount) : null);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [network, setNetwork] = useState((params.network as string)?.toLowerCase() || "mtn");
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
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
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
    
    // Handle both transfer and card payments with access_code (WebView)
    if (response?.access_code) {
      setAccessCode(response.access_code);
      setTransactionReference(response?.transaction?.reference || "");
      setCardModalVisible(false); // Close card modal if open
      setTransferModalVisible(true); // Open WebView modal
      return;
    }
    
    // Legacy card payment flow (if no access_code)
    if (response?.auth_url === null && response?.transaction?.reference) {
      setRequirePin(true);
      setReference(response.transaction.reference);
    } else if (response?.auth_url) {
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
    if (detectedNetwork && !params.buyAgain) {
      // Only auto-detect network if not coming from buy again
      const formatted = detectedNetwork.toLowerCase();
      if (["mtn", "airtel", "glo", "9mobile"].includes(formatted)) {
        setNetwork(formatted);
      }
    }
  }, [detectedNetwork, params.buyAgain]);

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
  const handleTransferPayment = () => {
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
        checkout_type: "TRANSFER",
        card_id: 1,
        save_card: false,
        card_data: null,
      },
    };

    purchaseAirtime(payload as unknown as AirtimePurchasePayload);
  };

  const handleWebViewNavigationChange = (navState: any) => {
    const { url, canGoBack, loading } = navState;
    console.log('WebView navigation state:', { url, canGoBack, loading });
    
    // More comprehensive success detection for Paystack
    const isSuccess = url.includes('success') || 
                     url.includes('callback') || 
                     url.includes('completed') ||
                     url.includes('payment/verify') ||
                     url.includes('payment-complete') ||
                     url.includes('transaction/verify') ||
                     url.includes('verify') ||
                     (url.includes('close') && !url.includes('cancel')) ||
                     url === 'about:blank';  // Sometimes Paystack redirects to blank page on success
    
    const isFailure = url.includes('cancel') || 
                     url.includes('failed') || 
                     url.includes('error') ||
                     url.includes('payment-cancelled') ||
                     url.includes('payment-failed');
    
    if (isSuccess && !loading) {
      console.log('Payment success detected, navigating to success screen');
      setTransferModalVisible(false);
      setAccessCode("");
      
      // Navigate to success screen with transaction details
      router.push({
        pathname: '/(tabs)/dashboard/transfer_success',
        params: {
          reference: transactionReference,
          amount: amount?.toString() || "0",
          phone: normalizedPhone,
          network: network.charAt(0).toUpperCase() + network.slice(1)
        }
      });
    } 
    else if (isFailure && !loading) {
      console.log('Payment failure detected');
      setTransferModalVisible(false);
      setAccessCode("");
      
      // Navigate to failed screen
      router.push({
        pathname: '/(tabs)/dashboard/transfer_failed',
        params: {
          reference: transactionReference,
        }
      });
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setTransferModalVisible(false);
    setAccessCode("");
    
    router.push({
      pathname: '/(tabs)/dashboard/transfer_failed',
      params: {
        reference: transactionReference,
      }
    });
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', data);
      
      if (data.type === 'payment.success' || data.event === 'successful') {
        console.log('Payment success message received');
        setTransferModalVisible(false);
        setAccessCode("");
        
        router.push({
          pathname: '/(tabs)/dashboard/transfer_success',
          params: {
            reference: transactionReference,
            amount: amount?.toString() || "0",
            phone: normalizedPhone,
            network: network.charAt(0).toUpperCase() + network.slice(1)
          }
        });
      } else if (data.type === 'payment.failed' || data.event === 'failed') {
        console.log('Payment failed message received');
        setTransferModalVisible(false);
        setAccessCode("");
        
        router.push({
          pathname: '/(tabs)/dashboard/transfer_failed',
          params: {
            reference: transactionReference,
          }
        });
      }
    } catch (error) {
      console.log('Non-JSON message received:', event.nativeEvent.data);
    }
  };

  const handlePay = () => {
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
        checkout_type: "CARD",
        card_id: 1,
        save_card: false,
        card_data: null,
      },
    };

    purchaseAirtime(payload as unknown as AirtimePurchasePayload);

  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
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
              // Ensure it starts with 0 and doesn't exceed 11 digits
              if (formatted.length > 0 && !formatted.startsWith("0")) {
                formatted = "0" + formatted;
              }
              // Limit to 11 digits
              if (formatted.length > 11) {
                formatted = formatted.substring(0, 11);
              }
              setPhoneNumber(formatted);
            }}

            keyboardType="phone-pad"
            maxLength={11}
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
          <>
            {[1, 2, 3, 4].map((index) => (
              <View key={index} style={styles.networkSkeleton} />
            ))}
          </>
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
                fontSize: 12,
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
            precision={0}
            minValue={0}
            maxValue={35000}
            placeholder="How Much?"
            placeholderTextColor="#959595"
            keyboardType="numeric"
            cursorColor="#34D399"
            style={styles.input}
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
        <TouchableOpacity style={styles.radioRow} onPress={() => setPaymentMethod("card")}>
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
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioRow} onPress={() => setPaymentMethod("transfer")}>
          <RadioButton value="transfer" />
          <Text
            style={{
              color: "#353535",
              fontFamily: "InstrumentSans",
              fontSize: 16,
            }}
          >
            Bank Transfer
          </Text>
        </TouchableOpacity>
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
            if (paymentMethod === "transfer") {
              handleTransferPayment();
            } else {
              handlePay(); // Directly call handlePay for card payments
            }
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
      {/* Card Payment Modal - Commented out since we now use WebView for both card and transfer payments */}
      {/* <ReactNativeModal
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
        >
          <KeyboardAwareScrollView
            contentContainerStyle={styles.cardModal}
            enableOnAndroid={true}
            extraScrollHeight={-30}
            keyboardShouldPersistTaps="handled"
          >
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
      </ReactNativeModal> */}

      {/* Transfer Payment Modal with WebView */}
      <ReactNativeModal
        isVisible={isTransferModalVisible}
        onBackdropPress={() => setTransferModalVisible(false)}
        style={styles.transferModalWrapper}
      >
        <View style={styles.transferModal}>
          <View style={styles.transferModalHeader}>
            <Text style={styles.transferModalTitle}>Complete Payment</Text>
            <TouchableOpacity 
              onPress={() => setTransferModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          
          {accessCode && (
            <WebView
              source={{ uri: `https://checkout.paystack.com/${accessCode}` }}
              onNavigationStateChange={handleWebViewNavigationChange}
              onMessage={handleWebViewMessage}
              onError={handleWebViewError}
              onHttpError={handleWebViewError}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1E3A8A" />
                  <Text style={styles.loadingText}>Loading payment...</Text>
                </View>
              )}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              mixedContentMode="compatibility"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              scalesPageToFit={true}
              bounces={false}
              decelerationRate="normal"
              onShouldStartLoadWithRequest={() => {
                return true;
              }}
              injectedJavaScript={`
                // Listen for Paystack events
                window.addEventListener('message', function(event) {
                  window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
                });
                
                // Monitor for page changes that indicate completion
                const observer = new MutationObserver(function(mutations) {
                  const body = document.body;
                  if (body && body.innerText) {
                    const text = body.innerText.toLowerCase();
                    if (text.includes('transaction successful') || 
                        text.includes('payment successful') ||
                        text.includes('success') ||
                        text.includes('completed') ||
                        text.includes('approved')) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'payment.success',
                        message: 'Payment completed successfully'
                      }));
                    } else if (text.includes('failed') || 
                               text.includes('declined') ||
                               text.includes('error') ||
                               text.includes('cancelled')) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'payment.failed',
                        message: 'Payment failed'
                      }));
                    }
                  }
                });
                
                if (document.body) {
                  observer.observe(document.body, { childList: true, subtree: true });
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    observer.observe(document.body, { childList: true, subtree: true });
                  });
                }
                
                true; // Required for injected JavaScript
              `}
            />
          )}
        </View>
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
    padding: Platform.OS === 'ios' ? 15 : 0,
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
    justifyContent: "space-between",
    marginBottom: 16,
  },
  networkButton: {
    borderRadius: 15,
    borderColor: "transparent",
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "transparent",
  },
  networkIcon: {
    width: 20,
    height: 20,
    marginLeft: -22,
    borderRadius: 5,
  },
  networkSkeleton: {
    flex: 1,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    marginHorizontal: 4,
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
  },
  transferModalWrapper: {
    justifyContent: 'center',
    margin: 0,
  },
  transferModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    height: '80%',
    overflow: 'hidden',
  },
  transferModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  transferModalTitle: {
    fontSize: 18,
    fontFamily: "InstrumentSansBold",
    color: '#353535',
  },
  closeButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: "InstrumentSans",
  },
});
