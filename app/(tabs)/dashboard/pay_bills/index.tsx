import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

interface PayBillsScreenProps {
    onBack?: () => void;
}

interface Biller {
    id: string;
    name: string;
    category: 'Cable TV' | 'Utilities' | 'Other Collections';
    logo?: string | any; // URL for logo
    initials?: string; // For billers without a logo
}

const billers: Biller[] = [
    { id: 'dstv', name: 'DSTV', category: 'Cable TV', logo: require("@/assets/images/dstv.png") },
    { id: 'gotv', name: 'GOTV', category: 'Cable TV', logo: require("@/assets/images/gotv.png") },
    { id: 'startimes', name: 'Startimes', category: 'Cable TV', logo: require("@/assets/images/startimes.png") },
    { id: 'showmax', name: 'Showmax', category: 'Cable TV', logo: require("@/assets/images/showmax.png") },
    { id: 'ikedc', name: 'IKEDC', category: 'Utilities', logo: require("@/assets/images/ikedc.png") },
    { id: 'phed', name: 'PHED', category: 'Utilities', logo: require("@/assets/images/phed.png") },
    { id: 'kaedco', name: 'KAEDCO', category: 'Utilities', logo: require("@/assets/images/kaedco.png") },
    { id: 'yedc', name: 'YEDC', category: 'Utilities', logo: require("@/assets/images/yedc.png") },
    { id: 'shonibare', name: 'Shonibare Estate', category: 'Other Collections', initials: 'SE' },
    { id: 'dantata', name: 'Dantata & Sawoie', category: 'Other Collections', initials: 'DS' },
    { id: 'pride', name: 'Pride Intl. College', category: 'Other Collections', initials: 'PI' },
    { id: 'bowen', name: 'Bowen University', category: 'Other Collections', initials: 'BU' },
];

const PayBillsScreen: React.FC<PayBillsScreenProps> = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleBillerSelect = async (biller: Biller) => {
        try {
            await AsyncStorage.setItem('selectedBiller', JSON.stringify(biller));
            router.push('/(tabs)/dashboard/pay_bills/bill_details');
        } catch (error) {
            // console.error('Failed to save biller to SecureStore:', error);
            Alert.alert('Error', 'Could not select biller. Please try again.');
        }
    };

    const filteredBillers = billers.filter(biller =>
        biller.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderBillerItem = ({ item }: { item: Biller }) => (
        <TouchableOpacity style={styles.billerButton} onPress={() => handleBillerSelect(item)}>
            {item.logo ? (
                <Image source={item.logo} style={styles.billerLogo} />
            ) : (
                <View style={styles.billerInitialsContainer}>
                    <Text style={styles.billerInitials}>{item.initials}</Text>
                </View>
            )}
            <Text style={styles.billerName}>{item.name}</Text>
        </TouchableOpacity>
    );

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
                {/* Find Your Biller */}
                <Text style={styles.sectionLabel}>FIND YOUR BILLER</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find by name, e.g. DSTV"
                        value={searchQuery}
                        placeholderTextColor="#959595"
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Cable TV Section */}
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>CABLE TV</Text>
                    <Ionicons name="arrow-forward" size={20} color="#959595" />
                </View>
                <FlatList
                    horizontal
                    data={filteredBillers.filter(b => b.category === 'Cable TV')}
                    renderItem={renderBillerItem}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.billerList}
                />

                {/* Utilities Section */}
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>UTILITIES</Text>
                    <Ionicons name="arrow-forward" size={20} color="#959595" />
                </View>
                <FlatList
                    horizontal
                    data={filteredBillers.filter(b => b.category === 'Utilities')}
                    renderItem={renderBillerItem}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.billerList}
                />

                {/* Other Collections Section */}
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>OTHER COLLECTIONS</Text>
                    <Ionicons name="arrow-forward" size={20} color="#959595" />
                </View>
                <FlatList
                    horizontal
                    data={filteredBillers.filter(b => b.category === 'Other Collections')}
                    renderItem={renderBillerItem}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.billerList}
                />

                {/* Recent Purchases */}
                <Text style={styles.sectionLabel}>RECENT PURCHASES</Text>
                <View style={styles.recentPurchasesContainer}>
                    <Ionicons name="document-text-outline" size={24} color="#94BDFF" />
                    <Text style={styles.recentPurchasesText}>You have no recent purchase record</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    title: {
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "InstrumentSansBold",
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
    sectionLabel: {
        fontSize: 14,
        fontFamily: "InstrumentSansBold",
        color: '#959595',
        marginBottom: 12,
        marginTop: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    categoryHeader: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 16,
        color: '#1E3A8A',
        fontFamily: "InstrumentSansBold",
    },
    billerList: {
        paddingBottom: 20,
    },
    billerButton: {
        width: 105,
        height: 100,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#94BDFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        padding: 8,
    },
    billerLogo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    billerInitialsContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#e0f2fe', // Light blue background for initials
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    billerInitials: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E3A8A',
        fontFamily: "InstrumentSansBold",
    },
    billerName: {
        fontSize: 12,
        fontFamily: "InstrumentSans",
        color: '#757575',
        textAlign: 'center',
    },
    recentPurchasesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#E4F2FD',
    },
    recentPurchasesText: {
        fontSize: 14,
        color: '#959595',
        marginLeft: 12,
        fontFamily: "InstrumentSans",
    },
});

export default PayBillsScreen;