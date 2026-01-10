import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
    const { logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Bienvenido</Text>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Scanner')}
                >
                    <Text style={styles.cardIcon}>📷</Text>
                    <Text style={styles.cardTitle}>Escanear QR</Text>
                    <Text style={styles.cardSubtitle}>Validar entradas de eventos</Text>
                </TouchableOpacity>

                {/* More cards can go here */}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#0f172a',
    },
    card: {
        backgroundColor: 'white',
        width: '100%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 15,
    },
    cardIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 5,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default HomeScreen;
