// import React, { useContext, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Alert,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';
// import { AuthContext } from '../contexts/AuthContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from "../../constants/api"
// import UserSidebar from '../../components/UserSidebar';
// import UserHeader from '../../components/UserHeader';
// import UserWelcome from '../../components/UserWelcome';
// import UserManageProfile from '../../components/UserManageProfile';

// const menuItems = [
//   { key: 'welcome', label: 'Welcome', iconColor: '#007bff' },
//   { key: 'dashboard', label: 'Dashboard', iconColor: '#6f42c1' },
//   { key: 'manageProfile', label: 'Manage Profile', iconColor: '#fd7e14' },
//   { key: 'allChallanList', label: 'All Challan List', iconColor: '#20c997' },
//   { key: 'userOrders', label: 'User Orders', iconColor: '#ffc107' },
//   { key: 'adminOrderList', label: 'Admin Order List', iconColor: '#dc3545' },
//   { key: 'customerHistory', label: 'Customer History', iconColor: '#17a2b8' },
//   { key: 'receiveCourierList', label: 'Receive Courier List', iconColor: '#6610f2' },
//   { key: 'promotionSchemes', label: 'Promotion Schemes', iconColor: '#e83e8c' },
// ];

// const UserScreen = () => {
//   const authContext = useContext(AuthContext);
//   if (!authContext) {
//     throw new Error('AuthContext is null');
//   }
//   const { signOut, user } = authContext;

//   const [selectedMenu, setSelectedMenu] = useState('welcome');

//   // Dummy data for dashboard cards and tables
//   const [userOrdersCount, setUserOrdersCount] = useState(0);
//   const [adminOrdersCount, setAdminOrdersCount] = useState(2);
//   const [totalChallans, setTotalChallans] = useState(0);
//   const [newAdminOrders, setNewAdminOrders] = useState([]);

//   useEffect(() => {
//     const fetchAdminOrders = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         const response = await fetch(`${API_URL}/api/user/orders`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           setNewAdminOrders(data);
//         } else {
//           Alert.alert('Error', 'Failed to fetch admin orders');
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Failed to fetch admin orders');
//       }
//     };
//     fetchAdminOrders();
//   }, []);

//   const [customerHistoryList, setCustomerHistoryList] = useState([]);
//   const [promotionList, setPromotionList] = useState([]);
//   const [usedPromotionList, setUsedPromotionList] = useState([]);

//   // Profile state for manage profile
//   const [userName, setUserName] = useState(user?.name || '');
//   const [userEmail, setUserEmail] = useState(user?.email || '');
//   const [userPhone, setUserPhone] = useState(user?.phone || '');

//   // Fetch full user profile from backend
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         const response = await fetch(`${API_URL}api/user/profile`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           setUserName(data.name || '');
//           setUserEmail(data.email || '');
//           setUserPhone(data.phone || '');
//         } else {
//           Alert.alert('Error', 'Failed to fetch user profile');
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Failed to fetch user profile');
//       }
//     };
//     fetchUserProfile();
//   }, []);

//   // Customer History search state
//   const [customerName, setCustomerName] = useState(user?.name || '');
//   const [type, setType] = useState('CHALLAN');
//   const [startDate, setStartDate] = useState('');
//   const [lastDate, setLastDate] = useState('');

//   // Navigation handler
//   const handleMenuSelect = (key) => {
//     setSelectedMenu(key);
//   };

//   // Render new admin orders list item
//   const renderNewAdminOrder = ({ item }) => (
//     <View style={styles.newAdminOrderItem}>
//       <View
//         style={[
//           styles.newAdminOrderCircle,
//           { backgroundColor: item.color },
//         ]}
//       />
//       <Text>{item.label}</Text>
//     </View>
//   );

//   // Render customer history list header
//   const renderCustomerHistoryHeader = () => (
//     <View style={styles.tableHeader}>
//       <Text style={[styles.tableCell, { flex: 0.5 }]}>#</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>TOKEN</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>BUTTON</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>ORDER QTY</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>CHALLAN QTY</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>LASER</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>CREATED DATE</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>ACTION</Text>
//     </View>
//   );

//   // Render customer history list item
//   const renderCustomerHistoryItem = ({ item, index }) => (
//     <View style={styles.tableRow}>
//       <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>{item.token}</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>{item.button}</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>{item.orderQty}</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>{item.challanQty}</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>{item.laser}</Text>
//       <Text style={[styles.tableCell, { flex: 1 }]}>{item.createdDate}</Text>
//       <TouchableOpacity style={styles.actionButton}>
//         <Text style={styles.actionButtonText}>View</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   // Search customer history handler (dummy)
//   const handleSearchCustomerHistory = () => {
//     Alert.alert('Search', 'Search customer history with filters');
//   };

//   // Save profile handler
//   const handleSaveProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const response = await fetch(`${API_URL}/api/user/profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name: userName,
//           email: userEmail,
//           phone: userPhone,
//         }),
//       });
//       if (response.ok) {
//         Alert.alert('Success', 'Profile updated successfully');
//       } else {
//         Alert.alert('Error', 'Failed to update profile');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update profile');
//     }
//   };

//   const renderContent = () => {
//     switch (selectedMenu) {
//       case 'welcome':
//         return (
//           <UserWelcome
//             userName={user?.name || ''}
//             userEmail={user?.email || ''}
//             userPhone={user?.phone || ''}
//             onViewProfile={() => setSelectedMenu('manageProfile')}
//           />
//         );
//       case 'manageProfile':
//         return (
//           <UserManageProfile
//             userName={userName}
//             userEmail={userEmail}
//             userPhone={userPhone}
//             setUserName={setUserName}
//             setUserEmail={setUserEmail}
//             setUserPhone={setUserPhone}
//             onSaveProfile={handleSaveProfile}
//           />
//         );
//       case 'dashboard':
//         return (
//           <View>
//             <View style={styles.dashboardCardsRow}>
//               <View style={[styles.dashboardCard, { backgroundColor: '#007bff' }]}>
//                 <Text style={styles.dashboardCardTitle}>Total User Orders</Text>
//                 <Text style={styles.dashboardCardCount}>{userOrdersCount}</Text>
//               </View>
//               <View style={[styles.dashboardCard, { backgroundColor: '#28a745' }]}>
//                 <Text style={styles.dashboardCardTitle}>Admin Orders</Text>
//                 <Text style={styles.dashboardCardCount}>{adminOrdersCount}</Text>
//               </View>
//               <View style={[styles.dashboardCard, { backgroundColor: '#dc3545' }]}>
//                 <Text style={styles.dashboardCardTitle}>Total Challans</Text>
//                 <Text style={styles.dashboardCardCount}>{totalChallans}</Text>
//               </View>
//             </View>
//             <View style={styles.dashboardCardsRow}>
//               <View style={styles.userProfileCard}>
//                 <View style={styles.userAvatar} />
//                 <Text style={styles.userName}>{user?.name || ''}</Text>
//                 <Text style={styles.userEmail}>{user?.email || ''}</Text>
//                 <Text style={styles.userPhone}>{user?.phone || ''}</Text>
//                 <TouchableOpacity style={styles.viewProfileButton} onPress={() => setSelectedMenu('manageProfile')}>
//                   <Text style={styles.viewProfileButtonText}>View Profile</Text>
//                 </TouchableOpacity>
//               </View>
//               <View style={styles.newChallansCard}>
//                 <Text>New Challans</Text>
//               </View>
//               <View style={styles.newAdminOrdersCard}>
//                 <Text>New Admin Orders</Text>
//                 <FlatList
//                   data={newAdminOrders}
//                   keyExtractor={(item) => item._id}
//                   renderItem={renderNewAdminOrder}
//                 />
//               </View>
//             </View>
//           </View>
//         );
//       case 'customerHistory':
//         return (
//           <View>
//             <Text style={styles.contentTitle}>Search Customer History</Text>
//             <View style={styles.searchRow}>
//               <View style={styles.searchColumn}>
//                 <Text>Customer Name</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={customerName}
//                   onChangeText={setCustomerName}
//                 />
//               </View>
//               <View style={styles.searchColumn}>
//                 <Text>Type</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={type}
//                   onChangeText={setType}
//                 />
//               </View>
//             </View>
//             <View style={styles.searchRow}>
//               <View style={styles.searchColumn}>
//                 <Text>Start Date</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={startDate}
//                   onChangeText={setStartDate}
//                   placeholder="mm/dd/yyyy"
//                 />
//               </View>
//               <View style={styles.searchColumn}>
//                 <Text>Last Date</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={lastDate}
//                   onChangeText={setLastDate}
//                   placeholder="mm/dd/yyyy"
//                 />
//               </View>
//             </View>
//             <View style={styles.searchButtonsRow}>
//               <TouchableOpacity style={styles.searchButton} onPress={handleSearchCustomerHistory}>
//                 <Text style={styles.searchButtonText}>Search</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.searchButton}>
//                 <Text style={styles.searchButtonText}>Total Quantity</Text>
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.contentTitle}>List Customer History</Text>
//             <View style={styles.tableContainer}>
//               {renderCustomerHistoryHeader()}
//               <FlatList
//                 data={customerHistoryList}
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={renderCustomerHistoryItem}
//               />
//             </View>
//           </View>
//         );
//       case 'adminOrderList':
//         return (
//           <View style={styles.contentCard}>
//             <Text style={styles.contentTitle}>Admin Orders List</Text>
//             <FlatList
//               data={newAdminOrders}
//               keyExtractor={(item) => item._id}
//               renderItem={({ item }) => (
//                 <View style={styles.newAdminOrderItem}>
//                   <View
//                     style={[
//                       styles.newAdminOrderCircle,
//                       { backgroundColor: item.color },
//                     ]}
//                   />
//                   <Text>{item.label}</Text>
//                 </View>
//               )}
//             />
//           </View>
//         );
//       case 'promotionSchemes':
//         return (
//           <View style={styles.contentCard}>
//             <Text style={styles.contentTitle}>Promotion List</Text>
//             <Text>Promotion schemes table here</Text>
//           </View>
//         );
//       default:
//         return (
//           <View style={styles.contentCard}>
//             <Text style={styles.contentTitle}>Welcome {user?.name || ''}</Text>
//           </View>
//         );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <UserSidebar
//         menuItems={menuItems}
//         selectedMenu={selectedMenu}
//         onSelectMenu={handleMenuSelect}
//         userName={user?.name || ''}
//         onSignOut={signOut}
//       />
//       <View style={styles.mainContent}>
//         <UserHeader companyName={user?.company || 'Company'} userName={user?.name || ''} />
//         <ScrollView style={styles.contentArea}>{renderContent()}</ScrollView>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   mainContent: {
//     flex: 1,
//     backgroundColor: '#f1f3f5',
//   },
//   contentArea: {
//     padding: 15,
//   },
//   dashboardCardsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   dashboardCard: {
//     flex: 1,
//     borderRadius: 6,
//     padding: 15,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   dashboardCardTitle: {
//     color: 'white',
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   dashboardCardCount: {
//     fontSize: 24,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   userProfileCard: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 6,
//     padding: 15,
//     marginHorizontal: 5,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   userAvatar: {
//     width: 80,
//     height: 80,
//     backgroundColor: '#6c757d',
//     borderRadius: 40,
//     marginBottom: 10,
//   },
//   userName: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   userEmail: {
//     color: '#6c757d',
//     marginBottom: 5,
//   },
//   userPhone: {
//     color: '#6c757d',
//     marginBottom: 10,
//   },
//   viewProfileButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderColor: '#6c757d',
//     borderWidth: 1,
//     borderRadius: 4,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//   },
//   viewProfileButtonText: {
//     color: '#6c757d',
//     fontWeight: 'bold',
//   },
//   newChallansCard: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 6,
//     padding: 15,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   newAdminOrdersCard: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 6,
//     padding: 15,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   newAdminOrderItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   newAdminOrderCircle: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   searchColumn: {
//     flex: 1,
//     marginRight: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ced4da',
//     borderRadius: 4,
//     paddingHorizontal: 10,
//     height: 40,
//     marginTop: 5,
//   },
//   searchButtonsRow: {
//     flexDirection: 'row',
//     marginBottom: 15,
//   },
//   searchButton: {
//     backgroundColor: '#0d6efd',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 4,
//     marginRight: 10,
//   },
//   searchButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   tableContainer: {
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//     borderRadius: 4,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#e9ecef',
//     paddingVertical: 8,
//     paddingHorizontal: 5,
//   },
//   tableCell: {
//     flex: 1,
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 8,
//     paddingHorizontal: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#dee2e6',
//   },
//   actionButton: {
//     backgroundColor: '#0d6efd',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   actionButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
// });

// export default UserScreen;

// app/user/index.jsx

import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "allChallanList", label: "All Challan List" },
  { key: "userOrders", label: "User Orders" },
  { key: "adminOrderList", label: "Admin Order List" },
  { key: "customerHistory", label: "Customer History" },
  { key: "promotionSchemes", label: "Promotion Schemes" },
];

export default function UserHome() {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.userName}>Welcome, {user?.name || "User"}</Text>
        <Link href="/user/manageProfile" asChild>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Menu Buttons */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Link href={`/user/${item.key}`} asChild>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={styles.menuList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: "#f8f9fa" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343a40",
  },
  menuList: { paddingHorizontal: 20 },
  menuButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  menuButtonText: {
    fontSize: 16,
    color: "#212529",
  },
});
