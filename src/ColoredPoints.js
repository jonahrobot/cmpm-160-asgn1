// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGl(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function setupGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Connect up u_Size variable
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    } 
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals for HTML UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 10;
let g_selectedType= POINT;
let g_circle_segments = 10;

function setupHTMLUIActions(){
    document.getElementById('green').onclick = function(){ g_selectedColor = [0.0,1.0,0.0,1.0]; };
    document.getElementById('red').onclick = function(){ g_selectedColor = [1.0,0.0,0.0,1.0]; };
    document.getElementById('clearButton').onclick = function(){ g_shapesList = []; renderAllShapes(); };

    document.getElementById('pointButton').onclick = function(){ g_selectedType=POINT; };
    document.getElementById('triButton').onclick = function(){ g_selectedType=TRIANGLE; };
    document.getElementById('circleButton').onclick = function(){ g_selectedType=CIRCLE; };

    document.getElementById('redSlide').addEventListener('mouseup', function(){g_selectedColor[0] = this.value/100;});
    document.getElementById('greenSlide').addEventListener('mouseup', function(){g_selectedColor[1] = this.value/100;});
    document.getElementById('blueSlide').addEventListener('mouseup', function(){g_selectedColor[2] = this.value/100;});
    document.getElementById('segmentSlide').addEventListener('mouseup', function(){g_circle_segments = this.value;});

    document.getElementById('sizeSlide').addEventListener('mouseup', function(){g_selectedSize = this.value;});
}


function main() {
  
  setupWebGl();
  setupGLSL();

  // Setup actions for HTML elements
  setupHTMLUIActions();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){
    if(ev.buttons == 1){
        click(ev);
    }
  }


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// // Store everything you will draw
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // The array to store the sizes

function click(ev) {

    // Extract the event click and return it in WebGL coordinates
    let [x,y] = convertCordEventToGL(ev);

    let point;

    switch(g_selectedType){
        case CIRCLE:
            point = new Circle();
            point.segments = g_circle_segments;
            break;
        case POINT:
            point = new Point();
            break;
        case TRIANGLE:
            point = new Triangle();
            break;
        default:
            console.error("Error in selected Type")
            break;
    }

    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    
    g_shapesList.push(point);

    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}

function renderAllShapes(){

    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
       g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function convertCordEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}
