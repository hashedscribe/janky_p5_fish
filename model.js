const X_RANGE = 640*2;
const Y_RANGE = 480*2;
const Z_RANGE = 400; //might have to recalculate

const MIN_SCREEN_DIST = 50;

const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

const WAYPOINT_RADIUS = 5;

function random_valid_vector(){
    x = -X_RANGE/4 + random(X_RANGE/2);
    y = -Y_RANGE/4 + random(Y_RANGE/2);
    z = random(Z_RANGE);
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

        for(let i = 0; i < 1000; i++){
            this.waypoints.push(random_valid_vector());
        }

        this.pick_next_point();

        /* --------------------------------- offset --------------------------------- */
        this.xfunc; // maybe
        this.yfunc;
        this.zfunc;
    }
    
    pick_next_point(){ //picks the next point to move to

        //include search for smallest change in direction to avoid the 

        let best_waypoint = this.waypoints[0];
        let best_distance = 0;
        for(let i = 1; i < this.waypoints.length; i++){
            let temp_distance = this.curr_position.dist(this.waypoints[i]);
            if(temp_distance < best_distance){
                best_distance = temp_distance;
                best_waypoint = this.waypoints[i];
            }
        }

        this.target_waypoint = best_waypoint;

        this.waypoints.splice(this.waypoints.indexOf(this.target_waypoint), 1);
        this.waypoints.push(random_valid_vector());
    }
    
    // orient_next_point(){ //move the head and tail so that it's in line (or smth similar)
    //     let x_heading = createVector(this.curr_position.x, this.curr_position.z).angleBetween(createVector(this.target_waypoint.x, this.target_waypoint.z));
    //     let y_heading = createVector(this.curr_position.y, this.curr_position.z).angleBetween(createVector(this.target_waypoint.y, this.target_waypoint.z));
    //     push();
    //     translate(this.curr_position.x, this.curr_position.y, this.curr_position.z);
    //     rotateX(x_heading*2);
    //     rotateY(y_heading*2);
    //     pop();
    // }

    vector_sum(vectors){
        let final = createVector(0, 0, 0);
        for(let i = 0; i < vectors.length; i++){
            final.add(vectors[i]);
        }
        return final;
    }


    move_points(){
        for(let i = 0; i < this.boids.length; i++){
            let translation = this.curr_position;

            let mapped_x = map(this.boids[i].base.x, 0, this.x_size, 0, 0.5);
            let y_animation = createVector(0, 0, sin(millis()/500+mapped_x)*10);

            let vectors = [
                createVector(0, 0, 0),
                translation,
                y_animation
            ]

            this.boids[i].add_offset(this.vector_sum(vectors));
        }
    }



    update(){
        /* ------------------------------- head / tail ------------------------------ */
        
        let tar_dist = this.curr_position.dist(this.target_waypoint);
        let mapped_dist = map(tar_dist, 400, 0, 3, 2); //speed mapping
        let direction = this.target_waypoint.copy().sub(this.curr_position);
        direction.normalize();
        direction.mult(mapped_dist);
        this.curr_position.add(direction);

        this.move_points();


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

        // ambientMaterial(255, 130, 230);
        // for(let i = 0; i < this.waypoints.length; i++){
        //     push();
        //     translate(this.waypoints[i].x, this.waypoints[i].y, this.waypoints[i].z);
        //     sphere(10);
        //     pop();
        // }
        
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