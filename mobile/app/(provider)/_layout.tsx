import { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Tabs } from 'expo-router';

const icons = {
  home: require('@/assets/images/home alt 1.png'),
  chat: require('@/assets/images/chat alt 11.png'),
  order: require('@/assets/images/order alt 11.png'),
  user: require('@/assets/images/user alt 11.png'),
};

const BLUE = '#315BE8';

const tabMeta: Record<string, { label: string; icon: any }> = {
  index:   { label: 'Beranda', icon: icons.home },
  chat:    { label: 'Chat',    icon: icons.chat },
  pesanan: { label: 'Pesanan', icon: icons.order },
  profile: { label: 'Akun',   icon: icons.user },
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
          const meta = tabMeta[route.name];
          if (!meta) return null;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item}>
              <View style={[styles.iconWrap, isFocused && styles.activeIconWrap]}>
                <Image
                  source={meta.icon}
                  style={[styles.tabIcon, isFocused && styles.activeTabIcon]}
                />
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
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="pesanan" options={{ title: 'Pesanan' }} />
      <Tabs.Screen name="profile" options={{ title: 'Akun' }} />
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
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
    maxWidth: 430,
    height: 78,
    backgroundColor: BLUE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 12,
  },
  item: {
    width: 86,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  activeIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
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
  tabIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  activeTabIcon: {
    width: 32,
    height: 32,
  },
  label: {
    color: '#E8EEFF',
    fontSize: 11,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
