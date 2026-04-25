import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { Volume2 } from 'lucide-react-native';
import { storage } from '../utils/storage';

export const generateGlobalAlerts = (data, language) => {
  let alerts = [];

  const isTelugu = language === 'Telugu' || language === 'Voice AI';

  // 🌱 Soil Moisture
  if (data.soil < 40) {
    alerts.push({
      _id: "soil",
      title: isTelugu ? "మట్టి తేమ తక్కువ" : "Soil Moisture Low",
      message: isTelugu ? "మట్టి తేమ తక్కువగా ఉంది. దీనివల్ల మొక్కలు ఎండిపోతాయి. వెంటనే నీరు పోయండి!" : "Soil moisture is low. Plants may dry out. Please water them immediately!"
    });
  }

  // 🌡 Temperature
  if (data.temperature > 35) {
    alerts.push({
      _id: "temp",
      title: isTelugu ? "అధిక ఉష్ణోగ్రత" : "High Temperature",
      message: isTelugu ? "ఉష్ణోగ్రత ఎక్కువగా ఉంది. దీనివల్ల మొక్కలు నీరు కోల్పోతాయి. నీరు పోయండి!" : "High temperature detected. Plants will lose water quickly. Please irrigate!"
    });
  }

  // 💧 Humidity
  if (data.humidity < 30) {
    alerts.push({
      _id: "humidity",
      title: isTelugu ? "తక్కువ తేమ" : "Low Humidity",
      message: isTelugu ? "గాలి తేమ తక్కువగా ఉంది! దీనివల్ల ఆకులు ఎండిపోతాయి. తేమ పెంచండి." : "Low humidity in the air! Leaves may dry out. Please increase moisture."
    });
  }

  // 🌧 Rain
  if (data.rain === 1) {
    alerts.push({
      _id: "rain",
      title: isTelugu ? "వర్షం పడుతోంది" : "Rain Detected",
      message: isTelugu ? "వర్షం పడుతోంది! నీటి వ్యవస్థ ఆపండి." : "Rain detected! Stop the irrigation system."
    });
  }

  // 🔥 Gas / Smoke
  if (data.gas > 300) {
    alerts.push({
      _id: "gas",
      title: isTelugu ? "పొగ గుర్తించబడింది" : "Smoke Detected",
      message: isTelugu ? "పొగ గుర్తించబడింది! ప్రమాదం ఉండవచ్చు. వెంటనే చెక్ చేయండి!" : "Smoke detected! Possible hazard. Check the field immediately!"
    });
  }

  return alerts;
};

const GlobalAlertHandler = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [lastAlertId, setLastAlertId] = useState(null);
  const [userLanguage, setUserLanguage] = useState('Telugu');

  const fetchSensorData = async () => {
    try {
      const res = await fetch("https://rythu-mitra-chea.onrender.com/api/sensor");
      const data = await res.json();

      const lang = await storage.getItemAsync('userLanguage') || 'Telugu';
      setUserLanguage(lang);

      const generatedAlerts = generateGlobalAlerts(data, lang);
      
      if (generatedAlerts.length > 0) {
        const latestAlert = generatedAlerts[0];

        if (latestAlert._id !== lastAlertId) {
          setLastAlertId(latestAlert._id);
          setCurrentAlert(latestAlert);
          setModalVisible(true);

          if (lang === 'Voice AI') {
            Speech.speak(latestAlert.message, {
              language: 'te-IN',
              pitch: 1.0,
              rate: 0.9,
            });
          }
        }
      } else {
        // Clear if no alerts
        setModalVisible(false);
      }

    } catch (err) {
      console.log("Global Polling Error:", err);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    fetchSensorData();
    
    // Check every 5 seconds globally
    const interval = setInterval(() => {
      fetchSensorData();
    }, 5000);

    return () => clearInterval(interval);
  }, [lastAlertId]);

  const speakAlert = (message) => {
    Speech.speak(message, {
      language: userLanguage === 'English' ? 'en-US' : 'te-IN',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  if (!modalVisible || !currentAlert) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="slide">
      <View className="flex-1 bg-black/70 justify-center items-center" style={{ zIndex: 9999 }}>
        <View className="bg-white w-[90%] rounded-3xl p-8 items-center">

          <Text className="text-5xl mb-2">🚨</Text>
          <Text className="text-3xl font-black text-red-600">
            {userLanguage === 'English' ? 'ALERT!' : 'అలర్ట్!'}
          </Text>

          <Text className="text-xl text-center mt-6 font-bold">
            {currentAlert?.message}
          </Text>

          {/* Voice Button */}
          <TouchableOpacity
            onPress={() => speakAlert(currentAlert?.message)}
            className="bg-green-600 w-full py-5 rounded-2xl mt-8 flex-row justify-center items-center"
          >
            <Volume2 size={24} color="white" />
            <Text className="text-white text-lg ml-2 font-bold">
              {userLanguage === 'English' ? '🔊 Listen' : '🔊 వినండి'}
            </Text>
          </TouchableOpacity>

          {/* Close */}
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              Speech.stop();
            }}
            className="mt-5 p-2"
          >
            <Text className="text-gray-500 font-bold">
              {userLanguage === 'English' ? 'Close' : 'మూసివేయి'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default GlobalAlertHandler;
