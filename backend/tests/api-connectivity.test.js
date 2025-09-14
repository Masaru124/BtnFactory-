const axios = require('axios');
require('dotenv').config();

// API URL - Using the same one as frontend or from environment
const API_URL = process.env.API_URL || 'https://btnfactory.onrender.com';

// Test credentials - ONLY FOR TESTING
const TEST_USER = {
  username: 'test_api_user',
  password: 'Test@123'
};

let authToken = '';
let createdUserId = '';

// Helper function to log test results
const logResult = (method, endpoint, success, error = null) => {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${method} ${endpoint}`);
  if (error) {
    console.log(`  Error: ${error.message || error}`);
  }
};

// Test GET request
async function testGet() {
  try {
    // Test a public endpoint that doesn't require authentication
    const response = await axios.get(`${API_URL}/api/health`);
    logResult('GET', '/api/health', true);
    return true;
  } catch (error) {
    logResult('GET', '/api/health', false, error);
    return false;
  }
}

// Test POST request - Register a test user
async function testPost() {
  try {
    // Try to register a test user
    const response = await axios.post(`${API_URL}/api/auth/register`, TEST_USER);
    authToken = response.data.token;
    createdUserId = TEST_USER.username;
    logResult('POST', '/api/auth/register', true);
    return true;
  } catch (error) {
    // If user already exists, try to login instead
    if (error.response && error.response.status === 400) {
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, TEST_USER);
        authToken = loginResponse.data.token;
        createdUserId = TEST_USER.username;
        logResult('POST', '/api/auth/login', true);
        return true;
      } catch (loginError) {
        logResult('POST', '/api/auth/login', false, loginError);
        return false;
      }
    } else {
      logResult('POST', '/api/auth/register', false, error);
      return false;
    }
  }
}

// Test PUT request - Update user profile
async function testPut() {
  if (!authToken) {
    logResult('PUT', '/api/user/profile', false, 'No auth token available');
    return false;
  }

  try {
    // Update user profile
    const response = await axios.put(
      `${API_URL}/api/user/profile`,
      { fullName: 'API Test User Updated' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logResult('PUT', '/api/user/profile', true);
    return true;
  } catch (error) {
    logResult('PUT', '/api/user/profile', false, error);
    return false;
  }
}

// Test DELETE request - Delete test user
async function testDelete() {
  if (!authToken || !createdUserId) {
    logResult('DELETE', '/api/admin/users/:username', false, 'No auth token or user ID available');
    return false;
  }

  try {
    // Delete the test user (requires admin privileges)
    const response = await axios.delete(
      `${API_URL}/api/admin/users/${createdUserId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logResult('DELETE', `/api/admin/users/${createdUserId}`, true);
    return true;
  } catch (error) {
    // This might fail if the test user doesn't have admin privileges
    logResult('DELETE', `/api/admin/users/${createdUserId}`, false, error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🔍 TESTING API CONNECTIVITY');
  console.log(`📡 API URL: ${API_URL}\n`);
  
  // Test GET
  await testGet();
  
  // Test POST
  const postSuccess = await testPost();
  
  // Only proceed with PUT and DELETE if POST was successful
  if (postSuccess) {
    // Test PUT
    await testPut();
    
    // Test DELETE
    await testDelete();
  }
  
  console.log('\n✨ API CONNECTIVITY TESTS COMPLETED');
}

// Run the tests
runTests();