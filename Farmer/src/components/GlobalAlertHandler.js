import * as Speech from 'expo-speech';
import { Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { storage } from '../utils/storage';

export const generateGlobalAlerts = (data, language) => {
  let alerts = [];

  const isTelugu = language === 'Telugu' || language === 'Voice AI';

  // Include data (temperature, humidity, soil moisture)
  const sensorInfoEn = `Temperature: ${data.temperature}°C, Humidity: ${data.humidity}%, Soil: ${data.soil}%`;
  const sensorInfoTe = `ఉష్ణోగ్రత: ${data.temperature}°C, తేమ: ${data.humidity}%, నేల తేమ: ${data.soil}%`;

  // 🌱 Soil Moisture
  if (data.soil < 40) {
    alerts.push({
      _id: "soil",
      title: isTelugu ? "🚨 హెచ్చరిక!" : "🚨 Alert!",
      message: isTelugu 
        ? `నేల తేమ తగ్గింది. నీరు ఇవ్వండి.\n\n${sensorInfoTe}` 
        : `Soil moisture is low. Please irrigate your field.\n\n${sensorInfoEn}`,
      speakMessage: isTelugu
        ? `హెచ్చరిక! నేల తేమ తగ్గింది. దయచేసి నీరు ఇవ్వండి.`
        : `Alert! Soil moisture is low. Please irrigate your field.`
    });
  }

  // 🌡 Temperature
  else if (data.temperature > 35) {
    alerts.push({
      _id: "temp",
      title: isTelugu ? "🚨 హెచ్చరిక (అధిక ఉష్ణోగ్రత)!" : "🚨 Alert (High Temp)!",
      message: isTelugu 
        ? `ఉష్ణోగ్రత ఎక్కువగా ఉంది. పంట కాపాడండి.\n\n${sensorInfoTe}`
        : `High temperature detected. Please protect the crops.\n\n${sensorInfoEn}`,
      speakMessage: isTelugu
        ? `ఉష్ణోగ్రత ఎక్కువగా ఉంది. పంట కాపాడండి.`
        : `High temperature detected. Please protect the crops.`
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
            Speech.speak(latestAlert.speakMessage, {
              language: lang === 'English' ? 'en-US' : 'te-IN',
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

  const speakAlert = (alertItem) => {
    Speech.speak(alertItem.speakMessage, {
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

          <Text className="text-xl text-center mt-6 font-bold text-gray-800">
            {currentAlert?.message}
          </Text>

          {/* Voice Button */}
          <TouchableOpacity
            onPress={() => speakAlert(currentAlert)}
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
