import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFetchTransactions } from '@/services/queries/transactions';

export default function HomeScreenn() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { transactions: trx, loading, error, refetch } = useFetchTransactions();

  const menuItems = [
    {
      id: 1,
      title: 'Buy AIrtime',
      icon: 'call',
      onPress: () => router.push('/(tabs)/dashboard/airtime'),
    },
    {
      id: 2,
      title: 'Buy Data',
      icon: 'wifi',
      onPress: () => router.push('/(tabs)/dashboard/data_sub'),
    },
    {
      id: 3,
      title: 'Pay For ...',
      icon: 'card',
      onPress: () => router.push('/(tabs)/dashboard/pay_bills'),
    },
  ];

  // Format transactions for display
  const formatTransactionsForHome = (data:any) => {
    if (!data || data.length === 0) return [];
    
    const iconMap:any = {
      'AIRTIME': 'call-outline',
      'DATA': 'wifi-outline',
      'BILLS': 'flash-outline',
      'COLLECTION': 'cart-outline',
      'TV': 'tv-outline',
      'TRANSPORT': 'car-outline',
      'ENTERTAINMENT': 'film-outline',
    };

    return data.slice(0, 3).map((item:any) => {
      const createdDate = new Date(item.created_at);
      const formattedDate = createdDate.toLocaleString('en-NG', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: item.id,
        title: `${item.network} – ${item.type}`,
        amount: `₦${Number(item.amount).toLocaleString()}`,
        date: formattedDate,
        reference: item.reference || 'Transaction reference information goes here',
        icon: iconMap[item.type] || 'cash-outline',
        status: item.status
      };
    });
  };

  const recentTransactions = formatTransactionsForHome(trx?.data || []);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {(() => {
              const hour = new Date().getHours();
              let greeting = "Good Morning";
              if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
              else if (hour >= 17 || hour < 5) greeting = "Good Evening";
              return `${greeting}, ${user?.firstname ?? ""}`;
            })()}
          </Text>
          <Text style={styles.subText}>What would you like to do?</Text>
        </View>
        <TouchableOpacity onPress={()=>refetch()}>
          <Ionicons name="mail-outline" size={40} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {menuItems?.map((item) => (
          <ActionButton key={item.id} label={item.title} icon={item.icon} onPress={item.onPress}/>
        ))}
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          <Text>Earn up to </Text>
          <Text>15% commission</Text>
          <Text> on every payment</Text>
        </Text>
        <TouchableOpacity style={styles.agentBtn}>
          <Text style={styles.agentBtnText}>Become an Agent</Text>
          <View style={styles.roundContainer}>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/bannerImage.png")}
          style={styles.bannerImage}
        />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>RECENT TRANSACTIONS</Text>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1E3A8A" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load transactions</Text>
            <TouchableOpacity onPress={()=>refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!loading && !error && recentTransactions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color="#959595" />
          <Text style={styles.emptyStateText}>No recent transactions</Text>
          <Text style={styles.emptyStateSubText}>Start making transactions to see them here</Text>
        </View>
      )}

      {!loading && !error && recentTransactions.map((item:any, index:any) => (
        <TouchableOpacity 
          key={item.id || index} 
          style={styles.transaction}
          onPress={() => router.push(`/explore/${encodeURIComponent(item.id)}?title=${encodeURIComponent(item.title)}&status=${encodeURIComponent(item.status)}&amount=${encodeURIComponent(item.amount)}&date=${encodeURIComponent(item.date)}&reference=${encodeURIComponent(item.reference)}`)}
        >
          <Ionicons name={item.icon} size={25} color="#959595" />
          <View style={styles.transContent}>
            <View style={styles.transTop}>
              <Text style={styles.transTitle}>{item.title}</Text>
              <Text style={styles.transAmount}>{item.amount}</Text>
            </View>
            <Text style={styles.transDate}>{item.date}</Text>
            <Text style={styles.transRef}>{item.reference}</Text>
          </View>
          {/* {item.status && (
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'SUCCESS' ? '#E8F5E8' : item.status === 'PENDING' ? '#FFF3CD' : '#FFEBEE' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === 'SUCCESS' ? '#2E7D32' : item.status === 'PENDING' ? '#F57C00' : '#C62828' }
              ]}>
                {item.status}
              </Text>
            </View>
          )} */}
        </TouchableOpacity>
      ))}

      {!loading && !error && recentTransactions.length > 0 && (
        <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="add-circle-outline" size={20} color="#959595" />
          <Text style={styles.seeAllText}>See all Transactions</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const ActionButton: React.FC<{ 
  label: string; 
  icon: React.ComponentProps<typeof Ionicons>['name'] | any;
  onPress: () => void; 
}> = ({ label, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#1E3A8A" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'InstrumentSansSemiBold',
  },
  subText: {
    color: '#959595',
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'InstrumentSans',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
    padding: 15,
    borderRadius: 30,
    color: "#1E3A8A",
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 6,
    backgroundColor: '#E4F2FD',
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
    fontFamily: 'InstrumentSansSemiBold',
  },
  banner: {
    position: 'relative',
    backgroundColor: '#FFEFD6',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 30,
    zIndex: 1,
    overflow: 'hidden',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: '100%',
  },
  bannerText: {
    fontSize: 24,
    marginBottom: 10,
    fontFamily: 'InstrumentSemiSans',
    color: '#1E3A8A'
  },
  agentBtn: {
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  agentBtnText: {
    fontSize: 14,
    fontFamily: 'InstrumentSansBold',
  },
  recentSection: {
    marginBottom: 10,
  },
  recentTitle: {
    fontWeight: '600',
    color: '#959595',
    marginBottom: 20,
    fontFamily: 'InstrumentSansBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#1E3A8A',
    fontFamily: 'InstrumentSans',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#C62828',
    fontFamily: 'InstrumentSans',
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#E4F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: '#1E3A8A',
    fontFamily: 'InstrumentSansSemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#959595',
    fontFamily: 'InstrumentSansSemiBold',
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontFamily: 'InstrumentSans',
    marginTop: 8,
    textAlign: 'center',
  },
  transaction: {
    flexDirection: 'row',
    marginBottom: 35,
    alignItems: 'flex-start',
    gap: 10,
    position: 'relative',
  },
  transContent: {
    flex: 1,
  },
  transTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'InstrumentSansSemiBold',
  },
  transAmount: {
    fontWeight: '600',
    color: '#000',
    fontFamily: 'InstrumentSans',
  },
  transDate: {
    color: '#757575',
    marginBottom: 10,
    fontSize: 12,
    fontFamily: 'InstrumentSans',
  },
  transRef: {
    fontSize: 12,
    color: '#353535',
    fontFamily: 'InstrumentSans',
  },
  statusBadge: {
    position: 'absolute',
    right: 0,
    top: 25,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'InstrumentSansBold',
  },
  seeAll: {
    flexDirection: 'row',
    marginTop: 10,
  },
  seeAllText: {
    color: '#f90',
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'InstrumentSansSemiBold',
  },
  roundContainer: {
    backgroundColor: '#EF8B09',
    borderRadius: 50,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});