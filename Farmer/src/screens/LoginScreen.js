import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { storage } from '../utils/storage';
import { authService } from '../services/api';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      alert('Please enter both phone number and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(phoneNumber, password);
      const { token, user } = response.data;

      // Save token securely
      await storage.setItemAsync('userToken', token);
      await storage.setItemAsync('userData', JSON.stringify(user));

      navigation.replace('Main');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. MINIMAL BRANDING AREA */}
            <View className="pt-12 pb-12">
              <View className="bg-secondary w-16 h-16 rounded-[22px] items-center justify-center shadow-xl shadow-slate-300 mb-8">
                <Sprout size={32} color={Colors.success} strokeWidth={2.5} />
              </View>
              <Text className="text-secondary text-5xl font-black tracking-tighter">
                Sign In<Text className="text-primary">.</Text>
              </Text>
              <Text className="text-slate-400 text-lg font-medium mt-4 tracking-tight">
                Enter your credentials to access field intelligence.
              </Text>
            </View>

            {/* 2. ELEGANT FORM FIELDS */}
            <View className="space-y-8">
              {/* Phone Input */}
              <View>
                <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                  Mobile Number
                </Text>
                <View className="flex-row items-center border-b-2 border-slate-100 pb-2 focus:border-emerald-500">
                  <Phone size={20} color={Colors.slate400} strokeWidth={2} />
                  <TextInput
                    className="flex-1 ml-4 text-xl font-bold text-secondary"
                    placeholder="91 00000 00000"
                    placeholderTextColor={Colors.slate400}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                  Access Key
                </Text>
                <View className="flex-row items-center border-b-2 border-slate-100 pb-2">
                  <Lock size={20} color={Colors.slate400} strokeWidth={2} />
                  <TextInput
                    className="flex-1 ml-4 text-xl font-bold text-secondary"
                    placeholder="••••••••"
                    placeholderTextColor={Colors.slate400}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ?
                      <EyeOff size={20} color={Colors.slate400} /> :
                      <Eye size={20} color={Colors.slate400} />
                    }
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  className="mt-4 self-end"
                >
                  <Text className="text-primary font-bold text-xs uppercase tracking-widest">Forgot?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. ACTION AREA */}
            <View className="mt-auto pb-12">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleLogin}
                disabled={isLoading}
                className={`h-20 rounded-[30px] flex-row items-center justify-center shadow-2xl ${isLoading ? 'bg-slate-300' : 'bg-secondary shadow-slate-400'}`}
              >
                <Text className="text-white font-black uppercase tracking-[2px] text-xs">
                  {isLoading ? 'Authenticating...' : 'Authorize Access'}
                </Text>
                {!isLoading && (
                  <View className="ml-4 bg-white/10 p-2 rounded-full">
                    <ArrowRight size={18} color="white" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-8 items-center"
                onPress={() => navigation.navigate('Register')}
              >
                <Text className="text-slate-400 font-medium">
                  New to Rythu Mitra? <Text className="text-primary font-black">Register Node</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
