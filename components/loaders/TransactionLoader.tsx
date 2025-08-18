import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }: any) => {
  const shimmerValue = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: -1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[{ width, height, backgroundColor: '#E5E5E5', borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          {
            width: '30%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const TransactionSkeletonItem = () => (
  <View style={styles.transactionSkeleton}>
    <SkeletonLoader width={25} height={25} borderRadius={12} />
    <View style={styles.transContentSkeleton}>
      <View style={styles.transTopSkeleton}>
        <SkeletonLoader width={140} height={16} borderRadius={4} />
        <SkeletonLoader width={80} height={16} borderRadius={4} />
      </View>
      <SkeletonLoader width={180} height={12} borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonLoader width={120} height={12} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const ChartSkeletonLoader = () => (
  <View style={styles.chartSkeletonContainer}>
    {/* Chart circle skeleton */}
    <View style={styles.chartSkeleton}>
      <SkeletonLoader width={140} height={140} borderRadius={70} />
    </View>
    
    {/* Legend skeleton */}
    <View style={styles.legendSkeleton}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.legendItemSkeleton}>
          <SkeletonLoader width={10} height={10} borderRadius={5} />
          <View style={{ marginLeft: 8 }}>
            <SkeletonLoader width={80} height={14} borderRadius={4} />
            <SkeletonLoader width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

export const TransactionLoader = () => {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonLoader width={120} height={20} borderRadius={4} />
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </View>

      {/* Chart card skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.cardHeader}>
          <SkeletonLoader width={100} height={14} borderRadius={4} />
        </View>
        
        <View style={styles.totalSpendingSkeleton}>
          <View>
            <SkeletonLoader width={150} height={24} borderRadius={4} />
            <SkeletonLoader width={100} height={14} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        </View>

        <ChartSkeletonLoader />
        
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <SkeletonLoader width={120} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Transaction history header skeleton */}
      <View style={styles.historyHeaderSkeleton}>
        <SkeletonLoader width={180} height={16} borderRadius={4} />
      </View>

      {/* Transaction items skeleton */}
      <View style={styles.transactionListSkeleton}>
        {[1, 2, 3, 4, 5].map((item) => (
          <TransactionSkeletonItem key={item} />
        ))}
      </View>

      {/* Show more button skeleton */}
      <View style={styles.showMoreSkeleton}>
        <SkeletonLoader width={140} height={40} borderRadius={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  cardSkeleton: {
    backgroundColor: '#F5F5F5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    marginBottom: 8,
  },
  totalSpendingSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSkeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 180,
  },
  chartSkeleton: {
    width: (screenWidth + 80) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendSkeleton: {
    flex: 1,
    paddingLeft: 20,
  },
  legendItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyHeaderSkeleton: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  transactionListSkeleton: {
    paddingHorizontal: 16,
  },
  transactionSkeleton: {
    flexDirection: 'row',
    marginBottom: 35,
    alignItems: 'flex-start',
  },
  transContentSkeleton: {
    flex: 1,
    marginLeft: 10,
  },
  transTopSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  showMoreSkeleton: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});