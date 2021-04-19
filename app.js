var env = process.env.NODE_ENV;


var express = require('express');
var http = require('http');
var logger = require('morgan');
var passport  = require('passport');
var config = require('./config/database');
var mongoose = require('mongoose');

var path = require('path');
var handlebars  = require('express-handlebars');

var session = require('express-session')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs')

var cors = require('cors')

// conect database
mongoose.connect(config.database,{useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true})
        .then(() => console.log( 'Database Connected' ))
        .catch(err => console.log( err ));

var app = express();

// body parser
app.use(cookieParser());
app.use(bodyParser.json({limit: '2mb'}) );
app.use(bodyParser.urlencoded({
  limit: '2mb',
  extended: true,
  parameterLimit:30
}));


app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport)

app.set('views', path.resolve(__dirname, 'views'));
var hbs = handlebars.create({
   defaultLayout: 'main'
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// add route to app
var server = http.createServer(app);
fs.readdirSync('./controllers').forEach(function (controller) {
  if(controller.substr(-3) === '.js') {
    var routeApi = require('./controllers/' + controller);
    routeApi(app); //Pass it here
  }
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, token"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  next();
});

// handle not found route
app.use(function(req,res){
    res.status(200).send({success: false, msg: 'Route not found.'});
 });
app.set('port',process.env.PORT || 4000);
// start server
server.listen(app.get('port'), function(){
    console.log('The App Store server listening on port ' + app.get('port') + ' and NODE_ENV: ' + env);
  });