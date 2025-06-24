import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path as needed
import { API_URL } from '../../constants/api';

const ManageUsers = () => {
    const { userToken, isAdmin } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/users`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load users');

            setUsers(data);
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (username) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete user "${username}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/api/admin/users/${username}`, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${userToken}`,
                                },
                            });

                            const contentType = res.headers.get('Content-Type');
                            const text = await res.text();

                            if (!res.ok) {
                                if (contentType && contentType.includes('application/json')) {
                                    const errorData = JSON.parse(text);
                                    throw new Error(errorData.message || 'Failed to delete user');
                                } else {
                                    console.error('HTML error response:', text);
                                    throw new Error('Unexpected server error. Please try again.');
                                }
                            }

                            // Success — parse and update UI
                            const result = JSON.parse(text);
                            setUsers((prevUsers) =>
                                prevUsers.filter((u) => u.username !== username)
                            );
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        }
                    },
                },
            ]
        );
    };


    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Access Denied — Admins only</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Loading users...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Users</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.username}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.userRow}>
                        <View>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.roles}>
                                Roles: {(item.roles || []).join(', ')}
                            </Text>
                            <Text style={styles.roles}>
                                Departments: {(item.departments || []).join(', ')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => deleteUser(item.username)}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default ManageUsers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
    },
    roles: {
        fontSize: 14,
        color: '#666',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    error: {
        fontSize: 16,
        color: 'red',
    },
});
