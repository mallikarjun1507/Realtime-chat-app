"// Message bubble component" 
import React from 'react';
import { View, Text } from 'react-native';

const statusToTicks = (status) => {
  if (status === 'read') return '✓✓';
  if (status === 'delivered') return '✓✓';
  return '✓';
};

export default function MessageBubble({ message, isMine }) {
  return (
    <View
      style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        backgroundColor: isMine ? '#DCF8C6' : '#fff',
        borderRadius: 8,
        padding: 8,
        marginVertical: 4,
        maxWidth: '80%',
        borderWidth: 1,
        borderColor: '#eaeaea'
      }}
    >
      <Text style={{ fontSize: 15 }}>{message.text}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: '#666' }}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isMine ? `  ${statusToTicks(message.status)}` : ''}
        </Text>
      </View>
    </View>
  );
}
