require('dotenv').config(); 
const jwt = require('jsonwebtoken');

const UserModel = require("../models/usuarioModel");

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid'); // Para generar un token único

const PostUsuario = async (req, res) => {
    const { email, password, pin, name, lastName, country, birthdate, telefono } = req.body;
    if (!email || !password || !pin || !name || !lastName || !birthdate || !telefono) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Validar que el usuario sea mayor de 18 años
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    const ageDiff = today - birthDateObj; // diferencia en milisegundos
    const age = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25)); // convertir a años

    if (age < 18) {
        return res.status(400).json({ error: "Debes tener al menos 18 años para registrarte" });
    }

    const verificationToken = uuidv4(); // Generar un token único para la verificación

    let user = new UserModel({
        email,
        password,
        pin,
        name,
        lastName,
        country,
        birthdate,
        telefono,
        estado: 'pendiente',
        verificationToken // Guardar el token de verificación
    });

    try {
        const savedUser = await user.save();

        // Configura el transportador de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu dirección de correo de Gmail
                pass: process.env.EMAIL_PASS  // Tu contraseña de Gmail
            }
        });

        // Opciones de correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: savedUser.email,
            subject: 'Verifica tu cuenta',
            html: `<h1>Verificación de correo electrónico</h1>
                   <p>Haga clic en el siguiente enlace para verificar su cuenta:</p>
                   <a href="${process.env.FRONTEND_URL}/verify?token=${verificationToken}">Verificar Cuenta</a>`
        };

        // Envío del correo electrónico
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error('Error al enviar el correo:', error);
            } else {
                console.log('Correo de verificación enviado: ' + info.response);
            }
        });

        res.status(201).json({ message: 'Usuario registrado correctamente. Verifique su correo electrónico.', userId: savedUser._id });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ error: 'Hubo un error al registrar el usuario' });
    }
};

const GetUsuario = (req, res) => {
    UserModel.find()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.error('Error al obtener usuarios:', err);
            res.status(500).json({ error: 'Hubo un error al obtener los usuarios' });
        });
};


module.exports = {
    PostUsuario,
    GetUsuario
};
