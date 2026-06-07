/**
 * CampusTrack API Integration Tests
 * Run with: node tests/api.test.js
 */

process.env.PORT = 3001; // Run tests on a separate port
process.env.NODE_ENV = 'test';

const { exec } = require('child_process');
const path = require('path');

// Dynamically start server
console.log('Starting CampusTrack server on port 3001 for integration testing...');
const serverPath = path.join(__dirname, '..', 'src', 'backend', 'server.js');
const serverProcess = require('child_process').fork(serverPath, [], {
  env: { ...process.env }
});

// Helper for waiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  // Give server 2 seconds to initialize SQLite database and start listening
  await sleep(2000);

  const BASE_URL = 'http://localhost:3001/api';
  let user1Token = '';
  let user2Token = '';
  let adminToken = '';
  let lostItemId = null;
  let foundItemId = null;

  try {
    console.log('\n--- 🧪 TEST 1: User Registration ---');
    
    // Register User 1 (Owner)
    const regRes1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Owner',
        email: 'owner@aau.edu.et',
        password: 'password123'
      })
    });
    const regData1 = await regRes1.json();
    console.log('Register User 1 status:', regRes1.status, regData1.message || regData1.error);
    if (regRes1.status !== 201 && !regData1.error.includes('already registered')) {
      throw new Error('User 1 registration failed');
    }

    // Register User 2 (Finder)
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Finder',
        email: 'finder@aau.edu.et',
        password: 'password123'
      })
    });
    const regData2 = await regRes2.json();
    console.log('Register User 2 status:', regRes2.status, regData2.message || regData2.error);
    if (regRes2.status !== 201 && !regData2.error.includes('already registered')) {
      throw new Error('User 2 registration failed');
    }


    console.log('\n--- 🧪 TEST 2: User Login & Session ---');
    
    // Login User 1
    const loginRes1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@aau.edu.et',
        password: 'password123'
      })
    });
    const loginData1 = await loginRes1.json();
    console.log('Login User 1 status:', loginRes1.status);
    if (loginRes1.status !== 200) throw new Error('User 1 login failed');
    user1Token = loginData1.token;

    // Login User 2
    const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'finder@aau.edu.et',
        password: 'password123'
      })
    });
    const loginData2 = await loginRes2.json();
    console.log('Login User 2 status:', loginRes2.status);
    if (loginRes2.status !== 200) throw new Error('User 2 login failed');
    user2Token = loginData2.token;

    // Login Admin
    const loginResAdmin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@aau.edu.et',
        password: 'adminpassword'
      })
    });
    const loginDataAdmin = await loginResAdmin.json();
    console.log('Login Admin status:', loginResAdmin.status);
    if (loginResAdmin.status !== 200) throw new Error('Admin login failed');
    adminToken = loginDataAdmin.token;


    console.log('\n--- 🧪 TEST 3: Fetching Categories ---');
    const catRes = await fetch(`${BASE_URL}/items/categories`);
    const categories = await catRes.json();
    console.log('Categories fetched count:', categories.length);
    if (categories.length === 0) throw new Error('Failed to fetch categories');


    console.log('\n--- 🧪 TEST 4: Posting a Lost Item ---');
    // User 1 reports lost item
    const postRes1 = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        type: 'lost',
        title: 'Red Dell XPS Laptop',
        category_id: 1, // Electronics
        location: 'AAU Library Floor 2',
        item_date: '2026-06-05',
        description: 'Red cover, sticker of Git on top.'
      })
    });
    const postData1 = await postRes1.json();
    console.log('Post Lost Item status:', postRes1.status, postData1.message);
    if (postRes1.status !== 201) throw new Error('Failed to post lost item');
    lostItemId = postData1.item.id;


    console.log('\n--- 🧪 TEST 5: Posting a Matching Found Item ---');
    // User 2 reports matching found item (category Electronics, keyword Laptop, location Library)
    const postRes2 = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user2Token}`
      },
      body: JSON.stringify({
        type: 'found',
        title: 'Dell XPS Laptop Found',
        category_id: 1, // Electronics
        location: 'AAU Library',
        item_date: '2026-06-06',
        description: 'Found a red dell laptop in the Library library.'
      })
    });
    const postData2 = await postRes2.json();
    console.log('Post Found Item status:', postRes2.status, postData2.message);
    if (postRes2.status !== 201) throw new Error('Failed to post found item');
    foundItemId = postData2.item.id;


    console.log('\n--- 🧪 TEST 6: Match Engine Verification (Notifications) ---');
    // Wait for match engine calculations to insert rows
    await sleep(1000);

    // Retrieve notifications for User 1 (lost item owner)
    const notifRes1 = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const notifs1 = await notifRes1.json();
    console.log('User 1 unread notifications count:', notifs1.length);
    console.log('Latest message:', notifs1[0]?.message);
    if (notifs1.length === 0) throw new Error('Match Engine failed to trigger notification alerts');


    console.log('\n--- 🧪 TEST 7: Advanced Filtering Search ---');
    const searchRes = await fetch(`${BASE_URL}/items?q=Dell&category_id=1&location=Library`);
    const searchResults = await searchRes.json();
    console.log('Search matches count:', searchResults.length);
    if (searchResults.length < 2) throw new Error('Search did not return both postings');
    console.log('Result titles:', searchResults.map(i => i.title).join(' | '));


    console.log('\n--- 🧪 TEST 8: Admin Statistics dashboard ---');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const stats = await statsRes.json();
    console.log('System metrics:', stats);
    if (stats.totalLost === undefined || stats.totalFound === undefined) {
      throw new Error('Admin stats call failed or returned incorrect schema');
    }


    console.log('\n--- 🧪 TEST 9: Status Lifecycle Update (Claimed) ---');
    const statusRes = await fetch(`${BASE_URL}/items/${lostItemId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({ status: 'claimed' })
    });
    const statusData = await statusRes.json();
    console.log('Update status status:', statusRes.status, statusData.message);
    if (statusRes.status !== 200) throw new Error('Failed to update status to claimed');

    // Confirm that search defaults to excluding claimed postings
    const activeSearchRes = await fetch(`${BASE_URL}/items?q=Dell`);
    const activeSearchResults = await activeSearchRes.json();
    console.log('Active search results count:', activeSearchResults.length);
    if (activeSearchResults.length !== 1) {
      throw new Error('Claimed postings should be hidden from active lists by default');
    }

    console.log('\n=================================================');
    console.log(' 🎉 SUCCESS: All CampusTrack API tests passed!');
    console.log('=================================================');
    terminateServer(0);

  } catch (error) {
    console.error('\n=================================================');
    console.error(' ❌ FAILURE: Test script failed due to error:');
    console.error(error.message);
    console.error('=================================================');
    terminateServer(1);
  }
}

function terminateServer(exitCode) {
  console.log('Terminating test server process...');
  serverProcess.kill();
  process.exit(exitCode);
}

runTests();
