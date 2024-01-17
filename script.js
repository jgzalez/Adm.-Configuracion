document.addEventListener("DOMContentLoaded", () => {
    const archivoList = document.getElementById("archivoList");
    const createForm = document.getElementById("createForm");
    const editForm = document.getElementById("editForm");
    const deleteForm = document.getElementById("deleteForm");
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const closeEditModalBtn = document.getElementById("closeEditModal");
    const closeDeleteModalBtn = document.getElementById("closeDeleteModal");
    const showCreateFormButton = document.getElementById("showCreateForm");
    const createModal = document.getElementById("createForm");
    const closeCreateModalBtn = document.getElementById("closeCreateForm");

    showCreateFormButton.addEventListener("click", () => {
        createModal.style.display = "block";
    });

    closeCreateModalBtn.addEventListener("click", () => {
        createModal.style.display = "none";
    });

    let currentEditId = null;
    let currentDeleteId = null;


    closeEditModalBtn.addEventListener("click", () => {
        editModal.style.display = "none";
        currentEditId = null;
    });

    closeDeleteModalBtn.addEventListener("click", () => {
        deleteModal.style.display = "none";
        currentDeleteId = null;
    });

    const loadArchivos = () => {
        fetch("http://localhost:3000/archivo")
            .then((response) => response.json())
            .then((result) => {
                if (result && Array.isArray(result.data)) {
                    archivoList.innerHTML = "";
                    result.data.forEach((archivo) => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${archivo.id}</td>
                            <td>${archivo.nombre}</td>
                            <td>${archivo.contenido}</td>
                            <td>${archivo.fecha_creacion}</td>
                            <td>
                                <button class="editar" data-id="${archivo.id}">Editar</button>
                                <button class="eliminar" data-id="${archivo.id}">Eliminar</button>
                            </td>
                        `;
                        archivoList.appendChild(row);

                        const editarButton = row.querySelector(".editar");
                        editarButton.addEventListener("click", () => {
                            currentEditId = archivo.id;
                            fetch(`http://localhost:3000/archivo/${currentEditId}`)
                                .then((response) => response.json())
                                .then((data) => {
                                    if (data) {
                                        document.getElementById("editNombre").value = data.nombre;
                                        document.getElementById("editContenido").value = data.contenido;
                                        document.getElementById("editFechaCreacion").value = data.fecha_creacion;
                                        editModal.style.display = "block";
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error al cargar los datos del archivo para editar:", error);
                                });
                        });

                        const eliminarButton = row.querySelector(".eliminar");
                        eliminarButton.addEventListener("click", () => {
                            currentDeleteId = archivo.id;
                            deleteModal.style.display = "block";
                        });
                    });
                } else {
                    console.error("Formato de respuesta inesperado:", result);
                }
            })
            .catch((error) => {
                console.error("Error al obtener la lista de archivos:", error);
            });
    };


    const deleteArchivo = (id) => {
        fetch(`http://localhost:3000/archivo/${id}`, {
                method: "DELETE",
            })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                deleteModal.style.display = "none";
                loadArchivos();
            });
    };

    createForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value;
        const contenido = document.getElementById("contenido").value;
        const fecha_creacion = document.getElementById("fecha_creacion").value;

        fetch("http://localhost:3000/archivo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nombre, contenido, fecha_creacion }),
            })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                createForm.style.display = "none";
                loadArchivos();
            })
            .catch((error) => {
                console.error("Error al crear archivo:", error);
            });
    });

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const editNombre = document.getElementById("editNombre").value;
        const editContenido = document.getElementById("editContenido").value;
        const editFechaCreacion = document.getElementById("editFechaCreacion").value;

        fetch(`http://localhost:3000/archivo/${currentEditId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: editNombre,
                    contenido: editContenido,
                    fecha_creacion: editFechaCreacion,
                }),
            })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                editModal.style.display = "none";
                loadArchivos();
            })
            .catch((error) => {
                console.error("Error al actualizar archivo:", error);
            });
    });

    deleteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        deleteArchivo(currentDeleteId);
    });

    loadArchivos();
});