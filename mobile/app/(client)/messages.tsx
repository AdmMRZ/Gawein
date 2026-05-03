import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatService, ChatRoom } from '@/services/chat';

const BLUE = '#315BE8';

export default function MessagesScreen() {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      console.log('Fetching chat rooms...');
      const rooms = await chatService.getRooms();
      console.log('Rooms fetched:', JSON.stringify(rooms));
      setChats(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRooms();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const formatTime = (isoStr: string | undefined) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ height: 110, backgroundColor: BLUE, paddingTop: 50, paddingHorizontal: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800' }}>Pesan</Text>
      </View>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {chats?.map((room) => {
          const user = room.other_user;
          const name = user ? `${user.first_name} ${user.last_name}`.trim() || 'Pekerja' : 'Pekerja';
          
          return (
            <Link href={`/messages/${room.id}` as any} key={room.id} asChild>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person" size={38} color="#CCCCCC" />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>{name}</Text>
                  <Text style={{ fontSize: 13, color: '#777', marginTop: 4 }} numberOfLines={1}>
                    {room.last_message ? room.last_message.text : 'Mulai percakapan'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: room.unread_count > 0 ? BLUE : '#999', fontWeight: room.unread_count > 0 ? '700' : '400' }}>
                    {room.last_message ? formatTime(room.last_message.created_at) : ''}
                  </Text>
                  {room.unread_count > 0 && (
                    <View style={{ backgroundColor: BLUE, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 5, paddingHorizontal: 6 }}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{room.unread_count}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </Link>
          );
        })}
        {chats.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Ionicons name="chatbubbles-outline" size={60} color="#E0E0E0" />
            <Text style={{ color: '#999', marginTop: 10 }}>Belum ada pesan</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
