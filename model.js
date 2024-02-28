const X_RANGE = 640*2;
const Y_RANGE = 480*2;
const Z_RANGE = 600; //might have to recalculate

const MIN_SCREEN_DIST = 50;

const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

const WAYPOINT_RADIUS = 5;

function random_valid_vector(){
    x = -X_RANGE/2 + random(X_RANGE);
    y = -Y_RANGE/2 + random(Y_RANGE);
    z = random(Z_RANGE) + 50;
    return createVector(x, y, z);
}

class Model{
    constructor(model_blueprint, x, y, z){
        /* -------------------------------- modelling ------------------------------- */
        this.x_size = x;
        this.y_size = y;
        this.z_size = z;

        this.model_blueprint = model_blueprint;

        this.head = createVector(0, 0, 0);
        this.tail = createVector(0, 0, 0);

        //boid info
        this.boids = new Array(this.x_size * this.y_size * this.z_size);
        this.boids_spacing = 8;
        this.boids_size = 3;
        this.orientation;

        for(let i = 0; i < this.boids.length; i++){
            if(this.model_blueprint[i]){
                this.boids[i] = new Boid(this, i);
            }else{
                this.boids[i] = -1;
            }
        }

        /* ------------------------------- navigation ------------------------------- */
        this.target_waypoint = createVector(0, 0, 0);
        this.curr_position = random_valid_vector();
        this.waypoints = []; //list of next points to hit

        for(let i = 0; i < 5; i++){
            this.waypoints.push(random_valid_vector());
        }

        /* --------------------------------- offset --------------------------------- */
        this.xfunc; // maybe
        this.yfunc;
        this.zfunc;
    }
    
    pick_next_point(){ //picks the next point to move to
        //find the waypoint that is the furthest away from current waypoint
        let best_waypoint = this.waypoints[0];
        let best_distance = 0;
        for(let i = 1; i < this.waypoints.length; i++){
            let temp_distance = this.curr_position.dist(this.waypoints[i]);
            if(temp_distance > best_distance){
                best_distance = temp_distance;
                best_waypoint = this.waypoints[i];
            }
        }

        this.target_waypoint = best_waypoint;

        this.waypoints.splice(this.waypoints.indexOf(this.target_waypoint), 1);
        this.waypoints.push(random_valid_vector());
    }
    
    orient_next_point(){ //move the head and tail so that it's in line (or smth similar)
        //see if p5js has a bounding obj parent or something like that
        //also could use the rotate thing, i just checked i dont think there is


    }

    update(){
        /* ------------------------------- head / tail ------------------------------ */
        //if close enough to the target waypoint, then start charting to the next waypoint
        
        //get current position

        if(this.curr_position.dist(this.target_waypoint) < WAYPOINT_RADIUS){
            this.pick_next_point();
        }
        this.orient_next_point();
    }

    draw(){

    }

    debug(){
        /* ---------------------------- reveal waypoints ---------------------------- */
        ambientLight(255);
        noStroke();

        ambientMaterial(255, 130, 230);
        for(let i = 0; i < this.waypoints.length; i++){
            push();
            translate(this.waypoints[i].x, this.waypoints[i].y, this.waypoints[i].z);
            sphere(10);
            pop();
        }
        
        for(let i = 0; i < this.boids.length; i++){
            if(i == 0 || i == floor(this.boids.length-1)){ //bug, not selecting the middle
                ambientMaterial(0, 0, 230);
            }else{
                ambientMaterial(70, 130, 230);
            }

            if(this.model_blueprint[i]){
                this.boids[i].debug();
            }
            
        }
    }
}