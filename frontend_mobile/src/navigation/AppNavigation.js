import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View, Text, Button } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';

import ProfileCompletionScreen from '../screens/ProfileCompletionScreen';

const Stack = createStackNavigator();

const AppNavigation = () => {
    const { isLoading, userToken, userInfo, logout, authError } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Auth Stack
    if (userToken === null) {
        return (
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    // Safety check: if we have a token but no info yet...
    if (!userInfo) {
        // If we are NOT loading anymore, it means it FAILED. context isn't loading, but we have no user info.
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>No se pudo cargar tu perfil.</Text>

                {authError && (
                    <Text style={{ color: 'red', marginBottom: 20, textAlign: 'center' }}>
                        {authError}
                    </Text>
                )}

                <Button title="Cerrar Sesión" onPress={logout} />
            </View>
        );
    }

    // Check for mandatory name/surname
    const hasName = userInfo.first_name && userInfo.last_name;

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!hasName ? (
                    <Stack.Screen
                        name="ProfileCompletion"
                        component={ProfileCompletionScreen}
                        options={{ title: 'Completar Perfil', headerShown: true }}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{ title: 'Inicio' }}
                        />
                        <Stack.Screen
                            name="Scanner"
                            component={ScannerScreen}
                            options={{ title: 'Escanear QR' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigation;
