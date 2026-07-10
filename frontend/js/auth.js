/* ============================================
   AutoParts Pro - Authentication JavaScript
   ============================================ */

const API_BASE_URL = '/api';

// ============================================
// Helper Functions
// ============================================

function showErrorAlert(elementId, message) {
  const errorAlert = document.getElementById(elementId);
  if (errorAlert) {
    errorAlert.textContent = message;
    errorAlert.classList.add('show');
    setTimeout(() => {
      errorAlert.classList.remove('show');
    }, 5000);
  }
}

function showSuccessAlert(elementId, message) {
  const successAlert = document.getElementById(elementId);
  if (successAlert) {
    successAlert.textContent = message;
    successAlert.classList.add('show');
    setTimeout(() => {
      successAlert.classList.remove('show');
    }, 3000);
  }
}

function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearFieldError(fieldId) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

function clearAllErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => el.textContent = '');
  
  const alerts = document.querySelectorAll('.error-alert, .success-alert');
  alerts.forEach(alert => alert.classList.remove('show'));
}

function setLoading(formId, isLoading) {
  const form = document.getElementById(formId);
  const spinner = form.querySelector('.loading-spinner');
  const submitBtn = form.querySelector('.btn-submit');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
  } else {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
}

function saveAuthToken(token) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('tokenTimestamp', Date.now().toString());
}

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenTimestamp');
  localStorage.removeItem('currentUser');
}

function saveCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function isUserLoggedIn() {
  return !!getAuthToken();
}

// ============================================
// Validation Functions
// ============================================

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function validatePhone(phone) {
  if (!phone) return true; // Optional field
  const regex = /^[0-9\-\+\(\)\s]{9,}$/;
  return regex.test(phone);
}

// ============================================
// Register Function
// ============================================

async function handleRegister(e) {
  e.preventDefault();
  clearAllErrors();

  const form = document.getElementById('registerForm');
  const name = form.elements['name'].value.trim();
  const email = form.elements['email'].value.trim();
  const phone = form.elements['phone'].value.trim();
  const password = form.elements['password'].value;
  const confirmPassword = form.elements['confirmPassword'].value;
  const terms = form.elements['terms'].checked;

  // Validation
  let hasError = false;

  if (!name || name.length < 3) {
    showFieldError('name', 'กรุณากรอกชื่อ (อย่างน้อย 3 ตัวอักษร)');
    hasError = true;
  } else {
    clearFieldError('name');
  }

  if (!validateEmail(email)) {
    showFieldError('email', 'กรุณากรอกอีเมลให้ถูกต้อง');
    hasError = true;
  } else {
    clearFieldError('email');
  }

  if (phone && !validatePhone(phone)) {
    showFieldError('phone', 'เบอร์โทรศัพท์ไม่ถูกต้อง');
    hasError = true;
  } else {
    clearFieldError('phone');
  }

  if (!validatePassword(password)) {
    showFieldError('password', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    hasError = true;
  } else {
    clearFieldError('password');
  }

  if (password !== confirmPassword) {
    showFieldError('confirmPassword', 'รหัสผ่านไม่ตรงกัน');
    hasError = true;
  } else {
    clearFieldError('confirmPassword');
  }

  if (!terms) {
    showErrorAlert('errorAlert', 'กรุณายอมรับเงื่อนไขการใช้งาน');
    hasError = true;
  }

  if (hasError) return;

  setLoading('registerForm', true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'สมัครสมาชิกล้มเหลว');
    }

    // Save token and user data
    saveAuthToken(data.data.token);
    saveCurrentUser({
      id: data.data._id || data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role
    });

    showSuccessAlert('successAlert', 'สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนเส้นทาง...');
    
    // Redirect to home page after 2 seconds
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);

  } catch (error) {
    console.error('Register error:', error);
    showErrorAlert('errorAlert', error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
  } finally {
    setLoading('registerForm', false);
  }
}

// ============================================
// Login Function
// ============================================

async function handleLogin(e) {
  e.preventDefault();
  clearAllErrors();

  const form = document.getElementById('loginForm');
  const email = form.elements['email'].value.trim();
  const password = form.elements['password'].value;
  const rememberMe = form.elements['rememberMe']?.checked;

  // Validation
  let hasError = false;

  if (!validateEmail(email)) {
    showFieldError('email', 'กรุณากรอกอีเมลให้ถูกต้อง');
    hasError = true;
  } else {
    clearFieldError('email');
  }

  if (!password) {
    showFieldError('password', 'กรุณากรอกรหัสผ่าน');
    hasError = true;
  } else {
    clearFieldError('password');
  }

  if (hasError) return;

  setLoading('loginForm', true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'เข้าสู่ระบบล้มเหลว');
    }

    // Save token and user data
    saveAuthToken(data.data.token);
    saveCurrentUser({
      id: data.data._id || data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role
    });

    if (rememberMe) {
      localStorage.setItem('rememberEmail', email);
    }

    showSuccessAlert('successAlert', 'เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนเส้นทาง...');
    
    // Redirect to home page after 2 seconds
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);

  } catch (error) {
    console.error('Login error:', error);
    showErrorAlert('errorAlert', error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
  } finally {
    setLoading('loginForm', false);
  }
}

// ============================================
// Initialize remembered email on login page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill remembered email on login page
  if (document.getElementById('loginForm')) {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.value = rememberedEmail;
      }
    }
  }
});

// ============================================
// Logout Function
// ============================================

function logout() {
  clearAuthToken();
  window.location.href = '../index.html';
}
