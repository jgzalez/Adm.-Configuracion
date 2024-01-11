const sqlite3 = require('sqlite3').verbose();

// Crear una nueva base de datos o abrir una existente
let db = new sqlite3.Database('./mydb.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE archivo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre text, 
            contenido text, 
            fecha_creacion text
            )`,
            (err) => {
                if (err) {
                    // La tabla ya fue creada
                } else {
                    // La tabla acaba de crearse
                }
            });
        db.run(`CREATE TABLE cambio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            archivo_id INTEGER,
            descripcion text,
            fecha_cambio text,
            FOREIGN KEY (archivo_id) REFERENCES archivo (id)
            )`,
            (err) => {
                if (err) {
                    // La tabla ya fue creada
                } else {
                    // La tabla acaba de crearse
                }
            });
    }
});

module.exports = db;