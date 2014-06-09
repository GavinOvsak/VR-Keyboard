// Generated by CoffeeScript 1.7.1
var LocalStrategy, User, app, bind, codes, db, earliestUndefined, enter, express, featured_apps, fs, getNewSessionID, io, keyOptions, killSession, login, makeKey, makeToken, mongoose, partials, passport, register, secrets, sessions, socket, testName, testPassword, testUser, vOS_App, vOS_Schema;

socket = require('socket.io');

fs = require('fs');

express = require('express');

login = require('connect-ensure-login');

passport = require('passport');

partials = require('express-partials');

mongoose = require('mongoose');

LocalStrategy = require('passport-local').Strategy;

secrets = require('./secrets.json');

mongoose.connect(secrets.mongoURL);

vOS_Schema = mongoose.Schema({
  name: String,
  description: String,
  url: String,
  owner: String
});

vOS_App = mongoose.model('vOS_App', vOS_Schema);

testName = 'Friend';

testUser = 'friend@vos.com';

testPassword = 'I come in peace';

User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
  token: String,
  sessionID: String,
  recent: Array,
  friends: Array
});

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {

  /*User.remove({}, function() {
    console.log('Wiped People')
  })
   */
});

passport.serializeUser(function(user, done) {
  return done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  return User.findOne({
    _id: obj
  }, function(err, person) {
    return done(err, person);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {
  return User.find({
    email: email,
    password: password
  }, function(err, people) {
    if (err) {
      done(err);
    }
    if (people.length === 1) {
      return done(null, people[0]);
    } else {
      return done(null);
    }
  });
}));

app = express();

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');

app.use(partials());

app.use(express.cookieParser());

app.use(express.bodyParser());

app.use(express.errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.use(express.session({
  secret: 'virtual OS secret'
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(app.router);

app.use('/js', express["static"](__dirname + '/js'));

app.use('/Browserify', express["static"](__dirname + '/Browserify'));

app.use('/css', express["static"](__dirname + '/css'));

app.use('/fonts', express["static"](__dirname + '/fonts'));

app.use('/static', express["static"](__dirname + '/public'));

app.get('/latestAPK', function(req, res) {
  var file;
  file = __dirname + '/public/vOS_Controller.apk';
  return res.download(file);
});

app.post('/signin', passport.authenticate('local', {
  failureRedirect: '/fail'
}), function(req, res) {
  return res.redirect('/');
});

register = function(name, email, password, succeed, fail) {
  return User.find({
    email: email
  }, function(err, people) {
    var user;
    if (err) {
      console.log(err);
    }
    if (people.length > 0) {
      if (people[0].password === password) {
        user = people[0];
      } else {
        return fail();
      }
    }
    if (!user && name && password) {
      user = new User({
        name: name,
        email: email,
        password: password,
        recent: ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']
      });
      user.save(function(err, user) {
        if (err) {
          return console.log(err);
        }
      });
    }
    if (user) {
      return succeed(user);
    } else {
      return fail();
    }
  });
};

makeToken = function(done) {
  var token;
  token = '' + Math.floor(Math.random() * Math.pow(10, 10));
  return User.findOne({
    token: token
  }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      return makeToken(done);
    } else {
      return done(token);
    }
  });
};

app.post('/registerAndSignIn', function(req, res) {
  return register(req.body.name, req.body.email, req.body.password, function(user) {
    return req.login(user, function(err) {
      if (err) {
        console.log(err);
      }
      return res.redirect('/');
    });
  }, function() {
    console.log('Email already exists with a different password or there are missing fields');
    return res.redirect('/');
  });
});

app.post('/registerForToken', function(req, res) {
  return register(req.body.name, req.body.email, req.body.password, function(user) {
    return makeToken(function(token) {
      user.token = token;
      user.save(function(err, user) {
        if (err) {
          return console.log(err);
        }
      });
      return res.json(user);
    });
  }, function() {
    console.log('Email already exists with a different password or there are missing fields');
    return res.json('Email already exists with a different password or there are missing fields');
  });
});

app.get('/userFromToken', function(req, res) {
  if (req.query.token != null) {
    return User.findOne({
      token: req.query.token
    }, function(err, user) {
      var publicUser;
      if (err) {
        console.log(err);
      }
      if (user != null) {
        publicUser = {
          name: user.name,
          recent: user.recent,
          id: user._id
        };
        return res.json(publicUser);
      } else {
        console.log(user);
        console.log(req.query.token);
        return res.json();
      }
    });
  }
});

app.get('/signout', function(req, res) {
  req.logout();
  return res.redirect('/');
});

app.post('/recentApps', function(req, res) {
  if (req.query.token != null) {
    return User.findOne({
      token: req.query.token
    }, function(err, user) {
      if (err) {
        console.log(err);
      }
      if ((user != null) && req.body.recent.constructor === Array) {
        user.recent = req.body.recent;
        user.save(function(err, user) {
          if (err) {
            console.log(err);
          }
          return console.log('Successful App Update');
        });
        return res.json(user);
      } else {
        return res.json(req.body);
      }
    });
  } else {
    return res.json(req.body);
  }
});


/*
app.get('/appList', [
  login.ensureLoggedIn('/'),
  (req, res) ->
    vOS_App.find {}, (err, apps) ->
      console.log err if err
 *      console.log(apps)
      res.json apps
])
 */

app.post('/dashboard/update', [
  login.ensureLoggedIn('/'), function(req, res) {
    var newApp, update;
    update = req.body;
    console.log(update);
    if (update.id) {
      return vOS_App.findOne({
        _id: update.id
      }, function(err, app) {
        var key, _i, _len;
        if (err) {
          console.log(err);
        }
        if (app) {
          for (_i = 0, _len = update.length; _i < _len; _i++) {
            key = update[_i];
            app[key] = update[key];
          }
          res.json(app);
          return app.save(function(err, user) {
            if (err) {
              console.log(err);
            }
            return console.log('Successful App Update');
          });
        } else {
          return res.json(void 0);
        }
      });
    } else {
      newApp = new vOS_App({
        name: update.name,
        description: update.description,
        url: update.url,
        owner: req.user._id
      });
      return newApp.save(function(err, user) {
        if (err) {
          console.log(err);
        }
        console.log(user);
        res.json(user);
        return console.log('Successful New App');
      });
    }
  }
]);

app.get('/dashboard', [
  login.ensureLoggedIn('/'), function(req, res) {
    return vOS_App.find({
      owner: req.user._id
    }, function(err, apps) {
      if (err) {
        console.log(err);
      }
      return res.render('dashboard', {
        user: req.user,
        apps: apps
      });
    });
  }
]);

app.get('/appInfo', [
  function(req, res) {
    if (req.query.app_id) {
      return vOS_App.findOne({
        _id: req.query.app_id
      }, function(err, app) {
        if (err) {
          console.log(err);
        }
        return res.json(app);
      });
    } else {
      return res.json(null);
    }
  }
]);

app.get('/all', function(req, res) {
  return vOS_App.find({}, function(err, apps) {
    return res.render('all', {
      user: req.user,
      allApps: apps
    });
  });
});

app.get('/app', function(req, res) {
  return vOS_App.findOne({
    _id: req.query.app_id
  }, function(err, app) {
    if (err != null) {
      console.log(err);
    }
    return res.render('app', {
      user: req.user,
      app: app
    });
  });
});

app.get('/appSearchJSON', function(req, res) {
  console.log(req.query.query);
  if ((req.query.query != null) && req.query.query !== '') {
    return vOS_App.find({
      $or: [
        {
          description: {
            '$regex': '.*' + req.query.query + '.*',
            $options: 'i'
          }
        }, {
          name: {
            '$regex': '.*' + req.query.query + '.*',
            $options: 'i'
          }
        }
      ]
    }).sort({
      '_id': -1
    }).limit(10).exec(function(err, apps) {
      if (err != null) {
        console.log(err);
      }
      return res.json(apps);
    });
  } else {
    return res.json([]);
  }
});

app.get('/appSearch', function(req, res) {
  return vOS_App.find({
    $or: [
      {
        description: {
          '$regex': '.*' + req.query.query + '.*',
          $options: 'i'
        }
      }, {
        name: {
          '$regex': '.*' + req.query.query + '.*',
          $options: 'i'
        }
      }
    ]
  }).sort({
    '_id': -1
  }).limit(10).exec(function(err, apps) {
    if (err != null) {
      console.log(err);
    }
    return res.render('appSearch', {
      user: req.user,
      query: req.query.query,
      results: apps
    });
  });

  /*
  vOS_App.find( {_id: req.query}, function(err, app) {
    console.log(app)
    res.render('appSearch', {
      user: undefined,
      home: false,
      app: app
    })
  })
   */
});

app["delete"]('/app', function(req, res) {
  return vOS_App.remove({
    _id: req.query.app_id
  }, function(err, app) {
    return res.json(app);
  });
});

featured_apps = ['5315354db87e860000a11cbc'];

app.get('/', function(req, res) {
  return vOS_App.findOne({
    _id: featured_apps[0]
  }, function(err, app) {
    if (err != null) {
      console.log(err);
    }
    console.log(app);
    console.log(app.id);
    return res.render('home', {
      user: req.user,
      featured: featured_apps,
      displayApp: app
    });
  });
});

app.get('/documentation', function(req, res) {
  return res.render('documentation', {
    user: req.user
  });
});

app.get('/about', function(req, res) {
  return res.render('about', {
    user: req.user
  });
});

app.get('/try', function(req, res) {
  return res.render('try', {
    user: req.user
  });
});

app.get('/account', [
  login.ensureLoggedIn('/'), function(req, res) {
    return res.render('account', {
      user: req.user
    });
  }
]);

app.get('/debug', function(req, res) {
  var recents, render;
  recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
  render = function(app) {
    return res.render('vOS', {
      user: {
        debug: true
      },
      layout: false,
      session_id: 'debug',
      recentApps: recents,
      token: 'debug',
      app: app
    });
  };
  if (req.query.app_id) {
    return vOS_App.findOne({
      _id: req.query.app_id
    }, function(err, app) {
      return render(app);
    });
  } else {
    return render(void 0);
  }
});

app.get('/local', function(req, res) {
  return res.render('local', {
    user: req.user
  });
});

enter = function(req, res, viewName) {
  var recents;
  console.log('entering');
  console.log(req.query.session_id);
  console.log(sessions);
  if ((req.query.session_id != null) && (sessions[req.query.session_id] != null)) {
    recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
    return User.findOne({
      token: sessions[req.query.session_id].token
    }, function(err, user) {
      if (user != null) {
        recents = user.recents;
      }
      if ((recents == null) || recents.length === 0) {
        recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
      }
      if (req.query.app_id) {
        if (user && (!user.recents || user.recents.indexOf(req.query.app_id === -1))) {
          if (user.recents == null) {
            user.recents = [];
          }
          user.recents.push(req.query.app_id);
          user.save(function(err, user) {
            if (err) {
              console.log(err);
            }
            return console.log('Added New Recent App');
          });
        }
      }
      return vOS_App.findOne({
        _id: req.query.app_id
      }, function(err, app) {
        if (err) {
          console.log(err);
        }
        console.log(app);
        return res.render(viewName, {
          layout: false,
          session_id: req.query.session_id,
          token: sessions[req.query.session_id].token,
          user: user,
          app: app
        });
      });
    });
  } else {
    console.log('going back');
    return res.redirect(req.query.from != null ? req.query.from : '/');
  }
};

app.get('/enterLocal', function(req, res) {
  return enter(req, res, 'localvOS');
});

app.get('/enter', function(req, res) {
  return enter(req, res, 'vOS');
});

io = socket.listen(app.listen(8081));

io.set('log level', 0);

keyOptions = ['2', '3', '4', '6', '7', '9', 'A', 'C', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

codes = {

  /*  "AAA": {socket: websiteSocket, name: name}
   */
};

earliestUndefined = 0;

getNewSessionID = function() {
  while (sessions[earliestUndefined]) {
    earliestUndefined++;
  }
  return earliestUndefined;
};

sessions = [];


/*"1234234": {
  userID: 1,
  input: inputSocket,
  output: outputSocket
}
 */

makeKey = function() {
  var key;
  key = '';
  while (key === '' || codes[key]) {
    key = '';
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)];
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)];
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)];
  }
  return key;
};

bind = function(session) {
  session.input.on('start', function(data) {
    session.output.emit('start', data);
    return console.log('emit: start, ' + data);
  });
  session.input.on('move', function(data) {
    session.output.emit('move', data);
    return console.log('emit: move, ' + data);
  });
  session.input.on('end', function(data) {
    session.output.emit('end', data);
    return console.log('emit: end, ' + data);
  });
  session.input.on('size', function(data) {
    session.output.emit('size', data);
    return console.log('emit: size, ' + data);
  });
  session.input.on('value', function(data) {
    session.output.emit('value', data);
    return console.log('emit: value, ' + data);
  });
  if (session.passVisuals) {
    session.output.on('visual', function(data) {
      return session.input.emit('visual', data);
    });
  }
  return session.input.emit('response', 'ready');
};

killSession = function(session_id) {
  console.log('killing session ' + session_id);
  if (sessions[session_id]) {
    if (sessions[session_id].input != null) {
      sessions[session_id].input.emit('error', 'output disconnected');
    }
    if (sessions[session_id].output != null) {
      sessions[session_id].output.emit('error', 'input disconnected');
    }
    delete sessions[session_id];
    return earliestUndefined = session_id;
  }
};

io.sockets.on('connection', function(socket) {
  socket.on('ping', function(data) {
    return socket.emit('ping-back', data);
  });
  return socket.on('declare-type', function(data) {
    var key, session;
    console.log(data.type);
    if (data.type === 'page') {
      key = makeKey();
      codes[key] = {
        socket: socket,
        name: data.name
      };
      socket.emit('code', {
        code: key,
        name: data.name
      });
      socket.on('disconnect', function() {
        return delete codes[key];
      });
    }
    if (data.type === 'output') {
      console.log('got output');
      if (data.session_id !== void 0 && sessions[data.session_id] !== void 0 && sessions[data.session_id].output === void 0) {
        session = sessions[data.session_id];
        session.output = socket;
        console.log('binding');
        bind(session);
        session.output.on('disconnect', function() {
          return killSession(data.session_id);
        });
      } else {
        socket.emit('error', 'incorrect session id');
      }
    }
    if (data.type === 'input') {
      return socket.on('code', function(raw) {
        var code, newSessionID;
        console.log('got code');
        console.log(raw);
        code = raw.toUpperCase();
        if (codes[code] !== void 0) {
          newSessionID = getNewSessionID();
          User.findOne({
            token: data.token
          }, function(err, user) {
            if (err) {
              console.log(err);
            }
            if (user) {
              user.sessionID = newSessionID;
              return user.save(function(err, user) {
                if (err) {
                  return console.log(err);
                }
              });
            }
          });
          sessions[newSessionID] = {
            token: data.token,
            input: socket,
            passVisuals: data.passVisuals != null ? data.passVisuals : true
          };
          console.log('New session at ' + newSessionID);
          socket.on('disconnect', function() {
            return killSession(newSessionID);
          });
          socket.on('connection', function(status) {
            if (status === 'cancelled') {
              return killSession(newSessionID);
            }
          });
          socket.emit('response', 'correct pair code');
          codes[code].socket.emit('session_id', {
            id: newSessionID,
            name: codes[code].name
          });
          return delete codes[code];
        } else {
          return socket.emit('error', 'incorrect pair code');
        }
      });
    }
  });
});
