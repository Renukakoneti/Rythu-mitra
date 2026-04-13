import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Sprout, Droplets, Bell, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    label: 'SURVEILLANCE',
    title: 'Precision Monitoring.',
    subtitle: 'Zero-latency hardware telemetry for modern agriculture.',
    icon: <Sprout size={140} color={Colors.primary} strokeWidth={0.5} />,
  },
  {
    id: '2',
    label: 'AUTOMATION',
    title: 'Intelligent Hydration.',
    subtitle: 'Logic-driven irrigation cycles based on atmospheric shifts.',
    icon: <Droplets size={140} color={Colors.primary} strokeWidth={0.5} />,
  },
  {
    id: '3',
    label: 'INTELLIGENCE',
    title: 'Instant Response.',
    subtitle: 'Critical alerts delivered the millisecond your crops need you.',
    icon: <Bell size={140} color={Colors.primary} strokeWidth={0.5} />,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      try {
        await SecureStore.setItemAsync('hasCompletedOnboarding', 'true');
        navigation.replace('Login');
      } catch (error) {
        console.log('Error saving onboarding status:', error);
        navigation.replace('Login');
      }
    }
  };

  const renderSlide = ({ item }) => (
    <View style={{ width }} className="flex-1 justify-between py-12">
      {/* 1. THE STAGE (Visual Center) */}
      <View className="items-center justify-center h-1/2">
        <View className="absolute w-72 h-72 bg-primaryLight/50 rounded-full" />
        <Animated.View className="z-10 shadow-2xl shadow-primary/20/50">
          {item.icon}
        </Animated.View>
      </View>

      {/* 2. THE CONTENT BLOCK */}
      <View className="px-10">
        <Text className="text-primary font-black tracking-[6px] text-[10px] mb-4 uppercase">
          {item.label}
        </Text>
        <Text className="text-secondary text-6xl font-black tracking-tighter leading-[54px] mb-6">
          {item.title}
        </Text>
        <Text className="text-slate-500 text-lg font-medium leading-7 max-w-[80%]">
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* PROGRESS HEADER */}
        <View className="px-10 pt-4 flex-row items-center">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-1 mr-2 rounded-full ${currentIndex === index ? 'w-12 bg-primary' : 'w-4 bg-slate-100'}`}
            />
          ))}
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
        />

        {/* BOTTOM ACTION BAR */}
        <View className="px-10 pb-10 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            className="bg-primary w-20 h-20 rounded-full items-center justify-center shadow-xl shadow-primary/20"
          >
            <ArrowRight size={28} color="white" strokeWidth={3} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

export default OnboardingScreen;
