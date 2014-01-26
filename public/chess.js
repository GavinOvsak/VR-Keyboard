var chess = {};
chess.drawFront = function(scene) {
	var redLambert = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
	
	var cube = new THREE.Mesh(
		new THREE.CubeGeometry(10, 20, 30),
		redLambert);

	cube.rotation.x = Math.PI/4;
	cube.rotation.y = 0.3;

	scene.add(cube);

	/* var screen = new THREE.Mesh(
			new THREE.PlaneGeometry(80, 80),
			greenLambert);

		screen.position.x = 0;
		screen.position.y = 15;
		screen.position.z = 140;

		scene.add(screen); */
};
/*chess.drawBack = function(scene) {
	
	
};*/
chess.drawFrontAndBack = function(scene) {
	chess.drawFront(scene);
//	chess.drawBack(scene);
};
chess.setUpKeyboard = function(keyboard) {
	var left = new VRK.Button(1, 3, 1, 1);
	var right = new VRK.Button(3, 3, 1, 1);
	var up = new VRK.Button(2, 4, 1, 1);
	var down = new VRK.Button(2, 2, 1, 1);

	keyboard.add(left);
	keyboard.add(right);
	keyboard.add(up);
	keyboard.add(down);

	left.onClick(function() {
		console.log('left click');
	});
}

var export1 = chess;