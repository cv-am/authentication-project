/**
 * AuthShield - Client Frontend Application
 * Interacts with Node.js / Express Auth API (/api/v1/auth)
 */

// State Management
const state = {
  currentEmail: '',
  cooldownTimer: null,
  cooldownSecondsLeft: 0,
  apiBaseUrl: localStorage.getItem('auth_api_base_url') || ''
};

// DOM Elements
const elements = {
  // Tabs
  registerTabBtn: document.getElementById('registerTabBtn'),
  verifyTabBtn: document.getElementById('verifyTabBtn'),
  resendTabBtn: document.getElementById('resendTabBtn'),
  
  // Panels
  registerPanel: document.getElementById('registerPanel'),
  verifyPanel: document.getElementById('verifyPanel'),
  resendPanel: document.getElementById('resendPanel'),
  successPanel: document.getElementById('successPanel'),

  // Forms
  registerForm: document.getElementById('registerForm'),
  verifyForm: document.getElementById('verifyForm'),
  resendForm: document.getElementById('resendForm'),

  // Register Form Inputs
  regFirstName: document.getElementById('regFirstName'),
  regLastName: document.getElementById('regLastName'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  regPasswordToggle: document.getElementById('regPasswordToggle'),
  registerSubmitBtn: document.getElementById('registerSubmitBtn'),
  strengthFill: document.getElementById('strengthFill'),
  strengthText: document.getElementById('strengthText'),

  // Verify Form Inputs
  verifyEmail: document.getElementById('verifyEmail'),
  otpDigits: Array.from(document.querySelectorAll('.otp-digit')),
  verifySubmitBtn: document.getElementById('verifySubmitBtn'),
  quickResendBtn: document.getElementById('quickResendBtn'),
  quickResendText: document.getElementById('quickResendText'),

  // Resend Form Inputs
  resendEmail: document.getElementById('resendEmail'),
  resendSubmitBtn: document.getElementById('resendSubmitBtn'),

  // Success Panel Elements
  successEmailText: document.getElementById('successEmailText'),
  successRegisterAnotherBtn: document.getElementById('successRegisterAnotherBtn'),

  // Cross-panel links
  goToVerifyBtn: document.getElementById('goToVerifyBtn'),
  goToVerifyFromResendBtn: document.getElementById('goToVerifyFromResendBtn'),

  // Alert Box & Toast
  alertBox: document.getElementById('alertBox'),
  alertTitle: document.getElementById('alertTitle'),
  alertList: document.getElementById('alertList'),
  alertCloseBtn: document.getElementById('alertCloseBtn'),
  toastContainer: document.getElementById('toastContainer'),

  // API Status & Settings
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  customApiUrl: document.getElementById('customApiUrl'),
  testApiBtn: document.getElementById('testApiBtn')
};

// ==========================================
// API Helpers
// ==========================================

function getApiBaseUrl() {
  const custom = elements.customApiUrl ? elements.customApiUrl.value.trim() : '';
  if (custom) return custom.replace(/\/+$/, '');

  const stored = localStorage.getItem('auth_api_base_url');
  if (stored) return stored.replace(/\/+$/, '');

  // If page is served from same origin (e.g., Express static files)
  if (window.location.origin && window.location.origin !== 'null' && !window.location.protocol.startsWith('file')) {
    return window.location.origin;
  }
  
  // Default fallback for local standalone execution
  return 'http://localhost:1111';
}

async function checkApiHealth() {
  const baseUrl = getApiBaseUrl();
  setApiStatus('checking', 'Checking API...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      setApiStatus('online', 'API Live');
      return true;
    } else {
      setApiStatus('offline', 'API Error');
      return false;
    }
  } catch (error) {
    setApiStatus('offline', 'API Offline');
    return false;
  }
}

function setApiStatus(status, label) {
  elements.apiStatusBadge.className = `api-status ${status}`;
  elements.apiStatusBadge.querySelector('.status-label').textContent = label;
}

// ==========================================
// Tab Switching
// ==========================================

const allTabs = [
  { btn: elements.registerTabBtn, panel: elements.registerPanel },
  { btn: elements.verifyTabBtn, panel: elements.verifyPanel },
  { btn: elements.resendTabBtn, panel: elements.resendPanel }
];

function switchTab(targetBtn, targetPanel) {
  hideAlert();

  allTabs.forEach(({ btn, panel }) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
    panel.classList.remove('active');
  });

  elements.successPanel.classList.remove('active');

  if (targetBtn && targetPanel) {
    targetBtn.classList.add('active');
    targetBtn.setAttribute('aria-selected', 'true');
    targetPanel.classList.add('active');
  }
}

// Event Listeners for Tab Navigation
elements.registerTabBtn.addEventListener('click', () => switchTab(elements.registerTabBtn, elements.registerPanel));
elements.verifyTabBtn.addEventListener('click', () => switchTab(elements.verifyTabBtn, elements.verifyPanel));
elements.resendTabBtn.addEventListener('click', () => switchTab(elements.resendTabBtn, elements.resendPanel));

elements.goToVerifyBtn.addEventListener('click', () => {
  if (elements.regEmail.value.trim()) {
    elements.verifyEmail.value = elements.regEmail.value.trim();
  }
  switchTab(elements.verifyTabBtn, elements.verifyPanel);
});

elements.goToVerifyFromResendBtn.addEventListener('click', () => {
  if (elements.resendEmail.value.trim()) {
    elements.verifyEmail.value = elements.resendEmail.value.trim();
  }
  switchTab(elements.verifyTabBtn, elements.verifyPanel);
});

elements.successRegisterAnotherBtn.addEventListener('click', () => {
  elements.registerForm.reset();
  updatePasswordStrength('');
  switchTab(elements.registerTabBtn, elements.registerPanel);
});

// ==========================================
// Alert & Toast Notifications
// ==========================================

function showAlert(title, errors = [], type = 'error') {
  elements.alertBox.className = `alert-box ${type}`;
  elements.alertTitle.textContent = title;
  elements.alertList.innerHTML = '';

  if (Array.isArray(errors) && errors.length > 0) {
    errors.forEach(err => {
      const li = document.createElement('li');
      li.textContent = typeof err === 'string' ? err : (err.msg || err.message || JSON.stringify(err));
      elements.alertList.appendChild(li);
    });
    elements.alertList.classList.remove('hidden');
  } else {
    elements.alertList.classList.add('hidden');
  }

  elements.alertBox.classList.remove('hidden');
}

function hideAlert() {
  elements.alertBox.classList.add('hidden');
  elements.alertTitle.textContent = '';
  elements.alertList.innerHTML = '';
}

elements.alertCloseBtn.addEventListener('click', hideAlert);

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ==========================================
// Button Loading State
// ==========================================

function setButtonLoading(button, isLoading, defaultText) {
  const textSpan = button.querySelector('.btn-text');
  const loaderSpan = button.querySelector('.btn-loader');

  if (isLoading) {
    button.disabled = true;
    if (textSpan) textSpan.classList.add('hidden');
    if (loaderSpan) loaderSpan.classList.remove('hidden');
  } else {
    button.disabled = false;
    if (textSpan) {
      textSpan.classList.remove('hidden');
      if (defaultText) textSpan.textContent = defaultText;
    }
    if (loaderSpan) loaderSpan.classList.add('hidden');
  }
}

// ==========================================
// Password Strength & Toggle
// ==========================================

elements.regPassword.addEventListener('input', (e) => {
  updatePasswordStrength(e.target.value);
});

elements.regPasswordToggle.addEventListener('click', () => {
  const isPass = elements.regPassword.type === 'password';
  elements.regPassword.type = isPass ? 'text' : 'password';
  elements.regPasswordToggle.innerHTML = isPass
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
});

function updatePasswordStrength(password) {
  if (!password) {
    elements.strengthFill.className = 'strength-fill';
    elements.strengthFill.style.width = '0%';
    elements.strengthText.textContent = 'Password must be at least 8 characters';
    elements.strengthText.style.color = 'var(--text-muted)';
    return;
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length < 8) {
    elements.strengthFill.className = 'strength-fill weak';
    elements.strengthText.textContent = `Too short (${password.length}/8 characters)`;
    elements.strengthText.style.color = 'var(--color-error)';
  } else if (score <= 2) {
    elements.strengthFill.className = 'strength-fill weak';
    elements.strengthText.textContent = 'Weak password - add numbers or symbols';
    elements.strengthText.style.color = 'var(--color-error)';
  } else if (score === 3) {
    elements.strengthFill.className = 'strength-fill medium';
    elements.strengthText.textContent = 'Good password';
    elements.strengthText.style.color = 'var(--color-warning)';
  } else {
    elements.strengthFill.className = 'strength-fill strong';
    elements.strengthText.textContent = 'Strong password';
    elements.strengthText.style.color = 'var(--color-success)';
  }
}

// ==========================================
// 6-Digit OTP Inputs Interaction
// ==========================================

elements.otpDigits.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const val = e.target.value;
    // Allow only single numeric digit
    if (!/^[0-9]$/.test(val)) {
      e.target.value = '';
      e.target.classList.remove('filled');
      return;
    }
    e.target.classList.add('filled');

    // Move to next input if available
    if (index < elements.otpDigits.length - 1) {
      elements.otpDigits[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (!e.target.value && index > 0) {
        elements.otpDigits[index - 1].focus();
        elements.otpDigits[index - 1].value = '';
        elements.otpDigits[index - 1].classList.remove('filled');
      } else {
        e.target.value = '';
        e.target.classList.remove('filled');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      elements.otpDigits[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < elements.otpDigits.length - 1) {
      elements.otpDigits[index + 1].focus();
    }
  });

  // Handle Paste
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
    const digits = pasteData.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      digits.split('').forEach((d, i) => {
        if (elements.otpDigits[i]) {
          elements.otpDigits[i].value = d;
          elements.otpDigits[i].classList.add('filled');
        }
      });
      const nextIndex = Math.min(digits.length, elements.otpDigits.length - 1);
      elements.otpDigits[nextIndex].focus();
    }
  });
});

function getOtpValue() {
  return elements.otpDigits.map(inp => inp.value.trim()).join('');
}

function clearOtpInputs() {
  elements.otpDigits.forEach(inp => {
    inp.value = '';
    inp.classList.remove('filled');
  });
}

// ==========================================
// Resend OTP Cooldown Timer
// ==========================================

function startResendCooldown(seconds = 60) {
  clearInterval(state.cooldownTimer);
  state.cooldownSecondsLeft = seconds;

  elements.quickResendBtn.disabled = true;
  elements.quickResendText.textContent = `Resend in ${state.cooldownSecondsLeft}s`;

  state.cooldownTimer = setInterval(() => {
    state.cooldownSecondsLeft--;
    if (state.cooldownSecondsLeft <= 0) {
      clearInterval(state.cooldownTimer);
      elements.quickResendBtn.disabled = false;
      elements.quickResendText.textContent = 'Resend OTP';
    } else {
      elements.quickResendText.textContent = `Resend in ${state.cooldownSecondsLeft}s`;
    }
  }, 1000);
}

// ==========================================
// Form Submission Handlers
// ==========================================

// 1. REGISTER
elements.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const firstName = elements.regFirstName.value.trim();
  const lastName = elements.regLastName.value.trim();
  const email = elements.regEmail.value.trim();
  const password = elements.regPassword.value;

  // Client Validation
  const errors = [];
  if (firstName.length < 3) errors.push('First name must be at least 3 characters long');
  if (lastName.length < 3) errors.push('Last name must be at least 3 characters long');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address');
  if (password.length < 8) errors.push('Password must be at least 8 characters long');

  if (errors.length > 0) {
    showAlert('Please resolve validation errors:', errors, 'error');
    return;
  }

  setButtonLoading(elements.registerSubmitBtn, true);

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    const result = await res.json();

    if (res.status === 201 && result.success) {
      state.currentEmail = email;
      showToast('Registration successful! Please check your email for OTP.', 'success');
      
      // Auto prefill verification email and switch to OTP tab
      elements.verifyEmail.value = email;
      elements.resendEmail.value = email;
      clearOtpInputs();
      switchTab(elements.verifyTabBtn, elements.verifyPanel);
      
      startResendCooldown(60);
      setTimeout(() => elements.otpDigits[0].focus(), 300);
    } else {
      handleApiError(result, res.status);
    }
  } catch (error) {
    showAlert('Server Connection Error', ['Could not reach backend API. Ensure server is running and accessible.'], 'error');
  } finally {
    setButtonLoading(elements.registerSubmitBtn, false, 'Register & Send OTP');
  }
});

// 2. VERIFY EMAIL (OTP)
elements.verifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const email = elements.verifyEmail.value.trim();
  const otp = getOtpValue();

  // Client Validation
  const errors = [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address');
  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) errors.push('Please enter the full 6-digit numeric OTP');

  if (errors.length > 0) {
    showAlert('Invalid Verification Details:', errors, 'error');
    return;
  }

  setButtonLoading(elements.verifySubmitBtn, true);

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      showToast('Email verified successfully!', 'success');
      elements.successEmailText.textContent = `Account associated with ${email} is now verified.`;
      
      // Show Success View
      allTabs.forEach(({ btn, panel }) => {
        btn.classList.remove('active');
        panel.classList.remove('active');
      });
      elements.successPanel.classList.add('active');
      
      elements.verifyForm.reset();
      clearOtpInputs();
    } else {
      handleApiError(result, res.status);
    }
  } catch (error) {
    showAlert('Server Connection Error', ['Failed to verify OTP with backend.'], 'error');
  } finally {
    setButtonLoading(elements.verifySubmitBtn, false, 'Verify Email');
  }
});

// 3. QUICK RESEND OTP (from Verify Panel)
elements.quickResendBtn.addEventListener('click', async () => {
  const email = elements.verifyEmail.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert('Email Required', ['Please enter your registered email address first to resend OTP.'], 'error');
    elements.verifyEmail.focus();
    return;
  }
  await sendResendRequest(email, elements.quickResendBtn);
});

// 4. STANDALONE RESEND FORM
elements.resendForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const email = elements.resendEmail.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert('Invalid Email', ['Please enter a valid email address.'], 'error');
    return;
  }

  await sendResendRequest(email, elements.resendSubmitBtn, true);
});

async function sendResendRequest(email, triggerButton, redirectAfter = false) {
  setButtonLoading(triggerButton, true);

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      showToast(result.data?.message || 'New OTP sent to your email!', 'success');
      startResendCooldown(60);

      if (redirectAfter) {
        elements.verifyEmail.value = email;
        clearOtpInputs();
        switchTab(elements.verifyTabBtn, elements.verifyPanel);
        setTimeout(() => elements.otpDigits[0].focus(), 300);
      }
    } else {
      handleApiError(result, res.status);
    }
  } catch (error) {
    showAlert('Server Connection Error', ['Failed to request OTP resend.'], 'error');
  } finally {
    setButtonLoading(triggerButton, false);
  }
}

// ==========================================
// Centralized API Error Handler
// ==========================================

function handleApiError(result, statusCode) {
  // Express-Validator Errors [{ msg, path, ... }]
  if (result.errors && Array.isArray(result.errors)) {
    const errorMessages = result.errors.map(err => err.msg || `${err.path}: Invalid value`);
    showAlert('Validation Failed', errorMessages, 'error');
    return;
  }

  // ApiError { success: false, code: "...", message: "..." }
  if (result.message) {
    let errorTitle = 'Operation Failed';
    if (result.code) {
      errorTitle = formatErrorCode(result.code);
    }
    showAlert(errorTitle, [result.message], 'error');
    return;
  }

  showAlert(`Error (HTTP ${statusCode})`, ['An unexpected server error occurred.'], 'error');
}

function formatErrorCode(code) {
  return code
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ==========================================
// API Settings & Health Check
// ==========================================

if (elements.customApiUrl) {
  const savedUrl = localStorage.getItem('auth_api_base_url');
  if (savedUrl) elements.customApiUrl.value = savedUrl;

  elements.customApiUrl.addEventListener('change', () => {
    const val = elements.customApiUrl.value.trim();
    if (val) {
      localStorage.setItem('auth_api_base_url', val);
    } else {
      localStorage.removeItem('auth_api_base_url');
    }
    checkApiHealth();
  });
}

elements.testApiBtn.addEventListener('click', async () => {
  const isHealthy = await checkApiHealth();
  if (isHealthy) {
    showToast('Backend API is healthy and reachable!', 'success');
  } else {
    showToast('Backend API is not reachable at the specified URL', 'error');
  }
});

elements.apiStatusBadge.addEventListener('click', checkApiHealth);

// ==========================================
// Initial Page Load
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  checkApiHealth();
});