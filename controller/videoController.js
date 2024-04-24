const VideoModel = require("../models/videomodel.js");

const videofuctions = {
  GetVideo: async ({ id }) => {
    try {
      const video = await VideoModel.findById(id);
      //borrar cuando se quiten los videos viejos del poryecto 1 donde no habia usuario
      let video2 = video;
      video2.usuario = video.usuario ? video.usuario : video._id;
      return video;
    } catch (error) {
      console.error("Error al obtener los videos:", error);
      return { error: "Hubo un error al obtener los videos" };
    }
  },
  GetVideos: async () => {
    try {
      const videos = await VideoModel.find({});
      //borrar cuando se quiten los videos viejos del poryecto 1 donde no habia usuario
      let videos2 = videos.map((video) => {
        video.usuario = video.usuario ? video.usuario : video._id;
      });
      return videos;
    } catch (error) {
      console.error("Error al obtener videos:", error);
      return { error: "Error interno del servidor" };
    }
  },
  GetVideosUser: async ({ iduser }) => {
    try {
      const videos = await VideoModel.find({ usuario: iduser });
      //borrar cuando se quiten los videos viejos del poryecto 1 donde no habia usuario
      let videos2 = videos.map((video) => {
        video.usuario = video.usuario ? video.usuario : video._id;
      });
      return videos;
    } catch (error) {
      console.error("Error al obtener los videos:", error);
      return { error: "Hubo un error al obtener los videos" };
    }
  },
  GetVideosListaReproduccion: async ({ listaReproduccion }) => {
    try {
      const videos = await VideoModel.find({ listaReproduccion: listaReproduccion });
      //borrar cuando se quiten los videos viejos del poryecto 1 donde no habia usuario
      let videos2 = videos.map((video) => {
        video.usuario = video.usuario ? video.usuario : video._id;
      });
      return videos;
    } catch (error) {
      console.error("Error al obtener videos:", error);
      return { error: "Error interno del servidor" };
    }
  },

  // no se que hacen esa sfunciones ya que no entinedo para que las tenias
  BuscarVideos: async ({ searchTerm }) => {
    try {
      const videos = await VideoModel.find({
        $or: [
          { nombre: { $regex: searchTerm, $options: "i" } },
          { descripcion: { $regex: searchTerm, $options: "i" } },
        ],
      });
      return videos;
    } catch (error) {
      console.error("Error al buscar videos:", error);
      return { error: "Hubo un error al buscar los videos" };
    }
  },
};

module.exports = videofuctions;
