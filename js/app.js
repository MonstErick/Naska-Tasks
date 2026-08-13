console.log("TaskFlow conectado correctamente");

//CLASE QUE REPRESENTA UNA TAREA

class Tarea {
  constructor(titulo, descripcion, fechaLimite, estado = "pendiente") {
    this.id = Date.now();
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.fechaCreacion= new Date();
    this.fechaLimite = fechaLimite;
    this.estado = estado;
    this.intervalo = null;
  }

  actualizarTitulo(nuevoTitulo) {
    this.titulo = nuevoTitulo;
  }

  actualizarDescripcion(nuevaDescripcion) {
    this.descripcion = nuevaDescripcion;
  }

  actualizarFechaLimite(nuevaFechaLimite) {
    this.fechaLimite = nuevaFechaLimite;
  }

  cambiarEstado() {
    this.estado =
    this.estado === "pendiente" ? "completada" : "pendiente";
  }
}

//CLASE QUE ADMINISTRA LAS TAREAS

class GestorTareas {
  constructor() {
    this.tareas = [];
  }

  agregarTarea(tarea) {
    this.tareas.push(tarea);
  }
  
  eliminarTarea(id) {
    this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
  }

  buscarTarea(id) {
    return this.tareas.find((tarea) => tarea.id === id);
  }

  editarTarea(id, titulo, descripcion, fechaLimite) {
    const tarea = this.buscarTarea(id);
      if (tarea) {
        tarea.actualizarTitulo(titulo);
        tarea.actualizarDescripcion(descripcion);
        tarea.actualizarFechaLimite(fechaLimite);
      }
  }

  cambiarEstadoTarea(id) {
    const tarea = this.buscarTarea(id);
      if (tarea) {
        tarea.cambiarEstado();
      }
  }
}

const gestorTareas = new GestorTareas();

//PERMANENCIA CON LOCALSTORAGE

function guardarTareas() {
  localStorage.setItem("tareas", JSON.stringify(gestorTareas.tareas));
}

function cargarTareas() {
  const tareasGuardadas = localStorage.getItem("tareas");
    if (tareasGuardadas) {
      const tareas = JSON.parse(tareasGuardadas);

// Se reconstruyen las tareas como instancias de Tarea para conservar sus métodos después de recuperarlas.

  gestorTareas.tareas = tareas.map((tarea) => {
    const nuevaTarea = new Tarea(
      tarea.titulo,
      tarea.descripcion,
      tarea.fechaLimite,
      tarea.estado
    );
  
  nuevaTarea.id = tarea.id;
  
  if (tarea.fechaCreacion) {
    nuevaTarea.fechaCreacion = new Date(tarea.fechaCreacion);
  }
    return nuevaTarea;
  });
  }
}

async function obtenerTareasAPI() {
  try {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/todos");
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
    
    const tareasAPI = await respuesta.json();
    console.log("Tareas obtenidas desde API:", tareasAPI);
  
  tareasAPI.slice(0, 5).forEach((tareaAPI) => {
    console.log("Tarea recuperada:", tareaAPI.title);
  });
  } catch (error) {
    console.log("Error al obtener tareas:", error);
  }
}

  async function guardarTareaAPI(tarea) {
    try {
      const respuesta = await fetch("https://jsonplaceholder.typicode.com/todos",
        { method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          title: tarea.titulo,
          completed: tarea.estado === "completada"
        })
        }
      );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesra.status}`);
    }
    
    const tareaGuardada = await respuesta.json();
    console.log("Tarea guardada en la API:", tareaGuardada);
    } catch (error) {
      console.error("Error al guardar la tarea en la API:", error);
    }
}

//CONFIGURACIÓN DE FORMULARIO

const formularioTarea = document.getElementById("formulario-tarea");

//EVENTOS KEYUP

const campoTitulo = document.getElementById("titulo");
const campoDescripcion = document.getElementById("descripcion");
const campoFechaLimite = document.getElementById("fecha-limite");

  campoTitulo.addEventListener("keyup", (evento) => {
    console.log("Título escrito:", evento.target.value);
  })

  campoDescripcion.addEventListener("keyup", (evento) => {
    console.log("Descripción escrita:", evento.target.value);
  })

  campoFechaLimite.addEventListener("keyup", (evento) => {
    console.log("Fecha Límite:", evento.target.value);
  })

// MOSTRAR TAREAS EN EL DOM

function mostrarTareas() {
  const listaTareas = document.getElementById("lista-tareas");

  listaTareas.innerHTML = "";

  if (gestorTareas.tareas.length === 0) {
    listaTareas.innerHTML =
    '<p id="mensaje-sin-tareas">Todavía no hay tareas.</p>';
    return;
  }

gestorTareas.tareas.forEach((tarea) => {
  const tarjetaTarea = document.createElement("article");
  
  tarjetaTarea.classList.add("tarea");

  tarjetaTarea.innerHTML = `
    <h3>${tarea.titulo}</h3>
    <p>${tarea.descripcion}</p>
    <p><strong>Fecha de Creación:</strong> ${tarea.fechaCreacion.toLocaleString()}</p>
    <p><strong>Fecha límite</strong> ${tarea.fechaLimite.split("-").reverse().join("-")}</p>
    <p><strong>Estado</strong> ${tarea.estado}</p>
    <p id="contador-${tarea.id}"><strong>Tiempo restante:</strong> Calculando... </p>
    
    <button class="btn-estado" data-id="${tarea.id}">Cambiar estado</button>
    <button class="btn-editar" data-id="${tarea.id}">Editar</button>

    <button class="btn-eliminar" data-id="${tarea.id}">Eliminar</button>
  `;

  listaTareas.appendChild(tarjetaTarea);

  iniciarContador(tarea);

  tarjetaTarea.addEventListener("mouseover", () => {
    console.log("MOUSEOVER", tarea.titulo);
  });
});
  
  configurarBotones();

//CONTADOR DE TIEMPO RESTANTE

function iniciarContador(tarea) {
  clearInterval(tarea.intervalo);

  const contador = document.getElementById(`contador-${tarea.id}`);
    if (tarea.estado === "completada") {
      contador.innerHTML = "<strong>¡Tarea completada!</strong>";
      return;
    }
  
  const fechaLimite = new Date(`${tarea.fechaLimite}T23:59:59`);

  function actualizarContador() {
    const ahora = new Date();
    const diferencia = fechaLimite - ahora;

      if (diferencia <= 0) {
        contador.innerHTML = "<strong>¡Tarea vencida!</strong>";
        clearInterval(tarea.intervalo);
      return;
      }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);
      contador.innerHTML = `<strong>Tiempo restante:</strong>
        ${dias} días, ${horas} horas, ${minutos} minutos y ${segundos} segundos`; 
    }

    actualizarContador();

    tarea.intervalo = setInterval(actualizarContador, 1000);
  }
}

//CONFIGURAR BOTONES

function configurarBotones() {
    const botonesEliminar = document.querySelectorAll(".btn-eliminar");

    botonesEliminar.forEach((boton) => {
      boton.addEventListener("click", (evento) => {
        const id = Number(evento.target.dataset.id);

        gestorTareas.eliminarTarea(id);
        
        guardarTareas();
        mostrarTareas();
      });
  });

  const botonesEstado = document.querySelectorAll(".btn-estado");
    
    botonesEstado.forEach((boton) => {
      boton.addEventListener("click", (evento) => {
        const id = Number(evento.target.dataset.id);

        gestorTareas.cambiarEstadoTarea(id);

        guardarTareas();
        mostrarTareas();
      });
    });

  const botonesEditar = document.querySelectorAll(".btn-editar");

    botonesEditar.forEach((boton) => {
      boton.addEventListener("click", (evento) => {
        const id = Number(evento.target.dataset.id);

        const tarea = gestorTareas.buscarTarea(id);

        if (tarea) {
          const nuevoTitulo = prompt("Nuevo título:", tarea.titulo);
          const nuevaDescripcion = prompt("Nueva descripción:", tarea.descripcion);
          const nuevaFechaLimite = prompt("Nueva fecha límite:", tarea.fechaLimite);
      
      gestorTareas.editarTarea(id, nuevoTitulo, nuevaDescripcion, nuevaFechaLimite);
      
      guardarTareas();
      mostrarTareas();
      }
    });
    });
}

function mostrarInformacionTarea(tarea){
  const { titulo, descripcion, estado } = tarea;

  console.log("Título:", titulo);
  console.log("Descripción:", descripcion);
  console.log("Estado:", estado);
  }

function mostrarDatos(...datos) {
  console.log(datos);
}

formularioTarea.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const fechaLimite = document.getElementById("fecha-limite").value;

  const nuevaTarea = new Tarea(
    titulo,
    descripcion,
    fechaLimite
  );

  gestorTareas.agregarTarea(nuevaTarea);

  guardarTareas();

  guardarTareaAPI(nuevaTarea);

  mostrarTareas();

  mostrarInformacionTarea(nuevaTarea);
  
  setTimeout(() => {
    console.log("Notificación: Tarea agregada correctamente.");
  }, 2000);

  mostrarDatos(nuevaTarea.titulo, nuevaTarea.descripcion, nuevaTarea.estado);

  const copiaTareas = [...gestorTareas.tareas];
  console.log(copiaTareas);

  formularioTarea.reset();

  console.log(gestorTareas.tareas);
});

obtenerTareasAPI();
cargarTareas();
mostrarTareas();
