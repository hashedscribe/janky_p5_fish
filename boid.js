const SEP_RADIUS = 20;
const COHALI_RAD = 15;
const BOID_MAXSPEED = 1;
const BOID_MAXFORCE = 0.2;
const LAW_TOLERANCE = 5;
const LAW_SWITCH_THRESHOLD = 2/3; //a ratio of num of points that are allowed to be bad

class Boid{
    constructor(parent, index){
        this.parent = parent;
        this.index = index; // index in the 3d array

        let basex = floor(this.index/(this.parent.y_size*this.parent.z_size)) - floor(this.parent.x_size/2);
        let basey = floor(this.index/this.parent.z_size%this.parent.y_size) - floor(this.parent.y_size/2);
        let basez = this.index%this.parent.z_size - floor(this.parent.z_size/2);

        this.base = createVector(basex, basey, basez).mult(this.parent.boids_spacing);
        this.offset = this.base;

        this.pos = createVector(0, 0, 0).add(this.offset);
        this.vel = random_valid_vector().limit(BOID_MAXSPEED);
        this.acc = createVector(0, 0, 0);
        this.hold_force;

        this.prev_in_radius = [];
        this.prev_too_close = [];

        this.num_of_ref_points = 15;
        this.ref_points = [];
    }

    add_offset(offset){
        this.offset = this.base.copy().add(offset);
    }

    align(in_radius){
        let ali_sum = createVector(0, 0, 0); //velocity
        if(in_radius.length == 0) return ali_sum;
        for(let i = 0; i < in_radius; i++){
            ali_sum.add(in_radius[i].vel)
        }
        
        ali_sum.div(in_radius.length);
        ali_sum.setMag(BOID_MAXSPEED);
        ali_sum.sub(this.vel);
        ali_sum.limit(BOID_MAXFORCE);
        return ali_sum;
    }

    cohesion(in_radius){
        let coh_sum = createVector(0, 0, 0); //velocity
        if(in_radius.length == 0) return coh_sum;
        for(let i = 0; i < in_radius; i++){
            coh_sum.add(in_radius[i].pos);
        }
        
        coh_sum.div(in_radius.length);
        coh_sum.sub(this.pos);
        coh_sum.setMag(BOID_MAXSPEED);
        coh_sum.sub(this.vel);
        coh_sum.limit(BOID_MAXFORCE);
        return coh_sum;
    }

    separation(too_close){
        let sep_sum = createVector(0, 0, 0); //velocity
        if(too_close.length == 0) return sep_sum;

        for(let i = 0; i < too_close.length; i++){
            let distance = dist(
                this.pos.x,
                this.pos.y,
                this.pos.z,
                too_close[i].pos.x,
                too_close[i].pos.y,
                too_close[i].pos.z,
            );

            let diff = p5.Vector.sub(this.pos, too_close[i].pos);
            // diff.div(distance);
            sep_sum.add(diff);
        }
        
        sep_sum.div(too_close.length);
        sep_sum.setMag(BOID_MAXSPEED);
        sep_sum.sub(this.vel);
        sep_sum.limit(BOID_MAXFORCE);
        return sep_sum;
    }

    homing(){
        let home = this.offset;
        home.sub(this.pos);
        home.setMag(BOID_MAXSPEED);
        home.sub(this.vel);

        return home;
    }

    define_ref_points(){
        for(let i = 0; i < this.num_of_ref_points; i++){
            let index = floor(random(0, this.parent.boids.length));
            if(this.parent.model_blueprint[index]){
                this.ref_points.push(createVector(index, this.base.dist(this.parent.boids[index].base))) //index and exp val
            }
        }
        this.num_of_ref_points = this.ref_points.length;
    }

    choose_law(){ //THE HIGHER THE SCORE, THE WORSE THE DATA
        let score = 0;
        for(let i = 0; i < this.num_of_ref_points; i++){
            let index = this.ref_points[i].x;
            let expected_value = this.ref_points[i].y;
            let distance = this.pos.dist(this.parent.boids[index].pos);

            if(abs(distance-expected_value) > LAW_TOLERANCE){
                score++;
            }
        }
        return score;
    }

    calculate_forces(){ //O(n^2) time, really, really bad like oml i cannot
        this.hold_force = createVector(0, 0, 0); 

        let in_radius = this.prev_in_radius;
        let too_close = this.prev_too_close;

        if(this.choose_law() > floor(LAW_SWITCH_THRESHOLD*this.num_of_ref_points)){ // theres gotta be a way to make this more efficient
            print("recalculating");
            for(let i = 0; i < this.parent.boids.length; i ++){
                if(this.parent.model_blueprint[i]){
                    let distance = dist(
                        this.pos.x,
                        this.pos.y,
                        this.pos.z,
                        this.parent.boids[i].pos.x,
                        this.parent.boids[i].pos.y,
                        this.parent.boids[i].pos.z,
                    );
                    if(this.parent.boids != this){
                        if(distance < COHALI_RAD){
                            in_radius.push(this.parent.boids[i]);
                        }
                        if(distance < SEP_RADIUS){
                            too_close.push(this.parent.boids[i]);
                        }
                    }
                }
            }
            this.prev_in_radius = in_radius;
            this.prev_too_close = too_close;
        }

        let alignment = this.align(in_radius);
        let cohesion = this.cohesion(in_radius);
        let separation = this.separation(too_close);

        this.hold_force.add(alignment);
        this.hold_force.add(cohesion);
        this.hold_force.add(separation);
    }

    update(){
        this.acc = this.hold_force;
        this.vel.add(this.acc).limit(BOID_MAXSPEED);
        this.vel.add(this.homing());
        this.pos.add(this.vel);
    }

    draw(){
        push();
        translate(this.pos.x, this.pos.y, this.pos.z);
        sphere(this.parent.boids_size);
        // sphere(2);
        pop();
    }

    debug(){
        /* -------------------------- reveal home position -------------------------- */
        // push();
        // translate(this.offset.x, this.offset.y, this.offset.z);
        // sphere(this.parent.boids_size/2);
        // pop();
    }

    
}