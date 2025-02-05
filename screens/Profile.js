import React, { useState } from "react";
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Modal,
    TextInput,
    Button,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../config/constants";
import { getAuth, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import Cell from "../components/Cell";

const Profile = () => {
    const [name, setName] = useState(auth?.currentUser?.displayName || ""); // Store name
    const [about, setAbout] = useState("Available"); // Store about text
    const [isModalVisible, setIsModalVisible] = useState(false); // For name edit modal
    const [isAboutModalVisible, setIsAboutModalVisible] = useState(false); // For about edit modal
    const [inputValue, setInputValue] = useState(""); // Temporary input storage

    // Update Firebase Display Name
    const handleSaveName = () => {
        updateProfile(auth.currentUser, { displayName: inputValue })
            .then(() => {
                setName(inputValue);
                setIsModalVisible(false);
            })
            .catch((error) => {
                console.error("Failed to update profile:", error);
            });
    };

    // Update About Section Locally
    const handleSaveAbout = () => {
        setAbout(inputValue);
        setIsAboutModalVisible(false);
    };

    const initials = auth?.currentUser?.displayName
        ? auth.currentUser.displayName.split(' ').map(name => name[0]).join('')
        : auth?.currentUser?.email?.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
                <TouchableOpacity style={styles.avatar}>
                    <Text style={styles.avatarLabel}>{initials}</Text>
                </TouchableOpacity>
            </View>

            {/* User Info Cells */}
            <View style={styles.infoContainer}>
                <Cell
                    title="Name"
                    icon="person-outline"
                    iconColor="black"
                    subtitle={name}
                    secondIcon="pencil-outline"
                    onPress={() => {
                        setInputValue(name);
                        setIsModalVisible(true);
                    }}
                    style={styles.cell}
                />

                <Cell
                    title="Email"
                    subtitle={auth?.currentUser?.email}
                    icon="mail-outline"
                    iconColor="black"
                    style={styles.cell}
                />

                <Cell
                    title="About"
                    subtitle={about}
                    icon="information-circle-outline"
                    iconColor="black"
                    secondIcon="pencil-outline"
                    onPress={() => {
                        setInputValue(about);
                        setIsAboutModalVisible(true);
                    }}
                    style={styles.cell}
                />
            </View>

            {/* Modal for Editing Name */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Name</Text>
                        <TextInput
                            style={styles.input}
                            value={inputValue}
                            onChangeText={setInputValue}
                            placeholder="Enter your name"
                        />
                        <Button title="Save" onPress={handleSaveName} />
                    </View>
                </View>
            </Modal>

            {/* Modal for Editing About */}
            <Modal
                visible={isAboutModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAboutModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit About</Text>
                        <TextInput
                            style={styles.input}
                            value={inputValue}
                            onChangeText={setInputValue}
                            placeholder="Enter about yourself"
                        />
                        <Button title="Save" onPress={handleSaveAbout} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    avatarLabel: {
        fontSize: 36,
        color: 'white',
        fontWeight: 'bold',
    },
    infoContainer: {
        marginTop: 40,
        width: '90%',
    },
    cell: {
        marginBottom: 15,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 0.5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

export default Profile;
