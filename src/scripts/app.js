
var ctx;
var programInfo;


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
        if(vertexShader==null)
            return;
        getResource('./shaders/fragmentshader.fs',(o)=>{ 
            var fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, o);
            if(fragmentShader == null) {
                gl.deleteShader(vertexShader)
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


function start() {
    var canvas = document.getElementById('landerCanvas');
    ctx = canvas.getContext("webgl");
    if(ctx == null) {
        //what type device is this that doesn't support webgl?
        //not dealing with it. さようなら。　
        return;
    }
    ctx.clearColor(0.0,0.0,0.0,1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);

    var s = loadShaders(ctx);
    s.done((shaderProgram)=>{
        console.log("shaders loaded");
        programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPositions: ctx.getAttribLocation(shaderProgram, 'aVertexPosition'),                
            },
            uniformLocations: {
                projectionMatrix: ctx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: ctx.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            }            
        };
        console.log(programInfo);
    });
}

