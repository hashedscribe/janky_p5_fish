// Tracks points on hands in the webcam. 
// Uses p5.js v.1.9.0, and ml5-next-gen (2023):
// https://unpkg.com/ml5@0.20.0-alpha.3/dist/ml5.js

let myWebcam;
let myHandTracker;
let hands = [];
let trackerOptions = { maxHands: 2, flipHorizontal: true };
let webcamAlpha = 255; // reduce this to make video transparent

/* --------------------------------- canvas --------------------------------- */
let bg_shader;

/* --------------------------------- models --------------------------------- */
let test1;

//----------------------------
function setup() {
  createCanvas(X_RANGE, Y_RANGE, WEBGL);
	initializeWebcamAndHandTracker();
  
  let test_model = [];
  let x = 25;
  let y = 10;
  let z = 10;
  
  for(let i = 0; i < x*y*z; i++){
    test_model[i] = (i%1==0);
  }

  test1 = new Model(test_model, x, y, z, floor(z*y/2-z/2), x*y*z - floor(z*y/2-z/2));
}

//----------------------------
function draw() {
  background("#0D1233");

  let shader = true;

  if(shader){
    filter(bg_shader);
  }else{
    perspective(PI / 3.0, width/height, 0.1, 1000000);
  }
  
  drawAllHandPoints(); 
	orbitControl();
  test1.update();
  test1.draw();
  test1.debug();
}

//----------------------------
function drawAllHandPoints(){
  for (let i = 0; i < hands.length; i++) {
    let points_3D = hands[i].keypoints3D; // also available: keypoints3D
    let points_2D = hands[i].keypoints;

    let dist_scale = createVector(points_2D[WRIST].x, points_2D[WRIST].y).dist(createVector(points_2D[MIDDLE_MCP].x, points_2D[MIDDLE_MCP].y));
    dist_mapped = map(dist_scale, 0, 350, 0, 1);

    for (let j = 0; j < points_3D.length; j++) {
      let aKeypoint = points_3D[j];
      let shift_2D = points_2D[j];
      push();
      translate(floor(shift_2D.x/dist_mapped)/3 - X_RANGE/4, floor(shift_2D.y/dist_mapped)/3 - Y_RANGE/4, -200 + dist_scale*dist_mapped*5); //YAY IT WORKS OK COOL COOL COOL
      translate(0, 0 , -aKeypoint.z*1000);
      
      sphere(2);
      pop();
    }
  }
}

//==============================================================
// DON'T CHANGE ANYTHING BELOW THIS LINE.
//
//----------------------------
function initializeWebcamAndHandTracker(){
	// Create the webcam video, and start detecting hands:
  myWebcam = createCapture(VIDEO);
  myWebcam.size(X_RANGE, Y_RANGE).hide();
  myHandTracker.detectStart(myWebcam, gotHands);
}

//----------------------------
function drawWebcamVideo(){
	// Draw the webcam video
	push();
  translate(-width/2, -height/2, 0);
  if (trackerOptions.flipHorizontal){
		translate(myWebcam.width,0); 
		scale(-1,1);
	}
  image(myWebcam, 0, 0, myWebcam.width, myWebcam.height);
	pop();
}

//----------------------------
function preload() {
  // Load the Handpose model.
  bg_shader = loadShader('vertex.glsl', 'fragment.glsl');
  myHandTracker = ml5.handpose(trackerOptions);
}
function gotHands(results) { 
	// If fresh Handpose data is received, store it.
	hands = results;
}

//----------------------------
// The following hand point index labels may be useful:
const WRIST = 0;
const THUMB_CMC = 1;
const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_DIP = 7;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_DIP = 11;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_DIP = 15;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_DIP = 19;
const PINKY_TIP = 20;