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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ── Tab Icon Assets ─────────────────────────────────────────
const icons = {
  home: require('@/assets/images/home alt 1.png'),
  chat: require('@/assets/images/chat alt 11.png'),
  order: require('@/assets/images/order alt 11.png'),
  user: require('@/assets/images/user alt 11.png'),
};

const NAVY = '#315BE8';
const NAVY_DARK = '#252D4F';

const tabMeta: Record<string, { label: string; icon: any; raised?: boolean }> = {
  index:   { label: 'Beranda',  icon: icons.home },
  chat:    { label: 'Chat',     icon: icons.chat },
  pesanan: { label: 'Pesanan',  icon: icons.order, raised: true },
  profile: { label: 'Akun',     icon: icons.user },
};

function ProviderTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 16;

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPadding }]}>
      {/* Navy background bar */}
      <View style={styles.navBg} />

      {/* Tab items */}
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const meta = tabMeta[route.name];
          if (!meta) return null;

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

          // ── Raised "Pesanan" button ────────────────
          if (meta.raised) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.raisedItem,
                  { transform: [{ scale: pressed ? 0.93 : 1 }] },
                ]}
              >
                <View style={styles.raisedCircleOuter}>
                  <LinearGradient
                    colors={[NAVY_DARK, NAVY]}
                    style={styles.raisedCircle}
                  >
                    <Image
                      source={meta.icon}
                      style={styles.raisedIcon}
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={[
                    styles.label,
                    isFocused ? styles.labelActive : styles.labelInactive,
                  ]}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          }

          // ── Normal tab ────────────────────────────
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                { transform: [{ scale: pressed ? 0.93 : 1 }] },
              ]}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Image source={meta.icon} style={styles.tabIcon} />
              </View>
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {meta.label}
              </Text>
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
      tabBar={(props) => <ProviderTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="pesanan" options={{ title: 'Pesanan' }} />
      <Tabs.Screen name="profile" options={{ title: 'Akun' }} />
      {/* Hide unused screens from tab bar */}
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // ── Container ─────────────────────────────────────
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },

  // ── Navy Background ───────────────────────────────
  navBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 87,
    backgroundColor: NAVY,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },

  // ── Tab Row ───────────────────────────────────────
  bar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 12,
    height: 110,
  },

  // ── Normal Tab ────────────────────────────────────
  item: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    width: 59,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: NAVY,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    marginBottom: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 9,
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },

  // ── Labels ────────────────────────────────────────
  label: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  labelInactive: {
    color: '#E8EEFF',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },

  // ── Raised "Pesanan" ──────────────────────────────
  raisedItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    width: 59,
  },
  raisedCircleOuter: {
    width: 59,
    height: 59,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  raisedCircle: {
    width: 59,
    height: 59,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
});
