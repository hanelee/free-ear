/*

Wiring diagram

            audioElement --|
(scene --> source).input --- audioElementSource --> gainNode --> reverbNode--------------|
    .output --------------------------------------------|         |                      |
                                                                  |
(scene_--> source_).input ---audioElementSource_ -> gainNode_ ----|    

                                                                                         |
audioElement2 --|                                                                        |
source2.input --- audioElementSource2 --> gainNode2 --> reverbNode2 --> pannerNode----------- gainNode_overall---audioContext.destination

sourceA.input --- audioElementSourceA --> gainNodeA ------------------------|
                                                                                         |
             audioElement3 --|                                                           |
(scene3 --> source3).input --- audioElementSource3 --> gainNode3 --> reverbNode3---------|
     .output ---------------------------------------------|               |
                                                                          |
(scene3_--> source3_).input ---audioElementSource3_ -> gainNode3_ --------|    

Panner: set position of pannerNode instead of source.setposition



*/





let audioContext;



let gainTotalNode;
let gaintotal = 10;

//// PART 1 : 3 LAYERS

let gain = 3;
let gain2 = 1;
let gain3 = 4;


// Layer 1
// Big circular motion of radius r
let scene;
let audioElement;
let audioElementSource;
let source;
let gainNode;
let theta = 0; // Init
let thetaStepSize = Math.PI/500; // Radians
let r = 30;
let z = -15;
let deltaTimeMilliseconds = 10;
let reverbUrl = "http://reverbjs.org/Library/UndergroundCarPark.m4a";
let reverbNode;


// Layer 2
// Random walk within small circular plane (z=0); minR**2 < x**2+y**2 < maxR**2
// Panner
let scene2;
let audioElement2;
let audioElementSource2;
let source2;
let gainNode2;
let maxR = 5;
let minR = 3;
let [x2, y2, z2] = [(maxR+minR)*0.5, 0, 0]; // Initial point
let stepSize2 = 0.3;
let deltaTime2 = 200; // miliseconds
let reverbUrl2 = "http://reverbjs.org/Library/FalklandPalaceRoyalTennisCourt.m4a";
let reverbNode2;


// Layer 3
// Random walk within large half sphere; minR**2 < x**2+y**2+z**2 < maxR**2, z > 0
let scene3;
let audioElement3;
let audioElementSource3;
let source3;
let gainNode3;
let sphereMaxR = 50;
let sphereMinR = 20;
let [x3, y3, z3] = [0, (sphereMaxR+sphereMinR)*0.5, (sphereMaxR+sphereMinR)*0.5]; // Initial point
let stepSize3 = 4;
let deltaTime3 = 50; // miliseconds
let reverbUrl3 = "http://reverbjs.org/Library/StPatricksChurchPatringtonPosition1.m4a";
let reverbNode3;




//// PART 2 : 2 LAYERS

let part2Init = false;
let gainA = 3;
let gainB = 15;

// Layer A --> panner
// Circular movement going up and down a cone
let audioElementA;
let audioElementSourceA;
let sourceA;
let gainNodeA;
let thetaA = 0; // Init
let thetaAStepSize = -Math.PI/250; // Radians
let rA = 15; // Init
let zA = -15; // Init
let stepSizeA = 0.25;
let zminA = -20;
let zmaxA = 30;
let deltaTimeA = 10;
let zADirection = 1; // Init


// Layer B
// Random walk within large half sphere, minR**2 < x**2+y**2+z**2 < maxR**2, z > 0 (=Layer 3)
let sceneB;
let audioElementB;
let audioElementSourceB;
let sourceB;
let gainNodeB;
let sphereMaxRB = 40;
let sphereMinRB = 20;
let [xB, yB, zB] = [0, (sphereMaxRB+sphereMinRB)*0.5, (sphereMaxRB+sphereMinRB)*0.5]; // Initial point
let stepSizeB = 3;
let deltaTimeB = 50; // miliseconds





//// PART 3 : 1', 3 LAYERS

let gain_ = 7;
let gain2_ = 1.8;

// Layer 1
// Big circular motion of radius r
let scene_;
let audioElement_;
let audioElementSource_;
let source_;
let gainNode_;
let r_ = 10;

// Layer 2
// Random walk within small circular plane (z=0); minR**2 < x**2+y**2 < maxR**2
// Panner
let audioElement2_;
let audioElementSource2_;
let gainNode2_;


// Layer 3
// Random walk within large half sphere; minR**2 < x**2+y**2+z**2 < maxR**2, z > 0
let scene3_;
let audioElement3_;
let audioElementSource3_;
let source3_;
let gainNode3_;
let sphereMaxR_ = 50;
let sphereMinR_ = 20;

let audioReady = false;






/**
 * @private
 */


function updateSrcPosition() {
  // Change circling direction with probability 0.01
  if (Math.random() < 0.001) {
    thetaStepSize *= -1;
  }
  theta += thetaStepSize;
  source.setPosition(r*Math.cos(theta), r*Math.sin(theta), z);
}


function updatePannerPosition() {
   // Random walk for x and y, z=0 within circle of radius motionR

  let direction;
  if (Math.random()<0.5) {
    direction = 1;
  } else {
    direction = -1;
  }

  xOrY = Math.random();

  // Move x with probability 0.5, if the moved position is within the range of motion
  if (xOrY < 0.5 &&
      (x2+direction*stepSize2)**2+y2**2 < maxR**2 &&
      (x2+direction*stepSize2)**2+y2**2 > minR**2) {
    x2 += direction*stepSize2;
    pannerNode.setPosition(x2, y2, z2);
  }

  // Move y otherwise, if the moved position is within the range of motion
  if (xOrY >= 0.5 && 
      x2**2+(y2+direction*stepSize2)**2 < maxR**2 && 
      x2**2+(y2+direction*stepSize2)**2 > minR**2) {
    y2 += direction*stepSize2;
    pannerNode.setPosition(x2, y2, z2);
  }
}




function updateSrc3Position() {
  // Random walk within big upper half-sphere

  let direction;
  if (Math.random()<0.5) {
    direction = 1;
  } else {
    direction = -1;
  }

  xyzChoose = Math.random();

  // Move x, y, z each with probability 1/3s, if the moved position is within the range of motion
  if (xyzChoose < 1/3 && 
      (x3+direction*stepSize3)**2+y3**2+z3**2 < sphereMaxR**2 &&
      (x3+direction*stepSize3)**2+y3**2+z3**2 > sphereMinR**2 && z3 > 0) {
    x3 += direction*stepSize3;
    source3.setPosition(x3, y3, z3);
  }

  if (xyzChoose >= 1/3 && xyzChoose < 2/3 &&
      x3**2+(y3+direction*stepSize3)**2+z3**2 < sphereMaxR**2 &&
      x3**2+(y3+direction*stepSize3)**2+z3**2 > sphereMinR**2 && z3 > 0) {
    y3 += direction*stepSize3;
    source3.setPosition(x3, y3, z3);
  }

  if (xyzChoose >= 2/3 && xyzChoose <= 1 &&
      x3**2+y3**2+(z3+direction*stepSize3)**2 < sphereMaxR**2 &&
      x3**2+y3**2+(z3+direction*stepSize3)**2 > sphereMinR**2 && z3+(direction*stepSize3)) {
    z3 += direction*stepSize3;
    source3.setPosition(x3, y3, z3);
  }
}

function updateSrcAPosition() {
  if (part2Init == false) {
    pannerNode.setPosition(0, rA, zminA);
    part2Init = true;
  }
  if (zA >= zmaxA) {
    zADirection = -1;
  }
  if (zA <= zminA) {
    zADirection = 1;
  }
  zA += zADirection*stepSizeA;
  thetaA += thetaAStepSize;
  // rA = -(zA-zmaxA-1);

  pannerNode.setPosition(rA*Math.cos(thetaA), rA*Math.sin(thetaA), zA);
}

function updateSrcBPosition() {
  // Random walk within big upper half-sphere

  let direction;
  if (Math.random()<0.5) {
    direction = 1;
  } else {
    direction = -1;
  }

  xyzChoose = Math.random();

  // Move x, y, z each with probability 1/3s, if the moved position is within the range of motion
  if (xyzChoose < 1/3 && 
      (xB+direction*stepSizeB)**2+yB**2+zB**2 < sphereMaxRB**2 &&
      (xB+direction*stepSizeB)**2+yB**2+zB**2 > sphereMinRB**2 && zB > 0) {
    xB += direction*stepSizeB;
    sourceB.setPosition(xB, yB, zB);
  }

  if (xyzChoose >= 1/3 && xyzChoose < 2/3 &&
      xB**2+(yB+direction*stepSizeB)**2+zB**2 < sphereMaxRB**2 &&
      xB**2+(yB+direction*stepSizeB)**2+zB**2 > sphereMinRB**2 && zB > 0) {
    yB += direction*stepSizeB;
    sourceB.setPosition(xB, yB, zB);
  }

  if (xyzChoose >= 2/3 && xyzChoose <= 1 &&
      xB**2+yB**2+(zB+direction*stepSizeB)**2 < sphereMaxRB**2 &&
      xB**2+yB**2+(zB+direction*stepSizeB)**2 > sphereMinRB**2 && zB+(direction*stepSizeB)) {
    zB += direction*stepSizeB;
    sourceB.setPosition(xB, yB, zB);
  }
}

function updateSrc_Position() {
  // Change circling direction with probability 0.01
  if (Math.random() < 0.001) {
    thetaStepSize *= -1;
  }
  theta += thetaStepSize;
  source_.setPosition(r_*Math.cos(theta), r_*Math.sin(theta), z);
}
function updateSrc3_Position() {
  // Random walk within big upper half-sphere

  let direction;
  if (Math.random()<0.5) {
    direction = 1;
  } else {
    direction = -1;
  }

  xyzChoose = Math.random();

  // Move x, y, z each with probability 1/3s, if the moved position is within the range of motion
  if (xyzChoose < 1/3 && 
      (x3+direction*stepSize3)**2+y3**2+z3**2 < sphereMaxR_**2 &&
      (x3+direction*stepSize3)**2+y3**2+z3**2 > sphereMinR_**2 && z3 > 0) {
    x3 += direction*stepSize3;
    source3_.setPosition(x3, y3, z3);
  }

  if (xyzChoose >= 1/3 && xyzChoose < 2/3 &&
      x3**2+(y3+direction*stepSize3)**2+z3**2 < sphereMaxR_**2 &&
      x3**2+(y3+direction*stepSize3)**2+z3**2 > sphereMinR_**2 && z3 > 0) {
    y3 += direction*stepSize3;
    source3_.setPosition(x3, y3, z3);
  }

  if (xyzChoose >= 2/3 && xyzChoose <= 1 &&
      x3**2+y3**2+(z3+direction*stepSize3)**2 < sphereMaxR_**2 &&
      x3**2+y3**2+(z3+direction*stepSize3)**2 > sphereMinR_**2 && z3+(direction*stepSize3)) {
    z3 += direction*stepSize3;
    source3_.setPosition(x3, y3, z3);
  }
}

function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext);
  reverbjs.extend(audioContext);

  // Create 2 ResonanceAudio scenes for Layers 1 and 3
  scene = new ResonanceAudio(audioContext, {
      ambisonicOrder: 3,
      dimensions: {width: 10, height: 10, depth: 10,},
      materials: {left: 'marble', right: 'marble',
                  front: 'marble', back: 'marble',
                  up: 'marble', down: 'marble',},
  });

  scene_ = new ResonanceAudio(audioContext, {
      ambisonicOrder: 3,
      dimensions: {width: 5, height: 5, depth: 5,},
      materials: {left: 'marble', right: 'marble',
                  front: 'marble', back: 'marble',
                  up: 'marble', down: 'marble',},
  });

  sceneB = new ResonanceAudio(audioContext, {
      ambisonicOrder: 3,
      dimensions: {width: 10, height: 10, depth: 10,},
      materials: {left: 'marble', right: 'marble',
                  front: 'marble', back: 'marble',
                  up: 'marble', down: 'marble',},
  });
  
  scene3 = new ResonanceAudio(audioContext, {
      ambisonicOrder: 3,
      dimensions: {width: 10, height: 10, depth: 10,},
      materials: {left: 'glass-thick', right: 'glass-thick',
                  front: 'glass-thick', back: 'glass-thick',
                  up: 'glass-thick', down: 'glass-thick',},
  });


  // Create Panner for Layer 2
  pannerNode = audioContext.createPanner();
  pannerNode.panningModel = 'HRTF';
  pannerNode.distanceModel = 'inverse';
  pannerNode.refDistance = ResonanceAudio.Utils.DEFAULT_MIN_DISTANCE;
  pannerNode.maxDistance = ResonanceAudio.Utils.DEFAULT_MAX_DISTANCE;


  // Create audio elements. Feed into audio graph.
  audioElement = document.createElement('audio');
  audioElement.src = 'resources/layer1.wav';
  audioElement.load();
  audioElement.loop = false;

  audioElement2 = document.createElement('audio');
  audioElement2.src = 'resources/layer2.wav';
  audioElement2.load();
  audioElement2.loop = false;

  audioElement3 = document.createElement('audio');
  audioElement3.src = 'resources/layer3.wav';
  audioElement3.load();
  audioElement3.loop = false;

  audioElementA = document.createElement('audio');
  audioElementA.src = 'resources/layerA.wav';
  audioElementA.load();
  audioElementA.loop = false;

  audioElementB = document.createElement('audio');
  audioElementB.src = 'resources/layerB.wav';
  audioElementB.load();
  audioElementB.loop = false;

  audioElement_ = document.createElement('audio');
  audioElement_.src = 'resources/layer1__.wav';
  audioElement_.load();
  audioElement_.loop = false;

  audioElement2_ = document.createElement('audio');
  audioElement2_.src = 'resources/layer2__.wav';
  audioElement2_.load();
  audioElement2_.loop = false;

  audioElement3_ = document.createElement('audio');
  audioElement3_.src = 'resources/layer3__.wav';
  audioElement3_.load();
  audioElement3_.loop = false;

  audioElementSource = audioContext.createMediaElementSource(audioElement);
  audioElementSource2 = audioContext.createMediaElementSource(audioElement2);
  audioElementSource3 = audioContext.createMediaElementSource(audioElement3);
  audioElementSourceA = audioContext.createMediaElementSource(audioElementA);
  audioElementSourceB = audioContext.createMediaElementSource(audioElementB);
  audioElementSource_ = audioContext.createMediaElementSource(audioElement_);
  audioElementSource2_ = audioContext.createMediaElementSource(audioElement2_);
  audioElementSource3_ = audioContext.createMediaElementSource(audioElement3_);

  // Create reverb nodes
  reverbNode = audioContext.createReverbFromUrl(reverbUrl);
  reverbNode2 = audioContext.createReverbFromUrl(reverbUrl2);
  reverbNode3 = audioContext.createReverbFromUrl(reverbUrl3);

  // Create gain nodes
  gainNode = audioContext.createGain();
  gainNode2 = audioContext.createGain();
  gainNode3 = audioContext.createGain();
  gainNodeA = audioContext.createGain();
  gainNodeB = audioContext.createGain();
  gainNode_ = audioContext.createGain();
  gainNode2_ = audioContext.createGain();
  gainTotalNode = audioContext.createGain();

  // Create a Source
  source = scene.createSource();
  // source2 = scene2.createSource();
  source3 = scene3.createSource();
  sourceB = sceneB.createSource();
  source_ = scene_.createSource();
  source3_ = scene3.createSource();

  // Connect graph
  // Layer 1
  audioElementSource.connect(source.input);
  scene.output.connect(gainNode);
  gainNode.connect(reverbNode);
  reverbNode.connect(gainTotalNode);

  // Layer 2
  //audioElementSource2.connect(source2.input);
  //scene2.output.connect(gainNode2);
  audioElementSource2.connect(gainNode2); // PANNER
  gainNode2.connect(reverbNode2);
  reverbNode2.connect(pannerNode);
  pannerNode.connect(gainTotalNode);

  // Layer 3
  audioElementSource3.connect(source3.input);
  scene3.output.connect(gainNode3);
  gainNode3.connect(reverbNode3);
  reverbNode3.connect(gainTotalNode);

  // Layer A in panner
  audioElementSourceA.connect(gainNodeA);
  gainNodeA.connect(pannerNode);

  // Layer B in scene 3
  audioElementSourceB.connect(sourceB.input);
  sceneB.output.connect(gainNodeB);
  gainNodeB.connect(reverbNode3);


  //audioElementSourceB.connect(sourceB.input);

  // Layer_ in scene_
  audioElementSource_.connect(source_.input);
  scene_.output.connect(gainNode_);
  gainNode_.connect(reverbNode);

  // Layer2_
  audioElementSource2_.connect(gainNode2_);
  gainNode2_.connect(pannerNode);

  // Layer3_
  audioElementSource3_.connect(source3_.input);


  // Overall gain to audiocontext
  gainTotalNode.connect(audioContext.destination);



  // Assign gain value to gain node
  gainNode.gain.value = gain;
  gainNode2.gain.value = gain2;
  gainNode3.gain.value = gain3;
  gainNodeA.gain.value = gainA;
  gainNodeB.gain.value = gainB;
  gainNode_.gain.value = gain_;
  gainNode2_.gain.value =gain2_;
  gainTotalNode.gain.value = gaintotal;


  // Initialize position
  // The source position is relative to the origin (center of the room).
  source.setPosition(r, 0, 0);
  //source2.setPosition(x2, y2, z2);
  pannerNode.setPosition(x2, y2, z2); // PANNER
  source3.setPosition(x3, y3, z3);
  // sourceA.setPosition(rA*Math.cos(thetaA), rA*Math.sin(thetaA), zA);
  sourceB.setPosition(x3, y3, z3);
  source_.setPosition(r, 0, 0);
  source3_.setPosition(x3, y3, z3);

  audioReady = true;
}





let onLoad = function() {
  // Initialize play button functionality.
  let sourcePlayback = document.getElementById('sourceButton');
  sourcePlayback.onclick = function(event) {
    switch (event.target.textContent) {
      case 'Play': {
        if (!audioReady) {
          initAudio();
        }
        event.target.textContent = 'Pause';
        intervalCallback = window.setInterval(updateSrcPosition, deltaTimeMilliseconds);
        //intervalCallback2 = window.setInterval(updateSrc2Position, deltaTime2);
        intervalCallback2 = window.setInterval(updatePannerPosition, deltaTime2); // PANNER
        intervalCallback3 = window.setInterval(updateSrc3Position, deltaTime3);
        
        audioElement.play();
        audioElement2.play();
        audioElement3.play();
        audioElement.onended = function() {window.clearInterval(intervalCallback);
                                           window.clearInterval(intervalCallback2);
                                           window.clearInterval(intervalCallback3);

                                           intervalCallbackA = window.setInterval(updateSrcAPosition, deltaTimeA);
                                           intervalCallbackB = window.setInterval(updateSrcBPosition, deltaTimeB);
                                           audioElementA.play();
                                           audioElementB.play();
                                          }


        audioElementA.onended = function() {window.clearInterval(intervalCallbackA);
                                            window.clearInterval(intervalCallbackB);
                                            audioElement_.play();
                                            audioElement2_.play();
                                            audioElement3_.play();
                                            intervalCallback_ = window.setInterval(updateSrc_Position, deltaTimeMilliseconds);
                                            intervalCallback2_ = window.setInterval(updatePannerPosition, deltaTime2);
                                            intervalCallback3_ = window.setInterval(updateSrc3_Position, deltaTime3);
                                           }

        audioElement_.onended = function() {console.log("done");}
      }
      break;
      
      case 'Pause': {
        event.target.textContent = 'Play';
        window.clearInterval(intervalCallback);
        window.clearInterval(intervalCallback2);
        window.clearInterval(intervalCallback3);
        window.clearInterval(intervalCallbackA);
        window.clearInterval(intervalCallbackB);
        window.clearInterval(intervalCallback_);
        window.clearInterval(intervalCallback2_);
        window.clearInterval(intervalCallback3_);
        audioElement.pause();
        audioElement2.pause();
        audioElement3.pause();
        audioElementA.pause();
        audioElementB.pause();
        audioElement_.pause();
        audioElement2_.pause();
        audioElement3_.pause();
      }
      break;
    }
  };

  // let canvas = document.getElementById('canvas');
  // let elements = [
  //   {
  //     icon: 'sourceIcon',
  //     x: 0.25,
  //     y: 0.25,
  //     radius: 0.04,
  //     alpha: 0.333,
  //     clickable: false,
  //   },
  //   {
  //     icon: 'listenerIcon',
  //     x: 0.5,
  //     y: 0.5,
  //     radius: 0.04,
  //     alpha: 0.333,
  //     clickable: false,
  //   },
  // ];
  // new CanvasControl(canvas, elements);
};
window.addEventListener('load', onLoad);
