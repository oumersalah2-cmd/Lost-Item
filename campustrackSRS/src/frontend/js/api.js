/* ==========================================================================
   CampusTrack — Core API Services & Client utilities
   Author: Abel Dereje (Lead Frontend Developer) & Antigravity (AI System Designer)
   ========================================================================== */

const API_BASE = '/api';

// Authentication helper utilities
function getToken() {
  return localStorage.getItem('token');
}

function saveToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Clear cookie as well
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function isAuthenticated() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

// Global Toast notification rendering helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} glass-panel`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';

  toast.innerHTML = `
    <span class="d-flex align-center gap-1">
      <i data-lucide="${iconName}"></i>
      <span class="toast-msg">${message}</span>
    </span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Close event listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  // Automatically fade out after 4 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 4500);
}

// Wrapper for all fetch request executions
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  // Set default headers
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine if it's FormData (for files)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const fetchOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      // Auto-logout if token is expired or unauthorized
      if (response.status === 401 && token) {
        clearToken();
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => window.location.href = '/login.html', 1500);
      }
      throw new Error(data.error || 'Something went wrong.');
    }

    return data;
  } catch (error) {
    console.error(`API Call failed to ${endpoint}:`, error.message);
    throw error;
  }
}

// Dynamic Navigation link rendering
function initNavbar() {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  const auth = isAuthenticated();
  const adminRole = isAdmin();
  const currentUser = getUser();

  let rightNavLinks = '';
  if (auth) {
    rightNavLinks = `
      <li><a href="/dashboard.html" class="d-flex align-center gap-1"><i data-lucide="user"></i>Dashboard</a></li>
      ${adminRole ? '<li><a href="/admin.html" class="d-flex align-center gap-1"><i data-lucide="shield"></i>Admin</a></li>' : ''}
      <li><a href="#" id="logout-link" class="d-flex align-center gap-1"><i data-lucide="log-out"></i>Logout</a></li>
    `;
  } else {
    rightNavLinks = `
      <li><a href="/login.html">Login</a></li>
      <li><a href="/register.html" class="btn btn-primary" style="padding: 0.4rem 1rem;">Register</a></li>
    `;
  }

  navContainer.innerHTML = `
    <nav class="navbar">
      <a href="/" class="nav-brand">
        CampusTrack
      </a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/search.html">Search Listings</a></li>
        ${auth ? `<li><a href="/post-item.html" class="btn btn-outline" style="padding: 0.4rem 1rem;"><i data-lucide="plus"></i>Report Item</a></li>` : ''}
        ${rightNavLinks}
      </ul>
    </nav>
  `;

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Attach logout handler
  const logoutBtn = document.getElementById('logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await apiCall('/auth/logout', { method: 'POST' });
      } catch (err) {
        // Fallback clear
      }
      clearToken();
      showToast('Logged out successfully.', 'success');
      setTimeout(() => window.location.href = '/', 1000);
    });
  }

  // Highlight active link
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && (currentPath === href || (currentPath === '/' && href === '/'))) {
      link.parentElement.classList.add('active');
    }
  });
}

// Utility to format date display
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Run navbar setup on page load
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
