import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ProfileScreen = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                console.log("user data", userData);
                if (userData) {
                    setUser(JSON.parse(userData));

                }

            } catch (e) {
                // handle error if needed
            }
        };
        fetchUser();
    }, []);
    const menuItems = [
        {
            id: 1,
            title: 'Personal Information',
            icon: 'person-outline',
            onPress: () => router.push('/(tabs)/profile/personalInfo'),
        },
        {
            id: 2,
            title: 'Business Information',
            icon: 'briefcase-outline',
            onPress: () => console.log('Business Information pressed'),
        },
        {
            id: 3,
            title: 'Account Settings',
            icon: 'settings-outline',
            onPress: () => router.push('/(tabs)/profile/accountSettings'),
        },
        {
            id: 4,
            title: 'Payment Methods',
            icon: 'card-outline',
            onPress: () => console.log('Payment Methods pressed'),
        },
        {
            id: 5,
            title: 'Legals',
            icon: 'shield-outline',
            onPress: () => console.log('Legals pressed'),
        },
        {
            id: 6,
            title: 'Rate this app',
            icon: 'star-outline',
            isExternal: true,
            onPress: () => console.log('Rate this app pressed'),
        },
        {
            id: 7,
            title: 'Help & Support',
            icon: 'chatbubble-outline',
            onPress: () => console.log('Help & Support pressed'),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>S</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user?.firstname} {user?.lastname}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="settings-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Balance Section */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceInfo}>
                        <Text style={styles.balanceAmount}>₦6,000</Text>
                        <Text style={styles.balanceLabel}>Earned Commission</Text>
                    </View>
                    <TouchableOpacity style={styles.withdrawButton}>
                        <Text style={styles.withdrawButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name={item.icon as any} size={24} color="#1E3A8A" />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <View style={styles.menuItemRight}>
                                {item.isExternal ? (
                                    <Ionicons name="open-outline" size={20} color="#94BDFF" style={styles.externalIcon} />
                                ) : (
                                    <Ionicons name="chevron-forward" size={20} color="#94BDFF" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
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
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 60,
        width: '100%',
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'InstrumentSansBold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'InstrumentSansSemiBold',
        color: '#353535',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'InstrumentSans',
    },
    balanceCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 16,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#94BDFF',

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    balanceInfo: {
        flex: 1,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
        fontFamily: 'InstrumentSansSemiBold',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'InstrumentSans',
    },
    withdrawButton: {
        backgroundColor: '#E6FFF6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
    },
    withdrawButtonText: {
        color: '#1E3A8A',
        fontFamily: 'InstrumentSansSemiBold',
        fontSize: 14,
    },
    menuContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: '#555555',
        marginLeft: 12,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#94BDFF'
    },
    externalIcon: {
        marginRight: 8,
    },
});

export default ProfileScreen;