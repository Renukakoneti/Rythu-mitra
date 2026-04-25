import * as Speech from 'expo-speech';
import { AlertCircle, Bell, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { storage } from '../utils/storage';
import { generateGlobalAlerts } from '../components/GlobalAlertHandler';

const AlertsScreen = () => {

  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userLanguage, setUserLanguage] = useState('Telugu');

  // 📡 FETCH SENSOR DATA manually for the list
  const fetchSensorData = async () => {
    try {
      const res = await fetch("https://rythu-mitra-chea.onrender.com/api/sensor");
      const data = await res.json();

      const lang = await storage.getItemAsync('userLanguage') || 'Telugu';
      setUserLanguage(lang);

      const generatedAlerts = generateGlobalAlerts(data, lang);
      setAlerts(generatedAlerts);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    // Intentionally removed polling and auto-voice from this screen.
    // The GlobalAlertHandler handles ongoing polls and modal alerts.
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSensorData();
  };

  const speakAlert = (message) => {
    Speech.speak(message, {
      language: userLanguage === 'English' ? 'en-US' : 'te-IN',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase">Notifications</Text>
              <Text className="text-3xl font-black">
                {userLanguage === 'English' ? 'Alerts' : 'అలర్ట్స్'}
              </Text>
            </View>
            <Bell size={28} color={Colors.primary} />
          </View>
        </View>

        {/* Alerts List */}
        <FlatList
          data={alerts}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="items-center mt-20">
              <Bell size={60} color={Colors.slate300} />
              <Text className="text-slate-400 mt-6 font-bold">
                {userLanguage === 'English' ? 'There are no active alerts right now' : 'ఇప్పుడు ఎలాంటి అలర్ట్స్ లేవు'}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className="mx-4 mb-4 bg-white border rounded-2xl p-5 border-slate-200 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1 pr-2">
                  <AlertCircle size={26} color="red" />
                  <Text className="font-bold text-lg ml-3 text-red-600">{item.title}</Text>
                </View>
                <TouchableOpacity onPress={() => speakAlert(item.message)} className="bg-slate-100 p-2 rounded-full">
                  <Volume2 size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <Text className="text-slate-500 text-[15px] leading-6">{item.message}</Text>
            </View>
          )}
        />

      </SafeAreaView>
    </View>
  );
};

export default AlertsScreen;