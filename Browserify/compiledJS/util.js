// Generated by CoffeeScript 1.7.1
var eccentricity, util;

util = exports;

eccentricity = 80 / 30;

util.makeCircle = function(amplitude) {
  var circle_geometry, circle_resolution, greenLine, j, theta, _i;
  circle_resolution = 40;
  greenLine = new THREE.LineBasicMaterial({
    color: 0x999999,
    linewidth: 2
  });
  circle_geometry = new THREE.Geometry();
  for (j = _i = 0; 0 <= circle_resolution ? _i <= circle_resolution : _i >= circle_resolution; j = 0 <= circle_resolution ? ++_i : --_i) {
    theta = (j / circle_resolution) * Math.PI * 2;
    circle_geometry.vertices.push(new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta) * eccentricity, 0));
  }
  return new THREE.Line(circle_geometry, greenLine);
};

util.makeFullCircle = function(amplitude) {
  var circle, circle_resolution, geometry, green, j, theta, x, y, _i;
  circle_resolution = 40;
  green = new THREE.LineBasicMaterial({
    color: 0x333333
  });
  circle = new THREE.Shape();
  for (j = _i = 0; 0 <= circle_resolution ? _i <= circle_resolution : _i >= circle_resolution; j = 0 <= circle_resolution ? ++_i : --_i) {
    theta = (j / circle_resolution) * Math.PI * 2;
    x = amplitude * Math.cos(theta);
    y = amplitude * Math.sin(theta) * eccentricity;
    if (j === 0) {
      circle.moveTo(x, y);
    } else {
      circle.lineTo(x, y);
    }
  }
  geometry = circle.makeGeometry();
  return new THREE.Mesh(geometry, green);
};

util.exportMesh = function(mesh) {
  var result, _ref, _ref1;
  result = {};
  result.vertices = mesh.geometry.vertices;
  if (mesh.material.color != null) {
    result.color = mesh.material.color;
  }
  result.dataURI = (_ref = mesh.material.map) != null ? (_ref1 = _ref.image) != null ? _ref1.toDataURL("image/jpeg") : void 0 : void 0;
  result.position = {
    x: mesh.position.x,
    y: mesh.position.y,
    z: mesh.position.z
  };
  return result;
};

util.cloneMesh = function(mesh) {
  var copy;
  copy = new THREE.Mesh(mesh.geometry.clone(), mesh.material.clone());
  if (copy.material.map != null) {
    copy.material.map = mesh.material.map.clone();
    copy.material.map.needsUpdate = true;
  }
  copy.position = mesh.position.clone();
  if (mesh.geometry.height != null) {
    copy.position.y += mesh.geometry.height / 2;
  }
  if (mesh.geometry.width != null) {
    copy.position.x += mesh.geometry.width / 2;
  }
  return copy;
};

util.cloneLine = function(line) {
  var copy;
  copy = new THREE.Line(line.geometry.clone(), line.material.clone());
  copy.position = line.position.clone();
  return copy;
};

util.makeText = function(text, px, width, height) {
  var canvas1, context1, material1, texture1;
  canvas1 = document.createElement('canvas');
  canvas1.height = px + 10;
  canvas1.width = canvas1.height * width / height * 2;
  context1 = canvas1.getContext('2d');
  context1.font = 'Bold ' + px + ' px Arial';
  context1.fillStyle = 'rgba(255,255,255,0.95)';
  context1.fillText(' ' + text, 0, px);
  texture1 = new THREE.Texture(canvas1);
  texture1.needsUpdate = true;
  material1 = new THREE.MeshBasicMaterial({
    map: texture1,
    side: THREE.DoubleSide
  });
  material1.transparent = true;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1);
};

util.setPanelPosition = function(board, Mesh, x_disp, y_disp, z_disp) {
  var adjusted_x_disp, adjusted_y_disp, height, width;
  width = 0;
  height = 0;
  if (Mesh.geometry.width != null) {
    width = Mesh.geometry.width * board.geometry.width;
  }
  if (Mesh.geometry.height != null) {
    height = Mesh.geometry.height * board.geometry.height;
  }
  Mesh.scale.x = board.geometry.width;
  Mesh.scale.y = board.geometry.height;
  adjusted_x_disp = board.geometry.width * (x_disp - 0.5) + width / 2;
  adjusted_y_disp = board.geometry.height * (y_disp - 0.5) + height / 2;
  Mesh.position.x = board.position.x + adjusted_x_disp;
  Mesh.position.y = board.position.y + adjusted_y_disp * Math.cos(board.rotation.x) - z_disp * Math.sin(board.rotation.x);
  Mesh.position.z = board.position.z + adjusted_y_disp * Math.sin(board.rotation.x) + z_disp * Math.cos(board.rotation.x);
  return Mesh.rotation.x = board.rotation.x;
};

util.inRange = function(test, start, span) {
  return (start < test && test < start + span);
};

util.rectContains = function(point, x, y, width, height) {
  return util.inRange(point.x, x, width) && util.inRange(point.y, y, height);
};

util.vector = function(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y
  };
};

util.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};

util.length = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};

util.distance = function(a, b) {
  return util.length(util.vector(a, b));
};

util.angle = function(a, b) {
  return Math.acos(util.dot(a, b) / (util.length(a) * util.length(b)));
};

util.rotate = function(a, theta) {
  return {
    x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
    y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
  };
};

util.add = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
};

util.scale = function(a, x_scale, y_scale) {
  return {
    x: a.x * x_scale,
    y: a.y * y_scale
  };
};

util.angleRangeDeg = function(angle) {
  angle %= 360;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
};

util.angleRangeRad = function(angle) {
  angle %= 2 * Math.PI;
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
};

util.deltaAngleDeg = function(a, b) {
  return Math.min(360 - (Math.abs(a - b) % 360), Math.abs(a - b) % 360);
};

util.toggleFullScreen = function() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      return document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      return document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      return document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      return document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      return document.webkitCancelFullScreen();
    }
  }
};

util.getScriptSync = function(url, callback) {
  return $.ajax({
    async: false,
    type: 'GET',
    url: url,
    data: null,
    success: callback,
    dataType: 'script',
    timeout: 500
  });
};

util.getSync = function(url, callback) {
  return $.ajax({
    async: false,
    url: url,
    success: callback
  });
};

util.getAsync = function(url, callback) {
  return $.ajax({
    async: true,
    url: url,
    success: callback
  });
};

util.match = function(oPath, word, probs) {

  /* Checks if a word is present in a path or not. */
  var i, index, letters, path, score, totalIndex, _i, _ref;
  letters = word.split('');
  score = 1;
  totalIndex = 0;
  path = oPath;
  for (i = _i = 0, _ref = letters.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    index = path.indexOf(letters[i]);
    if (index < 0) {
      return 0;
    }
    score *= probs[totalIndex + index];
    totalIndex += index + 1;
    path = path.substring(index + 1);
  }
  return score;
};

util.get_keyboard_row = function(char) {
  var keyboardLayout, row_no, _i, _ref, _ref1;
  keyboardLayout = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  for (row_no = _i = 0, _ref = keyboardLayout.length; 0 <= _ref ? _i < _ref : _i > _ref; row_no = 0 <= _ref ? ++_i : --_i) {
    if (((_ref1 = keyboardLayout[row_no]) != null ? _ref1.indexOf(char) : void 0) >= 0) {
      return row_no;
    }
  }
};

util.compress = function(sequence) {
  var i, ret_val, _i, _ref;
  ret_val = [sequence[0]];
  for (i = _i = 0, _ref = sequence.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    if (ret_val[ret_val.length - 1] !== sequence[i]) {
      ret_val.push(sequence[i]);
    }
  }
  return ret_val;
};

util.get_minimum_wordlength = function(path) {

  /*
  Returns the minimum possible word length from the path.
  Uses the number of transitions from different rows in 
  the keyboard layout to determin the minimum length
   */
  var compressed_row_numbers, row_numbers;
  row_numbers = path.split('').map(util.get_keyboard_row);
  compressed_row_numbers = util.compress(row_numbers);
  return compressed_row_numbers.length - 3;
};

util.get_suggestion = function(state, path, probs) {

  /* Returns suggestions for a given path. */
  var filtered, i, matchScore, min_length, suggestions, _i, _ref;
  if (path.length === 0) {
    return [];
  }
  filtered = state.wordlist.filter(function(x) {
    return x[x.length - 1] === path[path.length - 1].toLowerCase();
  });
  suggestions = [];
  matchScore = 0;
  for (i = _i = 0, _ref = filtered.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    matchScore = util.match(path.toLowerCase(), filtered[i], probs);
    if (matchScore > 0) {
      suggestions.push({
        word: filtered[i],
        score: matchScore
      });
    }
  }
  min_length = util.get_minimum_wordlength(path.toLowerCase());
  suggestions = suggestions.filter(function(x) {
    return x.word.length > min_length;
  });
  return suggestions;
};
