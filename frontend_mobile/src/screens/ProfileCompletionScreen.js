import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileCompletionScreen = () => {
    const { userInfo, updateUserInfo } = useContext(AuthContext);
    const [firstName, setFirstName] = useState(userInfo?.first_name || '');
    const [lastName, setLastName] = useState(userInfo?.last_name || '');
    const [saving, setSaving] = useState(false);

    const saveProfile = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'Por favor completa ambos campos.');
            return;
        }

        setSaving(true);
        try {
            const response = await api.patch(`users/${userInfo.id}/`, {
                first_name: firstName,
                last_name: lastName
            });

            // Update context
            updateUserInfo(response.data);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Completa tu Perfil</Text>
            <Text style={styles.subtitle}>Para usar la aplicación, necesitamos saber tu nombre completo.</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Ej: Juan"
                />

                <Text style={styles.label}>Apellidos</Text>
                <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Ej: Pérez García"
                />

                <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={saving}>
                    {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar y Continuar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 30,
        textAlign: 'center'
    },
    form: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        elevation: 3
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        padding: 10,
        marginBottom: 15,
        fontSize: 16
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 15,
        borderRadius: 6,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default ProfileCompletionScreen;
