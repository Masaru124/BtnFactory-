const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000';
let authToken = '';
let testOrderToken = '';

// Test data
const loginData = {
  username: 'admin',
  password: 'admin123'
};

console.log('🔍 Using login credentials:', { username: loginData.username, password: loginData.password });

const testOrder = {
  companyName: 'Test Company',
  poNumber: `TEST-${Date.now()}`,
  poDate: new Date().toISOString(),
  casting: 'Metal',
  thickness: '2mm',
  holes: '4',
  boxType: 'Standard',
  rate: 10.5,
  toolNumber: 123,
  rawMaterials: [
    {
      materialName: 'Steel',
      quantity: 5,
      totalPrice: 500
    }
  ],
  quantity: 100
};

const updatedOrderData = {
  status: 'In Progress',
  rate: 12.5,
  quantity: 150,
  rawMaterials: [
    {
      materialName: 'Steel',
      quantity: 7,
      totalPrice: 700
    },
    {
      materialName: 'Brass',
      quantity: 3,
      totalPrice: 450
    }
  ]
};

// Helper function for API requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const config = { headers };
    
    let response;
    if (method === 'get') {
      response = await axios.get(`${API_URL}${endpoint}`, config);
    } else if (method === 'post') {
      response = await axios.post(`${API_URL}${endpoint}`, data, config);
    } else if (method === 'put') {
      response = await axios.put(`${API_URL}${endpoint}`, data, config);
    } else if (method === 'delete') {
      response = await axios.delete(`${API_URL}${endpoint}`, config);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : null
    };
  }
}

// Test functions
async function loginAdmin() {
  console.log('\n🔑 Testing admin login...');
  console.log('🔍 Sending request to:', `${API_URL}/api/auth/login`);
  const result = await apiRequest('post', '/api/auth/login', loginData);
  
  if (result.success) {
    console.log('🔍 Login response:', result.data);
    authToken = result.data.token;
    console.log('✅ Admin login successful');
    console.log(`🔒 Token: ${authToken.substring(0, 15)}...`);
    return true;
  } else {
    console.error('❌ Admin login failed:', result.error);
    console.log('🔍 Error details:', result.status, result.error);
    return false;
  }
}

async function createOrder() {
  console.log('\n📝 Testing order creation...');
  const result = await apiRequest('post', '/api/admin/orders', testOrder);
  
  if (result.success) {
    testOrderToken = result.data.token;
    console.log('✅ Order created successfully');
    console.log(`🔖 Order token: ${testOrderToken}`);
    console.log('📊 Order data:', JSON.stringify(result.data.order, null, 2));
    return true;
  } else {
    console.error('❌ Order creation failed:', result.error);
    return false;
  }
}

async function getOrders() {
  console.log('\n📋 Testing get all orders...');
  const result = await apiRequest('get', '/api/admin/orders');
  
  if (result.success) {
    console.log(`✅ Retrieved ${result.data.length} orders`);
    return true;
  } else {
    console.error('❌ Get orders failed:', result.error);
    return false;
  }
}

async function updateOrder() {
  if (!testOrderToken) {
    console.error('❌ Cannot update order: No order token available');
    return false;
  }
  
  console.log(`\n✏️ Testing order update for token: ${testOrderToken}...`);
  const result = await apiRequest('put', `/api/admin/orders/${testOrderToken}`, updatedOrderData);
  
  if (result.success) {
    console.log('✅ Order updated successfully');
    console.log('📊 Updated order data:', JSON.stringify(result.data.order, null, 2));
    return true;
  } else {
    console.error('❌ Order update failed:', result.error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting admin functionality tests...');
  
  // Login
  const loggedIn = await loginAdmin();
  if (!loggedIn) return;
  
  // Create order
  const orderCreated = await createOrder();
  if (!orderCreated) return;
  
  // Get all orders
  const ordersRetrieved = await getOrders();
  if (!ordersRetrieved) return;
  
  // Update order
  const orderUpdated = await updateOrder();
  if (!orderUpdated) return;
  
  console.log('\n🎉 All tests completed successfully!');
}

// Execute tests
runTests().catch(err => {
  console.error('❌ Test execution error:', err);
});