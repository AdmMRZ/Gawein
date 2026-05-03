import * as React from 'react';
import { ScrollView, StyleSheet, View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Icon Asset ──────────────────────────────────────────────
const homePesanan = require('@/assets/images/home_pesanan.png');

// ── Dummy Data ──────────────────────────────────────────────
const upcomingOrders = [
  {
    id: 1,
    date: '20 Mei 2026, 12:00',
    clientName: 'Angeline Widjaja',
    service: 'Pembersihan Rumah',
    location: 'Jl. Rasuna 46 Jakarta',
    price: 'Rp215.000',
  },
  {
    id: 2,
    date: '27 Mei 2026, 10:00',
    clientName: 'Serafina Hadinata',
    service: 'Pembersihan Rumah',
    location: 'Jl. Soekarno 54 Jakarta',
    price: 'Rp155.000',
  },
];

const completedOrders = [
  {
    id: 3,
    clientName: 'Patrice Wongso',
    service: 'Pembersihan Rumah',
    dateTime: '22 Juni 2025, 10:00',
    price: 'Rp250.000',
    paymentLabel: 'Gaji belum dibayarkan',
    paymentBg: '#F5F5F5',
  },
  {
    id: 4,
    clientName: 'Patrice Wongso',
    service: 'Pembersihan Rumah',
    dateTime: '14 Juni 2025, 09:08',
    price: 'Rp250.000',
    paymentLabel: 'Gaji telah dibayarkan',
    paymentBg: '#FFF2CC',
  },
];

export default function PesananScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + 12, paddingBottom: 120 },
      ]}
    >
      {/* ── Page Title ───────────────────────────────── */}
      <Text style={styles.pageTitle}>Pesanan</Text>

      {/* ── Upcoming Badge ───────────────────────────── */}
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Upcoming</Text>
      </View>

      {/* ── Upcoming Cards ───────────────────────────── */}
      {upcomingOrders.map((order) => (
        <View key={order.id} style={styles.upcomingCard}>
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              {/* Date */}
              <Text style={styles.dateText}>{order.date}</Text>

              {/* Icon + Info */}
              <View style={styles.detailRow}>
                <Image source={homePesanan} style={styles.houseIcon} />
                <View style={styles.infoBlock}>
                  <Text style={styles.clientName}>{order.clientName}</Text>
                  <Text style={styles.detailText}>{order.service}</Text>
                  <Text style={styles.detailText}>{order.location}</Text>
                </View>
              </View>
            </View>

            {/* Price */}
            <Text style={styles.priceText}>{order.price}</Text>
          </View>
        </View>
      ))}

      {/* ── Completed Badge ──────────────────────────── */}
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Completed</Text>
      </View>

      {/* ── Completed Cards ──────────────────────────── */}
      {completedOrders.map((order) => (
        <View key={order.id} style={styles.completedCard}>
          <View style={styles.cardRow}>
            <View style={styles.detailRow}>
              <Image source={homePesanan} style={styles.houseIcon} />
              <View style={styles.infoBlock}>
                <Text style={styles.clientName}>{order.clientName}</Text>
                <Text style={styles.detailText}>{order.service}</Text>
                <Text style={styles.detailText}>{order.dateTime}</Text>
              </View>
            </View>
            <Text style={styles.priceText}>{order.price}</Text>
          </View>

          {/* Payment Status Badge */}
          <View style={styles.paymentRow}>
            <View
              style={[
                styles.paymentBadge,
                { backgroundColor: order.paymentBg },
              ]}
            >
              <Text style={styles.paymentBadgeText}>{order.paymentLabel}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Design Tokens (from Figma reference) ────────────────────
const C = {
  black: '#1B1B1B',
  white: '#FFFFFF',
  accent: '#FFD45A',        // foundationAccentNormal (yellow badge)
  cardBg: '#F0F4FF',        // foundationSecondaryLightHover (upcoming card)
  border: '#B0C4DE',        // colorLightsteelblue (completed card border)
  whitesmoke: '#F5F5F5',    // default payment badge
  pageBg: '#FFFFFF',        // foundationNeutralWhiteNormal
};

const styles = StyleSheet.create({
  // ── Screen ────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: C.pageBg,
  },
  scrollContent: {
    paddingHorizontal: 28,
    gap: 12,
  },

  // ── Title ─────────────────────────────────────────
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.black,
    textAlign: 'center',
    marginBottom: 4,
  },

  // ── Section Badge ─────────────────────────────────
  sectionBadge: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: C.black,
  },

  // ── Upcoming Card ─────────────────────────────────
  upcomingCard: {
    backgroundColor: C.cardBg,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  cardLeft: {
    flex: 1,
    gap: 8,
  },

  // ── Date ──────────────────────────────────────────
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.black,
  },

  // ── Detail Row (icon + info) ──────────────────────
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  houseIcon: {
    width: 48,
    height: 48,
  },
  infoBlock: {
    flex: 1,
    gap: 3,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.black,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '400',
    color: C.black,
  },

  // ── Price ─────────────────────────────────────────
  priceText: {
    fontSize: 12,
    fontWeight: '400',
    color: C.black,
    textAlign: 'right',
  },

  // ── Completed Card ────────────────────────────────
  completedCard: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.border,
    paddingHorizontal: 21,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: 'hidden',
    gap: 8,
  },

  // ── Payment Status ────────────────────────────────
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  paymentBadge: {
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '400',
    color: C.black,
    textAlign: 'center',
  },
});
