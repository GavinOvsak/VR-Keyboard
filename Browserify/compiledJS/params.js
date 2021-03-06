// Generated by CoffeeScript 1.7.1
var params;

params = exports;

params.check = function(state, util, controls) {
  var i, items, kvpair, paramList, setUpUser, _i, _ref;
  paramList = {};
  items = window.location.search.substring(1).split("&");
  for (i = _i = 0, _ref = items.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    kvpair = items[i].split("=");
    paramList[kvpair[0]] = unescape(kvpair[1]);
  }
  if (paramList['from'] != null) {
    state.fromURL = decodeURIComponent(paramList['from']);
  }
  state.mode = state.modes.AppSwitch;
  setUpUser = function() {
    var appID, _j, _len, _ref1, _results;
    state.apps = [];
    window.Controls = controls;
    _ref1 = state.user.recent;
    _results = [];
    for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
      appID = _ref1[_j];
      console.log('Geting ' + appID);
      _results.push(util.getSync('/appInfo?app_id=' + appID, function(appData, textStatus, jqxhr) {
        if (appData != null) {
          console.log('Adding ' + appData.url);
          return state.addURL(appData.url, appData, false);
        }
      }));
    }
    return _results;
  };
  if (token !== '') {
    util.getSync('/userFromToken?token=' + token, function(data) {
      if ((data != null ? data.recent : void 0) != null) {
        state.user = data;
        return setUpUser();
      }
    });
  }
  if (paramList['app_id'] != null) {
    return util.getSync('/appInfo?app_id=' + paramList['app_id'], function(appData, textStatus, jqxhr) {
      if (appData != null) {
        return state.addURL(appData.url, appData, true);
      }
    });

    /*
      window.testApps[appID] = {
        event: {}
      }
      util.getSync(appURL, (data, textStatus, jqxhr) ->
        ((vOS, program) ->
            eval(program)
        )({
          onEvent: (eventType, f) ->
            window.testApps[appID].event[eventType] = f
          makeTextMesh: (options) ->
            return {} #To Do
        })
        if window.testApps[appID].event.load?
          state.add(window.testApps[appID], controls)
        else
          console.log('App from ' + appURL + ' Failed To Load')
      )
     */

    /*
       *debugger;
      window.vOS = {
        onEvent: (eventType, f) ->
          this.app.event[eventType] = f
        getValues: ->
          return state.values
        makeTextMesh: (options) ->
          text = options.text or ''
          px = options.px or 30
          width = options.width or 20
          height = options.height or 20
          textMesh = util.makeText(text, px, width, height)
          textMesh.rotation.x = Math.PI/2
          textMesh.position.z = 50 + (options.y or 0)
          textMesh.position.x = 0 + (options.x or 0)
          return textMesh
        getValue: (name) ->
          return state.values[name]
        addListener: (name, f) ->
          unless state.valueListeners[name]?
            state.valueListeners[name] = []
          state.valueListeners[name].push(f)
        removeListener: (name, f) ->
          index = state.valueListeners[name].indexOf(f)
          if index > -1
            state.valueListeners[name].pop(index)
        app: {
          event: {}
        }
      }
      util.getScriptSync(appURL, (data, textStatus, jqxhr) ->
        if vOS.app.event.load?
          for k, v of appData
            vOS.app[k] = v
          state.add(vOS.app, controls)
        else
          console.log('App from ' + appURL + ' Failed To Load')
         *window.app
        window.vOS.app = {
          event: {}
        }
      )
    )(state, controls, appQueryURL)
     */

    /*
    ((state, controls, appURL) ->
      app = {event: {}}
      window.Controls = controls
      window.vOS = {
        onEvent: (eventType, f) ->
          app.event[eventType] = f
        makeTextMesh: (options) ->
          return {} #To Do
      }
    
      util.getScriptSync(appURL, ->
        delete window.app
        delete window.vOS
      )
      if app.event.load?
        state.add(app, controls)
      else
        console.log('App from ' + appURL + ' Failed To Load..')
    )(state, controls, appQueryURL)
     */
  }
};
