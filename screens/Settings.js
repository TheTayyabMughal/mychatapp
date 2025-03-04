import React, { useCallback } from "react";
import { Text, View, StyleSheet, Alert, Linking, TouchableOpacity } from "react-native";
import ContactRow from "../components/ContactRow";
import { colors } from "../config/constants";
import Cell from "../components/Cell";
import { auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons'

const Settings = ({ navigation }) => {

    async function openGithub(url) {
        await Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <ContactRow
                name={auth?.currentUser?.displayName ?? 'No name'}
                subtitle={auth?.currentUser?.email}
                style={styles.contactRow}
                onPress={() => {
                    navigation.navigate('Profile');
                }}
            />

            <Cell
                title='Account'
                subtitle='Privacy, logout, delete account'
                icon='key-outline'
                onPress={() => {
                    navigation.navigate('Account');
                }}
                iconColor="black"
                style={{ marginTop: 20 }}
            />

            <Cell
                title='Help'
                subtitle='Contact us, app info'
                icon='help-circle-outline'
                iconColor="black"
                onPress={() => {
                    navigation.navigate('Help');
                }}
            />

            <Cell
                title='Invite a friend'
                icon='people-outline'
                iconColor="black"
                onPress={() => {
                    alert('Share touched')
                }}
                showForwardIcon={false}
            />

            {/* <TouchableOpacity style={styles.githubLink} onPress={() => openGithub('null')}> */}
            <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 12, fontWeight: '400', color: colors.teal }}>
        <Ionicons name="person" size={12} style={{ color: colors.teal }} />
        {' '}
        <Text style={{ fontWeight: 'bold', color: colors.teal }}>Tayyab Mughal</Text>
    </Text>
</View>


            {/* </TouchableOpacity> */}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'skyblue', // Set background color to blue
        flex: 1,
    },
    contactRow: {
        backgroundColor: 'white',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border
    },
    githubLink: {
        marginTop: 20,
        alignSelf: "center",
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,
        width: 100,
    },
})

export default Settings;
