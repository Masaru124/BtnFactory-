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

const staffLoginData = {
  username: 'staff',
  password: 'staff123'
};

// Invalid test data for error handling tests
const invalidRawMaterials = {
  materials: [
    {
      // Missing materialName
      quantity: 3,
      totalPrice: 300
    }
  ]
};

const invalidCastingProcess = {
  // Invalid data types for numeric fields
  sheetsWasted: "not-a-number",
  sheetsMade: "invalid"
};

const testOrder = {
  companyName: 'Test Staff Company',
  poNumber: `STAFF-TEST-${Date.now()}`,
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

const testRawMaterials = {
  materials: [
    {
      materialName: 'Brass',
      quantity: 3,
      totalPrice: 300
    }
  ]
};

const testCastingProcess = {
  rawMaterialsUsed: 10,
  sheetsMade: 50,
  sheetsWasted: 2,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString()
};

const testPolishProcess = {
  totalSheets: 48,
  polishDate: new Date().toISOString(),
  receivedDate: new Date().toISOString(),
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  GrossWeight: 120,
  WtinKg: 0.12
};

const testTurningProcess = {
  totalSheets: 48,
  turningDate: new Date().toISOString(),
  receivedDate: new Date().toISOString(),
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  GrossWeight: 115,
  WtinKg: 0.115,
  FinishThickness: '1.8mm' // This is a string measurement, not a number
};

const updatedOrderData = {
  status: 'In Progress',
  rate: 12.5,
  quantity: 150
};

// Helper function for API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = `${API_URL}/api${endpoint}`;
    
    let response;
    if (method === 'get') {
      response = await axios.get(url, config);
    } else if (method === 'post') {
      response = await axios.post(url, data, config);
    } else if (method === 'put') {
      response = await axios.put(url, data, config);
    } else if (method === 'delete') {
      response = await axios.delete(url, config);
    }
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function loginAdmin() {
  console.log('\n🔑 Testing admin login...');
  console.log('🔍 Sending request to:', `${API_URL}/api/auth/login`);
  const result = await apiRequest('post', '/auth/login', loginData);
  
  if (result.success) {
    console.log('🔍 Login response:', result.data);
    authToken = result.data.token;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.error('❌ Admin login failed:', result.error);
    console.log('🔍 Error details:', result.status, result.error);
    return false;
  }
}

async function createTestOrder() {
  console.log('\n📝 Testing order creation...');
  const result = await apiRequest('post', '/admin/orders', testOrder, authToken);
  
  if (result.success) {
    testOrderToken = result.data.token;
    console.log('✅ Order created successfully');
    console.log('🔖 Order token:', testOrderToken);
    console.log('📊 Order data:', JSON.stringify(result.data.order, null, 2));
    return true;
  } else {
    console.error('❌ Order creation failed:', result.error);
    return false;
  }
}

async function testAdminUpdateOrder() {
  console.log(`\n✏️ Testing admin order update for token: ${testOrderToken}...`);
  const result = await apiRequest('put', `/admin/orders/${testOrderToken}`, updatedOrderData, authToken);
  
  if (result.success) {
    console.log('✅ Order updated successfully');
    console.log('📊 Updated order data:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.error('❌ Order update failed:', result.error);
    return false;
  }
}

async function testAddRawMaterials() {
  console.log(`\n🧪 Testing adding raw materials to order: ${testOrderToken}...`);
  const result = await apiRequest('post', `/staff/orders/raw-material/${testOrderToken}`, testRawMaterials, authToken);
  
  if (result.success) {
    console.log('✅ Raw materials added successfully');
    console.log('📊 Raw materials data:', JSON.stringify(result.data.rawMaterials, null, 2));
    return true;
  } else {
    console.error('❌ Adding raw materials failed:', result.error);
    return false;
  }
}

async function testUpdateCastingProcess() {
  console.log(`\n🧪 Testing updating casting process for order: ${testOrderToken}...`);
  const result = await apiRequest('put', `/staff/orders/casting-process/${testOrderToken}`, testCastingProcess, authToken);
  
  if (result.success) {
    console.log('✅ Casting process updated successfully');
    console.log('📊 Casting process data:', JSON.stringify(result.data.castingProcess, null, 2));
    return true;
  } else {
    console.error('❌ Updating casting process failed:', result.error);
    return false;
  }
}

async function testUpdatePolishProcess() {
  console.log(`\n🧪 Testing updating polish process for order: ${testOrderToken}...`);
  const result = await apiRequest('put', `/staff/orders/polish-process/${testOrderToken}`, testPolishProcess, authToken);
  
  if (result.success) {
    console.log('✅ Polish process updated successfully');
    console.log('📊 Polish process data:', JSON.stringify(result.data.polishProcess, null, 2));
    return true;
  } else {
    console.error('❌ Updating polish process failed:', result.error);
    return false;
  }
}

async function testUpdateTurningProcess() {
  console.log(`\n🧪 Testing updating turning process for order: ${testOrderToken}...`);
  const result = await apiRequest('put', `/staff/orders/turning-process/${testOrderToken}`, testTurningProcess, authToken);
  
  if (result.success) {
    console.log('✅ Turning process updated successfully');
    console.log('📊 Turning process data:', JSON.stringify(result.data.turningProcess, null, 2));
    return true;
  } else {
    console.error('❌ Updating turning process failed:', result.error);
    return false;
  }
}

async function testGetOrderByToken() {
  console.log(`\n🧪 Testing get order by token: ${testOrderToken}...`);
  const result = await apiRequest('get', `/staff/orders/${testOrderToken}`, null, authToken);
  
  if (result.success) {
    console.log('✅ Order retrieved successfully');
    console.log('📊 Order data:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.error('❌ Getting order failed:', result.error);
    return false;
  }
}

async function loginStaff() {
  console.log('\n🔑 Testing staff login...');
  console.log('🔍 Sending request to:', `${API_URL}/api/auth/login`);
  const result = await apiRequest('post', '/auth/login', staffLoginData);
  
  if (result.success) {
    console.log('🔍 Login response:', result.data);
    authToken = result.data.token;
    console.log('✅ Staff login successful');
    return true;
  } else {
    console.error('❌ Staff login failed:', result.error);
    console.log('🔍 Error details:', result.status, result.error);
    return false;
  }
}

async function testAuthenticationRequirement() {
  console.log('\n🔒 Testing authentication requirement...');
  // Try to access staff route without token
  const result = await apiRequest('get', `/staff/orders/${testOrderToken}`);
  
  if (!result.success && result.status === 401) {
    console.log('✅ Authentication requirement verified - Unauthorized access properly rejected');
    return true;
  } else {
    console.error('❌ Authentication test failed - Route accessible without token');
    return false;
  }
}

async function testInvalidRawMaterials() {
  console.log(`\n🧪 Testing error handling for invalid raw materials...`);
  const result = await apiRequest('post', `/staff/orders/raw-material/${testOrderToken}`, invalidRawMaterials, authToken);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Error handling verified - Invalid raw materials properly rejected');
    console.log('🔍 Error response:', result.error);
    return true;
  } else {
    console.error('❌ Error handling test failed - Invalid raw materials were accepted');
    return false;
  }
}

async function testInvalidCastingProcess() {
  console.log(`\n🧪 Testing error handling for invalid casting process...`);
  const result = await apiRequest('put', `/staff/orders/casting-process/${testOrderToken}`, invalidCastingProcess, authToken);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Error handling verified - Invalid casting process properly rejected');
    console.log('🔍 Error response:', result.error);
    return true;
  } else {
    console.error('❌ Error handling test failed - Invalid casting process was accepted');
    return false;
  }
}

async function testNonExistentOrder() {
  console.log(`\n🧪 Testing error handling for non-existent order...`);
  const result = await apiRequest('get', `/staff/orders/NONEXISTENT`, null, authToken);
  
  if (!result.success && result.status === 404) {
    console.log('✅ Error handling verified - Non-existent order properly rejected');
    console.log('🔍 Error response:', result.error);
    return true;
  } else {
    console.error('❌ Error handling test failed - Non-existent order did not return 404');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting staff routes and admin PUT route tests...');
  
  // Login as admin
  if (!await loginAdmin()) {
    console.error('❌ Tests aborted: Admin login failed');
    return;
  }
  
  // Create a test order
  if (!await createTestOrder()) {
    console.error('❌ Tests aborted: Order creation failed');
    return;
  }
  
  // Test admin PUT route
  await testAdminUpdateOrder();
  
  // Test authentication requirement
  await testAuthenticationRequirement();
  
  // Login as staff
  if (!await loginStaff()) {
    console.error('❌ Tests aborted: Staff login failed');
    return;
  }
  
  // Test staff routes
  await testAddRawMaterials();
  await testUpdateCastingProcess();
  await testUpdatePolishProcess();
  await testUpdateTurningProcess();
  await testGetOrderByToken();
  
  // Test error handling
  await testInvalidRawMaterials();
  await testInvalidCastingProcess();
  await testNonExistentOrder();
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests();