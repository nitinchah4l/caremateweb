import { auth, db } from "./firebase-config.js";

/**
 * CareMate Main Application Logic
 */

// --- State Management ---
const state = {
    user: null,
    currentView: 'dashboard',
    isLoginMode: true,
    medicines: [],
    healthRecords: [],
    appointments: [],
    scannerActive: false
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initLucide();
    setupEventListeners();
    handleAuthState();
    // Default route
    navigateTo('dashboard');
});

function initLucide() {
    lucide.createIcons();
}

// --- Auth Functions ---
async function handleAuthState() {
    if (!auth) {
        // Fallback for demo mode
        const savedUser = localStorage.getItem('caremate_user');
        if (savedUser) {
            state.user = JSON.parse(savedUser);
            showMainApp();
        }
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            state.user = user;
            // Fetch name from firestore if needed
            const doc = await db.collection('users').doc(user.uid).get();
            const userData = doc.data();
            state.user.displayName = userData?.fullName || user.displayName;
            showMainApp();
        } else {
            state.user = null;
            showAuthScreen();
        }
    });
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('reg-name').value;

    try {
        if (state.isLoginMode) {
            // Login
            if (auth) {
                await auth.signInWithEmailAndPassword(email, password);
            } else {
                // Demo Login
                mockLogin(email);
            }
        } else {
            // Signup
            if (auth) {
                const cred = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection('users').doc(cred.user.uid).set({
                    fullName: name,
                    email: email,
                    createdAt: new Date().toISOString()
                });
            } else {
                // Demo Signup
                mockLogin(email, name);
            }
        }
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

function mockLogin(email, name = 'Nitin') {
    state.user = { email, displayName: name };
    localStorage.setItem('caremate_user', JSON.stringify(state.user));
    showMainApp();
    showToast(`Welcome, ${name}!`, 'success');
}

function logout() {
    if (auth) auth.signOut();
    state.user = null;
    localStorage.removeItem('caremate_user');
    showAuthScreen();
}

// --- Routing ---
function navigateTo(viewId) {
    state.currentView = viewId;
    
    // Update Nav
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.toggle('active', li.dataset.route === viewId);
    });

    // Update Header
    const titleMap = {
        'dashboard': 'Health Dashboard',
        'medicines': 'My Medicines',
        'health': 'Health Tracking',
        'appointments': 'Doctor Appointments',
        'scanner': 'Smart Scanner',
        'ai': 'AI Health Assistant',
        'profile': 'My Profile'
    };
    document.getElementById('current-view-title').innerText = titleMap[viewId] || 'CareMate';

    // Render View
    renderView(viewId);
}

function renderView(viewId) {
    const container = document.getElementById('view-container');
    container.innerHTML = ''; // Clear current

    switch(viewId) {
        case 'dashboard':
            renderDashboard(container);
            break;
        case 'medicines':
            renderMedicines(container);
            break;
        case 'health':
            renderHealth(container);
            break;
        case 'appointments':
            renderAppointments(container);
            break;
        case 'ai':
            renderAI(container);
            break;
        case 'scanner':
            renderScanner(container);
            break;
        case 'profile':
            renderProfile(container);
            break;
    }
    initLucide();
}

// --- View Renderers ---

function renderDashboard(container) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    
    container.innerHTML = `
        <div class="dashboard-welcome">
            <h1>${greeting}, ${state.user?.displayName || 'User'}</h1>
            <p>You have 3 medicines scheduled for today.</p>
        </div>
        
        <div class="dashboard-grid">
            <div class="card span-2">
                <div class="card-header">
                    <h3>Today's Medicines</h3>
                    <button class="btn-text" onclick="navigateTo('medicines')">View All</button>
                </div>
                <div class="medicine-list">
                    <div class="medicine-item">
                        <div class="med-icon"><i data-lucide="pill"></i></div>
                        <div class="med-info">
                            <h4>Paracetamol 500mg</h4>
                            <p>After Lunch • 2:00 PM</p>
                        </div>
                        <div class="med-status status-pending">Pending</div>
                    </div>
                    <div class="medicine-item">
                        <div class="med-icon"><i data-lucide="pill"></i></div>
                        <div class="med-info">
                            <h4>Vitamin D3</h4>
                            <p>Morning • 9:00 AM</p>
                        </div>
                        <div class="med-status status-taken">Taken</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Health Summary</h3>
                    <i data-lucide="info" class="text-muted"></i>
                </div>
                <div class="summary-stats">
                    <div class="stat-row">
                        <span>Blood Pressure</span>
                        <strong>120/80</strong>
                    </div>
                    <div class="stat-row">
                        <span>Sugar Level</span>
                        <strong>95 mg/dL</strong>
                    </div>
                    <div class="stat-row">
                        <span>Heart Rate</span>
                        <strong>72 bpm</strong>
                    </div>
                </div>
                <button class="btn primary-btn" style="margin-top: 1rem;" onclick="navigateTo('health')">
                    <i data-lucide="plus"></i> Add Record
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Upcoming Appointment</h3>
                </div>
                <div class="appointment-card-mini">
                    <div class="date-badge">
                        <span class="month">APR</span>
                        <span class="day">18</span>
                    </div>
                    <div class="app-details">
                        <h4>Dr. Sarah Wilson</h4>
                        <p>Cardiologist • 10:30 AM</p>
                    </div>
                </div>
            </div>

             <div class="card">
                <div class="card-header">
                    <h3>Health Trends</h3>
                </div>
                <canvas id="miniChart" height="150"></canvas>
            </div>
        </div>
    `;
    
    initDashboardChart();
}

function renderMedicines(container) {
    container.innerHTML = `
        <div class="page-actions">
            <button class="btn primary-btn" id="add-med-btn">
                <i data-lucide="plus"></i> Add New Medicine
            </button>
        </div>
        
        <div class="med-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
            <!-- Dummy Meds -->
            ${[1,2,3].map(i => `
                <div class="card med-card">
                    <div style="display: flex; justify-content: space-between;">
                        <div class="med-icon"><i data-lucide="pill"></i></div>
                        <span class="status-tag ${i === 1 ? 'pending' : 'taken'}">${i === 1 ? 'Next: 2 PM' : 'Taken'}</span>
                    </div>
                    <h3 style="margin: 1rem 0 0.25rem 0;">Aspirin 81mg</h3>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Daily • After breakfast</p>
                    <div class="med-actions" style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                        <button class="btn primary-btn" style="padding: 0.5rem; font-size: 0.875rem;">Mark Taken</button>
                        <button class="btn secondary-btn" style="padding: 0.5rem; font-size: 0.875rem; width: auto;"><i data-lucide="edit-3"></i></button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderHealth(container) {
    container.innerHTML = `
        <div class="health-tracker">
            <div class="card">
                <h3>Track New Vital</h3>
                <form id="health-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div class="input-group">
                        <label>Systolic BP</label>
                        <input type="number" placeholder="120">
                    </div>
                    <div class="input-group">
                        <label>Diastolic BP</label>
                        <input type="number" placeholder="80">
                    </div>
                    <div class="input-group">
                        <label>Sugar Level (mg/dL)</label>
                        <input type="number" placeholder="100">
                    </div>
                    <div class="input-group">
                        <label>Heart Rate (bpm)</label>
                        <input type="number" placeholder="72">
                    </div>
                    <button type="submit" class="btn primary-btn" style="grid-column: span 2;">Save Record</button>
                </form>
            </div>
            
            <div class="card" style="margin-top: 2rem;">
                <h3>Health History</h3>
                <canvas id="healthHistoryChart" height="200"></canvas>
            </div>
        </div>
    `;
    initHealthChart();
}

function renderAI(container) {
    container.innerHTML = `
        <div class="chat-container">
            <div class="chat-messages" id="chat-messages">
                <div class="message bot-message">
                    Hello ${state.user?.displayName || 'there'}! I'm your CareMate AI assistant. How can I help you today?
                </div>
            </div>
            <div class="disclaimer">
                Note: This AI assistant provides general information and is NOT a substitute for professional medical advice.
            </div>
            <form class="chat-input-area" id="ai-form">
                <input type="text" id="ai-input" placeholder="Type your health query here..." required>
                <button type="submit" class="btn primary-btn" style="width: auto; padding: 0 1.5rem;">
                    <i data-lucide="send"></i>
                </button>
            </form>
        </div>
    `;
    
    document.getElementById('ai-form').addEventListener('submit', handleAISubmission);
}

function renderScanner(container) {
    container.innerHTML = `
        <div class="scanner-container card">
            <div id="scanner-preview" style="width: 100%; height: 400px; background: #000; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                <video id="video" autoplay style="width: 100%; height: 100%; object-fit: cover;"></video>
                <div class="scan-overlay" style="position: absolute; border: 2px solid var(--primary); width: 80%; height: 40%; box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);"></div>
                <div id="scanner-empty" style="color: white; text-align: center; display: none;">
                    <i data-lucide="camera-off" size="48"></i>
                    <p>Camera permission required</p>
                </div>
            </div>
            <div class="scanner-actions" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button class="btn primary-btn" id="capture-btn"><i data-lucide="camera"></i> Scan Record</button>
                <p style="font-size: 0.875rem; color: var(--text-muted);">Points the camera at your BP/Sugar machine display to extract verves.</p>
            </div>
            <div id="ocr-result" class="card" style="display: none; margin-top: 1rem; border-color: var(--primary);">
                <h4>Detected Values:</h4>
                <div id="detected-text" style="font-family: monospace; padding: 1rem; background: var(--background); margin-top: 0.5rem;"></div>
                <button class="btn primary-btn" style="margin-top: 1rem;">Auto-fill Vitals</button>
            </div>
        </div>
    `;
    startCamera();
    
    document.getElementById('capture-btn').addEventListener('click', captureAndScan);
}

// --- Component Logics ---

function initDashboardChart() {
    const ctx = document.getElementById('miniChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Heart Rate',
                data: [72, 75, 71, 78, 74, 70, 72],
                borderColor: '#2563eb',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });
}

function initHealthChart() {
    const ctx = document.getElementById('healthHistoryChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'BP Systolic',
                    data: [120, 118, 122, 119],
                    backgroundColor: '#2563eb'
                },
                {
                    label: 'BP Diastolic',
                    data: [80, 78, 82, 80],
                    backgroundColor: '#60a5fa'
                }
            ]
        },
        options: { responsive: true }
    });
}

async function handleAISubmission(e) {
    e.preventDefault();
    const input = document.getElementById('ai-input');
    const msg = input.value;
    if (!msg) return;

    appendMessage('user', msg);
    input.value = '';

    // Mock AI Response
    setTimeout(() => {
        const response = getMockAIResponse(msg);
        appendMessage('bot', response);
    }, 800);
}

function appendMessage(sender, text) {
    const chat = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function getMockAIResponse(query) {
    const q = query.toLowerCase();
    if (q.includes('fever')) return "A fever is usually a sign that your body is fighting off an infection. You should keep hydrated and rest. If it exceeds 103°F (39.4°C), please consult a doctor.";
    if (q.includes('sugar')) return "Normal fasting blood sugar levels are typically between 70 and 99 mg/dL. Your recent average of 95 mg/dL is within a healthy range.";
    if (q.includes('bp') || q.includes('blood pressure')) return "A normal blood pressure reading is less than 120/80 mmHg. Consistency is key in tracking; try to measure it at the same time every day.";
    return "I'm here to help with your health questions. Based on your records, everything looks stable. Remember, I am an AI and not a doctor.";
}

async function startCamera() {
    const video = document.getElementById('video');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
    } catch (err) {
        console.error("Camera Error:", err);
        document.getElementById('scanner-empty').style.display = 'block';
    }
}

async function captureAndScan() {
    const video = document.getElementById('video');
    const resultArea = document.getElementById('ocr-result');
    const resultText = document.getElementById('detected-text');
    
    showToast("Processing capture...", "info");
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    
    try {
        const result = await Tesseract.recognize(dataUrl, 'eng');
        resultArea.style.display = 'block';
        // Extract numbers only for health vitals
        const numbers = result.data.text.match(/\d+/g);
        resultText.innerText = numbers ? `Found values: ${numbers.join(', ')}` : "No clear values detected. Try closer.";
        showToast("Scan complete", "success");
    } catch (err) {
        showToast("OCR Error: " + err.message, "danger");
    }
}

// --- UI Helpers ---

function setupEventListeners() {
    // Auth Toggles
    document.getElementById('auth-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        state.isLoginMode = !state.isLoginMode;
        document.getElementById('name-group').style.display = state.isLoginMode ? 'none' : 'block';
        document.getElementById('auth-submit-btn').innerText = state.isLoginMode ? 'Login' : 'Sign Up';
        document.getElementById('auth-subtitle').innerText = state.isLoginMode ? 'Welcome back to your health companion' : 'Create your health profile';
        document.getElementById('auth-toggle-text').innerHTML = state.isLoginMode ? 
            'Don\'t have an account? <a href="#" id="auth-toggle">Sign Up</a>' :
            'Already have an account? <a href="#" id="auth-toggle">Login</a>';
        // Re-attach listener since we replaced innerHTML
        document.getElementById('auth-toggle').addEventListener('click', arguments.callee);
    });

    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);

    // Nav Links
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', () => navigateTo(li.dataset.route));
    });

    document.querySelector('.user-profile').addEventListener('click', () => navigateTo('profile'));

    // Emergency
    document.getElementById('global-emergency-btn').addEventListener('click', () => {
        document.getElementById('emergency-overlay').classList.add('active');
    });

    document.getElementById('cancel-emergency').addEventListener('click', () => {
        document.getElementById('emergency-overlay').classList.remove('active');
    });

    document.getElementById('confirm-emergency').addEventListener('click', () => {
        showToast("Emergency Alert Sent to Contacts!", "danger");
        document.getElementById('emergency-overlay').classList.remove('active');
    });
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('main-screen').classList.remove('active');
}

function showMainApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('user-name-display').innerText = state.user?.displayName || 'User';
    navigateTo('dashboard');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'danger' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#eff6ff'};
        color: ${type === 'danger' ? '#b91c1c' : type === 'success' ? '#15803d' : '#1d4ed8'};
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        margin-bottom: 0.75rem;
        border-left: 4px solid ${type === 'danger' ? '#ef4444' : type === 'success' ? '#10b981' : '#2563eb'};
        animation: slideIn 0.3s ease-out;
    `;
    toast.innerText = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function renderProfile(container) {
    container.innerHTML = `
        <div class="profile-card card" style="max-width: 600px; margin: 0 auto; text-align: center;">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user?.displayName}" style="width: 120px; height: 120px; border-radius: 50%; background: var(--primary-light); margin-bottom: 1.5rem;">
            <h2>${state.user?.displayName || 'User'}</h2>
            <p style="color: var(--text-muted);">${state.user?.email}</p>
            
            <div class="profile-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0;">
                <div class="stat">
                    <strong>12</strong>
                    <p>Meds</p>
                </div>
                <div class="stat">
                    <strong>45</strong>
                    <p>Records</p>
                </div>
                <div class="stat">
                    <strong>3</strong>
                    <p>Doctors</p>
                </div>
            </div>
            
            <div class="profile-actions" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button class="btn secondary-btn"><i data-lucide="settings"></i> Account Settings</button>
                <button class="btn danger-btn" onclick="logout()"><i data-lucide="log-out"></i> Logout</button>
            </div>
        </div>
    `;
}

function renderAppointments(container) {
    container.innerHTML = `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h3>Upcoming Appointments</h3>
            <button class="btn primary-btn" style="width: auto;"><i data-lucide="plus"></i> Schedule New</button>
        </div>
        
        <div class="appointment-list">
             ${[1, 2].map(i => `
                <div class="card" style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem;">
                    <div style="background: var(--primary-light); color: var(--primary); padding: 1rem; border-radius: var(--radius-md); text-align: center; min-width: 80px;">
                        <div style="font-weight: 700; font-size: 1.25rem;">${i === 1 ? '18' : '25'}</div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">April</div>
                    </div>
                    <div style="flex-grow: 1;">
                        <h4 style="margin-bottom: 0.25rem;">${i === 1 ? 'Dr. Sarah Wilson' : 'Dr. Michael Chen'}</h4>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">${i === 1 ? 'Cardiology Checkup' : 'General Monthly Sync'}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600;">${i === 1 ? '10:30 AM' : '2:15 PM'}</div>
                        <span style="font-size: 0.75rem; color: var(--accent); font-weight: 600;">Confirmed</span>
                    </div>
                    <button class="btn-text" style="color: var(--text-muted);"><i data-lucide="more-vertical"></i></button>
                </div>
             `).join('')}
        </div>
    `;
}
