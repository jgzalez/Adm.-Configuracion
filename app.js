const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = 3000;
const destinarioCorreo = 'android.oct7@gmail.com';
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'mail.jgonzalezfals.dev',
    port: 465, // Reemplaza con el puerto SMTP correspondiente
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: 'test@jgonzalezfals.dev',
        pass: 'santiagodecuba' // Contraseña de la cuenta de correo
    },
    secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});


transporter.on('log', (log) => {
    console.log(log);
});
app.use(cors());


// Permitir a Express entender JSON
app.use(express.json());

// Aquí irán las rutas...

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

const db = require('./database_setup');

app.post('/archivo', (req, res) => {
    const { nombre, contenido, fecha_creacion } = req.body;
    const sqlInsert = `INSERT INTO archivo (nombre, contenido, fecha_creacion) VALUES (?, ?, ?)`;

    db.run(sqlInsert, [nombre, contenido, fecha_creacion], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        const archivoId = this.lastID;

        // Crear un registro en 'CAMBIO'
        const sqlCambio = `INSERT INTO cambio (archivo_id, descripcion, fecha_cambio) VALUES (?, ?, ?)`;
        db.run(sqlCambio, [archivoId, 'Archivo creado', new Date().toISOString()], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            // Enviar correo notificando la creación
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: destinarioCorreo, // Dirección del destinatario
                subject: 'Creación de Nuevo Archivo',
                text: `Se ha creado un nuevo archivo con ID: ${archivoId}`
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Correo enviado: ' + info.response);
                }
            });

            res.json({
                "message": "Archivo creado y cambio registrado exitosamente",
                "data": { id: archivoId }
            });
        });
    });
});


app.get('/archivo/:id?', (req, res) => {
    const id = req.params.id;
    let sql = `SELECT * FROM archivo`;
    let params = [];

    if (id) {
        sql += ` WHERE id = ?`;
        params.push(id);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "Éxito",
            "data": rows
        });
    });
});

app.put('/archivo/:id', (req, res) => {
    const { nombre, contenido, fecha_creacion } = req.body;
    const sqlUpdate = `UPDATE archivo SET 
                       nombre = ?, 
                       contenido = ?, 
                       fecha_creacion = ? 
                       WHERE id = ?`;
    const paramsUpdate = [nombre, contenido, fecha_creacion, req.params.id];

    // Actualizar archivo
    db.run(sqlUpdate, paramsUpdate, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Crear un registro en 'CAMBIO'
        const sqlCambio = `INSERT INTO cambio (archivo_id, descripcion, fecha_cambio) VALUES (?, ?, ?)`;
        db.run(sqlCambio, [req.params.id, 'Descripción del cambio', new Date().toISOString()], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            // Enviar correo notificando el cambio
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: destinarioCorreo, // Dirección del destinatario
                subject: 'Notificación de Cambio en Archivo',
                text: `Se ha realizado un cambio en el archivo con ID: ${req.params.id}`
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Correo enviado: ' + info.response);
                }
            });

            res.json({
                message: "Archivo actualizado y cambio registrado exitosamente",
                data: { id: this.lastID }
            });
        });
    });
});


app.delete('/archivo/:id', (req, res) => {
    const archivoId = req.params.id;
    const sqlDelete = `DELETE FROM archivo WHERE id = ?`;

    db.run(sqlDelete, archivoId, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Crear un registro en 'CAMBIO'
        const sqlCambio = `INSERT INTO cambio (archivo_id, descripcion, fecha_cambio) VALUES (?, ?, ?)`;
        db.run(sqlCambio, [archivoId, 'Archivo eliminado', new Date().toISOString()], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            // Enviar correo notificando la eliminación
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: destinarioCorreo, // Dirección del destinatario
                subject: 'Eliminación de Archivo',
                text: `Se ha eliminado el archivo con ID: ${archivoId}`
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Correo enviado: ' + info.response);
                }
            });

            res.json({ "message": "Archivo eliminado y cambio registrado exitosamente" });
        });
    });
});


app.post('/cambio', (req, res) => {
    const { archivo_id, descripcion, fecha_cambio } = req.body;
    const sql = `INSERT INTO cambio (archivo_id, descripcion, fecha_cambio) VALUES (?, ?, ?)`;
    db.run(sql, [archivo_id, descripcion, fecha_cambio], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "Cambio creado exitosamente",
            "data": { id: this.lastID }
        });
    });
});

app.get('/cambio/:id?', (req, res) => {
    const id = req.params.id;
    let sql = `SELECT * FROM cambio`;
    let params = [];

    if (id) {
        sql += ` WHERE id = ?`;
        params.push(id);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "Éxito",
            "data": rows
        });
    });
});


app.put('/cambio/:id', (req, res) => {
    const { archivo_id, descripcion, fecha_cambio } = req.body;
    const sql = `UPDATE cambio SET 
                 archivo_id = ?, 
                 descripcion = ?, 
                 fecha_cambio = ? 
                 WHERE id = ?`;
    const params = [archivo_id, descripcion, fecha_cambio, req.params.id];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            message: "Cambio actualizado exitosamente",
            data: { id: this.lastID }
        });
    });
});


app.delete('/cambio/:id', (req, res) => {
    const sql = `DELETE FROM cambio WHERE id = ?`;
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "Cambio eliminado exitosamente" });
    });
});