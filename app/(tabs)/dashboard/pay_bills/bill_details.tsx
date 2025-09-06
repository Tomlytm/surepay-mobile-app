"use client"

import { useFetchBillersBouquet } from "@/services/queries/billers/get"
import {
  useAirtimePurchase,
  useBetPurchase,
  useDataPurchase,
  useEducationPurchase,
  useElectricityPurchase,
  useInternetPurchase,
  useSubmitOtp,
  useSubmitPin,
  useTvPurchase,
  type AirtimePurchasePayload,
  type BetPurchasePayload,
  type DataPurchasePayload,
  type EducationPurchasePayload,
  type ElectricityPurchasePayload,
  type InternetPurchasePayload,
  type TvPurchasePayload,
} from "@/services/queries/transactions"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { WebView } from "react-native-webview"

const paymentData = {
  payment_card: "NEW", // Default to debit card
  card_id: 1,
  card_data: {
    card_number: "5060990580000217499",
    expiry_month: "03",
    expiry_year: "50",
    security_code: "111",
    fistname: "Jay",
    lastname: "Jay",
    email: "waleyinka55@gmail.com",
    phone: "0912146818",
    address: "test address",
    city: "lagos",
    state: "lagos",
    save_card: false,
  },
  checkout_type: "INLINE",
}
interface Bouquet {
  id: string
  name: string
  price: number
  type: string
  code: string
  description: string
}

interface Biller {
  id: string
  name: string
  category: string
  logo?: string | any
  image?: string | any
  initials?: string
  info?: string
  isBouquetService?: string
  selectedBouquet?: Bouquet
}

interface BillerDetailsScreenProps {
  onBack?: () => void
}

// Payment flow states
type PaymentStep = "form" | "processing" | "pin" | "otp" | "success" | "failed"

// Dummy data for dropdowns
const paymentTypes = ["School Fees", "Tuition", "Exam Fees", "Other"]
const subscriptionPackages = ["Basic Plan", "Premium Plan", "Family Plan", "Sports Package"]
function extractProvider(value: string): string {
  if (!value) return ""

  // Split by "-"
  const [provider] = value.split("-")

  // Normalize casing (capitalize first letter, rest lowercase)
  // return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
  return provider
}

const BillerDetailsScreen: React.FC<BillerDetailsScreenProps> = ({ onBack }) => {
  // ...

  const [webviewUrl, setWebviewUrl] = useState<string | null>(null)
  const [showWebview, setShowWebview] = useState(false)

  const [biller, setBiller] = useState<Biller | null>(null)
  const [loadingBiller, setLoadingBiller] = useState(true)
  const [amount, setAmount] = useState("")
  const router = useRouter()
  const [meterType, setMeterType] = useState<"Postpaid" | "Prepaid">("Postpaid")
  const [meterNumber, setMeterNumber] = useState("")
  const [paymentType, setPaymentType] = useState("Select payment type")
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [subscriptionPackage, setSubscriptionPackage] = useState("Select product")
  const [smartcardNumber, setSmartcardNumber] = useState("")
  const [isPaymentTypeModalVisible, setPaymentTypeModalVisible] = useState(false)
  const [isSubscriptionPackageModalVisible, setSubscriptionPackageModalVisible] = useState(false)

  // Payment flow states
  const [bouquets, setBouquets] = useState<Bouquet[]>([])
  const [loadingBouquets, setLoadingBouquets] = useState(true)
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null)
  const [isBouquetModalVisible, setIsBouquetModalVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState<PaymentStep>("form")
  const [paymentReference, setPaymentReference] = useState<string>("")
  const [pin, setPin] = useState("")
  const [otp, setOtp] = useState("")
  const [transactionData, setTransactionData] = useState<any>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null)

  // Payment flow states
  const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [showPaymentResult, setShowPaymentResult] = useState(false)

  const [cardNumber, setCardNumber] = useState("5060990580000217499")
  const [expiryMonth, setExpiryMonth] = useState("03")
  const [expiryYear, setExpiryYear] = useState("50")
  const [securityCode, setSecurityCode] = useState("111")
  const [cardholderName, setCardholderName] = useState("Jay Jay")
  const [showCardInputs, setShowCardInputs] = useState(false)

  const [otpCode, setOtpCode] = useState("")
  const [otpReference, setOtpReference] = useState("")

  const [phoneNumber, setPhoneNumber] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [serviceType, setServiceType] = useState("")

  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [serviceTypeModalVisible, setServiceTypeModalVisible] = useState(false)

  const maximumAmount = "35,000"

  const scrollViewRef = useRef<ScrollView>(null)

  // Transaction hooks with proper error handling
  const electricityPurchase = useElectricityPurchase(
    (response) => {
      console.log("Electricity purchase success:", response)
      handlePaymentSuccess(response)
    },
    (error) => {
      console.error("Electricity purchase error:", error)
      handlePaymentError(error)
    },
  )

  const educationPurchase = useEducationPurchase(
    (response) => {
      console.log("Education purchase success:", response)
      handlePaymentSuccess(response)
    },
    (error) => {
      console.error("Education purchase error:", error)
      handlePaymentError(error)
    },
  )

  const betPurchase = useBetPurchase(
    (response) => {
      console.log("Bet purchase success:", response)
      handlePaymentSuccess(response)
    },
    (error) => {
      console.error("Bet purchase error:", error)
      handlePaymentError(error)
    },
  )

  const tvPurchase = useTvPurchase(
    (response) => {
      console.log("TV purchase success:", response)
      if (response?.auth_url) {
        setWebviewUrl(response.auth_url)
        setShowWebview(true) // this will trigger WebView UI
      } else if (response?.reference || response?.transaction?.reference) {
        const reference = response.reference || response.transaction.reference
        setPaymentReference(reference)
        setCurrentStep("pin")
      } else {
        handlePaymentSuccess(response)
      }
    },
    (error) => {
      console.error("TV purchase error:", error)
      handlePaymentError(error)
    },
  )

  const internetPurchase = useInternetPurchase(
    (response) => {
      console.log("Internet purchase success:", response)
      handlePaymentSuccess(response)
    },
    (error) => {
      console.error("Internet purchase error:", error)
      handlePaymentError(error)
    },
  )

  const pinSubmission = useSubmitPin(
    (response) => {
      console.log("PIN submission success:", response)
      if (response?.reference) {
        setOtpReference(response.reference)
        setCurrentStep("otp")
        setPaymentSuccess(response)
      } else {
        setCurrentStep("success")
      }
      setTransactionData(response)
    },
    (error) => {
      console.error("PIN submission error:", error)
      handlePaymentError(error)
    },
  )

  const otpSubmission = useSubmitOtp(
    (response) => {
      console.log("OTP submission success:", response)
      setCurrentStep("success")
      setTransactionData(response)
    },
    (error) => {
      console.error("OTP submission error:", error)
      handlePaymentError(error)
    },
  )
  const airtimePurchase = useAirtimePurchase(
    (response) => {
      console.log("Airtime purchase success:", response)
      handlePaymentSuccess(response)
    },
    (error) => {
      console.error("Airtime purchase error:", error)
      handlePaymentError(error)
    },
  )
  const dataPurchase = useDataPurchase(
    (response) => {
      console.log("Data purchase success:", response)
      handlePaymentSuccess(response)
    },
    (error) => {
      console.error("Data purchase error:", error)
      handlePaymentError(error)
    },
  )
  useEffect(() => {
    const loadBiller = async () => {
      try {
        const storedBiller = await AsyncStorage.getItem("selectedBiller")
        if (storedBiller) {
          const billerData = JSON.parse(storedBiller)
          setBiller(billerData)

          if (billerData.selectedBouquet) {
            setSelectedBouquet(billerData.selectedBouquet)
            setSubscriptionPackage(billerData.selectedBouquet.code)
            setAmount(String(billerData.selectedBouquet.price))
          }
        } else {
          Alert.alert("Error", "No biller selected. Please go back and select one.")
          onBack?.()
        }
      } catch (error) {
        console.error("Failed to load biller from AsyncStorage:", error)
        Alert.alert("Error", "Failed to load biller details.")
        onBack?.()
      } finally {
        setLoadingBiller(false)
      }
    }
    loadBiller()

    const loadBouquets = async () => {
      try {
        const storedBouquets = await AsyncStorage.getItem("allBouquets")
        if (storedBouquets) {
          setBouquets(JSON.parse(storedBouquets))
        }
      } catch (error) {
        console.error("Failed to load bouquets from AsyncStorage:", error)
      } finally {
        setLoadingBouquets(false)
      }
    }
    loadBouquets()
  }, [])

  const { data: fetchedBouquets, loading: fetchingBouquets } = useFetchBillersBouquet(
    biller?.category || "",
    biller?.id || "",
  )
  console.log("fetchedBouquets", fetchedBouquets)
  console.log("biller", biller)

  useEffect(() => {
    if (fetchedBouquets && fetchedBouquets.length > 0) {
      setBouquets(fetchedBouquets as any)
      setLoadingBouquets(false)
    }
  }, [fetchedBouquets])

  // Dummy logic for student name based on student ID
  useEffect(() => {
    if (biller?.category === "Other Collections" && studentId === "0258846856") {
      setStudentName("Patrick Kanu")
    } else if (biller?.category === "Other Collections" && studentId) {
      setStudentName("Unknown Student")
    } else {
      setStudentName("")
    }
  }, [studentId, biller?.category])

  // Payment success handler
  const handlePaymentSuccess = (response: any) => {
    setTransactionData(response)

    // Check if PIN or OTP is required
    if (response?.requiresPin || response?.transaction?.reference) {
      setPaymentReference(response.reference || response.transaction.reference)
      setCurrentStep("pin")
    } else if (response?.requiresOtp) {
      setPaymentReference(response.reference || response.transaction.reference)
      setCurrentStep("otp")
    } else {
      setCurrentStep("success")
    }
  }

  // Payment error handler
  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error)
    setCurrentStep("failed")
    Alert.alert("Payment Failed", error?.message || "An error occurred during payment. Please try again.")
  }

  // PIN submission handlers
  const handlePinSuccess = (response: any) => {
    if (response?.requiresOtp) {
      setCurrentStep("otp")
    } else {
      setCurrentStep("success")
    }
  }

  const handlePinError = (error: any) => {
    Alert.alert("PIN Verification Failed", error?.message || "Invalid PIN. Please try again.")
    setPin("")
  }

  // OTP submission handlers
  const handleOtpSuccess = (response: any) => {
    setCurrentStep("success")
  }

  const handleOtpError = (error: any) => {
    Alert.alert("OTP Verification Failed", error?.message || "Invalid OTP. Please try again.")
    setOtp("")
  }

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP")
      return
    }

    try {
      await otpSubmission.submitOtp({
        otp: otpCode,
        reference: otpReference,
      })
    } catch (error) {
      console.error("OTP submission error:", error)
    }
  }

  const createPaymentPayload = () => {
    const basePaymentCharge = 50 // Base charge in Naira

    const updatedPaymentData = {
      ...paymentData,
      card_data: {
        ...paymentData.card_data,
        card_number: cardNumber,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        security_code: securityCode,
        fistname: cardholderName.split(" ")[0] || "Jay",
        lastname: cardholderName.split(" ")[1] || "Jay",
      },
    }

    if (biller?.category === "disco") {
      const electricityPayload: ElectricityPurchasePayload = {
        customer_name: "Jay Jay",
        customer_address: "test address",
        meter_no: meterNumber,
        biller_id: biller.id,
        email_address: "waleyinka55@gmail.com",
        phone: "0912146818",
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
      }
      return electricityPayload
    }

    if (biller?.category === "education") {
      const educationPayload: EducationPurchasePayload = {
        biller_id: biller.id,
        bouquet_code: paymentType, // Using payment type as bouquet code
        payment_charge: updatedPaymentData,
      }
      return educationPayload
    }

    if (biller?.category === "tv") {
      const tvPayload: TvPurchasePayload = {
        customer_name: "John Doe",
        customer_number: smartcardNumber,
        bouquet_code: subscriptionPackage,
        addon_code: "", // Optional addon
        smartcard_no: smartcardNumber,
        biller_id: biller.id,
        payment_charge: updatedPaymentData,
      }
      return tvPayload
    }

    if (biller?.category === "vtu") {
      const vtuAirtelPayload = {
        network: extractProvider(biller.id),
        // biller_id: biller.id,
        phone: phoneNumber,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
        is_beneficiary: false,
      }
      const vtuDataPayload = {
        plan_id: selectedBouquet?.code,
        network: extractProvider(biller.id),
        // biller_id: biller.id,
        phone: phoneNumber,
        // amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
        is_beneficiary: false,
      }

      if (biller?.category === "vtu" && biller.isBouquetService === "Yes") {
        return vtuDataPayload
      }
      return vtuAirtelPayload
    }

    if (biller?.category === "internet") {
      const internetPayload = {
        biller_id: biller.id,
        bouquet_code: customerId,
        customer_address: "test address",
        account_id: "8990",
        customer_name: "Jay Jay",
        // plan_code: selectedPlan,
        // amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
      }
      return internetPayload
    }

    if (biller?.category === "bet") {
      const betPayload = {
        customer_name: "Jay Jay",
        biller_id: biller.id,
        bet_account_id: customerId,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
      }
      return betPayload
    }

    if (biller?.category === "airtimeVoucher") {
      const airtimePayload = {
        biller_id: biller.id,
        phone_number: phoneNumber,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
      }
      return airtimePayload
    }

    if (biller?.category === "banking") {
      const bankingPayload = {
        biller_id: biller.id,
        account_number: accountNumber,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
      }
      return bankingPayload
    }

    if (biller?.category === "kyc") {
      const kycPayload = {
        biller_id: biller.id,
        customer_id: customerId,
        service_type: serviceType,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        payment_charge: updatedPaymentData,
      }
      return kycPayload
    }

    return null
  }

  const handleMakePayment = async () => {
    if (!biller) return
    // Validation
    if (!amount || Number.parseFloat(amount.replace(/,/g, "")) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.")
      return
    }

    if (biller.category === "disco" && !meterNumber) {
      Alert.alert("Error", "Please enter meter number.")
      return
    }
    if (biller.category === "education" && (!studentId || paymentType === "Select payment type")) {
      Alert.alert("Error", "Please enter student ID and select payment type.")
      return
    }
    if (biller.category === "tv" && (!smartcardNumber || subscriptionPackage === "Select product")) {
      Alert.alert("Error", "Please enter smartcard number and select subscription package.")
      return
    }
    if (biller.category === "vtu" && !phoneNumber) {
      Alert.alert("Error", "Please enter phone number.")
      return
    }
    if (biller.category === "vtu" && biller.isBouquetService === "Yes" && !selectedBouquet) {
      Alert.alert("Error", "Please select a plan.")
      return
    }
    // if (biller.category === "internet" && (!customerId || !selectedPlan)) {
    //   Alert.alert("Error", "Please enter customer ID and select a plan.")
    //   return
    // }
    if (biller.category === "bet" && !customerId) {
      Alert.alert("Error", "Please enter customer ID.")
      return
    }
    if (biller.category === "airtimeVoucher" && !phoneNumber) {
      Alert.alert("Error", "Please enter phone number.")
      return
    }
    if (biller.category === "banking" && !accountNumber) {
      Alert.alert("Error", "Please enter account number.")
      return
    }
    if (biller.category === "kyc" && (!customerId || !serviceType)) {
      Alert.alert("Error", "Please enter customer ID and select service type.")
      return
    }

    const payload = createPaymentPayload()
    if (!payload) {
      Alert.alert("Error", "Invalid payment configuration.")
      return
    }

    setCurrentStep("processing")

    try {
      if (biller.category === "disco") {
        await electricityPurchase.purchaseElectricity(payload as ElectricityPurchasePayload)
      } else if (biller.category === "education") {
        await educationPurchase.purchaseEducation(payload as EducationPurchasePayload)
      } else if (biller.category === "tv") {
        await tvPurchase.purchaseTv(payload as TvPurchasePayload)
      } else if (biller.category === "vtu") {
        if (biller.isBouquetService === "Yes") {
          await dataPurchase.purchaseData(payload as DataPurchasePayload)
        } else {
          await airtimePurchase.purchaseAirtime(payload as AirtimePurchasePayload)
        }
        console.log("VTU purchase:", payload)
      } else if (biller.category === "internet") {
        await internetPurchase.purchaseInternet(payload as InternetPurchasePayload)
        // Add internet purchase logic
        console.log("Internet purchase:", payload)
      } else if (biller.category === "bet") {
        // Add betting purchase logic
        await betPurchase.purchaseBet(payload as unknown as BetPurchasePayload)
        console.log("Betting purchase:", payload)
      } else if (biller.category === "airtimeVoucher") {
        // Add airtime voucher purchase logic
        console.log("Airtime voucher purchase:", payload)
      } else if (biller.category === "banking") {
        // Add banking purchase logic
        console.log("Banking purchase:", payload)
      } else if (biller.category === "kyc") {
        // Add KYC purchase logic
        console.log("KYC purchase:", payload)
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      setCurrentStep("failed")
    }
  }

  const handlePinSubmission = async () => {
    if (!pin || pin.length < 4) {
      Alert.alert("Error", "Please enter a valid PIN.")
      return
    }

    try {
      await pinSubmission.submitPin({
        pin: pin,
        reference: paymentReference,
      })
    } catch (error) {
      console.error("PIN submission error:", error)
    }
  }

  const handleOtpSubmission = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Error", "Please enter a valid OTP.")
      return
    }

    try {
      await otpSubmission.submitOtp({
        otp: otp,
        reference: paymentReference,
      })
    } catch (error) {
      console.error("OTP submission error:", error)
    }
  }

  const resetPaymentFlow = async () => {
    setCurrentStep("form")
    setAmount("")
    setMeterNumber("")
    setPaymentType("Select payment type")
    setStudentId("")
    setStudentName("")
    setSubscriptionPackage("Select product")
    setSmartcardNumber("")
    setPin("")
    setOtp("")
    setPaymentReference("")
    setTransactionData(null)

    // Clear stored biller
    await AsyncStorage.removeItem("selectedBiller")
  }

  const isLoading = () => {
    return (
      currentStep === "processing" ||
      electricityPurchase.purchasing ||
      educationPurchase.purchasing ||
      tvPurchase.purchasing ||
      pinSubmission.submitting ||
      otpSubmission.submitting
    )
  }

  // Render PIN input modal
  const renderPinModal = () => (
    <Modal visible={currentStep === "pin"} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.pinModalContainer}>
          <Text style={styles.pinModalTitle}>Enter PIN</Text>
          <Text style={styles.pinModalSubtitle}>Please enter your transaction PIN to continue</Text>

          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            placeholder="Enter 4-digit PIN"
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />

          <View style={styles.pinModalButtons}>
            <TouchableOpacity style={[styles.pinButton, styles.pinButtonCancel]} onPress={() => setCurrentStep("form")}>
              <Text style={styles.pinButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pinButton, styles.pinButtonSubmit]}
              onPress={handlePinSubmission}
              disabled={pinSubmission.submitting}
            >
              {pinSubmission.submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.pinButtonTextSubmit}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Render OTP input modal
  const renderOtpModal = () => (
    <Modal visible={currentStep === "otp"} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.pinModalContainer}>
          <Text style={styles.pinModalTitle}>Enter OTP</Text>
          <Text style={styles.pinModalSubtitle}>
            {paymentSuccess?.message || "Please enter the OTP sent to your registered phone number"}
          </Text>

          <TextInput
            style={styles.pinInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            keyboardType="numeric"
            maxLength={6}
          />

          <Text style={styles.pinModalSubtitle}>{paymentSuccess?.support_message}</Text>
          <View style={styles.pinModalButtons}>
            <TouchableOpacity style={[styles.pinButton, styles.pinButtonCancel]} onPress={() => setCurrentStep("form")}>
              <Text style={styles.pinButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pinButton, styles.pinButtonSubmit]}
              onPress={handleOtpSubmission}
              disabled={otpSubmission.submitting}
            >
              {otpSubmission.submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.pinButtonTextSubmit}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Render success modal
  const renderSuccessModal = () => (
    <Modal visible={currentStep === "success"} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.successModalContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            Your payment of ₦{amount} for {biller?.name} has been processed successfully.
          </Text>

          {paymentReference && <Text style={styles.referenceText}>Reference: {paymentReference}</Text>}

          <TouchableOpacity
            style={styles.successButton}
            onPress={async () => {
              await resetPaymentFlow()
              onBack?.()
            }}
          >
            <Text style={styles.successButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  if (loadingBiller) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Loading biller details...</Text>
      </View>
    )
  }

  if (!biller) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Biller details not found.</Text>
        <TouchableOpacity style={styles.backButtonAlt} onPress={onBack}>
          <Text style={styles.backButtonAltText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return showWebview && webviewUrl ? (
    <Modal visible={showWebview} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
          <TouchableOpacity onPress={() => setShowWebview(false)}>
            <Text style={{ color: "blue" }}>Close</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: webviewUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={(navState) => {
            console.log("WebView navigating:", navState.url)
            // Example: detect callback success/failure
            if (navState.url.includes("success")) {
              setShowWebview(false)
              setCurrentStep("success")
            } else if (navState.url.includes("failed")) {
              setShowWebview(false)
              setCurrentStep("failed")
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  ) : (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "#E4F2FD",
              borderRadius: 15,
              padding: 8,
            }}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.title}>Pay Bills</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Biller Info Card */}
          <View style={styles.billerInfoCard}>
            {biller.image ? (
              <Image source={{ uri: biller.image }} style={styles.modalBillerLogo} />
            ) : (
              <View style={styles.billerInfoInitialsContainer}>
                <Text style={styles.billerInfoInitials}>{biller.initials}</Text>
              </View>
            )}
            <View style={styles.billerInfoTextContainer}>
              <Text style={styles.billerInfoName}>{biller.name}</Text>
              <Text style={styles.billerInfoLabel}>Bill Payment</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={24} color="#1E3A8A" />
            </TouchableOpacity>
          </View>

          {/* Conditional Fields based on Biller Category */}
          {biller.category === "disco" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meter Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity style={styles.radioOption} onPress={() => setMeterType("Postpaid")}>
                    <View style={[styles.radioButton, meterType === "Postpaid" && styles.radioButtonSelected]}>
                      {meterType === "Postpaid" && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Postpaid</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.radioOption} onPress={() => setMeterType("Prepaid")}>
                    <View style={[styles.radioButton, meterType === "Prepaid" && styles.radioButtonSelected]}>
                      {meterType === "Prepaid" && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Prepaid</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    placeholderTextColor="#959595"
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meter Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={meterNumber}
                  onChangeText={setMeterNumber}
                  placeholder="Enter meter number"
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          {biller.category === "education" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Type</Text>
                <TouchableOpacity style={styles.dropdownSelector} onPress={() => setPaymentTypeModalVisible(true)}>
                  <Text style={[styles.dropdownText, paymentType === "Select payment type" && styles.placeholderText]}>
                    {paymentType}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Student ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={studentId}
                  onChangeText={setStudentId}
                  placeholder="Enter student ID"
                  keyboardType="numeric"
                />
                {studentName ? <Text style={styles.studentNameText}>Student Name: {studentName}</Text> : null}
              </View>
            </>
          )}

          {biller.category === "tv" && (
            <>
              {biller.isBouquetService === "Yes" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Subscription Package</Text>
                  <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsBouquetModalVisible(true)}>
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedBouquet && subscriptionPackage === "Select product" && styles.placeholderText,
                      ]}
                    >
                      {selectedBouquet ? selectedBouquet.name : subscriptionPackage}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    placeholderTextColor="#959595"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Smartcard Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={smartcardNumber}
                  onChangeText={setSmartcardNumber}
                  placeholder="Smartcard Number"
                  keyboardType="numeric"
                  placeholderTextColor="#959595"
                />
              </View>
            </>
          )}

          {biller.category === "vtu" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
              {biller.isBouquetService === "Yes" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data Plan</Text>
                  <TouchableOpacity style={styles.dropdownSelector} onPress={() => setPlanModalVisible(true)}>
                    <Text style={[styles.dropdownText, !selectedPlan && styles.placeholderText]}>
                      {selectedBouquet?.name || "Select data plan"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>
            </>
          )}

          {biller.category === "internet" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Customer ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={customerId}
                  onChangeText={setCustomerId}
                  placeholder="Enter customer ID"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data Plan</Text>
                <TouchableOpacity style={styles.dropdownSelector} onPress={() => setPlanModalVisible(true)}>
                  <Text style={[styles.dropdownText, !selectedPlan && styles.placeholderText]}>
                    {selectedPlan || "Select data plan"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>
            </>
          )}

          {biller.category === "bet" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Customer ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={customerId}
                  onChangeText={setCustomerId}
                  placeholder="Enter customer ID"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>
            </>
          )}

          {biller.category === "airtimeVoucher" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>
            </>
          )}

          {biller.category === "banking" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>
            </>
          )}

          {biller.category === "kyc" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Customer ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={customerId}
                  onChangeText={setCustomerId}
                  placeholder="Enter customer ID"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Type</Text>
                <TouchableOpacity style={styles.dropdownSelector} onPress={() => setServiceTypeModalVisible(true)}>
                  <Text style={[styles.dropdownText, !serviceType && styles.placeholderText]}>
                    {serviceType || "Select service type"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(text) =>
                      setAmount(text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    }
                    placeholder="How much?"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.maxAmountText}>Maximum amount: ₦{maximumAmount}</Text>
              </View>
            </>
          )}

          {/* Payment Method (Common for all categories) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentMethodContainer}>
              <View style={styles.paymentOption}>
                <View style={[styles.cardIconContainer]}>
                  <Ionicons name="card-outline" size={20} color="#6b7280" />
                </View>
                <Text style={styles.paymentMethodText}>•••• •••• •••• {cardNumber.slice(-4)}</Text>
                <View style={styles.visaBadge}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.anotherCardButton} onPress={() => setShowCardInputs(!showCardInputs)}>
                <Ionicons name={showCardInputs ? "remove" : "add"} size={16} color="#FF8C00" />
                <Text style={styles.anotherCardText}>{showCardInputs ? "Hide card details" : "Edit card details"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showCardInputs && (
            <View style={styles.cardInputSection}>
              <Text style={styles.sectionTitle}>Card Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="Enter cardholder name"
                  onFocus={() => {
                    // Scroll to ensure input is visible
                    setTimeout(() => {
                      scrollViewRef?.current?.scrollToEnd({ animated: true })
                    }, 100)
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(text.replace(/\s/g, ""))}
                  placeholder="Enter card number"
                  keyboardType="numeric"
                  maxLength={19}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef?.current?.scrollToEnd({ animated: true })
                    }, 100)
                  }}
                />
              </View>

              <View style={styles.cardRowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Expiry Month</Text>
                  <TextInput
                    style={styles.input}
                    value={expiryMonth}
                    onChangeText={setExpiryMonth}
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef?.current?.scrollToEnd({ animated: true })
                      }, 100)
                    }}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Expiry Year</Text>
                  <TextInput
                    style={styles.input}
                    value={expiryYear}
                    onChangeText={setExpiryYear}
                    placeholder="YY"
                    keyboardType="numeric"
                    maxLength={2}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef?.current?.scrollToEnd({ animated: true })
                      }, 100)
                    }}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={securityCode}
                    onChangeText={setSecurityCode}
                    placeholder="CVV"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef?.current?.scrollToEnd({ animated: true })
                      }, 100)
                    }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Make Payment Button */}
          <TouchableOpacity style={styles.makePaymentButton} onPress={handleMakePayment} disabled={isLoading()}>
            {isLoading() ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.makePaymentButtonText}>Make Payment</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Payment Type Modal */}
      <Modal
        visible={isPaymentTypeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPaymentTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPaymentTypeModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Payment Type</Text>
            <View style={styles.modalSpacer} />
          </View>
          <FlatList
            data={paymentTypes}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setPaymentType(item)
                  setPaymentTypeModalVisible(false)
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Modal
        visible={isBouquetModalVisible || planModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (isBouquetModalVisible) setIsBouquetModalVisible(false)
          else if (planModalVisible) setPlanModalVisible(false)
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButtonContainer}
              onPress={() => {
                if (isBouquetModalVisible) setIsBouquetModalVisible(false)
                else if (planModalVisible) setPlanModalVisible(false)
              }}
            >
              <Icon name="close" size={24} color="#1E3A8A" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Package</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Biller Info */}
          <View style={styles.billerInfoContainer}>
            <Image source={{ uri: biller.image }} style={styles.modalBillerLogo} />
            <View style={styles.billerTextContainer}>
              <Text style={styles.modalBillerName}>{biller.name}</Text>
              {biller.info && <Text style={styles.modalBillerDescription}>{biller.info}</Text>}
            </View>
          </View>

          {/* Bouquets List */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>AVAILABLE PACKAGES</Text>

            {loadingBouquets || fetchingBouquets ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading packages...</Text>
              </View>
            ) : bouquets && bouquets.length > 0 ? (
              <FlatList
                data={bouquets}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.bouquetCard}
                    onPress={() => {
                      setSelectedBouquet(item)
                      setSubscriptionPackage(item.code)
                      setAmount(String(item.price))
                      setPlanModalVisible(false)
                      setIsBouquetModalVisible(false)
                    }}
                  >
                    <View style={styles.bouquetInfo}>
                      <Text style={styles.bouquetName}>{item.name}</Text>
                      <Text style={styles.bouquetDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.bouquetPrice}>
                      <Text style={styles.priceText}>₦{item.price}</Text>
                      <Text style={styles.priceType}>{item.type}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#959595" />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.noBouquetsText}>No packages available for this biller</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Payment Flow Modals */}
      {renderPinModal()}
      {renderOtpModal()}
      {renderSuccessModal()}
      <Modal visible={currentStep === "otp"} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter OTP</Text>
              <Text style={styles.modalSubtitle}>
                Please enter the 6-digit OTP sent to your registered mobile number
              </Text>
            </View>

            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCurrentStep("pin")
                  setOtpCode("")
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleOtpSubmit}
                disabled={otpSubmission.submitting || otpCode.length !== 6}
              >
                {otpSubmission.submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSansBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  backButtonAlt: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  backButtonAltText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === "android" ? 40 : 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  billerInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  billerInfoLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 12,
  },
  billerInfoInitialsContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  billerInfoInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  billerInfoTextContainer: {
    flex: 1,
  },

  backButtonContainer: {
    borderWidth: 1,
    borderColor: "#E4F2FD",
    borderRadius: 15,
    padding: 8,
  },
  billerInfoName: {
    fontSize: 16,
    fontFamily: "InstrumentSans",
    color: "#353535",
  },
  billerInfoLabel: {
    fontSize: 14,
    color: "#757575",
    fontFamily: "InstrumentSans",
  },
  editButton: {
    padding: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "InstrumentSansSemiBold",
    color: "#353535",
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#10b981",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  radioLabel: {
    fontSize: 16,
    fontFamily: "InstrumentSans",
    color: "#374151",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#94BDFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#ffffff",
  },
  currencySymbol: {
    fontSize: 21,
    color: "#10b981",
    marginRight: 8,
    fontFamily: "InstrumentSans",
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontFamily: "InstrumentSans",
  },
  maxAmountText: {
    fontSize: 12,
    color: "#1E3A8A",
    marginTop: 8,
    fontFamily: "InstrumentSans",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#94BDFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#ffffff",
    fontFamily: "InstrumentSans",
  },
  studentNameText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#94BDFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "InstrumentSans",
  },
  placeholderText: {
    color: "#9ca3af",
    fontFamily: "InstrumentSans",
  },
  paymentMethodContainer: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4F2FD",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  cardIconContainer: {
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "InstrumentSansBold",
    color: "#959595",
    marginBottom: 12,
    marginTop: 20,
  },
  visaBadge: {
    backgroundColor: "#052113",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  visaText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "InstrumentSans",
    fontStyle: "italic",
  },
  anotherCardButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#FF8C00",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  anotherCardText: {
    fontSize: 16,
    color: "#FF8C00",
    marginLeft: 8,
  },
  makePaymentButton: {
    backgroundColor: "#34D399",
    borderRadius: 35,
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  makePaymentButtonText: {
    fontSize: 16,
    fontFamily: "InstrumentSansBold",
    color: "#1E3A8A",
  }, // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSansBold",
    color: "#1f2937",
  },
  billerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalBillerLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 16,
  },
  billerTextContainer: {
    flex: 1,
  },
  modalBillerName: {
    fontSize: 18,
    fontFamily: "InstrumentSansBold",
    color: "#1f2937",
    marginBottom: 4,
  },
  modalBillerDescription: {
    fontSize: 14,
    fontFamily: "InstrumentSans",
    color: "#64748b",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bouquetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bouquetInfo: {
    flex: 1,
    marginRight: 12,
  },
  bouquetName: {
    fontSize: 16,
    fontFamily: "InstrumentSansBold",
    color: "#1f2937",
    marginBottom: 4,
  },
  bouquetDescription: {
    fontSize: 14,
    fontFamily: "InstrumentSans",
    color: "#64748b",
  },
  bouquetPrice: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  priceText: {
    fontSize: 16,
    fontFamily: "InstrumentSansBold",
    color: "#1E3A8A",
  },
  priceType: {
    fontSize: 12,
    fontFamily: "InstrumentSans",
    color: "#64748b",
    marginTop: 2,
  },
  noBouquetsText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontFamily: "InstrumentSans",
  },
  modalCancelText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "500",
  },
  modalSpacer: {
    width: 60,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  // PIN/OTP Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pinModalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  pinModalTitle: {
    fontSize: 20,
    fontFamily: "InstrumentSansBold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  pinModalSubtitle: {
    fontSize: 14,
    fontFamily: "InstrumentSans",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: "#94BDFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 18,
    color: "#374151",
    backgroundColor: "#ffffff",
    fontFamily: "InstrumentSans",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 24,
  },
  pinModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  pinButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pinButtonCancel: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  pinButtonSubmit: {
    backgroundColor: "#34D399",
  },
  pinButtonTextCancel: {
    fontSize: 16,
    fontFamily: "InstrumentSansSemiBold",
    color: "#374151",
  },
  pinButtonTextSubmit: {
    fontSize: 16,
    fontFamily: "InstrumentSansSemiBold",
    color: "#1E3A8A",
  },
  // Success Modal Styles
  successModalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: "InstrumentSansBold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: "InstrumentSans",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  referenceText: {
    fontSize: 14,
    fontFamily: "InstrumentSansSemiBold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 24,
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  successButton: {
    backgroundColor: "#34D399",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 16,
    fontFamily: "InstrumentSansBold",
    color: "#1E3A8A",
  },
  otpContainer: {
    marginVertical: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#94BDFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#ffffff",
    fontFamily: "InstrumentSans",
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "InstrumentSans",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#34D399",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "InstrumentSansBold",
    color: "#1E3A8A",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "InstrumentSansSemiBold",
    color: "#374151",
  },
  confirmButton: {
    backgroundColor: "#34D399",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: "InstrumentSansSemiBold",
    color: "#1E3A8A",
  },
  cardInputSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  cardRowInputs: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
}) // Added missing closing brace for StyleSheet.create

export default BillerDetailsScreen
