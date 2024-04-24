const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

// Configurar de GraphQL
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const { GraphQLDateTime } = require("graphql-iso-date");

// Middlewares
dotenv.config();
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3001;

// Conección a la base de datos
mongoose
  .connect("mongodb://localhost:27017/tubekids")
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error);
    process.exit(1);
  });

// esquema de GraphQL
const schema = buildSchema(`
  scalar Date

  type User {
    id: ID!
    email: String!
    password: String!
    pin: String!
    name: String!
    lastName: String!
    country: String
    birthdate: Date!
    telefono: String!
    estado: String!
    verificationToken: String
  }

  type UsuarioRestringido {
    id: ID!
    nombre: String!
    pin: String!
    avatar: String!
    edad: Int!
    usuarioPrincipal: ID!
  }

  type ListaReproduccion {
    id: ID!
    nombre: String!
    descripcion: String
    videos: [ID!]
    usuario: ID!
    usuariosRestringidos: [ID!]
  }

  type Video {
    id: ID!
    nombre: String!
    urlYoutube: String!
    listaReproduccion: ID!
    usuario: ID!
  }
  
  type Query {
    GetUsuarios: [User!]!
    GetUsuario(id: ID!): User!

    GetUsuariosRestringidosUser(iduser: ID!): [UsuarioRestringido!]!
    GetUsuarioRestringido(id: ID!): UsuarioRestringido!
    GetPinUserPrincipal(id: ID!, pin: String): [UsuarioRestringido!]!
    GetUsuariosRestringidos: [UsuarioRestringido!]!

    GetVideo(id: ID!): Video!
    GetVideos: [Video!]!
    GetVideosUser(iduser: ID): [Video!]!
    GetVideosListaReproduccion(listaReproduccion: ID): [Video!]!
    BuscarVideos(searchTerm: String!): [Video!]! 

    getLista(id: ID!): ListaReproduccion!
    getListas(id: ID!): [ListaReproduccion!]!
    getListasUsuario(iduser: ID!): [ListaReproduccion!]!
    getListasUsuarioRestringido(iduser: ID!, idusuarioRestringido: ID!): [ListaReproduccion!]!
    getListasConVideos(id: ID!): ListaReproduccion!
    obtenerListasReproduccion: [ListaReproduccion!]!
    getListasReproduccionUsuario(id: ID!): [ListaReproduccion!]!

  }
`);

const resolvers = {
  Date: GraphQLDateTime,
};

// Importa las funciones
const userFuctions = require("./controller/usuarioController");
const usuarioRestringidofuctions = require("./controller/usuarioRestringidoController.js");
const videofuctions = require("./controller/videoController.js");
const listaReproduccionfuctions = require("./controller/listaReproduccionController.js");

const root = {
  ...userFuctions,
  ...usuarioRestringidofuctions,
  ...videofuctions,
  ...listaReproduccionfuctions,
};

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token JWT recibido:", token);
  if (token == null) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error("Error al verificar el token JWT:", err);
      return res.status(403).json({ error: "Forbidden" });
    }

    // Extraer el userId y el pin del token decodificado
    const { userId, pin } = decodedToken;

    // Asigna el userId y el pin a req.user para su posterior uso en las rutas protegidas
    req.user = { _id: userId, pin: pin };

    console.log("Este es el id principal...", userId);
    // Verifica que principalId no sea undefined antes de continuar
    if (userId !== undefined) {
      console.log("definido...");
    } else {
      console.error("El ID principal es undefined, no se puede continuar.");
    }

    // Continua con el middleware siguiente
    next();
  });
}

// Middleware de GraphQL
app.use(
  "/graphql",
  authenticateToken,
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
