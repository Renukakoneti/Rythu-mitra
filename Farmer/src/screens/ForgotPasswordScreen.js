import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Lock, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { authService } from '../services/api';
import { Colors } from '../constants/Colors';

const ForgotPasswordScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!phoneNumber) return alert("Please enter your mobile number");
    
    setIsLoading(true);
    try {
      const res = await authService.verifyPhone(phoneNumber);
      setFullName(res.data.fullName);
      setIsVerified(true);
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ phoneNumber, newPassword });
      alert('Access Key updated successfully! Please login with your new key.');
      navigation.navigate('Login');
    } catch (error) {
      alert(error.response?.data?.message || 'Reset failed.');
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
            {/* Header */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="mt-8 bg-slate-50 w-12 h-12 rounded-2xl items-center justify-center"
            >
              <ArrowLeft size={20} color={Colors.secondary} />
            </TouchableOpacity>

            <View className="pt-10 pb-12">
              <Text className="text-secondary text-4xl font-black tracking-tighter">
                Recovery<Text className="text-primary">.</Text>
              </Text>
              <Text className="text-slate-400 text-lg font-medium mt-4 tracking-tight">
                Enter your mobile number to authorize an access key reset.
              </Text>
            </View>

            <View className="space-y-8">
              {/* Phone Input */}
              <View>
                <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                  Verified Mobile
                </Text>
                <View className={`flex-row items-center border-b-2 ${isVerified ? 'border-success' : 'border-slate-100'} pb-2`}>
                  <Phone size={20} color={isVerified ? Colors.success : Colors.slate400} />
                  <TextInput
                    className={`flex-1 ml-4 text-xl font-bold ${isVerified ? 'text-slate-400' : 'text-secondary'}`}
                    placeholder="91 00000 00000"
                    placeholderTextColor={Colors.slate400}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!isVerified}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                  {isVerified && <ShieldCheck size={20} color={Colors.success} />}
                </View>
              </View>

              {isVerified && (
                <>
                  {/* Confirmed Identity Area */}
                  <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Confirmed Identity</Text>
                    <Text className="text-secondary text-lg font-black mt-1">{fullName}</Text>
                  </View>

                  {/* New Password Input */}
                  <View>
                    <Text className="text-slate-400 font-black uppercase tracking-[3px] text-[10px] mb-3 ml-1">
                      New Access Key
                    </Text>
                    <View className="flex-row items-center border-b-2 border-slate-100 pb-2">
                      <Lock size={20} color={Colors.slate400} />
                      <TextInput
                        className="flex-1 ml-4 text-xl font-bold text-secondary"
                        placeholder="Minimal 6 characters"
                        placeholderTextColor={Colors.slate400}
                        secureTextEntry
                        autoFocus
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>

            <View className="mt-auto pb-12">
              <TouchableOpacity
                onPress={isVerified ? handleReset : handleVerify}
                disabled={isLoading}
                className={`h-20 rounded-[30px] flex-row items-center justify-center shadow-2xl ${isLoading ? 'bg-slate-300' : (isVerified ? 'bg-primary shadow-primary/20' : 'bg-secondary shadow-slate-400')}`}
              >
                <Text className="text-white font-black uppercase tracking-[2px] text-xs">
                  {isLoading ? 'Processing...' : (isVerified ? 'Reset Access Key' : 'Verify Account')}
                </Text>
                {!isLoading && (
                  <View className={`ml-4 ${isVerified ? 'bg-white/20' : 'bg-white/10'} p-2 rounded-full`}>
                    <ArrowRight size={18} color="white" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </View>


          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default ForgotPasswordScreen;
