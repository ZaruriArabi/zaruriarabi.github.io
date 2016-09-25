// basic scene generator based on prewritten setting
// not automatic initially
// alif version of gen 

// debug = 1;

dataset = {
}

things = {
    "chair":[4,2,-3],
    "book7":[8,0,-6],
    // need a way to show two books
    // "book7":[9,0,-6],
    "house":[8,5,-20],
    "masjid":[10,15,-50],
    // "door":[-8,20,10],
    "table":[-6,2,-3],
    "bed":[-16,2,-15],
    "car":[-16,2,-30],
}

sounds = {
    "book7":"L001_005.mp3",
    "house":"L001_008.mp3",
    "masjid":"L001_006.mp3",
}

//add more parameters like random, etc

// take the name of object and return the scene obj from dataset


function gen(object,pos){
	// load an object

    var loader = new THREE.JSONLoader();
    aaa = loader.load( "models/"+object+".json", genmodelToScene);


    function genmodelToScene( geometry, materials ) {
        var material = new THREE.MeshFaceMaterial( materials );
        // var material = new THREE.MultiMaterial( materials );
        // for ( var i = 0, l = materials.length; i < l; i ++ ) {

        //     var material = materials[ i ].toJSON( meta );
        //     delete material.metadata;

        //     output.materials.push( material );

        // }

        // map: clothTexture
        material.side = THREE.DoubleSide;
        material.map =THREE.SphericalReflectionMapping;
        material.blending= THREE.AdditiveBlending;
        obj = new THREE.Mesh( geometry, material );
        // obj.scale.set(1,1,1);
        obj.castShadow = true
        obj.receiveShadow = true
        obj.position.set(pos[0],pos[1],pos[2])
        obj.thingname = object

        obj.thingsound = "audio/"+sounds[object]

        console.log(obj.thingname);
        meshes.push(obj);
        scene.add( obj );


        // make cannon

// Create boxes

        
    var mass = 5;
    indices=[];
    
    // Exact Shape takes a lot of time
    // thingShape = new CANNON.Trimesh(geometry.vertices, indices);
    
    // Similar shape

    geometry.computeBoundingBox();
    var bb = geometry.boundingBox;
    var object3DWidth  = bb.max.x - bb.min.x;
    var object3DHeight = bb.max.y - bb.min.y;
    var object3DDepth  = bb.max.z - bb.min.z;

    var thingShape = new CANNON.Box(new CANNON.Vec3(object3DWidth/2,object3DHeight/2,object3DDepth/2));
        var thingBody = new CANNON.Body({ mass: mass });
        thingBody.addShape(thingShape);
        thingBody.position.set(pos[0],pos[1],pos[2]);
        world.addBody(thingBody);
        bodies.push(thingBody);
    



    }
    // loader.load( { model: 'models/book3.json', callback: modelToScene , texture_path: 'models' } );
    // console.log(aaa);
        
}

function fullgen(){
//TODO: full gen complete scene
    for (property in things) {
        
        gen(property,things[property]);

    }
}