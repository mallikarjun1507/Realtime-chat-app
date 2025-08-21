// Home screen
import { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getUsersApi } from '../api/api';
import UserItem from '../components/UserItem';
import { AuthContext } from '../contexts/AuthContext';
import { getSocket } from '../services/socket';

export default function HomeScreen({ navigation }) {
  const { me, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const { data } = await getUsersApi();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    fetchUsers();

    (async () => {
      const socket = await getSocket();

      // live presence updates
      socket.on('presence:update', ({ userId, isOnline }) => {
        setUsers((prev) =>
          Array.isArray(prev)
            ? prev.map((u) => (u._id === userId ? { ...u, isOnline } : u))
            : []
        );
      });

      return () => {
        socket.off('presence:update');
      };
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 12,
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700' }}>
          Hello, {me?.name}
        </Text>
        <TouchableOpacity onPress={logout}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item, index) => item?._id?.toString() || `user-${index}`}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={() => navigation.navigate('Chat', { otherUser: item })}
          />
        )}
        ListEmptyComponent={
          <Text style={{ padding: 16 }}>No other users yet.</Text>
        }
      />
    </View>
  );
}
