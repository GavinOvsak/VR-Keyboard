var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() {
		console.log('right click');
	});*/
};
app.name = 'Textures Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var cubeMaterials = [];
var cubeGeometries = [];

var floorMaterial, 
    floorGeometry,
    skyBox,
    moon, 
    lightbulb, 
    light, 
    light2,
    moonMaterial1,
    moonMaterial2,
    moonMaterial3,
    crateMaterial,
    DiceBlueMaterial
    ;

var cubeGeometry = new THREE.CubeGeometry( 85, 85, 85 );
var sphereGeom =  new THREE.SphereGeometry( 40, 32, 16 ); 


app.drawFront = function(scene) {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0,150,100);
    scene.add(light);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;

    scene.add(floor);
    scene.add(skyBox);
    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    scene.add(light2);

    var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial1 );
    moon.position.set(-100, 50, 0);
    scene.add( moon );        
    
    var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial2 );
    moon.position.set(0, 50, 0);
    scene.add( moon );                
    
    var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial3 );
    moon.position.set(100, 50, 0);
    scene.add( moon );     

    var lightbulb = new THREE.Mesh( 
            new THREE.SphereGeometry( 10, 16, 8 ), 
            new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
    );
    lightbulb.position = light.position;
    scene.add( lightbulb );
    
    var crate = new THREE.Mesh( cubeGeometry.clone(), crateMaterial );
    crate.position.set(-60, 50, -100);
    scene.add( crate );      

    var DiceBlueGeom = new THREE.CubeGeometry( 85, 85, 85, 1, 1, 1 );
    var DiceBlue = new THREE.Mesh( DiceBlueGeom, DiceBlueMaterial );
    DiceBlue.position.set(60, 50, -100);
    scene.add( DiceBlue );
};

var init = function() 
{
    
    var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 10, 10 );
    floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    
    var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    
    
    var light2 = new THREE.AmbientLight(0x444444);
    
    var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
    moonMaterial1 = new THREE.MeshBasicMaterial( { map: moonTexture } );
    moonMaterial2 = new THREE.MeshLambertMaterial( { map: moonTexture } );
    moonMaterial3 = new THREE.MeshLambertMaterial( { map: moonTexture, color: 0xff8800, ambient: 0x0000ff } );
          
    var crateTexture = new THREE.ImageUtils.loadTexture( 'images/crate.gif' );
    crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );
    
    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-1.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-6.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-2.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-5.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-3.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-4.png' ) }));
    DiceBlueMaterial = new THREE.MeshFaceMaterial(materialArray);
};
init();

var exports = app;

/*
// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var cube;

init();
animate();

// FUNCTIONS                 
function init() 
{
        // SCENE
        scene = new THREE.Scene();
        // CAMERA
        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
        camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(0,150,400);
        camera.lookAt(scene.position);        
        // RENDERER
        if ( Detector.webgl )
                renderer = new THREE.WebGLRenderer( {antialias:true} );
        else
                renderer = new THREE.CanvasRenderer(); 
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        container = document.getElementById( 'ThreeJS' );
        container.appendChild( renderer.domElement );
        // EVENTS
        THREEx.WindowResize(renderer, camera);
        THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
        // CONTROLS
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        // STATS
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 100;
        container.appendChild( stats.domElement );
        // LIGHT
        var light = new THREE.PointLight(0xffffff);
        light.position.set(0,150,100);
        scene.add(light);
        // FLOOR
        var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
        floorTexture.repeat.set( 10, 10 );
        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -0.5;
        floor.rotation.x = Math.PI / 2;
        scene.add(floor);
        // SKYBOX/FOG
        var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        // scene.add(skyBox);
        scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
        
        ////////////
        // CUSTOM //
        ////////////

        // Spheres
        //   Note: a standard flat rectangular image will look distorted,
        //   a "spherical projection" image will look "normal".
        
        // radius, segmentsWidth, segmentsHeight
        var sphereGeom =  new THREE.SphereGeometry( 40, 32, 16 ); 
        
        var light2 = new THREE.AmbientLight(0x444444);
        scene.add(light2);
        
        // basic moon
        var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
        var moonMaterial = new THREE.MeshBasicMaterial( { map: moonTexture } );
        var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial );
        moon.position.set(-100, 50, 0);
        scene.add( moon );        
        
        // shaded moon -- side away from light picks up AmbientLight's color.
        var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
        var moonMaterial = new THREE.MeshLambertMaterial( { map: moonTexture } );
        var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial );
        moon.position.set(0, 50, 0);
        scene.add( moon );                
        
        // colored moon
        var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
        var moonMaterial = new THREE.MeshLambertMaterial( { map: moonTexture, color: 0xff8800, ambient: 0x0000ff } );
        var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial );
        moon.position.set(100, 50, 0);
        scene.add( moon );        
        
        // create a small sphere to show position of light
        var lightbulb = new THREE.Mesh( 
                new THREE.SphereGeometry( 10, 16, 8 ), 
                new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
        );
        scene.add( lightbulb );
        lightbulb.position = light.position;
        
        // Cubes
        //   Note: when using a single image, it will appear on each of the faces.
        //   Six different images (one per face) may be used if desired.
        
        var cubeGeometry = new THREE.CubeGeometry( 85, 85, 85 );
        
        var crateTexture = new THREE.ImageUtils.loadTexture( 'images/crate.gif' );
        var crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );
        var crate = new THREE.Mesh( cubeGeometry.clone(), crateMaterial );
        crate.position.set(-60, 50, -100);
        scene.add( crate );                
        
        // create an array with six textures for a cool cube
        var materialArray = [];
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-1.png' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-6.png' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-2.png' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-5.png' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-3.png' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-4.png' ) }));
        var DiceBlueMaterial = new THREE.MeshFaceMaterial(materialArray);
        
        var DiceBlueGeom = new THREE.CubeGeometry( 85, 85, 85, 1, 1, 1 );
        var DiceBlue = new THREE.Mesh( DiceBlueGeom, DiceBlueMaterial );
        DiceBlue.position.set(60, 50, -100);
        scene.add( DiceBlue );        
        
}

function animate() 
{
    requestAnimationFrame( animate );
        render();                
        update();
}

function update()
{
        if ( keyboard.pressed("z") ) 
        { 
                // do something
        }
        
        controls.update();
        stats.update();
}

function render() 
{
        renderer.render( scene, camera );
}

</script>

</body>
</html>

</script>

</body>
</html>
*/