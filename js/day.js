
            function addSky(){

                var vertexShader = document.getElementById( 'sunvertexShader' ).textContent;
                var fragmentShader = document.getElementById( 'sunfragmentShader' ).textContent;
                var uniforms = {
                    sunPosition:     { type: "v3", value: new THREE.Vector3() }
                }

                var skyGeo = new THREE.SphereGeometry( 450000, 32, 15 );
                var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

                sky = new THREE.Mesh( skyGeo, skyMat );
                scene.add( sky );
            }

            function addSun(){
                sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ), new THREE.MeshBasicMaterial({color: 0xffee88, wireframe: false }));
                sunSphere.position.y = -700000;
                sunSphere.visible = true;
                scene.add( sunSphere );

                moonSphere = new THREE.Mesh( new THREE.SphereGeometry( 15000, 30, 30 ), new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
                moonSphere.position.y = -700000;
                moonSphere.visible = true;
                scene.add( moonSphere );


                directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
                //directionalLight.position.set( - 1, 0.4, - 1 );
                // scene.add( directionalLight );



                hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
                //hemiLight.color.setHSL( 0.6, 1, 0.6 );
                //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, 500, 0 );
                scene.add( hemiLight );


                dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                //dirLight.color.setHSL( 0.1, 1, 0.95 );
                //dirLight.position.set( -1, 1.75, 1 );
                dirLight.position.multiplyScalar( 50 );
                scene.add( dirLight );
                dirLight.castShadow = true;
                dirLight.shadowMapWidth = 2048;
                dirLight.shadowMapHeight = 2048;
                var d = 50;
                dirLight.shadowCameraLeft = -d;
                dirLight.shadowCameraRight = d;
                dirLight.shadowCameraTop = d;
                dirLight.shadowCameraBottom = -d;
                dirLight.shadowCameraFar = 3500;
                dirLight.shadowBias = -0.0001;
                //dirLight.shadowCameraVisible = true;
            }

            function sunCycle() {
                var sunRotation = -Date.now() * 0.000001
                // var sunRotation = -Date.now() * 0.001;;
                sunSphere.position.x = 0;
                sunSphere.position.y = Math.sin(sunRotation) * 400000;
                sunSphere.position.z = Math.cos(sunRotation) * 400000;

                var moonRotation = sunRotation //-Date.now() * 0.001;;
                moonSphere.position.x = 0;
                moonSphere.position.y = (-Math.sin(moonRotation)) * 400000;
                moonSphere.position.z = (-Math.cos(moonRotation)) * 400000;

                // directionalLight.position.x = 0;
                // directionalLight.position.y = Math.sin(sunRotation) * 90000;
                // directionalLight.position.z = Math.cos(sunRotation) * 90000;

                dirLight.position.x = -1;
                dirLight.position.y = Math.sin(sunRotation) * 1.75;
                dirLight.position.z = Math.cos(sunRotation) * 1;

                dirLight.position.multiplyScalar( 50 );
                sky.material.uniforms.sunPosition.value.copy(sunSphere.position);

            }
