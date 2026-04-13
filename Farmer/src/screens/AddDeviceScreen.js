import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Cpu, Tag, CheckCircle } from 'lucide-react-native';
import { deviceService } from '../services/api';
import { Colors } from '../constants/Colors';


const AddDeviceScreen = ({ navigation }) => {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinalize = async () => {
    // 1. Basic Validation
    if (!deviceId || !deviceName) {
      alert("Please fill in all fields");
      return;
    }

    // 2. Start Loading
    setIsLoading(true);

    try {
      // 3. API Request
      await deviceService.registerDevice({
        deviceId,
        name: deviceName
      });

      alert("Device paired successfully!");
      // 4. Go back
      navigation.goBack();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to pair device. Please check the serial number.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Navigation Header */}
        <View className="px-6 py-8 flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-slate-50 p-3 rounded-2xl mr-4"
            disabled={isLoading} // Prevent leaving during process
          >
            <ArrowLeft size={20} color={Colors.secondary} />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px]">Hardware</Text>
            <Text className="text-secondary text-3xl font-black">Pair Sensor</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-6"
        >
          {/* Form Fields */}
          <View className="mb-6">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Manual Entry</Text>

            <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 mb-4">
              <Cpu size={18} color={Colors.slate400} />
              <TextInput
                className="flex-1 ml-3 text-secondary font-bold"
                placeholder="Serial Number (SF-XXXX)"
                placeholderTextColor={Colors.slate300}
                value={deviceId}
                onChangeText={setDeviceId}
                editable={!isLoading}
              />
            </View>

            <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4">
              <Tag size={18} color={Colors.slate400} />
              <TextInput
                className="flex-1 ml-3 text-secondary font-bold"
                placeholder="Custom Node Name (e.g. Field A)"
                placeholderTextColor={Colors.slate300}
                value={deviceName}
                onChangeText={setDeviceName}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Register Button with Animation */}
          <View className="mt-auto mb-10">
            <TouchableOpacity
              onPress={handleFinalize}
              disabled={isLoading}
              className={`py-5 rounded-[25px] flex-row items-center justify-center shadow-lg ${isLoading ? 'bg-primaryLight' : 'bg-primary shadow-primary/20'
                }`}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" className="mr-3" />
                  <Text className="text-white font-black uppercase tracking-widest text-xs">Registering Node...</Text>
                </View>
              ) : (
                <>
                  <CheckCircle size={18} color="white" />
                  <Text className="text-white font-black ml-3 uppercase tracking-widest text-xs">Finalize Pairing</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AddDeviceScreen;
