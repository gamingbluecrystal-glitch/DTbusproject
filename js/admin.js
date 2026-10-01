/**
 * SmartBus Admin & Dispatcher Portal Logic
 * Provides full fleet, route, stop, timetable, and Firebase Cloud database management.
 */

function getRealTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

const AdminState = {
  stops: [],
  buses: [],
  routes: [],
  trips: [],
  stopsMap: new Map(),
  busesMap: new Map(),
  routesMap: new Map(),

  adminTab: 'dashboard',
  isAdminAuthenticated: false,

  // Edit states
  editingStop: null,
  isCreatingStop: false,
  editingBus: null,
  isCreatingBus: false,
  editingRoute: null,
  isCreatingRoute: false,
  editingTrip: null,
  isCreatingTrip: false,
  routeStopsDraft: []
};

function refreshMaps() {
  AdminState.stopsMap = new Map(AdminState.stops.map(s => [s.id, s]));
  AdminState.busesMap = new Map(AdminState.buses.map(b => [b.id, b]));
  AdminState.routesMap = new Map(AdminState.routes.map(r => [r.id, r]));
}

function reloadDataFromStorage() {
  AdminState.stops = StorageService.getStops();
  AdminState.buses = StorageService.getBuses();
  AdminState.routes = StorageService.getRoutes();
  AdminState.trips = StorageService.getTrips();
  refreshMaps();
}

function getActiveBusesOnRoad() {
  const list = [];
  const currentMinutes = getRealTimeMinutes();
  for (const trip of AdminState.trips) {
    if (!trip.isActive) continue;
    const route = AdminState.routesMap.get(trip.routeId);
    const bus = AdminState.busesMap.get(trip.busId);
    if (!route || !bus || bus.status !== 'active') continue;

    const loc = EtaEngine.calculateEstimatedLocation(trip, AdminState.stopsMap, currentMinutes);
    if (loc && loc.isTripActive && typeof loc.lat === 'number' && loc.lat !== null) {
      list.push({ bus, route, trip, location: loc });
    }
  }
  return list;
}

function updateClock() {
  const clockEl = document.getElementById('nav-clock-time');
  if (clockEl) {
    clockEl.textContent = EtaEngine.minutesToTimeString(getRealTimeMinutes());
  }
}

// --- Toast Feedback Notification ---
function showToastNotification(message, type = 'success') {
  let toast = document.getElementById('admin-toast-banner');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast-banner';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '99999';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '13px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    toast.style.transition = 'all 0.25s ease';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
  }
  toast.style.background = type === 'error' ? '#dc2626' : '#059669';
  toast.style.color = '#ffffff';
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => { toast.style.display = 'none'; }, 250);
  }, 3500);
}

// --- Direct Global Delete Handlers ---
window.handleDeleteStop = function(e, id) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log('[SmartBus Admin] Deleting stop:', id);
  if (e && e.target) {
    const tr = e.target.closest('tr');
    if (tr) tr.remove();
  }
  AdminState.stops = AdminState.stops.filter(s => s.id !== id);
  StorageService.deleteStop(id);
  if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
    FirebaseService.deleteDocument('stops', id);
  }
  refreshMaps();
  showToastNotification(`Stop "${id}" deleted successfully from cloud & local!`);
  const area = document.getElementById('admin-tab-content-area');
  if (area && AdminState.adminTab === 'stops') renderAdminStopsTab(area);
};

window.handleDeleteBus = function(e, id) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log('[SmartBus Admin] Deleting bus:', id);
  if (e && e.target) {
    const tr = e.target.closest('tr');
    if (tr) tr.remove();
  }
  AdminState.buses = AdminState.buses.filter(b => b.id !== id);
  StorageService.deleteBus(id);
  if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
    FirebaseService.deleteDocument('buses', id);
  }
  refreshMaps();
  showToastNotification(`Bus "${id}" deleted successfully from cloud & local!`);
  const area = document.getElementById('admin-tab-content-area');
  if (area && AdminState.adminTab === 'buses') renderAdminBusesTab(area);
};

window.handleDeleteRoute = function(e, id) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log('[SmartBus Admin] Deleting route:', id);
  if (e && e.target) {
    const tr = e.target.closest('tr');
    if (tr) tr.remove();
  }
  AdminState.routes = AdminState.routes.filter(r => r.id !== id);
  StorageService.deleteRoute(id);
  if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
    FirebaseService.deleteDocument('routes', id);
  }
  refreshMaps();
  showToastNotification(`Route "${id}" deleted successfully from cloud & local!`);
  const area = document.getElementById('admin-tab-content-area');
  if (area && AdminState.adminTab === 'routes') renderAdminRoutesTab(area);
};

window.handleDeleteTrip = function(e, id) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log('[SmartBus Admin] Deleting trip:', id);
  if (e && e.target) {
    const tr = e.target.closest('tr');
    if (tr) tr.remove();
  }
  AdminState.trips = AdminState.trips.filter(t => t.id !== id);
  StorageService.deleteTrip(id);
  if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
    FirebaseService.deleteDocument('trips', id);
  }
  showToastNotification(`Trip "${id}" deleted successfully from cloud & local!`);
  const area = document.getElementById('admin-tab-content-area');
  if (area && AdminState.adminTab === 'timetables') renderAdminTimetablesTab(area);
};

// Global Delegated Click Interceptor: catches ANY delete button click
document.addEventListener('click', function(e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  const text = (btn.textContent || '').trim().toLowerCase();
  if (text !== 'delete' && !btn.classList.contains('btn-danger-outline') && !btn.dataset.action?.startsWith('delete')) {
    return;
  }

  // Check Stop Delete
  const stopId = btn.dataset.stopId || btn.dataset.id || (btn.getAttribute('onclick') || '').match(/handleDeleteStop\([^,]+,\s*'([^']+)'/)?.[1];
  if (stopId || (btn.classList.contains('btn-delete-stop') && stopId)) {
    e.preventDefault();
    e.stopPropagation();
    window.handleDeleteStop(e, stopId);
    return;
  }

  // Check Bus Delete
  const busId = btn.dataset.busId || btn.dataset.id || (btn.getAttribute('onclick') || '').match(/handleDeleteBus\([^,]+,\s*'([^']+)'/)?.[1];
  if (busId || (btn.classList.contains('btn-delete-bus') && busId)) {
    e.preventDefault();
    e.stopPropagation();
    window.handleDeleteBus(e, busId);
    return;
  }

  // Check Route Delete
  const routeId = btn.dataset.routeId || btn.dataset.id || (btn.getAttribute('onclick') || '').match(/handleDeleteRoute\([^,]+,\s*'([^']+)'/)?.[1];
  if (routeId || (btn.classList.contains('btn-delete-route') && routeId)) {
    e.preventDefault();
    e.stopPropagation();
    window.handleDeleteRoute(e, routeId);
    return;
  }

  // Check Trip Delete
  const tripId = btn.dataset.tripId || btn.dataset.id || (btn.getAttribute('onclick') || '').match(/handleDeleteTrip\([^,]+,\s*'([^']+)'/)?.[1];
  if (tripId || (btn.classList.contains('btn-delete-trip') && tripId)) {
    e.preventDefault();
    e.stopPropagation();
    window.handleDeleteTrip(e, tripId);
    return;
  }

  // If in a specific tab and has an edit sibling with data-id:
  if (text === 'delete') {
    const parentTd = btn.closest('td');
    if (parentTd) {
      const editBtn = parentTd.querySelector('[data-stop-id], [data-bus-id], [data-route-id], [data-trip-id]');
      if (editBtn) {
        if (editBtn.dataset.stopId) window.handleDeleteStop(e, editBtn.dataset.stopId);
        else if (editBtn.dataset.busId) window.handleDeleteBus(e, editBtn.dataset.busId);
        else if (editBtn.dataset.routeId) window.handleDeleteRoute(e, editBtn.dataset.routeId);
        else if (editBtn.dataset.tripId) window.handleDeleteTrip(e, editBtn.dataset.tripId);
      }
    }
  }
}, true);

// --- Admin Panel Renderers ---
function renderAdminDashboard() {
  const adminContainer = document.getElementById('admin-content-pane');
  if (!adminContainer) return;

  // Login Gate
  if (!AdminState.isAdminAuthenticated) {
    adminContainer.innerHTML = `
      <div style="max-width: 440px; margin: 40px auto;" class="card">
        <div style="background-color: var(--primary); color: #ffffff; padding: 14px 18px; margin: -16px -16px 16px -16px; border-radius: var(--radius-md) var(--radius-md) 0 0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 15px; font-weight: 800;">Dispatcher Portal Login</h3>
            <span style="font-size: 11px; opacity: 0.9;">Secure Transit Management</span>
          </div>
          <span style="font-size: 20px;">🛡️</span>
        </div>

        <div id="admin-login-error" style="display: none; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 14px;">
          Incorrect admin password. (Default: <code>admin123</code>)
        </div>

        <form id="admin-login-form">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-weight: 700;">Admin Password</label>
            <input type="password" id="admin-password-input" class="form-control" placeholder="Enter password (admin123)" required autofocus />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; padding: 10px; font-weight: 700;">Log In to Dispatcher</button>
        </form>

        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <a href="index.html" style="color: var(--text-muted); font-size: 12px; text-decoration: underline;">
            &larr; Return to Passenger View
          </a>
          <button type="button" id="btn-quick-fill" style="background: none; border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 11px; color: var(--primary); cursor: pointer; font-weight: 600;">
            Auto Fill (admin123)
          </button>
        </div>
      </div>
    `;

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const pwd = document.getElementById('admin-password-input').value;
      if (pwd === 'admin123' || pwd === 'admin') {
        AdminState.isAdminAuthenticated = true;
        sessionStorage.setItem(StorageKeys.ADMIN_SESSION, 'true');
        renderAdminDashboard();
      } else {
        document.getElementById('admin-login-error').style.display = 'block';
      }
    });

    const quickFillBtn = document.getElementById('btn-quick-fill');
    if (quickFillBtn) {
      quickFillBtn.addEventListener('click', () => {
        document.getElementById('admin-password-input').value = 'admin123';
      });
    }
    return;
  }

  // Authenticated Admin Dashboard Layout
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard Overview' },
    { id: 'routes', label: '🗺️ Routes' },
    { id: 'buses', label: '🚌 Fleet Buses' },
    { id: 'stops', label: '📍 Bus Stops' },
    { id: 'timetables', label: '⏱️ Timetables' },
    { id: 'import', label: '☁️ Database & Cloud Sync' }
  ];

  adminContainer.innerHTML = `
    <div class="admin-card">
      <div class="admin-header-bar">
        <div>
          <h2 style="font-size: 17px; font-weight: 800;">Dispatcher & Fleet Operations</h2>
          <span style="font-size: 12px; color: var(--text-muted);">Real-time control center backed by Firebase Firestore</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="btn-admin-logout" class="btn-secondary" style="font-size: 12px;">Logout</button>
          <a href="index.html" class="btn-primary" style="text-decoration: none; font-size: 12px;">Live Passenger View &rarr;</a>
        </div>
      </div>

      <div class="admin-tabs-nav">
        ${tabs.map(t => `
          <button class="admin-tab-btn ${AdminState.adminTab === t.id ? 'active' : ''}" data-tab="${t.id}">
            ${t.label}
          </button>
        `).join('')}
      </div>

      <div id="admin-tab-content-area" style="padding: 18px;"></div>
    </div>
  `;

  adminContainer.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AdminState.adminTab = btn.getAttribute('data-tab');
      renderAdminDashboard();
    });
  });

  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    AdminState.isAdminAuthenticated = false;
    sessionStorage.removeItem(StorageKeys.ADMIN_SESSION);
    renderAdminDashboard();
  });

  const area = document.getElementById('admin-tab-content-area');
  if (AdminState.adminTab === 'dashboard') renderAdminOverviewTab(area);
  else if (AdminState.adminTab === 'routes') renderAdminRoutesTab(area);
  else if (AdminState.adminTab === 'buses') renderAdminBusesTab(area);
  else if (AdminState.adminTab === 'stops') renderAdminStopsTab(area);
  else if (AdminState.adminTab === 'timetables') renderAdminTimetablesTab(area);
  else if (AdminState.adminTab === 'import') renderAdminImportTab(area);
}

function renderAdminOverviewTab(container) {
  const activeBuses = getActiveBusesOnRoad();

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box highlight" data-goto-tab="buses">
        <div class="stat-label">Total Buses</div>
        <div class="stat-value">${AdminState.buses.length}</div>
      </div>
      <div class="stat-box" data-goto-tab="routes">
        <div class="stat-label">Active Routes</div>
        <div class="stat-value">${AdminState.routes.length}</div>
      </div>
      <div class="stat-box" data-goto-tab="stops">
        <div class="stat-label">Transit Stops</div>
        <div class="stat-value">${AdminState.stops.length}</div>
      </div>
      <div class="stat-box" data-goto-tab="timetables">
        <div class="stat-label">Scheduled Trips</div>
        <div class="stat-value">${AdminState.trips.length}</div>
      </div>
    </div>

    <div style="margin-top: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="font-size: 14px; font-weight: 800;">Currently Active Trips on Road (${activeBuses.length})</h3>
        <span style="font-size: 11px; color: var(--text-muted);">Real-time schedule interpolated</span>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Bus #</th>
              <th>Route</th>
              <th>Current Segment</th>
              <th>Progress</th>
              <th>Next Stop</th>
            </tr>
          </thead>
          <tbody>
            ${activeBuses.length > 0 ? activeBuses.map(({ bus, route, location }) => `
              <tr>
                <td style="font-weight: 800; color: var(--primary);">${bus.busNumber}</td>
                <td>${route.name}</td>
                <td>${location.currentSegmentDescription}</td>
                <td style="font-family: var(--font-mono); font-weight: 800; color: var(--primary);">${Math.round(location.progressPercent)}%</td>
                <td>${location.nextStop ? location.nextStop.name : 'Destination'}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 22px;">
                  No active trips running at this clock time. Check Timetables tab to view scheduled runs.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelectorAll('.stat-box').forEach(box => {
    box.addEventListener('click', () => {
      AdminState.adminTab = box.getAttribute('data-goto-tab');
      renderAdminDashboard();
    });
  });
}

function renderAdminStopsTab(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <h3 style="font-size: 14px; font-weight: 800;">Bus Stops (${AdminState.stops.length})</h3>
      <button id="btn-create-stop" class="btn-primary">+ Add New Stop</button>
    </div>

    <div id="stop-form-container"></div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Stop Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${AdminState.stops.length > 0 ? AdminState.stops.map(stop => `
            <tr>
              <td style="font-family: var(--font-mono); font-weight: 800;">${stop.code || '-'}</td>
              <td style="font-weight: 700;">${stop.name}</td>
              <td style="font-family: var(--font-mono);">${typeof stop.lat === 'number' ? stop.lat.toFixed(4) : '-'}</td>
              <td style="font-family: var(--font-mono);">${typeof stop.lng === 'number' ? stop.lng.toFixed(4) : '-'}</td>
              <td style="text-align: right;">
                <button type="button" class="btn-edit-stop btn-danger-outline" data-stop-id="${stop.id}">Edit</button>
                <button type="button" class="btn-danger-outline btn-delete-stop" data-action="delete-stop" data-stop-id="${stop.id}" onclick="window.handleDeleteStop(event, '${stop.id}')" style="color: #b91c1c; font-weight: 700; margin-left: 8px; cursor: pointer;">Delete</button>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
                No stops added yet. Click "+ Add New Stop" above or load demo data.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-create-stop').addEventListener('click', () => {
    AdminState.isCreatingStop = true;
    AdminState.editingStop = null;
    showStopForm();
  });

  container.querySelectorAll('.btn-edit-stop').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-stop-id');
      AdminState.editingStop = AdminState.stops.find(s => s.id === id);
      AdminState.isCreatingStop = false;
      showStopForm();
    });
  });
}

function showStopForm() {
  const formBox = document.getElementById('stop-form-container');
  if (!formBox) return;

  const isEdit = !!AdminState.editingStop;
  const s = AdminState.editingStop || { code: '', name: '', lat: '', lng: '' };

  formBox.innerHTML = `
    <form id="stop-crud-form" class="admin-form-panel">
      <div style="display: flex; justify-content: space-between; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
        <span>${isEdit ? `Edit Stop: ${s.name}` : 'Add Bus Stop'}</span>
        <button type="button" id="btn-close-stop-form" style="border:none;background:none;cursor:pointer;font-size:16px;">&times;</button>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Stop Code</label>
          <input type="text" id="stop-input-code" class="form-control" placeholder="e.g. DWK-04" value="${s.code || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Stop Name</label>
          <input type="text" id="stop-input-name" class="form-control" placeholder="e.g. Dwarka Circle" value="${s.name || ''}" required />
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
            <label class="form-label" style="margin-bottom:0;">Latitude</label>
            <button type="button" id="btn-use-curr-loc" style="background:none; border:none; color:var(--primary); font-size:11px; font-weight:700; cursor:pointer; padding:0;">📍 My GPS</button>
          </div>
          <input type="number" step="0.000001" id="stop-input-lat" class="form-control" placeholder="19.9868" value="${s.lat || ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Longitude</label>
          <input type="number" step="0.000001" id="stop-input-lng" class="form-control" placeholder="73.7994" value="${s.lng || ''}" required />
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" id="btn-cancel-stop-form" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save Stop to Cloud</button>
      </div>
    </form>
  `;

  document.getElementById('btn-close-stop-form').addEventListener('click', () => { formBox.innerHTML = ''; });
  document.getElementById('btn-cancel-stop-form').addEventListener('click', () => { formBox.innerHTML = ''; });

  const useLocBtn = document.getElementById('btn-use-curr-loc');
  if (useLocBtn && navigator.geolocation) {
    useLocBtn.addEventListener('click', () => {
      useLocBtn.textContent = '⏳ Locating...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          useLocBtn.textContent = '📍 My GPS';
          document.getElementById('stop-input-lat').value = pos.coords.latitude.toFixed(6);
          document.getElementById('stop-input-lng').value = pos.coords.longitude.toFixed(6);
        },
        () => {
          useLocBtn.textContent = '📍 My GPS';
          alert('Unable to retrieve current location.');
        }
      );
    });
  }

  document.getElementById('stop-crud-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('stop-input-code').value.trim();
    const name = document.getElementById('stop-input-name').value.trim();
    const lat = parseFloat(document.getElementById('stop-input-lat').value);
    const lng = parseFloat(document.getElementById('stop-input-lng').value);

    if (isEdit) {
      AdminState.stops = AdminState.stops.map(st => st.id === s.id ? { ...st, code, name, lat, lng } : st);
    } else {
      AdminState.stops.push({ id: `stop-${Date.now()}`, code, name, lat, lng });
    }

    StorageService.saveStops(AdminState.stops);
    refreshMaps();
    formBox.innerHTML = '';
    renderAdminStopsTab(document.getElementById('admin-tab-content-area'));
  });
}

function renderAdminBusesTab(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <h3 style="font-size: 14px; font-weight: 800;">Fleet Vehicles (${AdminState.buses.length})</h3>
      <button id="btn-create-bus" class="btn-primary">+ Add New Bus</button>
    </div>

    <div id="bus-form-container"></div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Bus #</th>
            <th>Plate Number</th>
            <th>Model</th>
            <th>Capacity</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${AdminState.buses.length > 0 ? AdminState.buses.map(bus => `
            <tr>
              <td style="font-weight: 800; color: var(--primary);">${bus.busNumber}</td>
              <td style="font-family: var(--font-mono);">${bus.plateNumber || '-'}</td>
              <td>${bus.model || '-'}</td>
              <td>${bus.capacity || 0} seats</td>
              <td>
                <span class="status-tag ${bus.status === 'active' ? 'soon' : 'later'}">
                  ${(bus.status || 'ACTIVE').toUpperCase()}
                </span>
              </td>
              <td style="text-align: right;">
                <button type="button" class="btn-edit-bus btn-danger-outline" data-bus-id="${bus.id}">Edit</button>
                <button type="button" class="btn-danger-outline btn-delete-bus" data-action="delete-bus" data-bus-id="${bus.id}" onclick="window.handleDeleteBus(event, '${bus.id}')" style="color: #b91c1c; font-weight: 700; margin-left: 8px; cursor: pointer;">Delete</button>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                No buses in fleet. Click "+ Add New Bus" above.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-create-bus').addEventListener('click', () => {
    AdminState.isCreatingBus = true;
    AdminState.editingBus = null;
    showBusForm();
  });

  container.querySelectorAll('.btn-edit-bus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-bus-id');
      AdminState.editingBus = AdminState.buses.find(b => b.id === id);
      AdminState.isCreatingBus = false;
      showBusForm();
    });
  });
}

function showBusForm() {
  const formBox = document.getElementById('bus-form-container');
  if (!formBox) return;

  const isEdit = !!AdminState.editingBus;
  const b = AdminState.editingBus || {
    busNumber: '',
    plateNumber: '',
    model: '',
    capacity: 40,
    status: 'active'
  };

  formBox.innerHTML = `
    <form id="bus-crud-form" class="admin-form-panel">
      <div style="display: flex; justify-content: space-between; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
        <span>${isEdit ? `Edit Bus: ${b.busNumber}` : 'Add Bus to Fleet'}</span>
        <button type="button" id="btn-close-bus-form" style="border:none;background:none;cursor:pointer;font-size:16px;">&times;</button>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Bus Number</label>
          <input type="text" id="bus-input-number" class="form-control" placeholder="e.g. BUS 101" value="${b.busNumber}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Plate Number</label>
          <input type="text" id="bus-input-plate" class="form-control" placeholder="e.g. MH-15-EG-4521" value="${b.plateNumber}" />
        </div>
      </div>
      <div class="grid-3">
        <div class="form-group">
          <label class="form-label">Model</label>
          <input type="text" id="bus-input-model" class="form-control" placeholder="e.g. Tata Starbus EV" value="${b.model}" />
        </div>
        <div class="form-group">
          <label class="form-label">Capacity (Seats)</label>
          <input type="number" id="bus-input-cap" class="form-control" value="${b.capacity}" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="bus-input-status" class="form-control">
            <option value="active" ${b.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="maintenance" ${b.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
            <option value="inactive" ${b.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" id="btn-cancel-bus-form" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save Bus to Cloud</button>
      </div>
    </form>
  `;

  document.getElementById('btn-close-bus-form').addEventListener('click', () => { formBox.innerHTML = ''; });
  document.getElementById('btn-cancel-bus-form').addEventListener('click', () => { formBox.innerHTML = ''; });

  document.getElementById('bus-crud-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const busNumber = document.getElementById('bus-input-number').value.trim();
    const plateNumber = document.getElementById('bus-input-plate').value.trim();
    const model = document.getElementById('bus-input-model').value.trim();
    const capacity = parseInt(document.getElementById('bus-input-cap').value, 10) || 40;
    const status = document.getElementById('bus-input-status').value;

    if (isEdit) {
      AdminState.buses = AdminState.buses.map(item => item.id === b.id ? { ...item, busNumber, plateNumber, model, capacity, status } : item);
    } else {
      AdminState.buses.push({ id: `bus-${Date.now()}`, busNumber, plateNumber, model, capacity, status });
    }

    StorageService.saveBuses(AdminState.buses);
    refreshMaps();
    formBox.innerHTML = '';
    renderAdminBusesTab(document.getElementById('admin-tab-content-area'));
  });
}

function renderAdminRoutesTab(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <h3 style="font-size: 14px; font-weight: 800;">Transit Routes (${AdminState.routes.length})</h3>
      <button id="btn-create-route" class="btn-primary">+ Add New Route</button>
    </div>

    <div id="route-form-container"></div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Route #</th>
            <th>Name</th>
            <th>Via</th>
            <th>Stops Count</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${AdminState.routes.length > 0 ? AdminState.routes.map(route => `
            <tr>
              <td style="font-weight: 800; color: var(--primary);">${route.routeNumber}</td>
              <td style="font-weight: 700;">${route.name}</td>
              <td style="color: var(--text-muted);">${route.via || '-'}</td>
              <td>${route.stops ? route.stops.length : 0} stops</td>
              <td>
                <span class="status-tag ${route.isActive ? 'soon' : 'later'}">
                  ${route.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </td>
              <td style="text-align: right;">
                <button type="button" class="btn-edit-route btn-danger-outline" data-route-id="${route.id}">Edit</button>
                <button type="button" class="btn-danger-outline btn-delete-route" data-action="delete-route" data-route-id="${route.id}" onclick="window.handleDeleteRoute(event, '${route.id}')" style="color: #b91c1c; font-weight: 700; margin-left: 8px; cursor: pointer;">Delete</button>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                No routes created yet. Click "+ Add New Route" above.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-create-route').addEventListener('click', () => {
    AdminState.isCreatingRoute = true;
    AdminState.editingRoute = null;
    AdminState.routeStopsDraft = [];
    showRouteForm();
  });

  container.querySelectorAll('.btn-edit-route').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-route-id');
      AdminState.editingRoute = AdminState.routes.find(r => r.id === id);
      AdminState.isCreatingRoute = false;
      AdminState.routeStopsDraft = AdminState.editingRoute ? [...AdminState.editingRoute.stops] : [];
      showRouteForm();
    });
  });
}

function showRouteForm() {
  const formBox = document.getElementById('route-form-container');
  if (!formBox) return;

  const isEdit = !!AdminState.editingRoute;
  const r = AdminState.editingRoute || { routeNumber: '', name: '', via: '', isActive: true };

  formBox.innerHTML = `
    <form id="route-crud-form" class="admin-form-panel">
      <div style="display: flex; justify-content: space-between; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
        <span>${isEdit ? `Edit Route: ${r.routeNumber}` : 'Add Route'}</span>
        <button type="button" id="btn-close-route-form" style="border:none;background:none;cursor:pointer;font-size:16px;">&times;</button>
      </div>
      <div class="grid-3">
        <div class="form-group">
          <label class="form-label">Route Number</label>
          <input type="text" id="route-input-number" class="form-control" placeholder="e.g. 101" value="${r.routeNumber}" required />
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label class="form-label">Route Name</label>
          <input type="text" id="route-input-name" class="form-control" placeholder="e.g. Nashik Road ↔ CBS Express" value="${r.name}" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Via Stops</label>
        <input type="text" id="route-input-via" class="form-control" placeholder="e.g. Bytco, Dwarka, Mumbai Naka" value="${r.via || ''}" />
      </div>

      <div style="background: #ffffff; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 12px;">Route Stops Sequence:</strong>
          <select id="route-append-stop-select" style="padding: 4px 8px; font-size: 11px; border: 1px solid var(--border-color); border-radius: 4px;">
            <option value="">+ Append Stop to Route...</option>
            ${AdminState.stops.map(s => `<option value="${s.id}">${s.name} ${s.code ? `(${s.code})` : ''}</option>`).join('')}
          </select>
        </div>
        <div id="route-stops-list-draft"></div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" id="btn-cancel-route-form" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save Route to Cloud</button>
      </div>
    </form>
  `;

  renderRouteStopsDraft();

  document.getElementById('route-append-stop-select').addEventListener('change', (e) => {
    if (e.target.value) {
      AdminState.routeStopsDraft.push({
        stopId: e.target.value,
        sequenceOrder: AdminState.routeStopsDraft.length + 1,
        approxMinutesFromPrev: AdminState.routeStopsDraft.length === 0 ? 0 : 5
      });
      e.target.value = '';
      renderRouteStopsDraft();
    }
  });

  document.getElementById('btn-close-route-form').addEventListener('click', () => { formBox.innerHTML = ''; });
  document.getElementById('btn-cancel-route-form').addEventListener('click', () => { formBox.innerHTML = ''; });

  document.getElementById('route-crud-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const routeNumber = document.getElementById('route-input-number').value.trim();
    const name = document.getElementById('route-input-name').value.trim();
    const via = document.getElementById('route-input-via').value.trim();

    const stops = AdminState.routeStopsDraft;
    const originStopId = stops.length > 0 ? stops[0].stopId : '';
    const destinationStopId = stops.length > 0 ? stops[stops.length - 1].stopId : '';

    if (isEdit) {
      AdminState.routes = AdminState.routes.map(item => item.id === r.id ? { ...item, routeNumber, name, via, originStopId, destinationStopId, stops } : item);
    } else {
      AdminState.routes.push({
        id: `route-${Date.now()}`,
        routeNumber,
        name,
        via,
        originStopId,
        destinationStopId,
        color: '#b91c1c',
        isActive: true,
        stops
      });
    }

    StorageService.saveRoutes(AdminState.routes);
    refreshMaps();
    formBox.innerHTML = '';
    renderAdminRoutesTab(document.getElementById('admin-tab-content-area'));
  });
}

function renderRouteStopsDraft() {
  const container = document.getElementById('route-stops-list-draft');
  if (!container) return;

  if (AdminState.routeStopsDraft.length === 0) {
    container.innerHTML = '<div style="font-size: 11px; color: var(--text-muted); padding: 8px;">No stops added to sequence yet. Use the dropdown above.</div>';
    return;
  }

  container.innerHTML = AdminState.routeStopsDraft.map((st, idx) => {
    const stopObj = AdminState.stopsMap.get(st.stopId);
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 4px; font-size: 11px;">
        <div>
          <span style="font-weight: 800; color: var(--primary); margin-right: 6px;">${idx + 1}.</span>
          <span style="font-weight: 600;">${stopObj ? stopObj.name : st.stopId}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${idx > 0 ? `
            <span>+</span>
            <input type="number" min="1" value="${st.approxMinutesFromPrev || 5}" data-idx="${idx}" class="stop-time-draft" style="width: 44px; padding: 2px; border: 1px solid var(--border-color); text-align: center;" />
            <span>min</span>
          ` : ''}
          <button type="button" class="btn-remove-stop-draft" data-idx="${idx}" style="color: var(--primary); font-weight: 700; border: none; background: none; cursor: pointer;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.stop-time-draft').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      AdminState.routeStopsDraft[idx].approxMinutesFromPrev = parseInt(e.target.value, 10) || 1;
    });
  });

  container.querySelectorAll('.btn-remove-stop-draft').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      AdminState.routeStopsDraft.splice(idx, 1);
      AdminState.routeStopsDraft.forEach((s, i) => {
        s.sequenceOrder = i + 1;
        if (i === 0) s.approxMinutesFromPrev = 0;
      });
      renderRouteStopsDraft();
    });
  });
}

function renderAdminTimetablesTab(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
      <h3 style="font-size: 14px; font-weight: 800;">Timetable Halts & Scheduled Trips (${AdminState.trips.length})</h3>
      <button id="btn-create-trip" class="btn-primary" ${AdminState.routes.length === 0 || AdminState.buses.length === 0 ? 'disabled style="opacity:0.6;" title="Add routes and buses first"' : ''}>+ Schedule New Trip</button>
    </div>

    <div id="trip-form-container"></div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Trip #</th>
            <th>Route</th>
            <th>Assigned Bus</th>
            <th>Start Dep</th>
            <th>End Arr</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${AdminState.trips.length > 0 ? AdminState.trips.map(trip => {
            const route = AdminState.routesMap.get(trip.routeId);
            const bus = AdminState.busesMap.get(trip.busId);
            const firstHalt = trip.halts && trip.halts.length > 0 ? trip.halts[0] : null;
            const lastHalt = trip.halts && trip.halts.length > 0 ? trip.halts[trip.halts.length - 1] : null;

            return `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 800;">${trip.tripNumber || trip.id}</td>
                <td>${route ? route.name : trip.routeId}</td>
                <td style="font-weight: 700; color: var(--primary);">${bus ? bus.busNumber : trip.busId}</td>
                <td style="font-family: var(--font-mono);">${firstHalt ? (firstHalt.departureTime || firstHalt.arrivalTime) : '-'}</td>
                <td style="font-family: var(--font-mono);">${lastHalt ? lastHalt.arrivalTime : '-'}</td>
                <td style="text-align: right;">
                  <button type="button" class="btn-edit-trip btn-danger-outline" data-trip-id="${trip.id}">Edit</button>
                  <button type="button" class="btn-danger-outline btn-delete-trip" data-action="delete-trip" data-trip-id="${trip.id}" onclick="window.handleDeleteTrip(event, '${trip.id}')" style="color: #b91c1c; font-weight: 700; margin-left: 8px; cursor: pointer;">Delete</button>
                </td>
              </tr>
            `;
          }).join('') : `
            <tr>
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                No trips scheduled yet. Click "+ Schedule New Trip" above.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  const btnCreateTrip = document.getElementById('btn-create-trip');
  if (btnCreateTrip && AdminState.routes.length > 0 && AdminState.buses.length > 0) {
    btnCreateTrip.addEventListener('click', () => {
      AdminState.isCreatingTrip = true;
      AdminState.editingTrip = null;
      showTripForm();
    });
  }

  container.querySelectorAll('.btn-edit-trip').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-trip-id');
      AdminState.editingTrip = AdminState.trips.find(t => t.id === id);
      AdminState.isCreatingTrip = false;
      showTripForm();
    });
  });
}

function showTripForm() {
  const formBox = document.getElementById('trip-form-container');
  if (!formBox) return;

  const isEdit = !!AdminState.editingTrip;
  const defaultRoute = AdminState.routes[0];
  const t = AdminState.editingTrip || {
    routeId: defaultRoute ? defaultRoute.id : '',
    busId: AdminState.buses[0]?.id || '',
    tripNumber: '',
    halts: defaultRoute && defaultRoute.stops ? defaultRoute.stops.map(rs => ({
      stopId: rs.stopId,
      arrivalTime: '',
      departureTime: ''
    })) : []
  };

  formBox.innerHTML = `
    <form id="trip-crud-form" class="admin-form-panel">
      <div style="display: flex; justify-content: space-between; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
        <span>${isEdit ? `Edit Timetable: ${t.tripNumber}` : 'Add New Trip Timetable'}</span>
        <button type="button" id="btn-close-trip-form" style="border:none;background:none;cursor:pointer;font-size:16px;">&times;</button>
      </div>
      <div class="grid-3">
        <div class="form-group">
          <label class="form-label">Select Route</label>
          <select id="trip-input-route" class="form-control" ${isEdit ? 'disabled' : ''}>
            ${AdminState.routes.map(r => `<option value="${r.id}" ${r.id === t.routeId ? 'selected' : ''}>${r.routeNumber} (${r.name})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Assign Bus</label>
          <select id="trip-input-bus" class="form-control">
            ${AdminState.buses.map(b => `<option value="${b.id}" ${b.id === t.busId ? 'selected' : ''}>${b.busNumber} ${b.plateNumber ? `(${b.plateNumber})` : ''}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Trip Number</label>
          <input type="text" id="trip-input-number" class="form-control" placeholder="e.g. TRIP-101" value="${t.tripNumber}" required />
        </div>
      </div>

      <div style="background: #ffffff; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 14px;">
        <strong style="font-size: 12px; display: block; margin-bottom: 8px;">Halt Timetable:</strong>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f8fafc; text-align: left;">
              <th style="padding: 6px;">Stop</th>
              <th style="padding: 6px;">Arrival (HH:MM)</th>
              <th style="padding: 6px;">Departure (HH:MM)</th>
            </tr>
          </thead>
          <tbody id="trip-halts-tbody">
            ${t.halts.map((h, idx) => {
              const stop = AdminState.stopsMap.get(h.stopId);
              return `
                <tr>
                  <td style="padding: 6px; font-weight: 700;">${stop ? stop.name : h.stopId}</td>
                  <td style="padding: 6px;">
                    <input type="time" value="${h.arrivalTime}" class="halt-arr-time" data-idx="${idx}" style="padding: 3px; font-family: var(--font-mono); font-weight: bold;" required />
                  </td>
                  <td style="padding: 6px;">
                    <input type="time" value="${h.departureTime}" class="halt-dep-time" data-idx="${idx}" style="padding: 3px; font-family: var(--font-mono); font-weight: bold;" required />
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" id="btn-cancel-trip-form" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save Timetable to Cloud</button>
      </div>
    </form>
  `;

  document.getElementById('trip-input-route').addEventListener('change', (e) => {
    const route = AdminState.routes.find(r => r.id === e.target.value);
    const tbody = document.getElementById('trip-halts-tbody');
    if (route && tbody) {
      t.halts = route.stops.map(rs => ({
        stopId: rs.stopId,
        arrivalTime: '',
        departureTime: ''
      }));
      tbody.innerHTML = t.halts.map((h, idx) => {
        const stop = AdminState.stopsMap.get(h.stopId);
        return `
          <tr>
            <td style="padding: 6px; font-weight: 700;">${stop ? stop.name : h.stopId}</td>
            <td style="padding: 6px;">
              <input type="time" value="" class="halt-arr-time" data-idx="${idx}" style="padding: 3px; font-family: var(--font-mono); font-weight: bold;" required />
            </td>
            <td style="padding: 6px;">
              <input type="time" value="" class="halt-dep-time" data-idx="${idx}" style="padding: 3px; font-family: var(--font-mono); font-weight: bold;" required />
            </td>
          </tr>
        `;
      }).join('');
    }
  });

  document.getElementById('btn-close-trip-form').addEventListener('click', () => { formBox.innerHTML = ''; });
  document.getElementById('btn-cancel-trip-form').addEventListener('click', () => { formBox.innerHTML = ''; });

  document.getElementById('trip-crud-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const routeId = document.getElementById('trip-input-route').value;
    const busId = document.getElementById('trip-input-bus').value;
    const tripNumber = document.getElementById('trip-input-number').value.trim();

    const halts = [...t.halts];
    formBox.querySelectorAll('.halt-arr-time').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      halts[idx].arrivalTime = input.value;
    });
    formBox.querySelectorAll('.halt-dep-time').forEach(input => {
      const idx = parseInt(input.getAttribute('data-idx'), 10);
      halts[idx].departureTime = input.value;
    });

    if (isEdit) {
      AdminState.trips = AdminState.trips.map(item => item.id === t.id ? { ...item, busId, tripNumber, halts } : item);
    } else {
      AdminState.trips.push({
        id: `trip-${Date.now()}`,
        routeId,
        busId,
        tripNumber,
        direction: 'UP',
        halts,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true
      });
    }

    StorageService.saveTrips(AdminState.trips);
    formBox.innerHTML = '';
    renderAdminTimetablesTab(document.getElementById('admin-tab-content-area'));
  });
}

function renderAdminImportTab(container) {
  const isFbConnected = typeof FirebaseService !== 'undefined' && FirebaseService.isConnected;

  container.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 14px; font-weight: 800;">Database & Cloud Management</h3>
    </div>

    <div id="import-status-msg" style="display: none; padding: 10px 14px; border-radius: var(--radius-sm); font-weight: 700; margin-bottom: 14px;"></div>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card">
        <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 8px;">Database Backup & JSON</h4>
        <input type="file" id="file-upload-input" accept=".json" style="width: 100%; font-size: 12px; margin-bottom: 12px;" />
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-export-json" class="btn-primary" style="font-size: 11px;">Export Database JSON</button>
        </div>
      </div>

      <div class="card">
        <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 8px;">Database Maintenance</h4>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Reset or clear all collections in Firebase Firestore and local memory.</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-seed-demo" class="btn-primary" style="font-size: 11px; background: #059669;">Seed Demo Transit Data</button>
          <button id="btn-clear-all" class="btn-secondary" style="font-size: 11px; color: #b91c1c; font-weight: bold;">Clear All Cloud Data</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <h4 style="font-size: 13px; font-weight: 800;">Firebase Firestore Cloud Database</h4>
        <span class="db-status-badge ${isFbConnected ? 'connected' : 'offline'}" id="admin-db-status">
          <span class="status-dot"></span> ${isFbConnected ? 'Connected & Live' : 'Offline / Cached'}
        </span>
      </div>

      <div class="grid-2" style="margin-bottom: 16px;">
        <div class="form-group">
          <label class="form-label">Firebase Project ID</label>
          <input type="text" class="form-control" value="busapp-cf8fb" readonly style="background: #f1f5f9; cursor: not-allowed;" />
        </div>
        <div class="form-group">
          <label class="form-label">Auth Domain</label>
          <input type="text" class="form-control" value="busapp-cf8fb.firebaseapp.com" readonly style="background: #f1f5f9; cursor: not-allowed;" />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button id="btn-sync-to-cloud" class="btn-primary" style="font-size: 11px;">Push Local to Firebase</button>
        <button id="btn-pull-from-cloud" class="btn-secondary" style="font-size: 11px;">Pull Latest from Firebase</button>
      </div>
    </div>
  `;

  const statusMsg = document.getElementById('import-status-msg');

  function showStatus(text, isError = false) {
    statusMsg.textContent = text;
    statusMsg.style.display = 'block';
    if (isError) {
      statusMsg.style.background = '#fee2e2';
      statusMsg.style.border = '1px solid #fca5a5';
      statusMsg.style.color = '#991b1b';
    } else {
      statusMsg.style.background = '#d1fae5';
      statusMsg.style.border = '1px solid #6ee7b7';
      statusMsg.style.color = '#065f46';
    }
  }

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const jsonStr = StorageService.exportFullDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartbus_backup_${Date.now()}.json`;
    a.click();
    showStatus('Database JSON backup downloaded.');
  });

  document.getElementById('file-upload-input').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const ok = StorageService.importFullDataFromJson(evt.target.result);
      if (ok) {
        reloadDataFromStorage();
        showStatus('Database imported locally and synced to Firebase Firestore.');
        renderAdminDashboard();
      } else {
        showStatus('Failed to import: Invalid JSON structure.', true);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-seed-demo').addEventListener('click', async () => {
    showStatus('Seeding demo transit data to Firebase Firestore & local database...');
    showToastNotification('Seeding Nashik demo transit data...');
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
      const ok = await FirebaseService.seedInitialData();
      if (ok) {
        reloadDataFromStorage();
        showStatus('Official Nashik transit data loaded and synced to Firebase Firestore!');
        showToastNotification('Official Nashik transit dataset successfully seeded!');
        renderAdminDashboard();
      } else {
        showStatus('Failed to seed cloud database. Check internet connection.', true);
        showToastNotification('Failed to seed cloud database.', 'error');
      }
    } else {
      StorageService.saveStops(INITIAL_STOPS, false);
      StorageService.saveBuses(INITIAL_BUSES, false);
      StorageService.saveRoutes(INITIAL_ROUTES, false);
      StorageService.saveTrips(generateInitialTrips(), false);
      reloadDataFromStorage();
      showStatus('Demo transit data loaded locally.');
      showToastNotification('Demo transit data loaded locally!');
      renderAdminDashboard();
    }
  });

  document.getElementById('btn-clear-all').addEventListener('click', async () => {
    showStatus('Clearing all database records from Firebase Firestore and local memory...');
    StorageService.clearAllData(true);
    AdminState.stops = [];
    AdminState.buses = [];
    AdminState.routes = [];
    AdminState.trips = [];
    refreshMaps();
    showStatus('All database records cleared in Firebase Firestore and local cache.');
    showToastNotification('All database records cleared!');
    renderAdminDashboard();
  });

  document.getElementById('btn-sync-to-cloud').addEventListener('click', async () => {
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
      showStatus('Pushing local data to Firebase Firestore...');
      const ok = await FirebaseService.forcePushLocalToFirebase();
      if (ok) {
        showStatus('Local data successfully pushed to Firebase Firestore.');
      } else {
        showStatus('Failed to push to Firebase.', true);
      }
    } else {
      showStatus('Firebase is not connected.', true);
    }
  });

  document.getElementById('btn-pull-from-cloud').addEventListener('click', async () => {
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isConnected) {
      showStatus('Pulling latest data from Firebase Firestore...');
      const ok = await FirebaseService.forcePullFromFirebase();
      if (ok) {
        reloadDataFromStorage();
        showStatus('Latest data pulled from Firebase Firestore.');
        renderAdminDashboard();
      } else {
        showStatus('Failed to pull from Firebase.', true);
      }
    } else {
      showStatus('Firebase is not connected.', true);
    }
  });
}

// --- Bootstrap ---
function initAdmin() {
  if (typeof FirebaseService !== 'undefined') {
    FirebaseService.init();
  }
  StorageService.initDefaults();
  reloadDataFromStorage();

  AdminState.isAdminAuthenticated = sessionStorage.getItem(StorageKeys.ADMIN_SESSION) === 'true';

  updateClock();
  setInterval(updateClock, 1000);

  window.addEventListener('smartbus_storage_updated', () => {
    reloadDataFromStorage();
    if (AdminState.isAdminAuthenticated) {
      renderAdminDashboard();
    }
  });

  renderAdminDashboard();
}

document.addEventListener('DOMContentLoaded', initAdmin);
