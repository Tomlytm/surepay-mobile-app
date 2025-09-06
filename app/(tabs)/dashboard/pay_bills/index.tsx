"use client"

import { useFetchBillers, useFetchBillersByCategory } from "@/services/queries/billers/get"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

// Skeleton Loader Component
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

// Pay Bills Skeleton Loader
const PayBillsSkeletonLoader = () => (
  <View style={{ flex: 1 }}>
    {/* Search bar skeleton */}
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}>
      <SkeletonLoader width={120} height={14} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={48} borderRadius={12} />
    </View>
    
    {/* Categories skeleton */}
    {[1, 2, 3, 4].map((categoryIndex) => (
      <View key={categoryIndex} style={{ marginBottom: 20, paddingHorizontal: 16 }}>
        {/* Category header skeleton */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
          <SkeletonLoader width={24} height={24} borderRadius={4} />
          <SkeletonLoader width={100} height={16} style={{ marginLeft: 12 }} />
        </View>
        
        {/* Category billers skeleton (horizontal scroll) */}
        <View style={{ flexDirection: 'row', paddingLeft: 4 }}>
          {[1, 2, 3].map((billerIndex) => (
            <View key={billerIndex} style={{ marginRight: 12 }}>
              <SkeletonLoader width={105} height={100} borderRadius={12} />
            </View>
          ))}
        </View>
      </View>
    ))}
    
    {/* Recent purchases skeleton */}
    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
      <SkeletonLoader width={150} height={14} style={{ marginBottom: 12 }} />
      <View style={{ 
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E4F2FD',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
        <SkeletonLoader width={180} height={14} style={{ marginLeft: 12 }} />
      </View>
    </View>
  </View>
);

interface PayBillsScreenProps {
  onBack?: () => void
}

interface BillerCategory {
  id: string
  name: string
  image: string
}

interface BillerItem {
  id: string
  category: string
  name: string
  info: string
  isBouquetService: string
  image: string
  status: string
}

interface Bouquet {
  code: string
  name: string
  description: string
  price: string
  type: string
}

const PayBillsScreen: React.FC<PayBillsScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string[]>([])
  const [selectedBiller, setSelectedBiller] = useState<BillerItem | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const router = useRouter()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const searchFocusAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const { data: billerCategories, loading: categoriesLoading, error: categoriesError } = useFetchBillers()

  const handleCategoryToggle = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    if (expandedCategory.includes(categoryId)) {
      setExpandedCategory(expandedCategory.filter((id) => id !== categoryId))
    } else {
      setExpandedCategory([...expandedCategory, categoryId])
    }
  }

  const handleBillerSelect = async (biller: BillerItem) => {
    console.log("Selected biller:", biller)
    try {
      await AsyncStorage.setItem("selectedBiller", JSON.stringify(biller))
      router.push("/(tabs)/dashboard/pay_bills/bill_details")
    } catch (error) {
      Alert.alert("Error", "Could not select biller. Please try again.")
    }
  }

  const handleSearchFocus = () => {
    Animated.timing(searchFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleSearchBlur = () => {
    Animated.timing(searchFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const CategorySection: React.FC<{ category: BillerCategory }> = ({ category }) => {
    const isExpanded = expandedCategory.includes(category.id)
    const { data: categoryBillers, loading: billersLoading } = useFetchBillersByCategory(category.id)

    const categoryContentAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current
    const chevronRotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current

    const filteredBillers =
      categoryBillers?.filter((biller) => biller.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

    useEffect(() => {
      Animated.parallel([
        Animated.timing(categoryContentAnim, {
          toValue: isExpanded ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(chevronRotateAnim, {
          toValue: isExpanded ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }, [isExpanded])

    const BillerItem: React.FC<{ item: BillerItem }> = ({ item }) => {
      const scaleAnim = useRef(new Animated.Value(1)).current

      const handlePressIn = () => {
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start()
      }

      const handlePressOut = () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      }

      return (
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handleBillerSelect(item)}
          activeOpacity={1}
        >
          <Animated.View style={[styles.billerCard, { transform: [{ scale: scaleAnim }] }]}>
            <Image source={{ uri: item.image }} style={styles.billerLogo} />
            <Text style={styles.billerName} numberOfLines={2}>
              {item.name}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      )
    }

    const renderBillerItem = ({ item }: { item: BillerItem }) => {
      return <BillerItem item={item} />
    }

    return (
      <View style={styles.categorySection}>
        <TouchableOpacity style={styles.categoryHeader} onPress={() => handleCategoryToggle(category.id)}>
          <View style={styles.categoryTitleContainer}>
            <Image source={{ uri: category.image }} style={styles.categoryIcon} />
            <Text style={styles.categoryTitle}>{category.name.toUpperCase()}</Text>
          </View>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: chevronRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "90deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#959595" />
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            style={[
              styles.categoryContent,
              {
                opacity: categoryContentAnim,
                transform: [
                  {
                    translateY: categoryContentAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {billersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading billers...</Text>
              </View>
            ) : filteredBillers.length > 0 ? (
              <FlatList
                horizontal
                data={filteredBillers}
                renderItem={renderBillerItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.billerList}
              />
            ) : (
              <Text style={styles.noBillersText}>No billers found</Text>
            )}
          </Animated.View>
        )}
      </View>
    )
  }

  if (categoriesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.title}>Pay Bills</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <PayBillsSkeletonLoader />
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (categoriesError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.title}>Pay Bills</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load billers. Please try again.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.title}>Pay Bills</Text>
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Find Your Biller */}
          <Text style={styles.sectionLabel}>FIND YOUR BILLER</Text>
          <Animated.View
            style={[
              styles.searchContainer,
              {
                borderColor: searchFocusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["transparent", "#1E3A8A"],
                }),
                borderWidth: searchFocusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Find by name, e.g. DSTV"
              value={searchQuery}
              placeholderTextColor="#959595"
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </Animated.View>

          {/* Biller Categories */}
          {billerCategories?.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}

          {/* Recent Purchases */}
          <Text style={styles.sectionLabel}>RECENT PURCHASES</Text>
          <View style={styles.recentPurchasesContainer}>
            <Ionicons name="document-text-outline" size={24} color="#94BDFF" />
            <Text style={styles.recentPurchasesText}>You have no recent purchase record</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  backButtonContainer: {
    borderWidth: 1,
    borderColor: "#E4F2FD",
    borderRadius: 15,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSansBold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "InstrumentSansBold",
    color: "#959595",
    marginBottom: 12,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  categoryTitle: {
    fontSize: 13,
    color: "#1E3A8A",
    fontFamily: "InstrumentSansBold",
  },
  categoryContent: {
    paddingLeft: 4,
  },
  billerList: {
    paddingBottom: 20,
  },
  billerCard: {
    width: 105,
    height: 100,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#94BDFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    padding: 8,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  billerLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 8,
  },
  billerName: {
    fontSize: 12,
    fontFamily: "InstrumentSans",
    color: "#757575",
    textAlign: "center",
  },
  bouquetIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E4F2FD",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
    fontFamily: "InstrumentSans",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    fontFamily: "InstrumentSans",
  },
  noBillersText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    padding: 20,
    fontFamily: "InstrumentSans",
  },
  recentPurchasesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#E4F2FD",
  },
  recentPurchasesText: {
    fontSize: 14,
    color: "#959595",
    marginLeft: 12,
    fontFamily: "InstrumentSans",
  },
})

export default PayBillsScreen
