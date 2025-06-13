import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminScreen from '../screens/AdminScreen';
import StaffScreen from '../screens/StaffScreen';
import UserScreen from '../screens/UserScreen';
import { AuthContext } from '../contexts/AuthContext';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    // If context is undefined, render login screen as fallback
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  const { userRole, userToken } = authContext;

  return (
    <Stack.Navigator>
      {userToken == null ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : userRole === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminScreen} />
      ) : userRole === 'staff' ? (
        <Stack.Screen name="Staff" component={StaffScreen} />
      ) : (
        <Stack.Screen name="User" component={UserScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
