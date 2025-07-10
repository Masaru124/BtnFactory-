import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../../constants/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderTracker = () => {
    const [tokenInput, setTokenInput] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const { userToken, isLoading } = useContext(AuthContext);

    const fetchOrder = async () => {
        if (!tokenInput.trim()) {
            setError('Please enter a token.');
            return;
        }

        if (!userToken) {
            setError('You must be logged in to track an order.');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);
        setShowDetails(false);

        try {
            const response = await fetch(
                `${API_URL}/api/user/track/${tokenInput.trim().toUpperCase()}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Order not found');
                } else {
                    throw new Error('Failed to fetch order');
                }
            }

            const data = await response.json();
            setOrder(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return '#4CAF50';
            case 'processing': return '#FFC107';
            case 'pending': return '#9E9E9E';
            case 'shipped': return '#2196F3';
            default: return '#4A90E2';
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Track Your Order</Text>
                <Text style={styles.subtitle}>Enter your order token to check the status</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter order token"
                    placeholderTextColor="#999"
                    value={tokenInput}
                    onChangeText={setTokenInput}
                    autoCapitalize="characters"
                />
                <TouchableOpacity 
                    style={styles.searchButton} 
                    onPress={fetchOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Icon name="search" size={24} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={20} color="#F44336" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {order && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                            <Text style={styles.statusText}>{order.status}</Text>
                        </View>
                    </View>

                    <View style={styles.orderSummary}>
                        <View style={styles.summaryItem}>
                            <Icon name="business" size={16} color="#666" />
                            <Text style={styles.summaryText}>{order.companyName}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Icon name="date-range" size={16} color="#666" />
                            <Text style={styles.summaryText}>
                                {new Date(order.createdDate).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Icon name="attach-money" size={16} color="#666" />
                            <Text style={styles.summaryText}>₹{order.rate}</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.detailsButton}
                        onPress={() => setShowDetails(prev => !prev)}
                    >
                        <Text style={styles.detailsButtonText}>
                            {showDetails ? 'Hide Details' : 'View Full Details'}
                        </Text>
                        <Icon 
                            name={showDetails ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                            size={20} 
                            color="#4A90E2" 
                        />
                    </TouchableOpacity>

                    {showDetails && (
                        <View style={styles.detailsContainer}>
                            <DetailRow icon="receipt" label="PO Number" value={order.poNumber} />
                            <DetailRow icon="event" label="PO Date" value={new Date(order.poDate).toLocaleDateString()} />
                            <DetailRow icon="build" label="Casting" value={order.casting} />
                            <DetailRow icon="straighten" label="Thickness" value={order.thickness} />
                            <DetailRow icon="filter-center-focus" label="Holes" value={order.holes} />
                            <DetailRow icon="inventory" label="Box Type" value={order.boxType} />
                            <DetailRow icon="fingerprint" label="Token" value={order.token} />
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailLabel}>
            <Icon name={icon} size={16} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailLabelText}>{label}</Text>
        </View>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F5F7FA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#2C3E50',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRightWidth: 0,
    },
    searchButton: {
        width: 50,
        height: 50,
        backgroundColor: '#4A90E2',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#F44336',
        marginLeft: 8,
        fontSize: 14,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
    },
    orderSummary: {
        marginBottom: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryText: {
        marginLeft: 8,
        color: '#666',
        fontSize: 14,
    },
    detailsButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    detailsButtonText: {
        color: '#4A90E2',
        fontWeight: '600',
    },
    detailsContainer: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        marginRight: 8,
    },
    detailLabelText: {
        color: '#666',
    },
    detailValue: {
        color: '#2C3E50',
        fontWeight: '500',
    },
});

export default OrderTracker;