require("dotenv").config({ path: './Core/.env' });
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const Handlebars = require('handlebars');
const session = require('express-session');

let indexRouter = require('./routes/index');
let registerRouter = require('./routes/register');
let booksRouter = require('./routes/books');
let loginRouter = require('./routes/login');
let logoutRouter = require('./routes/logout');

let app = express();

// view engine setup
let handlebars = require('express-handlebars').create({
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  defaultLayout: 'layout',
  extname: 'hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    'select': function (selected, options) {
      return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
    }
  }
});

app.set('view engine', 'hbs');

app.engine('hbs', handlebars.engine);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // se debe configurar `secure` a `true` si se usa HTTPS
}));

app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/books', booksRouter);

app.use((req, res, next) => {
  const token = req.cookies['user-token'];
  const userData = req.cookies['user-data'];
  if (token && userData) {
    req.user = userData; // Asigna la información del usuario desde la cookie
    res.locals.user = req.user; // Hace que `user` esté disponible en todas las vistas
  }
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
