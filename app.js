const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require('express');
const Joi = require('joi');
//const logger = require('./logger');
const morgan = require('morgan');
const config = require('config');


const app = express();

//Validaciones de json
const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .required()
    });

//Middleware para recibir json, body
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

console.log('Aplicacion ' + config.get('nombre'));
console.log('BDServer' + config.get('configDB.host'));
//Función middleware 1
//app.use(logger);
/*
app.use(function(req, res, next){
    console.log('Autenticando...');
    next();
});
*/
//Middleware morgan
if(app.get('env') === 'development'){
    inicioDebug('Morgan está habilitado');
    app.use(morgan('tiny'));
}

dbDebug('Conectando a la db');
const noEncontrado = {
    mesagge: 'No encontrado'
};

const usuarios = [
    {id:1, nombre:'Daniel'},
    {id:2, nombre:'Alicia'},
    {id:13, nombre:'Javier'},
];

app.get('/', (req, res) => {
    res.send('Hola Mundo desde express');
});

//Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    if(usuarios.length == 0){
        res.send("No hay usuarios");
        return;
    }
    res.send(usuarios);
});

//Obtener usuario por id
app.get('/api/usuarios/:id', (req, res) => {
    let usuario = usuarios.find(usuario => usuario.id === parseInt(req.params.id));
    if(!usuario){
        res.status(404)
            .send(noEncontrado);
    }
    res.status(200)
        .send(usuario);
});

//Crear usuario
app.post('/api/usuarios',(req, res) => {

    const {error, value} = schema.validate({nombre: req.body.nombre});
    console.log(value);
    if(error){
        res.status(400).send({error: error.message});
        return;
    }
    const usuario = {
        id: usuarios.length + 1,
        nombre: req.body.nombre
    };
    usuarios.push(usuario);
    res.status(200)
        .send('Usuario guardado');
});

//actualizar por id
app.put('/api/usuarios/:id', (req, res) => {
    let usuario = usuarios.find(usuario => usuario.id === parseInt(req.params.id));
    if(!usuario){
        res.status(404)
            .send(noEncontrado);
        return;
    }
    const {error, value} = schema.validate({nombre: req.body.nombre});
    console.log(value);
    if(error){
        res.status(400).send({error: error.message});
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});
//eliminar por id
app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = usuarios.find(usuario => usuario.id === parseInt(req.params.id));
    if(!usuario){
        res.status(404)
            .send(noEncontrado);
        return;
    }
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(200);
});

const port = process.env.PORT || 3000;
//Ejecución del servidor
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}..`);
});
