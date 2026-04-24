import * as Speech from 'expo-speech';
import { AlertCircle, Bell, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const AlertsScreen = () => {

  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [lastAlertId, setLastAlertId] = useState(null);

  // 🔥 SENSOR ALERT LOGIC
  const generateAlerts = (data) => {
    let alerts = [];

    // 🌱 Soil Moisture
    if (data.soil < 40) {
      alerts.push({
        _id: "soil",
        title: "Soil Moisture Low",
        message: "మట్టి తేమ తక్కువగా ఉంది. దీనివల్ల మొక్కలు ఎండిపోతాయి. వెంటనే నీరు పోయండి!"
      });
    }

    // 🌡 Temperature
    if (data.temperature > 35) {
      alerts.push({
        _id: "temp",
        title: "High Temperature",
        message: "ఉష్ణోగ్రత ఎక్కువగా ఉంది. దీనివల్ల మొక్కలు నీరు కోల్పోతాయి. నీరు పోయండి!"
      });
    }

    // 💧 Humidity
    if (data.humidity < 30) {
      alerts.push({
        _id: "humidity",
        title: "Low Humidity",
        message: "గాలి తేమ తక్కువగా ఉంది! దీనివల్ల ఆకులు ఎండిపోతాయి. తేమ పెంచండి."
      });
    }

    // 🌧 Rain
    if (data.rain === 1) {
      alerts.push({
        _id: "rain",
        title: "Rain Detected",
        message: "వర్షం పడుతోంది! నీటి వ్యవస్థ ఆపండి."
      });
    }

    // 🔥 Gas / Smoke
    if (data.gas > 300) {
      alerts.push({
        _id: "gas",
        title: "Smoke Detected",
        message: "పొగ గుర్తించబడింది! ప్రమాదం ఉండవచ్చు. వెంటనే చెక్ చేయండి!"
      });
    }

    return alerts;
  };

  // 📡 FETCH SENSOR DATA
  const fetchSensorData = async () => {
    try {
      const res = await fetch("https://rythu-mitra-chea.onrender.com/api"); // 🔁 replace with your backend
      const data = await res.json();

      const generatedAlerts = generateAlerts(data);
      setAlerts(generatedAlerts);

    } catch (err) {
      console.log("Error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // 🔁 AUTO FETCH EVERY 5 SEC
  useEffect(() => {
    fetchSensorData();

    const interval = setInterval(() => {
      fetchSensorData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🚨 AUTO POPUP + VOICE
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[0];

      if (latestAlert._id !== lastAlertId) {
        setLastAlertId(latestAlert._id);

        setCurrentAlert(latestAlert);
        setModalVisible(true);

        Speech.speak(latestAlert.message, {
          language: 'te-IN',
          pitch: 1.0,
          rate: 0.9,
        });
      }
    }
  }, [alerts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSensorData();
  };

  const speakAlert = (message) => {
    Speech.speak(message, {
      language: 'te-IN',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const showVoiceAlert = (alertItem) => {
    setCurrentAlert(alertItem);
    setModalVisible(true);
    speakAlert(alertItem.message);
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase">Notifications</Text>
              <Text className="text-3xl font-black">అలర్ట్స్</Text>
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
              <Text className="text-slate-400 mt-6">
                ఇప్పుడు ఎలాంటి అలర్ట్స్ లేవు
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => showVoiceAlert(item)}
              className="mx-4 mb-4 bg-white border rounded-2xl p-5"
            >
              <View className="flex-row items-center">
                <AlertCircle size={26} color="red" />
                <View className="ml-4 flex-1">
                  <Text className="font-bold text-lg">{item.title}</Text>
                  <Text className="text-slate-500">{item.message}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* 🚨 POPUP MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/70 justify-center items-center">
            <View className="bg-white w-[90%] rounded-3xl p-8 items-center">

              <Text className="text-5xl mb-2">🚨</Text>
              <Text className="text-3xl font-black text-red-600">అలర్ట్!</Text>

              <Text className="text-xl text-center mt-6 font-bold">
                {currentAlert?.message}
              </Text>

              {/* 🔊 Voice Button */}
              <TouchableOpacity
                onPress={() => speakAlert(currentAlert?.message)}
                className="bg-green-600 w-full py-5 rounded-2xl mt-8 flex-row justify-center items-center"
              >
                <Volume2 size={24} color="white" />
                <Text className="text-white text-lg ml-2">
                  🔊 వినండి
                </Text>
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-5"
              >
                <Text className="text-gray-500">మూసివేయి</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default AlertsScreen;