import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { getMessagesApi } from '../api/api';
import { getSocket } from '../services/socket';
import MessageBubble from '../components/MessageBubble';
import TypingDots from '../components/TypingDots';

export default function ChatScreen({ route }) {
  const { otherUser } = route.params;
  const { me } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages]
  );

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await getMessagesApi(otherUser._id);
      setConversationId(data.conversationId);
      setMessages(data.messages || []);
    };
    loadMessages();
  }, [otherUser._id]);

  // Socket listeners
  useEffect(() => {
    (async () => {
      const socket = await getSocket();

      socket.on('message:new', ({ message }) => {
        if (!conversationId || message.conversation === conversationId ||
            message.from === otherUser._id || message.to === otherUser._id) {
          setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);
        }
        if (message.to === me.id || message.to === me._id) {
          socket.emit('message:read', { messageId: message._id });
        }
      });

      socket.on('message:update', ({ messageId, status, readAt }) => {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status, readAt } : m));
      });

      socket.on('typing:start', ({ from }) => { if (from === otherUser._id) setTyping(true); });
      socket.on('typing:stop', ({ from }) => { if (from === otherUser._id) setTyping(false); });

      return () => {
        socket.off('message:new');
        socket.off('message:update');
        socket.off('typing:start');
        socket.off('typing:stop');
      };
    })();
  }, [conversationId, otherUser._id]);

  // Mobile keyboard height
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
      const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
      return () => { show.remove(); hide.remove(); };
    }
  }, []);

  const handleTextChange = async (t) => {
    setText(t);
    const socket = await getSocket();
    socket.emit('typing:start', { to: otherUser._id, conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { to: otherUser._id, conversationId });
    }, 800);
  };

  const sendMessage = async () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    const socket = await getSocket();
    socket.emit('message:send', { to: otherUser._id, text: value }, (ack) => {
      if (!ack?.ok) return;
      setMessages(prev => prev.some(m => m._id === ack.message._id) ? prev : [...prev, ack.message]);
    });
  };

  const renderItem = ({ item }) => {
    const isMine = item.from === me.id || item.from === me._id;
    return <MessageBubble message={item} isMine={isMine} />;
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {otherUser.name} {otherUser.isOnline ? '🟢' : '⚪'}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={isWeb ? sortedMessages : [...sortedMessages].reverse()}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={renderItem}
        inverted={!isWeb}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 12, paddingBottom: isWeb ? 80 : 0 }}
        style={{ flex: 1 }}
      />

      {typing && <TypingDots />}

      {/* Input field */}
      <View style={[
        styles.inputContainer,
        {
          paddingBottom: isWeb ? 20 : keyboardHeight + insets.bottom + 8,
        }
      ]}>
        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message"
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  headerText: { fontSize: 16, fontWeight: '700' },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111',
    borderRadius: 20,
    marginLeft: 8,
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
