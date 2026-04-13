import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ArrowRight, Wifi, Zap, RefreshCw, Cpu, Droplets } from 'lucide-react-native';
import { deviceService } from '../services/api';
import { Colors } from '../constants/Colors';

const DevicesScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDevices = async () => {
    try {
      const response = await deviceService.getDevices();
      setDevices(response.data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">

        {/* PREMIUM HEADER */}
        <View className="px-8 pt-10 pb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-primary text-[10px] font-black uppercase tracking-[4px] mb-1">Intelligence</Text>
              <Text className="text-secondary text-4xl font-black tracking-tight">Fleet</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => navigation.navigate('AddDevice')}
                className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-sm mr-2"
              >
                <Plus size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onRefresh}
                className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm border border-slate-100"
              >
                {refreshing ? <ActivityIndicator size="small" color={Colors.primary} /> : <RefreshCw size={20} color={Colors.slate500} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* STATS STRIP */}
        <View className="px-8 flex-row justify-between mb-8">
          <View className="bg-primaryLight border border-primary rounded-3xl px-6 py-4 items-center">
            <Text className="text-primary font-black text-lg">{devices.length}</Text>
            <Text className="text-primary text-[8px] font-black uppercase">Nodes</Text>
          </View>
          <View className="bg-emerald-50 border border-emerald-100 rounded-3xl px-6 py-4 items-center">
            <Text className="text-primary font-black text-lg">Active</Text>
            <Text className="text-emerald-400 text-[8px] font-black uppercase">System</Text>
          </View>
          <View className="bg-amber-50 border border-amber-100 rounded-3xl px-6 py-4 items-center">
            <Text className="text-amber-600 font-black text-lg">98%</Text>
            <Text className="text-amber-400 text-[8px] font-black uppercase">Uptime</Text>
          </View>
        </View>

        {/* SOFT FLOATING LIST */}
        <FlatList
          data={devices}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center mt-20">
              {isLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">No devices connected</Text>
              )}
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              className="mb-5 bg-white rounded-[35px] p-6 shadow-xl shadow-slate-200/50 border border-white"
              onPress={() => navigation.navigate('DeviceDetails', { deviceId: item.deviceId, deviceName: item.name })}
            >
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-3xl items-center justify-center bg-emerald-50">
                  <Cpu size={24} color={Colors.success} />
                </View>

                <View className="flex-1 ml-4">
                  <Text className="text-secondary text-lg font-bold tracking-tight">{item.name}</Text>
                  <View className="flex-row mt-1 items-center">
                    <Wifi size={12} color={Colors.slate400} />
                    <Text className="text-slate-400 text-xs font-semibold ml-1 mr-4">{item.deviceId}</Text>
                    <Zap size={12} color={Colors.slate400} />
                    <Text className="text-slate-400 text-xs font-semibold ml-1">Online</Text>
                  </View>
                </View>

                <View className="bg-slate-50 p-3 rounded-2xl">
                  <ArrowRight size={18} color={Colors.slate300} strokeWidth={3} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
};

export default DevicesScreen;
