"// User item component" 
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export default function UserItem({ user, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>{user.name}</Text>
        <Text style={{ fontSize: 12, color: '#555' }}>{user.email}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 12 }}>
          {user.isOnline ? '🟢 Online' : '⚪ Offline'}
        </Text>
        {user.lastSeenAt ? (
          <Text style={{ fontSize: 11, color: '#666' }}>
            {user.isOnline ? '' : `Last seen ${(new Date(user.lastSeenAt)).toLocaleString()}`}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
