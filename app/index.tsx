import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function Onboarding({ navigation }: any) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Swiper
        loop={false}
        showsPagination={false}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {/* Slide 1 */}
        <View style={styles.slide}>
          <Image
            source={require("@/assets/images/applander1.png")}
            style={styles.image}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
          <View style={styles.overlay}>
            <Image
              source={require("@/assets/images/surepay.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Built for Trust, Designed for You</Text>
            <Text style={styles.subtitle}>
              Experience a secure, user-friendly way to handle digital payments.
            </Text>
          </View>
        </View>

        {/* Slide 2 */}
        <View style={styles.slide}>
          <Image
            source={require("@/assets/images/applander2.png")}
            style={styles.image}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
          <View style={styles.overlay}>
          <Image
              source={require("@/assets/images/surepay.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Secure Transactions, Every Time</Text>
            <Text style={styles.subtitle}>
            Your money moves with confidence—fast, safe, and hassle-free.
            </Text>
          </View>
        </View>

        {/* Slide 3 */}
        <View style={styles.slide}>
          <Image
            source={require("@/assets/images/applander3.png")}
            style={styles.image}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
          <View style={styles.overlay}>
          <Image
              source={require("@/assets/images/surepay.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Pay with Ease, Anywhere</Text>
            <Text style={styles.subtitle}>
            Track, transfer, and transact—all in one intuitive dashboard.
            </Text>
          </View>
        </View>

        {/* Slide 4 */}
        <View style={styles.slide}>
          <Image
            source={require("@/assets/images/applander4.png")}
            style={styles.image}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
          <View style={styles.overlay}>
          <Image
              source={require("@/assets/images/surepay.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>More Transactions, More Earnings</Text>
            <Text style={styles.subtitle}>
            Every payment you process helps you grow your business and income.
            </Text>
          </View>
        </View>
      </Swiper>
      <View style={styles.slideItems}>
        {/* Buttons */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.createAccountText}>Create an Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        {/* Pagination */}
        <View style={styles.pagination}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: activeIndex === index ? "#94BDFF" : "#E4F2FD80" },
              ]}
            />
          ))}
        </View>
      </View>

    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    paddingHorizontal: 20,
    // alignItems: "center",
    // justifyContent: "center",
    position: "absolute",
    bottom: "30%",
  },
  logo: {
    // width: 100,
    // height: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: 500,
    color: "white",
    fontFamily: "InstrumentSansBold",

  },
  subtitle: {
    fontSize: 16,
    fontFamily: "InstrumentSansSemiBold",
    // color: "white",
    marginTop: 10,
    lineHeight: 24,
    paddingEnd: 20,
    color: "#E4F2FD",
  },
  slideItems: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "30%",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    gap: 20,
  },
  pagination: {
    flexDirection: "row",
    alignSelf: "center",
    // position: "absolute",
    // bottom: 30,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  createAccountButton: {
    backgroundColor: "#34D399",
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    color: "#1E3A8A",
    // position: "absolute",
    // bottom: 150,
    width: "90%",
  },
  createAccountText: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "InstrumentSansBold",
  },
  loginButton: {
    backgroundColor: "white",
    borderColor: "#1E3A8A",
    borderWidth: 2,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 25,
    fontFamily: "InstrumentSansBold",
    alignItems: "center",
    // position: "absolute",
    // bottom: 120,
    width: "90%",
  },
  loginText: {
    color: "#1E3A8A",
    fontFamily: "InstrumentSansBold",
    fontSize: 16,
    fontWeight: "bold",
  },
});
