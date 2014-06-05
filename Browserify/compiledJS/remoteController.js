// Generated by CoffeeScript 1.7.1
var remoteController;

remoteController = exports;

remoteController.setUp = function(state, util) {
  var Point, checkGrab;
  Point = function(x, y, i) {
    this.start = {
      x: x,
      y: y
    };
    this.x = x;
    this.y = y;
    this.i = i;
    this.taken = false;
    this.onRelease_callback = function() {};
    this.release = function(x, y, i) {
      return this.onRelease_callback(x, y, i);
    };
    this.onRelease = function(callback) {
      return this.onRelease_callback = callback;
    };
    this.onMove_callback = function(x, y, i) {};
    this.move = function(x, y, i) {
      this.x = x;
      this.y = y;
      return this.onMove_callback(x, y, i);
    };
    this.onMove = function(callback) {
      return this.onMove_callback = callback;
    };
    return void 0;
  };
  checkGrab = function(point) {
    var object, objects, panelApp, _i, _len, _results;
    panelApp = state.getPanelApp();
    if (state.topBar.state !== 'moving') {
      if (state.topBar.available && state.topBar.contains(point.x, point.y)) {
        state.topBar.registerPoint(point);
        point.taken = true;
      }
      objects = [];
      switch (state.mode) {
        case state.modes.Normal:
          objects = objects.concat(panelApp.panel.objects);
          break;
        case state.modes.AppSwitch:
          objects = objects.concat(state.appSwitcher.panel.objects);
          break;
        case state.modes.Notifications:
          objects = objects.concat(state.notificationPanel.objects);
      }
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        if (object.available && object.contains(point.x, state.topBar.state === 'overlay' ? point.y : point.y - 1 / 12)) {
          object.registerPoint(point);
          _results.push(point.taken = true);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };
  state.socket = io.connect('/');
  state.socket.on('disconnect', function() {
    if (sessionId !== 'debug') {
      return window.location = state.fromURL;
    }
  });
  state.socket.emit('declare-type', {
    type: 'output',
    session_id: sessionId
  });
  state.socket.on('error', function(result) {
    if (sessionId !== 'debug') {
      return window.location = state.fromURL;
    }
  });
  state.socket.on('size', function(data) {
    return state.deviceDimensions = {
      width: JSON.parse(data).width,
      height: JSON.parse(data).height
    };
  });
  state.socket.on('value', function(data) {
    var listener, name, parsed, value, _results;
    parsed = JSON.parse(data);
    _results = [];
    for (name in parsed) {
      value = parsed[name];
      state.values[name] = value;
      if (state.valueListeners[name]) {
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = state.valueListeners[name];
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            listener = _ref[_i];
            _results1.push(listener(value));
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
  state.socket.on('start', function(data) {
    var parsed, point;
    parsed = JSON.parse(data);
    point = new Point(parsed.x, parsed.y, parsed.i);
    state.points[parsed.i] = point;
    return checkGrab(point);
  });
  state.socket.on('move', function(data) {
    var parsed, point;
    parsed = JSON.parse(data);
    point = state.points[parsed.i];
    if (point != null) {
      point.move(parsed.x, parsed.y, parsed.i);
      if (!point.taken) {
        return checkGrab(point);
      }
    }
  });
  return state.socket.on('end', function(data) {
    var parsed, point;
    parsed = JSON.parse(data);
    point = state.points[parsed.i];
    if (point != null) {
      point.release(parsed.x, parsed.y, parsed.i);
      return state.points[parsed.i] = {};
    }
  });
};
