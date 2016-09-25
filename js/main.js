var debug;
// debug = 1;
var sphereShape, sphereBody, world, physicsMaterial, walls=[], balls=[], ballMeshes=[], boxes=[], boxMeshes=[], voxels, groundBody;

// var camera, scene, renderer;
var camera, scene, renderer, gplane=false, clickMarker=false;

var jointBody, constrainedBody, mouseConstraint;


var geometry, material, mesh;
var controls,time = Date.now();

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var container, camera, scene, renderer, projector;

var customMaterial;

var moonGlow;
// To be synced
var meshes=[], bodies=[];

            var cross;
            
                var size = 500;
var cannonDebugRenderer;
if (settings.pointerlock && havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controls.enabled = true;

            blocker.style.display = 'none';

            window.addEventListener("mousemove", onMouseMove, false );
            window.addEventListener("mousedown", onMouseDown, false );
            window.addEventListener("mouseup", onMouseUp, false )

        } else {

            controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';

            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mouseup", onMouseUp)

        }

    }

    var pointerlockerror = function ( event ) {
        instructions.style.display = '';
    }

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        if (settings.fullscreen && /Firefox/i.test( navigator.userAgent ) ) {

            var fullscreenchange = function ( event ) {

                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                    element.requestPointerLock();
                }

            }

            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

            element.requestFullscreen();

        } else {

            element.requestPointerLock();

        }

    }, false );

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

// Fix up prefixing
var audio;
window.addEventListener('load', initaudio, false);
function initaudio() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    audio = new AudioContext();

  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
}

var audioBuffer = null;

function loadSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    audio.decodeAudioData(request.response, function(buffer) {
    audioBuffer = buffer;
    playSound(audioBuffer);
    }, function() {});
  }
  request.send();
}


    function playSound(buffer) {
        var source = audio.createBufferSource(); // creates a sound source
        source.buffer = buffer;                    // tell the source which sound to play
        source.connect(audio.destination);       // connect the source to the context's destination (the speakers)
        source.start(0);                           // play the source now
                                                     // note: on older systems, may have to use deprecated noteOn(time);
        }
    


initCannon();
init();
animate();

function initCannon(){
    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0,-20,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.broadphase.useBoundingBoxes = true;

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.0, // friction coefficient
                                                            0.3  // restitution
                                                            );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    var nx = 50,
        ny = 8,
        nz = 50,
        sx = 0.5,
        sy = 0.5,
        sz = 0.5;

    // Create a sphere
    var mass = 5, radius = 1.3;
    sphereShape = new CANNON.Sphere(radius);
    sphereBody = new CANNON.Body({ mass: mass, material: physicsMaterial });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(-3,2,3);
    sphereBody.linearDamping = 0.9;
    world.addBody(sphereBody);

    // Create a plane
    var groundShape = new CANNON.Plane();
    groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    groundBody.position.set(0,0,0);
    world.addBody(groundBody);

    // voxels = new VoxelLandscape(world,nx,ny,nz,sx,sy,sz);

    // for(var i=0; i<nx; i++){
    //     for(var j=0; j<ny; j++){
    //         for(var k=0; k<nz; k++){
    //             var filled = true;

    //             // Insert map constructing logic here
    //             if(Math.sin(i*0.1)*Math.sin(k*0.1) < j/ny*2-1)
    //                 filled = false;

    //             voxels.setFilled(i,j,k,filled);

    //         }
    //     }
    // }

    // voxels.update();
    // console.log(voxels.boxes.length+" voxel physics bodies");

    // // Create boxes
    // N = 5
    // var mass = 5, radius = 1.3;
    // boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    // for(var i=0; i<N; i++){
    //     boxBody = new CANNON.Body({ mass: mass });
    //     boxBody.addShape(boxShape);
    //     boxBody.position.set(0,5,0);
    //     world.addBody(boxBody);
    //     bodies.push(boxBody);
    // }



    // // Joint body
    // var shape = new CANNON.Sphere(0.1);
    // jointBody = new CANNON.Body({ mass: 0 });
    // jointBody.addShape(shape);
    // jointBody.collisionFilterGroup = 0;
    // jointBody.collisionFilterMask = 0;
    // world.addBody(jointBody)

}



function init() {

    projector = new THREE.Projector();
    // camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // camera.useQuaternion = true;
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.5, 2000000 );
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0x000000, 0, 500 );
    // scene.fog = new THREE.Fog( 0xffffff, 1, 300 );
    // scene.fog.color.setHSL( 0.6, 0, 1 )
    // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    // var ambient = new THREE.AmbientLight( 0xAAAAAA );
    // scene.add( ambient );
    // // var direct = new  THREE.DirectionalLight( 0xFFFFFF, 1.5 );
    // // scene.add( direct );

    // light = new THREE.DirectionalLight( 0xFFFFFF , 2 );
    // light.position.set( 1,1, 1 );
    // light.target.position.set( 0, 0, 0 );
    // if(true){
    //     light.castShadow = true;

    //     light.shadowCameraNear = 20;
    //     light.shadowCameraFar = 50;//camera.far;
    //     light.shadowCameraFov = 40;

    //     light.shadowMapBias = 0.1;
    //     light.shadowMapDarkness = 0.7;
    //     light.shadowMapWidth = 2*512;
    //     light.shadowMapHeight = 2*512;

    //     //light.shadowCameraVisible = true;
    // }
    // scene.add( light );



                // hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
                // hemiLight.color.setHSL( 0.6, 1, 0.6 );
                // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                // hemiLight.position.set( 0, 500, 0 );
                // scene.add( hemiLight );
                // //
                // dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                // dirLight.color.setHSL( 0.1, 1, 0.95 );
                // dirLight.position.set( -1, 1.75, 1 );
                // dirLight.position.multiplyScalar( 50 );
                // scene.add( dirLight );
                // dirLight.castShadow = true;
                // dirLight.shadowMapWidth = 2048;
                // dirLight.shadowMapHeight = 2048;
                // var d = 50;
                // dirLight.shadowCameraLeft = -d;
                // dirLight.shadowCameraRight = d;
                // dirLight.shadowCameraTop = d;
                // dirLight.shadowCameraBottom = -d;
                // dirLight.shadowCameraFar = 3500;
                // dirLight.shadowBias = -0.0001;
                // //dirLight.shadowCameraVisible = true;

                // GROUND
                var groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
                var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x000000 } );
                groundMat.color.setHSL( 0.095, 1, 0.75 );
                var ground = new THREE.Mesh( groundGeo, groundMat );
                ground.rotation.x = -Math.PI/2;
                // ground.position.y = -33;
                ground.receiveShadow = true;
                scene.add( ground );

                // var skyvertexShader = document.getElementById( 'skyvertexShader' ).textContent;
                // var skyfragmentShader = document.getElementById( 'skyfragmentShader' ).textContent;
                // var uniforms = {
                //     topColor:    { value: new THREE.Color( 0x0077ff ) },
                //     bottomColor: { value: new THREE.Color( 0xffffff ) },
                //     offset:      { value: 33 },
                //     exponent:    { value: 0.6 }
                // };


//                 var uniforms = {  
//   texture: { type: 't', value: THREE.ImageUtils.loadTexture('images/arrow.png') }
// };

// var material = new THREE.ShaderMaterial( {  
//   uniforms:       uniforms,
//   vertexShader:   document.getElementById('sky-vertex').textContent,
//   fragmentShader: document.getElementById('sky-fragment').textContent
// });














                addSky();
                addSun();







                // // uniforms.topColor.value.copy( hemiLight.color );
                // // scene.fog.color.copy( uniforms.bottomColor.value );
                // var skyGeo = new THREE.SphereGeometry( 400, 32, 15 );
                // // var skyMat = new THREE.ShaderMaterial( { vertexShader: skyvertexShader, fragmentShader: skyfragmentShader, uniforms: uniforms, side: THREE.BackSide } );
                // var sky = new THREE.Mesh( skyGeo, material );
                // scene.add( sky );



    // slight = new THREE.SpotLight( 0xFFFFFF , 1.5 );
    // slight.position.set( 30,30, 30 );
    // slight.target.position.set( 0, 0, 0 );
    // if(true){
    //     slight.castShadow = true;

    //     slight.shadowCameraNear = 20;
    //     slight.shadowCameraFar = 50;//camera.far;
    //     slight.shadowCameraFov = 40;

    //     slight.shadowMapBias = 0.1;
    //     slight.shadowMapDarkness = 0.7;
    //     slight.shadowMapWidth = 2*512;
    //     slight.shadowMapHeight = 2*512;

    //     //light.shadowCameraVisible = true;
    // }
    // scene.add( slight );

    controls = new PointerLockControls( camera , sphereBody );
    scene.add( controls.getObject() );

// // CONTROLS OrbitControls TODO
//     controls = new THREE.OrbitControls( camera, renderer.domElement );
//     controls.addEventListener( 'change', render );

    // floor
    geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    material = new THREE.MeshLambertMaterial( { color: 0x999999 } );

    mesh = new THREE.Mesh( geometry, material );

    mesh.position.copy(groundBody.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // scene.add( mesh );

    // // voxels
    // for(var i=0; i<voxels.boxes.length; i++){
    //     var b = voxels.boxes[i];
    //     var voxelGeometry = new THREE.BoxGeometry( voxels.sx*b.nx, voxels.sy*b.ny, voxels.sz*b.nz );
    //     var voxelMesh = new THREE.Mesh( voxelGeometry, material );
    //     voxelMesh.castShadow = true;
    //     voxelMesh.receiveShadow = true;
    //     scene.add( voxelMesh );
    //     boxMeshes.push( voxelMesh );
    // }



    // var loader = new THREE.XHRLoader();
    // loader.setResponseType( 'arraybuffer' );
    // loader.load( "models/book3.pack", function ( data ) {

    //     var decoded = msgpack.decode( data );
        
    //     // set material type because this gives error
    //     var arrayLength = decoded.materials.length;
    //     for (var i = 0; i < arrayLength; i++) {
    //         decoded.materials[i].type = "MeshPhongMaterial"
    //     }

    //     console.log(decoded);
    //     console.log(decoded.materials[0].type);
    //     var loader = new THREE.ObjectLoader();

    //     obj = loader.parse( decoded ) ;
    //     obj.scale.set(1,1,1);
    //     obj.position.set(-5,0,5)
    //     console.log(obj.name);
    //     scene.add( obj );
    //     } );


    // var loader = new THREE.JSONLoader();
    // loader.load( "models/book7.json", modelToScene);
    // // loader.load( { model: 'models/book3.json', callback: modelToScene , texture_path: 'models' } );

    // function modelToScene( geometry, materials ) {
    //     var material = new THREE.MeshFaceMaterial( materials );
    //     // var material = new THREE.MultiMaterial( materials );
    //     // for ( var i = 0, l = materials.length; i < l; i ++ ) {

    //     //     var material = materials[ i ].toJSON( meta );
    //     //     delete material.metadata;

    //     //     output.materials.push( material );

    //     // }

    //     // map: clothTexture
    //     material.side = THREE.DoubleSide;
    //     material.map =THREE.SphericalReflectionMapping;
    //     material.blending= THREE.AdditiveBlending;
    //     obj = new THREE.Mesh( geometry, material );
    //     obj.scale.set(1,1,1);
    //     obj.position.set(-5,0,5)
    //     console.log(obj.name);
    //     scene.add( obj );
    // }




    // // cubes
    // N = 5
    // var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    
    // var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );
    // // create custom material from the shader code above
    // //   that is within specially labeled script tags

    // for(var i=0; i<N; i++){
    //     cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    //     // cubeMesh = new THREE.Mesh(cubeGeo, customMaterial.clone());

    //     cubeMesh.castShadow = true;
    //     meshes.push(cubeMesh);
    //     cubeMesh.thingname = i+"afasdf"
    //     scene.add(cubeMesh);

    // }

//????????????????/

    customMaterial = new THREE.ShaderMaterial( 
    {
        uniforms: 
        { 
            "c":   { type: "f", value: 0 },
            "p":   { type: "f", value: 1 },
            glowColor: { type: "c", value: new THREE.Color(0xffffff) },
            viewVector: { type: "v3", value: sphereBody.position }
        },
        vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    }   );
        
    // var sphereGeom = new THREE.SphereGeometry(1, 0.5, 0.2);
    
    // var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
    // var moonMaterial = new THREE.MeshBasicMaterial( { map: moonTexture } );
    // var moon = new THREE.Mesh(sphereGeom, moonMaterial);
    // moon.position.set(3,5,-3);
    // scene.add(moon);

    // create custom material from the shader code above
    //   that is within specially labeled script tags
    
    moonGlow = new THREE.Mesh();
    // moonGlow.position.copy(moon.position);
    moonGlow.scale.multiplyScalar(1.05);
    scene.add( moonGlow );
    
    // var cubeGeom = new THREE.BoxGeometry(1,1,1,2,2,2);
    // var crateTexture = THREE.ImageUtils.loadTexture( 'images/crate.png' );
    // var crateMaterial = new THREE.MeshBasicMaterial();
    // this.crate = new THREE.Mesh(cubeGeom, crateMaterial);
    // crate.position.set(-1,0,-1);
    // scene.add(crate);

    // var smoothCubeGeom = cubeGeom.clone();
    // // var modifier = new THREE.SubdivisionModifier( 2 );
    // // modifier.modify( smoothCubeGeom ); 










/////////////////////////


        // gen('book7',[-8,0,6]);

    fullgen()

    
//??????????????????????//
    // marker
    // markerMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    
    if (debug){
        cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world );
    }
    
    renderer = new THREE.WebGLRenderer({antialias:true});
    // renderer.setClearColor( scene.fog.color );

    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMapCullFace = false;

    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.setClearColor( scene.fog.color, 1 );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );




    

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    centerx =window.innerWidth/2
    centery =window.innerHeight/2
}

var dt = 1/60;
function animate() {
    requestAnimationFrame( animate );
    if(controls.enabled){
        world.step(dt);

        // // Update ball positions
        // for(var i=0; i<balls.length; i++){
        //     ballMeshes[i].position.copy(balls[i].position);
        //     ballMeshes[i].quaternion.copy(balls[i].quaternion);
        // }

        // // Update box positions
        // for(var i=0; i<voxels.boxes.length; i++){
        //     boxMeshes[i].position.copy(voxels.boxes[i].position);
        //     boxMeshes[i].quaternion.copy(voxels.boxes[i].quaternion);
        // }

        for(var i=0; i !== meshes.length; i++){
            meshes[i].position.copy(bodies[i].position);
            meshes[i].quaternion.copy(bodies[i].quaternion);
        }   

        sunCycle()
        if (debug){
            cannonDebugRenderer.update();      // Update the debug renderer
        }
    }

    controls.update( Date.now() - time );

    renderer.render( scene, camera );
    time = Date.now();



}

function updatePhysics(){
    world.step(dt);
}
// var ballShape = new CANNON.Sphere(0.2);
// var ballGeometry = new THREE.SphereGeometry(ballShape.radius);
// var shootDirection = new THREE.Vector3();
// var shootVelo = 15;
// var projector = new THREE.Projector();

function getShootDir(targetVec){
    var vector = targetVec;
    targetVec.set(0,0,1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize() );
    targetVec.x = ray.direction.x;
    targetVec.y = ray.direction.y;
    targetVec.z = ray.direction.z;
}

// window.addEventListener("click",function(e){
//     if(controls.enabled==true){
//         var x = sphereBody.position.x;
//         var y = sphereBody.position.y;
//         var z = sphereBody.position.z;
//         var ballBody = new CANNON.Body({ mass: 1 });
//         ballBody.addShape(ballShape);
//         var ballMesh = new THREE.Mesh( ballGeometry, material );
//         world.addBody(ballBody);
//         scene.add(ballMesh);
//         ballMesh.castShadow = true;
//         ballMesh.receiveShadow = true;
//         balls.push(ballBody);
//         ballMeshes.push(ballMesh);
//         getShootDir(shootDirection);
//         // ballBody.velocity.set(  shootDirection.x * shootVelo,
//                                 // shootDirection.y * shootVelo,
//                                 // shootDirection.z * shootVelo);

//         // Move the ball outside the player sphere
//         x += shootDirection.x * (sphereShape.radius*1.02 + ballShape.radius);
//         y += shootDirection.y * (sphereShape.radius*1.02 + ballShape.radius);
//         z += shootDirection.z * (sphereShape.radius*1.02 + ballShape.radius);
//         ballBody.position.set(x,y,z);
//         ballMesh.position.set(x,y,z);
//     }
// });




// function setClickMarker(x,y,z) {
//     // if(!clickMarker){
//     //     var shape = new THREE.SphereGeometry(0.1, 8, 8);
//     //     clickMarker = new THREE.Mesh(shape, markerMaterial);
//     //     scene.add(clickMarker);
//     // }
//     // clickMarker.visible = true;
//     // clickMarker.position.set(x,y,z);
// }

// function removeClickMarker(){
//   clickMarker.visible = false;
// }

function onMouseMove(e){

    // Move and project on the plane
    // if (gplane && mouseConstraint) {
    //     var pos = projectOntoPlane(e.clientX,e.clientY,gplane,camera);
    //     console.log(pos);
    //     // if(pos){
    //     //     // setClickMarker(pos.x,pos.y,pos.z,scene);
    //     //     // moveJointToPoint(pos.x,pos.y,pos.z);
    //     // }
    // }
}

function onMouseDown(e){
    // Find mesh from a ray
    var entity = findNearestIntersectingObject(e.clientX,e.clientY,camera,meshes);
    var pos = entity.point;
    console.log(entity.object.geometry);
    // as per thingname
    console.log(entity.object.thingname);
    
    console.log(entity.object.thingsound);


    loadSound(entity.object.thingsound);



        // constraintDown = true;



        // // Set marker on contact point
        // setClickMarker(pos.x,pos.y,pos.z,scene);

        // Set the movement plane
        setScreenPerpCenter(pos,camera);

        // var idx = meshes.indexOf(entity.object);
        // if(idx !== -1){
        //     addMouseConstraint(pos.x,pos.y,pos.z,bodies[idx]);
        // }




        moonGlow.visible = true;
        // moonGlow = new THREE.Mesh( entity.object.geometry.clone(), customMaterial.clone() );
        moonGlow.material = customMaterial.clone()
        moonGlow.geometry = entity.object.geometry.clone()
        moonGlow.rotation.copy(entity.object.rotation);
        moonGlow.position.copy(entity.object.position);
        moonGlow.scale = 1;
        // moonGlow.scale.multiplyScalar(1.2);
        scene.add( moonGlow );


}

// This function creates a virtual movement plane for the mouseJoint to move in
function setScreenPerpCenter(point, camera) {
    // If it does not exist, create a new one
    if(!gplane) {
      var planeGeo = new THREE.PlaneGeometry(100,100);
      var plane = gplane = new THREE.Mesh(planeGeo,material);
      plane.visible = false; // Hide it..
      scene.add(gplane);
    }

    // if(controls.enabled==true){
    //     getShootDir(shootDirection);
    //     gplane.rotation.set(shootDirection)
    // }


    // Center at mouse position
    gplane.position.copy(point);

    // Make it face toward the camera

    // gplane.quaternion.copy(camera.quaternion);
    // console.log(camera.quaternion)
    // console.log(gplane.quaternion)

}

function onMouseUp(e) {
  // constraintDown = false;
  // // remove the marker
  // removeClickMarker();
  moonGlow.visible = false;
  // Send the remove mouse joint to server
  // removeJointConstraint();
}

var lastx,lasty,last;
function projectOntoPlane(screenX,screenY,thePlane,camera) {
    var x = screenX;
    var y = screenY;
    var now = new Date().getTime();
    // project mouse to that plane
    var hit = findNearestIntersectingObject(screenX,screenY,camera,[thePlane]);
    lastx = x;
    lasty = y;
    last = now;
    if(hit)
        return hit.point;
    return false;
}
function findNearestIntersectingObject(clientX,clientY,camera,objects) {
    // Get the picking ray from the point
    var raycaster = getRayCasterFromScreenCoord(clientX, clientY, camera, projector);

    // Find the closest intersecting object
    // Now, cast the ray all render objects in the scene to see if they collide. Take the closest one.
    var hits = raycaster.intersectObjects(objects);
    var closest = false;
    if (hits.length > 0) {
        closest = hits[0];
    }

    return closest;
}

// Function that returns a raycaster to use to find intersecting objects
// in a scene given screen pos and a camera, and a projector
function getRayCasterFromScreenCoord (screenX, screenY, camera, projector) {
    var mouse3D = new THREE.Vector3();
    // Get 3D point form the client x y
    // mouse3D.x = (screenX / window.innerWidth) * 2 - 1;
    // mouse3D.y = -(screenY / window.innerHeight) * 2 + 1;
    mouse3D.x = 0; // at center
    mouse3D.y = 0; // at center
    mouse3D.z = 0.5;
    return projector.pickingRay(mouse3D, camera);
}


// function addMouseConstraint(x,y,z,body) {
//   // The cannon body constrained by the mouse joint
//   constrainedBody = body;

//   // Vector to the clicked point, relative to the body
//   var v1 = new CANNON.Vec3(x,y,z).vsub(constrainedBody.position);

//   // Apply anti-quaternion to vector to tranform it into the local body coordinate system
//   var antiRot = constrainedBody.quaternion.inverse();
//   pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

//   // Move the cannon click marker particle to the click position
//   // jointBody.position.set(x,y,z);

//   // Create a new constraint
//   // The pivot for the jointBody is zero
//   // mouseConstraint = new CANNON.PointToPointConstraint(constrainedBody, pivot, jointBody, new CANNON.Vec3(0,0,0));

//   // Add the constriant to world
//   world.addConstraint(mouseConstraint);
// }

// This functions moves the transparent joint body to a new postion in space
// function moveJointToPoint(x,y,z) {
//     // Move the joint body to a new position
//     jointBody.position.set(x,y,z);
//     mouseConstraint.update();
// }

// function removeJointConstraint(){
//   // Remove constriant from world
//   world.removeConstraint(mouseConstraint);
//   mouseConstraint = false;
// }
