const ListaReproduccion = require("../models/listaReproduccionModel");

const listaReproduccionfuctions = {
  getLista: async ({ id }) => {
    try {
      const lista = await ListaReproduccion.findById(id);
      return lista;
    } catch (error) {
      console.error(
        "Error al obtener listas de reproducción con videos:",
        error
      );
      return { error: "Error interno del servidor" };
    }
  },
  // Método para obtener todas las listas de reproducción de un usuario
  getListas: async () => {
    try {
      const listas = await ListaReproduccion.find();
      return listas;
    } catch (error) {
      console.error(
        "Error al obtener listas de reproducción con videos:",
        error
      );
      return { error: "Error interno del servidor" };
    }
  },
  getListasUsuario: async ({ iduser }) => {
    console.log("usuario controller",iduser);
    try {
      const listas = await ListaReproduccion.find({ usuario: iduser });
      console.log("listas",listas);
      return listas;
    } catch (error) {
      console.error("Error al obtener las listas de reproducción:", error);
      return { error: "Error interno del servidor" };
    }
  },
  getListasUsuarioRestringido: async ({ iduser, idusuarioRestringido }) => {
    try {
      const listas = await ListaReproduccion.find({ usuario: iduser });
      let listas2 = listas.filter((lista) => {
        return lista.usuariosRestringidos.some(
          (usuarioRestringido) => usuarioRestringido == idusuarioRestringido
        );
      });
      console.log(listas2);
      return listas2;
    } catch (error) {
      console.error("Error al obtener las listas de reproducción:", error);
      return { error: "Error interno del servidor" };
    }
  },

  // no se que hacen esa sfunciones ya que no entinedo para que las tenias

  // Método para obtener listas de reproducción con sus videos
  getListasConVideos: async ({ id }) => {
    const playlistId = id;
    try {
      const playlist = await ListaReproduccion.findById(playlistId).populate(
        "videos"
      );
      if (!playlist) {
        console.log(`No playlist found with ID: ${playlistId}`); // Log para diagnóstico
        return { message: "Playlist not found" };
      }
      return playlist;
    } catch (error) {
      console.error("Server Error:", error);
      return { error: "Internal server error" };
    }
  },
  obtenerListasReproduccion: async () => {
    try {
      const listas = await ListaReproduccion.find({}); // Obtener todas las listas de reproducción de la base de datos

      return listas; // Enviar las listas como respuesta en formato JSON
    } catch (error) {
      console.error("Error al obtener listas de reproducción:", error);
      return { error: "Error al obtener listas de reproducción" };
    }
  },

  // Método para obtener todas las listas de reproducción de un usuario con conteo de videos
  getListasReproduccionUsuario: async ({ id }) => {
    const userId = id; // ID del usuario obtenido del token JWT

    try {
      const listas = await ListaReproduccion.find({ usuario: userId })
        .populate("videos") // Opcional, si también quieres incluir detalles de los videos
        .exec();

      if (listas.length === 0) {
        return {
          message: "No hay listas de reproducción asignadas a este perfil.",
        };
      }

      return listas;
    } catch (error) {
      console.error("Error al obtener las listas de reproducción:", error);
      return { error: "Error interno del servidor" };
    }
  },
};

module.exports = listaReproduccionfuctions;
