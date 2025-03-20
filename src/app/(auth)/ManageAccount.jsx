"use client"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Toast from "react-native-toast-message"

const ManageAccount = () => {
  const router = useRouter()

  const handleUpdatePersonalDetails = () => {
    router.push("/(auth)/UpdateProfile")
  }

  const handleUpdateEmail = () => {
    router.push("/(auth)/UpdateEmail")
  }

  const handleUpdatePreferences = () => {
    router.push("/(auth)/UpdatePreferences")
  }

  const handleAccountSecurity = () => {
    router.push("/(auth)/AccountSecurity")
  }

  const handleDeleteAccount = () => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "This feature will be available in a future update.",
    })
    // router.push("/(auth)/DeleteAccount");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Text style={styles.sectionDescription}>
            Update your name, country / region of residence, gender and phone number
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdatePersonalDetails}>
            <Text style={styles.buttonText}>Update Personal Details</Text>
          </TouchableOpacity>
        </View>

        {/* Email Section - No title */}
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>Update the email address on your account</Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
            <Text style={styles.buttonText}>Update Email Address</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionDescription}>
            Manage the clubs you follow and opt in or out of email communications with the Premier League, FPL, clubs
            and sponsors
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdatePreferences}>
            <Text style={styles.buttonText}>Update Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <Text style={styles.sectionDescription}>
            Update your password, link social media accounts and manage two-factor authentication
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleAccountSecurity}>
            <Text style={styles.buttonText}>Account Security</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Delete Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delete Account</Text>
          <Text style={styles.sectionDescription}>
            Permanently delete your Premier League account including your Fantasy Premier League team
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
            <Ionicons name="open-outline" size={20} color="#3a0047" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3a0047", // Deep purple color from screenshot
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3a0047", // Deep purple color
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#3a0047", // Deep purple color
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3a0047",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 360,
  },
  deleteButtonText: {
    color: "#3a0047",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },
})

export default ManageAccount

