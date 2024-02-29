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
    z = -Z_RANGE/2 + random(Z_RANGE);
    return createVector(x, y, z);
}

class Model{
    constructor(model_blueprint, x, y, z, head, tail){
        /* -------------------------------- modelling ------------------------------- */
        this.x_size = x;
        this.y_size = y;
        this.z_size = z;

        this.model_blueprint = model_blueprint;

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

        this.head = head;
        this.tail = tail;

        /* ------------------------------- navigation ------------------------------- */
        this.target_waypoint = createVector(0, 0, 0);
        this.curr_position = random_valid_vector();
        this.curr_velocity = createVector(10, 10, 10);
        this.curr_acceleration = createVector(0, 0, 0);
        this.waypoints = []; //list of next points to hit

        for(let i = 0; i < 1; i++){
            this.waypoints.push(random_valid_vector());
        }

        this.pick_next_point();

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
        let x_heading = createVector(this.curr_position.x, this.curr_position.z).angleBetween(createVector(this.target_waypoint.x, this.target_waypoint.z));
        let y_heading = createVector(this.curr_position.y, this.curr_position.z).angleBetween(createVector(this.target_waypoint.y, this.target_waypoint.z));
        push();
        translate(this.curr_position.x, this.curr_position.y, this.curr_position.z);
        rotateX(x_heading*2);
        rotateY(y_heading*2);
        pop();
    }

    update(){
        /* ------------------------------- head / tail ------------------------------ */
        //if close enough to the target waypoint, then start charting to the next waypoint
        
        //get current position
        this.curr_acceleration = this.target_waypoint.normalize(); //point a normalized vector pointing at the target
        this.curr_velocity.add(this.curr_acceleration);
        this.curr_position.add(this.curr_velocity);

        console.log(this.curr_acceleration);
        
        // console.log(this.curr_position, this.curr_acceleration);
        // let direction_heading = this.curr_position.sub(this.target_waypoint);
        if(this.curr_position.dist(this.target_waypoint) < WAYPOINT_RADIUS){
            this.pick_next_point();
        }
        

    }

    draw(){
        // this.orient_next_point();
        // console.log(direction_heading);
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
            if(i == this.head || i == this.tail){ //bug, not selecting the middle
                ambientMaterial(230, 0, 0);
            }else{
                ambientMaterial(70, 130, 230);
            }

            if(this.model_blueprint[i]){
                this.boids[i].debug();
            }
            
        }

        ambientMaterial(50, 240, 0);
        push();
        translate(this.curr_position.x, this.curr_position.y, this.curr_position.z);
        sphere(10);
        pop();
    }
}