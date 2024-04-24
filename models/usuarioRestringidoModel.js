const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usuarioRestringidoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    edad: {
        type: Number,
        required: true
    },
    usuarioPrincipal: {
        type: Schema.Types.ObjectId,
        ref: 'User' 
    }
});

const UsuarioRestringidoModel = mongoose.model("UsuarioRestringido", usuarioRestringidoSchema);

module.exports = UsuarioRestringidoModel;
