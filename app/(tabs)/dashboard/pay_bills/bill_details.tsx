import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Biller {
    id: string;
    name: string;
    category: 'Cable TV' | 'Utilities' | 'Other Collections';
    logo?: string | any;
    initials?: string;
}

interface BillerDetailsScreenProps {
    onBack?: () => void;
}

// Dummy data for dropdowns
const paymentTypes = ['School Fees', 'Tuition', 'Exam Fees', 'Other'];
const subscriptionPackages = ['Basic Plan', 'Premium Plan', 'Family Plan', 'Sports Package'];

const BillerDetailsScreen: React.FC<BillerDetailsScreenProps> = ({ onBack }) => {
    const [biller, setBiller] = useState<Biller | null>(null); // State to hold biller data
    const [loadingBiller, setLoadingBiller] = useState(true); // Loading state for biller data
    const [amount, setAmount] = useState('');
    const router = useRouter();
    const [meterType, setMeterType] = useState<'Postpaid' | 'Prepaid'>('Postpaid');
    const [meterNumber, setMeterNumber] = useState('');
    const [paymentType, setPaymentType] = useState('Select payment type');
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [subscriptionPackage, setSubscriptionPackage] = useState('Select product');
    const [smartcardNumber, setSmartcardNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentTypeModalVisible, setPaymentTypeModalVisible] = useState(false);
    const [isSubscriptionPackageModalVisible, setSubscriptionPackageModalVisible] = useState(false);

    const maximumAmount = '35,000';

    useEffect(() => {
        const loadBiller = async () => {
            try {
                const storedBiller = await AsyncStorage.getItem("selectedBiller");
                if (storedBiller) {
                    setBiller(JSON.parse(storedBiller));
                } else {
                    Alert.alert('Error', 'No biller selected. Please go back and select one.');
                    onBack?.(); // Navigate back if no biller is found
                }
            } catch (error) {
                console.error('Failed to load biller from SecureStore:', error);
                Alert.alert('Error', 'Failed to load biller details.');
                onBack?.();
            } finally {
                setLoadingBiller(false);
            }
        };
        loadBiller();
    }, []); // Run once on mount

    // Dummy logic for student name based on student ID
    useEffect(() => {
        if (biller?.category === 'Other Collections' && studentId === '0258846856') {
            setStudentName('Patrick Kanu');
        } else if (biller?.category === 'Other Collections' && studentId) {
            setStudentName('Unknown Student');
        } else {
            setStudentName('');
        }
    }, [studentId, biller?.category]);

    const handleMakePayment = async () => {
        if (!biller) return; // Should not happen if biller is loaded

        // Basic validation
        if (!amount || parseFloat(amount.replace(/,/g, '')) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return;
        }

        if (biller.category === 'Utilities' && !meterNumber) {
            Alert.alert('Error', 'Please enter meter number.');
            return;
        }
        if (biller.category === 'Other Collections' && (!studentId || paymentType === 'Select payment type')) {
            Alert.alert('Error', 'Please enter student ID and select payment type.');
            return;
        }
        if (biller.category === 'Cable TV' && (!smartcardNumber || subscriptionPackage === 'Select product')) {
            Alert.alert('Error', 'Please enter smartcard number and select subscription package.');
            return;
        }

        setIsLoading(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            Alert.alert('Success', `Payment of ₦${amount} for ${biller.name} successful!`);
            // Clear SecureStore item after successful payment
            await AsyncStorage.removeItem('selectedBiller');
            // Reset fields or navigate back
            setAmount('');
            setMeterNumber('');
            setPaymentType('Select payment type');
            setStudentId('');
            setStudentName('');
            setSubscriptionPackage('Select product');
            setSmartcardNumber('');
            onBack?.();
        } catch (error) {
            Alert.alert('Error', 'Payment failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingBiller) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1f2937" />
                <Text style={styles.loadingText}>Loading biller details...</Text>
            </View>
        );
    }

    if (!biller) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Biller details not found.</Text>
                <TouchableOpacity style={styles.backButtonAlt} onPress={onBack}>
                    <Text style={styles.backButtonAltText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={{
                    borderWidth: 1,
                    borderColor: "#E4F2FD",
                    borderRadius: 15,
                    padding: 8,
                }} onPress={() => router.back()} >
                    <Icon name="arrow-back" size={24} color="#1E3A8A" />
                </TouchableOpacity>
                <Text style={styles.title}>Pay Bills</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Biller Info Card */}
                <View style={styles.billerInfoCard}>
                    {biller.logo ? (
                        <Image source={biller.logo} style={styles.billerInfoLogo} />
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
                {biller.category === 'Utilities' && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Meter Type</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={styles.radioOption}
                                    onPress={() => setMeterType('Postpaid')}
                                >
                                    <View style={[styles.radioButton, meterType === 'Postpaid' && styles.radioButtonSelected]}>
                                        {meterType === 'Postpaid' && <View style={styles.radioButtonInner} />}
                                    </View>
                                    <Text style={styles.radioLabel}>Postpaid</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.radioOption}
                                    onPress={() => setMeterType('Prepaid')}
                                >
                                    <View style={[styles.radioButton, meterType === 'Prepaid' && styles.radioButtonSelected]}>
                                        {meterType === 'Prepaid' && <View style={styles.radioButtonInner} />}
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
                                    onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
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

                {biller.category === 'Other Collections' && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Type</Text>
                            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setPaymentTypeModalVisible(true)}>
                                <Text style={[styles.dropdownText, paymentType === 'Select payment type' && styles.placeholderText]}>
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
                                    onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
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

                {biller.category === 'Cable TV' && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subscription Package</Text>
                            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setSubscriptionPackageModalVisible(true)}>
                                <Text style={[styles.dropdownText, subscriptionPackage === 'Select product' && styles.placeholderText]}>
                                    {subscriptionPackage}
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
                                    onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
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

                {/* Payment Method (Common for all, but slightly different for Cable TV) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Payment Method</Text>
                    {biller.category === 'Cable TV' ? (
                        <View style={styles.radioGroup}>
                            <TouchableOpacity style={styles.radioOption}>
                                <View style={[styles.radioButton, styles.radioButtonSelected]}>
                                    <View style={styles.radioButtonInner} />
                                </View>
                                <Text style={styles.radioLabel}>Pay with Card</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.paymentMethodContainer}>
                            <View style={styles.paymentOption}>
                                <View style={[styles.cardIconContainer]}>
                                    <Ionicons name="card-outline" size={20} color="#6b7280" />
                                </View>
                                <Text style={styles.paymentMethodText}>•••• •••• •••• 3268</Text>
                                <View style={styles.visaBadge}>
                                    <Text style={styles.visaText}>VISA</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.anotherCardButton}>
                                <Ionicons name="add" size={16} color="#FF8C00" />
                                <Text style={styles.anotherCardText}>Use another card</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Make Payment Button */}
                <TouchableOpacity
                    style={styles.makePaymentButton}
                    onPress={handleMakePayment}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.makePaymentButtonText}>Make Payment</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

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
                                    setPaymentType(item);
                                    setPaymentTypeModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Subscription Package Modal */}
            <Modal
                visible={isSubscriptionPackageModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSubscriptionPackageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setSubscriptionPackageModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Subscription Package</Text>
                        <View style={styles.modalSpacer} />
                    </View>
                    <FlatList
                        data={subscriptionPackages}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    setSubscriptionPackage(item);
                                    setSubscriptionPackageModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "InstrumentSansBold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#1f2937',
    },
    backButtonAlt: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    backButtonAltText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        gap: 8,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    billerInfoLogo: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
        marginRight: 12,
    },
    billerInfoInitialsContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billerInfoInitials: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    billerInfoTextContainer: {
        flex: 1,
    },
    billerInfoName: {
        fontSize: 16,
        fontFamily: "InstrumentSans",
        color: '#353535',
    },
    billerInfoLabel: {
        fontSize: 14,
        color: '#757575',
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
        color: '#353535',
        marginBottom: 12,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: '#10b981',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
    },
    radioLabel: {
        fontSize: 16,
        fontFamily: "InstrumentSans",
        color: '#374151',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#94BDFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: '#ffffff',
    },
    currencySymbol: {
        fontSize: 21,
        color: '#10b981',
        marginRight: 8,
        fontFamily: "InstrumentSans",
    },
    amountInput: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontFamily: "InstrumentSans",
    },
    maxAmountText: {
        fontSize: 12,
        color: '#1E3A8A',
        marginTop: 8,
        // textAlign: 'right',
        fontFamily: "InstrumentSans",
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#94BDFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        color: '#374151',
        backgroundColor: '#ffffff',
        fontFamily: "InstrumentSans",
    },
    studentNameText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
    dropdownSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#94BDFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: '#ffffff',
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
        fontFamily: "InstrumentSans",
    },
    placeholderText: {
        color: '#9ca3af',
        fontFamily: "InstrumentSans",
    },
    paymentMethodContainer: {
        gap: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E4F2FD',
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    cardIconContainer: {
        marginRight: 12,
    },
    paymentMethodText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    visaBadge: {
        backgroundColor: '#052113',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    visaText: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: "InstrumentSans",
        fontStyle: 'italic',
    },
    anotherCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#FF8C00',
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    anotherCardText: {
        fontSize: 16,
        color: '#FF8C00',
        marginLeft: 8,
    },
    makePaymentButton: {
        backgroundColor: '#34D399',
        borderRadius: 35,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    makePaymentButtonText: {
        color: '#1E3A8A',
        fontSize: 16,
        fontFamily: "InstrumentSansBold",
        
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalCancelText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '500',
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    modalSpacer: {
        width: 60,
    },
    modalItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalItemText: {
        fontSize: 16,
        color: '#374151',
    },
});

export default BillerDetailsScreen;