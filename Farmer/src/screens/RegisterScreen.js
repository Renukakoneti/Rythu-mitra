// RegisterScreen.js - Updated Versioimport React, { useState } from 'react';
// RegisterScreen.js - Updated Versi
import { Eye, EyeOff, Lock, Phone, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { storage } from '../utils/storage';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');

  const languages = [
    { label: 'తెలుగు', value: 'Telugu' },
    { label: 'English', value: 'English' },
    { label: 'Voice AI - తెలుగు', value: 'Voice AI' }
  ];

  const handleContinue = async () => {
    if (!name || !phoneNumber || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Enter valid 10 digit mobile number');
      return;
    }

    try {
      // 1. Save language preference locally
      await storage.setItemAsync('userLanguage', selectedLanguage);

      // 2. Call API to save in DB
      const userData = {
        fullName: name,
        phoneNumber,
        password,
        alertMode: selectedLanguage
      };
      
      const { authService } = require('../services/api');
      await authService.register(userData);

      Alert.alert('Success', 'Account Created Successfully!');
      navigation.navigate('Login');
    } catch (err) {
      console.log('Registration error:', err);
      Alert.alert('Error', err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>

            <Text className="text-secondary text-4xl font-black mt-10">రైతు మిత్ర</Text>
            <Text className="text-slate-500 mt-2">కొత్త ఖాతా సృష్టించండి</Text>

            {/* Name */}
            <View className="mt-10">
              <Text className="text-slate-600 font-bold mb-2">పేరు</Text>
              <View className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <TextInput
                  placeholder="మీ పూర్తి పేరు"
                  value={name}
                  onChangeText={setName}
                  className="text-lg"
                />
              </View>
            </View>

            {/* Mobile */}
            <View className="mt-8">
              <Text className="text-slate-600 font-bold mb-2">మొబైల్ నంబర్</Text>
              <View className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex-row items-center">
                <Phone size={24} color={Colors.primary} />
                <TextInput
                  placeholder="10 అంకెల మొబైల్ నంబర్"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  className="flex-1 ml-4 text-lg"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mt-8">
              <Text className="text-slate-600 font-bold mb-2">పాస్‌వర్డ్</Text>
              <View className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex-row items-center">
                <Lock size={24} color={Colors.primary} />
                <TextInput
                  placeholder="పాస్‌వర్డ్ సృష్టించండి"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 ml-4 text-lg"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? 
                    <EyeOff size={24} color={Colors.slate400} /> : 
                    <Eye size={24} color={Colors.slate400} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Selection */}
            <View className="mt-10">
              <Text className="text-slate-600 font-bold mb-4">భాష ఎంచుకోండి</Text>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  onPress={() => setSelectedLanguage(lang.value)}
                  className={`p-5 rounded-2xl mb-4 border-2 flex-row items-center justify-between ${
                    selectedLanguage === lang.value ? 'border-green-600 bg-green-50' : 'border-slate-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    {lang.value === 'Voice AI' && <Volume2 size={22} color="#10b981" className="mr-3" />}
                    <Text className="text-lg font-semibold">{lang.label}</Text>
                  </View>
                  {selectedLanguage === lang.value && <Text className="text-green-600 text-2xl">✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-green-600 py-6 rounded-3xl mt-12"
            >
              <Text className="text-white text-center font-bold text-xl">కొనసాగించండి →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-8 mb-8 items-center"
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="text-slate-500 font-medium text-lg">
                ఇప్పటికే ఖాతా ఉందా? <Text className="text-green-600 font-bold">లాగిన్ చేయండి</Text>
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default RegisterScreen;