const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const User = require('./models/usuarioModel.js');
const RestrictedUser = require('./models/usuarioRestringidoModel.js');
const {
    PostUsuario,
    GetUsuario
} = require('./controller/usuarioController.js');

const {
    loginUser
} = require('./controller/loginController');

const {
    PostVideo,
    GetVideo,
    PatchVideo,
    PutVideo,
    BuscarVideos
} = require('./controller/videoController.js');

const {
    PostUsuarioRestringido,
    PatchUsuarioRestringido,
    GetPinUserPrincipal,
    PutUsuarioRestringido,
    GetListaUsuariosRestringidos,
    GetDatos
} = require('./controller/usuarioRestringidoController.js');

const {
    PostLista,
    addVideoToLista, getListasUsuario, GetVideos, getVideosPorLista,getListasConVideos, 
    cargarUsuariosRestringidos,cargarVideosLista, agregarVideoALista,obtenerListasReproduccion,
    eliminarPlaylist,actualizarListaReproduccion,getListasReproduccionUsuario
}= require('./controller/listaReproduccionController.js');

// Middlewares
dotenv.config();
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

// Conección a la base de datos
mongoose.connect('mongodb://localhost:27017/tubekids')
    .then(() => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    });

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token JWT recibido:', token);
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            console.error('Error al verificar el token JWT:', err);
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Extraer el userId y el pin del token decodificado
        const { userId, pin } = decodedToken;

        // Asigna el userId y el pin a req.user para su posterior uso en las rutas protegidas
        req.user = { _id: userId, pin: pin };
        console.log("por aca intntamos cargar el id principal...", userId);

        // Continua con el middleware siguiente
        next();
    });
}

// Rutas para la administración de usuarios restringidos
app.post('/usuariosrestringido', authenticateToken, PostUsuarioRestringido);
app.get('/usuariosrestringido/cargar', authenticateToken, GetPinUserPrincipal);
app.get('/usuariosrestringido/mostrar', authenticateToken, GetListaUsuariosRestringidos);
app.put('/usuariosrestringido/:id', PatchUsuarioRestringido);
app.delete('/usuariosrestringido/:id', PutUsuarioRestringido);
app.get('/getdatos', authenticateToken,GetDatos);
app.get('/buscarvideos', authenticateToken, BuscarVideos);
// Rutas para el registro y inicio de sesión de usuarios principales
app.post('/register', PostUsuario);
app.get('/register', GetUsuario);
app.post('/login', loginUser);

// Rutas de videos
app.post('/videos', authenticateToken, PostVideo);
app.get('/videos', authenticateToken, GetVideo);
app.put('/videos/:id', authenticateToken, PatchVideo);
app.delete('/videos/:id', authenticateToken, PutVideo);


// Rutas para listas de reproducción
app.post('/usuariosrestringido/crearlista', authenticateToken, PostLista);
app.post('/usuariosrestringido/videoalista', authenticateToken, addVideoToLista);
app.get('/usuariosrestringido/listas', authenticateToken, getListasUsuario);
app.get('/usuariosrestringido/videos', authenticateToken, GetVideos);
app.get('/usuariosrestringido/listas/:playlistId/videos', authenticateToken, getVideosPorLista);
app.get('/usuariosrestringido/listasconvideos', authenticateToken, getListasConVideos);
app.get('/usuariosrestringido/usuarios', authenticateToken, cargarUsuariosRestringidos);
app.get('/obtenerListasReproduccion', authenticateToken,obtenerListasReproduccion);
app.post('/agregarVideoALista', authenticateToken,agregarVideoALista);
app.delete('/usuariosrestringido/listas/:id', authenticateToken, eliminarPlaylist);
app.put('/usuariosrestringido/listas/:id', actualizarListaReproduccion);
app.get('/api/listas', authenticateToken, getListasReproduccionUsuario);


// Ruta para autenticar usuarios y generar token JWT
app.post("/api/session", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca al usuario en la base de datos
        const user = await User.findOne({ email, password });

        if (user) {
            // Verifica si existen usuarios restringidos asociados al usuario principal
            const restrictedUsers = await RestrictedUser.find({ userId: user._id });

            // Determina si hay usuarios restringidos relacionados con el ID del usuario principal
            const hasRestrictedUsers = restrictedUsers && restrictedUsers.length > 0;

            // Genera token JWT con la información del usuario
            const token = jwt.sign({
                userId: user._id,
                email: user.email,
                pin: user.pin,
                hasRestrictedUsers: hasRestrictedUsers // Pasar true si hay usuarios restringidos, false si no los hay
            }, process.env.JWT_SECRET);

            console.log('Token JWT generado:', token);
            console.log("res",restrictedUsers);
            res.status(201).json({ token, hasRestrictedUsers });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error al autenticar al usuario:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/verify', async (req, res) => {
    const { token } = req.query;  // Extrae el token de verificación de la URL

    try {
        const user = await User.findOne({ verificationToken: token });  // Busca al usuario con el token
        if (!user) {
            return res.status(404).send('Verificación fallida: Usuario no encontrado o token inválido.');
        }

        user.estado = 'activo';  // Cambia el estado del usuario a activo
        user.verificationToken = '';  // Borra el token para que no se pueda reutilizar
        await user.save();  // Guarda los cambios en la base de datos

        res.redirect(`${process.env.FRONTEND_URL}/login`);  // Redirige al usuario al inicio de sesión
    } catch (error) {
        console.error('Error al verificar el usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});