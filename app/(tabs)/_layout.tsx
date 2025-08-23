import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="cards"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="credit-card" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "Share",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="share-variant" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="qrcode" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}