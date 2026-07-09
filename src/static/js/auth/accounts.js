document.addEventListener('DOMContentLoaded', function() {
    const usersTableBody = document.getElementById('usersTableBody');
    const addUserBtn = document.getElementById('addUserBtn');
    const accountsModal = new bootstrap.Modal(document.getElementById('accountsModal'));
    const accountsModalTitle = document.getElementById('accountsModalTitle');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const accountsForm = document.getElementById('accountsForm');

    function renderUsers(users) {
        usersTableBody.innerHTML = '';
        if (!users || users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="3" class="text-center">მონაცემები არ არის</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            const emailTd = document.createElement('td');
            emailTd.textContent = user.email || '';
            const roleTd = document.createElement('td');
            roleTd.textContent = user.role || user.role_name || '';
            const actionsTd = document.createElement('td');

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-primary me-2';
            editBtn.textContent = 'რედ.';
            editBtn.addEventListener('click', () => openEditModal(user));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.textContent = 'წაშლა';
            deleteBtn.addEventListener('click', () => deleteUser(user));

            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(deleteBtn);

            tr.appendChild(emailTd);
            tr.appendChild(roleTd);
            tr.appendChild(actionsTd);

            usersTableBody.appendChild(tr);
        });
    }

    function loadUsers() {
        makeApiRequest('/api/users', { method: 'GET' })
            .then(data => {
                if (data && Array.isArray(data)) {
                    renderUsers(data);
                } else if (data && data.error) {
                    showAlert('alertPlaceholder', 'danger', data.error || 'შეცდომა მომხმარებელთა ლოდისას.');
                } else {
                    renderUsers([]);
                }
            })
            .catch(err => console.error('Error loading users', err));
    }

    function openEditModal(user) {
        accountsModalTitle.textContent = 'მომხმარებლის რედაქტირება';
        document.getElementById('editUserUuid').value = user.uuid || user.id || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userRole').value = user.role || user.role_name || 'User';
        // hide password for edit
        document.getElementById('userPassword').value = '';
        document.getElementById('passwordGroup').style.display = 'none';
        accountsModal.show();
    }

    function openAddModal() {
        accountsModalTitle.textContent = 'მომხმარებლის დამატება';
        document.getElementById('editUserUuid').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = 'User';
        document.getElementById('passwordGroup').style.display = 'block';
        accountsModal.show();
    }

    function deleteUser(user) {
        const uuid = user.uuid || user.id;
        if (!uuid) {
            showAlert('alertPlaceholder', 'danger', 'ID/UUID არ არის მოცემული');
            return;
        }
        if (!confirm('ნამდვილად წაშლა მსურს?')) return;

        makeApiRequest(`/api/user/${uuid}`, { method: 'DELETE' })
            .then(data => {
                if (data && data.message) {
                    showAlert('alertPlaceholder', 'success', data.message);
                    loadUsers();
                } else if (data && data.error) {
                    showAlert('alertPlaceholder', 'danger', data.error);
                }
            })
            .catch(err => console.error('Delete error', err));
    }

    saveUserBtn.addEventListener('click', () => {
        const uuid = document.getElementById('editUserUuid').value;
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        const role = document.getElementById('userRole').value;

        if (!email) {
            showAlert('alertPlaceholder', 'danger', 'გთხოვთ შეიყვანოთ ელ.ფოსტა');
            return;
        }

        if (uuid) {
            // Edit existing user
            const payload = { email: email, role_name: role };
            makeApiRequest(`/api/user/${uuid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(data => {
                if (data && data.message) {
                    showAlert('alertPlaceholder', 'success', data.message);
                    accountsModal.hide();
                    loadUsers();
                } else if (data && data.error) {
                    showAlert('alertPlaceholder', 'danger', data.error);
                }
            }).catch(err => console.error('Edit error', err));
        } else {
            // Create new user
            if (!password || password.length < 8) {
                showAlert('alertPlaceholder', 'danger', 'პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო.');
                return;
            }

            const payload = { email: email, password: password, passwordRepeat: password, role_name: role };
            makeApiRequest('/api/registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(data => {
                if (data && data.message) {
                    showAlert('alertPlaceholder', 'success', data.message);
                    accountsModal.hide();
                    loadUsers();
                } else if (data && data.error) {
                    showAlert('alertPlaceholder', 'danger', data.error);
                }
            }).catch(err => console.error('Create error', err));
        }
    });

    addUserBtn.addEventListener('click', openAddModal);

    // initial load
    loadUsers();
});
