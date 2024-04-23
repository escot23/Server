const VideoModel = require('../models/videomodel.js');
const ListaReproduccion = require('../models/listaReproduccionModel');


const PostVideo = async (req, res) => {
    try {
        const { nombre, urlYoutube, descripcion, listaReproduccionId } = req.body; // Asume que el ID de la lista viene en el body
        const userId = req.user._id;
        console.log(listaReproduccionId);
        if (!userId) {
            console.log("Error: User ID is missing");
            return res.status(400).json({ error: 'User ID is required.' });
        }

        // Crear el video
        const video = new VideoModel({
            nombre,
            urlYoutube,
            descripcion,
            listaReproduccion: listaReproduccionId, 
            usuario: userId
        });

        console.log("Saving video...", video);
        const videoGuardado = await video.save();

        // Actualizar la lista de reproducción para incluir el nuevo video
        if (listaReproduccionId) {
            await ListaReproduccion.findByIdAndUpdate(
                listaReproduccionId,
                { $push: { videos: videoGuardado._id } },
                { new: true }
            );
        }

        console.log("Video saved:", videoGuardado);
        res.status(201).json(videoGuardado);
    } catch (error) {
        console.error('Error al crear el video o actualizar la lista de reproducción:', error);
        res.status(500).json({ error: 'Hubo un error al intentar crear el video o actualizar la lista de reproducción' });
    }
};



const GetVideo = async (req, res) => {
    try {
        const userId = req.user._id;;  
        console.log("usuario",userId);
        const videos = await VideoModel.find({ usuario: userId });
        console.log("videos",videos);

        if (!videos.length) {
            return res.status(404).json({ error: 'No se encontraron videos para este usuario' });
        }
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error al obtener los videos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los videos' });
    }
};

const PatchVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, urlYoutube } = req.body;
        console.log(id);
        // Actualizar el video en la base de datos
        const videoActualizado = await VideoModel.findByIdAndUpdate(id,
            {
                nombre,
                urlYoutube
            }, { new: true });
        if (!videoActualizado) {
            return res.status(404).json({ error: 'No se encontró el video' });
        }
        res.status(200).json(videoActualizado);
    } catch (error) {
        console.error('Error al editar el video:', error);
        res.status(500).json({ error: 'Hubo un error al intentar editar el video' });
    }
};

const PutVideo = async (req, res) => {
    try {
        const videoId = req.params.id;

        // Eliminar el video de la base de datos
        const videoEliminado = await VideoModel.findByIdAndDelete(videoId);
        if (!videoEliminado) {
            return res.status(404).json({ error: 'No se encontró el video' });
        }
        res.status(200).json({ message: 'Video eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el video:', error);
        res.status(500).json({ error: 'Hubo un error al intentar eliminar el video' });
    }
};

const BuscarVideos = async (req, res) => {
    const searchTerm = req.query.searchTerm;
    if (!searchTerm) {
        return res.status(400).json({ error: "El término de búsqueda es requerido" });
    }

    try {
        const videos = await VideoModel.find({
            $or: [
                { nombre: { $regex: searchTerm, $options: 'i' } },
                { descripcion: { $regex: searchTerm, $options: 'i' } }
            ]
        });
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error al buscar videos:', error);
        res.status(500).json({ error: 'Hubo un error al buscar los videos' });
    }
};

// Obtener videos de una lista de reproducción específica
async function getVideosByLista(req, res) {
    try {
        const listas = await ListaReproduccion.find({ usuario: req.user._id })
            .populate('videos')
            .exec();
            console.log("listas de reproduccion:",listas);

        res.status(200).json(listas);
    } catch (error) {
        console.error('Error al obtener listas de reproducción con videos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


const getPlaylists = async (req, res) => {
    const userId = req.user._id;  // Asegúrate de que el usuario esté autenticado y que su ID esté disponible

    try {
        // Encuentra todas las listas de reproducción del usuario con solo los IDs de los videos para minimizar la carga de datos
        const playlists = await ListaReproduccion.find({ usuario: userId })
            .populate({
                path: 'videos',
                select: '_id'  // Solo se selecciona el ID de los videos para contarlos
            });

        // Prepara los datos para la respuesta, incluyendo el conteo de videos en cada lista
        const results = playlists.map(playlist => ({
            _id: playlist._id,
            nombre: playlist.nombre,
            descripcion: playlist.descripcion,
            videoCount: playlist.videos.length,  // Contar los videos asociados a cada playlist
        }));

        console.log("Resultados de obtención de playlists", results);
        res.status(200).json(results);  // Envía los resultados formateados al cliente
    } catch (error) {
        console.error('Error al obtener playlists:', error);
        res.status(500).json({ error: 'Hubo un error al obtener las playlists' });
    }
};





module.exports = {
    PostVideo,
    GetVideo,
    PatchVideo,
    PutVideo,
    BuscarVideos,
    getVideosByLista,
    getPlaylists
};
