// Installation Procedure
// npm init
// npm i express express-handlebars body-parser

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));


  
const controllers = ['routes'];
for(let i=0; i<controllers.length; i++){
  const ctrl = require('./controllers/'+controllers[i]);

  ctrl.add(server);
}

const port = process.env.PORT | 8080;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
