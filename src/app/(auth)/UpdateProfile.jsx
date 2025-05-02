"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { updateUser } from "../../utils/api";

const countries = [
  { name: "Vietnam", code: "VN", phoneCode: "+84" },
  { name: "United States", code: "US", phoneCode: "+1" },
  { name: "United Kingdom", code: "GB", phoneCode: "+44" },
  { name: "Australia", code: "AU", phoneCode: "+61" },
  { name: "Canada", code: "CA", phoneCode: "+1" },
  { name: "China", code: "CN", phoneCode: "+86" },
  { name: "France", code: "FR", phoneCode: "+33" },
  { name: "Germany", code: "DE", phoneCode: "+49" },
  { name: "India", code: "IN", phoneCode: "+91" },
  { name: "Japan", code: "JP", phoneCode: "+81" },
  { name: "Singapore", code: "SG", phoneCode: "+65" },
  { name: "South Korea", code: "KR", phoneCode: "+82" },
  { name: "Thailand", code: "TH", phoneCode: "+66" },
];

const UpdateProfile = () => {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    country: "",
    phoneCode: "+84",
    avatar: null,
  });
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [phoneCodeModalVisible, setPhoneCodeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(" ") : ["", ""];
      const fName = nameParts[0] || "";
      const lName = nameParts.slice(1).join(" ") || "";
      const phoneData = user.phone
        ? (() => {
            const matchingCountry = countries.find((c) =>
              user.phone.startsWith(c.phoneCode)
            );
            const code = matchingCountry?.phoneCode || "+84";
            return {
              phoneCode: code,
              phone: user.phone.startsWith(code)
                ? user.phone.slice(code.length)
                : user.phone,
            };
          })()
        : { phoneCode: "+84", phone: "" };

      setForm({
        firstName: fName,
        lastName: lName,
        phone: phoneData.phone,
        gender: user.gender || "",
        country: user.address ? user.address.split(",")[0].trim() : "",
        phoneCode: phoneData.phoneCode,
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Permission to access media library is required!",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Giảm chất lượng xuống 0.5 để giảm kích thước file
    });

    if (!result.canceled) {
      setForm({ ...form, avatar: result.assets[0].uri });
      Toast.show({
        type: "success",
        text1: "Avatar Selected",
        text2: "Your new avatar will be saved when you update your profile.",
      });
    }
  };

  const selectCountry = (selectedCountry) => {
    setForm({ ...form, country: selectedCountry.name, phoneCode: selectedCountry.phoneCode });
    setCountryModalVisible(false);
  };

  const selectPhoneCode = (selectedCountry) => {
    setForm({ ...form, phoneCode: selectedCountry.phoneCode });
    setPhoneCodeModalVisible(false);
  };

  const handleUpdateProfile = async () => {
    if (!user || !user._id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User not found. Please log in again.",
      });
      return;
    }

    const { firstName, lastName, gender, country } = form;
    if (!firstName.trim() || !lastName.trim() || !gender || !country.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", `${firstName.trim()} ${lastName.trim()}`.trim());
    formData.append("gender", gender);
    formData.append("address", country.trim());
    if (form.phone.trim()) {
      formData.append("phone", `${form.phoneCode}${form.phone.trim()}`);
    }
    
    if (form.avatar && form.avatar !== user.avatar) {
      const uriParts = form.avatar.split(".");
      const fileType = uriParts[uriParts.length - 1];
    
      formData.append("avatar", {
        uri: form.avatar,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      });
    }    
    
    try {
      const response = await updateUser(user._id, formData);
      setUser(response.data);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.message || "Profile updated successfully!",
      });
    } catch (err) {
      let errorMessage = "Failed to update profile.";
      if (err.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.response) {
        errorMessage = err.response.data.message || `Server error: ${err.response.status}`;
      }
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Updating profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFirstNameValid = form.firstName.trim().length > 0;
  const isLastNameValid = form.lastName.trim().length > 0;
  const isGenderValid = !!form.gender;
  const isCountryValid = form.country.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Update Your Profile</Text>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {form.avatar ? (
                <Image source={{ uri: form.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#3a0047" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={18} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarText}>Tap to change profile photo</Text>
          </View>

          {/* First Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              First Name <Text style={styles.required}>*Required</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={(text) => setForm({ ...form, firstName: text })}
                placeholder="Enter First Name"
              />
              {isFirstNameValid && (
                <View style={styles.validIndicator}>
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              )}
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Last Name <Text style={styles.required}>*Required</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={(text) => setForm({ ...form, lastName: text })}
                placeholder="Enter Last Name"
              />
              {isLastNameValid && (
                <View style={styles.validIndicator}>
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              )}
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Gender <Text style={styles.required}>*Required</Text>
            </Text>
            <View style={styles.genderRow}>
              {["Male", "Female", "Unspecified"].map((option) => (
                <View key={option} style={styles.genderOption}>
                  <TouchableOpacity
                    style={[
                      styles.genderBox,
                      form.gender === option && styles.genderBoxSelected,
                    ]}
                    onPress={() => setForm({ ...form, gender: option })}
                  >
                    {form.gender === option && (
                      <Ionicons name="checkmark" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.genderText}>{option}</Text>
                </View>
              ))}
              {isGenderValid && (
                <View style={styles.validIndicator}>
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              )}
            </View>
          </View>

          {/* Country/Region */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Country/Region of Residence <Text style={styles.required}>*Required</Text>
            </Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setCountryModalVisible(true)}
            >
              <View style={styles.input}>
                <Text style={form.country ? styles.inputText : styles.placeholderText}>
                  {form.country || "Select Country"}
                </Text>
                <View style={styles.dropdownIcon}>
                  <Ionicons name="chevron-down" size={20} color="gray" />
                </View>
              </View>
              {isCountryValid && (
                <View style={styles.validIndicator}>
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Mobile Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Mobile Phone (Optional)</Text>
            <View style={styles.phoneContainer}>
              <TouchableOpacity
                style={styles.countryCodeContainer}
                onPress={() => setPhoneCodeModalVisible(true)}
              >
                <Text style={styles.phoneCodeText}>{form.phoneCode}</Text>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Enter Phone Number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={loading}>
            <Text style={styles.updateButtonText}>Update Personal Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={countryModalVisible}
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#3a0047" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectCountry(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {form.country === item.name && (
                    <Ionicons name="checkmark" size={20} color="#3a0047" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Phone Code Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={phoneCodeModalVisible}
        onRequestClose={() => setPhoneCodeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setPhoneCodeModalVisible(false)}>
                <Ionicons name="close" size={24} color="#3a0047" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectPhoneCode(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.name} ({item.phoneCode})
                  </Text>
                  {form.phoneCode === item.phoneCode && (
                    <Ionicons name="checkmark" size={20} color="#3a0047" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3a0047",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3a0047",
    marginBottom: 24,
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#3a0047",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0e6f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#3a0047",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3a0047",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  avatarText: {
    color: "#3a0047",
    fontSize: 16,
    fontWeight: "500",
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3a0047",
    marginBottom: 8,
  },
  required: {
    color: "#e91e63",
    fontWeight: "normal",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  validIndicator: {
    position: "absolute",
    right: 10,
    backgroundColor: "#00c853",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    paddingRight: 40,
  },
  genderOption: {
    alignItems: "center",
    width: "30%",
  },
  genderBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  genderBoxSelected: {
    backgroundColor: "#00c853",
    borderColor: "#00c853",
  },
  genderText: {
    color: "#3a0047",
    fontSize: 16,
  },
  dropdownIcon: {
    position: "absolute",
    right: 16,
  },
  phoneContainer: {
    flexDirection: "row",
  },
  countryCodeContainer: {
    width: 80,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  phoneCodeText: {
    fontSize: 16,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: "#3a0047",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3a0047",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3a0047",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
});

export default UpdateProfile;