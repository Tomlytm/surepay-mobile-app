import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AccountSettingsScreenProps {
    onBack?: () => void;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({ onBack }) => {
    const [twoStepEnabled, setTwoStepEnabled] = useState(true);

    const handlePasswordEdit = () => {
        Alert.alert('Edit Password', 'Password edit functionality would be implemented here');
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => console.log('Signed out') },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you sure you want to delete your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') },
            ]
        );
    };

    const toggleTwoStep = (value: boolean) => {
        setTwoStepEnabled(value);
        if (value) {
            Alert.alert('2-Step Verification Enabled', 'Your account is now more secure');
        } else {
            Alert.alert('2-Step Verification Disabled', 'Consider keeping this enabled for better security');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
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
                <Text style={styles.headerTitle}>Account Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
                {/* Password Section */}
                <View style={styles.sectionII}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Password</Text>
                        <Text style={styles.passwordMask}>••••••••</Text>
                    </View>
                        <TouchableOpacity onPress={handlePasswordEdit} style={styles.editButton}>
                            <Ionicons name="create-outline" size={30} color="#1E3A8A" />
                        </TouchableOpacity>
                </View>

                {/* 2-Step Verification Section */}
                <View style={styles.section}>
                    <View style={styles.verificationHeader}>
                        <View style={styles.verificationTitleContainer}>
                            <Text style={styles.sectionTitle}>2-step Verification</Text>
                            <Switch
                                value={twoStepEnabled}
                                onValueChange={toggleTwoStep}
                                style={{borderWidth: 1, borderRadius: 30, borderColor: "#f5f5f5"}}
                                trackColor={{ false: '#d1d5db', true: 'white' }}
                                thumbColor={twoStepEnabled ? '#34D399' : '#f5f5f5'}
                            />
                        </View>
                    </View>
                    <Text style={styles.verificationDescription}>
                        When this is on, You will be required to provide a verification code whenever you want to log in to your account
                    </Text>
                </View>

                {/* ID Verification Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ID Verification</Text>
                    <View style={styles.idContainer}>

                    <Text style={styles.idLabel}>National Identity Number (BVN)</Text>
                    <View style={styles.idSubContainer}>
                        <Text style={styles.idNumber}>2293349450</Text>
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={16} color="#ffffff" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    </View>
                    </View>
                </View>

                {/* Bottom Actions */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteAccountText}>Delete my account</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        fontFamily: "InstrumentSansBold",
        marginRight: 110, // Compensate for back button width
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sectionII: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 32
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
        fontFamily: "InstrumentSansSemiBold",
    },
    editButton: {
        padding: 4,
    },
    passwordMask: {
        fontSize: 18,
        color: '#374151',
        letterSpacing: 2,
    },
    verificationHeader: {
        marginBottom: 12,
    },
    verificationTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verificationDescription: {
        fontSize: 14,
        color: '#757575',
        fontFamily: 'InstrumentSans',
        lineHeight: 20,
    },
    idLabel: {
        fontSize: 14,
        color: '#959595',
        marginBottom: 8,
        fontFamily: 'InstrumentSans',
    },
    idContainer: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
        borderColor: '#E6FFF6',
    },
    idSubContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
    },
    idNumber: {
        fontSize: 16,
        color: '#353535',
        fontFamily: 'InstrumentSansSemiBold',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#008753',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    verifiedText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        fontFamily: 'InstrumentSans',
    },
    bottomActions: {
        marginTop: 'auto',
        paddingBottom: 100,
    },
    signOutButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#94BDFF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    signOutText: {
        fontSize: 16,
        fontFamily: 'InstrumentSansSemiBold',
        color: '#757575',
    },
    deleteButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteAccountText: {
        fontSize: 16,
        color: '#F63B3B',
        textAlign: 'center',
        fontFamily: 'InstrumentSansSemiBold',
    },
});

export default AccountSettingsScreen;