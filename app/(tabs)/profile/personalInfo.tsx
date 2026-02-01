import DynamicTextInput from '@/components/TextInput';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PersonalInformationScreenProps {
  onBack?: () => void;
}

interface FormData {
  gender: 'Male' | 'Female';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: Date | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
}

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
];

const ChangeImageIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path d="M6.00001 7.16667C4.98667 7.16667 4.16667 6.34667 4.16667 5.33333C4.16667 4.32 4.98667 3.5 6.00001 3.5C7.01334 3.5 7.83334 4.32 7.83334 5.33333C7.83334 6.34667 7.01334 7.16667 6.00001 7.16667ZM6.00001 4.5C5.54001 4.5 5.16667 4.87333 5.16667 5.33333C5.16667 5.79333 5.54001 6.16667 6.00001 6.16667C6.46001 6.16667 6.83334 5.79333 6.83334 5.33333C6.83334 4.87333 6.46001 4.5 6.00001 4.5Z" fill="#1E3A8A" />
    <Path d="M10 15.1673H6C2.38 15.1673 0.833328 13.6207 0.833328 10.0007V6.00065C0.833328 2.38065 2.38 0.833984 6 0.833984H8.66666C8.93999 0.833984 9.16666 1.06065 9.16666 1.33398C9.16666 1.60732 8.93999 1.83398 8.66666 1.83398H6C2.92666 1.83398 1.83333 2.92732 1.83333 6.00065V10.0007C1.83333 13.074 2.92666 14.1673 6 14.1673H10C13.0733 14.1673 14.1667 13.074 14.1667 10.0007V6.66732C14.1667 6.39398 14.3933 6.16732 14.6667 6.16732C14.94 6.16732 15.1667 6.39398 15.1667 6.66732V10.0007C15.1667 13.6207 13.62 15.1673 10 15.1673Z" fill="#1E3A8A" />
    <Path d="M10.4467 6.50028C10.1867 6.50028 9.94667 6.40695 9.77333 6.22695C9.56667 6.02028 9.46667 5.71362 9.51333 5.40028L9.64667 4.47362C9.68 4.24028 9.82 3.95362 9.99333 3.78695L12.4133 1.36695C13.38 0.400285 14.22 0.953618 14.6333 1.36695C15.0267 1.76028 15.2067 2.17362 15.1667 2.60028C15.1333 2.94028 14.96 3.26695 14.6333 3.58695L12.2133 6.00695C12.0467 6.17362 11.76 6.31362 11.5267 6.35362L10.6 6.48695C10.5467 6.50028 10.4933 6.50028 10.4467 6.50028ZM13.1133 2.08028L10.6933 4.50028C10.6733 4.52028 10.64 4.59362 10.6333 4.62695L10.5067 5.49362L11.38 5.37362C11.4067 5.36695 11.48 5.33362 11.5067 5.30695L13.9267 2.88695C14.0733 2.74028 14.16 2.60695 14.1667 2.50695C14.18 2.36695 14.04 2.19362 13.9267 2.08028C13.58 1.73362 13.42 1.77362 13.1133 2.08028Z" fill="#1E3A8A" />
    <Path d="M13.9333 4.08586C13.8867 4.08586 13.84 4.07919 13.8 4.06586C12.9067 3.81252 12.1933 3.09919 11.94 2.20586C11.8667 1.93919 12.02 1.66586 12.2867 1.59252C12.5533 1.51919 12.8267 1.67252 12.9 1.93919C13.06 2.49919 13.5067 2.95252 14.0733 3.11252C14.34 3.18586 14.4933 3.46586 14.42 3.72586C14.3467 3.93919 14.1467 4.08586 13.9333 4.08586Z" fill="#1E3A8A" />
    <Path d="M1.78 13.133C1.62 13.133 1.46 13.053 1.36667 12.913C1.21334 12.6864 1.27334 12.373 1.5 12.2197L4.78667 10.013C5.50667 9.53305 6.5 9.58638 7.15334 10.1397L7.37334 10.333C7.70667 10.6197 8.27333 10.6197 8.6 10.333L11.3733 7.95305C12.08 7.34638 13.1933 7.34638 13.9067 7.95305L14.9933 8.88638C15.2 9.06638 15.2267 9.37971 15.0467 9.59305C14.8667 9.79971 14.5533 9.82638 14.34 9.64638L13.2533 8.71305C12.92 8.42638 12.3533 8.42638 12.0267 8.71305L9.25334 11.093C8.54667 11.6997 7.43334 11.6997 6.72 11.093L6.5 10.8997C6.19334 10.6397 5.68667 10.613 5.34667 10.8464L2.06667 13.053C1.97334 13.1064 1.87334 13.133 1.78 13.133Z" fill="#1E3A8A" />
  </Svg>
);

const PersonalInformationScreen: React.FC<PersonalInformationScreenProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    gender: 'Male',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: null,
  });
  const [userData, setUserData] = useState<any>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to Nigeria
  const [profileImage, setProfileImage] = useState('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-uiWZpE1Qty216BeoE2TvGhJuTzepqs.png');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user data from AsyncStorage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserData(user);
          
          // Set profile image if available
          if (user.profile_image) {
            setProfileImage(user.profile_image);
          }
          
          // Parse date of birth if available
          let dateOfBirth = null;
          if (user.dob) {
            dateOfBirth = new Date(user.dob);
          }
          
          // Set form data from user data
          setFormData({
            gender: user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : 'Male',
            firstName: user.firstname || '',
            lastName: user.lastname || '',
            phoneNumber: user.phone || '',
            email: user.email || '',
            dateOfBirth: dateOfBirth,
          });
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const age = today.getFullYear() - formData.dateOfBirth.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setHasChanges(true);
  };

  const handleImageChange = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        setHasChanges(true);
        Alert.alert('Success', 'Profile image updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare the payload in JSON format
      const payload: any = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        gender: formData.gender === 'Male' ? 'MALE' : 'FEMALE',
      };
      
      // Add date of birth if available (format: YYYY-MM-DD)
      if (formData.dateOfBirth) {
        payload.dob = formData.dateOfBirth.toISOString().split('T')[0];
      }

      console.log('Profile update payload:', payload);

      // Call the API
      const response = await api.post({
        url: 'api/v1/users/profile/update',
        data: payload,
        auth: true,
      });
      console.log('Profile update response:', response);

      // Update user data in AsyncStorage
      const updatedUser = response;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);

      Alert.alert(
        'Success',
        'Your personal information has been updated successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            setHasChanges(false);
          }
        }]
      );
    } catch (error) {
      console.log('Profile update error:', error);
      Alert.alert(
        'Error', 
        (error as {response?: {data: {message: string}}})?.response?.data?.message || 'Failed to save changes. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on selected country
    if (selectedCountry.code === 'NG') {
      // Nigerian format: XXX XXX XXXX
      if (cleaned.length >= 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      } else if (cleaned.length >= 6) {
        return cleaned.replace(/(\d{3})(\d{3})/, '$1 $2');
      } else if (cleaned.length >= 3) {
        return cleaned.replace(/(\d{3})/, '$1');
      }
    } else if (selectedCountry.code === 'US' || selectedCountry.code === 'CA') {
      // US/Canada format: (XXX) XXX-XXXX
      if (cleaned.length >= 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
    }
    
    return cleaned;
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryDialCode}>{item.dialCode}</Text>
      </View>
      {selectedCountry.code === item.code && (
        <Ionicons name="checkmark" size={20} color="#10b981" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            </View>
            <TouchableOpacity onPress={handleImageChange} style={styles.changeImageButton}>
              <ChangeImageIcon />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.genderInputContainer}>
                <Text style={styles.genderLabel}>Gender</Text>
                
                {/* Male Option */}
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === 'Male' && styles.genderOptionSelected
                  ]}
                  onPress={() => handleInputChange('gender', 'Male')}
                >
                  <View style={[
                    styles.radioButton,
                    formData.gender === 'Male' && styles.radioButtonSelected
                  ]}>
                    {formData.gender === 'Male' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'Male' && styles.genderTextSelected
                  ]}>Male</Text>
                </TouchableOpacity>
                
                {/* Female Option */}
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === 'Female' && styles.genderOptionSelected
                  ]}
                  onPress={() => handleInputChange('gender', 'Female')}
                >
                  <View style={[
                    styles.radioButton,
                    formData.gender === 'Female' && styles.radioButtonSelected
                  ]}>
                    {formData.gender === 'Female' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'Female' && styles.genderTextSelected
                  ]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* First Name */}
            <View style={styles.inputGroup}>
              <DynamicTextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                inputType="text"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <DynamicTextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                inputType="text"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <DynamicTextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                inputType="phone"
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <DynamicTextInput
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text.toLowerCase())}
                inputType="email"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <DynamicTextInput
                  label="Date of Birth"
                  value={formData.dateOfBirth ? formatDate(formData.dateOfBirth) : ''}
                  inputType="text"
                  customStyle={{
                    pointerEvents: 'none'
                  }}
                />
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              (!hasChanges || isLoading) && styles.saveButtonDisabled
            ]} 
            onPress={handleSaveChanges}
            disabled={!hasChanges || isLoading}
          >
            <Text style={[
              styles.saveButtonText,
              (!hasChanges || isLoading) && styles.saveButtonTextDisabled
            ]}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Country</Text>
            <View style={styles.modalSpacer} />
          </View>
          <FlatList
            data={countries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            style={styles.countryList}
          />
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={styles.datePickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={formData.dateOfBirth || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    textColor="#000000"
                    accentColor="#EF8B09"
                    style={styles.datePicker}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      
      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={formData.dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          textColor="#000000"
          accentColor="#EF8B09"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginTop: Platform.OS === "android" ? 40 : 0,
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
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeImageText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'InstrumentSansSemiBold',
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  genderInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7F0FA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 15,
  },
  genderLabel: {
    fontSize: 16,
    color: '#959595',
    fontFamily: 'InstrumentSans',
    marginRight: 20,
    minWidth: 60,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  genderOptionSelected: {
    // No background change since it's all in one container
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#10b981',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  genderText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'InstrumentSans',
  },
  genderTextSelected: {
    color: '#10b981',
    fontFamily: 'InstrumentSansSemiBold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
    minWidth: 100,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#9ca3af',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancelText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginRight: 60,
  },
  modalSpacer: {
    width: 60,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  countryDialCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'InstrumentSans',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'InstrumentSansSemiBold',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#EF8B09',
    fontFamily: 'InstrumentSansSemiBold',
  },
  datePicker: {
    backgroundColor: '#ffffff',
  },
});

export default PersonalInformationScreen;