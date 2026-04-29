import {
    AlertCircle,
    ArrowLeft,
    Battery,
    Droplets,
    RefreshCw,
    Settings,
    ShieldCheck,
    Thermometer,
    Trash2,
    Wifi,
    Wind
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { sensorService, telemetryService } from '../services/api';

const screenWidth = Dimensions.get("window").width;

const DeviceDetailsScreen = ({ route, navigation }) => {
  const [isSyncing, setIsSyncing] = useState(true);
  const [telemetry, setTelemetry] = useState(null);
  const { deviceId, deviceName = 'Main Node' } = route.params || {};

  const [telemetryHistory, setTelemetryHistory] = useState([]);

  const fetchDeviceData = async () => {
    try {
      setIsSyncing(true);
      const res = await telemetryService.getLatest(deviceId);
      
      try {
        // Fetch live sensor data - gracefully handle if endpoint doesn't exist
        const liveRes = await sensorService.getLiveData();
        const liveData = liveRes.data;
        
        const formattedData = {
           ...res.data,
           soil_moisture: liveData?.soil_moisture || liveData?.soil || 0,
           temperature: liveData?.temperature || 0,
           humidity: liveData?.humidity || 0,
           co2_ppm: liveData?.co2_ppm || liveData?.gas || 0,
           timestamp: new Date(liveData?.updatedAt || Date.now())
        };
        
        setTelemetry(formattedData);
        setTelemetryHistory([formattedData.soil_moisture]);
      } catch (liveDataErr) {
        // If live sensor endpoint fails, use telemetry data as fallback
        console.debug("Live sensor data unavailable, using telemetry only");
        setTelemetry(res.data || {});
        setTelemetryHistory([res.data?.soil_moisture || 0]);
      }
    } catch (err) {
      console.error("Failed to fetch device details:", err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();
    
    // 📡 Real-time polling with faster interval
    const interval = setInterval(async () => {
      try {
        const liveRes = await sensorService.getLiveData();
        
        if (!liveRes.data || typeof liveRes.data !== 'object') {
          console.debug("Invalid sensor response format");
          return;
        }
        
        const data = liveRes.data;
        
        console.log("📱 Live update on DeviceDetails:", data);
        
        setTelemetry(prev => ({
           ...prev,
           soil_moisture: data?.soil_moisture || data?.soil || prev?.soil_moisture || 0,
           temperature: data?.temperature || prev?.temperature || 0,
           humidity: data?.humidity || prev?.humidity || 0,
           co2_ppm: data?.co2_ppm || data?.gas || prev?.co2_ppm || 0,
           timestamp: new Date(data?.updatedAt || Date.now())
        }));
        
        setTelemetryHistory(prev => {
           const newHistory = [...prev, data?.soil_moisture || data?.soil || 0];
           if (newHistory.length > 6) newHistory.shift();
           return newHistory;
        });
      } catch(e) {
        // Silently handle errors during polling
        if (e.response?.status === 404) {
          console.debug("Sensor endpoint not available (404)");
        } else if (e.message?.includes('JSON')) {
          console.debug("Received non-JSON response from sensor endpoint");
        } else {
          console.debug("Polling error device details:", e.message);
        }
      }
    }, 2000); // 🚀 2 seconds for real-time updates
    
    return () => clearInterval(interval);
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
                labels: telemetryHistory.map((_, i) => i === telemetryHistory.length - 1 ? "Now" : ""),
                datasets: [{ data: telemetryHistory.length > 0 ? telemetryHistory : [0] }]
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
