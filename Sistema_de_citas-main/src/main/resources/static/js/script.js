const API = 'http://localhost:8087';
let horariosActuales = [];
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = (modal.style.display === "block") ? "none" : "block";
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains("capa-fondo-modal")) {
        event.target.style.display = "none";
    }
};

document.addEventListener('DOMContentLoaded', () => {

    renderizarHeaderSesion();
    iniciarModuloMisCitas();

    const logotipoGlobal = document.querySelector('.encabezado-navegacion .logotipo');
    if (logotipoGlobal) {
        logotipoGlobal.style.cursor = 'pointer';
        logotipoGlobal.addEventListener('click', () => {
            location.href = '/index.html';
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        configurarFormularioRegistro(registerForm);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        configurarFormularioLogin(loginForm);
    }

    const tablaDoctores = document.getElementById('tablaDoctoresBody');
    if (tablaDoctores) {
        cargarDoctores();
        cargarEspecialidades();
        configurarNavegacionVistas();
        configurarSanitizacionInputs();
        configurarFormularioDoctores();
    }

    iniciarModuloEspecialidades();
    iniciarModuloCitas();
    iniciarModuloPago();
    iniciarModuloEstadisticas();
});

//  Modulo de Sesión Global

function cerrarSesion() {
    sessionStorage.removeItem('paciente');
    window.location.href = '/index.html';
}

function renderizarHeaderSesion() {
    const zona = document.getElementById('zona-sesion');
    const nav  = document.getElementById('menu-nav');
    const paciente = JSON.parse(sessionStorage.getItem('paciente'));

    if (paciente && paciente.rol === 'ADMIN') {
        if (zona) zona.innerHTML = `
            <span style="color:#fff; font-weight:600;">Hola, ${paciente.nombres}</span>
            <button class="boton-blanco" onclick="cerrarSesion()">Cerrar sesión</button>`;
        if (nav) nav.innerHTML = `
            <a href="/index.html">Inicio</a>
            <a href="/especialidades.html">Especialidades</a>
            <a href="/doctores.html">Doctores</a>
            <a href="/horarios.html">Horarios</a>`;

    } else if (paciente) {
        if (zona) zona.innerHTML = `
            <span style="color:#fff; font-weight:600;">Hola, ${paciente.nombres}</span>
            <button class="boton-blanco" onclick="cerrarSesion()">Cerrar sesión</button>`;
        if (nav) nav.innerHTML = `
            <a href="/index.html">Inicio</a>
            <a href="/citas.html">Sacar Cita</a>
            <a href="/miscitas.html">Mis Citas</a>`;

    } else {
        if (zona) zona.innerHTML = `
            <button class="boton-blanco" onclick="toggleModal('modal-login')">Iniciar Sesión</button>
            <button class="boton-azul" onclick="toggleModal('modal-registro')">Registrarse</button>`;
        if (nav) nav.innerHTML = `
            <a href="/index.html">Inicio</a>
            <a href="/sobre_nosotros.html">Sobre Nosotros</a>
            <a href="/vision.html">Visión</a>
            <a href="/mision.html">Misión</a>`;
    }
}

function irSacarCita() {
    const paciente = JSON.parse(sessionStorage.getItem('paciente'));
    if (paciente) {
        window.location.href = '/citas.html';
    } else {
        toggleModal('modal-login');
    }
}
function irConSesion(url) {
    const paciente = JSON.parse(sessionStorage.getItem('paciente'));
    if (!paciente) {
        toggleModal('modal-login');
    } else {
        window.location.href = url;
    }
}
//  Modal de Registro

function configurarFormularioRegistro(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (data.dni && data.dni.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'DNI Inválido',
                text: 'El DNI debe tener mínimo 8 caracteres.',
                confirmButtonColor: '#004a99'
            });
            return;
        }

        try {
            const response = await fetch(`${API}/api/pacientes/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                toggleModal('modal-registro');
                e.target.reset();
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    text: 'Tu cuenta ha sido creada correctamente.',
                    confirmButtonColor: '#004a99'
                });
            } else {
                const error = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el registro',
                    text: error.mensaje || 'Ocurrió un error al registrar.',
                    confirmButtonColor: '#004a99'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#004a99'
            });
        }
    });
}

//  Modal del Login

function configurarFormularioLogin(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API}/api/pacientes/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const paciente = await response.json();
                sessionStorage.setItem('paciente', JSON.stringify(paciente));
                toggleModal('modal-login');
                e.target.reset();
                Swal.fire({
                    icon: 'success',
                    title: '¡Sesión iniciada!',
                    text: 'Bienvenido al Sistema de Citas.',
                    confirmButtonColor: '#004a99',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    renderizarHeaderSesion();
                });
            } else {
                const error = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: error.mensaje || 'El correo o la contraseña son incorrectos.',
                    confirmButtonColor: '#004a99'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#004a99'
            });
        }
    });
}

//  Doctores.html

function configurarNavegacionVistas() {
    const vistaTabla      = document.getElementById('vistaTabla');
    const vistaFormulario = document.getElementById('vistaFormulario');
    const btnMostrarForm  = document.getElementById('btnMostrarForm');
    const btnCancelar     = document.getElementById('btnCancelar');
    const btnRegresarHome = document.getElementById('btnRegresarHome');

    if (btnMostrarForm) {
        btnMostrarForm.addEventListener('click', () => {
            document.getElementById('tituloFormulario').textContent      = "Registrar Especialista";
            document.getElementById('descripcionFormulario').textContent = "Ingrese los datos requeridos para dar de alta al médico.";
            document.getElementById('inputIdDoctor').value               = "";
            document.getElementById('inputDni').readOnly                 = false;
            vistaTabla.classList.add('oculto');
            vistaFormulario.classList.remove('oculto');
        });
    }

    const volverALaTabla = () => {
        vistaFormulario.classList.add('oculto');
        vistaTabla.classList.remove('oculto');
        const formDoc = document.getElementById('doctorForm');
        if (formDoc) formDoc.reset();
    };

    if (btnCancelar)     btnCancelar.addEventListener('click', volverALaTabla);

    if (btnRegresarHome) {
        btnRegresarHome.addEventListener('click', () => {
            if (vistaFormulario && !vistaFormulario.classList.contains('oculto')) {
                volverALaTabla();
            } else {
                location.href = '/index.html';
            }
        });
    }
}

function configurarSanitizacionInputs() {
    const inputDni      = document.getElementById('inputDni');
    const inputTelefono = document.getElementById('inputTelefono');

    if (inputDni) {
        inputDni.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);
        });
    }

    if (inputTelefono) {
        inputTelefono.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        });
    }
}

async function cargarDoctores() {
    const tbody = document.getElementById('tablaDoctoresBody');
    try {
        const response = await fetch(`${API}/api/doctores/activos`);
        if (response.ok) {
            const doctores = await response.json();

            if (doctores.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="celda-estado">No hay doctores registrados actualmente.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            doctores.forEach(doc => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight:bold; color:var(--azul-institucional);">${doc.dni}</td>
                    <td>${doc.apellidos}, ${doc.nombres}</td>
                    <td><span class="badge-especialidad">${doc.especialidad ? doc.especialidad.nombre : 'Sin asignar'}</span></td>
                    <td>${doc.correo}</td>
                    <td>${doc.telefono ? doc.telefono : '<span style="color:#aaa;">-</span>'}</td>
                    <td>
                        <button class="boton-editar" onclick="prepararEdicionDoctor(${doc.idDoctor}, '${doc.dni}', '${doc.nombres}', '${doc.apellidos}', '${doc.correo}', '${doc.telefono || ''}', ${doc.especialidad ? doc.especialidad.idEspecialidad : 'null'})">Editar</button>
                        <button class="boton-eliminar" onclick="eliminarDoctor(${doc.idDoctor})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="celda-estado" style="color:red;">Error al obtener la lista de médicos.</td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="celda-estado" style="color:red;">Error de conexión con el servidor.</td></tr>';
    }
}

function prepararEdicionDoctor(id, dni, nombres, apellidos, correo, telefono, idEspecialidad) {
    document.getElementById('inputIdDoctor').value   = id;
    document.getElementById('inputNombres').value    = nombres;
    document.getElementById('inputApellidos').value  = apellidos;
    document.getElementById('inputDni').value        = dni;
    document.getElementById('inputDni').readOnly     = true;
    document.getElementById('inputCorreo').value     = correo;
    document.getElementById('inputTelefono').value   = telefono;

    const select = document.getElementById('selectEspecialidad');
    if (select && idEspecialidad) select.value = idEspecialidad;

    document.getElementById('tituloFormulario').textContent      = "Modificar Especialista";
    document.getElementById('descripcionFormulario').textContent = "Edite los campos necesarios para actualizar el registro del médico.";

    document.getElementById('vistaTabla').classList.add('oculto');
    document.getElementById('vistaFormulario').classList.remove('oculto');
}

async function eliminarDoctor(id) {
    Swal.fire({
        title: '¿Está seguro de eliminar?',
        text: "El doctor dejará de figurar en el staff médico activo del sistema.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#004a99',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API}/api/doctores/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await cargarDoctores();
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El especialista fue dado de baja correctamente.',
                        confirmButtonColor: '#004a99'
                    });
                } else {
                    const err = await response.json().catch(() => ({}));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.mensaje || 'No se pudo desactivar el registro.',
                        confirmButtonColor: '#004a99'
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Red',
                    text: 'No hay respuesta del servidor.',
                    confirmButtonColor: '#004a99'
                });
            }
        }
    });
}

async function cargarEspecialidades() {
    const select = document.getElementById('selectEspecialidad');
    if (!select) return;
    try {
        const response = await fetch(`${API}/api/especialidades/activas`);
        if (response.ok) {
            const especialidades = await response.json();
            select.innerHTML = '<option value="" disabled selected>Seleccione la especialidad...</option>';
            especialidades.forEach(esp => {
                const option       = document.createElement('option');
                option.value       = Math.floor(esp.idEspecialidad);
                option.textContent = esp.nombre;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="" disabled>Error al cargar especialidades</option>';
        }
    } catch (err) {
        select.innerHTML = '<option value="" disabled>Error de enlace con el servidor</option>';
    }
}

function configurarFormularioDoctores() {
    const form = document.getElementById('doctorForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData                   = new FormData(form);
        const inputData                  = Object.fromEntries(formData.entries());
        const selectEsp                  = document.getElementById('selectEspecialidad');
        const idEspecialidadSeleccionada = selectEsp ? selectEsp.value : '';
        const idDoctor                   = document.getElementById('inputIdDoctor').value;

        if (inputData.dni && inputData.dni.length !== 8) {
            Swal.fire({
                icon: 'warning',
                title: 'DNI Inválido',
                text: 'El DNI debe contener exactamente 8 números.',
                confirmButtonColor: '#004a99'
            });
            return;
        }

        if (inputData.telefono && inputData.telefono.length !== 9) {
            Swal.fire({
                icon: 'warning',
                title: 'Teléfono Inválido',
                text: 'El número de teléfono debe contener exactamente 9 dígitos.',
                confirmButtonColor: '#004a99'
            });
            return;
        }

        const doctorPayload = {
            dni:          inputData.dni,
            nombres:      inputData.nombres,
            apellidos:    inputData.apellidos,
            correo:       inputData.correo,
            telefono:     inputData.telefono || null,
            especialidad: { idEspecialidad: parseInt(idEspecialidadSeleccionada) }
        };

        const esEdicion = idDoctor !== "";
        const url       = esEdicion ? `${API}/api/doctores/${idDoctor}` : `${API}/api/doctores`;
        const metodo    = esEdicion ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method:  metodo,
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(doctorPayload)
            });

            if (response.ok) {
                form.reset();
                if (selectEsp) selectEsp.selectedIndex = 0;
                document.getElementById('vistaFormulario').classList.add('oculto');
                document.getElementById('vistaTabla').classList.remove('oculto');
                await cargarDoctores();
                Swal.fire({
                    icon: 'success',
                    title: esEdicion ? '¡Cambios Guardados!' : '¡Médico Añadido!',
                    text:  esEdicion ? 'Los datos del doctor se actualizaron con éxito.' : 'El doctor se ha registrado correctamente.',
                    confirmButtonColor: '#004a99'
                });
            } else {
                const error = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el proceso',
                    text: error.mensaje || 'Revise que los datos únicos no estén duplicados.',
                    confirmButtonColor: '#004a99'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Fallo de Red',
                text: 'No hay respuesta del backend de Spring Boot.',
                confirmButtonColor: '#004a99'
            });
        }
    });
}

//  Especialidades.html

function iniciarModuloEspecialidades() {
    const tbody = document.getElementById('tablaEspecialidadesBody');
    if (!tbody) return;

    const API_ESP         = `${API}/api/especialidades`;
    const vistaTabla      = document.getElementById('vistaTabla');
    const vistaFormulario = document.getElementById('vistaFormulario');
    const btnMostrarForm  = document.getElementById('btnMostrarForm');
    const btnCancelar     = document.getElementById('btnCancelar');
    const btnRegresar     = document.getElementById('btnRegresarHome');
    const form            = document.getElementById('especialidadForm');

    // ── Vistas ────────────────────────────────────────────────
    function mostrarFormularioEsp(esEdicion = false) {
        document.getElementById('tituloFormulario').textContent      = esEdicion ? 'Editar Especialidad'                                  : 'Registrar Especialidad';
        document.getElementById('descripcionFormulario').textContent = esEdicion ? 'Modifique los datos de la especialidad seleccionada.' : 'Ingrese los datos requeridos para registrar la especialidad.';
        document.getElementById('btnGuardar').textContent            = esEdicion ? 'Actualizar Especialidad'                              : 'Guardar Especialidad';
        vistaTabla.classList.add('oculto');
        vistaFormulario.classList.remove('oculto');
    }

    function mostrarTablaEsp() {
        vistaFormulario.classList.add('oculto');
        vistaTabla.classList.remove('oculto');
        form.reset();
        document.getElementById('inputIdEspecialidad').value = '';
        document.getElementById('inputIdPrecio').value       = '';
    }

    btnMostrarForm.addEventListener('click', () => mostrarFormularioEsp(false));
    btnCancelar.addEventListener('click', mostrarTablaEsp);
    btnRegresar.addEventListener('click', () => {
        if (!vistaFormulario.classList.contains('oculto')) {
            mostrarTablaEsp();
        } else {
            location.href = '/index.html';
        }
    });

    // ── Cargar tabla con precios ──────────────────────────────
    async function cargarTablaEspecialidades() {
        try {
            const [resEsp, resPrecios] = await Promise.all([
                fetch(API_ESP),
                fetch(`${API}/api/precios`)
            ]);

            if (!resEsp.ok) throw new Error();
            const lista   = await resEsp.json();
            const precios = resPrecios.ok ? await resPrecios.json() : [];

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="celda-estado">No hay especialidades registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = lista.map(esp => {
                const precioObj = precios.find(p => p.especialidad.idEspecialidad === esp.idEspecialidad);
                const monto     = precioObj ? `S/ ${parseFloat(precioObj.monto).toFixed(2)}` : '—';

                return `
                    <tr>
                        <td style="font-weight:bold; color:var(--azul-institucional);">${esp.idEspecialidad}</td>
                        <td>${esp.nombre}</td>
                        <td>${esp.descripcion ?? '<span style="color:#aaa;">—</span>'}</td>
                        <td><strong>${monto}</strong></td>
                        <td>
                            <span style="
                                display:inline-block; padding:3px 12px; border-radius:20px;
                                font-size:0.82rem; font-weight:700;
                                background:${esp.activo ? '#d1fae5' : '#fee2e2'};
                                color:${esp.activo ? '#065f46' : '#991b1b'};
                            ">${esp.activo ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td>
                            <button class="boton-editar"
                                onclick="prepararEdicionEsp(${esp.idEspecialidad}, '${esp.nombre.replace(/'/g, "\\'")}', \`${(esp.descripcion ?? '').replace(/`/g, '\\`')}\`)">
                                Editar
                            </button>
                            <button class="boton-eliminar"
                                onclick="toggleEstadoEsp(${esp.idEspecialidad}, ${esp.activo})">
                                ${esp.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

        } catch {
            tbody.innerHTML = '<tr><td colspan="6" class="celda-estado" style="color:red;">Error al cargar las especialidades.</td></tr>';
        }
    }

    // ── Submit: POST / PUT especialidad + precio ──────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id          = document.getElementById('inputIdEspecialidad').value;
        const idPrecio    = document.getElementById('inputIdPrecio').value;
        const nombre      = document.getElementById('inputNombre').value.trim();
        const descripcion = document.getElementById('inputDescripcion').value.trim();
        const precio      = document.getElementById('inputPrecio').value.trim();

        if (!nombre) {
            Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El nombre de la especialidad es obligatorio.', confirmButtonColor: '#004a99' });
            return;
        }

        const esEdicion = id !== '';
        const payload   = { nombre, descripcion: descripcion || null };

        try {
            const res = await fetch(esEdicion ? `${API_ESP}/${id}` : API_ESP, {
                method:  esEdicion ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                Swal.fire({ icon: 'error', title: 'Error', text: err.mensaje || 'No se pudo guardar la especialidad.', confirmButtonColor: '#004a99' });
                return;
            }

            const especialidadGuardada = await res.json();

            // Guardar o actualizar precio si se ingresó
            if (precio && parseFloat(precio) > 0) {
                const precioPayload = {
                    especialidad: { idEspecialidad: especialidadGuardada.idEspecialidad },
                    descripcion:  `Consulta ${nombre}`,
                    monto:        parseFloat(precio),
                    activo:       true
                };

                if (idPrecio) {
                    // Actualizar precio existente
                    await fetch(`${API}/api/precios/${idPrecio}`, {
                        method:  'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify(precioPayload)
                    });
                } else {
                    // Crear nuevo precio
                    await fetch(`${API}/api/precios`, {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify(precioPayload)
                    });
                }
            }

            mostrarTablaEsp();
            await cargarTablaEspecialidades();
            Swal.fire({
                icon: 'success',
                title: esEdicion ? '¡Especialidad actualizada!' : '¡Especialidad registrada!',
                text:  esEdicion ? 'Los datos se actualizaron en la base de datos.' : 'La especialidad fue guardada correctamente en la base de datos.',
                confirmButtonColor: '#004a99'
            });

        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor Spring Boot.', confirmButtonColor: '#004a99' });
        }
    });

    // ── Editar: carga datos + precio actual ───────────────────
    window.prepararEdicionEsp = async function(id, nombre, descripcion) {
        document.getElementById('inputIdEspecialidad').value = id;
        document.getElementById('inputNombre').value         = nombre;
        document.getElementById('inputDescripcion').value    = descripcion;

        // Cargar precio actual
        try {
            const res = await fetch(`${API}/api/precios/especialidad/${id}`);
            if (res.ok) {
                const precio = await res.json();
                document.getElementById('inputPrecio').value   = parseFloat(precio.monto).toFixed(2);
                document.getElementById('inputIdPrecio').value = precio.idPrecio;
            } else {
                document.getElementById('inputPrecio').value   = '';
                document.getElementById('inputIdPrecio').value = '';
            }
        } catch {
            document.getElementById('inputPrecio').value   = '';
            document.getElementById('inputIdPrecio').value = '';
        }

        mostrarFormularioEsp(true);
    };

    // ── Desactivar / Activar ──────────────────────────────────
    window.toggleEstadoEsp = async function(id, estaActivo) {
        const accion = estaActivo ? 'desactivar' : 'activar';
        const result = await Swal.fire({
            icon: 'warning',
            title: `¿Deseas ${accion} esta especialidad?`,
            text:  estaActivo ? 'Dejará de estar disponible para nuevas citas.' : 'Volverá a estar disponible en el sistema.',
            showCancelButton:   true,
            confirmButtonText:  `Sí, ${accion}`,
            cancelButtonText:   'Cancelar',
            confirmButtonColor: estaActivo ? '#d33' : '#004a99'
        });

        if (!result.isConfirmed) return;

        try {
            const res = estaActivo
                ? await fetch(`${API}/api/especialidades/${id}`, { method: 'DELETE' })
                : await fetch(`${API}/api/especialidades/${id}/activar`, { method: 'PUT' });

            if (res.ok || res.status === 204) {
                await cargarTablaEspecialidades();
                Swal.fire({ icon: 'success', title: `Especialidad ${estaActivo ? 'desactivada' : 'activada'}`, text: 'El cambio fue guardado en la base de datos.', confirmButtonColor: '#004a99' });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: `No se pudo ${accion} la especialidad.`, confirmButtonColor: '#004a99' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'Sin respuesta del servidor.', confirmButtonColor: '#004a99' });
        }
    };

    cargarTablaEspecialidades();
}

//horarios.html

function iniciarModuloHorarios() {
    const tbody = document.getElementById('tablaHorariosBody');
    if (!tbody) return;

    const API_HORARIOS = 'http://localhost:8087/api/horarios';
    const API_DOCTORES = 'http://localhost:8087/api/doctores/activos';

    const vistaTabla      = document.getElementById('vistaTabla');
    const vistaFormulario = document.getElementById('vistaFormulario');
    const btnMostrarForm  = document.getElementById('btnMostrarForm');
    const btnCancelar     = document.getElementById('btnCancelar');
    const btnRegresarHome = document.getElementById('btnRegresarHome');
    const form            = document.getElementById('horarioForm');

    const selectDoctorHorario = document.getElementById('selectDoctor');
    const selectTurnoHorario  = document.getElementById('selectTurno');

    function mostrarFormulario() {
        form.reset();
        cargarDoctoresEnSelector();
        vistaTabla.classList.add('oculto');
        vistaFormulario.classList.remove('oculto');
    }

    function ocultarFormulario() {
        form.reset();
        vistaFormulario.classList.add('oculto');
        vistaTabla.classList.remove('oculto');
    }

    if (btnMostrarForm)  btnMostrarForm.addEventListener('click', mostrarFormulario);
    if (btnCancelar)     btnCancelar.addEventListener('click', ocultarFormulario);
    if (btnRegresarHome) btnRegresarHome.addEventListener('click', () => { location.href = '/index.html'; });


    async function cargarTablaHorarios() {
        tbody.innerHTML = '<tr><td colspan="6" class="celda-estado">Cargando horarios de atención...</td></tr>';

        try {
            const controller = new AbortController();
            const timeoutId  = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(API_HORARIOS, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`El servidor respondió con estado ${response.status}`);
            }

            const horarios = await response.json();

            if (!horarios || horarios.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="celda-estado">No hay horarios asignados actualmente.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            horarios.forEach(h => {
                const doctorNombre = h.doctor
                    ? `${h.doctor.apellidos ?? ''}, ${h.doctor.nombres ?? ''}`.trim()
                    : 'No asignado';

                const especialidad = h.doctor?.especialidad?.nombre ?? 'Sin asignar';

                const inicioFormateado = typeof h.horaInicio === 'string'
                    ? h.horaInicio.substring(0, 5)
                    : (h.horaInicio ?? '-');

                const finFormateado = typeof h.horaFin === 'string'
                    ? h.horaFin.substring(0, 5)
                    : (h.horaFin ?? '-');

                const diaTexto = h.diaSemana ?? 'No definido';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight:bold; color:var(--azul-institucional);">${doctorNombre}</td>
                    <td><span class="badge-especialidad">${especialidad}</span></td>
                    <td style="text-transform: uppercase;">${diaTexto}</td>
                    <td>${inicioFormateado}</td>
                    <td>${finFormateado}</td>
                    <td>
                        <button class="boton-eliminar btn-borrar-horario" data-id="${h.idHorario}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.querySelectorAll('.btn-borrar-horario').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idHorario = e.currentTarget.getAttribute('data-id');
                    eliminarHorario(idHorario);
                });
            });

        } catch (err) {
            console.error('Error al cargar horarios:', err);

            let mensajeUsuario = 'Error al cargar los horarios.';
            if (err.name === 'AbortError') {
                mensajeUsuario = 'El servidor tardó demasiado en responder (timeout). Verifique que Spring Boot esté corriendo en el puerto 8087.';
            } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                mensajeUsuario = 'No se pudo conectar al servidor. Verifique que el backend esté activo en http://localhost:8087.';
            } else {
                mensajeUsuario = `Error: ${err.message}`;
            }

            tbody.innerHTML = `<tr><td colspan="6" class="celda-estado" style="color:red;">${mensajeUsuario}</td></tr>`;
        }
    }

    async function cargarDoctoresEnSelector() {
        selectDoctorHorario.innerHTML = '<option value="" disabled selected>Cargando médicos activos...</option>';
        selectDoctorHorario.disabled = true;

        try {
            const controller = new AbortController();
            const timeoutId  = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(API_DOCTORES, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Estado ${response.status}`);

            const doctores = await response.json();

            selectDoctorHorario.innerHTML = '<option value="" disabled selected>Seleccione el médico...</option>';

            if (!doctores || doctores.length === 0) {
                selectDoctorHorario.innerHTML = '<option value="" disabled selected>No hay médicos activos</option>';
                return;
            }

            doctores.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.idDoctor;
                const nombreEsp = doc.especialidad?.nombre ?? 'Sin especialidad';
                option.textContent = `${doc.apellidos}, ${doc.nombres} (${nombreEsp})`;
                selectDoctorHorario.appendChild(option);
            });

        } catch (err) {
            console.error('Error al cargar doctores:', err);
            selectDoctorHorario.innerHTML = '<option value="" disabled selected>Error al cargar médicos</option>';
        } finally {
            selectDoctorHorario.disabled = false;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const idDoctor  = selectDoctorHorario.value;
        const turno     = selectTurnoHorario.value;

        const checkboxesDias = document.querySelectorAll('input[name="diasSemana"]:checked');
        const diasSeleccionados = Array.from(checkboxesDias).map(cb => cb.value);

        if (!idDoctor || diasSeleccionados.length === 0 || !turno) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor seleccione el médico, al menos un día y el turno laboral.',
                confirmButtonColor: '#004a99'
            });
            return;
        }

        const [horaInicio, horaFin] = turno.split('-');

        const horarioPayload = {
            idDoctor:   parseInt(idDoctor),
            diasSemana: diasSeleccionados,
            horaInicio: `${horaInicio}:00`,
            horaFin:    `${horaFin}:00`
        };

        const btnGuardar = document.getElementById('btnGuardar');
        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.textContent = 'Guardando...';
        }

        try {
            const response = await fetch(API_HORARIOS, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(horarioPayload)
            });

            if (response.ok) {
                ocultarFormulario();
                document.querySelectorAll('input[name="diasSemana"]').forEach(cb => cb.checked = false);

                await cargarTablaHorarios();
                Swal.fire({
                    icon:               'success',
                    title:              '¡Turnos Asignados!',
                    text:               'Los horarios médicos se registraron con éxito.',
                    confirmButtonColor: '#004a99'
                });
            } else {
                try {
                    const errorObj = await response.json();

                    Swal.fire({
                        icon:               'error',
                        title:              'Conflicto de Horario',
                        text:               errorObj.mensaje || 'El doctor ya tiene un turno asignado en alguno de los días elegidos.',
                        confirmButtonColor: '#004a99'
                    });
                } catch (jsonErr) {
                    const textoError = await response.text();
                    Swal.fire({
                        icon:               'error',
                        title:              'No se pudo guardar',
                        text:               textoError || 'Hubo un conflicto con los turnos seleccionados.',
                        confirmButtonColor: '#004a99'
                    });
                }
            }
        } catch (err) {
            console.error('Error al guardar horario:', err);
            Swal.fire({
                icon:               'error',
                title:              'Fallo de Red',
                text:               'No hay respuesta del backend de Spring Boot.',
                confirmButtonColor: '#004a99'
            });
        } finally {
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.textContent = 'Guardar Horario';
            }
        }
    });

    async function eliminarHorario(id) {
        const result = await Swal.fire({
            title:              '¿Eliminar este horario?',
            text:               'El doctor ya no tendrá bloques disponibles para citas en este día.',
            icon:               'warning',
            showCancelButton:   true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor:  '#666',
            confirmButtonText:  'Sí, eliminar',
            cancelButtonText:   'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_HORARIOS}/${id}`, { method: 'DELETE' });

            if (response.ok || response.status === 204) {
                await cargarTablaHorarios();
                Swal.fire({
                    icon:               'success',
                    title:              'Eliminado',
                    text:               'El horario fue removido permanentemente.',
                    confirmButtonColor: '#004a99'
                });
            } else {
                throw new Error(`Estado ${response.status}`);
            }
        } catch (err) {
            console.error('Error al eliminar horario:', err);
            Swal.fire({
                icon:               'error',
                title:              'Error de Red',
                text:               'No se pudo procesar la eliminación.',
                confirmButtonColor: '#004a99'
            });
        }
    }

    cargarTablaHorarios();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tablaHorariosBody')) {
        iniciarModuloHorarios();
    }
});

//citas.html

function iniciarModuloCitas() {
    const tablaEspBody = document.getElementById('tabla-especialidades-body');
    if (!tablaEspBody) return;

    const paciente = JSON.parse(sessionStorage.getItem('paciente'));
    if (!paciente) {
        window.location.href = '/index.html';
        return;
    }

    let idEspecialidadSel = null;
    let idDoctorSel       = null;
    let idHorarioSel      = null;
    let nombreEspSel      = '';
    let nombreDocSel      = '';
    let diaSel            = '';
    let horaSel           = '';

    window.volverPaso = function(numeroPaso) {
        [1, 2, 3].forEach(n => {
            document.getElementById(`paso${n}`).classList.add('oculto');
            document.getElementById(`ind-paso${n}`).classList.remove('activo');
        });
        document.getElementById(`paso${numeroPaso}`).classList.remove('oculto');
        document.getElementById(`ind-paso${numeroPaso}`).classList.add('activo');
    };

    function irAPaso(numeroPaso) {
        window.volverPaso(numeroPaso);
    }

    // Cargar especialidades activas para la cita
    async function cargarEspecialidadesCitas() {
        tablaEspBody.innerHTML = '<tr><td colspan="4" class="celda-estado">Cargando especialidades...</td></tr>';
        try {
            const res = await fetch(`${API}/api/especialidades/activas`);
            if (!res.ok) throw new Error();
            const lista = await res.json();

            if (lista.length === 0) {
                tablaEspBody.innerHTML = '<tr><td colspan="4" class="celda-estado">No hay especialidades disponibles.</td></tr>';
                return;
            }

            tablaEspBody.innerHTML = lista.map((esp, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${esp.nombre}</strong></td>
                    <td>${esp.descripcion ?? '<span style="color:#aaa;">—</span>'}</td>
                    <td>
                        <button class="boton-editar"
                            onclick="seleccionarEspecialidad(${esp.idEspecialidad}, '${esp.nombre.replace(/'/g, "\\'")}')">
                            Seleccionar →
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch {
            tablaEspBody.innerHTML = '<tr><td colspan="4" class="celda-estado" style="color:red;">Error al cargar especialidades.</td></tr>';
        }
    }

    // Seleccionar la especialidad y listar doctores de esa rama
    window.seleccionarEspecialidad = async function(idEsp, nombreEsp) {
        idEspecialidadSel = idEsp;
        nombreEspSel      = nombreEsp;

        document.getElementById('nombre-especialidad-sel').textContent = nombreEsp;
        const tablaDocBody = document.getElementById('tabla-doctores-body');
        tablaDocBody.innerHTML = '<tr><td colspan="5" class="celda-estado">Cargando doctores...</td></tr>';

        irAPaso(2);

        try {
            const res = await fetch(`${API}/api/doctores/activos`);
            if (!res.ok) throw new Error();
            const todos = await res.json();

            const filtrados = todos.filter(d =>
                d.especialidad && d.especialidad.idEspecialidad === idEsp
            );

            if (filtrados.length === 0) {
                tablaDocBody.innerHTML = '<tr><td colspan="5" class="celda-estado">No hay doctores disponibles para esta especialidad.</td></tr>';
                return;
            }

            tablaDocBody.innerHTML = filtrados.map((doc, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${doc.apellidos}, ${doc.nombres}</strong></td>
                    <td>${doc.dni}</td>
                    <td>${doc.telefono ?? '<span style="color:#aaa;">—</span>'}</td>
                    <td>
                        <button class="boton-editar"
                            onclick="seleccionarDoctor(${doc.idDoctor}, '${doc.nombres.replace(/'/g, "\\'")} ${doc.apellidos.replace(/'/g, "\\'")}')">
                            Seleccionar →
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch {
            tablaDocBody.innerHTML = '<tr><td colspan="5" class="celda-estado" style="color:red;">Error al cargar doctores.</td></tr>';
        }
    };

    // Seleccionar doctor y jalar sus turnos disponibles
    window.seleccionarDoctor = async function(idDoc, nombreDoc) {
        idDoctorSel  = idDoc;
        nombreDocSel = nombreDoc;

        document.getElementById('nombre-doctor-sel').textContent = nombreDoc;
        const tablaHorBody = document.getElementById('tabla-horarios-body');
        tablaHorBody.innerHTML = '<tr><td colspan="4" class="celda-estado">Cargando horarios...</td></tr>';

        irAPaso(3);

        try {
            const res = await fetch(`${API}/api/horarios/doctor/${idDoc}`);
            if (!res.ok) throw new Error();
            const horarios = await res.json();

            if (horarios.length === 0) {
                tablaHorBody.innerHTML = '<tr><td colspan="4" class="celda-estado">Este doctor no tiene horarios disponibles.</td></tr>';
                return;
            }

            tablaHorBody.innerHTML = horarios.map(h => `
                <tr>
                    <td><strong>${h.diaSemana}</strong></td>
                    <td>${h.horaInicio}</td>
                    <td>${h.horaFin}</td>
                    <td>
                        <button class="boton-editar"
                            onclick="abrirModalConfirmar(${h.idHorario}, '${h.diaSemana}', '${h.horaInicio}', '${h.horaFin}')">
                            Reservar →
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch {
            tablaHorBody.innerHTML = '<tr><td colspan="4" class="celda-estado" style="color:red;">Error al cargar horarios.</td></tr>';
        }
    };

    // Desplegar bloques de tiempo de 30 minutos al pulsar Reservar
    window.abrirModalConfirmar = async function(idHorario, diaSemana, horaInicio, horaFin) {
        diaSel       = diaSemana;
        horaSel      = '';
        idHorarioSel = idHorario;

        document.getElementById('res-especialidad').textContent = nombreEspSel;
        document.getElementById('res-doctor').textContent       = nombreDocSel;
        document.getElementById('res-dia').textContent          = diaSemana;
        document.getElementById('res-horario').textContent      = `${horaInicio} - ${horaFin}`;
        document.getElementById('input-motivo').value           = '';

        // Calcular fecha más próxima que coincida con el día
        // Calcular fecha más próxima que coincida con el día
        const diasMap = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
        const hoy = new Date();
        let fechaStr = '';

        const normalizar = str => str.toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

        for (let i = 0; i <= 13; i++) {
            const candidata    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
            const diaCandidato = diasMap[candidata.getDay()];

            if (normalizar(diaCandidato) === normalizar(diaSemana)) {
                const y = candidata.getFullYear();
                const m = String(candidata.getMonth() + 1).padStart(2, '0');
                const d = String(candidata.getDate()).padStart(2, '0');
                fechaStr = `${y}-${m}-${d}`;
                break;
            }
        }

        fechaSel = fechaStr;
        console.log('Día:', diaSemana, '→ Fecha:', fechaStr);

        fechaSel = fechaStr;
        console.log('Día buscado:', diaSemana, '| Fecha calculada:', fechaStr);

// Obtener horas ocupadas del backend
        let horasOcupadas = [];
        if (fechaStr) {
            try {
                const res = await fetch(`${API}/api/citas/ocupadas?idDoctor=${idDoctorSel}&fecha=${fechaStr}`);
                if (res.ok) {
                    const data = await res.json();
                    horasOcupadas = Array.isArray(data) ? data : [];
                }
                console.log('Horas ocupadas:', horasOcupadas);
            } catch (e) {
                console.error('Error al obtener horas ocupadas:', e);
            }
        }

        // Generar slots de 30 min
        const slotsDiv = document.getElementById('slots-horario');
        slotsDiv.innerHTML = '';

        const [h1, m1] = horaInicio.split(':').map(Number);
        const [h2, m2] = horaFin.split(':').map(Number);
        const inicio   = h1 * 60 + m1;
        const fin      = h2 * 60 + m2;

        const toAmPm = t => {
            const [hh, mm] = t.split(':').map(Number);
            const ampm = hh >= 12 ? 'pm' : 'am';
            const h12  = hh % 12 || 12;
            return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
        };

        for (let min = inicio; min < fin; min += 30) {
            const hh      = String(Math.floor(min / 60)).padStart(2, '0');
            const mm      = String(min % 60).padStart(2, '0');
            const slot    = `${hh}:${mm}`;
            const minFin  = min + 30;
            const hhFin   = String(Math.floor(minFin / 60)).padStart(2, '0');
            const mmFin   = String(minFin % 60).padStart(2, '0');
            const slotFin = `${hhFin}:${mmFin}`;

            const ocupado = horasOcupadas.includes(slot);
            console.log(`Slot ${slot} ocupado:`, ocupado); // para debug

            const btn = document.createElement('button');
            btn.type        = 'button';
            btn.textContent = `${toAmPm(slot)} - ${toAmPm(slotFin)}`;

            if (ocupado) {
                btn.disabled      = true;
                btn.style.cssText = 'padding:6px 14px; border:2px solid #dc2626; border-radius:20px; background:#fee2e2; color:#dc2626; cursor:not-allowed; font-weight:600; text-decoration:line-through;';
            } else {
                btn.style.cssText = 'padding:6px 14px; border:2px solid #004a99; border-radius:20px; background:#fff; color:#004a99; cursor:pointer; font-weight:600; transition: all 0.2s;';
                btn.onclick = () => {
                    document.querySelectorAll('#slots-horario button').forEach(b => {
                        if (!b.disabled) {
                            b.style.background = '#fff';
                            b.style.color      = '#004a99';
                        }
                    });
                    btn.style.background = '#004a99';
                    btn.style.color      = '#fff';
                    horaSel = slot;
                };
            }
            slotsDiv.appendChild(btn);
        }

        toggleModal('modal-confirmar-cita');
    };

    window.confirmarYPagar = async function() {
        const motivo = document.getElementById('input-motivo').value.trim();
        const fecha = fechaSel;

        if (!horaSel) {
            Swal.fire({ icon: 'warning', title: 'Hora requerida', text: 'Por favor elige tu hora de atención.', confirmButtonColor: '#004a99' });
            return;
        }

        const payload = {
            paciente:  { idPaciente: paciente.idPaciente },
            doctor:    { idDoctor: idDoctorSel },
            fechaCita: fecha,
            horaCita:  horaSel,
            motivo:    motivo || null,
            estado:    'PENDIENTE'
        };

        try {
            const res = await fetch(`${API}/api/citas`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });

            if (res.ok) {
                const citaCreada = await res.json();
                toggleModal('modal-confirmar-cita');

                sessionStorage.setItem('citaPendiente', JSON.stringify({
                    idCita:         citaCreada.idCita,
                    idEspecialidad: idEspecialidadSel,
                    especialidad:   nombreEspSel,
                    doctor:         nombreDocSel,
                    dia:            diaSel,
                    horario:        horaSel,
                    fecha:          fecha,
                    motivo:         motivo || '—'
                }));

                window.location.href = '/pago.html';

            } else {
                const err = await res.json().catch(() => ({}));
                Swal.fire({ icon: 'error', title: 'Error al registrar cita', text: err.mensaje || 'No se pudo guardar la cita.', confirmButtonColor: '#004a99' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.', confirmButtonColor: '#004a99' });
        }
    };

    cargarEspecialidadesCitas();
}
async function iniciarModuloPago() {
    const contenedor = document.getElementById('pago-especialidad');
    if (!contenedor) return;

    const cita = JSON.parse(sessionStorage.getItem('citaPendiente'));

    if (!cita) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin datos de cita',
            text: 'No se encontró ninguna cita pendiente. Serás redirigido.',
            confirmButtonColor: '#004a99'
        }).then(() => {
            window.location.href = '/citas.html';
        });
        return;
    }

    document.getElementById('pago-especialidad').textContent = cita.especialidad ?? '—';
    document.getElementById('pago-doctor').textContent       = cita.doctor       ?? '—';
    document.getElementById('pago-fecha').textContent        = cita.fecha        ?? '—';
    document.getElementById('pago-hora').textContent         = cita.horario      ?? '—';

    let montoTotal = 30.00;
    try {
        const res = await fetch(`${API}/api/precios/especialidad/${cita.idEspecialidad}`);
        if (res.ok) {
            const precioBD = await res.json();
            montoTotal = precioBD.monto;
        }
    } catch (e) {
        console.error("Error obteniendo precio de la BD", e);
    }

    cita.monto = montoTotal;
    sessionStorage.setItem('citaPendiente', JSON.stringify(cita));
    document.querySelector('.fila-resumen.total strong:last-child').textContent = `S/ ${montoTotal.toFixed(2)}`;

    // Temporizador
    let tiempo = 60;
    const spanTiempo = document.getElementById('tiempo-restante');

    window.intervaloPago = setInterval(() => {
        tiempo--;
        let min = Math.floor(tiempo / 60);
        let sec = tiempo % 60;

        if(spanTiempo) {
            spanTiempo.textContent = `0${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        if (tiempo <= 0) {
            clearInterval(window.intervaloPago);

            // Borrar activamente la cita desde el frontend al acabarse el tiempo
            fetch(`${API}/api/citas/${cita.idCita}`, { method: 'DELETE' }).catch(console.error);
            sessionStorage.removeItem('citaPendiente');

            Swal.fire({
                icon: 'error',
                title: 'Tiempo agotado',
                text: 'El tiempo para realizar el pago ha expirado. La reserva ha sido cancelada y el horario liberado.',
                confirmButtonColor: '#004a99'
            }).then(() => {
                window.location.href = '/citas.html';
            });
        }
    }, 1000);
}

window.seleccionarMetodo = function(el, metodo) {
    document.querySelectorAll('.tarjeta-metodo').forEach(t => t.classList.remove('seleccionado'));
    el.classList.add('seleccionado');
    document.getElementById('metodo-seleccionado').value = metodo;
};

window.procesarPago = async function() {
    const metodo = document.getElementById('metodo-seleccionado').value;

    if (!metodo) {
        Swal.fire({
            icon: 'warning',
            title: 'Método requerido',
            text: 'Por favor selecciona un método de pago.',
            confirmButtonColor: '#004a99'
        });
        return;
    }

    const cita = JSON.parse(sessionStorage.getItem('citaPendiente'));
    if (!cita) {
        window.location.href = '/citas.html';
        return;
    }

    // Usamos el monto que extrajimos de la BD en iniciarModuloPago()
    const monto = cita.monto || 30.00;

    const payload = {
        cita:       { idCita: cita.idCita },
        metodoPago: metodo,
        monto:      monto,
        estadoPago: 'COMPLETADO'
    };

    try {
        const res = await fetch(`${API}/api/pagos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });

        if (res.ok) {
            // Limpiamos todo si el pago fue exitoso
            if (window.intervaloPago) clearInterval(window.intervaloPago);
            sessionStorage.removeItem('citaPendiente');

            Swal.fire({
                icon:             'success',
                title:            '¡Pago Confirmado!',
                html:             `
                    <p><strong>Especialidad:</strong> ${cita.especialidad}</p>
                    <p><strong>Doctor:</strong> ${cita.doctor}</p>
                    <p><strong>Fecha:</strong> ${cita.fecha}</p>
                    <p><strong>Hora:</strong> ${cita.horario}</p>
                    <p style="margin-top:10px; color:#004a99; font-weight:700;">Método: ${metodo} — S/ ${monto.toFixed(2)}</p>
                `,
                confirmButtonText:  'Ver mis citas',
                confirmButtonColor: '#004a99'
            }).then(() => {
                window.location.href = '/miscitas.html';
            });
        } else {
            const err = await res.json().catch(() => ({}));
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar pago',
                text: err.mensaje || 'No se pudo registrar el pago.',
                confirmButtonColor: '#004a99'
            });
        }
    } catch {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor.',
            confirmButtonColor: '#004a99'
        });
    }
};

// ==========================================
// MIS CITAS
// ==========================================

function iniciarModuloMisCitas() {

    const contenedor = document.getElementById('contenedor-mis-citas');

    if (!contenedor) return;

    const paciente = JSON.parse(sessionStorage.getItem('paciente'));

    if (!paciente) {
        window.location.href = '/index.html';
        return;
    }

    cargarMisCitas();

    async function cargarMisCitas() {

        contenedor.innerHTML = `
            <div class="sin-citas">
                Cargando citas médicas...
            </div>
        `;

        try {

            const response = await fetch(`${API}/api/citas/paciente/${paciente.idPaciente}`);

            if (!response.ok) {
                throw new Error();
            }

            const citas = await response.json();

            if (citas.length === 0) {

                contenedor.innerHTML = `
                    <div class="sin-citas">
                        No tienes citas registradas actualmente.
                    </div>
                `;

                return;
            }

            contenedor.innerHTML = '';

            citas.forEach(cita => {

                contenedor.innerHTML += `

                    <div class="tarjeta-cita">

                        <div class="encabezado-cita">

                            <h2 class="nombre-doctor">
                                Dr. ${cita.doctor.nombres} ${cita.doctor.apellidos}
                            </h2>

                            <div class="estado-cita ${cita.estado.toLowerCase()}">
                                ${cita.estado}
                            </div>

                        </div>

                        <div class="detalle-cita">
                            <span>Especialidad:</span>
                            ${cita.doctor.especialidad.nombre}
                        </div>

                        <div class="detalle-cita">
                            <span>Fecha:</span>
                            ${cita.fechaCita}
                        </div>

                        <div class="detalle-cita">
                            <span>Horario:</span>
                            ${cita.horaCita}
                        </div>

                        <div class="detalle-cita">
                            <span>Motivo:</span>
                            ${cita.motivo ?? 'No especificado'}
                        </div>
                        
                        ${cita.estado === 'CONFIRMADA' ? `
                            <button class="boton-imprimir" onclick="descargarReporte('${API}/api/reportes/citas/${cita.idCita}/pdf')">
                                 Imprimir Comprobante
                            </button>
                        ` : ''}

${cita.estado !== 'CANCELADA' ? `
    <button class="boton-cancelar"
        onclick="cancelarCita(${cita.idCita})">
        Cancelar cita
    </button>
` : '<p style="color:#dc2626; font-weight:700; text-align:center; margin-top:10px;">Cita cancelada</p>'}

                    </div>

                `;

            });

        } catch (err) {

            contenedor.innerHTML = `
                <div class="sin-citas" style="color:red;">
                    Error al cargar las citas.
                </div>
            `;

        }

    }

    window.cancelarCita = async function (idCita) {

        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Cancelar cita?',
            text: 'La cita será cancelada del sistema.',
            showCancelButton: true,
            confirmButtonColor: '#004a99',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        });

        if (!result.isConfirmed) return;

        try {

            const response = await fetch(`${API}/api/citas/${idCita}`, {
                method: 'DELETE'
            });

            if (response.ok) {

                Swal.fire({
                    icon: 'success',
                    title: 'Cita cancelada',
                    confirmButtonColor: '#004a99'
                });

                cargarMisCitas();

            } else {

                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo cancelar',
                    confirmButtonColor: '#004a99'
                });

            }

        } catch {

            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                confirmButtonColor: '#004a99'
            });

        }

    };
}

window.volverDesdePago = function() {
    Swal.fire({
        title: '¿Seguro que desea salir?',
        text: 'La cita no se procesará y se liberará el horario para otros pacientes.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#666',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'No, completar pago'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const cita = JSON.parse(sessionStorage.getItem('citaPendiente'));
            if (cita && cita.idCita) {
                try {
                    await fetch(`${API}/api/citas/${cita.idCita}`, { method: 'DELETE' });
                } catch (e) {
                    console.error("Error al cancelar la reserva de la cita:", e);
                }
                sessionStorage.removeItem('citaPendiente');
            }
            if (window.intervaloPago) clearInterval(window.intervaloPago);
            window.location.href = '/citas.html';
        }
    });
};

const especialidades = {

    cardiología: {
        titulo: "Cardiología",
        descripcion: "Especialidad médica encargada del diagnóstico y tratamiento de enfermedades del corazón y del sistema cardiovascular.",
        enfermedades: [
            "Hipertensión arterial",
            "Arritmias",
            "Insuficiencia cardíaca",
            "Infarto de miocardio"
        ],
        acudir: "Cuando presente dolor en el pecho, presión arterial elevada, palpitaciones frecuentes o antecedentes de enfermedades cardíacas."
    },

    pediatría: {
        titulo: "Pediatría",
        descripcion: "Especialidad dedicada a la atención médica integral de niños y adolescentes.",
        enfermedades: [
            "Infecciones respiratorias",
            "Fiebre",
            "Problemas de crecimiento",
            "Alergias infantiles"
        ],
        acudir: "Cuando un niño presente síntomas persistentes, controles de crecimiento o vacunación."
    },

    traumatología: {
        titulo: "Traumatología",
        descripcion: "Especialidad enfocada en lesiones y enfermedades del sistema musculoesquelético.",
        enfermedades: [
            "Fracturas",
            "Esguinces",
            "Luxaciones",
            "Dolor articular"
        ],
        acudir: "Después de caídas, golpes o cuando exista dolor persistente en huesos, músculos o articulaciones."
    },

    dermatología: {
        titulo: "Dermatología",
        descripcion: "Especialidad encargada del diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas.",
        enfermedades: [
            "Acné",
            "Dermatitis",
            "Psoriasis",
            "Hongos en la piel"
        ],
        acudir: "Cuando aparezcan manchas, irritaciones, alergias o cambios visibles en la piel."
    },

    neurología: {
        titulo: "Neurología",
        descripcion: "Especialidad médica enfocada en el estudio, diagnostico y tratamiento de enfermedades del sistema nervioso (cerebro y médula espinal).",
        enfermedades: [
            "Migraña",
            "Epilepsia",
            "Parkinson",
            "Accidente cerebrovascular"
        ],
        acudir: "Ante dolores de cabeza frecuentes, mareos, convulsiones o problemas de memoria."
    }

};

function mostrarEspecialidad(nombre) {

    const esp = especialidades[nombre];

    document.getElementById("tituloEspecialidad").innerText = esp.titulo;

    document.getElementById("descripcionEspecialidad").innerText =
        esp.descripcion;

    document.getElementById("cuandoAcudir").innerText =
        esp.acudir;

    let lista =
        document.getElementById("enfermedadesEspecialidad");

    lista.innerHTML = "";

    esp.enfermedades.forEach(enfermedad => {

        let li = document.createElement("li");

        li.textContent = enfermedad;

        lista.appendChild(li);

    });

    document.getElementById("modalEspecialidad")
        .style.display = "flex";
}

function cerrarModal() {

    document.getElementById("modalEspecialidad")
        .style.display = "none";

}

window.descargarReporteDoctores = function() {
    descargarReporte(API+ '/api/reportes/doctores/pdf');
};

window.descargarReporte = function(url) {
    window.open(url, '_blank');
};
window.descargarReporteEspecialidades = function() {
    window.open(API + '/api/reportes/especialidades/pdf', '_blank');
};

window.buscarEstadisticas = async function() {
    const tbody          = document.getElementById('tablaEstadisticasBody');
    const idEspecialidad = document.getElementById('filtroEspecialidad').value;
    const estado         = document.getElementById('filtroEstado').value;

    tbody.innerHTML = '<tr><td colspan="4" class="celda-estado">Cargando...</td></tr>';

    let url = `${API}/api/reportes/estadisticas/doctores-citas?`;
    if (idEspecialidad) url += `idEspecialidad=${idEspecialidad}&`;
    if (estado)         url += `estado=${estado}`;

    try {
        const res  = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="celda-estado">No se encontraron resultados.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((item, i) => `
            <tr>
                <td style="text-align:center; font-weight:bold; color:var(--azul-institucional);">${i + 1}</td>
                <td>${item.apellidos}, ${item.nombres}</td>
                <td><span class="badge-especialidad">${item.especialidad}</span></td>
                <td style="text-align:center; font-weight:bold;">${item.totalCitas}</td>
                <td style="text-align:center; font-weight:bold;">S/ ${parseFloat(item.ingresos).toFixed(2)}</td>
            </tr>
        `).join('');

    } catch {
        tbody.innerHTML = '<tr><td colspan="4" class="celda-estado" style="color:red;">Error al cargar estadísticas.</td></tr>';
    }
};

window.limpiarFiltros = function() {
    document.getElementById('filtroEspecialidad').selectedIndex = 0;
    document.getElementById('filtroEstado').selectedIndex       = 0;
    document.getElementById('tablaEstadisticasBody').innerHTML  =
        '<tr><td colspan="4" class="celda-estado">Aplica los filtros y haz clic en Buscar.</td></tr>';
};

function iniciarModuloEstadisticas() {
    const tbody = document.getElementById('tablaEstadisticasBody');
    if (!tbody) return;

    const paciente = JSON.parse(sessionStorage.getItem('paciente'));
    if (!paciente || paciente.rol !== 'ADMIN') {
        window.location.href = '/index.html';
        return;
    }

    async function cargarFiltroEspecialidades() {
        try {
            const res    = await fetch(`${API}/api/especialidades/activas`);
            const lista  = await res.json();
            const select = document.getElementById('filtroEspecialidad');
            select.innerHTML = '<option value="">Todas las especialidades</option>';
            lista.forEach(esp => {
                const opt       = document.createElement('option');
                opt.value       = esp.idEspecialidad;
                opt.textContent = esp.nombre;
                select.appendChild(opt);
            });
        } catch(e) {
            console.error('Error cargando especialidades:', e);
        }
    }

    document.getElementById('btnBuscarEstadisticas')
        .addEventListener('click', window.buscarEstadisticas);

    cargarFiltroEspecialidades();
}