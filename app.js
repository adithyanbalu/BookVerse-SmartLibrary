const SPINE_COLORS = ['#B8873D', '#4E6B52', '#9B3E3E', '#3A5A78', '#7A5C3E', '#5C4A78'];

let books = [
  { id: 1, title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', category: 'Computer Science', accession: 'ACC-1042', copies: 4, available: 3 },
  { id: 2, title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Computer Science', accession: 'ACC-1043', copies: 3, available: 0 },
  { id: 3, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Computer Science', accession: 'ACC-1044', copies: 2, available: 2 },
  { id: 4, title: 'Linear Algebra and Its Applications', author: 'David C. Lay', category: 'Mathematics', accession: 'ACC-2011', copies: 3, available: 1 },
  { id: 5, title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', category: 'Mathematics', accession: 'ACC-2012', copies: 2, available: 0 },
  { id: 6, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', accession: 'ACC-1045', copies: 5, available: 4 },
  { id: 7, title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', category: 'Computer Science', accession: 'ACC-1046', copies: 3, available: 2 },
  { id: 8, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Literature', accession: 'ACC-3021', copies: 2, available: 2 },
  { id: 9, title: 'Principles of Economics', author: 'N. Gregory Mankiw', category: 'Business', accession: 'ACC-4011', copies: 2, available: 1 },
  { id: 10, title: 'Digital Design and Computer Architecture', author: 'Harris & Harris', category: 'Engineering', accession: 'ACC-5001', copies: 2, available: 0 },
  { id: 11, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', category: 'Computer Science', accession: 'ACC-1047', copies: 3, available: 3 },
  { id: 12, title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', category: 'Computer Science', accession: 'ACC-1048', copies: 3, available: 1 },
];

let students = [
  { roll: 'AM.SC.U4CSE25014', name: 'Adithyan B', program: 'B.Tech CSE, S3', loans: 2, fines: 0, status: 'Active' },
  { roll: 'AM.SC.U4CSE25040', name: 'Madhav A', program: 'B.Tech CSE, S3', loans: 1, fines: 40, status: 'Active' },
  { roll: 'AM.SC.U4CSE25049', name: 'Robin Antony', program: 'B.Tech CSE, S3', loans: 3, fines: 0, status: 'Active' },
  { roll: 'AM.SC.U4CSE25024', name: 'Ali Adnan Thaha', program: 'B.Tech CSE, S3', loans: 0, fines: 0, status: 'Active' },
  { roll: 'AM.SC.U4CSE24102', name: 'Fathima Rasheed', program: 'B.Tech ECE, S5', loans: 1, fines: 20, status: 'Active' },
  { roll: 'AM.SC.U4CSE23088', name: 'Nikhil Menon', program: 'B.Tech ME, S7', loans: 0, fines: 0, status: 'Suspended' },
];

let loans = [
  { id: 1, book: 'Introduction to Algorithms', student: 'Madhav A', issued: '2026-07-10', due: '2026-07-24', status: 'overdue', daysOverdue: 9 },
  { id: 2, book: 'Digital Design and Computer Architecture', student: 'Robin Antony', issued: '2026-07-18', due: '2026-08-01', status: 'overdue', daysOverdue: 1 },
  { id: 3, book: 'Discrete Mathematics and Its Applications', student: 'Adithyan B', issued: '2026-07-22', due: '2026-08-05', status: 'active', daysOverdue: 0 },
  { id: 4, book: 'Artificial Intelligence: A Modern Approach', student: 'Fathima Rasheed', issued: '2026-07-25', due: '2026-08-08', status: 'active', daysOverdue: 0 },
  { id: 5, book: 'Linear Algebra and Its Applications', student: 'Robin Antony', issued: '2026-07-27', due: '2026-08-10', status: 'active', daysOverdue: 0 },
  { id: 6, book: 'Principles of Economics', student: 'Robin Antony', issued: '2026-07-28', due: '2026-08-11', status: 'active', daysOverdue: 0 },
];

let reservations = [
  { id: 1, book: 'Introduction to Algorithms', student: 'Ali Adnan Thaha', requested: '2026-07-30', status: 'pending' },
  { id: 2, book: 'Discrete Mathematics and Its Applications', student: 'Fathima Rasheed', requested: '2026-07-29', status: 'pending' },
  { id: 3, book: 'Digital Design and Computer Architecture', student: 'Madhav A', requested: '2026-07-31', status: 'approved' },
];

let fines = [
  { student: 'Madhav A', book: 'Introduction to Algorithms', days: 9, amount: 90, status: 'unpaid' },
  { student: 'Robin Antony', book: 'Digital Design and Computer Architecture', days: 1, amount: 10, status: 'unpaid' },
  { student: 'Fathima Rasheed', book: 'Operating System Concepts', days: 4, amount: 40, status: 'paid' },
];

let currentRole = 'admin';
let bookCategoryFilter = 'All';

function setRole(role) {
  currentRole = role;
  document.getElementById('role-admin-btn').classList.toggle('active', role === 'admin');
  document.getElementById('role-student-btn').classList.toggle('active', role === 'student');
  document.getElementById('login-id-label').textContent = role === 'admin' ? 'Admin ID' : 'Roll Number';
  document.getElementById('login-id').placeholder = role === 'admin' ? 'e.g. LIB-ADM-002' : 'e.g. AM.SC.U4CSE25014';
}

function doLogin(e) {
  e.preventDefault();
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  const idVal = document.getElementById('login-id').value || (currentRole === 'admin' ? 'Admin User' : 'Adithyan B');

  document.getElementById('nav-admin').classList.toggle('hidden', currentRole !== 'admin');
  document.getElementById('nav-student').classList.toggle('hidden', currentRole !== 'student');

  document.getElementById('user-name').textContent = currentRole === 'admin' ? 'Library Admin' : idVal;
  document.getElementById('user-role').textContent = currentRole === 'admin' ? 'administrator' : 'student';
  document.getElementById('user-avatar').textContent = (currentRole === 'admin' ? 'LA' : idVal.slice(0,2)).toUpperCase();

  goView(currentRole === 'admin' ? 'dashboard' : 's-dashboard');
  renderAll();
  return false;
}

function doLogout() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('view-login').classList.remove('hidden');
  document.getElementById('login-form').reset();
}

function goView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
  const nav = document.querySelector(`.drawer[data-view="${name}"]`);
  if (nav) nav.classList.add('active');

  const titles = {
    'dashboard': ['Overview', 'Dashboard'],
    'catalog': ['Catalog', 'Book Catalog'],
    'students': ['Circulation', 'Students'],
    'issue-return': ['Circulation', 'Issue & Return'],
    'reservations': ['Circulation', 'Reservations'],
    'fines': ['Circulation', 'Fines'],
    'reports': ['Insights', 'Reports'],
    's-dashboard': ['Overview', 'My Dashboard'],
    's-catalog': ['Library', 'Browse & Search'],
    's-loans': ['Library', 'My Loans'],
    's-reservations': ['Library', 'My Reservations'],
    's-fines': ['Library', 'My Fines'],
  };
  if (titles[name]) {
    document.getElementById('crumb').textContent = titles[name][0];
    document.getElementById('page-title').textContent = titles[name][1];
  }

  if (name === 'reports') setTimeout(renderCharts, 30);
  if (name === 'dashboard') setTimeout(renderDashboardChart, 30);
}

function stamp(text, kind) {
  const layer = document.getElementById('stamp-layer');
  const el = document.createElement('div');
  el.className = `stamp stamp-${kind}`;
  el.textContent = text;
  layer.appendChild(el);
  requestAnimationFrame(() => el.classList.add('go'));
  setTimeout(() => {
    el.classList.add('fade');
    setTimeout(() => el.remove(), 420);
  }, 700);
}

function toast(msg, kind) {
  const stack = document.getElementById('toast-stack');
  const el = document.createElement('div');
  el.className = `toast ${kind === 'sage' ? 'success' : kind === 'crimson' ? 'warn' : ''}`;
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

function spineColor(id) { return SPINE_COLORS[id % SPINE_COLORS.length]; }

function renderAll() {
  renderAdminCatalog();
  renderStudentTable();
  renderIssueReturnForm();
  renderActiveLoans();
  renderReservationsTable();
  renderFineTable();
  renderStudentCatalog();
  renderStudentLoans();
  renderStudentReservations();
  renderStudentFines();
  renderActivityFeed();
  renderDueSoon();
  renderRecommendations();
  renderCatalogChips();
}

function categories() { return ['All', ...new Set(books.map(b => b.category))]; }

function renderCatalogChips() {
  const cats = categories();
  const adminHtml = cats.map(c => `<span class="chip ${c===bookCategoryFilter?'active':''}" onclick="filterCategory('${c}','admin')">${c}</span>`).join('');
  const studentHtml = cats.map(c => `<span class="chip ${c===bookCategoryFilter?'active':''}" onclick="filterCategory('${c}','student')">${c}</span>`).join('');
  document.getElementById('admin-catalog-chips').innerHTML = adminHtml;
  document.getElementById('student-catalog-chips').innerHTML = studentHtml;
}

function filterCategory(cat, who) {
  bookCategoryFilter = cat;
  renderCatalogChips();
  renderAdminCatalog();
  renderStudentCatalog();
}

function renderAdminCatalog() {
  const rows = books.filter(b => bookCategoryFilter === 'All' || b.category === bookCategoryFilter);
  document.getElementById('admin-book-table').innerHTML = rows.map(b => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td>${b.author}</td>
      <td><span class="pill pill-ink">${b.category}</span></td>
      <td class="mono">${b.accession}</td>
      <td>${b.available} / ${b.copies}</td>
      <td>${b.available > 0 ? '<span class="pill pill-sage">Available</span>' : '<span class="pill pill-crimson">All issued</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-sm" onclick="openBookModal(${b.id})">Edit</button>
        <button class="btn btn-sm" onclick="deleteBook(${b.id})">Delete</button>
      </td>
    </tr>
  `).join('') || emptyRow(7);
}

function emptyRow(colspan) {
  return `<tr><td colspan="${colspan}"><div class="empty-state"><p>Nothing here yet.</p></div></td></tr>`;
}

function renderStudentTable() {
  document.getElementById('student-table').innerHTML = students.map(s => `
    <tr>
      <td class="mono">${s.roll}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.program}</td>
      <td>${s.loans}</td>
      <td>${s.fines > 0 ? '₹' + s.fines : '—'}</td>
      <td>${s.status === 'Active' ? '<span class="pill pill-sage">Active</span>' : '<span class="pill pill-crimson">Suspended</span>'}</td>
      <td class="row-actions"><button class="btn btn-sm" onclick="toast('Viewing profile for ${s.name}', 'ink')">View</button></td>
    </tr>
  `).join('');
}

function renderIssueReturnForm() {
  document.getElementById('issue-student').innerHTML = students.filter(s=>s.status==='Active').map(s => `<option value="${s.name}">${s.name} — ${s.roll}</option>`).join('');
  document.getElementById('issue-book').innerHTML = books.filter(b => b.available > 0).map(b => `<option value="${b.title}">${b.title} (${b.available} available)</option>`).join('');
  const d = new Date(); d.setDate(d.getDate() + 14);
  document.getElementById('issue-due').value = d.toISOString().slice(0,10);
}

function renderActiveLoans() {
  document.getElementById('active-loans-body').innerHTML = loans.map(l => {
    const daysLeft = Math.round((new Date(l.due) - new Date('2026-08-02')) / 86400000);
    return `
    <tr>
      <td><strong>${l.book}</strong></td>
      <td>${l.student}</td>
      <td class="mono">${l.due}</td>
      <td>${daysLeft < 0 ? `<span class="pill pill-crimson">${Math.abs(daysLeft)}d overdue</span>` : `<span class="pill pill-sage">${daysLeft}d left</span>`}</td>
      <td class="row-actions"><button class="btn btn-sm btn-brass" onclick="returnBook(${l.id})">Return</button></td>
    </tr>`;
  }).join('') || emptyRow(5);
}

function renderReservationsTable() {
  document.getElementById('reservation-table').innerHTML = reservations.map(r => `
    <tr>
      <td><strong>${r.book}</strong></td>
      <td>${r.student}</td>
      <td class="mono">${r.requested}</td>
      <td>${statusPill(r.status)}</td>
      <td class="row-actions">
        ${r.status === 'pending' ? `<button class="btn btn-sm btn-sage" onclick="approveReservation(${r.id})">Approve</button><button class="btn btn-sm" onclick="rejectReservation(${r.id})">Reject</button>` : '<span class="mono" style="opacity:.4">—</span>'}
      </td>
    </tr>
  `).join('') || emptyRow(5);
}

function statusPill(status) {
  if (status === 'pending') return '<span class="pill pill-brass">Pending</span>';
  if (status === 'approved') return '<span class="pill pill-sage">Approved</span>';
  return '<span class="pill pill-crimson">Rejected</span>';
}

function renderFineTable() {
  document.getElementById('fine-table').innerHTML = fines.map((f,i) => `
    <tr>
      <td><strong>${f.student}</strong></td>
      <td>${f.book}</td>
      <td>${f.days}</td>
      <td class="mono">₹${f.amount}</td>
      <td>${f.status === 'paid' ? '<span class="pill pill-sage">Paid</span>' : '<span class="pill pill-crimson">Unpaid</span>'}</td>
      <td class="row-actions">${f.status === 'unpaid' ? `<button class="btn btn-sm btn-brass" onclick="markFinePaid(${i})">Mark paid</button>` : '<span class="mono" style="opacity:.4">—</span>'}</td>
    </tr>
  `).join('') || emptyRow(6);
}

function renderStudentCatalog() {
  const rows = books.filter(b => bookCategoryFilter === 'All' || b.category === bookCategoryFilter);
  document.getElementById('student-catalog-grid').innerHTML = rows.map(b => `
    <div class="index-card" id="card-${b.id}">
      <div class="index-card-inner">
        <div class="card-face card-front" onclick="flipCard(${b.id})">
          <div class="spine-swatch" style="background:${spineColor(b.id)}"></div>
          <div class="cat">${b.category}</div>
          <div class="title">${b.title}</div>
          <div class="author">${b.author}</div>
          <div class="meta-row">
            <span class="avail-badge ${b.available>0?'yes':'no'}">${b.available>0? b.available+' available':'all issued'}</span>
            <span class="mono" style="opacity:.4;">flip →</span>
          </div>
        </div>
        <div class="card-face card-back" onclick="flipCard(${b.id})">
          <div class="accession">${b.accession}</div>
          <dl>
            <dt>Author</dt><dd>${b.author}</dd>
            <dt>Category</dt><dd>${b.category}</dd>
            <dt>Copies held</dt><dd>${b.copies} total, ${b.available} on shelf</dd>
          </dl>
          <div class="back-actions">
            <button class="btn btn-sm btn-sage" onclick="event.stopPropagation(); issueOrReserve(${b.id})">${b.available>0?'Issue to me':'Reserve'}</button>
          </div>
          <div class="flip-hint">click card to flip back</div>
        </div>
      </div>
    </div>
  `).join('');
}

function flipCard(id) {
  document.getElementById('card-' + id).classList.toggle('flipped');
}

function issueOrReserve(id) {
  const b = books.find(x => x.id === id);
  if (b.available > 0) {
    b.available -= 1;
    renderStudentCatalog();
    renderAdminCatalog();
    stamp('Issued', 'issue');
    toast(`"${b.title}" issued to your account — due in 14 days.`, 'sage');
  } else {
    stamp('Reserved', 'issue');
    toast(`"${b.title}" reserved — you'll be notified when it's back.`, 'ink');
  }
}

function renderStudentLoans() {
  const mini = loans.slice(0,3).map(l => `
    <tr><td><strong>${l.book}</strong></td><td class="mono">${l.due}</td><td>${l.status==='overdue'?'<span class="pill pill-crimson">Overdue</span>':'<span class="pill pill-sage">On time</span>'}</td>
    <td><button class="btn btn-sm btn-brass" onclick="stamp('Returned','return'); toast('Return recorded','sage')">Return</button></td></tr>
  `).join('');
  document.getElementById('student-loans-mini').innerHTML = mini;

  const full = loans.map(l => `
    <tr><td><strong>${l.book}</strong></td><td class="mono">${l.issued}</td><td class="mono">${l.due}</td>
    <td>${l.status==='overdue'?'<span class="pill pill-crimson">Overdue</span>':'<span class="pill pill-sage">On time</span>'}</td>
    <td><button class="btn btn-sm btn-brass" onclick="stamp('Returned','return'); toast('Return recorded','sage')">Return</button></td></tr>
  `).join('');
  document.getElementById('student-loans-full').innerHTML = full;
}

function renderStudentReservations() {
  document.getElementById('student-reservations-table').innerHTML = reservations.map(r => `
    <tr><td><strong>${r.book}</strong></td><td class="mono">${r.requested}</td><td>${statusPill(r.status)}</td>
    <td><button class="btn btn-sm" onclick="toast('Reservation cancelled','ink')">Cancel</button></td></tr>
  `).join('');
}

function renderStudentFines() {
  document.getElementById('student-fines-table').innerHTML = fines.map(f => `
    <tr><td>${f.book}</td><td>${f.days}</td><td class="mono">₹${f.amount}</td>
    <td>${f.status==='paid'?'<span class="pill pill-sage">Paid</span>':'<span class="pill pill-crimson">Unpaid</span>'}</td></tr>
  `).join('');
}

function renderActivityFeed() {
  const items = [
    ['Robin Antony returned', 'Clean Code', '2 min ago', 'sage'],
    ['Fine of ₹40 recorded for', 'Madhav A', '18 min ago', 'crimson'],
    ['Adithyan B reserved', 'Discrete Mathematics', '46 min ago', 'brass'],
    ['New title catalogued:', 'AI: A Modern Approach', '1 hr ago', 'ink'],
  ];
  document.getElementById('activity-feed').innerHTML = items.map(([a,b,t,c]) => `
    <div style="display:flex; gap:10px; align-items:flex-start; padding:9px 0; border-bottom:1px solid var(--line);">
      <span style="width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0;background:${c==='sage'?'var(--sage)':c==='crimson'?'var(--crimson)':c==='brass'?'var(--brass)':'var(--ink-soft)'}"></span>
      <div style="font-size:12.5px; line-height:1.4;"><strong>${b}</strong> — ${a}<div style="opacity:.45; font-size:10.5px; margin-top:2px;">${t}</div></div>
    </div>
  `).join('');
}

function renderDueSoon() {
  document.getElementById('due-soon-body').innerHTML = loans.map(l => `
    <tr>
      <td><strong>${l.book}</strong></td>
      <td>${l.student}</td>
      <td class="mono">${l.issued}</td>
      <td class="mono">${l.due}</td>
      <td>${l.status==='overdue' ? '<span class="pill pill-crimson">Overdue</span>' : '<span class="pill pill-sage">On time</span>'}</td>
      <td><button class="btn btn-sm" onclick="goView('issue-return')">Manage</button></td>
    </tr>
  `).join('');
}

function renderRecommendations() {
  const recs = books.filter(b=>b.category==='Computer Science').slice(0,3);
  document.getElementById('recommend-list').innerHTML = recs.map(b => `
    <div style="display:flex; gap:10px; align-items:center; padding:9px 0; border-bottom:1px solid var(--line);">
      <div style="width:5px;height:34px;border-radius:2px;background:${spineColor(b.id)}"></div>
      <div style="flex:1;"><strong style="font-size:12.5px;">${b.title}</strong><div style="font-size:11px; opacity:.55;">${b.author}</div></div>
      <button class="btn btn-sm" onclick="goView('s-catalog')">View</button>
    </div>
  `).join('');
}

function issueBook() {
  const student = document.getElementById('issue-student').value;
  const bookTitle = document.getElementById('issue-book').value;
  const due = document.getElementById('issue-due').value;
  if (!student || !bookTitle) { toast('Select a student and a book first', 'crimson'); return; }
  const b = books.find(x => x.title === bookTitle);
  if (b && b.available > 0) b.available -= 1;
  loans.unshift({ id: Date.now(), book: bookTitle, student, issued: '2026-08-02', due, status: 'active', daysOverdue: 0 });
  renderActiveLoans(); renderAdminCatalog(); renderIssueReturnForm(); renderDueSoon();
  stamp('Issued', 'issue');
  toast(`"${bookTitle}" issued to ${student}.`, 'sage');
}

function returnBook(id) {
  const l = loans.find(x => x.id === id);
  if (!l) return;
  const b = books.find(x => x.title === l.book);
  if (b) b.available = Math.min(b.copies, b.available + 1);
  loans = loans.filter(x => x.id !== id);
  renderActiveLoans(); renderAdminCatalog(); renderIssueReturnForm(); renderDueSoon();
  stamp('Returned', 'return');
  toast(`"${l.book}" marked as returned.`, 'sage');
}

function approveReservation(id) {
  const r = reservations.find(x => x.id === id);
  if (r) r.status = 'approved';
  renderReservationsTable();
  stamp('Approved', 'approve');
  toast(`Reservation for "${r.book}" approved.`, 'sage');
}

function rejectReservation(id) {
  const r = reservations.find(x => x.id === id);
  if (r) r.status = 'rejected';
  renderReservationsTable();
  toast(`Reservation for "${r.book}" rejected.`, 'crimson');
}

function markFinePaid(i) {
  fines[i].status = 'paid';
  renderFineTable();
  stamp('Settled', 'fine');
  toast(`Fine of ₹${fines[i].amount} marked as paid.`, 'sage');
}

let editingBookId = null;
function openBookModal(id) {
  editingBookId = id || null;
  const overlay = document.getElementById('book-modal-overlay');
  document.getElementById('book-modal-title').textContent = id ? 'Edit book' : 'Add new book';
  if (id) {
    const b = books.find(x => x.id === id);
    document.getElementById('bf-title').value = b.title;
    document.getElementById('bf-author').value = b.author;
    document.getElementById('bf-category').value = b.category;
    document.getElementById('bf-accession').value = b.accession;
    document.getElementById('bf-copies').value = b.copies;
  } else {
    document.getElementById('bf-title').value = '';
    document.getElementById('bf-author').value = '';
    document.getElementById('bf-category').value = 'Computer Science';
    document.getElementById('bf-accession').value = '';
    document.getElementById('bf-copies').value = 1;
  }
  overlay.classList.add('open');
}
function closeBookModal() { document.getElementById('book-modal-overlay').classList.remove('open'); }

function saveBook() {
  const title = document.getElementById('bf-title').value.trim();
  const author = document.getElementById('bf-author').value.trim();
  const category = document.getElementById('bf-category').value;
  const accession = document.getElementById('bf-accession').value.trim() || 'ACC-' + Math.floor(1000+Math.random()*9000);
  const copies = parseInt(document.getElementById('bf-copies').value) || 1;
  if (!title || !author) { toast('Title and author are required', 'crimson'); return; }

  if (editingBookId) {
    const b = books.find(x => x.id === editingBookId);
    Object.assign(b, { title, author, category, accession, copies });
  } else {
    books.push({ id: Date.now(), title, author, category, accession, copies, available: copies });
  }
  closeBookModal();
  renderAdminCatalog(); renderStudentCatalog(); renderCatalogChips(); renderIssueReturnForm();
  toast(`"${title}" saved to catalog.`, 'sage');
}

function deleteBook(id) {
  const b = books.find(x => x.id === id);
  books = books.filter(x => x.id !== id);
  renderAdminCatalog(); renderStudentCatalog(); renderIssueReturnForm();
  toast(`"${b.title}" removed from catalog.`, 'crimson');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('global-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.accession.toLowerCase().includes(q));
    const grid = document.getElementById('student-catalog-grid');
    if (grid) {
      grid.innerHTML = filtered.map(b => `
        <div class="index-card" id="card-${b.id}">
          <div class="index-card-inner">
            <div class="card-face card-front" onclick="flipCard(${b.id})">
              <div class="spine-swatch" style="background:${spineColor(b.id)}"></div>
              <div class="cat">${b.category}</div>
              <div class="title">${b.title}</div>
              <div class="author">${b.author}</div>
              <div class="meta-row"><span class="avail-badge ${b.available>0?'yes':'no'}">${b.available>0? b.available+' available':'all issued'}</span></div>
            </div>
            <div class="card-face card-back" onclick="flipCard(${b.id})">
              <div class="accession">${b.accession}</div>
              <dl><dt>Author</dt><dd>${b.author}</dd><dt>Category</dt><dd>${b.category}</dd></dl>
              <div class="back-actions"><button class="btn btn-sm btn-sage" onclick="event.stopPropagation(); issueOrReserve(${b.id})">${b.available>0?'Issue to me':'Reserve'}</button></div>
            </div>
          </div>
        </div>`).join('');
    }
  });
});

let chartCirc, chartCat, chartStatus, chartMonthly;

function renderDashboardChart() {
  const ctx = document.getElementById('chartCirculation');
  if (!ctx) return;
  if (chartCirc) chartCirc.destroy();
  chartCirc = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['W1','W2','W3','W4','W5','W6','W7','W8'],
      datasets: [{
        label: 'Issues',
        data: [58,64,49,72,80,66,91,84],
        borderColor: '#B8873D',
        backgroundColor: 'rgba(184,135,61,0.12)',
        tension: 0.35, fill: true, pointRadius: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { grid: { color: 'rgba(28,43,57,0.06)' } }, x: { grid: { display: false } } }
    }
  });
}

function renderCharts() {
  const catCtx = document.getElementById('chartCategory');
  if (chartCat) chartCat.destroy();
  chartCat = new Chart(catCtx, {
    type: 'bar',
    data: {
      labels: ['Computer Science','Mathematics','Engineering','Business','Literature'],
      datasets: [{ data: [412, 188, 96, 74, 61], backgroundColor: ['#B8873D','#4E6B52','#3A5A78','#9B3E3E','#7A5C3E'], borderRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { grid: { color: 'rgba(28,43,57,0.06)' } }, x: { grid: { display: false } } } }
  });

  const statusCtx = document.getElementById('chartStatus');
  if (chartStatus) chartStatus.destroy();
  chartStatus = new Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: ['On shelf','Issued','Overdue','Reserved'],
      datasets: [{ data: [742, 325, 17, 32], backgroundColor: ['#4E6B52','#B8873D','#9B3E3E','#3A5A78'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10.5 } } } } }
  });

  const monthCtx = document.getElementById('chartMonthly');
  if (chartMonthly) chartMonthly.destroy();
  chartMonthly = new Chart(monthCtx, {
    type: 'bar',
    data: {
      labels: ['Mar','Apr','May','Jun','Jul','Aug'],
      datasets: [
        { label: 'Issued', data: [210,240,190,260,300,120], backgroundColor: '#B8873D', borderRadius: 3 },
        { label: 'Returned', data: [198,225,205,240,270,60], backgroundColor: '#4E6B52', borderRadius: 3 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10.5 } } } },
      scales: { y: { grid: { color: 'rgba(28,43,57,0.06)' } }, x: { grid: { display: false } } } }
  });
}