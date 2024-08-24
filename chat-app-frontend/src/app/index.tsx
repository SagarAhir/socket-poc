import React, { useState, useEffect, version, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import io from "socket.io-client";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";

interface MessageType {
  deviceName: string;
  message: string;
}

const socket = io("http://192.168.1.3:3000");
const DEVICE_NAME = Device.deviceName;
const isDevice1 = DEVICE_NAME === "Pixel-7a";
const userName = isDevice1 ? "Anonymous" : "Sagar";

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const flRef = useRef<FlatList>(null);

  useEffect(() => {
    socket.on("message", (newMessage) => {
      console.log("messagess----", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", {
        deviceName: DEVICE_NAME,
        message,
      });
      setMessage("");
      flRef.current?.scrollToEnd();
      // Keyboard.dismiss();
    }
  };

  const MessageItem = ({
    item,
    index,
  }: {
    item: MessageType;
    index: number;
  }) => {
    const isSelf = item.deviceName === "Pixel-7a";
    return (
      <View
        style={isSelf ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }}
      >
        <Text
          style={[
            styles.userName,
            item.deviceName === "Pixel-7a"
              ? { color: Colors.tomatoRed }
              : { color: Colors.blue },
          ]}
        >
          {isSelf ? "Anonymous" : "Sagar"}
        </Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`Chats - ${userName}`}</Text>
      <FlatList
        ref={flRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={MessageItem}
        style={styles.messagesContainer}
      />
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          placeholderTextColor={Colors.text}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
          placeholder="Type a message"
        />
        <Pressable onPress={sendMessage}>
          <Ionicons
            name="send"
            size={24}
            color={isDevice1 ? Colors.tomatoRed : Colors.blue}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    color: Colors.text,
    borderBottomColor: Colors.text,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  message: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    marginVertical: 5,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    color: Colors.text,
  },
  textInputContainer: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
  },
  messageText: {
    fontSize: 18,
    backgroundColor: Colors.icon,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 2,
  },
});

export default ChatScreen;
