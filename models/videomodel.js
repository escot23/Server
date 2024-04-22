const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    urlYoutube: {
        type: String,
        required: true
    },
    listaReproduccion: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ListaReproduccion', 
        required: false 
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',  
        required: true
    }
});

const VideoModel = mongoose.model("Video", videoSchema);

module.exports = VideoModel;
