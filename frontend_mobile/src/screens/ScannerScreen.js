import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api/api';

export default function ScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) {
        // Camera permissions are still loading
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginBottom: 10 }}>Necesitamos permiso para usar la cámara</Text>
                <Button onPress={requestPermission} title="Dar permiso" />
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned || loading) return;

        setScanned(true);
        setLoading(true);

        // El QR contiene el UUID (entry_code)
        // O puede contener una URL completa dependiendo de cómo lo generemos.
        // Asumimos que es el UUID o lo extraemos si es URL.

        let code = data;
        // Si es una URL (ej: http://.../validate/UUID), extraemos el UUID si es necesario
        // Pero nuestro backend espera 'qr_content' que puede ser la data cruda si lo manejamos así.
        // Vamos a enviar la data tal cual al endpoint de validación.

        validateQR(code);
    };

    const validateQR = async (code) => {
        try {
            // Nota: Debemos asegurar que el backend tenga este endpoint o similar.
            // Usaremos 'registrations/validate_qr/' como planeado.
            const response = await api.post('registrations/validate_qr/', { qr_content: code });

            const { valid, message, attendee, event } = response.data;

            if (valid) {
                Alert.alert(
                    "✅ Acceso Permitido",
                    `${message}\n\n👤 ${attendee}\n📅 ${event}`,
                    [{ text: "OK", onPress: () => { setScanned(false); setLoading(false); } }]
                );
            } else {
                Alert.alert(
                    "❌ Acceso Denegado",
                    message,
                    [{ text: "OK", onPress: () => { setScanned(false); setLoading(false); } }]
                );
            }
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.detail || "Error de conexión o código inválido";
            Alert.alert(
                "Error",
                errMsg,
                [{ text: "OK", onPress: () => { setScanned(false); setLoading(false); } }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.instructions}>Enfoca el código QR</Text>
                </View>
            </CameraView>

            {scanned && (
                <View style={styles.rescanButton}>
                    <Button title="Toque para escanear de nuevo" onPress={() => setScanned(false)} />
                </View>
            )}

            {loading && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }]}>
                    <Text style={{ color: 'white', fontSize: 20 }}>Validando...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00ff00',
        backgroundColor: 'transparent',
        borderRadius: 20,
    },
    instructions: {
        color: 'white',
        fontSize: 16,
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 5,
    },
    rescanButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
    },
});
