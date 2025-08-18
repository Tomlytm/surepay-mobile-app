import { Transaction, useFetchTransactions } from '@/services/queries/transactions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Appbar, Button, Chip, Provider as PaperProvider, Text } from 'react-native-paper';
import { TransactionLoader } from '@/components/loaders/TransactionLoader'; // Import the loader component

const screenWidth = Dimensions.get('window').width;

const Transactions = () => {
  const router = useRouter();
  const chartHeight = useRef(new Animated.Value(180)).current;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All time');
  const [selectedBiller, setSelectedBiller] = useState('All');
  const { transactions: trx, loading, error, refetch } = useFetchTransactions();

  // Generate real-time chart data from transactions
  const chartData = useMemo(() => {
    if (!trx?.data || trx.data.length === 0) {
      // Return default empty data if no transactions
      return [
        { name: 'No Data', amount: 0, color: '#E5E5E5', legendFontColor: '#000', legendFontSize: 12 }
      ];
    }

    // Define category mapping and colors
    const categoryConfig:any = {
      'AIRTIME': { 
        name: 'Airtime Recharge', 
        color: '#00C49F',
        types: ['AIRTIME']
      },
      'DATA': { 
        name: 'Data Subscription', 
        color: '#FFBB28',
        types: ['DATA']
      },
      'BILLS': { 
        name: 'Bills Payments', 
        color: '#0088FE',
        types: ['BILLS', 'TV', 'TRANSPORT']
      },
      'COLLECTION': { 
        name: 'Other Collections', 
        color: '#FF8042',
        types: ['COLLECTION', 'ENTERTAINMENT']
      }
    };

    // Calculate totals by category
    const categoryTotals:any = {};
    
    // Initialize categories
    Object.keys(categoryConfig).forEach(key => {
      categoryTotals[key] = 0;
    });

    // Sum amounts by transaction type
    trx.data.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      const transactionType = transaction.type?.toUpperCase();
      
      // Find which category this transaction type belongs to
      for (const [categoryKey, config] of Object.entries(categoryConfig)) {
        if (config.types.includes(transactionType)) {
          categoryTotals[categoryKey] += amount;
          break;
        }
      }
    });

    // Convert to chart data format, filtering out zero amounts
    const chartDataArray = Object.entries(categoryTotals)
      .filter(([_, amount]:any) => amount > 0)
      .map(([categoryKey, amount]) => ({
        name: categoryConfig[categoryKey].name,
        amount: amount,
        color: categoryConfig[categoryKey].color,
        legendFontColor: '#000',
        legendFontSize: 12
      }));

    // If no data after filtering, show empty state
    if (chartDataArray.length === 0) {
      return [
        { name: 'No Transactions', amount: 0, color: '#E5E5E5', legendFontColor: '#000', legendFontSize: 12 }
      ];
    }

    return chartDataArray;
  }, [trx?.data]);

  // Calculate total spending from real data
  const totalSpending = useMemo(() => {
    return chartData.reduce((sum, item:any) => sum + item.amount, 0);
  }, [chartData]);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!trx?.data) return [];

    let filtered = trx.data;

    // Filter by type
    if (selectedType !== 'All') {
      const typeMap :any= {
        'Airtime': 'AIRTIME',
        'Data': 'DATA', 
        'Bills': ['BILLS', 'TV', 'TRANSPORT'],
        'Collections': ['COLLECTION', 'ENTERTAINMENT']
      };
      
      const typesToFilter = typeMap[selectedType];
      if (Array.isArray(typesToFilter)) {
        filtered = filtered.filter(tx => typesToFilter.includes(tx.type?.toUpperCase()));
      } else {
        filtered = filtered.filter(tx => tx.type?.toUpperCase() === typesToFilter);
      }
    }

    // Filter by period
    if (selectedPeriod !== 'All time') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedPeriod) {
        case 'Past Week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'This Month':
          filterDate.setDate(1);
          break;
        case 'This Year':
          filterDate.setMonth(0, 1);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.created_at) >= filterDate);
    }

    // Filter by biller
    if (selectedBiller !== 'All') {
      filtered = filtered.filter(tx => 
        tx.network?.toUpperCase().includes(selectedBiller.toUpperCase())
      );
    }

    return filtered;
  }, [trx?.data, selectedType, selectedPeriod, selectedBiller]);

  const formatTransactions = (data: Transaction[]) => {
    return data.map(item => {
      const iconMap: any = {
        'AIRTIME': 'wifi-outline',
        'DATA': 'wifi-outline',
        'BILLS': 'flash-outline',
        'COLLECTION': 'cart-outline',
        'TV': 'tv-outline',
        'TRANSPORT': 'car-outline',
        'ENTERTAINMENT': 'film-outline',
      };

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
        network: item.network,
        type: item.type,
        status: item.status,
        description: item.description || 'No description available',
        title: `${item.network} – ${item.type}`,
        amount: `₦${Number(item.amount).toLocaleString()}`,
        date: formattedDate,
        icon: iconMap[item.type] || 'cash-outline',
        reference: item.reference
      };
    });
  };

  const dynamicTransactions = formatTransactions(filteredTransactions);

  const transactionTypes = ['All', 'Airtime', 'Data', 'Bills', 'Collections'];
  const periods = ['All time', 'Past Week', 'This Month', 'This Year', 'Custom'];
  const billers = ['All', 'MTN', 'SpectraNet', 'IKEDC'];

  const toggleChart = () => {
    Animated.timing(chartHeight, {
      toValue: isCollapsed ? 180 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setIsCollapsed(!isCollapsed));
  };

  const handleRefresh = () => {
    refetch();
  };

  // Show loading state
  if (loading) {
    return <TransactionLoader />;
  }

  return (
    <ScrollView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#fff', justifyContent: 'space-between', borderBottomColor: '#E5E5E5', paddingRight: 15, borderBottomWidth: 0.5 }}>
        <Appbar.Content title="Transactions" titleStyle={styles.headerTitle} style={{ alignItems: 'flex-start' }} />
        <View style={{ flexDirection: 'row' }}>
          <Appbar.Action 
            icon="refresh" 
            onPress={handleRefresh} 
            style={{ marginRight: 8 }} 
            color='#1E3A8A' 
            size={24} 
          />
          <Appbar.Action 
            icon="filter-variant" 
            onPress={() => setFilterVisible(true)} 
            style={{ borderWidth: 1, borderColor: '#1E3A8A' }} 
            color='#1E3A8A' 
            size={30} 
          />
        </View>
      </Appbar.Header>

      <View style={[styles.card, { elevation: 0 }]}>
        {!isCollapsed && (
          <Button
            mode="outlined"
            textColor='#000'
            labelStyle={{ fontSize: 14, fontFamily: 'InstrumentSansSemiBold' }}
            compact
            style={{
              alignSelf: 'flex-start',
              marginBottom: 8,
              borderRadius: 12,
              borderColor: '#94BDFF',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            icon="chevron-down"
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            {selectedPeriod === 'All time' ? 'This Month' : selectedPeriod}
          </Button>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text variant="titleLarge" style={styles.titleLarge}>
              ₦{totalSpending.toLocaleString()}
            </Text>
            <Text variant="labelSmall" style={styles.labelSmall}>
              Total Spending {selectedPeriod !== 'All time' ? `(${selectedPeriod})` : ''}
            </Text>
          </View>
          {isCollapsed && (
            <TouchableOpacity onPress={toggleChart}>
              <Button
                mode="outlined"
                textColor='#000'
                labelStyle={{ fontSize: 14, fontFamily: 'InstrumentSansSemiBold' }}
                compact
                style={{
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                  borderRadius: 18,
                  borderColor: '#94BDFF',
                  flexDirection: 'row',
                  paddingHorizontal: 12,
                  alignItems: 'center',
                }}
                icon="chevron-down"
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                Expand
              </Button>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View style={{ height: chartHeight, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', }}>
          {totalSpending > 0 ? (
            <>
              <PieChart
                hasLegend={false}
                data={chartData.map(d => ({ ...d, population: d.amount }))}
                width={(screenWidth + 80) / 2}
                height={180}
                chartConfig={{
                  color: () => '#000',
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
              />
              <View style={{ flex: 1, }}>
                {chartData.map((item:any, index) => (
                  <View key={index} style={[styles.legendItem, { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <View>
                      <Text style={styles.legendText}>{`₦${item.amount.toLocaleString()}`}</Text>
                      <Text style={styles.legendText2}>{item.name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#757575', fontSize: 16, fontFamily: 'InstrumentSans' }}>
                No spending data available
              </Text>
            </View>
          )}
        </Animated.View>

        {!isCollapsed && (
          <TouchableOpacity onPress={toggleChart}>
            <Button mode="text" compact textColor="#EF8B09"
              labelStyle={{ fontSize: 14, fontFamily: 'InstrumentSansSemiBold' }} style={{ marginTop: 16 }}>
              Collapse Chart
            </Button>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Text style={styles.recentTitle}>
          TRANSACTIONS HISTORY 
          {(selectedType !== 'All' || selectedPeriod !== 'All time' || selectedBiller !== 'All') && 
            ` (${dynamicTransactions.length} filtered)`
          }
        </Text>
        {dynamicTransactions?.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#EF8B09', fontFamily: 'InstrumentSansSemiBold' }}>
              {(selectedType !== 'All' || selectedPeriod !== 'All time' || selectedBiller !== 'All') 
                ? 'No transactions match your filters.' 
                : 'No transactions found.'
              }
            </Text>
          </View>
        ) : (
          dynamicTransactions?.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/explore/${encodeURIComponent(item.id)}?title=${encodeURIComponent(item.title)}&status=${encodeURIComponent(item.status)}&description=${encodeURIComponent(item.description)}&network=${encodeURIComponent(item.network)}&amount=${encodeURIComponent(item.amount)}&date=${encodeURIComponent(item.date)}&icon=${encodeURIComponent(item.icon)}&reference=${encodeURIComponent(item.reference)}`)}
            >
              <View style={styles.transaction}>
                <Ionicons name={item.icon} size={25} color="#959595" />
                <View style={styles.transContent}>
                  <View style={styles.transTop}>
                    <Text style={styles.transTitle}>{item.title}</Text>
                    <Text style={styles.transAmount}>{item.amount}</Text>
                  </View>
                  <Text style={styles.transDate}>{item.date}</Text>
                  <Text style={styles.transRef}>{item.reference}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      <Button
        mode="outlined"
        textColor='#757575'
        labelStyle={{ fontSize: 14, fontFamily: 'InstrumentSansSemiBold' }}
        compact
        style={{
          alignSelf: 'flex-start',
          marginBottom: 8,
          borderRadius: 12,
          borderColor: '#757575',
          backgroundColor: '#F5F5F5',
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 16,
        }}
        icon="chevron-down"
        contentStyle={{ flexDirection: 'row-reverse' }}
      >
        Show 24 More
      </Button>

      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>

            <Text style={styles.sectionLabel}>TRANSACTION TYPE</Text>
            <View style={styles.row}>
              {transactionTypes.map(type => (
                <Chip
                  key={type}
                  style={[styles.chip, selectedType === type && { backgroundColor: '#1E3A8A' }]}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  textStyle={{ 
                    color: selectedType === type ? '#fff' : '#1E3A8A', 
                    fontFamily: 'InstrumentSans' 
                  }}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <Text style={styles.sectionLabel}>TRANSACTION PERIOD</Text>
            <View style={styles.row}>
              {periods.map(period => (
                <Chip
                  key={period}
                  style={[styles.chip, selectedPeriod === period && { backgroundColor: '#1E3A8A' }]}
                  selected={selectedPeriod === period}
                  onPress={() => setSelectedPeriod(period)}
                  textStyle={{ 
                    color: selectedPeriod === period ? '#fff' : '#1E3A8A', 
                    fontFamily: 'InstrumentSans' 
                  }}
                >
                  {period}
                </Chip>
              ))}
            </View>

            <Text style={styles.sectionLabel}>BILLER</Text>
            <View style={styles.row}>
              {billers.map(biller => (
                <Chip
                  key={biller}
                  style={[styles.chip, selectedBiller === biller && { backgroundColor: '#1E3A8A' }]}
                  selected={selectedBiller === biller}
                  onPress={() => setSelectedBiller(biller)}
                  textStyle={{ 
                    color: selectedBiller === biller ? '#fff' : '#1E3A8A', 
                    fontFamily: 'InstrumentSans' 
                  }}
                >
                  {biller}
                </Chip>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Button
                style={{
                  marginRight: 12,
                  backgroundColor: '#F5F5F5',
                  paddingHorizontal: 20,
                  paddingVertical: 7,
                  borderRadius: 15,
                }}
                textColor='#959595'
                labelStyle={{ fontFamily: 'InstrumentSans' }}
                onPress={() => {
                  setSelectedType('All');
                  setSelectedPeriod('All time');
                  setSelectedBiller('All');
                }}
                icon="cancel"
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                Clear
              </Button>
              <Button style={{
                marginRight: 12,
                paddingHorizontal: 20,
                paddingVertical: 7,
                backgroundColor: '#E4F2FD',
                borderRadius: 15,
              }} textColor='#1E3A8A' labelStyle={{ fontFamily: 'InstrumentSansBold' }} mode="contained" onPress={() => setFilterVisible(false)}>Apply</Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default function App() {
  return (
    <PaperProvider>
      <Transactions />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: "#F5F5F5",
    margin: 16,
    padding: 16,
    elevation: 0,
    borderRadius: 12,
    fontFamily: 'InstrumentSans',
  },
  legendItem: {
    flexDirection: 'column',
    marginTop: 4,
    marginLeft: -50
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 15,
    color: '#353535',
    marginBottom: 4,
    fontFamily: 'InstrumentSans',
  },
  legendText2: {
    fontSize: 12,
    color: '#757575',
    fontFamily: 'InstrumentSans',
  },
  amount: {
    color: 'red',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontFamily: 'InstrumentSansSemiBold',
  },
  tabText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 20,
    fontFamily: 'InstrumentSansBold',
  },
  headerTitle: {
    fontFamily: 'InstrumentSansSemiBold',
    color: '#000',
    marginLeft: -40
  },
  titleLarge: {
    color: '#353535',
    fontSize: 24,
    fontFamily: 'InstrumentSansSemiBold',
    marginVertical: 8
  },
  labelSmall: {
    fontFamily: 'InstrumentSans',
    color: '#757575',
    fontSize: 14,
    marginBottom: 8
  },
  titleMedium: {
    fontFamily: 'InstrumentSansSemiBold',
  },
  recentTitle: {
    fontWeight: '600',
    color: '#959595',
    marginBottom: 20,
    fontFamily: 'InstrumentSansBold',
  },
  transaction: {
    flexDirection: 'row',
    marginBottom: 35,
    alignItems: 'flex-start',
    gap: 10,
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
    color: '#353535',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000088',
    fontFamily: 'InstrumentSans',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    fontFamily: 'InstrumentSans',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
    color: '#959595',
    fontFamily: 'InstrumentSansSemiBold',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    color: '#959595',
    marginVertical: 10,
    fontFamily: 'InstrumentSansSemiBold',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 12,
    marginBottom: 14,
    fontFamily: 'InstrumentSansSemiBold',
    backgroundColor: '#E4F2FD',
    borderRadius: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});