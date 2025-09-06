import { TransactionLoader } from '@/components/loaders/TransactionLoader'; // Import the loader component
import { Transaction, useFetchTransactions, UseFetchTransactionsParams } from '@/services/queries/transactions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Dimensions, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Appbar, Button, Chip, Provider as PaperProvider, Text } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

const Transactions = () => {
  const router = useRouter();
  const chartHeight = useMemo(() => new Animated.Value(180), []);
  const modalTranslateY = useMemo(() => new Animated.Value(0), []);
  const modalOpacity = useMemo(() => new Animated.Value(0), []);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All time');
  const [selectedBiller, setSelectedBiller] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'PENDING' | 'SUCCESS' | 'FAILED'>('All');
  const [referenceNumber, setReferenceNumber] = useState('');

  // Applied filter states (only updated when Apply is clicked)
  const [appliedType, setAppliedType] = useState('All');
  const [appliedPeriod, setAppliedPeriod] = useState('All time');
  const [appliedBiller, setAppliedBiller] = useState('All');
  const [appliedStatus, setAppliedStatus] = useState<'All' | 'PENDING' | 'SUCCESS' | 'FAILED'>('All');
  const [appliedReference, setAppliedReference] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 24;

  // Build filter parameters for API call
  const filterParams = useMemo<UseFetchTransactionsParams>(() => {
    // Check if all filters are in default state
    const isDefaultState = (
      appliedType === 'All' &&
      appliedPeriod === 'All time' &&
      appliedBiller === 'All' &&
      appliedStatus === 'All' &&
      appliedReference.trim() === ''
    );

    // If all filters are default, return minimal params for normal pagination
    if (isDefaultState) {
      return {
        page: currentPage,
        limit: itemsPerPage,
      };
    }

    const params: UseFetchTransactionsParams = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Map transaction type to API transaction_type
    if (appliedType !== 'All') {
      const typeMap: { [key: string]: string } = {
        'Airtime': 'AIRTIME',
        'Data': 'DATA',
        'Electricity': 'DISCO',
        'TV': 'TV',
        'Betting': 'BET',
        'Voucher': 'VOUCHER',
        'Banking': 'BANKING',
        'Education': 'EDUCATION',
        'KYC': 'KYC',
        'Internet': 'INTERNET',
      };
      params.transaction_type = typeMap[appliedType];
    }

    // Map network
    if (appliedBiller !== 'All') {
      if (['MTN', 'Airtel', 'GLO', '9Mobile'].includes(appliedBiller)) {
        params.network = appliedBiller as any;
      }
    }

    // Map status
    if (appliedStatus !== 'All') {
      params.status = appliedStatus;
    }

    // Map time period to start_date and end_date
    if (appliedPeriod !== 'All time') {
      const now = new Date();
      let startDate: Date;

      switch (appliedPeriod) {
        case 'Past Week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'This Month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'This Year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      params.start_date = startDate.toISOString();
      params.end_date = now.toISOString();
    }

    // Add reference number filter
    if (appliedReference.trim()) {
      params.reference = appliedReference.trim();
    }

    return params;
  }, [appliedType, appliedPeriod, appliedBiller, appliedStatus, appliedReference, currentPage, itemsPerPage, refreshKey]);

  const { transactions: trx, loading } = useFetchTransactions(filterParams);

  // Handle pagination data accumulation
  useEffect(() => {
    if (trx?.data) {
      if (currentPage === 1) {
        // First page, replace all data
        setAllTransactions(trx.data);
      } else {
        // Subsequent pages, append data
        setAllTransactions(prev => [...prev, ...trx.data]);
      }
      
      // Turn off refreshing when data loads
      if (refreshing) {
        setRefreshing(false);
      }
    }
  }, [trx?.data, currentPage, refreshing]);


  // Generate real-time chart data from accumulated transactions
  const chartData = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      // Return default empty data if no transactions
      return [
        { name: 'No Data', amount: 0, color: '#E5E5E5', legendFontColor: '#000', legendFontSize: 12 }
      ];
    }

    // Define category mapping and colors
    const categoryConfig:any = {
      'AIRTIME': { 
        name: 'Airtime', 
        color: '#00C49F',
        types: ['AIRTIME']
      },
      'DATA': { 
        name: 'Data', 
        color: '#FFBB28',
        types: ['DATA']
      },
      'UTILITIES': { 
        name: 'Utilities', 
        color: '#0088FE',
        types: ['DISCO', 'TV', 'INTERNET']
      },
      'SERVICES': { 
        name: 'Services', 
        color: '#FF8042',
        types: ['BET', 'VOUCHER', 'BANKING', 'EDUCATION', 'KYC']
      }
    };

    // Calculate totals by category
    const categoryTotals:any = {};
    
    // Initialize categories
    Object.keys(categoryConfig).forEach(key => {
      categoryTotals[key] = 0;
    });

    // Sum amounts by transaction type using accumulated data
    allTransactions.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      const transactionType = transaction.type?.toUpperCase();
      
      // Find which category this transaction type belongs to
      for (const [categoryKey, config] of Object.entries(categoryConfig)) {
        if ((config as any).types.includes(transactionType)) {
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
  }, [allTransactions]);

  // Calculate total spending from real data
  const totalSpending = useMemo(() => {
    return chartData.reduce((sum, item:any) => sum + item.amount, 0);
  }, [chartData]);

  // Use the accumulated paginated data
  const filteredTransactions = allTransactions;

  const formatTransactions = (data: Transaction[]) => {
    return data.map((item: Transaction) => {
      const iconMap: any = {
        'AIRTIME': 'call-outline',
        'DATA': 'wifi-outline',
        'DISCO': 'flash-outline',
        'TV': 'tv-outline',
        'BET': 'football-outline',
        'VOUCHER': 'card-outline',
        'BANKING': 'card-outline',
        'EDUCATION': 'school-outline',
        'KYC': 'person-outline',
        'INTERNET': 'globe-outline',
      };

      // Ensure we have a valid icon, fallback to a basic one if needed
      const iconName = iconMap[item.type?.toUpperCase()] || 'cash-outline';

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
        amount: `₦${(item.amount || 0).toLocaleString()}`,
        date: formattedDate,
        icon: iconName,
        reference: item.reference
      };
    });
  };

  const dynamicTransactions = formatTransactions(filteredTransactions);

  const transactionTypes = ['All', 'Airtime', 'Data', 'Electricity', 'TV', 'Betting', 'Voucher', 'Banking', 'Education', 'KYC', 'Internet'];
  const periods = ['All time', 'Past Week', 'This Month', 'This Year'];
  const billers = ['All', 'MTN', 'Airtel', 'GLO', '9Mobile'];
  const statuses = ['All', 'PENDING', 'SUCCESS', 'FAILED'];

  // Enhanced modal functions
  const openFilterModal = () => {
    setFilterVisible(true);
    modalTranslateY.setValue(300);
    modalOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeFilterModal = () => {
    Animated.parallel([
      Animated.timing(modalTranslateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFilterVisible(false);
    });
  };

  const applyFilters = () => {
    // Reset pagination when applying new filters
    setCurrentPage(1);
    setAllTransactions([]);
    
    // Apply the selected filters to the applied states
    setAppliedType(selectedType);
    setAppliedPeriod(selectedPeriod);
    setAppliedBiller(selectedBiller);
    setAppliedStatus(selectedStatus);
    setAppliedReference(referenceNumber);
    
    // If all filters are being set to default, trigger a refresh to get unfiltered data
    const willBeDefaultState = (
      selectedType === 'All' &&
      selectedPeriod === 'All time' &&
      selectedBiller === 'All' &&
      selectedStatus === 'All' &&
      referenceNumber.trim() === ''
    );
    
    if (willBeDefaultState) {
      // setRefreshKey(prev => prev + 1);
      handleRefresh();
      
    }
    
    // Close the modal
    closeFilterModal();
  };


  const toggleChart = () => {
    Animated.timing(chartHeight, {
      toValue: isCollapsed ? 180 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setIsCollapsed(!isCollapsed));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Clear accumulated data first
    setAllTransactions([]);
    
    // Reset pagination
    setCurrentPage(1);
    
    // Clear all filters
    setSelectedStatus('All');
    setSelectedType('All');
    setSelectedPeriod('All time');
    setSelectedBiller('All');
    setReferenceNumber('');
    setAppliedStatus('All');
    setAppliedType('All');
    setAppliedPeriod('All time');
    setAppliedBiller('All');
    setAppliedReference('');
    
    // Increment refresh key to force re-fetch with cleared filters
    setRefreshKey(prev => prev + 1);
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.fixedHeader}>
          <Appbar.Content title="Transactions" titleStyle={styles.headerTitle} style={{ alignItems: 'flex-start' }} />
          
            <Appbar.Action 
              icon="filter" 
              onPress={openFilterModal} 
              style={{ borderWidth: 1, borderColor: '#1E3A8A' }} 
              color='#1E3A8A' 
              size={30} 
              disabled={loading}
            />
        </Appbar.Header>
        <TransactionLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.fixedHeader}>
        <Appbar.Content title="Transactions" titleStyle={styles.headerTitle} />
          <Appbar.Action 
            icon="filter" 
            onPress={openFilterModal} 
            style={{ borderWidth: 1, borderColor: '#1E3A8A' }} 
            color='#1E3A8A' 
            size={30} 
            disabled={loading}
          />
      </Appbar.Header>
      
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
      >

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
                paddingLeft={Platform.OS === 'ios' ? '10' : '15'}
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
          {(appliedType !== 'All' || appliedPeriod !== 'All time' || appliedBiller !== 'All' || appliedStatus !== 'All' || appliedReference) && 
            ` (${dynamicTransactions.length} filtered)`
          }
        </Text>
        {dynamicTransactions?.length === 0 && !loading && !refreshing ? (
          <View style={styles.emptyStateContainer}>
            {(appliedType !== 'All' || appliedPeriod !== 'All time' || appliedBiller !== 'All' || appliedStatus !== 'All' || appliedReference) ? (
              <>
                <Ionicons name="file-tray" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>No transactions match your filters</Text>
                <Text style={styles.emptyStateSubtitle}>Try adjusting your filter criteria or reset to see all transactions</Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    // Reset pagination
                    setCurrentPage(1);
                    setAllTransactions([]);
                    
                    // Reset all applied filters
                    setAppliedType('All');
                    setAppliedPeriod('All time');
                    setAppliedBiller('All');
                    setAppliedStatus('All');
                    setAppliedReference('');
                    
                    // Reset selected filters
                    setSelectedType('All');
                    setSelectedPeriod('All time');
                    setSelectedBiller('All');
                    setSelectedStatus('All');
                    setReferenceNumber('');
                  }}
                  style={styles.resetButton}
                  labelStyle={styles.resetButtonText}
                  textColor="#1E3A8A"
                >
                  Reset Filters
                </Button>
              </>
            ) : (
              <>
                <Ionicons name="receipt-outline" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>No transactions found</Text>
                <Text style={styles.emptyStateSubtitle}>Start making transactions to see them here</Text>
              </>
            )}
          </View>
        ) : (
          dynamicTransactions?.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/explore/${encodeURIComponent(item.id)}?title=${encodeURIComponent(item.title)}&status=${encodeURIComponent(item.status)}&description=${encodeURIComponent(item.description)}&network=${encodeURIComponent(item.network)}&amount=${encodeURIComponent(item.amount)}&date=${encodeURIComponent(item.date)}&icon=${encodeURIComponent(item.icon)}&reference=${encodeURIComponent(item.reference)}`)}
            >
              <View style={styles.transaction}>
                <Ionicons name={item.icon} size={25} color="#959595" />
                <View style={styles.transContent}>
                  <View style={styles.transTop}>
                    <Text style={styles.transTitle}>{item.title}</Text>
                    <Text style={styles.transAmount}>-{item.amount}</Text>
                  </View>
                  <Text style={styles.transDate}>{item.date}</Text>
                  <Text style={styles.transRef}>{item.reference}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      {!loading && dynamicTransactions?.length > 0 && trx?.data && trx.data.length === itemsPerPage && (
        <Button
          mode="outlined"
          textColor='#757575'
          labelStyle={{ fontSize: 14, fontFamily: 'InstrumentSansSemiBold' }}
          compact
          onPress={() => setCurrentPage(prev => prev + 1)}
          disabled={loading}
          style={{
            alignSelf: 'flex-start',
            marginBottom: 35,
            borderRadius: 12,
            borderColor: '#757575',
            backgroundColor: '#F5F5F5',
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 16,
            opacity: loading ? 0.6 : 1,
          }}
          icon={loading ? "loading" : "chevron-down"}
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          {loading ? `Loading...` : `Show ${itemsPerPage} More`}
        </Button>
      )}

      <Modal visible={filterVisible} animationType="none" transparent>
        {/* <TouchableWithoutFeedback onPress={closeFilterModal}> */}
          <Animated.View style={[styles.modalContainer, { opacity: modalOpacity }]}>
            <Animated.View style={[
              styles.modalContent, 
              { 
                transform: [{ translateY: modalTranslateY }],
              }
            ]}>
              {/* Drag Handle - Only this area handles pan gestures */}
              <View style={styles.dragHandleArea}>
                <View style={styles.dragHandle} />
              </View>
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter Transactions</Text>
                  <TouchableOpacity onPress={closeFilterModal} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  scrollEventThrottle={16}
                  bounces={false}
                >
                  <Text style={styles.sectionLabel}>REFERENCE NUMBER</Text>
                    <View style={styles.textInputWrapper}>
                      <Ionicons name="document-text-outline" size={16} color="#666" style={styles.referenceIcon} />
                      <TextInput
                        style={styles.referenceInput}
                        placeholder="Enter transaction reference"
                        value={referenceNumber}
                        onChangeText={setReferenceNumber}
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                      />
                    </View>
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

                    <Text style={styles.sectionLabel}>BILLER / NETWORK</Text>
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

                    <Text style={styles.sectionLabel}>STATUS</Text>
                    <View style={styles.row}>
                      {statuses.map(status => (
                        <Chip
                          key={status}
                          style={[styles.chip, selectedStatus === status && { backgroundColor: '#1E3A8A' }]}
                          selected={selectedStatus === status}
                          onPress={() => setSelectedStatus(status as any)}
                          textStyle={{ 
                            color: selectedStatus === status ? '#fff' : '#1E3A8A', 
                            fontFamily: 'InstrumentSans' 
                          }}
                        >
                          {status}
                        </Chip>
                      ))}
                    </View>

                   

                    <View style={styles.buttonRow}>
                      <Button
                        style={styles.clearButton}
                        textColor='#959595'
                        labelStyle={{ fontFamily: 'InstrumentSans' }}
                        onPress={() => {
                          // Reset pagination
                          setCurrentPage(1);
                          setAllTransactions([]);
                          
                          // Reset selected states
                          setSelectedType('All');
                          setSelectedPeriod('All time');
                          setSelectedBiller('All');
                          setSelectedStatus('All');
                          setReferenceNumber('');
                          
                          // Reset applied states immediately
                          setAppliedType('All');
                          setAppliedPeriod('All time');
                          setAppliedBiller('All');
                          setAppliedStatus('All');
                          setAppliedReference('');
                        }}
                        icon="cancel"
                        contentStyle={{ flexDirection: 'row-reverse' }}
                      >
                        Clear
                      </Button>
                      <Button 
                        style={styles.applyButton} 
                        textColor='#fff' 
                        labelStyle={{ fontFamily: 'InstrumentSansBold' }} 
                        mode="contained" 
                        onPress={applyFilters}
                      >
                        Apply
                      </Button>
                    </View>
                  </ScrollView>
            </Animated.View>
          </Animated.View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>
      </ScrollView>
    </View>
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
  fixedHeader: {
    backgroundColor: '#fff',
    // justifyContent: 'space-between',
    borderBottomColor: '#E5E5E5',
    // paddingRight: 15,
    borderBottomWidth: 0.5,
    elevation: 4,
    shadowColor: '#E5E5E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    zIndex: 1000,
  },
  scrollContent: {
    flex: 1,
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
    alignItems: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'InstrumentSans',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    fontFamily: 'InstrumentSans',
    maxHeight: '90%',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandleArea: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'InstrumentSansSemiBold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
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
    marginTop: 24,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 0,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    elevation: 0,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#94BDFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#ffffff',
    marginBottom: 15,
  },
  referenceIcon: {
    marginRight: 8,
  },
  referenceInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'InstrumentSans',
    padding: 0,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'InstrumentSansSemiBold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'InstrumentSans',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 20,
    borderColor: '#1E3A8A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'InstrumentSansSemiBold',
  },
});