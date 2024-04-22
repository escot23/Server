const VideoModel = require('../models/videomodel.js');
const ListaReproduccion = require('../models/listaReproduccionModel');

const PostVideo = async (req, res) => {
    try {
        const { nombre, urlYoutube } = req.body;
        const userId = req.user._id;;

        if (!userId) {
            console.log("Error: User ID is missing");
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const video = new VideoModel({
            nombre,
            urlYoutube,
            usuario: userId
        });

        console.log("Saving video...");
        const videoGuardado = await video.save();
        console.log("Video saved:", videoGuardado);
        res.status(201).json(videoGuardado);
    } catch (error) {
        console.error('Error al crear el video:', error);
        res.status(500).json({ error: 'Hubo un error al intentar crear el video' });
    }
};



const GetVideo = async (req, res) => {
    try {
        const userId = req.user._id;;  
        console.log("usuario",userId);
        const videos = await VideoModel.find({ usuario: userId });
        console.log(videos);

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



module.exports = {
    PostVideo,
    GetVideo,
    PatchVideo,
    PutVideo,
    BuscarVideos 
};
