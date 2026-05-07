// ─── Template Data ────────────────────────────────────────────────────────────
const TEMPLATES = [
  { name: "Tire rotation", cat: "Tires", icon: "ti-rotate-clockwise-2", text: "Rotated tires front to rear per vehicle rotation pattern. Reinstalled wheels and torqued lug nuts to {torque} ft-lbs with torque stick / torque wrench. Adjusted all four tire pressures to {psi} PSI per door placard specification. Test drove vehicle — no abnormal noise or vibration noted after rotation." },
  { name: "Oil & filter change", cat: "Maintenance", icon: "ti-droplet", text: "Drained engine oil and removed oil filter. Installed new OEM-spec oil filter. Reinstalled drain plug with new sealing washer and torqued to spec. Filled with {quarts} qts {oil_spec} engine oil. Reset oil life monitor / OLM. Verified no leaks at drain plug and filter. Checked final oil level — at full mark on dipstick." },
  { name: "Battery replacement", cat: "Electrical", icon: "ti-battery-charging-2", text: "Load-tested original battery — failed load test, CCA below spec. Removed original battery. Installed new {battery_group} group battery. Cleaned battery terminals and posts, applied anti-corrosion spray. Verified charging system output: alternator output {charge_v}V — within spec. Relearned / reset affected modules as required (BMS registration if applicable)." },
  { name: "Cabin air filter", cat: "Maintenance", icon: "ti-wind", text: "Removed and inspected cabin air filter — found heavily soiled / restricted. Installed new OEM-spec cabin air filter in housing. Reinstalled housing cover and verified proper seating of all clips. Advised customer of filter condition at time of service." },
  { name: "Engine air filter", cat: "Maintenance", icon: "ti-filter", text: "Removed and inspected engine air filter — found dirty / restricted. Installed new OEM-spec engine air filter. Reinstalled air box, secured all retaining clips and reconnected intake tube. Verified no vacuum leaks at intake connections after reassembly." },
  { name: "Wiper blades", cat: "Maintenance", icon: "ti-windmill", text: "Removed worn wiper blades — noted streaking / chattering / worn rubber. Installed new {driver_size} driver and {pass_size} passenger wiper blades per OEM spec. Tested wiper operation on all speed settings — wipers clear cleanly without streaking or skipping. Checked rear wiper if equipped." },
  { name: "Brake inspection", cat: "Brakes", icon: "ti-circle", text: "Performed full brake system inspection. Front brake pads: {front_mm}mm remaining. Rear brake pads: {rear_mm}mm remaining. Rotor condition: within spec / at or near minimum thickness / scoring noted (see recommendation). Brake fluid condition: good / discolored — recommend flush. Brake lines and flexible hoses: no cracks, leaks, or damage noted. Parking brake: functional and adjusted." },
  { name: "Multi-point inspection", cat: "Inspection", icon: "ti-checklist", text: "Performed multi-point vehicle inspection.\nFluids: {fluid_notes}.\nTires: {tire_tread_notes} — pressures set to placard spec.\nBrakes: {brake_notes}.\nBelts / hoses: {belt_hose_notes}.\nLights: all functional / exception noted below.\nSuspension: no abnormal play or noise noted.\nBattery: tested good / see recommendation.\nAdvised customer of findings. Recommendations attached." },
  { name: "Tire mount & balance", cat: "Tires", icon: "ti-hexagon", text: "Dismounted old tires from wheels. Inspected wheels for damage / corrosion — corrected as needed. Mounted new tires to wheels. Road force balanced all four wheels — all within {balance_spec} gram spec. Installed wheels and torqued lug nuts to {torque} ft-lbs. Adjusted tire pressures to {psi} PSI per door placard. Disposed of old tires per shop policy." },
  { name: "TPMS service", cat: "Tires", icon: "ti-gauge", text: "Inspected all four TPMS sensors. Replaced service kits (valve core, cap, seal, nut) on all sensors. Verified sensor battery life — good / sensor replacement recommended (noted RO). Relearned / re-initialized TPMS system per OEM procedure. Confirmed all sensors reporting correctly with scan tool. Adjusted all tire pressures to {psi} PSI per door placard." },
  { name: "Coolant flush", cat: "Fluids", icon: "ti-temperature", text: "Drained and flushed cooling system using {flush_machine} flush equipment. Flushed with BG Cooling System Cleaner / flush solution and water until clear. Refilled system with {coolant_spec} coolant per manufacturer spec — {coolant_qty} qts total capacity. Bled air from cooling system per OEM procedure. Verified coolant level at cold fill line. Test drove and verified proper operating temperature and no leaks." },
  { name: "Transmission fluid service", cat: "Fluids", icon: "ti-settings-cog", text: "Drained automatic / CVT transmission fluid. Removed and cleaned transmission pan (if applicable). Installed new OEM-spec transmission filter and pan gasket (if applicable). Reinstalled pan and torqued bolts to spec. Refilled with {fluid_spec} transmission fluid — {fluid_qty} qts. Verified fluid level at operating temperature per OEM procedure. No leaks noted. Test drove — shifts normal." },
];

// ─── State ────────────────────────────────────────────────────────────────────
let jobs = JSON.parse(localStorage.getItem('techJobs') || '[]');
let editIndex = -1;
let currentWeekOffset = 0;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function showTab(name, btn) {
  document.querySelectorAll('.tab-page').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'log') renderLog();
  if (name === 'summary') renderSummary();
}

// ─── Templates ────────────────────────────────────────────────────────────────
function renderTemplates(filter) {
  const grid = document.getElementById('template-grid');
  const list = filter
    ? TEMPLATES.filter(t => t.name.toLowerCase().includes(filter) || t.cat.toLowerCase().includes(filter))
    : TEMPLATES;

  grid.innerHTML = list.length
    ? list.map(t => {
        const realIndex = TEMPLATES.indexOf(t);
        return `<div class="tmpl-card" onclick="loadTemplate(${realIndex})" tabindex="0" onkeydown="if(event.key==='Enter')loadTemplate(${realIndex})">
          <div class="icon"><i class="ti ${t.icon}" aria-hidden="true"></i></div>
          <h3>${t.name}</h3>
          <p>${t.cat}</p>
        </div>`;
      }).join('')
    : `<p style="color:var(--text3);font-size:13px;padding:8px 0;">No templates matched "${filter}".</p>`;
}

function filterTemplates() {
  const q = document.getElementById('tmpl-search').value.toLowerCase().trim();
  renderTemplates(q || null);
}

function loadTemplate(i) {
  document.getElementById('template-text').value = TEMPLATES[i].text;
  const out = document.getElementById('template-output');
  out.style.display = 'block';
  out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeTemplateOutput() {
  document.getElementById('template-output').style.display = 'none';
}

function copyTemplate() {
  const txt = document.getElementById('template-text').value;
  navigator.clipboard.writeText(txt).then(() => {
    const el = document.getElementById('copy-success');
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 2200);
    showToast('Copied to clipboard', 'success');
  });
}

function sendToRO() {
  const txt = document.getElementById('template-text').value;
  document.getElementById('ro-work').value = txt;
  autosaveRO();
  showTab('ro', document.querySelectorAll('.nav-btn')[1]);
  showToast('Template sent to RO notepad', 'info');
}

function openRequestModal() { document.getElementById('request-modal').classList.add('open'); }
function closeRequestModal() { document.getElementById('request-modal').classList.remove('open'); }

function submitTemplateRequest() {
  const txt = document.getElementById('request-text').value.trim();
  if (!txt) return;
  closeRequestModal();
  const prompt = `I'm an automotive technician using a service sign-out assistant. Please write detailed sign-out note templates for the following service procedures. Each template should be thorough (like what a tech would actually write), include relevant placeholders in {curly_braces} for specs that vary (torque values, fluid specs, part numbers, etc.), and be ready to use. Procedures:\n\n${txt}`;
  window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, '_blank');
}

// ─── RO Notepad ───────────────────────────────────────────────────────────────
function autosaveRO() {
  const data = {
    num:      document.getElementById('ro-num').value,
    date:     document.getElementById('ro-date').value,
    vehicle:  document.getElementById('ro-vehicle').value,
    vin:      document.getElementById('ro-vin').value,
    sw:       document.getElementById('ro-sw').value,
    miles:    document.getElementById('ro-miles').value,
    concern:  document.getElementById('ro-concern').value,
    codes:    document.getElementById('ro-codes').value,
    findings: document.getElementById('ro-findings').value,
    work:     document.getElementById('ro-work').value,
    hours:    document.getElementById('ro-hours').value,
    status:   document.getElementById('ro-status').value,
  };
  localStorage.setItem('techRO_draft', JSON.stringify(data));
  const now = new Date();
  document.getElementById('autosave-label').textContent =
    `Saved ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function loadRODraft() {
  const raw = localStorage.getItem('techRO_draft');
  if (!raw) {
    document.getElementById('ro-date').value = new Date().toISOString().split('T')[0];
    return;
  }
  const d = JSON.parse(raw);
  document.getElementById('ro-num').value      = d.num      || '';
  document.getElementById('ro-date').value     = d.date     || new Date().toISOString().split('T')[0];
  document.getElementById('ro-vehicle').value  = d.vehicle  || '';
  document.getElementById('ro-vin').value      = d.vin      || '';
  document.getElementById('ro-sw').value       = d.sw       || '';
  document.getElementById('ro-miles').value    = d.miles    || '';
  document.getElementById('ro-concern').value  = d.concern  || '';
  document.getElementById('ro-codes').value    = d.codes    || '';
  document.getElementById('ro-findings').value = d.findings || '';
  document.getElementById('ro-work').value     = d.work     || '';
  document.getElementById('ro-hours').value    = d.hours    || '';
  document.getElementById('ro-status').value   = d.status   || 'wip';
}

function clearRO() {
  if (!confirm('Clear the current RO notepad? This will not delete saved log entries.')) return;
  localStorage.removeItem('techRO_draft');
  ['ro-num','ro-vehicle','ro-vin','ro-sw','ro-miles','ro-concern','ro-codes','ro-findings','ro-work','ro-hours']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('ro-date').value   = new Date().toISOString().split('T')[0];
  document.getElementById('ro-status').value = 'wip';
  document.getElementById('autosave-label').textContent = 'Auto-saved';
  showToast('RO cleared — ready for new job', 'info');
}

function saveROToLog() {
  const get = id => document.getElementById(id).value.trim();
  const ro = get('ro-num'), vehicle = get('ro-vehicle');
  if (!ro && !vehicle) { showToast('Add RO # or vehicle name first', 'info'); return; }

  const job = {
    id:       Date.now(),
    date:     get('ro-date') || new Date().toISOString().split('T')[0],
    ro:       ro || '—',
    vehicle:  vehicle || '—',
    vin:      get('ro-vin'),
    sw:       get('ro-sw'),
    miles:    get('ro-miles'),
    concern:  get('ro-concern') || '—',
    codes:    get('ro-codes') || '',
    findings: get('ro-findings'),
    work:     get('ro-work'),
    hours:    parseFloat(get('ro-hours')) || 0,
    status:   document.getElementById('ro-status').value,
  };
  jobs.push(job);
  saveJobs();
  showToast('Job added to work log', 'success');
  updateLogBadge();
}

// ─── Work Log ─────────────────────────────────────────────────────────────────
function saveJobs() {
  localStorage.setItem('techJobs', JSON.stringify(jobs));
}

function renderLog() {
  const search = (document.getElementById('log-search').value || '').toLowerCase();
  const filter = document.getElementById('log-filter').value;

  let list = jobs.filter(j => {
    const match = !search ||
      [j.ro, j.vehicle, j.concern, j.codes, j.findings].join(' ').toLowerCase().includes(search);
    const statusMatch = !filter || j.status === filter;
    return match && statusMatch;
  }).slice().reverse();

  const empty = document.getElementById('log-empty');
  const wrap  = document.getElementById('log-table-wrap');
  document.getElementById('log-count-label').textContent = `${list.length} job${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    empty.style.display = 'block';
    wrap.style.display  = 'none';
    return;
  }
  empty.style.display = 'none';
  wrap.style.display  = 'block';

  const statusLabel = { done: 'Completed', wip: 'In progress', flagged: 'Flagged' };
  const statusClass = { done: 'pill-done',  wip: 'pill-wip',    flagged: 'pill-flagged' };

  document.getElementById('log-tbody').innerHTML = list.map(j => {
    const realIndex = jobs.indexOf(j);
    return `<tr>
      <td style="white-space:nowrap; font-size:12px; color:var(--text2);">${j.date}</td>
      <td class="td-ro">${j.ro}</td>
      <td class="td-vehicle">${j.vehicle}</td>
      <td class="td-notes">${j.concern}</td>
      <td style="font-size:12px; color:var(--text2); font-family:'DM Mono',monospace;">${j.codes || '—'}</td>
      <td>${j.hours
        ? `<span class="hours-badge"><i class="ti ti-clock" style="font-size:11px;"></i>${j.hours.toFixed(1)}</span>`
        : '<span style="color:var(--text3);">—</span>'}</td>
      <td><span class="pill ${statusClass[j.status] || 'pill-wip'}">${statusLabel[j.status] || j.status}</span></td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="openEditModal(${realIndex})" title="Edit"><i class="ti ti-pencil"></i></button>
        <button class="btn btn-ghost btn-sm btn-danger" onclick="deleteJob(${realIndex})" title="Delete"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function deleteJob(index) {
  if (!confirm(`Delete RO ${jobs[index].ro} — ${jobs[index].vehicle}? This cannot be undone.`)) return;
  jobs.splice(index, 1);
  saveJobs();
  renderLog();
  updateLogBadge();
  showToast('Job deleted', 'info');
}

function updateLogBadge() {
  document.getElementById('log-nav-count').textContent = jobs.length;
}

function exportCSV() {
  if (!jobs.length) { showToast('No jobs to export yet', 'info'); return; }
  const headers = ['Date','RO #','Vehicle','VIN','Service Writer','Mileage In','Concern','Codes','Findings','Work Performed','Hours Flagged','Status'];
  const rows = jobs.map(j =>
    [j.date, j.ro, j.vehicle, j.vin, j.sw, j.miles, j.concern, j.codes, j.findings, j.work, j.hours, j.status]
      .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`)
      .join(',')
  );
  downloadFile('work_log.csv', [headers.join(','), ...rows].join('\n'), 'text/csv');
  showToast('CSV exported', 'success');
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function openEditModal(index) {
  editIndex = index;
  const j = jobs[index];
  document.getElementById('edit-ro-num').value      = j.ro === '—' ? '' : j.ro;
  document.getElementById('edit-ro-date').value     = j.date;
  document.getElementById('edit-ro-vehicle').value  = j.vehicle === '—' ? '' : j.vehicle;
  document.getElementById('edit-ro-vin').value      = j.vin      || '';
  document.getElementById('edit-ro-sw').value       = j.sw       || '';
  document.getElementById('edit-ro-miles').value    = j.miles    || '';
  document.getElementById('edit-ro-concern').value  = j.concern === '—' ? '' : j.concern;
  document.getElementById('edit-ro-codes').value    = j.codes    || '';
  document.getElementById('edit-ro-findings').value = j.findings || '';
  document.getElementById('edit-ro-work').value     = j.work     || '';
  document.getElementById('edit-ro-hours').value    = j.hours    || '';
  document.getElementById('edit-ro-status').value   = j.status   || 'wip';
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editIndex = -1;
}

function saveEdit() {
  if (editIndex < 0) return;
  const get = id => document.getElementById(id).value.trim();
  jobs[editIndex] = {
    ...jobs[editIndex],
    ro:       get('edit-ro-num')     || '—',
    date:     get('edit-ro-date'),
    vehicle:  get('edit-ro-vehicle') || '—',
    vin:      get('edit-ro-vin'),
    sw:       get('edit-ro-sw'),
    miles:    get('edit-ro-miles'),
    concern:  get('edit-ro-concern') || '—',
    codes:    get('edit-ro-codes'),
    findings: get('edit-ro-findings'),
    work:     get('edit-ro-work'),
    hours:    parseFloat(get('edit-ro-hours')) || 0,
    status:   document.getElementById('edit-ro-status').value,
  };
  saveJobs();
  closeEditModal();
  renderLog();
  renderSummary();
  showToast('Job updated', 'success');
}

// ─── Weekly Summary ───────────────────────────────────────────────────────────
function getWeekBounds(offset) {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function renderSummary() {
  const { monday, sunday } = getWeekBounds(currentWeekOffset);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('week-label').textContent = `${fmt(monday)} – ${fmt(sunday)}`;

  const weekJobs = jobs.filter(j => {
    const d = new Date(j.date + 'T12:00:00');
    return d >= monday && d <= sunday;
  });

  const totalHours = weekJobs.reduce((s, j) => s + (j.hours || 0), 0);
  const completed  = weekJobs.filter(j => j.status === 'done').length;
  const flagged    = weekJobs.filter(j => j.status === 'flagged').length;

  document.getElementById('summary-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total jobs</div><div class="stat-value">${weekJobs.length}</div><div class="stat-sub">this week</div></div>
    <div class="stat-card"><div class="stat-label">Hours flagged</div><div class="stat-value">${totalHours.toFixed(1)}</div><div class="stat-sub">total</div></div>
    <div class="stat-card"><div class="stat-label">Completed</div><div class="stat-value">${completed}</div><div class="stat-sub">jobs</div></div>
    <div class="stat-card"><div class="stat-label">Flagged / pending</div><div class="stat-value">${flagged}</div><div class="stat-sub">jobs</div></div>
  `;

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const today = new Date().toISOString().split('T')[0];

  document.getElementById('summary-tbody').innerHTML = days.map((name, i) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const iso     = dayDate.toISOString().split('T')[0];
    const dayJobs = weekJobs.filter(j => j.date === iso);
    const hrs     = dayJobs.reduce((s, j) => s + (j.hours || 0), 0);
    const vehicles = [...new Set(dayJobs.map(j => j.vehicle))].filter(v => v !== '—').join(', ');
    const isToday  = iso === today;
    return `<tr ${isToday ? 'style="background:var(--accent-light);"' : ''}>
      <td style="font-weight:${isToday ? '600' : '400'}; font-size:13px;">
        ${name}${isToday ? ' <span style="font-size:11px;color:var(--accent);font-weight:500;">today</span>' : ''}
      </td>
      <td>${dayJobs.length || '<span style="color:var(--text3);">—</span>'}</td>
      <td>${hrs > 0
        ? `<span class="hours-badge"><i class="ti ti-clock" style="font-size:11px;"></i>${hrs.toFixed(1)}</span>`
        : '<span style="color:var(--text3);">—</span>'}</td>
      <td style="font-size:12px; color:var(--text2);">${vehicles || '<span style="color:var(--text3);">—</span>'}</td>
    </tr>`;
  }).join('');
}

function changeWeek(dir) {
  currentWeekOffset += dir;
  renderSummary();
}

function exportWeekCSV() {
  const { monday, sunday } = getWeekBounds(currentWeekOffset);
  const weekJobs = jobs.filter(j => {
    const d = new Date(j.date + 'T12:00:00');
    return d >= monday && d <= sunday;
  });
  if (!weekJobs.length) { showToast('No jobs this week to export', 'info'); return; }
  const headers = ['Date','RO #','Vehicle','Concern','Codes','Hours','Status'];
  const rows = weekJobs.map(j =>
    [j.date, j.ro, j.vehicle, j.concern, j.codes, j.hours, j.status]
      .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`)
      .join(',')
  );
  downloadFile('week_summary.csv', [headers.join(','), ...rows].join('\n'), 'text/csv');
  showToast('Week CSV exported', 'success');
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function downloadFile(name, content, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

let toastTimer;
function showToast(msg, type = 'info') {
  const el   = document.getElementById('toast');
  const icon = el.querySelector('i');
  document.getElementById('toast-msg').textContent = msg;
  el.className = `toast ${type}`;
  icon.className = type === 'success' ? 'ti ti-check' : 'ti ti-info-circle';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close modals on backdrop click
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeEditModal();
  });
  document.getElementById('request-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeRequestModal();
  });

  renderTemplates();
  loadRODraft();
  updateLogBadge();
});
