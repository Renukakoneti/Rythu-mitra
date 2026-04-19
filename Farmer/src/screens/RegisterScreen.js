// RegisterScreen.js - Updated Versioimport React, { useState } from 'react';
// RegisterScreen.js - Updated Versi
import { ArrowRight, Phone, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');

  const languages = [
    { label: 'తెలుగు', value: 'Telugu' },
    { label: 'English', value: 'English' },
    { label: 'Voice AI (తెలుగు)', value: 'Voice AI' }
  ];

  const handleContinue = () => {
    if (!name || !phoneNumber) {
      Alert.alert('Error', 'Please enter Name and Mobile Number');
      return;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter valid 10 digit mobile number');
      return;
    }

    // TODO: Save language preference later
    console.log('User Data:', { name, phoneNumber, language: selectedLanguage });

    navigation.navigate('Login'); // or next screen (OTP)
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>

            {/* Header */}
            <View className="mt-10">
              <Text className="text-secondary text-4xl font-black">Welcome to Rythu Mitra</Text>
              <Text className="text-slate-500 mt-3 text-lg">Create your account</Text>
            </View>

            {/* Name Input */}
            <View className="mt-12">
              <Text className="text-slate-600 font-bold mb-2">Full Name</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <TextInput
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  className="text-lg font-semibold text-secondary"
                />
              </View>
            </View>

            {/* Mobile Input */}
            <View className="mt-8">
              <Text className="text-slate-600 font-bold mb-2">Mobile Number</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex-row items-center">
                <Phone size={24} color={Colors.primary} />
                <TextInput
                  placeholder="Enter 10 digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  className="flex-1 ml-4 text-lg font-semibold text-secondary"
                />
              </View>
            </View>

            {/* Language Selection */}
            <View className="mt-10">
              <Text className="text-slate-600 font-bold mb-4">Choose Language</Text>
              
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  onPress={() => setSelectedLanguage(lang.value)}
                  className={`p-5 rounded-2xl mb-4 border-2 flex-row items-center justify-between ${
                    selectedLanguage === lang.value ? 'border-primary bg-primary/5' : 'border-slate-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    {lang.value === 'Voice AI' && <Volume2 size={22} color="#10b981" className="mr-3" />}
                    <Text className={`text-lg font-semibold ${selectedLanguage === lang.value ? 'text-primary' : 'text-slate-700'}`}>
                      {lang.label}
                    </Text>
                  </View>
                  {selectedLanguage === lang.value && (
                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-primary py-6 rounded-3xl mt-12 flex-row items-center justify-center shadow-lg"
            >
              <Text className="text-white font-black text-xl">Continue</Text>
              <ArrowRight size={28} color="white" className="ml-3" />
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default RegisterScreen;