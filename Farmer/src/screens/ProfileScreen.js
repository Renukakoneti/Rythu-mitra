import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Key, Cpu, Database,
  ChevronRight, Save, X, LogOut,
  Settings2, Activity, RefreshCw
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { profileService, deviceService, authService } from '../services/api';

import { Colors } from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPassModal, setIsPassModal] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadProfileData = async () => {
    try {
      const response = await profileService.getProfile();
      const profile = response.data;
      setUserData(profile);
      setName(profile.fullName);

      const devicesRes = await deviceService.getDevices();
      setDevices(devicesRes.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const handleUpdate = async () => {
    try {
      const response = await profileService.updateProfile({ fullName: name });
      const updatedUser = response.data;
      setUserData(updatedUser);
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      setIsEditing(false);
      alert('Profile updated!');
    } catch (error) {
      alert('Update failed');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) {
      return alert("Please fill all fields");
    }

    try {
      setIsUpdatingPass(true);
      await authService.updatePassword({ oldPassword, newPassword });
      alert("Password updated successfully!");
      setIsPassModal(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      alert(error.response?.data?.message || "Password update failed");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    navigation.replace('Login');
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <ScrollView 
          contentContainerStyle={{ padding: 24, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* 1. SYSTEM HEALTH (The "Work" Summary) */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Overview</Text>
              <Text className="text-secondary text-3xl font-black">Fleet Status</Text>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-[10px] font-bold uppercase">Online</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-10">
            <View className="w-[48%] border-l-4 border-primary pl-4 py-1">
              <Text className="text-secondary text-2xl font-black">
                {String(devices.length).padStart(2, '0')}
              </Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Active Nodes</Text>
            </View>
            <View className="w-[48%] border-l-4 border-slate-200 pl-4 py-1">
              <Text className="text-secondary text-2xl font-black">
                {userData?.stats?.totalLogs > 999 
                  ? (userData.stats.totalLogs / 1000).toFixed(1) + 'k' 
                  : userData?.stats?.totalLogs || '0'}
              </Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Total Logs</Text>
            </View>
          </View>

          {/* 2. EDITABLE IDENTITY SECTION */}
          <View className="mb-10">
            <Text className="text-secondary text-sm font-bold mb-4">Account Settings</Text>

            {/* Edit Name Row */}
            <View className="flex-row items-center justify-between border-b border-slate-100 py-4">
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Full Name</Text>
                {isEditing ? (
                  <TextInput
                    className="text-secondary text-lg font-bold mt-1 p-0"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                ) : (
                  <Text className="text-secondary text-lg font-bold mt-1">
                    {userData?.fullName || 'Farmer'}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={isEditing ? handleUpdate : () => setIsEditing(true)}>
                {isEditing ? (
                  <Save size={20} color={Colors.primary} />
                ) : (
                  <Settings2 size={20} color={Colors.slate400} />
                )}
              </TouchableOpacity>
            </View>

            {/* Change Password Row */}
            <TouchableOpacity
              onPress={() => setIsPassModal(true)}
              className="flex-row items-center justify-between border-b border-slate-100 py-4"
            >
              <View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Security</Text>
                <Text className="text-secondary text-lg font-bold mt-1">Change Password</Text>
              </View>
              <ChevronRight size={20} color={Colors.slate400} />
            </TouchableOpacity>
          </View>

          {/* 3. DEVICE HISTORY LIST (Real Data) */}
          <Text className="text-secondary text-sm font-bold mb-4">Linked Devices</Text>
          <View className="space-y-4">
            {devices.length === 0 && !isLoading && (
              <Text className="text-slate-400 text-xs text-center py-4">No devices linked yet.</Text>
            )}
            {devices.map((device, i) => (
              <View key={i} className="flex-row items-center bg-slate-50 p-4 rounded-2xl mb-3">
                <View className="bg-white p-2 rounded-xl">
                  <Cpu size={18} color={Colors.slate500} />
                </View>
                <View className="ml-4">
                  <Text className="text-secondary font-bold text-sm">{device.name}</Text>
                  <Text className="text-slate-400 text-[10px]">{device.deviceId} • Online</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 4. LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-12 flex-row items-center justify-center border border-red-100 p-4 rounded-2xl"
          >
            <LogOut size={18} color={Colors.critical} />
            <Text className="text-red-500 font-bold ml-2">Log Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* MINIMALIST PASSWORD MODAL */}
      <Modal visible={isPassModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-secondary/80 px-6">
          <View className="bg-white w-full rounded-[30px] p-8">
            <View className="flex-row justify-between mb-6">
              <Text className="text-secondary text-xl font-black">Update Password</Text>
              <TouchableOpacity onPress={() => setIsPassModal(false)}>
                <X size={20} color={Colors.slate400} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Current Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              className="bg-slate-50 p-4 rounded-xl mb-4"
            />
            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              className="bg-slate-50 p-4 rounded-xl mb-6"
            />

            <TouchableOpacity
              className="bg-primary p-4 rounded-xl items-center"
              onPress={handlePasswordUpdate}
              disabled={isUpdatingPass}
            >
              {isUpdatingPass ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Save New Credentials</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
