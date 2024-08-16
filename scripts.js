// Datos de usuario y tickets
let users = [];
let tickets = [];

// Historial de actividades
const history = [];

// Variables globales
let currentUser = null;
let transferTicketObj = null;
let selectedTicket = null; // Para saber cuál ticket se está editando o agregando una nota

// Función para cargar datos desde JSON utilizando fetch
async function loadData() {
    try {
        const usersResponse = await fetch('usuarios.json');
        const ticketsResponse = await fetch('tickets.json');
        
        if (!usersResponse.ok || !ticketsResponse.ok) {
            throw new Error('Error al cargar los datos.');
        }

        users = await usersResponse.json();
        tickets = await ticketsResponse.json();
        
        console.log('Datos cargados correctamente.');
    } catch (error) {
        console.error('Hubo un problema al cargar los datos:', error);
    }
}

// Función para guardar tickets en el archivo JSON (simulado para entorno de navegador)
function saveTickets() {
    // Simulación de guardado en archivo para entorno de desarrollo (esto no funciona en producción)
    localStorage.setItem('tickets', JSON.stringify(tickets));
}

// Función para el inicio de sesión
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard(user.role);
    }
}

// Función para mostrar el dashboard según el rol del usuario
function showDashboard(role) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'flex';
    
    if (role === 'admin') {
        document.getElementById('usuarios-link').style.display = 'block';
        cargarUsuarios();
    } else {
        document.getElementById('usuarios-link').style.display = 'none';
    }
    
    cargarEstadisticas();
    cargarHistorial();
}

// Función para mostrar la sección seleccionada
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'tickets') {
        cargarTickets();
    } else if (sectionId === 'usuarios') {
        cargarUsuarios();
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showLogin();
}

// Función para mostrar la pantalla de inicio de sesión
function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('dashboard-container').style.display = 'none';
}

// Función para crear o editar un usuario
function createUser(event) {
    event.preventDefault();

    const nombreUsuario = document.getElementById('nombre-usuario').value;
    const passwordUsuario = document.getElementById('password-usuario').value;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cargo = document.getElementById('cargo').value;
    const area = document.getElementById('area').value;
    const mail = document.getElementById('mail').value;
    const administra = document.getElementById('administra').value;
    const editUserIndex = document.getElementById('edit-user-index').value;

    const user = {
        username: nombreUsuario,
        password: passwordUsuario,
        role: administra === 'si' ? 'admin' : 'usuario',
        department: area,
        nombre: nombre,
        apellido: apellido,
        mail: mail,
        administra: administra
    };

    if (editUserIndex) {
        users[editUserIndex] = user;
        addHistory(`Usuario ${user.username} actualizado por ${currentUser.username}`);
    } else {
        users.push(user);
        addHistory(`Usuario ${user.username} creado por ${currentUser.username}`);
    }

    cargarUsuarios();

    // Limpia el formulario
    document.getElementById('edit-user-index').value = '';
    document.getElementById('nombre-usuario').value = '';
    document.getElementById('password-usuario').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('cargo').value = '';
    document.getElementById('area').value = '';
    document.getElementById('mail').value = '';
    document.getElementById('administra').value = '';
}

// Función para abrir el modal de agregar usuario
function openAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

// Función para cerrar el modal de agregar usuario
function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

// Función para manejar la creación de un nuevo usuario desde el modal
document.getElementById('addUserForm').onsubmit = function(event) {
    event.preventDefault();

    const nombreUsuario = document.getElementById('nombre-usuario-modal').value;
    const passwordUsuario = document.getElementById('password-usuario-modal').value;
    const nombre = document.getElementById('nombre-modal').value;
    const apellido = document.getElementById('apellido-modal').value;
    const cargo = document.getElementById('cargo-modal').value;
    const area = document.getElementById('area-modal').value;
    const mail = document.getElementById('mail-modal').value;
    const administra = document.getElementById('administra-modal').value;

    const newUser = {
        username: nombreUsuario,
        password: passwordUsuario,
        role: administra === 'si' ? 'admin' : 'usuario',
        department: area,
        nombre: nombre,
        apellido: apellido,
        mail: mail,
        administra: administra
    };

    users.push(newUser);
    addHistory(`Usuario ${newUser.username} creado por ${currentUser.username}`);

    cargarUsuarios();

    // Limpia el formulario y cierra el modal
    document.getElementById('addUserForm').reset();
    closeAddUserModal();
};

// Función para abrir el modal de crear ticket
function openCreateTicketModal() {
    document.getElementById('createTicketModal').style.display = 'block';
}

// Función para cerrar el modal de crear ticket
function closeCreateTicketModal() {
    document.getElementById('createTicketModal').style.display = 'none';
}

// Función para manejar la creación de un nuevo ticket desde el modal
document.getElementById('createTicketForm').onsubmit = function(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipo-modal').value;
    const titulo = document.getElementById('titulo-modal').value;
    const descripcion = document.getElementById('descripcion-modal').value;
    const departamento = document.getElementById('departamento-modal').value;
    const usuario = document.getElementById('usuario-modal').value;
    const prioridad = document.getElementById('prioridad-modal').value;
    const estado = document.getElementById('estado-modal').value;

    const newTicket = {
        asunto: titulo,
        proyecto: departamento,
        tipo: tipo,
        descripcion: descripcion,
        prioridad: prioridad,
        estado: estado,
        fecha: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString(),
        creador: currentUser.username,
        asignadoA: []
    };

    if (usuario === 'Todos') {
        // Asigna el ticket a todos los usuarios del departamento seleccionado
        newTicket.asignadoA = users.filter(user => user.department === departamento).map(user => user.username);
    } else {
        // Asigna el ticket a un usuario específico
        newTicket.asignadoA = [usuario];
    }

    tickets.push(newTicket);
    addHistory(`Ticket ${titulo} creado por ${currentUser.username}`);

    cargarTickets();
    saveTickets();

    // Limpia el formulario y cierra el modal
    document.getElementById('createTicketForm').reset();
    closeCreateTicketModal();
};

// Función para actualizar los usuarios basados en el departamento seleccionado dentro del modal
function updateUsuariosModal() {
    const departamento = document.getElementById('departamento-modal').value;
    const usuarioSelect = document.getElementById('usuario-modal');

    // Limpia las opciones actuales
    usuarioSelect.innerHTML = '<option value="Todos">Todos</option>';

    // Filtra y agrega usuarios del departamento seleccionado
    users.filter(user => user.department === departamento)
        .forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.text = user.username;
            usuarioSelect.appendChild(option);
        });
}

// Función para cargar usuarios en la tabla de usuarios
function cargarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    users.forEach((user, index) => {
        const row = tbody.insertRow();
        row.insertCell().innerText = user.username;
        row.insertCell().innerText = user.password;
        row.insertCell().innerText = user.nombre || 'undefined';
        row.insertCell().innerText = user.apellido || 'undefined';
        row.insertCell().innerText = user.role;
        row.insertCell().innerText = user.department;
        row.insertCell().innerText = user.mail || 'undefined';
        row.insertCell().innerText = user.administra;
        
        const accionesCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerText = 'Editar';
        editButton.onclick = () => editarUsuario(index);
        accionesCell.appendChild(editButton);
    });
}

// Función para editar un usuario
function editarUsuario(index) {
    const user = users[index];
    document.getElementById('edit-user-index').value = index;
    document.getElementById('nombre-usuario').value = user.username;
    document.getElementById('password-usuario').value = user.password;
    document.getElementById('nombre').value = user.nombre;
    document.getElementById('apellido').value = user.apellido;
    document.getElementById('cargo').value = user.role;
    document.getElementById('area').value = user.department;
    document.getElementById('mail').value = user.mail;
    document.getElementById('administra').value = user.administra;
}

// Función para crear un nuevo ticket
function createTicket(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const departamento = document.getElementById('departamento').value;
    const usuario = document.getElementById('usuario').value;
    const prioridad = document.getElementById('prioridad').value;
    const estado = document.getElementById('estado').value;

    const ticket = {
        asunto: titulo,
        proyecto: departamento,
        tipo: tipo,
        descripcion: descripcion,
        prioridad: prioridad,
        estado: estado,
        fecha: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString(),
        creador: currentUser.username,
        asignadoA: [],
        notas: []
    };

    if (usuario === 'Todos') {
        // Asigna el ticket a todos los usuarios del departamento seleccionado
        ticket.asignadoA = users.filter(user => user.department === departamento).map(user => user.username);
    } else {
        // Asigna el ticket a un usuario específico
        ticket.asignadoA = [usuario];
    }

    tickets.push(ticket);
    addHistory(`Ticket ${titulo} creado por ${currentUser.username}`);

    saveTickets();

    // Limpia el formulario
    document.getElementById('tipo').value = '';
    document.getElementById('titulo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('departamento').value = '';
    document.getElementById('usuario').value = 'Todos';
    document.getElementById('prioridad').value = '';
    document.getElementById('estado').value = '';

    cargarTickets();
}

// Función para actualizar los usuarios basados en el departamento seleccionado
function updateUsuarios() {
    const departamento = document.getElementById('departamento').value;
    const usuarioSelect = document.getElementById('usuario');

    // Limpia las opciones actuales
    usuarioSelect.innerHTML = '<option value="Todos">Todos</option>';

    // Filtra y agrega usuarios del departamento seleccionado
    users.filter(user => user.department === departamento)
        .forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.text = user.username;
            usuarioSelect.appendChild(option);
        });
}

// Función para cargar tickets
function cargarTickets() {
    const tbody = document.getElementById('tabla-tickets').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    // Tickets creados por el usuario
    let creadosHeaderAdded = false;
    tickets.forEach(ticket => {
        if (ticket.creador === currentUser.username) {
            if (!creadosHeaderAdded) {
                const headerRow = tbody.insertRow();
                const headerCell = headerRow.insertCell();
                headerCell.colSpan = 9;
                headerCell.style.fontWeight = 'bold';
                headerCell.style.textAlign = 'center';
                headerCell.textContent = 'Tickets Creados';
                creadosHeaderAdded = true;
            }
            agregarFilaTicket(tbody, ticket);
        }
    });

    // Separador
    const separadorRow = tbody.insertRow();
    const separadorCell = separadorRow.insertCell();
    separadorCell.colSpan = 9;
    separadorCell.style.borderTop = '2px solid black';

    // Tickets asignados al usuario
    let asignadosHeaderAdded = false;
    tickets.forEach(ticket => {
        if (ticket.asignadoA.includes(currentUser.username) && ticket.creador !== currentUser.username) {
            if (!asignadosHeaderAdded) {
                const headerRow = tbody.insertRow();
                const headerCell = headerRow.insertCell();
                headerCell.colSpan = 9;
                headerCell.style.fontWeight = 'bold';
                headerCell.style.textAlign = 'center';
                headerCell.textContent = 'Tickets Asignados';
                asignadosHeaderAdded = true;
            }
            agregarFilaTicket(tbody, ticket);
        }
    });
}

// Función para agregar una fila de ticket a la tabla
function agregarFilaTicket(tbody, ticket) {
    const row = tbody.insertRow();
    row.insertCell().innerText = ticket.asunto;
    row.insertCell().innerText = ticket.proyecto;
    row.insertCell().innerText = ticket.tipo;
    row.insertCell().innerText = ticket.descripcion;
    row.insertCell().innerText = ticket.prioridad;
    row.insertCell().innerText = ticket.estado;
    row.insertCell().innerText = ticket.fecha;
    row.insertCell().innerText = ticket.ultimaActualizacion;

    const accionesCell = row.insertCell();
    
    const notaButton = document.createElement('button');
    notaButton.innerText = 'Agregar Nota';
    notaButton.onclick = () => openAddNoteModal(ticket);
    accionesCell.appendChild(notaButton);
    
    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.onclick = () => openEditTicketModal(ticket);
    accionesCell.appendChild(editButton);
    
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Borrar';
    deleteButton.onclick = () => borrarTicket(ticket);
    accionesCell.appendChild(deleteButton);

    const transferButton = document.createElement('button');
    transferButton.innerText = 'Transferir';
    transferButton.onclick = () => openTransferModal(ticket);
    accionesCell.appendChild(transferButton);
}

// Función para abrir el modal de agregar nota
function openAddNoteModal(ticket) {
    selectedTicket = ticket;
    document.getElementById('addNoteModal').style.display = 'block';
}

// Función para cerrar el modal de agregar nota
function closeAddNoteModal() {
    document.getElementById('addNoteModal').style.display = 'none';
}

// Función para guardar la nota
document.getElementById('addNoteForm').onsubmit = function(event) {
    event.preventDefault();
    const noteContent = document.getElementById('noteContent').value;
    agregarNota(selectedTicket, noteContent);
    closeAddNoteModal();
    saveTickets();
};

// Función para abrir el modal de editar ticket
function openEditTicketModal(ticket) {
    selectedTicket = ticket;
    document.getElementById('editAsunto').value = ticket.asunto;
    document.getElementById('editTipo').value = ticket.tipo;
    document.getElementById('editDescripcion').value = ticket.descripcion;
    document.getElementById('editPrioridad').value = ticket.prioridad;
    document.getElementById('editEstado').value = ticket.estado;
    document.getElementById('editTicketModal').style.display = 'block';
}

// Función para cerrar el modal de editar ticket
function closeEditTicketModal() {
    document.getElementById('editTicketModal').style.display = 'none';
}

// Función para guardar los cambios en el ticket
document.getElementById('editTicketForm').onsubmit = function(event) {
    event.preventDefault();
    selectedTicket.asunto = document.getElementById('editAsunto').value;
    selectedTicket.tipo = document.getElementById('editTipo').value;
    selectedTicket.descripcion = document.getElementById('editDescripcion').value;
    selectedTicket.prioridad = document.getElementById('editPrioridad').value;
    selectedTicket.estado = document.getElementById('editEstado').value;
    selectedTicket.ultimaActualizacion = new Date().toISOString();
    cargarTickets();
    closeEditTicketModal();
    saveTickets();
};

// Modificar la función agregarNota para aceptar el contenido directamente
function agregarNota(ticket, notaContent) {
    const notaCompleta = `${new Date().toLocaleString()} - ${currentUser.username}: ${notaContent}`;
    ticket.descripcion += `\n${notaCompleta}`;
    ticket.ultimaActualizacion = new Date().toISOString();
    addHistory(`Nota agregada al ticket ${ticket.asunto} por ${currentUser.username}`);
    cargarTickets();
}

// Función para borrar un ticket
function borrarTicket(ticket) {
    const index = tickets.indexOf(ticket);
    if (index > -1) {
        tickets.splice(index, 1);
        addHistory(`Ticket ${ticket.asunto} borrado por ${currentUser.username}`);
        cargarTickets();
        saveTickets();
    }
}

// Función para cambiar el estado de un ticket
function cambiarEstadoTicket(ticket, nuevoEstado) {
    ticket.estado = nuevoEstado;
    ticket.ultimaActualizacion = new Date().toISOString();
    addHistory(`Estado del ticket ${ticket.asunto} actualizado a ${nuevoEstado} por ${currentUser.username}`);
    cargarTickets();
    saveTickets();
}

// Función para abrir el modal de transferencia de ticket
function openTransferModal(ticket) {
    transferTicketObj = ticket;
    document.getElementById('transfer-modal').style.display = 'block';
}

// Función para cerrar el modal de transferencia de ticket
function closeTransferModal() {
    transferTicketObj = null;
    document.getElementById('transfer-modal').style.display = 'none';
}

// Función para transferir un ticket
function transferTicket(event) {
    event.preventDefault();

    const departamento = document.getElementById('transfer-departamento').value;
    const usuario = document.getElementById('transfer-usuario').value;

    if (usuario === 'Todos') {
        // Asigna el ticket a todos los usuarios del departamento
        transferTicketObj.asignadoA = users.filter(user => user.department === departamento).map(user => user.username);
    } else {
        // Asigna el ticket a un usuario específico
        transferTicketObj.asignadoA = [usuario];
    }

    transferTicketObj.ultimaActualizacion = new Date().toISOString();
    addHistory(`Ticket ${transferTicketObj.asunto} transferido a ${usuario}`);
    cargarTickets();
    closeTransferModal();
    saveTickets();
}

// Función para actualizar los usuarios del modal de transferencia basados en el departamento seleccionado
function updateTransferUsuarios() {
    const departamento = document.getElementById('transfer-departamento').value;
    const usuarioSelect = document.getElementById('transfer-usuario');

    // Limpia las opciones actuales
    usuarioSelect.innerHTML = '<option value="Todos">Todos</option>';

    // Filtra y agrega usuarios del departamento seleccionado
    users.filter(user => user.department === departamento)
        .forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.text = user.username;
            usuarioSelect.appendChild(option);
        });
}

// Función para cargar estadísticas del usuario
function cargarEstadisticas() {
    const userTickets = tickets.filter(ticket => ticket.asignadoA.includes(currentUser.username));
    
    document.getElementById('ticket-count-number').innerText = userTickets.length;

    const ctx = document.getElementById('ticketChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pendiente', 'En desarrollo', 'Cancelado', 'Finalizado'],
            datasets: [{
                label: 'Estado de los Tickets',
                data: [
                    userTickets.filter(ticket => ticket.estado === 'Pendiente').length,
                    userTickets.filter(ticket => ticket.estado === 'En desarrollo').length,
                    userTickets.filter(ticket => ticket.estado === 'Cancelado').length,
                    userTickets.filter(ticket => ticket.estado === 'Finalizado').length
                ],
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Estado de los Tickets'
                }
            }
        }
    });
}

// Función para cargar historial de actividades
function cargarHistorial() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = entry;
        historyList.appendChild(listItem);
    });
}

// Función para agregar una entrada al historial
function addHistory(entry) {
    history.push(`${new Date().toLocaleString()}: ${entry}`);
    cargarHistorial();
}

// Al cargar la página, verificar si hay un usuario en el almacenamiento local
document.addEventListener('DOMContentLoaded', async function() {
    await loadData(); // Cargar los datos de usuarios y tickets
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        showDashboard(currentUser.role);
    } else {
        showLogin();
    }

    // Manejador de evento para el formulario de inicio de sesión
    document.getElementById('login-form').addEventListener('submit', login);

    // Manejadores para abrir y cerrar modales
    document.getElementById('open-add-user-modal-btn').addEventListener('click', openAddUserModal);
    document.getElementById('close-add-user-modal-btn').addEventListener('click', closeAddUserModal);

    document.getElementById('open-create-ticket-modal-btn').addEventListener('click', openCreateTicketModal);
    document.getElementById('close-create-ticket-modal-btn').addEventListener('click', closeCreateTicketModal);

    document.getElementById('close-add-note-modal-btn').addEventListener('click', closeAddNoteModal);
    document.getElementById('close-edit-ticket-modal-btn').addEventListener('click', closeEditTicketModal);
    document.getElementById('close-transfer-modal-btn').addEventListener('click', closeTransferModal);

    // Manejadores para mostrar secciones
    document.getElementById('inicio-link').addEventListener('click', () => showSection('inicio'));
    document.getElementById('tickets-link').addEventListener('click', () => showSection('tickets'));
    document.getElementById('usuarios-link-btn').addEventListener('click', () => showSection('usuarios'));

    // Manejador para cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', logout);
});
