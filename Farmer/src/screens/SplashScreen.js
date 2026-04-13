import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Sprout } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const checkStatus = async () => {
      const completed = await SecureStore.getItemAsync('hasCompletedOnboarding');
      const token = await SecureStore.getItemAsync('userToken');

      setTimeout(() => {
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace(completed === 'true' ? 'Login' : 'Onboarding');
        }
      }, 3000);
    };
    checkStatus();
  }, []);

  return (
    <View className="flex-1 bg-white items-center justify-center">

      {/* 1. THE CENTERED WATERMARK */}
      {/* Positioned absolutely and centered with minus margins */}
      <View className="absolute items-center justify-center">
        <Text
          style={{
            fontSize: 500,
            color: Colors.slate50, // Ultra-light gray, barely visible
            lineHeight: 500,
            includeFontPadding: false,
          }}
          className="font-black"
        >
          M
        </Text>
      </View>

      <SafeAreaView className="flex-1 items-center justify-center">
        {/* 2. MAIN LOGO & BRAND */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUp }]
          }}
          className="items-center"
        >
          {/* SQUIRCLE ICON */}
          <View
            style={{ shadowColor: Colors.success, shadowOpacity: 0.2, shadowRadius: 20 }}
            className="bg-secondary w-28 h-28 rounded-[40px] items-center justify-center mb-10"
          >
            <Sprout size={50} color={Colors.success} strokeWidth={2} />
          </View>

          {/* TEXT BRANDING */}
          <View className="items-center">
            <Text className="text-secondary text-5xl font-[900] tracking-tighter">
              RYTHU<Text className="text-success">MITRA</Text>
            </Text>
            <Text className="text-slate-400 font-bold uppercase tracking-[8px] text-[10px] mt-6">
              Intelligence in Field
            </Text>
          </View>
        </Animated.View>

        {/* 3. MINIMALIST LOADER */}
        <View className="absolute bottom-20 items-center">
          <View className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
            <Animated.View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: Colors.success,
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0]
                  })
                }]
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SplashScreen;
