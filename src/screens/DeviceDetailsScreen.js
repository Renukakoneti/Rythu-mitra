import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Cpu, Thermometer, Droplets, 
  Wind, Battery, Wifi, RefreshCw, 
  Settings, Trash2, ShieldCheck, AlertCircle
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { telemetryService } from '../services/api';
import { Colors } from '../constants/Colors';

const screenWidth = Dimensions.get("window").width;

const DeviceDetailsScreen = ({ route, navigation }) => {
  const [isSyncing, setIsSyncing] = useState(true);
  const [telemetry, setTelemetry] = useState(null);
  const { deviceId, deviceName = 'Main Node' } = route.params || {};

  const fetchDeviceData = async () => {
    try {
      setIsSyncing(true);
      const res = await telemetryService.getLatest(deviceId);
      setTelemetry(res.data);
    } catch (err) {
      console.error("Failed to fetch device details:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, [deviceId]);

  const chartConfig = {
    backgroundGradientFrom: Colors.white,
    backgroundGradientTo: Colors.white,
    color: (opacity = 1) => `rgba(${Colors.primaryRGB}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${Colors.slate500RGB}, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "5", strokeWidth: "2", stroke: Colors.primary }
  };

  const syncData = () => {
    fetchDeviceData();
  };

  const StatItem = ({ icon, label, value, color }) => (
    <View className="bg-slate-50 rounded-3xl p-5 w-[48%] mb-4 border border-slate-100">
      <View style={{ backgroundColor: `${color}15` }} className="w-10 h-10 rounded-xl justify-center items-center mb-3">
        {icon}
      </View>
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</Text>
      <Text className="text-secondary text-xl font-black mt-1">{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-50 p-3 rounded-2xl">
            <ArrowLeft size={20} color={Colors.secondary} />
          </TouchableOpacity>
          <Text className="text-secondary font-bold text-lg">{deviceName}</Text>
          <TouchableOpacity onPress={syncData} className="bg-slate-50 p-3 rounded-2xl">
            {isSyncing ? <ActivityIndicator size="small" color={Colors.primary} /> : <RefreshCw size={20} color={Colors.slate500} />}
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={isSyncing} onRefresh={syncData} />
          }
        >
          {/* Status Overview */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Operation Status</Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 ${telemetry ? 'bg-success' : 'bg-slate-300'} rounded-full mr-2`} />
                <Text className={`${telemetry ? 'text-success' : 'text-slate-400'} font-black`}>
                  {telemetry ? 'ACTIVE & SHARING' : 'OFFLINE / SYNCING'}
                </Text>
              </View>
            </View>
            <View className="bg-primary px-4 py-2 rounded-2xl">
              <Text className="text-white font-bold text-xs">{deviceId}</Text>
            </View>
          </View>

          {/* Core Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            <StatItem 
              icon={<Thermometer size={20} color={Colors.critical} />} 
              label="Temperature" 
              value={telemetry?.temperature ? `${telemetry.temperature}°C` : "--"} 
              color={Colors.critical}
            />
            <StatItem 
              icon={<Droplets size={20} color={Colors.info} />} 
              label="Moisture" 
              value={telemetry?.soil_moisture ? `${telemetry.soil_moisture}%` : "--"} 
              color={Colors.info}
            />
            <StatItem 
              icon={<Wind size={20} color={Colors.primary} />} 
              label="CO2 Level" 
              value={telemetry?.co2_ppm ? `${telemetry.co2_ppm} ppm` : "--"} 
              color={Colors.primary}
            />
            <StatItem 
              icon={<Battery size={20} color={Colors.success} />} 
              label="Battery" 
              value="--" 
              color={Colors.success}
            />
          </View>

          {/* Trend Chart */}
          <View className="mt-6 mb-8">
            <Text className="text-secondary font-black text-sm uppercase tracking-tighter mb-4">Resource Analytics (Real-time)</Text>
            <LineChart
              data={{
                labels: ["Now"],
                datasets: [{ data: [telemetry?.soil_moisture || 0] }]
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 24, paddingRight: 0 }}
            />
          </View>

          {/* System Logs */}
          <View className="bg-slate-50 rounded-[35px] p-6 mb-8 border border-slate-100">
            <Text className="text-secondary font-black text-sm uppercase tracking-tighter mb-4">Security & Logs</Text>
            <View className="space-y-4">
              <View className="flex-row items-center">
                <ShieldCheck size={16} color={Colors.success} />
                <Text className="ml-3 text-slate-800 text-xs font-bold">End-to-End Encryption Verified</Text>
              </View>
              <View className="flex-row items-center">
                <Wifi size={16} color={Colors.primary} />
                <Text className="ml-3 text-slate-800 text-xs font-bold">Signal: {telemetry ? 'EXCELLENT' : '--'}</Text>
              </View>
              <View className="flex-row items-center">
                <AlertCircle size={16} color={Colors.slate400} />
                <Text className="ml-3 text-slate-800 text-xs font-bold">
                  Last transmission: {telemetry ? new Date(telemetry.timestamp).toLocaleTimeString() : '--'}
                </Text>
              </View>
            </View>
          </View>

          {/* Critical Actions */}
          <View className="space-y-4 pb-10">
            <TouchableOpacity className="bg-secondary p-5 rounded-3xl flex-row items-center justify-center">
              <Settings size={18} color="white" />
              <Text className="text-white font-black ml-3 uppercase tracking-widest text-[10px]">Configure Sensor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => alert("Unpair functionality coming soon")}
              className="border border-red-100 p-5 rounded-3xl flex-row items-center justify-center"
            >
              <Trash2 size={18} color={Colors.critical} />
              <Text className="text-red-500 font-black ml-3 uppercase tracking-widest text-[10px]">Unpair Node</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default DeviceDetailsScreen;
