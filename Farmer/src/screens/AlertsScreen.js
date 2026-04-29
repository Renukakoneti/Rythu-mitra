import * as Speech from 'expo-speech';
import { AlertCircle, Bell, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { alertService } from '../services/api';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  // ---------------- FETCH ALERTS ----------------
  const fetchAlerts = async () => {
    try {
      const response = await alertService.getAlerts();
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(() => {
      fetchAlerts();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  // ---------------- SENSOR ALERT ENGINE ----------------
  const generateSensorAlerts = (item) => {
    const msgs = [];

    // 🌡 Temperature
    if (item?.temperature >= 25) {
      msgs.push('ఉష్ణోగ్రత ఎక్కువగా ఉంది. నీరు ఎక్కువగా పెట్టండి.');
    }

    // 🌱 Soil Moisture
    if (item?.soilMoisture <= 30) {
      msgs.push('నేల తేమ తక్కువగా ఉంది. నీరు పెట్టండి.');
    }

    // ☁ Gas / Smoke
    if (item?.gas === 'high' || item?.gas === 'smoke_detected') {
      msgs.push('పొగ వస్తోంది. వెంటనే పొలానికి వచ్చి చెక్ చేసుకోండి.');
    }

    // 🌧 Rain Sensor (YOUR ADDED MESSAGE)
    if (item?.rainDetected === true || item?.rain === 'high') {
      msgs.push(
        'ఈ రోజు వర్షం పడుతోంది. నీరు పెట్టాల్సిన అవసరం లేదు. నీరు నిల్వ కాకుండా కాలువలు తెరవండి.'
      );
    }

    return msgs;
  };

  // ---------------- VOICE AI ----------------
  const speakSensorAlerts = (item) => {
    if (!item) return;

    const messages = generateSensorAlerts(item);

    Speech.stop();

    if (messages.length === 0) {
      Speech.speak('అన్ని సెన్సార్లు సాధారణంగా ఉన్నాయి.', {
        language: 'te-IN',
      });
      return;
    }

    messages.forEach((msg, index) => {
      setTimeout(() => {
        Speech.speak(msg, {
          language: 'te-IN',
          pitch: 1.0,
          rate: 0.9,
        });
      }, index * 3000);
    });
  };

  // ---------------- OPEN ALERT ----------------
  const showVoiceAlert = (item) => {
    setCurrentAlert(item);
    setModalVisible(true);

    speakSensorAlerts(item);
  };

  // ---------------- UI ----------------
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* HEADER */}
        <View className="px-6 pt-8 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase">
              Notifications
            </Text>
            <Text className="text-secondary text-3xl font-black">
              Alerts
            </Text>
          </View>
          <Bell size={28} color={Colors.primary} />
        </View>

        {/* ALERT LIST */}
        <FlatList
          data={alerts}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Bell size={60} color={Colors.slate300} />
              <Text className="text-slate-400 mt-4">
                No alerts available
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => showVoiceAlert(item)}
              className="mx-4 mb-4 p-5 border border-slate-100 rounded-2xl"
            >
              <View className="flex-row items-center">
                <AlertCircle size={24} color="red" />
                <View className="ml-4 flex-1">
                  <Text className="font-bold text-lg">
                    Sensor Alert
                  </Text>
                  <Text className="text-slate-500 mt-1">
                    🌱 Soil: {item.soilMoisture}% | 🌡 Temp: {item.temperature}°C
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* ---------------- MODAL ---------------- */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/70 justify-center items-center">

            <View className="bg-white w-[90%] p-6 rounded-3xl items-center">

              <Text className="text-4xl">🚨</Text>
              <Text className="text-2xl font-bold mt-2">Alert</Text>

              <Text className="text-lg mt-4">
                🌡 Temperature: {currentAlert?.temperature ?? '-'}°C
              </Text>

              <Text>
                💧 Humidity: {currentAlert?.humidity ?? '-'}%
              </Text>

              <Text>
                ☁ Gas: {currentAlert?.gas ?? '-'}
              </Text>

              <Text>
                🌱 Soil: {currentAlert?.soilMoisture ?? '-'}%
              </Text>

              {/* VOICE BUTTON */}
              <TouchableOpacity
                onPress={() => speakSensorAlerts(currentAlert)}
                className="bg-green-600 px-6 py-4 rounded-xl mt-6 flex-row items-center"
              >
                <Volume2 size={20} color="white" />
                <Text className="text-white ml-2 font-bold">
                  Play Voice Alert
                </Text>
              </TouchableOpacity>

              {/* CLOSE */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-4"
              >
                <Text className="text-gray-400">Close</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default AlertsScreen;