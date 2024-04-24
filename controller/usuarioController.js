const UserModel = require("../models/usuarioModel");

const userFuctions = {
  GetUsuarios: async () => {
    try {
      const usuarios = await UserModel.find();
      //borrar cuando se quiten los usurioas viejos del poryecto 1 donde no habia telefono
      let telefonos = usuarios.map((user)=>{
        user.telefono = user.telefono? user.telefono : "null"
      })
      return usuarios;
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      return { error: "Hubo un error al obtener los usuarios" };
    }
  },
  GetUsuario: async ({id}) => {
    try {
      const data = await UserModel.findById(id);
      //borrar cuando se quiten los usurioas viejos del poryecto 1 donde no habia telefono
      let user = data
      user.telefono = data.telefono? data.telefono : "null"
      return data;
    } catch (err) {
      console.error("Error al obtener el usuario:", err);
      return { error: "Hubo un error al obtener el usuario" };
    }
  },
};


module.exports = userFuctions;


