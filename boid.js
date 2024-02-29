const SEP_RADIUS = 10;
const COHALI_RAD = 15;

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
        this.vel;
        this.acc;
        //cant do set neighbours bc after panic it needs to check everything
        this.neighbours = []; //neighbours in cross calculation
    }

    calculate_neighbours(){ // in set up or smth, maybe just do in the constructor
        
    }

    add_offset(offset){
        this.offset = this.base.copy().add(offset);
    }

    update(){
        let sep_sum = createVector(0, 0, 0); //position
        let coh_sum = createVector(0, 0, 0); //velocity
        let ali_sum = createVector(0, 0, 0); //position
    
        for(let i = 0; i < this.neighbours.length; i ++){
            /* ------------------------------- separation ------------------------------- */
            //if the neighbour's position is in the sep radius range, add 
            //it to the force that needs to separate this from the group
            if(dist(this.neighbours[i].pos, this.pos) < SEP_RADIUS){
                sep_sum.add(this.neighbours[i].pos);
            }

            /* -------------------------- cohesion / alignment -------------------------- */
            if(dist(this.neighbours[i].pos, this.pos) < COHALI_RAD){
                coh_sum.add(this.neighbours[i].vel);
                ali_sum.add(this.neighbours[i].pos);
            }
        }

        /* --------------------------------- neyhhh --------------------------------- */

        // homing
        if(this.pos.dist(this.base) > this.parent.boids_spacing){
            console.log("OUT OF HOME");
            ali_sum = this.base;
        }
    
        //object aviodance (RUN)

        this.acc = 0/this.neighbours.length; //do math here;
        this.acc.normalize(); //no crazy forccs
        
        //make sure it doesnt go over max;
        this.vel += this.acc;
        //make sure it doesnt go over max;


        /* -------------------------------------------------------------------------- */

        //final step
        this.pos += this.vel + this.parent.offset[this.index];
    }

    draw(){
        push();
        translate(this.pos.x, this.pos.y, this.pos.z);
        sphere(this.parent.boids_size);
        pop();
    }

    debug(){
        /* -------------------------- reveal home position -------------------------- */
        push();
        translate(this.offset.x, this.offset.y, this.offset.z);
        sphere(this.parent.boids_size/2);
        pop();
    }

    
}