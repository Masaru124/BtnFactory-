const axios = require('axios');
require('dotenv').config();

// API URL - Using the same one as frontend or from environment
const API_URL = process.env.API_URL || 'https://btnfactory.onrender.com';

// Test credentials - ONLY FOR TESTING
const TEST_STAFF = {
  username: 'test_staff_user',
  password: 'Test@123'
};

let authToken = '';
let testOrderToken = '';

// Helper function to log test results
const logResult = (method, endpoint, success, error = null) => {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${method} ${endpoint}`);
  if (error) {
    console.log(`  Error: ${error.message || error}`);
  }
};

// Test staff login
async function testStaffLogin() {
  try {
    // Try to login with staff credentials
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_STAFF);
    authToken = response.data.token;
    console.log('Staff user roles:', response.data.roles);
    console.log('Staff user departments:', response.data.departments);
    logResult('POST', '/api/auth/login (staff)', true);
    return true;
  } catch (error) {
    logResult('POST', '/api/auth/login (staff)', false, error);
    return false;
  }
}

// Test fetching orders
async function testFetchOrders() {
  if (!authToken) {
    logResult('GET', '/api/staff/orders', false, 'No auth token available');
    return false;
  }

  try {
    // Fetch a list of orders
    const response = await axios.get(
      `${API_URL}/api/staff/orders`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data && response.data.length > 0) {
      testOrderToken = response.data[0].token;
      console.log('Test order token:', testOrderToken);
    }
    
    logResult('GET', '/api/staff/orders', true);
    return true;
  } catch (error) {
    logResult('GET', '/api/staff/orders', false, error);
    return false;
  }
}

// Test fetching a specific order
async function testFetchOrder() {
  if (!authToken || !testOrderToken) {
    logResult('GET', '/api/staff/orders/:token', false, 'No auth token or order token available');
    return false;
  }

  try {
    // Fetch a specific order
    const response = await axios.get(
      `${API_URL}/api/staff/orders/${testOrderToken}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    logResult('GET', `/api/staff/orders/${testOrderToken}`, true);
    return true;
  } catch (error) {
    logResult('GET', `/api/staff/orders/${testOrderToken}`, false, error);
    return false;
  }
}

// Test updating raw material for an order
async function testUpdateRawMaterial() {
  if (!authToken || !testOrderToken) {
    logResult('POST', '/api/staff/orders/raw-material/:token', false, 'No auth token or order token available');
    return false;
  }

  try {
    // Update raw material for an order
    const response = await axios.post(
      `${API_URL}/api/staff/orders/raw-material/${testOrderToken}`,
      {
        materials: [
          {
            materialName: 'Test Material',
            quantity: 10,
            totalPrice: 1000
          }
        ]
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    logResult('POST', `/api/staff/orders/raw-material/${testOrderToken}`, true);
    return true;
  } catch (error) {
    logResult('POST', `/api/staff/orders/raw-material/${testOrderToken}`, false, error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🔍 TESTING STAFF API FUNCTIONALITY');
  console.log(`📡 API URL: ${API_URL}\n`);
  
  // Test staff login
  const loginSuccess = await testStaffLogin();
  
  // Only proceed with other tests if login was successful
  if (loginSuccess) {
    // Test fetching orders
    await testFetchOrders();
    
    // Test fetching a specific order
    await testFetchOrder();
    
    // Test updating raw material for an order
    await testUpdateRawMaterial();
  }
  
  console.log('\n✨ STAFF API TESTS COMPLETED');
}

// Run the tests
runTests();