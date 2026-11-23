document.addEventListener("DOMContentLoaded", function () {

    // ELEMENTOS PRINCIPALES
    const login = document.getElementById("login");
    const registro = document.getElementById("registro");
    const aplicacion = document.getElementById("aplicacion");

    const formLogin = document.getElementById("formLogin");
    const formRegistro = document.getElementById("formRegistro");

    // CUENTAS
    let usuarios = JSON.parse(localStorage.getItem("usuariosMyPigs")) || [];

    // CAMBIAR ENTRE LOGIN Y REGISTRO
    document.getElementById("mostrarRegistro").addEventListener("click", function (e) {
        e.preventDefault();
        login.classList.add("oculto");
        registro.classList.remove("oculto");
    });

    document.getElementById("mostrarLogin").addEventListener("click", function (e) {
        e.preventDefault();
        registro.classList.add("oculto");
        login.classList.remove("oculto");
    });

    // CREAR CUENTA
    formRegistro.addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("nombreRegistro").value.trim();
        const correo = document.getElementById("correoRegistro").value.trim().toLowerCase();
        const password = document.getElementById("passwordRegistro").value;

        if (!nombre || !correo || !password) {
            document.getElementById("mensajeRegistro").textContent = "Completa todos los campos.";
            return;
        }

        if (usuarios.some(usuario => usuario.correo === correo)) {
            document.getElementById("mensajeRegistro").textContent = "Este correo ya está registrado.";
            return;
        }

        usuarios.push({
            nombre: nombre,
            correo: correo,
            password: password
        });

        localStorage.setItem("usuariosMyPigs", JSON.stringify(usuarios));

        document.getElementById("mensajeRegistro").textContent = "¡Cuenta creada correctamente! Ahora puedes iniciar sesión.";

        formRegistro.reset();

        setTimeout(function () {
            registro.classList.add("oculto");
            login.classList.remove("oculto");
            document.getElementById("correoLogin").value = correo;
        }, 1200);
    });

    // INICIAR SESIÓN
    formLogin.addEventListener("submit", function (e) {
        e.preventDefault();

        const correo = document.getElementById("correoLogin").value.trim().toLowerCase();
        const password = document.getElementById("passwordLogin").value;

        const usuarioEncontrado = usuarios.find(function (usuario) {
            return usuario.correo === correo && usuario.password === password;
        });

        if (usuarioEncontrado) {
            localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));
            mostrarAplicacion(usuarioEncontrado);
            formLogin.reset();
        } else {
            document.getElementById("mensajeLogin").textContent = "Correo o contraseña incorrectos.";
        }
    });

    // MOSTRAR PANEL
    function mostrarAplicacion(usuario) {
        login.classList.add("oculto");
        registro.classList.add("oculto");
        aplicacion.classList.remove("oculto");

        document.querySelector(".contenido header h2").textContent =
            "Bienvenido, " + usuario.nombre;

        document.getElementById("datosPerfil").innerHTML =
            "<p><strong>Nombre:</strong> " + escaparHTML(usuario.nombre) + "</p>" +
            "<p><strong>Correo:</strong> " + escaparHTML(usuario.correo) + "</p>";
    }

    // RECUPERAR SESIÓN
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (usuarioActivo) {
        mostrarAplicacion(usuarioActivo);
    }

    // NAVEGACIÓN
    const enlaces = document.querySelectorAll(".sidebar nav a");

    enlaces.forEach(function (enlace) {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();

            const seccion = enlace.dataset.section;
            mostrarSeccion(seccion);

            enlaces.forEach(function (item) {
                item.classList.remove("activo");
            });

            enlace.classList.add("activo");
        });
    });

    function mostrarSeccion(nombre) {
        document.querySelectorAll(".modulo-contenido").forEach(function (modulo) {
            modulo.classList.remove("activo");
        });

        const moduloSeleccionado = document.getElementById(nombre);

        if (moduloSeleccionado) {
            moduloSeleccionado.classList.add("activo");
        }
    }

    // CERRAR SESIÓN
    document.getElementById("cerrarSesion").addEventListener("click", function () {
        localStorage.removeItem("usuarioActivo");
        aplicacion.classList.add("oculto");
        login.classList.remove("oculto");
        registro.classList.add("oculto");
        document.getElementById("mensajeLogin").textContent = "";
        mostrarSeccion("inicio");
    });

    // FUNCIÓN PARA GUARDAR Y MOSTRAR REGISTROS
    function configurarFormulario(formularioId, listaId, almacenamiento, campos) {
        const formulario = document.getElementById(formularioId);
        const lista = document.getElementById(listaId);

        let registros = JSON.parse(localStorage.getItem(almacenamiento)) || [];

        function mostrarRegistros() {
            lista.innerHTML = "";

            registros.forEach(function (registro, indice) {
                const tarjeta = document.createElement("div");
                tarjeta.className = "registro-card";

                let contenido = "<h3>Registro " + (indice + 1) + "</h3>";

                campos.forEach(function (campo) {
                    contenido += "<p><strong>" + campo.etiqueta + ":</strong> " +
                        escaparHTML(registro[campo.id]) + "</p>";
                });

                tarjeta.innerHTML = contenido;

                const boton = document.createElement("button");
                boton.textContent = "Eliminar";

                boton.addEventListener("click", function () {
                    if (confirm("¿Deseas eliminar este registro?")) {
                        registros.splice(indice, 1);
                        guardarRegistros();
                        mostrarRegistros();
                    }
                });

                tarjeta.appendChild(boton);
                lista.appendChild(tarjeta);
            });
        }

        function guardarRegistros() {
            localStorage.setItem(almacenamiento, JSON.stringify(registros));
        }

        formulario.addEventListener("submit", function (e) {
            e.preventDefault();

            const nuevoRegistro = {};

            campos.forEach(function (campo) {
                nuevoRegistro[campo.id] =
                    document.getElementById(campo.id).value.trim();
            });

            registros.push(nuevoRegistro);
            guardarRegistros();
            mostrarRegistros();
            formulario.reset();

            alert("Registro guardado correctamente.");
        });

        mostrarRegistros();
    }

    // REGISTRO DE CERDOS
    configurarFormulario(
        "formCerdos",
        "listaCerdos",
        "cerdosMyPigs",
        [
            { id: "idCerdo", etiqueta: "Identificación" },
            { id: "razaCerdo", etiqueta: "Raza" },
            { id: "fechaCerdo", etiqueta: "Nacimiento" },
            { id: "sexoCerdo", etiqueta: "Sexo" }
        ]
    );

    // REGISTRO DE CORRALES
    configurarFormulario(
        "formCorrales",
        "listaCorrales",
        "corralesMyPigs",
        [
            { id: "numeroCorral", etiqueta: "Número de corral" },
            { id: "capacidadCorral", etiqueta: "Capacidad" },
            { id: "ubicacionCorral", etiqueta: "Ubicación" }
        ]
    );

    // ALIMENTACIÓN
    configurarFormulario(
        "formAlimentacion",
        "listaAlimentacion",
        "alimentacionMyPigs",
        [
            { id: "tipoAlimento", etiqueta: "Alimento" },
            { id: "cantidadAlimento", etiqueta: "Cantidad" },
            { id: "fechaAlimento", etiqueta: "Fecha" }
        ]
    );

    // INVENTARIO
    configurarFormulario(
        "formInventario",
        "listaInventario",
        "inventarioMyPigs",
        [
            { id: "productoInventario", etiqueta: "Producto" },
            { id: "cantidadInventario", etiqueta: "Cantidad" }
        ]
    );

    // CONTROL DE PESO
    configurarFormulario(
        "formPeso",
        "listaPeso",
        "pesoMyPigs",
        [
            { id: "cerdoPeso", etiqueta: "Identificación del cerdo" },
            { id: "valorPeso", etiqueta: "Peso (kg)" },
            { id: "fechaPeso", etiqueta: "Fecha" }
        ]
    );

    // PROVEEDORES
    configurarFormulario(
        "formProveedores",
        "listaProveedores",
        "proveedoresMyPigs",
        [
            { id: "nombreProveedor", etiqueta: "Proveedor" },
            { id: "telefonoProveedor", etiqueta: "Teléfono" },
            { id: "servicioProveedor", etiqueta: "Producto o servicio" }
        ]
    );

    // VENTAS
    configurarFormulario(
        "formVentas",
        "listaVentas",
        "ventasMyPigs",
        [
            { id: "productoVenta", etiqueta: "Producto vendido" },
            { id: "cantidadVenta", etiqueta: "Cantidad" },
            { id: "valorVenta", etiqueta: "Valor total" }
        ]
    );

    // PROTEGER TEXTO MOSTRADO EN TARJETAS
    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, function (caracter) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[caracter];
        });
    }

});