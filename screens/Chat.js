import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat'
import { auth, database } from '../config/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { colors } from '../config/constants';
import EmojiModal from 'react-native-emoji-modal';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { ImageBackground } from 'react-native';

function Chat({ route }) {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([]);
    const [modal, setModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        
        const unsubscribe = onSnapshot(doc(database, 'chats', route.params.id), (doc) => {
            setMessages(doc.data().messages.map((message) => ({
                ...message,
                createdAt: message.createdAt.toDate(),
                image: message.image ?? '',
            })));
        });

        return () => unsubscribe();
    }, [route.params.id]);

    const onSend = useCallback( async (m = []) => {
       // Get messages
      const chatDocRef = doc(database, "chats", route.params.id);
      const chatDocSnap = await getDoc(chatDocRef);

      const chatData = chatDocSnap.data();
      const data = chatData.messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toDate(),
        image: message.image ?? "",
      }));

      // Attach new message
      const messagesWillSend = [{ ...m[0], sent: true, received: false }];
      let chatMessages = GiftedChat.append(data, messagesWillSend);

      setDoc(doc(database, 'chats', route.params.id), {
            messages: chatMessages,
            lastUpdated: Date.now()
        }, { merge: true });
    }, [route.params.id, messages]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            await uploadImageAsync(result.assets[0].uri);
        }
    };
    const uploadImageAsync = async (uri) => {
        try {
            setUploading(true);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = () => reject(new TypeError("Network request failed"));
                xhr.responseType = "blob";
                xhr.open("GET", uri, true);
                xhr.send(null);
            });
    
            const randomString = uuid.v4();
            const fileRef = ref(getStorage(), randomString);
            const uploadTask = uploadBytesResumable(fileRef, blob);
    
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload percent:", progress);
                },
                (error) => {
                    console.log("Upload failed:", error);
                    setUploading(false);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    setUploading(false);
                    onSend([
                        {
                            _id: randomString,
                            createdAt: new Date(),
                            text: "",
                            image: downloadUrl,
                            user: {
                                _id: auth?.currentUser?.email,
                                name: auth?.currentUser?.displayName,
                                avatar: "https://i.pravatar.cc/300",
                            },
                        },
                    ]);
                }
            );
        } catch (error) {
            console.error("Error uploading image:", error);
            setUploading(false);
        }
    };
    
    // const uploadImageAsync = async (uri) => {
    //   setUploading(true);
    //   const blob = await new Promise((resolve, reject) => {
    //     const xhr = new XMLHttpRequest();
    //     xhr.onload = () => resolve(xhr.response);
    //     xhr.onerror = () => reject(new TypeError("Network request failed"));
    //     xhr.responseType = "blob";
    //     xhr.open("GET", uri, true);
    //     xhr.send(null);
    //   });
    //   const randomString = uuid.v4();
    //   const fileRef = ref(getStorage(), randomString);

    //   const uploadTask = uploadBytesResumable(fileRef, blob);

    //   uploadTask.on(
    //     "state_changed",
    //     (snapshot) => {
    //       const progress =
    //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //       print("Upload percent:", progress);
    //     },
    //     (error) => {
    //       // Handle unsuccessful uploads
    //       console.log(error);
    //       reject(error);
    //     },
    //     async () => {
    //       const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
    //       setUploading(false);
    //       onSend([
    //         {
    //           _id: randomString,
    //           createdAt: new Date(),
    //           text: "",
    //           image: downloadUrl,
    //           user: {
    //             _id: auth?.currentUser?.email,
    //             name: auth?.currentUser?.displayName,
    //             avatar: "https://i.pravatar.cc/300",
    //           },
    //         },
    //       ]);
    //     }
    //   );
    // }; 

    const renderBubble = useMemo(() => (props) => (
        <Bubble
        {...props}
        wrapperStyle={{
            right: {
                backgroundColor: 'skyblue', // Sent messages ka background color
                padding: 9, // Inner padding for larger bubble size
                marginVertical: 1, // Space between bubbles vertically
                maxWidth: '50%', // Control bubble width (adjustable)
                borderRadius: 14, // Rounded corners
            },
            left: {
                backgroundColor: 'lightgrey',
                padding: 9, // Inner padding for larger bubble size
                marginVertical: 1, // Space between bubbles vertically
                maxWidth: '60%', // Control bubble width
                borderRadius: 14,
            },
        }}
        textStyle={{
            right: {
                fontSize: 20, // Sent messages ka font size
                color: 'black', // Font color
                fontWeight: 'bold', // Font weight
            },
            left: {
                fontSize: 20, // Received messages ka font size
                color: 'black', // Font color
            },
        }}
    />
), []);

    const renderSend = useMemo(() => (props) => (
        <>
            <TouchableOpacity style={styles.addImageIcon} onPress={pickImage}  key="attachIcon" >
                <View>
                    <Ionicons
                        name='attach-outline'
                        size={32}
                        color={colors.teal} />
                </View>
            </TouchableOpacity>
            {/* <Send {...props} key={props.messageId || 'sendButton'}> */}
            <Send {...props} key={props.currentMessage?._id || 'sendButton'}>
                <View style={{ justifyContent: 'center', height: '100%', marginLeft: 8, marginRight: 4, marginTop: 12 }}>
                    <Ionicons
                        name='send'
                        size={24}
                        color={colors.teal} />
                </View>
            </Send>
        </>
    ), []);

    const renderInputToolbar = useMemo(() => (props) => (
        <InputToolbar {...props}
            containerStyle={styles.inputToolbar}
            //renderActions={renderActions}
            renderActions={(actionsProps) => (
                <View key="inputToolbarActions">
                    {renderActions(actionsProps)}
                </View>
            )}
        />
    ), []);

    const renderActions = useMemo(() => () => (
        <TouchableOpacity style={styles.emojiIcon} onPress={handleEmojiPanel}>
            <View>
                <Ionicons
                    name='happy-outline'
                    size={32}
                    color={colors.teal} />
            </View>
        </TouchableOpacity>
    ), [modal]);

    const handleEmojiPanel = useCallback(() => {
        if (modal) {
            setModal(false);
        } else {
            Keyboard.dismiss();
            setModal(true);
        }
    }, [modal]);

    const renderLoading = useMemo(() => () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.teal} />
        </View>
    ), []);

    const renderLoadingUpload = useMemo(() => () => (
        <View style={styles.loadingContainerUpload}>
            <ActivityIndicator size='large' color={colors.teal} />
        </View>
    ), []);

    return (
        <>
            <ImageBackground
                source={require('../assets/chatsbackground.png')} // Background image ka path
                style={styles.backgroundImage} // Style apply kar rahe hain
            >
                {/* Image upload progress indicator */}
                {uploading && renderLoadingUpload()}
    
                {/* GiftedChat for messages */}
                <GiftedChat
                    messages={messages}
                    showAvatarForEveryMessage={false}
                    showUserAvatar={false}
                    onSend={messages => onSend(messages)}
                    imageStyle={{ height: 212, width: 212 }}
                    messagesContainerStyle={{ backgroundColor: 'transparent' }} // Background transparent karein
                    textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
                    user={{
                        _id: auth?.currentUser?.email,
                        name: auth?.currentUser?.displayName,
                        avatar: 'https://i.pravatar.cc/300'
                    }}
                    renderBubble={renderBubble}
                    renderSend={renderSend}
                    renderUsernameOnMessage={true}
                    renderAvatarOnTop={true}
                    renderInputToolbar={renderInputToolbar}
                    minInputToolbarHeight={56}
                    scrollToBottom={true}
                    onPressActionButton={handleEmojiPanel}
                    scrollToBottomStyle={styles.scrollToBottomStyle}
                    renderLoading={renderLoading}
                />
            </ImageBackground>
    
            {/* Emoji Modal */}
            {modal && (
                <EmojiModal
                    onPressOutside={handleEmojiPanel}
                    modalStyle={styles.emojiModal}
                    containerStyle={styles.emojiContainerModal}
                    backgroundStyle={styles.emojiBackgroundModal}
                    columns={5}
                    emojiSize={66}
                    activeShortcutColor={colors.primary}
                    onEmojiSelected={(emoji) => {
                        onSend([{
                            _id: uuid.v4(),
                            createdAt: new Date(),
                            text: emoji,
                            user: {
                                _id: auth?.currentUser?.email,
                                name: auth?.currentUser?.displayName,
                                avatar: 'https://i.pravatar.cc/300'
                            }
                        }]);
                    }}
                />
            )}
        </>
    );
}
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1, // Poore screen ko cover karega
        resizeMode: 'cover', // Image ko stretch nahi karega, aspect ratio maintain karega
    },
    scrollToBottomStyle: {
        borderColor: colors.grey,
        borderWidth: 1,
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        bottom: 12,
        right: 12,
    },
    inputToolbar: {
        bottom: 6,
        marginLeft: 8,
        marginRight: 8,
        borderRadius: 16,
    },
    emojiIcon: {
        marginLeft: 4,
        bottom: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    emojiModal: {},
    emojiContainerModal: {
        height: 348,
        width: 396,
    },
    emojiBackgroundModal: {},
    scrollToBottomStyle: {
        borderColor: colors.grey,
        borderWidth: 1,
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        bottom: 12,
        right: 12
    },
    addImageIcon: {
        bottom: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainerUpload: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)", 
      zIndex: 999, 
    }
});

export default Chat;