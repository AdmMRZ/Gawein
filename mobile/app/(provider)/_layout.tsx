import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#315BE8';

const tabMeta: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }> = {
  index: { label: 'Beranda', icon: 'grid-outline', activeIcon: 'grid' },
  services: { label: 'Layanan', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  messages: { label: 'Chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
  schedule: { label: 'Jadwal', icon: 'calendar-outline', activeIcon: 'calendar' },
  profile: { label: 'Profil', icon: 'person-outline', activeIcon: 'person' },
};

function ProviderTabBar({ state, navigation }: any) {
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
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const meta = tabMeta[route.name] || { label: route.name, icon: 'help-circle-outline', activeIcon: 'help-circle' };
          
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };


          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item}>
              <View style={[styles.iconWrap, isFocused && styles.activeIconWrap]}>
                <Ionicons name={isFocused ? meta.activeIcon : meta.icon} size={isFocused ? 32 : 26} color="#FFFFFF" />
              </View>
              <Text style={[styles.label, isFocused && styles.activeLabel]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProviderLayout() {
  return (
    <Tabs tabBar={(props) => <ProviderTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: BLUE,
  },
  bar: {
    width: '100%',
    height: 78,
    backgroundColor: BLUE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  activeIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -34,
    marginBottom: 1,
    backgroundColor: BLUE,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 9,
  },
  label: {
    color: '#E8EEFF',
    fontSize: 10,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
