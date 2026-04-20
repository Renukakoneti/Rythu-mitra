import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, Bell, Volume2, X } from 'lucide-react-native';
import * as Speech from 'expo-speech';   // For Voice AI
import { alertService } from '../services/api';
import { Colors } from '../constants/Colors';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  const fetchAlerts = async () => {
    try {
      const response = await alertService.getAlerts();
      setAlerts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  // Voice AI Speaking Function
  const speakAlert = (message) => {
    Speech.speak(message, {
      language: 'te-IN',     // Telugu
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // Show Big Voice Alert
  const showVoiceAlert = (alertItem) => {
    setCurrentAlert(alertItem);
    setModalVisible(true);
    
    // Auto speak when alert opens
    const teluguMessage = alertItem.message || "మట్టి తేమ తక్కువగా ఉంది. నీరు పోయండి!";
    speakAlert(teluguMessage);
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Notifications</Text>
              <Text className="text-secondary text-3xl font-black">అలర్ట్స్</Text>
            </View>
            <Bell size={28} color={Colors.primary} />
          </View>
        </View>

        <FlatList
          data={alerts}
          keyExtractor={item => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <View className="items-center justify-center mt-20">
              <Bell size={60} color={Colors.slate300} />
              <Text className="text-slate-400 font-bold mt-6">ఇప్పుడు ఎలాంటి అలర్ట్స్ లేవు</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => showVoiceAlert(item)}
              className="mx-4 mb-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm"
            >
              <View className="flex-row items-center">
                <AlertCircle size={28} color="#ef4444" />
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-lg text-secondary">{item.title || "Soil Moisture Low"}</Text>
                  <Text className="text-slate-500 mt-1">{item.message}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* ========== BIG VOICE AI ALERT MODAL ========== */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/70 justify-center items-center">
            <View className="bg-white w-[92%] rounded-3xl p-8 items-center">
              
              <Text className="text-red-600 text-5xl mb-2">🚨</Text>
              <Text className="text-red-600 text-3xl font-black">అలర్ట్!</Text>

              <Text className="text-2xl font-bold text-center mt-6 leading-8">
                మట్టి తేమ తక్కువగా ఉంది
              </Text>
              <Text className="text-6xl font-black text-red-500 mt-4">33%</Text>

              <Text className="text-xl font-semibold text-center mt-6">
                నీరు పోయండి!
              </Text>

              {/* Big Voice Button */}
              <TouchableOpacity 
                onPress={() => speakAlert("మట్టి తేమ తక్కువగా ఉంది. నీరు పోయండి!")}
                className="bg-green-600 w-full py-6 rounded-2xl mt-10 flex-row justify-center items-center"
              >
                <Volume2 size={28} color="white" />
                <Text className="text-white font-black text-xl ml-3">🔊 వాయిస్ లో వినండి</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="mt-6"
              >
                <Text className="text-slate-400 font-medium">మూసివేయి</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default AlertsScreen;
