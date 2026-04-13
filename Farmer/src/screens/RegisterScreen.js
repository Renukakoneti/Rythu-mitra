import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';
import { Colors } from '../constants/Colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phoneNumber || !password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        fullName: name,
        phoneNumber,
        password
      });

      const { token, user } = response.data;

      // Save token and user data
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));

      alert('Account created successfully!');
      navigation.replace('Main');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* TOP NAV */}
        <View className="px-8 pt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 items-center justify-center bg-slate-50 rounded-2xl"
          >
            <ArrowLeft size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. HEADER AREA */}
            <View className="pt-10 pb-10">
              <Text className="text-secondary text-5xl font-black tracking-tighter">
                Join Us<Text className="text-primary">.</Text>
              </Text>
              <Text className="text-slate-400 text-lg font-medium mt-4 tracking-tight leading-7">
                Begin your journey into precision field intelligence.
              </Text>
            </View>

            {/* 2. FORM FIELDS */}
            <View className="space-y-10">
              {/* Name Input */}
              <View>
                <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                  Legal Name
                </Text>
                <View className="flex-row items-center border-b-2 border-slate-100 pb-2">
                  <User size={20} color={Colors.slate400} strokeWidth={2} />
                  <TextInput
                    className="flex-1 ml-4 text-xl font-bold text-secondary"
                    placeholder="John Doe"
                    placeholderTextColor={Colors.slate400}
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View>
                <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                  Mobile Identity
                </Text>
                <View className="flex-row items-center border-b-2 border-slate-100 pb-2">
                  <Phone size={20} color={Colors.slate400} strokeWidth={2} />
                  <TextInput
                    className="flex-1 ml-4 text-xl font-bold text-secondary"
                    placeholder="91 00000 00000"
                    placeholderTextColor={Colors.slate400}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                  Security Key
                </Text>
                <View className="flex-row items-center border-b-2 border-slate-100 pb-2">
                  <Lock size={20} color={Colors.slate400} strokeWidth={2} />
                  <TextInput
                    className="flex-1 ml-4 text-xl font-bold text-secondary"
                    placeholder="Create a strong key"
                    placeholderTextColor={Colors.slate400}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ?
                      <EyeOff size={20} color={Colors.slate400} /> :
                      <Eye size={20} color={Colors.slate400} />
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 3. FOOTER ACTIONS */}
            <View className="mt-auto pt-12 pb-12">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleRegister}
                disabled={isLoading}
                className={`h-20 rounded-[30px] flex-row items-center justify-center shadow-2xl ${isLoading ? 'bg-slate-300' : 'bg-secondary shadow-slate-400'}`}
              >
                <Text className="text-white font-black uppercase tracking-[2px] text-xs">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                {!isLoading && (
                  <View className="ml-4 bg-white/10 p-2 rounded-full">
                    <ArrowRight size={18} color="white" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-8 items-center"
                onPress={() => navigation.navigate('Login')}
              >
                <Text className="text-slate-400 font-medium">
                  Already registered? <Text className="text-primary font-black">Login Here</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default RegisterScreen;
