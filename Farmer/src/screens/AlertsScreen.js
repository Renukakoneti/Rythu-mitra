import {
  Bell,
  ChevronRight,
  Trash2,
  X
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { alertService } from '../services/api';

const UI_COLORS = {
  critical: Colors.critical,
  warning: Colors.warning,
  info: Colors.info,
  background: Colors.white,
};

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  const fetchAlerts = async () => {
    try {
      const response = await alertService.getAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const markAllRead = () => {
    Alert.alert("Clear All", "Remove all notifications from your account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: 'destructive', onPress: async () => {
        try {
          await alertService.clearAll();
          setAlerts([]);
        } catch (e) {
          alert("Failed to clear alerts");
        }
      }}
    ]);
  };

  const resolveAlert = async (id) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
      setModalVisible(false);
    } catch (e) {
      alert("Failed to dismiss alert");
    }
  };

  const renderAlert = ({ item }) => {
    const color = UI_COLORS[item.type] || UI_COLORS.info;

    return (
      <View className="flex-row items-center border-b border-slate-100 py-6 px-6">
        {/* Vertical Status Accent */}
        <View style={{ backgroundColor: color }} className="w-1 h-10 rounded-full" />

        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-secondary text-sm font-black uppercase tracking-tight">
              {item.title}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text className="text-slate-500 text-xs mt-1 leading-4">{item.message}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setActiveAlert(item);
            setModalVisible(true);
          }}
          className="ml-4 bg-slate-50 p-3 rounded-2xl"
        >
          <ChevronRight size={18} color={Colors.slate400} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">

        {/* Header Summary */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Updates</Text>
              <Text className="text-secondary text-3xl font-black">Notifications</Text>
            </View>
            <TouchableOpacity onPress={markAllRead} className="bg-secondary p-3 rounded-2xl shadow-sm">
              <Trash2 size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Inline Summary Stats */}
          <View className="flex-row space-x-4">
            <View className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              <Text className="text-red-600 text-[10px] font-black uppercase">Critical: {alerts.filter(a => a.severity === 'critical').length}</Text>
            </View>
            <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Text className="text-slate-500 text-[10px] font-black uppercase">Active: {alerts.length}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center mt-20">
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Bell size={40} color={Colors.border} strokeWidth={1.5} />
                  <Text className="text-slate-400 font-bold mt-4 text-xs uppercase tracking-widest">Inbox is empty</Text>
                </>
              )}
            </View>
          )}
        />

        {/* Action Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-secondary/60">
            <View className="bg-white rounded-t-[40px] p-8">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-secondary text-xl font-black uppercase tracking-tighter">Issue Resolution</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={Colors.slate400} />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-500 mb-8">Execute remote command for <Text className="font-bold text-secondary">{activeAlert?.title}</Text>?</Text>

              <View className="flex-row justify-between mb-4">
                <TouchableOpacity
                  onPress={() => resolveAlert(activeAlert._id)}
                  className="flex-1 bg-primary p-5 rounded-2xl items-center mr-2"
                >
                  <Text className="text-white font-bold uppercase text-xs tracking-widest">Confirm Action</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => resolveAlert(activeAlert._id)}
                  className="flex-1 bg-slate-100 p-5 rounded-2xl items-center ml-2"
                >
                  <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest">Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default AlertsScreen;
