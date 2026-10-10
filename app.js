const API_BASE = 'http://localhost:8080/api';

const SPINE_COLORS = ['#B8873D', '#4E6B52', '#9B3E3E', '#3A5A78', '#7A5C3E', '#5C4A78'];

let books = [];
let students = [];
let loans = [];
let reservations = [];
let fines = [];

function getMyLoans() {
  return loans.filter(l =>
    Number(l.student_id) === Number(currentStudentId)
  );
}

function getMyReservations() {
  return reservations.filter(r =>
    Number(r.student_id) === Number(currentStudentId)
  );
}

function getMyFines() {
  return fines.filter(f => {
    const student = students.find(s =>
      s.name === f.student
    );

    return student &&
      Number(student.id) === Number(currentStudentId);
  });
}
let currentRole = 'admin';
let currentStudentId = null;
let bookCategoryFilter = 'All';
let editingBookId = null;

function setRole(role) {
  currentRole = role;
  document.getElementById('role-admin-btn').classList.toggle('active', role === 'admin');
  document.getElementById('role-student-btn').classList.toggle('active', role === 'student');
  document.getElementById('login-id-label').textContent = role === 'admin' ? 'Admin ID' : 'Roll Number';
  document.getElementById('login-id').placeholder = role === 'admin' ? 'e.g. LIB-ADM-002' : 'e.g. 25014';
}


async function doLogin(e) {
  e.preventDefault();

  const loginId = document.getElementById('login-id').value.trim();
  const password = document.getElementById('login-pass').value;

  if (!loginId || !password) {
    alert('Please enter your ID and password.');
    return false;
  }

  const endpoint = currentRole === 'admin'
    ? '/api/auth/admin-login'
    : '/api/auth/student-login';

  const requestBody = currentRole === 'admin'
    ? { admin_id: loginId, password: password }
    : { student_id: loginId, password: password };

  try {
    const response = await fetch(
      `http://localhost:8080${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Login failed. Check your ID and password.');
      return false;
    }
    // Store the ID of the student who successfully logged in.
currentStudentId = currentRole === 'student'
  ? Number(result.student_id ?? result.studentId ?? loginId)
  : null;

    // Open the app only after the backend approves login.
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    const displayName = currentRole === 'admin'
      ? 'Library Admin'
      : result.name;

    document.getElementById('nav-admin').classList.toggle(
      'hidden', currentRole !== 'admin'
    );
    document.getElementById('nav-student').classList.toggle(
      'hidden', currentRole !== 'student'
    );

    document.getElementById('user-name').textContent = displayName;
    document.getElementById('user-role').textContent = currentRole;
    document.getElementById('user-avatar').textContent =
      displayName.slice(0, 2).toUpperCase();

    goView(currentRole === 'admin' ? 'dashboard' : 's-dashboard');

    await loadAllFromDatabase();

  } catch (error) {
    console.error('Login error:', error);
    alert('Cannot connect to the backend. Make sure Spring Boot is running on port 8080.');
  }

  return false;
}

function doLogout() {
  currentStudentId = null;
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
    dashboard: ['Overview', 'Dashboard'],
    catalog: ['Catalog', 'Book Catalog'],
    students: ['Circulation', 'Students'],
    'issue-return': ['Circulation', 'Issue & Return'],
    reservations: ['Circulation', 'Reservations'],
    fines: ['Circulation', 'Fines'],
    reports: ['Insights', 'Reports'],
    's-dashboard': ['Overview', 'My Dashboard'],
    's-catalog': ['Library', 'Browse & Search'],
    's-loans': ['Library', 'My Loans'],
    's-reservations': ['Library', 'My Reservations'],
    's-fines': ['Library', 'My Fines']
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
  if (!layer) return;
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
  if (!stack) return;
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

function spineColor(id) {
  return SPINE_COLORS[id % SPINE_COLORS.length];
}

async function loadAllFromDatabase() {
  await Promise.allSettled([
    loadBooksFromDatabase(),
    loadStudentsFromDatabase(),
    loadLoansFromDatabase(),
    loadReservationsFromDatabase(),
    loadFinesFromDatabase(),
    loadDashboardStats()
  ]);
  renderAll();
}

function renderStudentDashboardStats() {
  if (!currentStudentId) return;

  const myLoans = getMyLoans();
  const myReservations = getMyReservations();
  const myFines = getMyFines();

  // Books currently on loan: exclude returned books.
  const activeLoans = myLoans.filter(
    loan => loan.status === 'issued' || loan.status === 'overdue'
  );

  // Count pending or approved reservations.
  const activeReservations = myReservations.filter(
    reservation =>
      reservation.status === 'pending' ||
      reservation.status === 'approved'
  );

  // Sum unpaid fines.
  const pendingFines = myFines
    .filter(fine => fine.status === 'pending' || fine.status === 'unpaid')
    .reduce((total, fine) => total + Number(fine.amount || 0), 0);

  // Count books returned during the current calendar year.
  const currentYear = new Date().getFullYear();
  const booksRead = myLoans.filter(loan => {
    if (loan.status !== 'returned' || !loan.return_date) return false;

    const returnDate = new Date(loan.return_date);
    return !Number.isNaN(returnDate.getTime()) &&
      returnDate.getFullYear() === currentYear;
  }).length;

  document.getElementById('student-stat-loans').textContent =
    activeLoans.length;

  document.getElementById('student-stat-reservations').textContent =
    activeReservations.length;

  document.getElementById('student-stat-fines').textContent =
    '₹' + pendingFines.toFixed(2);

  document.getElementById('student-stat-books-read').textContent =
    booksRead;
}
function renderAll() {
  renderStudentDashboardStats(); // Add this line

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

async function loadBooksFromDatabase() {
  try {
    const response = await fetch(`${API_BASE}/books`);
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    const data = await response.json();

    books = data.map(b => ({
      id: b.book_id,
      book_id: b.book_id,
      title: b.title,
      author: b.author_name || 'Unknown Author',
      author_name: b.author_name,
      category: b.category_name || 'General',
      category_id: b.category_id,
      publisher_id: b.publisher_id,
      publisher: b.publisher_name || 'Publisher',
      accession: 'ACC-' + b.book_id,
      copies: b.total_copies ?? 0,
      available: b.available_copies ?? 0,
      isbn: b.isbn,
      publicationYear: b.publication_year
    }));

    renderAdminCatalog();
    renderStudentCatalog();
    renderIssueReturnForm();
    renderCatalogChips();
    renderRecommendations();
  } catch (err) {
    console.error('Failed loading books:', err);
    toast('Could not load books from PostgreSQL.', 'crimson');
  }
}

async function loadStudentsFromDatabase() {
  try {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    const data = await response.json();

    students = data.map(s => ({
      id: s.student_id,
      roll: 'STU-' + s.student_id,
      name: s.name,
      email: s.email,
      phone: s.phone || 'N/A',
      program: s.department || 'Computer Science',
      loans: s.active_loans ?? 0,
      fines: s.total_fines ?? 0,
      status: 'Active'
    }));

    renderStudentTable();
    renderIssueReturnForm();
  } catch (err) {
    console.error('Failed loading students:', err);
  }
}

async function loadLoansFromDatabase() {
  try {
    const response = await fetch(`${API_BASE}/loans`);
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    const data = await response.json();

    loans = data.map(l => ({
      id: l.borrow_id,
      borrow_id: l.borrow_id,
      book: l.book_title,
      book_id: l.book_id,
      student: l.student_name,
      student_id: l.student_id,
      accession: l.accession_number,
      issued: l.issue_date,
      due: l.due_date,
      return_date: l.return_date,
      status: l.status.toLowerCase(),
      daysOverdue: l.days_overdue ?? 0,
      fineAmount: l.fine_amount ?? 0
    }));

    renderActiveLoans();
    renderDueSoon();
    renderStudentLoans();
  } catch (err) {
    console.error('Failed loading loans:', err);
  }
}

async function loadReservationsFromDatabase() {
  try {
    const response = await fetch(`${API_BASE}/reservations`);
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    const data = await response.json();

    reservations = data.map(r => ({
      id: r.reservation_id,
      reservation_id: r.reservation_id,
      book: r.book_title,
      book_id: r.book_id,
      student: r.student_name,
      student_id: r.student_id,
      requested: r.reservation_date,
      status: r.status.toLowerCase()
    }));

    renderReservationsTable();
    renderStudentReservations();
  } catch (err) {
    console.error('Failed loading reservations:', err);
  }
}

async function loadFinesFromDatabase() {
  try {
    const response = await fetch(`${API_BASE}/fines`);
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    const data = await response.json();

    fines = data.map(f => ({
      id: f.fine_id,
      fine_id: f.fine_id,
      student: f.student_name,
      book: f.book_title,
      days: f.overdue_days ?? 0,
      amount: f.amount,
      status: f.payment_status.toLowerCase()
    }));

    renderFineTable();
    renderStudentFines();
  } catch (err) {
    console.error('Failed loading fines:', err);
  }
}

async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    const stats = await response.json();

    const elBooks = document.getElementById('stat-total-books');
    const elLoans = document.getElementById('stat-active-loans');
    const elOverdue = document.getElementById('stat-overdue');
    const elFines = document.getElementById('stat-outstanding-fines');

    if (elBooks) elBooks.textContent = stats.total_books ?? 0;
    if (elLoans) elLoans.textContent = stats.active_loans ?? 0;
    if (elOverdue) elOverdue.textContent = stats.pending_reservations ?? 0;
    if (elFines) elFines.textContent = '₹' + (stats.outstanding_fines ?? 0).toFixed(2);
  } catch (err) {
    console.error('Failed loading dashboard stats:', err);
  }
}

function categories() {
  return ['All', ...new Set(books.map(b => b.category))];
}

function renderCatalogChips() {
  const cats = categories();

  const adminHtml = cats.map(c =>
    `<span class="chip ${c === bookCategoryFilter ? 'active' : ''}" onclick="filterCategory('${c}','admin')">${c}</span>`
  ).join('');

  const studentHtml = cats.map(c =>
    `<span class="chip ${c === bookCategoryFilter ? 'active' : ''}" onclick="filterCategory('${c}','student')">${c}</span>`
  ).join('');

  const elAdminChips = document.getElementById('admin-catalog-chips');
  const elStudentChips = document.getElementById('student-catalog-chips');

  if (elAdminChips) elAdminChips.innerHTML = adminHtml;
  if (elStudentChips) elStudentChips.innerHTML = studentHtml;
}

function filterCategory(cat, who) {
  bookCategoryFilter = cat;
  renderCatalogChips();
  renderAdminCatalog();
  renderStudentCatalog();
}

function renderAdminCatalog() {
  const rows = books.filter(b => bookCategoryFilter === 'All' || b.category === bookCategoryFilter);
  const elTable = document.getElementById('admin-book-table');
  if (!elTable) return;

  elTable.innerHTML = rows.map(b => `
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
  const el = document.getElementById('student-table');
  if (!el) return;

  el.innerHTML = students.map(s => `
    <tr>
      <td class="mono">${s.roll}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.program}</td>
      <td>${s.loans}</td>
      <td>${s.fines > 0 ? '₹' + s.fines : '—'}</td>
      <td><span class="pill pill-sage">${s.status}</span></td>
      <td class="row-actions">
        <button class="btn btn-sm"
          onclick="viewStudentDetails(${s.id})">
          View Details
        </button>
        <button class="btn btn-sm"
          onclick="deleteStudent(${s.id})">
          Delete
        </button>
      </td>
    </tr>
  `).join('') || emptyRow(7);
}

function viewStudentDetails(studentId) {
  const student = students.find(s => Number(s.id) === Number(studentId));

  if (!student) {
    toast('Student not found.', 'crimson');
    return;
  }

  alert(
    'STUDENT DETAILS\n\n' +
    'Student ID: ' + student.id + '\n' +
    'Roll Number: ' + student.roll + '\n' +
    'Name: ' + student.name + '\n' +
    'Email: ' + student.email + '\n' +
    'Phone: ' + student.phone + '\n' +
    'Department: ' + student.program + '\n' +
    'Active Loans: ' + student.loans + '\n' +
    'Total Fines: ₹' + student.fines + '\n' +
    'Status: ' + student.status
  );
}


function renderIssueReturnForm() {
  const elStudent = document.getElementById('issue-student');
  const elBook = document.getElementById('issue-book');
  const elDue = document.getElementById('issue-due');

  if (elStudent) {
    elStudent.innerHTML = students.map(s =>
      `<option value="${s.id}">${s.name} (ID: ${s.id})</option>`
    ).join('') || '<option value="">No students available</option>';
  }

  if (elBook) {
    elBook.innerHTML = books.filter(b => b.available > 0).map(b =>
      `<option value="${b.id}">${b.title} (${b.available} available)</option>`
    ).join('') || '<option value="">No available books</option>';
  }

  if (elDue) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    elDue.value = d.toISOString().slice(0, 10);
  }
}

function renderActiveLoans() {
  const el = document.getElementById('active-loans-body');
  if (!el) return;

  const active = loans.filter(l => l.status === 'issued' || l.status === 'overdue');

  el.innerHTML = active.map(l => {
    const daysLeft = Math.round((new Date(l.due) - new Date()) / 86400000);

    return `
      <tr>
        <td><strong>${l.book}</strong></td>
        <td>${l.student}</td>
        <td class="mono">${l.due}</td>
        <td>${daysLeft < 0
          ? `<span class="pill pill-crimson">${Math.abs(daysLeft)}d overdue</span>`
          : `<span class="pill pill-sage">${daysLeft}d left</span>`}</td>
        <td class="row-actions">
          <button class="btn btn-sm btn-brass" onclick="returnBook(${l.borrow_id})">Return</button>
        </td>
      </tr>`;
  }).join('') || emptyRow(5);
}

function renderReservationsTable() {
  const el = document.getElementById('reservation-table');
  if (!el) return;

  el.innerHTML = reservations.map(r => `
    <tr>
      <td><strong>${r.book}</strong></td>
      <td>${r.student}</td>
      <td class="mono">${r.requested}</td>
      <td>${statusPill(r.status)}</td>
      <td class="row-actions">
        ${r.status === 'pending'
          ? `<button class="btn btn-sm btn-sage" onclick="approveReservation(${r.reservation_id})">Approve</button>
             <button class="btn btn-sm" onclick="rejectReservation(${r.reservation_id})">Reject</button>`
          : '<span class="mono" style="opacity:.4">—</span>'}
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
  const el = document.getElementById('fine-table');
  if (!el) return;

  el.innerHTML = fines.map(f => `
    <tr>
      <td><strong>${f.student}</strong></td>
      <td>${f.book}</td>
      <td>${f.days}</td>
      <td class="mono">₹${f.amount}</td>
      <td>${f.status === 'paid' ? '<span class="pill pill-sage">Paid</span>' : '<span class="pill pill-crimson">Unpaid</span>'}</td>
      <td class="row-actions">
        ${f.status === 'pending' || f.status === 'unpaid'
          ? `<button class="btn btn-sm btn-brass" onclick="markFinePaid(${f.id})">Mark paid</button>`
          : '<span class="mono" style="opacity:.4">—</span>'}
      </td>
    </tr>
  `).join('') || emptyRow(6);
}

function renderStudentCatalog() {
  const el = document.getElementById('student-catalog-grid');
  if (!el) return;

  const rows = books.filter(b => bookCategoryFilter === 'All' || b.category === bookCategoryFilter);

  el.innerHTML = rows.map(b => `
    <div class="index-card" id="card-${b.id}">
      <div class="index-card-inner">
        <div class="card-face card-front" onclick="flipCard(${b.id})">
          <div class="spine-swatch" style="background:${spineColor(b.id)}"></div>
          <div class="cat">${b.category}</div>
          <div class="title">${b.title}</div>
          <div class="author">${b.author}</div>
          <div class="meta-row">
            <span class="avail-badge ${b.available > 0 ? 'yes' : 'no'}">${b.available > 0 ? b.available + ' available' : 'all issued'}</span>
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
            <button class="btn btn-sm btn-sage" onclick="event.stopPropagation(); issueOrReserve(${b.id})">${b.available > 0 ? 'Issue to me' : 'Reserve'}</button>
          </div>
          <div class="flip-hint">click card to flip back</div>
        </div>
      </div>
    </div>
  `).join('');
}

function flipCard(id) {
  const card = document.getElementById('card-' + id);
  if (card) card.classList.toggle('flipped');
}

async function issueOrReserve(bookId) {
  const b = books.find(x => Number(x.id) === Number(bookId));
  if (!b) return;

  const studentId = currentStudentId;

if (!studentId) {
  toast('Please log in as a student first.', 'crimson');
  return;
}

  if (b.available > 0) {
    try {
      const response = await fetch(`${API_BASE}/loans/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, book_id: bookId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to issue book');
      stamp('Issued', 'issue');
      toast(`"${b.title}" issued to your account.`, 'sage');
      await loadAllFromDatabase();
    } catch (err) {
      toast(err.message, 'crimson');
    }
  } else {
    try {
      const response = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, book_id: bookId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to reserve book');
      stamp('Reserved', 'issue');
      toast(`"${b.title}" reserved successfully.`, 'sage');
      await loadAllFromDatabase();
    } catch (err) {
      toast(err.message, 'crimson');
    }
  }
}


function renderStudentLoans() {
  const elMini = document.getElementById('student-loans-mini');
  const elFull = document.getElementById('student-loans-full');

  // Only get loans belonging to the logged-in student.
  const myLoans = getMyLoans();

  if (elMini) {
    const recentLoans = myLoans.slice(0, 3);

    elMini.innerHTML = recentLoans.map(l => `
      <tr>
        <td><strong>${l.book}</strong></td>
        <td class="mono">${l.due || '—'}</td>
        <td>
          ${l.status === 'overdue'
            ? '<span class="pill pill-crimson">Overdue</span>'
            : l.status === 'returned'
              ? '<span class="pill pill-sage">Returned</span>'
              : '<span class="pill pill-sage">On time</span>'}
        </td>
        <td>
          ${l.status !== 'returned'
            ? `<button class="btn btn-sm btn-brass" onclick="returnBook(${l.borrow_id})">Return</button>`
            : '—'}
        </td>
      </tr>
    `).join('') || emptyRow(4);
  }

  if (elFull) {
    elFull.innerHTML = myLoans.map(l => `
      <tr>
        <td><strong>${l.book}</strong></td>
        <td class="mono">${l.issued || '—'}</td>
        <td class="mono">${l.due || '—'}</td>
        <td>
          ${l.status === 'overdue'
            ? '<span class="pill pill-crimson">Overdue</span>'
            : l.status === 'returned'
              ? '<span class="pill pill-sage">Returned</span>'
              : '<span class="pill pill-sage">On time</span>'}
        </td>
        <td>
          ${l.status !== 'returned'
            ? `<button class="btn btn-sm btn-brass" onclick="returnBook(${l.borrow_id})">Return</button>`
            : '<span class="mono">Returned</span>'}
        </td>
      </tr>
    `).join('') || emptyRow(5);
  }
}

function renderStudentReservations() {
  const el = document.getElementById('student-reservations-table');
  if (!el) return;

  const myReservations = getMyReservations();

  el.innerHTML = myReservations.map(r => `
    <tr>
      <td><strong>${r.book}</strong></td>
      <td class="mono">${r.requested}</td>
      <td>${statusPill(r.status)}</td>
      <td>—</td>
    </tr>
  `).join('') || emptyRow(4);
}


function renderStudentFines() {
  const el = document.getElementById('student-fines-table');
  if (!el) return;

  const myFines = getMyFines();

  el.innerHTML = myFines.map(f => `
    <tr>
      <td>${f.book}</td>
      <td>${f.days}</td>
      <td class="mono">₹${f.amount}</td>
      <td>${f.status === 'paid'
        ? '<span class="pill pill-sage">Paid</span>'
        : '<span class="pill pill-crimson">Unpaid</span>'}
      </td>
    </tr>
  `).join('') || emptyRow(4);
}

function renderActivityFeed() {
  const el = document.getElementById('activity-feed');
  if (!el) return;

  const items = [
    ['Circulation updated via PostgreSQL', 'Live Database', 'Just now', 'sage'],
    ['Fine tracking synced with DB', 'System Engine', '5 min ago', 'crimson'],
    ['Book reservation engine active', 'Smart Circulation', '12 min ago', 'brass'],
    ['BookVerse Backend online at', 'localhost:8080', 'Active', 'ink']
  ];

  el.innerHTML = items.map(([a, b, t, c]) => `
    <div style="display:flex; gap:10px; align-items:flex-start; padding:9px 0; border-bottom:1px solid var(--line);">
      <span style="width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0;background:${c === 'sage' ? 'var(--sage)' : c === 'crimson' ? 'var(--crimson)' : c === 'brass' ? 'var(--brass)' : 'var(--ink-soft)'}"></span>
      <div style="font-size:12.5px; line-height:1.4;">
        <strong>${b}</strong> — ${a}
        <div style="opacity:.45; font-size:10.5px; margin-top:2px;">${t}</div>
      </div>
    </div>
  `).join('');
}

function renderDueSoon() {
  const el = document.getElementById('due-soon-body');
  if (!el) return;

  const dueList = loans.filter(l => l.status === 'issued' || l.status === 'overdue');

  el.innerHTML = dueList.map(l => `
    <tr>
      <td><strong>${l.book}</strong></td>
      <td>${l.student}</td>
      <td class="mono">${l.issued}</td>
      <td class="mono">${l.due}</td>
      <td>${l.status === 'overdue' ? '<span class="pill pill-crimson">Overdue</span>' : '<span class="pill pill-sage">On time</span>'}</td>
      <td><button class="btn btn-sm" onclick="goView('issue-return')">Manage</button></td>
    </tr>
  `).join('') || emptyRow(6);
}

function renderRecommendations() {
  const el = document.getElementById('recommend-list');
  if (!el) return;

  const recs = books.slice(0, 3);

  el.innerHTML = recs.map(b => `
    <div style="display:flex; gap:10px; align-items:center; padding:9px 0; border-bottom:1px solid var(--line);">
      <div style="width:5px;height:34px;border-radius:2px;background:${spineColor(b.id)}"></div>
      <div style="flex:1;">
        <strong style="font-size:12.5px;">${b.title}</strong>
        <div style="font-size:11px; opacity:.55;">${b.author}</div>
      </div>
      <button class="btn btn-sm" onclick="goView('s-catalog')">View</button>
    </div>
  `).join('') || '<div style="font-size:12px; opacity:.6;">No recommendations right now</div>';
}

async function issueBook() {
  const studentId = document.getElementById('issue-student').value;
  const bookId = document.getElementById('issue-book').value;
  const due = document.getElementById('issue-due').value;

  if (!studentId || !bookId) {
    toast('Select a student and a book first', 'crimson');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/loans/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: parseInt(studentId, 10),
        book_id: parseInt(bookId, 10),
        due_date: due
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not issue book');
    }

    stamp('Issued', 'issue');
    toast(`Book issued successfully!`, 'sage');
    await loadAllFromDatabase();

  } catch (err) {
    console.error('Issue error:', err);
    toast(err.message, 'crimson');
  }
}

async function returnBook(borrowId) {
  try {
    const response = await fetch(`${API_BASE}/loans/return/${borrowId}`, {
      method: 'POST'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not return book');
    }

    stamp('Returned', 'return');
    toast(result.message || 'Book returned successfully!', 'sage');
    await loadAllFromDatabase();

  } catch (err) {
    console.error('Return error:', err);
    toast(err.message, 'crimson');
  }
}

async function approveReservation(id) {
  try {
    const response = await fetch(`${API_BASE}/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to approve');

    stamp('Approved', 'approve');
    toast('Reservation approved.', 'sage');
    await loadAllFromDatabase();
  } catch (err) {
    toast(err.message, 'crimson');
  }
}

async function rejectReservation(id) {
  try {
    const response = await fetch(`${API_BASE}/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to reject');

    toast('Reservation rejected.', 'crimson');
    await loadAllFromDatabase();
  } catch (err) {
    toast(err.message, 'crimson');
  }
}

async function markFinePaid(fineId) {
  try {
    const response = await fetch(`${API_BASE}/fines/${fineId}/pay`, {
      method: 'PUT'
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to update fine');

    stamp('Settled', 'fine');
    toast('Fine marked as paid.', 'sage');
    await loadAllFromDatabase();
  } catch (err) {
    toast(err.message, 'crimson');
  }
}

function openBookModal(id) {
  editingBookId = id ?? null;

  const overlay = document.getElementById('book-modal-overlay');
  const isEditing = id !== null && id !== undefined;

  document.getElementById('book-modal-title').textContent =
    isEditing ? 'Edit book' : 'Add new book';

  if (isEditing) {
    const b = books.find(x => Number(x.id ?? x.book_id) === Number(id));

    if (!b) {
      toast('Book not found', 'crimson');
      return;
    }

    document.getElementById('bf-title').value = b.title ?? '';
    document.getElementById('bf-author').value = b.author_name ?? b.author ?? '';

    const categorySelect = document.getElementById('bf-category');
    if (b.category_id) {
      categorySelect.value = String(b.category_id);
    } else {
      categorySelect.selectedIndex = 0;
    }

    document.getElementById('bf-accession').value = '';
    document.getElementById('bf-copies').value = b.copies ?? 1;

  } else {
    document.getElementById('bf-title').value = '';
    document.getElementById('bf-author').value = '';
    document.getElementById('bf-category').selectedIndex = 0;
    document.getElementById('bf-accession').value = '';
    document.getElementById('bf-copies').value = 1;
  }

  overlay.classList.add('open');
}

function closeBookModal() {
  document.getElementById('book-modal-overlay').classList.remove('open');
}

function openStudentModal() {
  document.getElementById('sf-id').value = '';
  document.getElementById('sf-name').value = '';
  document.getElementById('sf-email').value = '';
  document.getElementById('sf-phone').value = '';
  document.getElementById('sf-dept').value = 'Computer Science';
  document.getElementById('student-modal-overlay').classList.add('open');
}

function closeStudentModal() {
  document.getElementById('student-modal-overlay').classList.remove('open');
}


async function saveStudent() {
  const idVal = document.getElementById('sf-id').value.trim();
  const name = document.getElementById('sf-name').value.trim();
  const email = document.getElementById('sf-email').value.trim();
  const phone = document.getElementById('sf-phone').value.trim();
  const dept = document.getElementById('sf-dept').value.trim();
  const password = document.getElementById('sf-password').value;
  const confirmPassword =
    document.getElementById('sf-confirm-password').value;

  if (!name || !email) {
    toast('Student Name and Email are required.', 'crimson');
    return;
  }

  if (!password || !confirmPassword) {
    toast('Please create and confirm a password.', 'crimson');
    return;
  }

  if (password.length < 8) {
    toast('Password must be at least 8 characters.', 'crimson');
    return;
  }

  if (password !== confirmPassword) {
    toast('Passwords do not match.', 'crimson');
    return;
  }

  const payload = {
    name,
    email,
    phone: phone || null,
    department: dept || 'Computer Science',
    password
  };

  if (idVal) {
    payload.student_id = parseInt(idVal, 10);
  }

  try {
    const response = await fetch(`${API_BASE}/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not register student.');
    }

    closeStudentModal();

    toast(
      `Student registered! Student ID: ${result.student_id}`,
      'sage'
    );

    await loadAllFromDatabase();

  } catch (err) {
    console.error('Student registration error:', err);
    toast(err.message || 'Registration failed.', 'crimson');
  }
}
async function saveBook() {
  const title = document.getElementById('bf-title').value.trim();
  const author = document.getElementById('bf-author').value.trim();
  const categoryId = Number(document.getElementById('bf-category').value);
  const accession = document.getElementById('bf-accession').value.trim();
  const copies = parseInt(document.getElementById('bf-copies').value, 10) || 1;

  if (!title || !author) {
    toast('Title and author are required', 'crimson');
    return;
  }

  if (!Number.isInteger(categoryId) || categoryId < 1 || categoryId > 5) {
    toast('Please select a valid category', 'crimson');
    return;
  }

  if (copies < 1) {
    toast('At least one copy is required', 'crimson');
    return;
  }

  const existingBook = editingBookId
    ? books.find(b => Number(b.id ?? b.book_id) === Number(editingBookId))
    : null;

  const payload = {
    title,
    author_name: author,
    isbn: existingBook ? existingBook.isbn : `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    publication_year: existingBook?.publicationYear || new Date().getFullYear(),
    category_id: categoryId,
    publisher_id: existingBook?.publisher_id || 1,
    copies: existingBook ? 1 : copies
  };

  if (accession) {
    payload.accession_number = parseInt(accession, 10);
  }

  if (existingBook) {
    payload.book_id = existingBook.id;
  }

  try {
    const response = await fetch(
      existingBook ? `${API_BASE}/books/${existingBook.id}` : `${API_BASE}/books`,
      {
        method: existingBook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not save book');
    }

    closeBookModal();
    await loadAllFromDatabase();

    toast(`"${title}" saved to PostgreSQL.`, 'sage');
  } catch (error) {
    console.error('Saving book failed:', error);
    toast(error.message || 'Could not save book. Check backend.', 'crimson');
  }
}

async function deleteBook(id) {
  const b = books.find(x => Number(x.id ?? x.book_id) === Number(id));
  const bookTitle = b ? b.title : `Book #${id}`;

  if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not delete book');
    }

    toast(`"${bookTitle}" deleted successfully.`, 'sage');
    await loadAllFromDatabase();
  } catch (error) {
    console.error('Delete book error:', error);
    toast(error.message || 'Could not delete book. Check backend logs.', 'crimson');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();

    const filtered = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.accession.toLowerCase().includes(q) ||
      (b.isbn && b.isbn.toLowerCase().includes(q))
    );

    const grid = document.getElementById('student-catalog-grid');
    if (!grid) return;

    grid.innerHTML = filtered.map(b => `
      <div class="index-card" id="card-${b.id}">
        <div class="index-card-inner">
          <div class="card-face card-front" onclick="flipCard(${b.id})">
            <div class="spine-swatch" style="background:${spineColor(b.id)}"></div>
            <div class="cat">${b.category}</div>
            <div class="title">${b.title}</div>
            <div class="author">${b.author}</div>
            <div class="meta-row">
              <span class="avail-badge ${b.available > 0 ? 'yes' : 'no'}">${b.available > 0 ? b.available + ' available' : 'all issued'}</span>
            </div>
          </div>
          <div class="card-face card-back" onclick="flipCard(${b.id})">
            <div class="accession">${b.accession}</div>
            <dl>
              <dt>Author</dt><dd>${b.author}</dd>
              <dt>Category</dt><dd>${b.category}</dd>
            </dl>
            <div class="back-actions">
              <button class="btn btn-sm btn-sage" onclick="event.stopPropagation(); issueOrReserve(${b.id})">${b.available > 0 ? 'Issue to me' : 'Reserve'}</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  });
});

let chartCirc, chartCat, chartStatus, chartMonthly;

function renderDashboardChart() {
  const ctx = document.getElementById('chartCirculation');
  if (!ctx || typeof Chart === 'undefined') return;

  if (chartCirc) chartCirc.destroy();

  chartCirc = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
      datasets: [{
        label: 'Issues',
        data: [58, 64, 49, 72, 80, 66, 91, 84],
        borderColor: '#B8873D',
        backgroundColor: 'rgba(184,135,61,0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(28,43,57,0.06)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const catCtx = document.getElementById('chartCategory');
  if (catCtx) {
    if (chartCat) chartCat.destroy();

    chartCat = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: ['Programming', 'Database', 'Artificial Intelligence', 'Networks', 'Software Eng.'],
        datasets: [{
          data: [412, 188, 96, 74, 61],
          backgroundColor: ['#B8873D', '#4E6B52', '#3A5A78', '#9B3E3E', '#7A5C3E'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(28,43,57,0.06)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const statusCtx = document.getElementById('chartStatus');
  if (statusCtx) {
    if (chartStatus) chartStatus.destroy();

    chartStatus = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Issued', 'Overdue', 'Reserved'],
        datasets: [{
          data: [15, 5, 2, 2],
          backgroundColor: ['#4E6B52', '#B8873D', '#9B3E3E', '#3A5A78']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 8, font: { size: 10.5 } }
          }
        }
      }
    });
  }

  const monthCtx = document.getElementById('chartMonthly');
  if (monthCtx) {
    if (chartMonthly) chartMonthly.destroy();

    chartMonthly = new Chart(monthCtx, {
      type: 'bar',
      data: {
        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Issued',
            data: [210, 240, 190, 260, 300, 120],
            backgroundColor: '#B8873D',
            borderRadius: 3
          },
          {
            label: 'Returned',
            data: [198, 225, 205, 240, 270, 60],
            backgroundColor: '#4E6B52',
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 8, font: { size: 10.5 } }
          }
        },
        scales: {
          y: { grid: { color: 'rgba(28,43,57,0.06)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}
function showPasswordSetup() {
  document.getElementById('password-setup-panel')
    .classList.remove('hidden');
}

function hidePasswordSetup() {
  document.getElementById('password-setup-panel')
    .classList.add('hidden');

  document.getElementById('password-setup-form').reset();
}

async function submitPasswordSetup(e) {
  e.preventDefault();

  const studentId =
    document.getElementById('setup-student-id').value.trim();

  const email =
    document.getElementById('setup-email').value.trim();

  const password =
    document.getElementById('setup-password').value;

  const confirmPassword =
    document.getElementById('setup-confirm-password').value;

  if (password.length < 8) {
    toast('Password must be at least 8 characters.', 'crimson');
    return false;
  }

  if (password !== confirmPassword) {
    toast('Passwords do not match.', 'crimson');
    return false;
  }

  try {
    const response = await fetch(
      `${API_BASE}/auth/student-set-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          email: email,
          password: password
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Could not set password.'
      );
    }

    document.getElementById('password-setup-form').reset();
    hidePasswordSetup();

    document.getElementById('login-id').value = studentId;
    document.getElementById('login-pass').value = '';

    toast(
      'Password created! Log in using your student ID and new password.',
      'sage'
    );

  } catch (err) {
    console.error('Password setup error:', err);

    toast(
      err.message || 'Could not connect to the backend.',
      'crimson'
    );
  }
}
async function deleteStudent(studentId) {
  const student = students.find(
    s => Number(s.id) === Number(studentId)
  );

  if (!student) {
    toast('Student not found.', 'crimson');
    return;
  }

  const confirmed = confirm(
    'Are you sure you want to delete ' +
    student.name + ' (ID: ' + student.id + ')?'
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/students/${studentId}`,
      { method: 'DELETE' }
    );

    const result = await response.json();

    if (!response.ok) {
      toast(
        result.error || 'Could not delete student.',
        'crimson'
      );
      return;
    }

    toast('Student deleted successfully.', 'ink');
    await loadStudentsFromDatabase();

  } catch (error) {
    console.error('Delete student error:', error);
    toast(
      'Could not connect to the backend.',
      'crimson'
    );
  }
   return false;
}

