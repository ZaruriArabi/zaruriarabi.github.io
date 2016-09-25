



// This is a scene generator

// a scene described in json is generated in WebGL with threejs


// details of what is found where
var found = {

	"book": {
        "with": [
            "book", "pen"
        ],
        "on": [
            "table", "shelf"
        ],
        "at": ["center"],
        "in" : ["home", "office"],
        "probably": 0.5,
        "qty":[1,2,3,5,13]
	}

};


// var js = JSON.parse(json);

function gen(object) {

	// understand the json description of the scene
	val = getValues(found,"probably")
    console.log(val);
    // load the components related to the object to make the place where it is found or put the object in the current scene

    //make the threejs scene

}
