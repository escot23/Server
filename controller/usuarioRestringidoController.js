const UsuarioRestringidoModel = require("../models/usuarioRestringidoModel.js");

const usuarioRestringidofuctions = {
  GetUsuariosRestringidosUser: async ({ iduser }) => {
    try {
      const userId = iduser;
      const usuarios = await UsuarioRestringidoModel.find({
        usuarioPrincipal: userId,
      });
      //borrar cuando se quiten los usurioas restringidos viejos del poryecto 1 donde no habia usuarioPrincipal
      let usuarioPrincipal = usuarios.map((usuario) => {
        usuario.usuarioPrincipal = usuario.usuarioPrincipal
          ? usuario.usuarioPrincipal
          : usuario._id;
      });
      return usuarios;
    } catch (error) {
      console.error(
        "Error al cargar los datos de usuarios restringidos:",
        error
      );
      return {
        error: "Hubo un error al cargar los datos de usuarios restringidos",
      };
    }
  },
 /* GetUsuarioRestringido: async ({ id }) => {
    try {
      const userId = id; // Obtén el ID del usuario principal del token JWT
      console.log(userId);
      // Busca el usuario principal en la base de datos
      const usuario = await UsuarioRestringidoModel.findOne({
        _id: userId,
      });

      //borrar cuando se quiten los usurioas viejos del poryecto 1 donde no habia usuarioPrincipal
      let usuarioPrincipal = usuario;
      usuarioPrincipal.usuarioPrincipal = usuario.usuarioPrincipal
        ? usuario.usuarioPrincipal
        : usuario._id;

      return usuario; // Envia los datos del usuario principal al cliente
    } catch (error) {
      console.error("Error al cargar los datos del usuario principal:", error);
      return {
        error: "Hubo un error al cargar los datos del usuario principal",
      };
    }
  },*/
  GetPinUserPrincipal: async ({ id, pin }) => {
    // Verificar si existe el usuario en el token y si tiene un ID y un pin
    const userId = id; // Obtener el ID del usuario del token JWT
    const pinUserPrincipal = pin; // Obtener el pinPrincipal del token JWT
    console.log("id...", userId);
    // Buscar todos los usuarios restringidos asociados con el ID del usuario
    UsuarioRestringidoModel.find({ userId: userId })
      .then((users) => {
        // Enviar los usuarios restringidos junto con el pinPrincipal en la respuesta
        console.log("pin del principal...", pinUserPrincipal);
        console.log("id...", userId);
        return { users: users, pin: pinUserPrincipal };
      })
      .catch((err) => {
        return { error: "Error interno del servidor" };
      });
  },
  GetUsuariosRestringidos: async () => {
    try {
      const usuarios = await UsuarioRestringidoModel.find();
      //borrar cuando se quiten los usurioas viejos del poryecto 1 donde no habia usuarioPrincipal
      let usuarioPrincipal = usuarios.map((usuario) => {
        usuario.usuarioPrincipal = usuario.usuarioPrincipal
          ? usuario.usuarioPrincipal
          : usuario._id;
      });
      return usuarios;
    } catch (error) {
      console.error(
        "Error al cargar los datos de usuarios restringidos:",
        error
      );
      return {
        error: "Hubo un error al cargar los datos de usuarios restringidos",
      };
    }
  },
  GetUsuarioRestringido: async ({ id }) => {
    try {
      // Obtén el ID del usuario principal del token JWT
      const userId = id;

      // Busca el usuario principal en la base de datos
      const usuario = await UsuarioRestringidoModel.findOne({
        _id: userId,
      });

      if (!usuario) {
        return { error: "Usuario no encontrado" };
      }

      // Mapea los datos específicos que necesitas
      const datosUsuario = {
        _id: usuario._id,
        nombre: usuario.nombre,
        avatar: usuario.avatar,
        pin: usuario.pin
      };

      return datosUsuario; // Envia los datos específicos del usuario principal al cliente
    } catch (error) {
      console.error("Error al cargar los datos del usuario principal:", error);
      return {
        error: "Hubo un error al cargar los datos del usuario principal",
      };
    }
  },
};

module.exports = usuarioRestringidofuctions;
