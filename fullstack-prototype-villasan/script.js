let currentUser = null;
const STORAGE_KEY = 'ipt_demo_v1';

window.db = {
  accounts: [],
  departments: [],
  employees: [],
  requests: [],
};

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    window.db = JSON.parse(stored);
  } else {
    window.db = {
      accounts: [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'Password123!',
          role: 'admin',
          verified: true,
        },
      ],
      departments: [
        {
          id: 1,
          name: 'Engineering',
          description: 'Software development team',
        },
        { id: 2, name: 'HR', description: 'Human resources department' },
      ],
      employees: [],
      requests: [],
    };
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
  console.log('💾 Data saved to localStorage');
}

function handleRegistration(e) {
  e.preventDefault();

  const firstName = document.getElementById('reg-firstname').value;
  const lastName = document.getElementById('reg-lastname').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const existingUser = window.db.accounts.find((acc) => acc.email === email);
  if (existingUser) {
    showToast('Email already registered!', 'error');
    return;
  }

  const newAccount = {
    id: window.db.accounts.length + 1,
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    role: 'user',
    verified: false,
  };

  window.db.accounts.push(newAccount);
  saveToStorage();

  localStorage.setItem('unverified_email', email);

  showToast('Registration successful! Please verify your email.', 'success');
  navigateTo('#/verify-email');
}

function handleEmailVerification() {
  const email = localStorage.getItem('unverified_email');

  if (!email) {
    showToast('No email to verify', 'error');
    navigateTo('#/register');
    return;
  }

  const account = window.db.accounts.find((acc) => acc.email === email);

  if (account) {
    account.verified = true;
    saveToStorage();
    localStorage.removeItem('unverified_email');

    showToast('Email verified! You can now login.', 'success');
    navigateTo('#/login');
  } else {
    showToast('Account not found', 'error');
  }
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const account = window.db.accounts.find(
    (acc) =>
      acc.email === email && acc.password === password && acc.verified === true,
  );

  if (account) {
    localStorage.setItem('auth_token', email);
    setAuthState(true, account);
    showToast(`Welcome back, ${account.firstName}!`, 'success');
    navigateTo('#/profile');
  } else {
    const userExists = window.db.accounts.find((acc) => acc.email === email);

    if (!userExists) {
      showToast('Account not found. Please register first.', 'error');
    } else if (!userExists.verified) {
      showToast('Please verify your email first.', 'warning');
    } else {
      showToast('Incorrect password.', 'error');
    }
  }
}

function setAuthState(isAuth, user) {
  if (isAuth && user) {
    currentUser = user;
    document.body.classList.remove('not-authenticated');
    document.body.classList.add('authenticated');

    document.getElementById('username-display').textContent = user.firstName;

    if (user.role === 'admin') {
      document.body.classList.add('is-admin');
    } else {
      document.body.classList.remove('is-admin');
    }
  } else {
    currentUser = null;
    document.body.classList.remove('authenticated', 'is-admin');
    document.body.classList.add('not-authenticated');
  }
}

function handleLogout(e) {
  e.preventDefault();

  localStorage.removeItem('auth_token');
  setAuthState(false);

  showToast('Logged out successfully', 'info');
  navigateTo('#/');
}

function checkAuthState() {
  const authToken = localStorage.getItem('auth_token');

  if (authToken) {
    const user = window.db.accounts.find((acc) => acc.email === authToken);

    if (user && user.verified) {
      setAuthState(true, user);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

function renderProfile() {
  if (!currentUser) {
    navigateTo('#/login');
    return;
  }

  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Role:</strong> <span class="badge bg-${currentUser.role === 'admin' ? 'danger' : 'primary'}">${currentUser.role}</span></p>
                <p><strong>Status:</strong> <span class="badge bg-success">Verified</span></p>
            </div>
        </div>
        <hr>
        <button class="btn btn-primary" onclick="showToast('Edit profile feature coming in Phase 8!', 'info')">Edit Profile</button>
    `;
}

// A. ACCOUNTS MANAGEMENT
function renderAccountsList() {
  const accountsContent = document.getElementById('accounts-content');

  accountsContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showAddAccountForm()">+ Add Account</button>
        
        <div id="account-form-container"></div>
        
        <table class="table table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${window.db.accounts
                  .map(
                    (acc) => `
                    <tr>
                        <td>${acc.firstName} ${acc.lastName}</td>
                        <td>${acc.email}</td>
                        <td><span class="badge bg-${acc.role === 'admin' ? 'danger' : 'primary'}">${acc.role}</span></td>
                        <td>${acc.verified ? '✓' : '✗'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editAccount(${acc.id})">Edit</button>
                            <button class="btn btn-sm btn-info" onclick="resetPassword(${acc.id})">Reset PW</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteAccount(${acc.id})">Delete</button>
                        </td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    `;
}

function showAddAccountForm() {
  const container = document.getElementById('account-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Add New Account</h5>
                <form id="add-account-form">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="acc-firstname" placeholder="First Name" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="acc-lastname" placeholder="Last Name" required>
                        </div>
                    </div>
                    <div class="mb-2">
                        <input type="email" class="form-control" id="acc-email" placeholder="Email" required>
                    </div>
                    <div class="mb-2">
                        <input type="password" class="form-control" id="acc-password" placeholder="Password" minlength="6" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="acc-role">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label><input type="checkbox" id="acc-verified"> Verified</label>
                    </div>
                    <button type="submit" class="btn btn-success">Save Account</button>
                    <button type="button" class="btn btn-secondary" onclick="renderAccountsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('add-account-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const newAccount = {
        id: window.db.accounts.length + 1,
        firstName: document.getElementById('acc-firstname').value,
        lastName: document.getElementById('acc-lastname').value,
        email: document.getElementById('acc-email').value,
        password: document.getElementById('acc-password').value,
        role: document.getElementById('acc-role').value,
        verified: document.getElementById('acc-verified').checked,
      };

      window.db.accounts.push(newAccount);
      saveToStorage();
      showToast('Account created successfully!', 'success');
      renderAccountsList();
    });
}

function editAccount(id) {
  const account = window.db.accounts.find((acc) => acc.id === id);
  if (!account) return;

  const container = document.getElementById('account-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Edit Account</h5>
                <form id="edit-account-form">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="edit-firstname" value="${account.firstName}" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="edit-lastname" value="${account.lastName}" required>
                        </div>
                    </div>
                    <div class="mb-2">
                        <input type="email" class="form-control" id="edit-email" value="${account.email}" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="edit-role">
                            <option value="user" ${account.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${account.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label><input type="checkbox" id="edit-verified" ${account.verified ? 'checked' : ''}> Verified</label>
                    </div>
                    <button type="submit" class="btn btn-success">Update Account</button>
                    <button type="button" class="btn btn-secondary" onclick="renderAccountsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('edit-account-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      account.firstName = document.getElementById('edit-firstname').value;
      account.lastName = document.getElementById('edit-lastname').value;
      account.email = document.getElementById('edit-email').value;
      account.role = document.getElementById('edit-role').value;
      account.verified = document.getElementById('edit-verified').checked;

      saveToStorage();
      showToast('Account updated successfully!', 'success');
      renderAccountsList();
    });
}

function resetPassword(id) {
  const newPassword = prompt('Enter new password (min 6 characters):');

  if (newPassword && newPassword.length >= 6) {
    const account = window.db.accounts.find((acc) => acc.id === id);
    if (account) {
      account.password = newPassword;
      saveToStorage();
      showToast('Password reset successfully!', 'success');
    }
  } else if (newPassword) {
    showToast('Password must be at least 6 characters', 'error');
  }
}

function deleteAccount(id) {
  if (currentUser.id === id) {
    showToast('Cannot delete your own account!', 'error');
    return;
  }

  if (confirm('Are you sure you want to delete this account?')) {
    window.db.accounts = window.db.accounts.filter((acc) => acc.id !== id);
    saveToStorage();
    showToast('Account deleted successfully!', 'success');
    renderAccountsList();
  }
}

// B. DEPARTMENTS MANAGEMENT
function renderDepartmentsList() {
  const deptsContent = document.getElementById('departments-content');

  deptsContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showAddDepartmentForm()">+ Add Department</button>
        
        <div id="dept-form-container"></div>
        
        <table class="table table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${window.db.departments
                  .map(
                    (dept) => `
                    <tr>
                        <td>${dept.name}</td>
                        <td>${dept.description}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editDepartment(${dept.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
                        </td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    `;
}

function showAddDepartmentForm() {
  const container = document.getElementById('dept-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Add New Department</h5>
                <form id="add-dept-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="dept-name" placeholder="Department Name" required>
                    </div>
                    <div class="mb-2">
                        <textarea class="form-control" id="dept-desc" placeholder="Description" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Save Department</button>
                    <button type="button" class="btn btn-secondary" onclick="renderDepartmentsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('add-dept-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const newDept = {
        id: window.db.departments.length + 1,
        name: document.getElementById('dept-name').value,
        description: document.getElementById('dept-desc').value,
      };

      window.db.departments.push(newDept);
      saveToStorage();
      showToast('Department created successfully!', 'success');
      renderDepartmentsList();
    });
}

function editDepartment(id) {
  const dept = window.db.departments.find((d) => d.id === id);
  if (!dept) return;

  const container = document.getElementById('dept-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Edit Department</h5>
                <form id="edit-dept-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="edit-dept-name" value="${dept.name}" required>
                    </div>
                    <div class="mb-2">
                        <textarea class="form-control" id="edit-dept-desc" rows="3">${dept.description}</textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Update Department</button>
                    <button type="button" class="btn btn-secondary" onclick="renderDepartmentsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('edit-dept-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      dept.name = document.getElementById('edit-dept-name').value;
      dept.description = document.getElementById('edit-dept-desc').value;

      saveToStorage();
      showToast('Department updated successfully!', 'success');
      renderDepartmentsList();
    });
}

function deleteDepartment(id) {
  if (confirm('Are you sure you want to delete this department?')) {
    window.db.departments = window.db.departments.filter((d) => d.id !== id);
    saveToStorage();
    showToast('Department deleted successfully!', 'success');
    renderDepartmentsList();
  }
}

// C. EMPLOYEES MANAGEMENT
function renderEmployeesList() {
  const employeesContent = document.getElementById('employees-content');

  employeesContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showAddEmployeeForm()">+ Add Employee</button>
        
        <div id="employee-form-container"></div>
        
        <table class="table table-hover">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${window.db.employees
                  .map((emp) => {
                    const user = window.db.accounts.find(
                      (acc) => acc.id === emp.userId,
                    );
                    const dept = window.db.departments.find(
                      (d) => d.id === emp.departmentId,
                    );
                    return `
                        <tr>
                            <td>${emp.employeeId}</td>
                            <td>${user ? user.email : 'N/A'}</td>
                            <td>${emp.position}</td>
                            <td>${dept ? dept.name : 'N/A'}</td>
                            <td>${emp.hireDate}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick="editEmployee(${emp.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                  })
                  .join('')}
            </tbody>
        </table>
    `;
}

function showAddEmployeeForm() {
  const container = document.getElementById('employee-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Add New Employee</h5>
                <form id="add-employee-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="emp-id" placeholder="Employee ID" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="emp-user" required>
                            <option value="">Select User</option>
                            ${window.db.accounts.map((acc) => `<option value="${acc.id}">${acc.email}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="text" class="form-control" id="emp-position" placeholder="Position" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="emp-dept" required>
                            <option value="">Select Department</option>
                            ${window.db.departments.map((dept) => `<option value="${dept.id}">${dept.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="date" class="form-control" id="emp-hire-date" required>
                    </div>
                    <button type="submit" class="btn btn-success">Save Employee</button>
                    <button type="button" class="btn btn-secondary" onclick="renderEmployeesList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('add-employee-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const newEmployee = {
        id: window.db.employees.length + 1,
        employeeId: document.getElementById('emp-id').value,
        userId: parseInt(document.getElementById('emp-user').value),
        position: document.getElementById('emp-position').value,
        departmentId: parseInt(document.getElementById('emp-dept').value),
        hireDate: document.getElementById('emp-hire-date').value,
      };

      window.db.employees.push(newEmployee);
      saveToStorage();
      showToast('Employee added successfully!', 'success');
      renderEmployeesList();
    });
}

function editEmployee(id) {
  const emp = window.db.employees.find((e) => e.id === id);
  if (!emp) return;

  const container = document.getElementById('employee-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Edit Employee</h5>
                <form id="edit-employee-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="edit-emp-id" value="${emp.employeeId}" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="edit-emp-user" required>
                            ${window.db.accounts.map((acc) => `<option value="${acc.id}" ${acc.id === emp.userId ? 'selected' : ''}>${acc.email}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="text" class="form-control" id="edit-emp-position" value="${emp.position}" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="edit-emp-dept" required>
                            ${window.db.departments.map((dept) => `<option value="${dept.id}" ${dept.id === emp.departmentId ? 'selected' : ''}>${dept.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="date" class="form-control" id="edit-emp-hire-date" value="${emp.hireDate}" required>
                    </div>
                    <button type="submit" class="btn btn-success">Update Employee</button>
                    <button type="button" class="btn btn-secondary" onclick="renderEmployeesList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('edit-employee-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      emp.employeeId = document.getElementById('edit-emp-id').value;
      emp.userId = parseInt(document.getElementById('edit-emp-user').value);
      emp.position = document.getElementById('edit-emp-position').value;
      emp.departmentId = parseInt(
        document.getElementById('edit-emp-dept').value,
      );
      emp.hireDate = document.getElementById('edit-emp-hire-date').value;

      saveToStorage();
      showToast('Employee updated successfully!', 'success');
      renderEmployeesList();
    });
}

function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    window.db.employees = window.db.employees.filter((e) => e.id !== id);
    saveToStorage();
    showToast('Employee deleted successfully!', 'success');
    renderEmployeesList();
  }
}

function renderRequestsList() {
  if (!currentUser) return;

  const requestsContent = document.getElementById('requests-content');

  // Filter requests for current user (or show all if admin)
  const userRequests =
    currentUser.role === 'admin'
      ? window.db.requests
      : window.db.requests.filter(
          (req) => req.employeeEmail === currentUser.email,
        );

  requestsContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showNewRequestModal()">+ New Request</button>
        
        <div id="request-modal-container"></div>
        
        ${
          userRequests.length === 0
            ? '<p class="text-muted">No requests yet.</p>'
            : `
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Items</th>
                        <th>Status</th>
                        ${currentUser.role === 'admin' ? '<th>Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${userRequests
                      .map(
                        (req) => `
                        <tr>
                            <td>${req.date}</td>
                            <td>${req.type}</td>
                            <td>${req.items.length} item(s)</td>
                            <td><span class="badge bg-${req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'danger'}">${req.status}</span></td>
                            ${
                              currentUser.role === 'admin'
                                ? `
                                <td>
                                    <button class="btn btn-sm btn-success" onclick="updateRequestStatus(${req.id}, 'Approved')">Approve</button>
                                    <button class="btn btn-sm btn-danger" onclick="updateRequestStatus(${req.id}, 'Rejected')">Reject</button>
                                </td>
                            `
                                : ''
                            }
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        `
        }
    `;
}

function showNewRequestModal() {
  const container = document.getElementById('request-modal-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>New Request</h5>
                <form id="new-request-form">
                    <div class="mb-2">
                        <label>Request Type</label>
                        <select class="form-control" id="request-type" required>
                            <option value="Equipment">Equipment</option>
                            <option value="Leave">Leave</option>
                            <option value="Resources">Resources</option>
                        </select>
                    </div>
                    
                    <div class="mb-2">
                        <label>Items</label>
                        <div id="items-container">
                            <div class="row mb-2 item-row">
                                <div class="col-md-7">
                                    <input type="text" class="form-control" placeholder="Item name" required>
                                </div>
                                <div class="col-md-3">
                                    <input type="number" class="form-control" placeholder="Qty" min="1" value="1" required>
                                </div>
                                <div class="col-md-2">
                                    <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.item-row').remove()">×</button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="addItemRow()">+ Add Item</button>
                    </div>
                    
                    <button type="submit" class="btn btn-success">Submit Request</button>
                    <button type="button" class="btn btn-secondary" onclick="renderRequestsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById('new-request-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const itemRows = document.querySelectorAll('.item-row');
      const items = Array.from(itemRows).map((row) => {
        const inputs = row.querySelectorAll('input');
        return {
          name: inputs[0].value,
          quantity: parseInt(inputs[1].value),
        };
      });

      if (items.length === 0) {
        showToast('Please add at least one item', 'error');
        return;
      }

      const newRequest = {
        id: window.db.requests.length + 1,
        type: document.getElementById('request-type').value,
        items: items,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        employeeEmail: currentUser.email,
      };

      window.db.requests.push(newRequest);
      saveToStorage();
      showToast('Request submitted successfully!', 'success');
      renderRequestsList();
    });
}

function addItemRow() {
  const container = document.getElementById('items-container');
  const newRow = document.createElement('div');
  newRow.className = 'row mb-2 item-row';
  newRow.innerHTML = `
        <div class="col-md-7">
            <input type="text" class="form-control" placeholder="Item name" required>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control" placeholder="Qty" min="1" value="1" required>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.item-row').remove()">×</button>
        </div>
    `;
  container.appendChild(newRow);
}

function updateRequestStatus(id, status) {
  const request = window.db.requests.find((req) => req.id === id);
  if (request) {
    request.status = status;
    saveToStorage();
    showToast(
      `Request ${status.toLowerCase()}!`,
      status === 'Approved' ? 'success' : 'warning',
    );
    renderRequestsList();
  }
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function handleRouting() {
  const hash = window.location.hash || '#/';
  const route = hash.replace('#/', '');

  const allPages = document.querySelectorAll('.page');
  allPages.forEach((page) => page.classList.remove('active'));

  const isAuthenticated = document.body.classList.contains('authenticated');
  const isAdmin = document.body.classList.contains('is-admin');

  let pageToShow = null;

  switch (route) {
    case '':
    case 'home':
      pageToShow = 'home-page';
      break;

    case 'login':
      if (isAuthenticated) {
        navigateTo('#/profile');
        return;
      }
      pageToShow = 'login-page';
      break;

    case 'register':
      if (isAuthenticated) {
        navigateTo('#/profile');
        return;
      }
      pageToShow = 'register-page';
      break;

    case 'verify-email':
      const unverifiedEmail = localStorage.getItem('unverified_email');
      if (unverifiedEmail) {
        document.getElementById('verification-email').textContent =
          unverifiedEmail;
      }
      pageToShow = 'verify-email-page';
      break;

    case 'profile':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      renderProfile();
      pageToShow = 'profile-page';
      break;

    case 'requests':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      renderRequestsList();
      pageToShow = 'requests-page';
      break;

    case 'employees':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      if (!isAdmin) {
        showToast('Access Denied: Admin only', 'error');
        navigateTo('#/profile');
        return;
      }
      renderEmployeesList();
      pageToShow = 'employees-page';
      break;

    case 'accounts':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      if (!isAdmin) {
        showToast('Access Denied: Admin only', 'error');
        navigateTo('#/profile');
        return;
      }
      renderAccountsList();
      pageToShow = 'accounts-page';
      break;

    case 'departments':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      if (!isAdmin) {
        showToast('Access Denied: Admin only', 'error');
        navigateTo('#/profile');
        return;
      }
      renderDepartmentsList();
      pageToShow = 'departments-page';
      break;

    default:
      navigateTo('#/');
      return;
  }

  if (pageToShow) {
    const page = document.getElementById(pageToShow);
    if (page) {
      page.classList.add('active');
    }
  }
}

window.addEventListener('hashchange', handleRouting);

document.addEventListener('DOMContentLoaded', function () {
  loadFromStorage();
  checkAuthState();

  if (!window.location.hash) {
    window.location.hash = '#/';
  }

  handleRouting();
  setupEventListeners();
});

function setupEventListeners() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const verifyBtn = document.getElementById('verify-btn');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', handleEmailVerification);
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}
