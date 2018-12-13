
var gravity = [0, -9.81, 0]


function quaternion(x,y,z,w) { 
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;    
    //-----

    this.toAxisRotation = function() { 
        var angle = Math.acos(this.w);
        var sa = Math.sin(angle);
        var ooScale = 0;
        if(sa != 0) {
            ooScale = 1.0 / sa;        }
        angle *= 2.0;
        axis = [this.x*ooScale, ooScale*this.y, ooScale*this.z, 1];
        retVal = {
            rotation: angle, 
            axis: axis
        }
    }
}

function lander() { 
    this.mass = 1000;
    this.engineForce = 2000;
    this.position = [0, 0, 0, 0];
    this.velocity = [0, 0, 0, 0];
    this.acceleration = [0, 0, 0, 0];
    this.orientationQuaternion = new quaternion();;
    this.engineOn = false;
    
    this.update = function(time) { 
        var engineForce = [0, 0, 0, 0];
        if(this.engineOn) {

        }
        
        for(var i=0;i<3;++i) {
            this.acceleration[i] = 
            this.velocity[i]+=this.acceleration[i]*time;
            this.position[i]+=this.velocity[i]*time;
        }
    }

}