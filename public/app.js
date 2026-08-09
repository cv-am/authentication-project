
const API_BASE_URL = 'http://localhost:1111/api';

const alertBox = document.getElementById('alertBox');
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');

const updateName = document.getElementById('updateName');
const updateUsername = document.getElementById('updateUsername');
const updateEmail = document.getElementById('updateEmail');

function showAlert(message, type = 'info') {
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type}`;
}

function hideAlert() {
  alertBox.className = 'alert-box hidden';
  alertBox.textContent = '';
}

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  hideAlert();
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  hideAlert();
});

// Registration
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, username, email, password })
    });
    const result = await res.json();

    if (res.ok && result.message.includes('successfully')) {
      showAlert(result.message, 'success');
      setTimeout(() => loginTab.click(), 1200);
    } else {
      showAlert(result.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showAlert('Server connection error', 'error');
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();

    if (res.ok && result.message.includes('logged in')) {
      showAlert(result.message, 'success');
      setTimeout(loadDashboard, 800);
    } else {
      showAlert(result.message || 'Login failed', 'error');
    }
  } catch (err) {
    showAlert('Server connection error', 'error');
  }
});

// Load Dashboard
async function loadDashboard() {
  hideAlert();
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, { 
      method: 'GET',
      credentials: 'include' });
    const result = await res.json();

    if (res.ok && result.profile) {
      const user = result.profile;
      profileName.textContent = user.name;
      profileUsername.textContent = user.username;
      profileEmail.textContent = user.email;

      updateName.value = user.name;
      updateUsername.value = user.username;
      updateEmail.value = user.email;

      authContainer.classList.add('hidden');
      dashboardContainer.classList.remove('hidden');
    } else {
      authContainer.classList.remove('hidden');
      dashboardContainer.classList.add('hidden');
    }
  } catch (err) {
    authContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  }
}

// Update Profile
document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const name = updateName.value.trim();
  const username = updateUsername.value.trim();
  const email = updateEmail.value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/profile/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, username, email })
    });
    const result = await res.json();

    if (res.ok && result.message.includes('successfully')) {
      showAlert(result.message, 'success');
      loadDashboard();
    } else {
      showAlert(result.message || 'Update failed', 'error');
    }
  } catch (err) {
    showAlert('Failed to update profile', 'error');
  }
});

// Change Password
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const currentPass = document.getElementById('currentPass').value;
  const newPass = document.getElementById('newPass').value;

  try {
    const res = await fetch(`${API_BASE_URL}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPass, newPass })
    });
    const result = await res.json();

    if (res.ok && result.message.includes('successfully')) {
      showAlert(result.message, 'success');
      setTimeout(() => {
        dashboardContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
      }, 1500);
    } else {
      showAlert(result.message || 'Password change failed', 'error');
    }
  } catch (err) {
    showAlert('Failed to change password', 'error');
  }
});

// Delete Account
document.getElementById('deleteAccountForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const password = document.getElementById('deleteConfirmPass').value;

  try {
    const res = await fetch(`${API_BASE_URL}/profile/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    });
    const result = await res.json();

    if (res.ok && (result.message.includes('Removed') || result.message.includes('successfully'))) {
      showAlert(result.message, 'success');
      setTimeout(() => {
        dashboardContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
      }, 1500);
    } else {
      showAlert(result.message || 'Account removal failed', 'error');
    }
  } catch (err) {
    showAlert('Failed to remove account', 'error');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE_URL}/logout`, { credentials: 'include' });
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    loginForm.reset();
    registerForm.reset();
    showAlert('Logged out successfully', 'info');
  } catch (err) {
    showAlert('Logout failed', 'error');
  }
});

// Auto-check login state on page load
loadDashboard();