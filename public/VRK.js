var VRK = {};

var makeText = function(text, px, width, height) {
	var canvas1 = document.createElement('canvas');
	canvas1.height = px+10;
	canvas1.width = width * 700;
    var context1 = canvas1.getContext('2d');
    context1.font = "Bold " + px + "px Arial";
    context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText(" " + text, 0, px);
    var texture1 = new THREE.Texture(canvas1) 
    texture1.needsUpdate = true;
    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
    material1.transparent = true;
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1);
};

VRK.Button = function(x, y, width, height, text, text_size, opt_image) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.text = text || '';
	this.image = opt_image;
	if (text_size != undefined) {
		this.px = text_size;
	} else {
		this.px = 30;
	}
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.available = true;
	this.threshold_distance = 0.1;
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.point = undefined;
	this.contains = function(x, y) {
		return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
	};
	this.onClick_callback = function(){};
	this.click = function(){
		this.onClick_callback();
	};
	this.onClick = function(callback) {
		this.onClick_callback = callback;
	};
	this.release = function(x, y) {
		if (this.dragDistance() > this.threshold_distance) {
			this.click();
		}
		this.available = true;
		this.point = undefined;
	};
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.point = point;
		point.onRelease(this.release.bind(this));
		this.available = false;
	};
	this.draw = function(scene, board) {
		//change color based on distance
		var distance = this.dragDistance();
		var percentClicked = Math.min(distance/this.threshold_distance, 1);

		var materialOptions = {};
		if (this.point != null) {
			materialOptions.color = (0 << 16) + (200*(1-percentClicked) << 8) + percentClicked*255;
		} else {
			materialOptions.color = (0 << 16) + (200 << 8) + 0;
		}

		var material = new THREE.MeshLambertMaterial(materialOptions);

		buttonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height),
			material);

		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);

		scene.add(buttonMesh);

		var canvas1 = document.createElement('canvas');
		
		if (this.text != '') {
			var contentMesh = makeText(this.text, this.px, this.width, this.height);
		    setKeyboardPosition(board, contentMesh, this.x, this.y, 0.2);
	        scene.add( contentMesh );
		} else if (this.image != undefined) {
	        canvas1.height = 200;
			canvas1.width = 200;
        	var context1 = canvas1.getContext('2d');
       		var texture1 = new THREE.Texture(canvas1) 
			var imageObj = new Image();
	        imageObj.src = this.image;
	        imageObj.onload = function()
	        {
	        	/*
	            context1.drawImage(imageObj, 0, 0);
	            if ( texture1 ) {
	                texture1.needsUpdate = true;
				    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
				    material1.transparent = true;
				    var contentMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
				    setKeyboardPosition(board, contentMesh, this.x, this.y, 0.2);
			        scene.add( contentMesh );
			    }*/
	        };  
		}
	}
};

VRK.LinearSlider = function(x, y, width, height, returnsToCenter, direction, initProgress) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.direction = direction;
	if (this.direction == undefined) {
		this.direction = VRK.LinearSlider.direction.VERTICAL;
	}
	if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
		this.line_width = 0.1 * unitWidth;
		this.grip_width = width * unitWidth;
		this.grip_height = 0.5 * unitHeight;
	} else if (this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
		this.line_width = 0.1 * unitHeight;
		this.grip_width = height * unitHeight;
		this.grip_height = 0.5 * unitWidth;
	}

	if (initProgress != undefined) {
		this.progress = initProgress;
	} else {
		this.progress = 0.5;
	}

	this.returnsToCenter = returnsToCenter;

	this.initGrab = {
		x: 0,
		y: 0,
		progress: 0
	};

	this.available = true;
	this.point = undefined;
	this.getProgress = function() {
		if (this.point != null) {
			if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
				this.progress = this.initGrab.progress + (this.point.y - this.initGrab.y)/(this.height - this.grip_height);
			} else if(this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
				this.progress = this.initGrab.progress + (this.point.x - this.initGrab.x)/(this.width - this.grip_height);
			}
		}
		this.progress = Math.max(Math.min(this.progress, 1), 0);
		return this.progress;
	}
	this.contains = function(x, y) {
		if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
			return x > this.x && x < this.x + this.grip_width && 
				y > this.y + (this.height - this.grip_height) * this.progress && 
				y < this.y + (this.height - this.grip_height) * this.progress + this.grip_height;
		} else if (this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
			return y > this.y && y < this.y + this.grip_width && 
				x > this.x + (this.width - this.grip_height) * this.progress && 
				x < this.x + (this.width - this.grip_height) * this.progress + this.grip_height;
		}
	};
	this.onRelease_callback = function(progress) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	};
	this.setProgress = function(progress) {
		this.progress = progress;
	};
	this.release = function(x, y) {
		this.onRelease_callback(this.getProgress());
		if (this.returnsToCenter) {
			this.progress = 0.5;
		}
		this.available = true;
		this.point = undefined;
	}
	this.onMove_callback = function(progress) {};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	}
	this.move = function(x, y) {
		this.onMove_callback(this.getProgress());
	}
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.initGrab.progress = this.progress;
		this.point = point;
		point.onRelease(this.release.bind(this));
		point.onMove(this.move.bind(this));
		this.available = false;
	};
	this.draw = function(scene, board) {
		//Draw line and then draw grip on top.
		var line_material = new THREE.MeshLambertMaterial({color: 0x222222});
		var grip_material = new THREE.MeshLambertMaterial({color: 0x224222});

		if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
			var line = new THREE.Mesh(
				new THREE.PlaneGeometry(this.line_width, this.height), line_material);
			setKeyboardPosition(board, line, this.x + (this.width - this.line_width)/2, this.y, 0.1);
			var gripMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.grip_width, this.grip_height), grip_material);
			setKeyboardPosition(board, gripMesh, this.x + (this.width - this.grip_width)/2, this.y + (this.height - this.grip_height) * this.progress, 0.11);
		} else if (this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
			var line = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.line_width), line_material);
			setKeyboardPosition(board, line, this.x, this.y + (this.height - this.line_width)/2, 0.1);
			var gripMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.grip_height, this.grip_width), grip_material);
			setKeyboardPosition(board, gripMesh, this.x + (this.width - this.grip_height) * this.progress, this.y + (this.height - this.grip_width)/2, 0.11);
		}
		scene.add(line);
		scene.add(gripMesh);
	};
};

VRK.LinearSlider.direction = {
	VERTICAL: 'vertical',
	HORIZONTAL: 'horizontal'
};

/*
VRK.ArcSlider = function(x, y, returnsToCenter, radius, beginAngle, endAngle) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.returnsToCenter = returnsToCenter;
	this.radius = radius;
	this.beginAngle = beginAngle;
	this.endAngle = endAngle;
	this.progress = this.beginAngle;
	
	this.grip_width = 0.5*unitWidth;
	this.grip_height = this.grip_width / 3;
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.available = true;
	this.point = undefined;
	this.getProgress = function() {
		if (this.point != null) {
			this.progress = Math.min(Math.max(Math.atan2(this.point.x - this.x, 
				this.point.y - this.y), this.beginAngle), this.endAngle);
		}
		return this.progress;
	}
	this.contains = function(x, y) {
		return false;
	};
	this.onRelease_callback = function(progress) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	};
	this.release = function(x, y) {
		this.onRelease_callback(this.getProgress());
		this.available = true;
		this.point = undefined;
	}
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.point = point;
		point.onRelease(this.release.bind(this));
		this.available = false;
	};
	this.onMove_callback = function(progress) {};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	}
	this.move = function(x, y) {
		this.onMove_callback(this.getProgress());
	}
	this.draw = function(scene, board) {
		//Draw line and then draw grip on top.
		var material = new THREE.MeshLambertMaterial({color: 0x222222});
		buttonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height), material);
		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);
		scene.add(buttonMesh);
		//draw this.text;
	};
};
*/

VRK.Treadmill = function(x, y, width, height, options){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.options = options; //Array of strings

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.available = true;
	this.max_fingers = 2;//Could modify later to handle more

	this.state = {
		x: 0,
		y: 0,
		angle: 0,
		zoom: 1
	};
	this.startState = {
		x: 0,
		y: 0,
		angle: 0,
		zoom: 1
	};
	this.grabInfo = {
		x: 0,
		y: 0,
		angle: 0,
		zoom: 1
	};
	this.points = {};
	this.cloneState = function(state) {
		return {
			x: state.x,
			y: state.y,
			angle: state.angle,
			zoom: state.zoom,
		};
	};
	this.contains = function(x, y) {
		return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
	};
	this.onRelease_callback = function(progress) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	};
	this.release = function(x, y, i) {
		this.onRelease_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
		this.available = true;
		this.startState = {
			x: this.state.x,
			y: this.state.y,
			angle: this.state.angle,
			zoom: this.state.zoom
		};
		delete this.points[i];
		this.setGrabInfo();
	};
	this.getTouchAngle = function() {
		if (Object.keys(this.points).length < 2) {
			return 0;
		} else if (this.points[0] != undefined && this.points[1] != undefined){
			return Math.atan2(this.points[0].x - this.points[1].x, this.points[0].y - this.points[1].y);
		}
		return 0;
	};
	this.getTouchCenter = function() {
		var x = 0;
		var y = 0;

		for (i in this.points) {
			if (this.points[i] != undefined) {
				x += this.points[i].x;
				y += this.points[i].y;
			}
		}
		return {
			x: x/Math.max(1, Object.keys(this.points).length),
			y: y/Math.max(1, Object.keys(this.points).length)		
		};
	};
	this.getTouchSeparation = function() {
		if (Object.keys(this.points).length < 2) {
			return 1;
		} else if (this.points[0] != undefined && this.points[1] != undefined) {
			return distance(this.points[0], this.points[1]);
		}
	};
	this.setGrabInfo = function() {
		var center = this.getTouchCenter();
		this.grabInfo = {
			x: center.x,
			y: center.y,
			angle: this.getTouchAngle(),
			zoom: this.getTouchSeparation()
		};
	};
	this.registerPoint = function(point) {
		this.startState = this.cloneState(this.state);
		this.points[point.i] = point;
		this.setGrabInfo();
		point.onRelease(this.release.bind(this));
		point.onMove(this.move.bind(this));
		if (Object.keys(this.points).length >= this.max_fingers)
			this.available = false;
	};
	this.getNewState = function() {
		var isContained = function(array, item) {
			return array.indexOf(item) >= 0;
		}
		var options = VRK.Treadmill.option;
		var newState = this.cloneState(this.startState);
		if (isContained(this.options, options.Rotate)) {
			newState.angle = this.startState.angle + this.getTouchAngle() - this.grabInfo.angle;
		}
		var disp = vector(this.getTouchCenter(), this.grabInfo);
		if (isContained(this.options, options.X)) {
			newState.x = this.startState.x + disp.x * Math.cos(newState.angle) - disp.y * Math.sin(newState.angle);
		}
		if (isContained(this.options, options.Y)) {
			newState.y = this.startState.y + disp.x * Math.sin(newState.angle) + disp.y * Math.cos(newState.angle);
		}
		if (isContained(this.options, options.Zoom) >= 0 || 
			(isContained(this.options, options.ZoomIn) >= 0 && this.grabInfo.zoom > this.getTouchSeparation()) ||
			(isContained(this.options, options.ZoomOut) >= 0 && this.grabInfo.zoom < this.getTouchSeparation())) {
			newState.zoom = this.startState.zoom * this.grabInfo.zoom / this.getTouchSeparation();
		}
		return newState;
	};
	this.onMove_callback = function(x, y, angle, zoom) {};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	};
	this.move = function(x, y, angle, zoom) {
		this.state = this.getNewState();
		this.onMove_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
	};
	this.draw = function(scene, board) {
		var material = new THREE.MeshLambertMaterial({color: 0x222222});
		treadMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height),
			material);
		setKeyboardPosition(board, treadMesh, this.x, this.y, 0.1);
		scene.add(treadMesh);


		//Draw Lines to show movement
		//start with vertical lines. Ideally would draw only what is needed. Use modulus.

		//Shift then rotate?

		//Line is a point and a direction. Write function to take it in along with bounds to crop.

	};
};

VRK.Treadmill.option = {
	X: 'x',
	Y: 'y',
	Rotate: 'rotate',
	Zoom: 'Zoom',
	ZoomIn: 'Zoom In',
	ZoomOut: 'Zoom Out'
};

VRK.Label = function(x, y, width, height, text, px){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width/12;
	this.height = height/9;
	this.text = text;
	this.px = px || 30;
	this.contains = function(x, y) {
		return false;
	};
	this.draw = function(scene, board) {
		var material = new THREE.MeshLambertMaterial({color: 0x222222});

		buttonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height), material);

		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);

		scene.add(buttonMesh);
		
		var canvas1 = document.createElement('canvas');
		canvas1.height = this.px;
		canvas1.width = 100;
        var context1 = canvas1.getContext('2d');
        context1.font = "Bold " + this.px + "px Arial";
        context1.fillStyle = "rgba(255,255,255,0.95)";
	    context1.fillText(this.text, 0, this.px);
        var texture1 = new THREE.Texture(canvas1) 
        texture1.needsUpdate = true;
	    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
	    material1.transparent = true;
	    var textmesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
	    
	    setKeyboardPosition(board, textmesh, this.x, this.y, 0.2);
        scene.add(textmesh);
	};
};

VRK.KeyboardObject = function(x, y, width, height){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width;
	this.height = height;
	this.contains = function(x, y) {
		return false;
	};
	this.draw = function(scene, board) {
		var material = new THREE.MeshLambertMaterial({color: 0x222222});

		buttonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height),
			material);

		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);

		scene.add(buttonMesh);
	};
};

//moves whole keyboard down when dragged. When buttons are pressed, changes state
VRK.SystemBar = function(x, y, width, height){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.buttonPosition = {
		'inClose': 0 * unitWidth,
		'inNotifications': 1 * unitWidth,
		'inAppSwitch': 10 * unitWidth,
		'inMaxMin': 11 * unitWidth
	};
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.available = true;
	this.point = undefined;
	this.buttonSelected = undefined;
	this.contains = function(x, y) {
		var which = this.whichButton(x, y);
		return which != 'none';
	};
	this.moving = false;
	this.threshold_distance = 0.1;
	this.whichButton = function(x,y) {
		if (kM.hidden) {
			return 'hideBar';
		} else {
			if (y > this.y) {
				if (x > 2 * unitWidth && x < 10 * unitWidth) {
					return 'hideBar';
				}
				for (state in this.buttonPosition) {
					if (x > this.buttonPosition[state] && x < this.buttonPosition[state] + unitWidth) {
						switch (state) {
							case 'inClose':
								if (kM.getKeyboardApp()) {
									return state;
								}
								break;
							case 'inNotifications':
								return state;
								break;
							case 'inAppSwitch':
								return state;
								break;
							case 'inMaxMin':
								if (kM.canMinimize() || kM.canMaximize()) {
									return state;
								}
								break;
						}
					}
				}
			}
			return 'none';
		}
	}
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.release = function(x, y) {
		//if far enough, click.
		if (this.buttonPosition[this.buttonSelected] != undefined && this.dragDistance() > this.threshold_distance) {
			this.click(this.buttonSelected);
		} else if (this.buttonSelected == 'hideBar') {
			if (y > 0.5) {
				kM.hidden = false;
			} else {
				kM.hidden = true;
			}
		}
		this.available = true;
		this.point = undefined;
		this.moving = false;
		this.buttonSelected = 'none';
	};
	this.click = function(buttonName){
		switch(buttonName) {
			case 'inClose':
				if (kM.state == kM.State.Normal) {
					kM.close();
				} else {
					kM.state = kM.State.Normal;
				}
				break;
			case 'inNotifications':
				kM.state = kM.State.Notifications;
				break;
			case 'inAppSwitch':
				kM.state = kM.State.AppSwitch;
				break;
			case 'inMaxMin':
				kM.toggleMaxMin();
				break;
		}
	};
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.buttonSelected = this.whichButton(point.x, point.y);
		if (this.buttonSelected == 'hideBar') {
			this.moving = true;
		}
		this.point = point;
		point.onRelease(this.release.bind(this));
		this.available = false;
	};
	this.draw = function(scene, board) {
		var distance = this.dragDistance();
		var percentClicked = Math.min(distance/this.threshold_distance, 1);

		if (!kM.hidden || this.buttonSelected == 'hideBar') {
			var barMaterial = new THREE.MeshLambertMaterial({color: 0x00CC00});

			var barMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height), barMaterial);
			
			var adjusted_y = this.y;
			if (kM.hidden) {
				adjusted_y = 0;
				if (this.point != undefined) {
					adjusted_y = this.point.y - this.initGrab.y;
				}
			} else {
				if (this.point != undefined && this.buttonSelected == 'hideBar') {
					adjusted_y = this.y + (this.point.y - this.initGrab.y);
				}
			}

			setKeyboardPosition(board, barMesh, this.x, adjusted_y, 0.1);
			scene.add(barMesh);

			if (this.buttonSelected != 'none' && this.buttonSelected != 'hideBar') {
				//change color based on distance
				setKeyboardPosition(board, barMesh, this.x, adjusted_y, 0.1);
				var materialOptions = {color: 0x00CC00};
				if (this.point != null) {
					materialOptions.color = (0 << 16) + (200 * (1 - percentClicked) << 8) + percentClicked * 255;
				}

				var buttonMaterial = new THREE.MeshLambertMaterial(materialOptions);
				var buttonMesh = new THREE.Mesh(
					new THREE.PlaneGeometry(unitWidth, unitHeight), buttonMaterial);

				setKeyboardPosition(board, buttonMesh, this.x + this.buttonPosition[this.buttonSelected], adjusted_y, 0.11);
				scene.add(buttonMesh);
			}

			if (kM.state == kM.State.Normal) {
				var closeMesh = makeText(' X', 30, unitWidth, unitHeight);
				setKeyboardPosition(board, closeMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
				scene.add(closeMesh);

				if (kM.canMaximize()) {
					var maxMinMesh = makeText(' +', 30, unitWidth, unitHeight);
					setKeyboardPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12);
					scene.add(maxMinMesh);
				} else if (kM.canMinimize()) {
					var maxMinMesh = makeText(' -', 30, unitWidth, unitHeight);
					setKeyboardPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12);
					scene.add(maxMinMesh);
				}
			} else {
				if (kM.getKeyboardApp() != null) {
					var maxMinMesh = makeText(' <', 30, unitWidth, unitHeight);
					setKeyboardPosition(board, maxMinMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
					scene.add(maxMinMesh);
				}
			}
	
			var notificationText = ' !';
			var notifyMesh = makeText(notificationText, 30, unitWidth, unitHeight);
			setKeyboardPosition(board, notifyMesh, this.x + this.buttonPosition['inNotifications'], adjusted_y, 0.12);
			scene.add(notifyMesh);
	
			var appSwitchText = '<->';
			var appSwitchMesh = makeText(appSwitchText, 30, unitWidth, unitHeight);
			setKeyboardPosition(board, appSwitchMesh, this.x + this.buttonPosition['inAppSwitch'], adjusted_y, 0.12);
			scene.add(appSwitchMesh);

			var title = '';
			if (kM.state == kM.State.Normal && kM.getKeyboardApp() != null) {
				title = kM.getKeyboardApp().name;
			} else if (kM.state == kM.State.AppSwitch) {
				title = 'App Switcher';
			} else if (kM.state == kM.State.Notifications) {
				title = 'Notifications';
			}

			var titleMesh = makeText(title, 30, unitWidth*8, unitHeight);
			setKeyboardPosition(board, titleMesh, 2*unitWidth, adjusted_y, 0.12);
			scene.add(titleMesh);
		}
	}
};

//make max draw radius
VRK.Joystick = function(x, y, radius, returnsToCenter) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;
	
	this.x = x * unitWidth;
	this.y = y * unitHeight;

	this.returnsToCenter = returnsToCenter;
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.radius = 0.04;
	this.available = true;
	this.point = undefined;
	if (radius != undefined) {
		this.max_drag = radius * unitWidth;
	} else {
		this.max_drag = 1/4;
	}
	this.contains = function(x, y) {
		//handle not alway going back to center
		return Math.sqrt(Math.pow(x - this.x,2) + Math.pow((y - this.y) / eccentricity,2)) < this.radius;
	};
	this.release = function(x, y) {
		this.available = true;
		this.onRelease_callback(x - this.x, y - this.y);
		this.point = undefined;
	};
	this.onRelease_callback = function(x, y) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	}
	this.onMove_callback = function(x, y) {};
	this.move = function(x, y){
		var scaling_factor_x = 1;
		var scaling_factor_y = 1;
		x_shift = this.point.x - this.initGrab.x;
		y_shift = this.point.y - this.initGrab.y;
		var dist = length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity});
		if (dist > this.max_drag) {
			scaling_factor_x = this.max_drag / dist;
			scaling_factor_y = this.max_drag / dist;
		}
		this.onMove_callback(x_shift * scaling_factor_x, y_shift * scaling_factor_y);
	};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	};
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.point = point;
		point.onRelease(this.release.bind(this));
		point.onMove(this.move.bind(this));
		this.available = false;
	};
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.draw = function(scene, board) {
		var grab = makeFullCircle(this.radius);
		
		var x_shift = 0;
		var y_shift = 0;
		var scaling_factor_x = 1;
		var scaling_factor_y = 1;
		if(this.point != undefined) {
			x_shift = this.point.x - this.initGrab.x;
			y_shift = this.point.y - this.initGrab.y;
			var dist = length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity});
			if (dist > this.max_drag) {
				scaling_factor_x = this.max_drag / dist;
				scaling_factor_y = this.max_drag / dist;
			}
		}

		setKeyboardPosition(board, grab, this.x + x_shift * scaling_factor_x, this.y + y_shift * scaling_factor_y, 0.12);

		scene.add(grab);
	};
};