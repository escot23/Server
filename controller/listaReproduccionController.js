const ListaReproduccion = require('../models/listaReproduccionModel');
const Video = require('../models/videomodel');
const UsuarioRestringidoModel = require('../models/usuarioRestringidoModel');

// Método para crear una nueva lista de reproducción  _____si
const PostLista = async (req, res) => {
    const userId = req.user._id;  // ID del usuario principal obtenido del token JWT
    const { nombre, descripcion } = req.body;  
    console.log("user",userId);
    try {
        const nuevaLista = new ListaReproduccion({
            nombre,
            descripcion,
            usuario: userId  
        });
        console.log("lidr",nuevaLista.userId);
        await nuevaLista.save();
        res.status(201).json(nuevaLista);
    } catch (error) {
        console.error('Error al crear lista de reproducción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Método para añadir un video a una lista de reproducción
const addVideoToLista = async (req, res) => {
    const { videoId, listaId } = req.body;

    try {
        // Asegurarte de que tanto el video como la lista existen antes de intentar añadir
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video no encontrado" });
        }

        const lista = await ListaReproduccion.findById(listaId);
        if (!lista) {
            return res.status(404).json({ message: "Lista de reproducción no encontrada" });
        }

        // Verificar si el video ya está en la lista para evitar duplicados
        if (lista.videos.includes(video._id)) {
            return res.status(409).json({ message: "El video ya está en la lista" });
        }

        // Añadir el video a la lista y guardar los cambios
        lista.videos.push(video._id);
        await lista.save();

        // Devolver la lista actualizada
        res.status(200).json(lista);
    } catch (error) {
        console.error('Error al añadir video a la lista:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



// Método para obtener todas las listas de reproducción de un usuario
const getListasUsuario = async (req, res) => {
    const userId = req.user._id;
    console.log("UserID:", userId);
    try {
        const listas = await ListaReproduccion.find({ usuario: userId }).populate('videos');
        res.status(200).json(listas);
    } catch (error) {
        console.error('Error al obtener las listas de reproducción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Método para obtener todos los videos disponibles
const GetVideos = async (req, res) => {
    try {
        const videos = await Video.find({});
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error al obtener videos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getVideosPorLista = async (req, res) => {
    const { playlistId } = req.params;
    try {
        const playlist = await ListaReproduccion.findById(playlistId).populate('videos');
        if (!playlist) {
            console.log(`No playlist found with ID: ${playlistId}`);  // Log para diagnóstico
            return res.status(404).json({ message: 'Playlist not found' });
        }
        res.json(playlist.videos);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Método para obtener listas de reproducción con sus videos   _____si
const getListasConVideos = async (req, res) => {
    try {
        const listas = await ListaReproduccion.find({ usuario: req.user._id })
            .populate('videos')
            .exec();

        res.status(200).json(listas);
        console.log(listas);
    } catch (error) {
        console.error('Error al obtener listas de reproducción con videos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};




//sii
const cargarUsuariosRestringidos = async (req, res) => {
    console.log("Usuario ID:", req.user._id); // Verifica que estás obteniendo el ID correcto.

    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Usuario no autenticado o ID no disponible" });
        }

        const userId = req.user._id;
        console.log("ID del usuario obtenido del token:", userId);

        const usuarios = await UsuarioRestringidoModel.find({ usuarioPrincipal: userId });
        console.log("Usuarios restringidos encontrados:", usuarios);

        const datosUsuarios = usuarios.map(usuario => ({
            _id: usuario._id,
            nombre: usuario.nombre,
        }));

        res.status(200).json(datosUsuarios);
    } catch (error) {
        console.error('Error al cargar los datos de usuarios restringidos:', error);
        res.status(500).json({ error: 'Hubo un error al cargar los datos de usuarios restringidos' });
    }
};

// Método para cargar videos de una lista de reproducción
const cargarVideosLista = async (req, res) => {
    try {
        const listaId = req.query.listaId; // Supongamos que el ID de la lista viene como query parameter

        const lista = await ListaReproduccion.findById(listaId).populate('videos'); // Popula la lista con los videos

        if (!lista) {
            return res.status(404).json({ message: 'Lista de reproducción no encontrada' });
        }

        res.status(200).json(lista.videos); // Devuelve los videos de la lista en formato JSON
    } catch (error) {
        console.error('Error al cargar videos de la lista de reproducción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const obtenerListasReproduccion = async (req, res) => {
    try {
        const listas = await ListaReproduccion.find({}); // Obtener todas las listas de reproducción de la base de datos

        res.status(200).json(listas); // Enviar las listas como respuesta en formato JSON
    } catch (error) {
        console.error('Error al obtener listas de reproducción:', error);
        res.status(500).json({ error: 'Error al obtener listas de reproducción' });
    }
};

const agregarVideoALista = async (req, res) => {
    const { videoId, lista } = req.body;

    try {
        // Buscar el video y la lista de reproducción en la base de datos
        const video = await Video.findById(videoId);
        const listaReproduccion = await ListaReproduccion.findById(lista);

        // Verificar si el video y la lista existen
        if (!video || !listaReproduccion) {
            return res.status(404).json({ error: 'Video o lista de reproducción no encontrados' });
        }

        // Agregar el video a la lista de reproducción si no está ya presente
        if (!listaReproduccion.videos.includes(video._id)) {
            listaReproduccion.videos.push(video._id);
            await listaReproduccion.save();
        }

        res.status(200).json({ message: 'Video agregado a la lista correctamente' });
    } catch (error) {
        console.error('Error al agregar video a la lista de reproducción:', error);
        res.status(500).json({ error: 'Error al agregar video a la lista de reproducción' });
    }
};
// Método para eliminar una lista de reproducción  ____siiiii
const eliminarPlaylist = async (req, res) => {
    const { id } = req.params; // Obtén el ID de la lista desde los parámetros de la ruta

    try {
        const resultado = await ListaReproduccion.findByIdAndDelete(id);

        if (!resultado) {
            return res.status(404).json({ message: 'Lista de reproducción no encontrada' });
        }

        res.json({ message: 'Lista de reproducción eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la lista de reproducción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Método para actualizar una lista de reproducción existente
const actualizarListaReproduccion = async (req, res) => {
    const { id } = req.params; // ID de la lista de reproducción desde los parámetros de URL
    const { nombre, descripcion, videos } = req.body; // Datos actualizados enviados en la solicitud

    try {
        const listaActualizada = await ListaReproduccion.findByIdAndUpdate(id, {
            nombre,
            descripcion,
            videos
        }, { new: true, runValidators: true });

        if (!listaActualizada) {
            return res.status(404).json({ message: "Lista de reproducción no encontrada" });
        }

        res.status(200).json(listaActualizada);
    } catch (error) {
        console.error('Error al actualizar la lista de reproducción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



// Método para obtener todas las listas de reproducción de un usuario con conteo de videos ____Si
const getListasReproduccionUsuario = async (req, res) => {
    const userId = req.user._id;  // ID del usuario obtenido del token JWT

    try {
        const listas = await ListaReproduccion.find({ usuario: userId })
            .populate('videos')  // Opcional, si también quieres incluir detalles de los videos
            .exec();

        if (listas.length === 0) {
            return res.status(404).json({ message: 'No hay listas de reproducción asignadas a este perfil.' });
        }

        const listasConConteo = listas.map(lista => ({
            _id: lista._id,
            nombre: lista.nombre,
            descripcion: lista.descripcion,
            cantidadVideos: lista.videos.length  
        }));

        res.status(200).json(listasConConteo);
    } catch (error) {
        console.error('Error al obtener las listas de reproducción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    PostLista, addVideoToLista, getListasUsuario, GetVideos, getVideosPorLista, getListasConVideos,
    cargarUsuariosRestringidos, cargarVideosLista, agregarVideoALista, obtenerListasReproduccion,
    eliminarPlaylist, actualizarListaReproduccion, getListasReproduccionUsuario
};
