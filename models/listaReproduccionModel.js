const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Asegúrate de requerir el modelo UsuarioRestringido
const UsuarioRestringido = require('./usuarioRestringidoModel'); 

const listaReproduccionSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',  
        required: true
    },
    usuariosRestringidos: [{
        type: Schema.Types.ObjectId,
        ref: 'UsuarioRestringido',
        validate: {
            validator: async function(value) {
                // Si no hay usuarios restringidos asociados, la validación es exitosa
                if (value.length === 0) {
                    return true;
                }
                // Verifica que cada ID en 'value' corresponda a un usuario restringido existente
                const count = await UsuarioRestringido.countDocuments({ _id: { $in: value } });
                return count === value.length;
            },
            message: props => `${props.value.length} perfiles de usuario restringido proporcionados, pero solo ${props.reason} existen en la base de datos.`
        }
    }]
});

const ListaReproduccion = mongoose.model('ListaReproduccion', listaReproduccionSchema);

module.exports = ListaReproduccion;
