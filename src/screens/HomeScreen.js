import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  Clock,
  Cpu, Database,
  Gauge,
  Info,
  TrendingUp,
  Waves,
  Wind,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { dashboardService } from '../services/api';

const screenWidth = Dimensions.get("window").width;

const SensorBadge = ({ label, status }) => (
  <View className="flex-row items-center bg-slate-100 rounded-full px-3 py-1 mr-2 mb-2">
    <View className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'ok' ? 'bg-success' : 'bg-critical'}`} />
    <Text className="text-[10px] font-bold text-slate-600 uppercase">{label}</Text>
  </View>
);

const DataRow = ({ label, value, color }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
    <Text className="text-slate-500 text-xs font-medium">{label}</Text>
    <Text className={`font-bold text-sm ${color || 'text-secondary'}`}>{value}</Text>
  </View>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [history, setHistory] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getData();
      const { user, devices, latestTelemetry, telemetryHistory, recentAlerts } = response.data;

      setUserData(user);
      setDevices(devices);
      setLatestData(latestTelemetry);
      setHistory(telemetryHistory || []);
      setRecentAlerts(recentAlerts);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to sync field data. Check connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Poll the mock API to make the graph dynamic as requested
    const interval = setInterval(async () => {
      try {
        const res = await fetch("https://rythu-mitra-chea.onrender.com/api/sensor");
        const data = await res.json();
        
        setHistory(prev => {
          const newHistory = [...prev, { 
            timestamp: Date.now(), 
            soil_moisture: data.soil 
          }];
          if (newHistory.length > 6) newHistory.shift();
          return newHistory;
        });

        setLatestData(prev => ({
           ...prev,
           temperature: data.temperature,
           humidity: data.humidity,
           soil_moisture: data.soil,
           co2_ppm: data.gas,
           rain_intensity: data.rain
        }));
      } catch(e) {
        console.log("Polling error dashboard:", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-[10px]">Syncing Field Nodes...</Text>
      </View>
    );
  }

  const activeDevice = devices[0] || { deviceId: 'No Device', name: 'Please pair a node' };
  const data = latestData || {};

  const sensorHealth = data.sensor_status 
    ? Object.values(data.sensor_status).filter(s => s === 'ok').length * 20 
    : 0;


  const chartConfig = {
    backgroundGradientFrom: Colors.slate50,
    backgroundGradientTo: Colors.slate50,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${Colors.primaryRGB}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${Colors.slate500RGB}, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.primary }
  };


  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* Top System Metadata */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="bg-secondary p-2 rounded-xl mr-3">
                <Cpu size={18} color="white" />
              </View>
              <View>
                <Text className="text-secondary font-black text-lg" style={{ maxWidth: 170 }} ellipsizeMode="tail" numberOfLines={1}>
                  Hello, {userData?.fullName?.split(' ')[0] || 'Farmer'}
                </Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {devices.length > 0 ? `System Online • ${activeDevice.deviceId}` : 'No Nodes Connected'}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className={`font-black text-xl ${sensorHealth > 50 ? 'text-green-600' : 'text-red-500'}`}>{sensorHealth}%</Text>
              <Text className="text-slate-400 text-[9px] font-bold">NODE STABILITY</Text>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-100 p-4 rounded-3xl mb-6 flex-row items-center">
              <AlertCircle size={16} color="#ef4444" />
              <Text className="text-red-600 text-xs font-bold ml-2">{error}</Text>
            </View>
          )}

          {/* 1. MOISTURE TREND CHART */}
          <View className="bg-slate-50 rounded-[35px] p-5 mb-6 border border-slate-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-secondary font-black text-sm uppercase tracking-tighter">Moisture Trend (Last 6 Logs)</Text>
              <TrendingUp size={16} color="#22c55e" />
            </View>
            <LineChart
              data={{
                labels: history.length > 0 ? history.map(h => new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : ["..."],
                datasets: [{ data: history.length > 0 ? history.map(h => h.soil_moisture || 0) : [0] }]
              }}
              width={screenWidth - 70}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </View>

          {/* Growth Environment Index (REAL CALCULATION) */}
          <View className="bg-slate-50 rounded-[35px] p-6 mb-6 border border-slate-100">
            <Text className="text-secondary font-black text-sm mb-4 uppercase tracking-tighter">Biological Growth Index</Text>
            <View className="flex-row justify-between mb-6">
              <View className="items-center">
                <Gauge size={24} color="#6366f1" />
                <Text className="text-secondary font-black text-lg mt-1">
                  {(() => {
                    if (!data.temperature || !data.humidity) return "--";
                    const T = data.temperature;
                    const RH = data.humidity;
                    const es = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
                    const ea = es * (RH / 100);
                    return (es - ea).toFixed(2);
                  })()}
                </Text>
                <Text className="text-slate-400 text-[8px] font-bold uppercase">VPD (kPa)</Text>
              </View>
              <View className="items-center">
                <Waves size={24} color="#06b6d4" />
                <Text className="text-secondary font-black text-lg mt-1">
                  {data.humidity > 70 ? 'High' : data.humidity < 40 ? 'Low' : 'Optimal'}
                </Text>
                <Text className="text-slate-400 text-[8px] font-bold uppercase">Transpiration</Text>
              </View>
              <View className="items-center">
                <Zap size={24} color="#f59e0b" />
                <Text className="text-secondary font-black text-lg mt-1">
                  {data.light_condition === 'Bright' ? 'Peak' : 'Sub-opt'}
                </Text>
                <Text className="text-slate-400 text-[8px] font-bold uppercase">Photosyn.</Text>
              </View>
            </View>
            <LinearGradient colors={[Colors.slate200, Colors.slate300]} className="h-1.5 rounded-full w-full">
              <View
                style={{ width: `${sensorHealth}%` }}
                className="h-full rounded-full bg-success"
              />
            </LinearGradient>
            <Text className="text-slate-400 text-[10px] mt-2 font-bold text-center">
              {sensorHealth}% SYSTEM STABILITY & ACCURACY
            </Text>
          </View>

          {/* Technical Data Blocks */}
          <View className="flex-row justify-between mb-6">
            <View className="w-[48%] bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Wind size={16} color={Colors.slate500} />
                <Text className="ml-2 text-secondary font-black text-xs uppercase">Atmospheric</Text>
              </View>
              <DataRow label="Temp" value={data.temperature ? `${data.temperature}°C` : "--"} />
              <DataRow label="Humidity" value={data.humidity ? `${data.humidity}%` : "--"} />
              <DataRow label="CO2 Level" value={data.co2_ppm ? `${data.co2_ppm}ppm` : "--"} color="text-primary" />
              <DataRow label="Status" value={!data.co2_ppm ? "--" : (data.co2_ppm > 800 ? "WARNING" : "MODERATE")} color="text-warning" />
            </View>

            <View className="w-[48%] bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Database size={16} color={Colors.slate500} />
                <Text className="ml-2 text-secondary font-black text-xs uppercase">Substrate</Text>
              </View>
              <DataRow label="Moisture" value={data.soil_moisture ? `${data.soil_moisture}%` : "--"} color="text-primary" />
              <DataRow label="Light" value={data.light_condition || "--"} />
              <DataRow label="Rain" value={data.rain_intensity === undefined ? "--" : (data.rain_intensity > 10 ? "YES" : "NO")} />
              <DataRow label="Smoke" value={data.smoke_detected === undefined ? "--" : (data.smoke_detected ? "DETECTED" : "NONE")} color={data.smoke_detected ? "text-critical" : "text-success"} />
            </View>
          </View>

          {/* 2. CLIMATE DISTRIBUTION CHART */}
          <View className="bg-secondary rounded-[35px] p-5 mb-6 shadow-xl shadow-slate-400">
            <Text className="text-white font-black text-sm mb-4 uppercase tracking-tighter">Current Climate Snapshot</Text>
            <BarChart
              data={{
                labels: ["CO2/10", "Temp°C", "Humid%"],
                datasets: [{ data: [(data.co2_ppm || 0) / 10, data.temperature || 0, data.humidity || 0] }]
              }}
              width={screenWidth - 70}
              height={180}
              chartConfig={{
                ...chartConfig,
                backgroundGradientFrom: Colors.secondary,
                backgroundGradientTo: Colors.secondary,
                color: (opacity = 1) => `rgba(${Colors.successRGB}, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              style={{ borderRadius: 16 }}
            />
          </View>

          {/* NEW CONTENT: RESOURCE LOGS */}
          <View className="bg-slate-50 rounded-[30px] p-5 mb-6 border border-slate-100">
            <View className="flex-row items-center mb-4">
              <Clock size={16} color={Colors.slate500} />
              <Text className="ml-2 text-secondary font-black text-xs uppercase">Device Activity Log</Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-500 text-[10px]">LATEST UPDATE</Text>
                <Text className="text-slate-800 text-[11px] font-bold">
                  {latestData ? `Sensors active on ${activeDevice.name}` : 'Waiting for sensor input...'}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-500 text-[10px]">DEVICE STATUS</Text>
                <Text className={`text-[11px] font-bold ${data.temperature > 0 ? 'text-success' : 'text-slate-400'}`}>
                  {data.temperature > 0 ? 'Transmitting Data' : 'Node Disconnected'}
                </Text>
              </View>
            </View>
          </View>

          {/* Sensor Diagnostics Chipset */}
          <Text className="text-secondary text-lg font-black mt-4 mb-4">Hardware Diagnostics</Text>
          <View className="flex-row flex-wrap">
            <SensorBadge label="DHT11" status={data.sensor_status?.dht11} />
            <SensorBadge label="MQ135" status={data.sensor_status?.mq135} />
            <SensorBadge label="LDR" status={data.sensor_status?.ldr} />
            <SensorBadge label="Rain" status={data.sensor_status?.rain} />
            <SensorBadge label="Soil" status={data.sensor_status?.soil} />
          </View>

          {/* Predictive Action Card */}
          <TouchableOpacity className="mt-6 bg-primary rounded-3xl p-6 shadow-xl shadow-primary/20">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Recommendation</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  {data.soil_moisture < 40 ? 'Increase Irrigation' : 'Optimize Airflow'}
                </Text>
                <Text className="text-white/60 text-xs mt-1">
                  {data.soil_moisture < 40 ? 'Moisture is below 40% threshold.' : `VPD is normal (${data.temperature}°C). Field stable.`}
                </Text>
              </View>
              <View className="bg-white/20 p-3 rounded-2xl">
                <Info size={24} color="white" />
              </View>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Dashboard;
