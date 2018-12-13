
var ctx;
var programInfo;
var positionBuffer;
var squareRotation = 0;
var shipDisplacement = [0,0,-40];


function Promise() {
    var doneFunction
    this.done = function(o) {
        doneFunction = o;
    }
    this.onDone = function(o) { 
        if(doneFunction != null)
        doneFunction(o);
    }
}

function getResource(url, onComplete) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.info(this.responseText);
            onComplete(this.responseText);
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send();    
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('houston, we have a problem:'+gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function loadShaders(gl) { 
    var promise = new Promise();
    getResource('./shaders/vertexshader.vs'  ,(o)=> {
        var vertexShader = compileShader(gl, gl.VERTEX_SHADER, o);
        if(vertexShader==null) {
            console.log("can't make vertex shader")
            return;
        }
        getResource('./shaders/fragmentshader.fs',(o)=>{ 
            var fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, o);
            if(fragmentShader == null) {
                gl.deleteShader(vertexShader);
                console.error("can't male fragment  shader")
                return;
            }
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram (shaderProgram);

            if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.error("Can''t initialize the shader program:"+gl.getProgramInfoLog(shaderProgram));
                return;                
            }
            console.log(shaderProgram);
            if(promise.hasOwnProperty("done")) {
                promise.onDone(shaderProgram);
            }
        });
    });
    return promise;       
}

function initBuffers(gl) { 
    const faceColors = [
        [0.7,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.5,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
      ];
    var colors = [
       
      ];
      for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
    
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c,c,c);
      }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
         Math.sqrt(8/9),              0, (-1/3),
         -Math.sqrt(2/9), -Math.sqrt(2/3), (-1/3),
        -Math.sqrt(2/9),  Math.sqrt(2/3), -1/3,  
        0, 0, 1,              
        
        -Math.sqrt(2/9), -Math.sqrt(2/3), (-1/3),
        
        Math.sqrt(8/9),               0, (-1/3),
        
        -Math.sqrt(2/9),  Math.sqrt(2/3), -1/3,                
        -Math.sqrt(2/9), -Math.sqrt(2/3), (-1/3),
        0, 0, 1,



        -Math.sqrt(2/9), Math.sqrt(2/3), -1/3,                
        -Math.sqrt(2/9), -Math.sqrt(2/3), (-1/3),
        0, 0, 1,
        
        Math.sqrt(8/9), 0, (-1/3),
        -Math.sqrt(2/9), -Math.sqrt(2/3), (-1/3),
        0, 0, 1,

        
        0, 0, 1,
        -Math.sqrt(2/9), Math.sqrt(2/3), -1/3,
        Math.sqrt(8,9), 0, (-1/3),
        


        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
      ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      //----------------


      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
      // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.
    
      const indices = [
        0,  2,  1,      3,  0,  1,    // front
        3,  1,  2,      3,  1,  0,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
      ];
    
      // Now send the element array to GL
    
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indices), gl.STATIC_DRAW);
    
      //----------------

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer
    };
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.1, 0.1, 0.1, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
  
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   shipDisplacement);  // amount to translate
    mat4.rotate(modelViewMatrix,  // destination matrix
                    modelViewMatrix,  // matrix to rotate
                    squareRotation,   // amount to rotate in radians
                    [0, 0, 1]);       // axis to rotate around  
                    mat4.rotate(modelViewMatrix,  // destination matrix
                        modelViewMatrix,  // matrix to rotate
                        squareRotation*0.2,   // amount to rotate in radians
                        [0, 1, 1]);       // axis to rotate around                      
                                     
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }
  
    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  
    // Tell WebGL to use our program when drawing
  
    gl.useProgram(programInfo.program);
  
    // Set the shader uniforms
  
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
  
    {
        const vertexCount = 12;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }  
}

var then = 0;

var primeLander = new lander();


function update(deltaTime) { 
    primeLander.update(deltaTime);
}
function render(now) {
    now *= 0.0005;
    const deltaTime = now - then;
    then = now;
    squareRotation+=deltaTime;
    shipDisplacement[1]+=0.001;

    update(deltaTime);

    drawScene(ctx, programInfo, positionBuffer, deltaTime );
    requestAnimationFrame(render);
    console.log('.');
}

function start() {
    var canvas = document.getElementById('landerCanvas');
    ctx = canvas.getContext("webgl");
    if(ctx == null) {
        //what type device is this that doesn't support webgl?
        //not dealing with it. さようなら。　
        return;
    }
    ctx.clearColor(0.1,0.1,0.1,1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);

    var s = loadShaders(ctx);
    s.done((shaderProgram)=>{
        console.log("shaders loaded");
        programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: ctx.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: ctx.getAttribLocation(shaderProgram, 'aVertexColor'),                
            },
            uniformLocations: {
                projectionMatrix: ctx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: ctx.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            }            
        };
        console.log(programInfo);

        positionBuffer = initBuffers(ctx);
        drawScene(ctx, programInfo,  positionBuffer);
        requestAnimationFrame(render);
    });
}

