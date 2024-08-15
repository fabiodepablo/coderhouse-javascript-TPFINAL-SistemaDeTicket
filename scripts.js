// Datos de usuarios (inicialmente vacío, se llenará desde el JSON)
let users = [];

// Datos de tickets
const tickets = [];

// Historial de actividades
const history = [];

// Variables globales
let currentUser = null;
let ticketToEdit = null;
let ticketToAddNota = null;
let transferTicketObj = null;

// Función para cargar usuarios desde un archivo JSON
function cargarUsuariosDesdeJson() {
    fetch('usuarios.json')
        .then(response => response.json())
        .then(data => {
            users = data;
            inicializarAplicacion();
        })
        .catch(error => console.error('Error al cargar el archivo usuarios.json:', error));
}

// Inicializar la aplicación una vez cargados los usuarios
function inicializarAplicacion() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        showDashboard(currentUser.role);
    } else {
        showLogin();
    }

    // Asignar eventos desde el JS
    document.getElementById('login-form').onsubmit = login;
    document.getElementById('logout-btn').onclick = logout;
    document.getElementById('inicio-link').onclick = () => showSection('inicio');
    document.getElementById('tickets-link').onclick = () => showSection('tickets');
    document.getElementById('usuarios-link-btn').onclick = () => showSection('usuarios');
    document.getElementById('new-ticket-btn').onclick = () => showSection('nuevo-ticket');
    document.getElementById('user-form').onsubmit = createUser;
    document.getElementById('ticket-form').onsubmit = createTicket;
    document.getElementById('edit-ticket-form').onsubmit = saveTicketChanges;
    document.getElementById('nota-form').onsubmit = saveNota;
    document.getElementById('transfer-form').onsubmit = transferTicket;

    // Modales
    document.getElementById('close-edit-modal').onclick = closeEditModal;
    document.getElementById('close-nota-modal').onclick = closeNotaModal;
    document.getElementById('close-transfer-modal').onclick = closeTransferModal;
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
    } else {
        alert('Usuario o contraseña incorrectos.');
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

    // Mostrar información del usuario
    document.getElementById('user-name').innerText = `${currentUser.nombre} ${currentUser.apellido}`;
    document.getElementById('user-department').innerText = currentUser.department;

    cargarResumenTickets();
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

    // Limpia el formulario
    document.getElementById('tipo').value = '';
    document.getElementById('titulo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('departamento').value = '';
    document.getElementById('usuario').value = 'Todos';
    document.getElementById('prioridad').value = '';
    document.getElementById('estado').value = '';

    cargarTickets();
    cargarResumenTickets();
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

    generarGraficoTickets();
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
    notaButton.onclick = () => openNotaModal(ticket);
    accionesCell.appendChild(notaButton);

    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.disabled = (ticket.estado === 'Finalizado');  // Deshabilitar si el estado es "Finalizado"
    editButton.onclick = () => openEditModal(ticket);
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

// Función para abrir el modal de edición de ticket
function openEditModal(ticket) {
    if (ticket.estado === 'Finalizado') {
        return; // No permitir abrir el modal si el ticket está "Finalizado"
    }

    ticketToEdit = ticket;
    document.getElementById('edit-titulo').value = ticket.asunto;
    document.getElementById('edit-tipo').value = ticket.tipo;
    document.getElementById('edit-descripcion').value = ticket.descripcion;
    document.getElementById('edit-prioridad').value = ticket.prioridad;
    document.getElementById('edit-estado').value = ticket.estado;
    document.getElementById('edit-modal').style.display = 'block';
}

// Función para cerrar el modal de edición de ticket
function closeEditModal() {
    ticketToEdit = null;
    document.getElementById('edit-modal').style.display = 'none';
}

// Función para guardar los cambios del ticket editado
function saveTicketChanges(event) {
    event.preventDefault();
    
    ticketToEdit.asunto = document.getElementById('edit-titulo').value;
    ticketToEdit.tipo = document.getElementById('edit-tipo').value;
    ticketToEdit.descripcion = document.getElementById('edit-descripcion').value;
    ticketToEdit.prioridad = document.getElementById('edit-prioridad').value;
    ticketToEdit.estado = document.getElementById('edit-estado').value;
    ticketToEdit.ultimaActualizacion = new Date().toISOString();
    
    addHistory(`Ticket ${ticketToEdit.asunto} editado por ${currentUser.username}`);
    cargarTickets();
    closeEditModal();
}

// Función para abrir el modal de agregar nota
function openNotaModal(ticket) {
    ticketToAddNota = ticket;
    document.getElementById('nota-modal').style.display = 'block';
}

// Función para cerrar el modal de agregar nota
function closeNotaModal() {
    ticketToAddNota = null;
    document.getElementById('nota-modal').style.display = 'none';
}

// Función para guardar la nota
function saveNota(event) {
    event.preventDefault();

    const nota = document.getElementById('nota-contenido').value;
    if (nota) {
        const notaCompleta = `${new Date().toLocaleString()} - ${currentUser.username}: ${nota}`;
        ticketToAddNota.descripcion += `\n${notaCompleta}`;
        ticketToAddNota.ultimaActualizacion = new Date().toISOString();
        addHistory(`Nota agregada al ticket ${ticketToAddNota.asunto} por ${currentUser.username}`);
        cargarTickets();
        closeNotaModal();
    }
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
    addHistory(`Ticket ${transferTicketObj.asunto} transferido a ${usuario} por ${currentUser.username}`);
    cargarTickets();
    closeTransferModal();
}

// Función para agregar una entrada al historial
function addHistory(entry) {
    history.push(`${new Date().toLocaleString()}: ${entry}`);
    cargarHistorial();
}

// Función para cargar el historial de actividades del usuario logueado
function cargarHistorial() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history
        .filter(entry => entry.includes(currentUser.username)) // Filtra solo las actividades del usuario actual
        .forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = entry;
            historyList.appendChild(listItem);
        });
}

// Función para cargar un resumen de los tickets
function cargarResumenTickets() {
    const ticketsAsignados = tickets.filter(ticket => ticket.asignadoA.includes(currentUser.username));
    const ticketsCreados = tickets.filter(ticket => ticket.creador === currentUser.username);

    document.getElementById('ticket-count-assigned').innerText = ticketsAsignados.length;
    document.getElementById('ticket-count-created').innerText = ticketsCreados.length;
}

// Función para generar el gráfico de tickets con Chart.js
function generarGraficoTickets() {
    const ctx = document.getElementById('ticket-chart').getContext('2d');
    const estados = ['Pendiente', 'En desarrollo', 'Cancelado', 'Finalizado'];
    const conteoEstados = estados.map(estado => tickets.filter(ticket => ticket.estado === estado).length);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: estados,
            datasets: [{
                label: 'Estado de Tickets',
                data: conteoEstados,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Al cargar la página, cargar los usuarios desde el JSON
window.onload = function() {
    cargarUsuariosDesdeJson();
}
