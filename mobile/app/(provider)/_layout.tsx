import { Tabs } from 'expo-router';
import { View, Pressable, Platform, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

function CircularTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8 }]}>
      <View style={styles.circularNav}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon Mapping
          let iconName = 'grid-outline';
          if (route.name === 'index') iconName = isFocused ? 'grid' : 'grid-outline';
          else if (route.name === 'services') iconName = isFocused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'schedule') iconName = isFocused ? 'calendar' : 'calendar-outline'; 
          else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

          const isPrimary = isFocused;
          
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabButton,
                isPrimary ? styles.primaryActive : pressed ? styles.ghostPressed : styles.ghostInactive,
                { transform: [{ scale: pressed ? 0.94 : 1 }] }
              ]}
            >
              <Ionicons 
                name={iconName as any} 
                size={22} 
                color={isPrimary ? '#F8FAFC' : Colors.textMuted} 
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProviderLayout() {
  return (
    <Tabs
      tabBar={(props) => <CircularTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="services" options={{ title: 'Layanan' }} />
      <Tabs.Screen name="schedule" options={{ title: 'Jadwal' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: Colors.white, // In dark theme this is Surface Dark (#1E293B)
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  circularNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  tabButton: {
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActive: {
    backgroundColor: Colors.navy,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ghostInactive: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  }
});
