// Datos de usuarios (inicialmente vacío, se llenará desde el JSON)
let usuarios = [];

// Datos de tickets
const tickets = [];

// Historial de actividades
const historial = [];

// Variables globales
let usuarioActual = null;
let ticketAEditar = null;
let ticketParaAgregarNota = null;
let ticketParaTransferir = null;
let graficoTickets = null; // Variable para mantener la referencia al gráfico

// Modal de usuario
let modalUsuario = null;

// Función para cargar usuarios desde un archivo JSON
function cargarUsuariosDesdeJson() {
    fetch('usuarios.json')
        .then(response => response.json())
        .then(data => {
            usuarios = data;
            inicializarAplicacion();
        })
        .catch(error => console.error('Error al cargar el archivo usuarios.json:', error));
}

// Inicializar la aplicación una vez cargados los usuarios
function inicializarAplicacion() {
    usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioActual) {
        mostrarDashboard(usuarioActual.rol);
    } else {
        mostrarLogin();
    }

    // Asignar eventos desde el JS
    document.getElementById('formulario-login').onsubmit = iniciarSesion;
    document.getElementById('boton-cerrar-sesion').onclick = cerrarSesion;
    document.getElementById('enlace-inicio').onclick = () => mostrarSeccion('inicio');
    document.getElementById('enlace-tickets').onclick = () => mostrarSeccion('tickets');
    document.getElementById('boton-enlace-usuarios').onclick = () => mostrarSeccion('usuarios');
    document.getElementById('boton-nuevo-ticket').onclick = () => mostrarSeccion('nuevo-ticket');
    document.getElementById('formulario-usuario').onsubmit = crearUsuario;

    // Modal de usuario
    modalUsuario = document.getElementById('modal-usuario');
    document.getElementById('boton-nuevo-usuario').onclick = abrirModalUsuario;
    document.getElementById('cerrar-modal-usuario').onclick = cerrarModalUsuario;

    // Otros modales
    document.getElementById('cerrar-modal-editar').onclick = cerrarModalEditar;
    document.getElementById('cerrar-modal-nota').onclick = cerrarModalNota;
    document.getElementById('cerrar-modal-transferir').onclick = cerrarModalTransferir;
}

// Función para abrir el modal de usuario
function abrirModalUsuario() {
    document.getElementById('titulo-modal-usuario').textContent = "Crear Usuario";
    document.getElementById('formulario-usuario').reset(); // Limpiar el formulario
    modalUsuario.style.display = 'block';
}

// Función para cerrar el modal de usuario
function cerrarModalUsuario() {
    modalUsuario.style.display = 'none';
}

// Función para el inicio de sesión
function iniciarSesion(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    
    const usuarioEncontrado = usuarios.find(user => user.nombreUsuario === usuario && user.contrasena === contrasena);
    
    if (usuarioEncontrado) {
        usuarioActual = usuarioEncontrado;
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
        mostrarDashboard(usuarioEncontrado.rol);
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
}

// Función para mostrar el dashboard según el rol del usuario
function mostrarDashboard(rol) {
    document.getElementById('contenedor-login').style.display = 'none';
    document.getElementById('contenedor-dashboard').style.display = 'flex';
    
    if (rol === 'admin') {
        document.getElementById('enlace-usuarios').style.display = 'block';
        cargarUsuarios();
    } else {
        document.getElementById('enlace-usuarios').style.display = 'none';
    }

    // Mostrar información del usuario
    document.getElementById('nombre-usuario').innerText = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
    document.getElementById('departamento-usuario').innerText = usuarioActual.departamento;

    cargarResumenTickets();
    cargarHistorial();
}

// Función para mostrar la sección seleccionada
function mostrarSeccion(idSeccion) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => seccion.style.display = 'none');
    
    document.getElementById(idSeccion).style.display = 'block';
    
    if (idSeccion === 'tickets') {
        cargarTickets();
    } else if (idSeccion === 'usuarios') {
        cargarUsuarios();
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    usuarioActual = null;
    mostrarLogin();
}

// Función para mostrar la pantalla de inicio de sesión
function mostrarLogin() {
    document.getElementById('contenedor-login').style.display = 'block';
    document.getElementById('contenedor-dashboard').style.display = 'none';
}

// Función para crear o editar un usuario
function crearUsuario(event) {
    event.preventDefault();

    const nombreUsuario = document.getElementById('nombre-usuario').value;
    const contrasenaUsuario = document.getElementById('contrasena-usuario').value;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cargo = document.getElementById('cargo').value;
    const area = document.getElementById('area').value;
    const correo = document.getElementById('correo').value;
    const administra = document.getElementById('administra').value;
    const indiceEditarUsuario = document.getElementById('indice-editar-usuario').value;

    const usuario = {
        nombreUsuario: nombreUsuario,
        contrasena: contrasenaUsuario,
        rol: administra === 'si' ? 'admin' : 'usuario',
        departamento: area,
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        administra: administra
    };

    if (indiceEditarUsuario) {
        usuarios[indiceEditarUsuario] = usuario;
        agregarHistorial(`Usuario ${usuario.nombreUsuario} actualizado por ${usuarioActual.nombreUsuario}`);
    } else {
        usuarios.push(usuario);
        agregarHistorial(`Usuario ${usuario.nombreUsuario} creado por ${usuarioActual.nombreUsuario}`);
    }

    cargarUsuarios();
    cerrarModalUsuario(); // Cerrar el modal después de guardar el usuario
}

// Función para cargar usuarios en la tabla de usuarios
function cargarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    usuarios.forEach((usuario, indice) => {
        const fila = tbody.insertRow();
        fila.insertCell().innerText = usuario.nombreUsuario;
        fila.insertCell().innerText = usuario.contrasena;
        fila.insertCell().innerText = usuario.nombre || 'undefined';
        fila.insertCell().innerText = usuario.apellido || 'undefined';
        fila.insertCell().innerText = usuario.rol;
        fila.insertCell().innerText = usuario.departamento;
        fila.insertCell().innerText = usuario.correo || 'undefined';
        fila.insertCell().innerText = usuario.administra;
        
        const celdaAcciones = fila.insertCell();
        const botonEditar = document.createElement('button');
        botonEditar.innerText = 'Editar';
        botonEditar.onclick = () => editarUsuario(indice);
        celdaAcciones.appendChild(botonEditar);
    });
}

// Función para editar un usuario
function editarUsuario(indice) {
    const usuario = usuarios[indice];
    document.getElementById('indice-editar-usuario').value = indice;
    document.getElementById('nombre-usuario').value = usuario.nombreUsuario;
    document.getElementById('contrasena-usuario').value = usuario.contrasena;
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('apellido').value = usuario.apellido;
    document.getElementById('cargo').value = usuario.rol;
    document.getElementById('area').value = usuario.departamento;
    document.getElementById('correo').value = usuario.correo;
    document.getElementById('administra').value = usuario.administra;

    document.getElementById('titulo-modal-usuario').textContent = "Editar Usuario";
    modalUsuario.style.display = 'block'; // Mostrar el modal para editar
}

// Función para crear un nuevo ticket
function crearTicket(event) {
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
        creador: usuarioActual.nombreUsuario,
        asignadoA: [],
        notas: []
    };

    // Lógica para asignar el ticket a usuarios específicos
    if (usuario === 'Todos') {
        // Asigna el ticket a todos los usuarios del departamento seleccionado
        ticket.asignadoA = usuarios
            .filter(user => user.departamento === departamento)
            .map(user => user.nombreUsuario);
    } else {
        // Asigna el ticket al usuario específico seleccionado
        ticket.asignadoA.push(usuario);
    }

    // Verifica si se asignaron usuarios al ticket
    if (ticket.asignadoA.length === 0) {
        alert("No se pudo asignar el ticket. Verifique que el departamento o usuario seleccionado exista.");
        return;
    }

    tickets.push(ticket);
    agregarHistorial(`Ticket ${titulo} creado por ${usuarioActual.nombreUsuario} y asignado a ${ticket.asignadoA.join(', ')}`);

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
    let encabezadoCreadosAgregado = false;
    tickets.forEach(ticket => {
        if (ticket.creador === usuarioActual.nombreUsuario) {
            if (!encabezadoCreadosAgregado) {
                const filaEncabezado = tbody.insertRow();
                const celdaEncabezado = filaEncabezado.insertCell();
                celdaEncabezado.colSpan = 9;
                celdaEncabezado.style.fontWeight = 'bold';
                celdaEncabezado.style.textAlign = 'center';
                celdaEncabezado.textContent = 'Tickets Creados';
                encabezadoCreadosAgregado = true;
            }
            agregarFilaTicket(tbody, ticket);
        }
    });

    // Separador
    const filaSeparador = tbody.insertRow();
    const celdaSeparador = filaSeparador.insertCell();
    celdaSeparador.colSpan = 9;
    celdaSeparador.style.borderTop = '2px solid black';

    // Tickets asignados al usuario
    let encabezadoAsignadosAgregado = false;
    tickets.forEach(ticket => {
        if (ticket.asignadoA.includes(usuarioActual.nombreUsuario) && ticket.creador !== usuarioActual.nombreUsuario) {
            if (!encabezadoAsignadosAgregado) {
                const filaEncabezado = tbody.insertRow();
                const celdaEncabezado = filaEncabezado.insertCell();
                celdaEncabezado.colSpan = 9;
                celdaEncabezado.style.fontWeight = 'bold';
                celdaEncabezado.style.textAlign = 'center';
                celdaEncabezado.textContent = 'Tickets Asignados';
                encabezadoAsignadosAgregado = true;
            }
            agregarFilaTicket(tbody, ticket);
        }
    });

    generarGraficoTickets();
}

// Función para agregar una fila de ticket a la tabla
function agregarFilaTicket(tbody, ticket) {
    const fila = tbody.insertRow();
    fila.insertCell().innerText = ticket.asunto;
    fila.insertCell().innerText = ticket.proyecto;
    fila.insertCell().innerText = ticket.tipo;
    fila.insertCell().innerText = ticket.descripcion;
    fila.insertCell().innerText = ticket.prioridad;
    fila.insertCell().innerText = ticket.estado;
    fila.insertCell().innerText = ticket.fecha;
    fila.insertCell().innerText = ticket.ultimaActualizacion;

    const celdaAcciones = fila.insertCell();
    
    const botonNota = document.createElement('button');
    botonNota.innerText = 'Agregar Nota';
    botonNota.onclick = () => abrirModalNota(ticket);
    celdaAcciones.appendChild(botonNota);

    const botonEditar = document.createElement('button');
    botonEditar.innerText = 'Editar';
    botonEditar.disabled = (ticket.estado === 'Finalizado');  // Deshabilitar si el estado es "Finalizado"
    botonEditar.onclick = () => abrirModalEditar(ticket);
    celdaAcciones.appendChild(botonEditar);

    const botonBorrar = document.createElement('button');
    botonBorrar.innerText = 'Borrar';
    botonBorrar.onclick = () => borrarTicket(ticket);
    celdaAcciones.appendChild(botonBorrar);

    const botonTransferir = document.createElement('button');
    botonTransferir.innerText = 'Transferir';
    botonTransferir.onclick = () => abrirModalTransferir(ticket);
    celdaAcciones.appendChild(botonTransferir);
}

// Función para borrar un ticket
function borrarTicket(ticket) {
    const confirmacion = confirm(`¿Estás seguro de que quieres borrar el ticket "${ticket.asunto}"?`);
    if (confirmacion) {
        const index = tickets.indexOf(ticket);
        if (index !== -1) {
            tickets.splice(index, 1); // Elimina el ticket del array
            agregarHistorial(`Ticket ${ticket.asunto} borrado por ${usuarioActual.nombreUsuario}`);
            cargarTickets(); // Recarga la lista de tickets
            cargarResumenTickets(); // Actualiza el resumen de tickets
        } else {
            alert("El ticket no se encontró y no pudo ser borrado.");
        }
    }
}

// Función para abrir el modal de edición de ticket
function abrirModalEditar(ticket) {
    if (ticket.estado === 'Finalizado') {
        return; // No permitir abrir el modal si el ticket está "Finalizado"
    }

    ticketAEditar = ticket;
    document.getElementById('editar-titulo').value = ticket.asunto;
    document.getElementById('editar-tipo').value = ticket.tipo;
    document.getElementById('editar-descripcion').value = ticket.descripcion;
    document.getElementById('editar-prioridad').value = ticket.prioridad;
    document.getElementById('editar-estado').value = ticket.estado;
    document.getElementById('modal-editar').style.display = 'block';
}

// Función para cerrar el modal de edición de ticket
function cerrarModalEditar() {
    ticketAEditar = null;
    document.getElementById('modal-editar').style.display = 'none';
}

// Función para guardar los cambios del ticket editado
function guardarCambiosTicket(event) {
    event.preventDefault();
    
    ticketAEditar.asunto = document.getElementById('editar-titulo').value;
    ticketAEditar.tipo = document.getElementById('editar-tipo').value;
    ticketAEditar.descripcion = document.getElementById('editar-descripcion').value;
    ticketAEditar.prioridad = document.getElementById('editar-prioridad').value;
    ticketAEditar.estado = document.getElementById('editar-estado').value;
    ticketAEditar.ultimaActualizacion = new Date().toISOString();
    
    agregarHistorial(`Ticket ${ticketAEditar.asunto} editado por ${usuarioActual.nombreUsuario}`);
    cargarTickets();
    cerrarModalEditar();
}

// Función para abrir el modal de agregar nota
function abrirModalNota(ticket) {
    ticketParaAgregarNota = ticket;
    document.getElementById('modal-nota').style.display = 'block';
}

// Función para cerrar el modal de agregar nota
function cerrarModalNota() {
    ticketParaAgregarNota = null;
    document.getElementById('modal-nota').style.display = 'none';
}

// Función para guardar la nota
function guardarNota(event) {
    event.preventDefault();

    const nota = document.getElementById('contenido-nota').value;
    if (nota) {
        const notaCompleta = `${new Date().toLocaleString()} - ${usuarioActual.nombreUsuario}: ${nota}`;
        ticketParaAgregarNota.descripcion += `\n${notaCompleta}`;
        ticketParaAgregarNota.ultimaActualizacion = new Date().toISOString();
        agregarHistorial(`Nota agregada al ticket ${ticketParaAgregarNota.asunto} por ${usuarioActual.nombreUsuario}`);
        cargarTickets();
        cerrarModalNota();
    }
}

// Función para abrir el modal de transferencia de ticket
function abrirModalTransferir(ticket) {
    ticketParaTransferir = ticket;
    document.getElementById('modal-transferir').style.display = 'block';
}

// Función para cerrar el modal de transferencia de ticket
function cerrarModalTransferir() {
    ticketParaTransferir = null;
    document.getElementById('modal-transferir').style.display = 'none';
}

// Función para transferir un ticket
function transferirTicket(event) {
    event.preventDefault();

    const departamento = document.getElementById('transferir-departamento').value;
    const usuario = document.getElementById('transferir-usuario').value;

    if (usuario === 'Todos') {
        // Asigna el ticket a todos los usuarios del departamento
        ticketParaTransferir.asignadoA = usuarios.filter(user => user.departamento === departamento).map(user => user.nombreUsuario);
    } else {
        // Asigna el ticket a un usuario específico
        ticketParaTransferir.asignadoA = [usuario];
    }

    ticketParaTransferir.ultimaActualizacion = new Date().toISOString();
    agregarHistorial(`Ticket ${ticketParaTransferir.asunto} transferido a ${usuario} por ${usuarioActual.nombreUsuario}`);
    cargarTickets();
    cerrarModalTransferir();
}

// Función para agregar una entrada al historial
function agregarHistorial(entrada) {
    historial.push(`${new Date().toLocaleString()}: ${entrada}`);
    cargarHistorial();
}

// Función para cargar el historial de actividades del usuario logueado
function cargarHistorial() {
    const listaHistorial = document.getElementById('lista-historial');
    listaHistorial.innerHTML = '';

    historial
        .filter(entrada => entrada.includes(usuarioActual.nombreUsuario)) // Filtra solo las actividades del usuario actual
        .forEach(entrada => {
            const itemLista = document.createElement('li');
            itemLista.textContent = entrada;
            listaHistorial.appendChild(itemLista);
        });
}

// Función para cargar un resumen de los tickets
function cargarResumenTickets() {
    const ticketsAsignados = tickets.filter(ticket => ticket.asignadoA.includes(usuarioActual.nombreUsuario));
    const ticketsCreados = tickets.filter(ticket => ticket.creador === usuarioActual.nombreUsuario);

    document.getElementById('contador-tickets-asignados').innerText = ticketsAsignados.length;
    document.getElementById('contador-tickets-creados').innerText = ticketsCreados.length;
}

// Función para generar el gráfico de tickets con Chart.js
function generarGraficoTickets() {
    const ctx = document.getElementById('grafico-tickets').getContext('2d');
    const estados = ['Pendiente', 'En desarrollo', 'Cancelado', 'Finalizado'];
    const conteoEstados = estados.map(estado => tickets.filter(ticket => ticket.estado === estado).length);

    // Destruye el gráfico existente antes de crear uno nuevo
    if (graficoTickets) {
        graficoTickets.destroy();
    }

    graficoTickets = new Chart(ctx, {
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
