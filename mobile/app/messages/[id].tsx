import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/use-auth';
import { chatService, Message } from '@/services/chat';
import { getAccessToken, API_BASE_URL } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

const BLUE = '#315BE8';
const BUBBLE_CLIENT = '#F0F4FF';
const BUBBLE_ME = '#315BE8';
const TEXT_ME = '#FFFFFF';
const TEXT_CLIENT = '#111111';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [myUserId, setMyUserId] = useState<number>(user?.id || 0);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (user?.id) setMyUserId(user.id);
    
    // 2. Fetch history
    chatService.getMessages(Number(id)).then(setMessages).catch(console.error);

    // 3. Connect to WebSocket
    getAccessToken().then(token => {
      if (!token) {
        console.log('No token found for WS (checked gawein_access_token)');
        return;
      }
      
      const wsHost = API_BASE_URL.replace('http://', '').replace('https://', '');
      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${wsHost}/ws/chat/${id}/?token=${token}`;
      
      console.log('Connecting to WS:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WS Connected Successfully');
      };
      
      ws.current.onmessage = (e) => {
        console.log('WS Message Received:', e.data);
        const data = JSON.parse(e.data);
        const newMsg: Message = {
          id: data.id,
          room: Number(id),
          sender: data.sender_id,
          text: data.message,
          is_read: true,
          created_at: data.created_at
        };
        setMessages(prev => [...prev, newMsg]);
      };

      ws.current.onerror = (e) => console.log('WS Error details:', JSON.stringify(e));
      ws.current.onclose = (e) => console.log('WS Closed code:', e.code, 'reason:', e.reason);
    });

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id]);

  const sendMessage = () => {
    if (!message.trim() || !ws.current || isSending) return;
    
    if (ws.current.readyState !== WebSocket.OPEN) {
      console.log('WS not open. State:', ws.current.readyState);
      Alert.alert('Error', 'Koneksi chat terputus. Mencoba menyambung kembali...');
      // Optionally trigger reconnect logic here
      return;
    }

    setIsSending(true);
    // Send via WS
    ws.current.send(JSON.stringify({
      message: message.trim()
    }));
    
    setMessage('');
    setTimeout(() => setIsSending(false), 500); // Debounce
  };

  const formatTime = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SafeAreaView style={{ flex: 0, backgroundColor: BLUE }} />
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: '#FFFFFF' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={{ height: 110, backgroundColor: BLUE, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingHorizontal: 16 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </Pressable>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="person" size={32} color="#CCCCCC" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>Chat</Text>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender === myUserId;
            return (
              <View key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 16 }}>
                <View style={{ 
                  backgroundColor: isMe ? BUBBLE_ME : BUBBLE_CLIENT, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  borderRadius: 20,
                  borderBottomRightRadius: isMe ? 4 : 20,
                  borderBottomLeftRadius: isMe ? 20 : 4,
                }}>
                  <Text style={{ color: isMe ? TEXT_ME : TEXT_CLIENT, fontSize: 15, lineHeight: 22 }}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={{ color: '#999', fontSize: 11, alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: 4 }}>
                  {formatTime(msg.created_at)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          borderTopWidth: 1, 
          borderTopColor: '#F0F0F0', 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: '#FFF',
          paddingBottom: Platform.OS === 'ios' ? 30 : 12
        }}>
          <View style={{ flex: 1, backgroundColor: '#F6F6F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ketik pesan..."
              placeholderTextColor="#999"
              style={{ flex: 1, fontSize: 15, color: '#111', maxHeight: 100 }}
              multiline
            />
          </View>
          <Pressable 
            onPress={sendMessage} 
            style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: (message.trim() && !isSending) ? BLUE : '#D8D8D8', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
            disabled={!message.trim() || isSending}
          >
            <Ionicons name="send" size={20} color="#FFF" style={{ marginLeft: 3 }} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <SafeAreaView style={{ flex: 0, backgroundColor: '#FFFFFF' }} />
    </View>
  );
}
