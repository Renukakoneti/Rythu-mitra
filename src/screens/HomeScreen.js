import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  Clock,
  Cpu,
  Database,
  Gauge,
  Info,
  TrendingUp,
  Waves,
  Wind,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { dashboardService } from '../services/api';

const screenWidth = Dimensions.get("window").width;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ FETCH DASHBOARD DATA
  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getData();

      const {
        user,
        devices,
        latestTelemetry,
        telemetryHistory
      } = response.data;

      setUserData(user);
      setDevices(devices);
      setLatestData(latestTelemetry);
      setHistory(telemetryHistory || []);

      setError(null);
    } catch (err) {
      console.log("❌ DASHBOARD ERROR:", err.response?.data || err.message);
      setError("Unable to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ FIXED POLLING (IMPORTANT CHANGE)
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(async () => {
      try {
        const response = await dashboardService.getData();
        const { latestTelemetry, telemetryHistory } = response.data;

        if (latestTelemetry) {
          setLatestData(latestTelemetry);
        }

        if (telemetryHistory) {
          setHistory(telemetryHistory);
        }

      } catch (e) {
        console.log("❌ Polling error dashboard:", e.response?.data || e.message);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const data = latestData || {};

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* USER */}
          <Text className="text-xl font-bold m-4">
            Hello {userData?.fullName || "Farmer"}
          </Text>

          {/* ERROR */}
          {error && (
            <Text className="text-red-500 text-center">{error}</Text>
          )}

          {/* LIVE DATA */}
          <View className="p-4">
            <Text>🌡 Temp: {data.temperature ?? "--"}°C</Text>
            <Text>💧 Humidity: {data.humidity ?? "--"}%</Text>
            <Text>🌱 Soil: {data.soil_moisture ?? "--"}%</Text>
            <Text>☁ Gas: {data.co2_ppm ?? "--"}</Text>
          </View>

          {/* CHART */}
          <LineChart
            data={{
              labels: history.map(h => "•"),
              datasets: [{
                data: history.map(h => h.soil_moisture || 0)
              }]
            }}
            width={screenWidth}
            height={200}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#22c55e"
            }}
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Dashboard;