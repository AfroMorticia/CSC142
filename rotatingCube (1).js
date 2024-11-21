// Trinity Holmes 4/2024
// CSC 372 Assignment 09 Spring 2024
// Rotating Cube

"use strict";

var canvas;
var gl;
var program;
var canvasBorder, mouseX, mouseY;
var pt, vertsArray;
var cubeMove = true;
var axisX    = false;
var axisY    = false;
var axisZ    = false;
var angleX   = 0;
var angleY   = 0;
var angleZ   = 0;
// CTM is the Current Transformation Matrix
var CTM;  

// There are eight vertices (corners of the cube)
var vertices = [
    vec3(  0.2,  0.2, -0.3 ),
    vec3(  0.2,  0.8, -0.3 ),
    vec3(  0.8,  0.8, -0.3 ),
    vec3(  0.8,  0.2, -0.3 ),
    vec3(  0.2,  0.2,  0.3 ),
    vec3(  0.2,  0.8,  0.3 ),
    vec3(  0.8,  0.8,  0.3 ),
    vec3(  0.8,  0.2,  0.3 )
];

// Indices of the 12 triangles that comprise the cube, ensuring that
// the triangles are rendered in the correct order. (Each square face
// of the cube is made of two triangles.) This allows us to avoid 
// duplicating vertices that must be handled by the vertex shader. 
// (Each vertex is used by 3 triangles.)
var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

window.onload = function init() {
  canvas = document.getElementById( "gl-canvas" );

  gl = canvas.getContext('webgl2');
  if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

  winResize();  // This includes setting the viewport
  gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

  // Hidden surface removal
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // triangle element buffer
  // An element is an array of indices for which vertices to use to create
  //  the item.  A triangle element is thus an array of three indices; each
  //  index specifies a particular vertex.  This allows one vertex to be
  //  used by multiple elements.
  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  // color array attribute buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

  var aColor = gl.getAttribLocation( program, "aColor" );
  gl.vertexAttribPointer( aColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( aColor );

  // vertex array attribute buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

  var aPosition = gl.getAttribLocation( program, "aPosition" );
  gl.vertexAttribPointer( aPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( aPosition );

  // Event listeners:

  // Window resize
  window.addEventListener("resize", winResize);

  // Select rotational axes
  document.getElementById( "xButton" ).onclick = function () { 
    axisX = ! axisX; };//toggle the boolean
  document.getElementById( "yButton" ).onclick = function () { 
    axisY= ! axisY;};
  document.getElementById( "zButton" ).onclick = function () { 
    axisZ = ! axisZ;
  };
  document.getElementById( "pause" ).onclick = function () { 
    cubeMove = !cubeMove };
  document.getElementById( "reset" ).onclick = function () { 
    angleX = 0
    angleY = 0
    angleZ = 0
    axisX  = false;
    axisY  = false;
    axisZ  = false;
    cubeMove = true;
  };
  canvas.addEventListener("mousedown", function() {
    canvasBorder = canvas.getBoundingClientRect();
    mouseX = event.clientX - canvasBorder.left;  // window-x
    mouseY = event.clientY - canvasBorder.top;   // window-y

    var clipX = ( 2 * mouseX / canvas.width ) - 1;
    var clipY = 1 - ( 2 * mouseY / canvas.height );


    CTM[12] = clipX;
    CTM[13] = clipY;
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

});
  render();
}

function render()
{
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(cubeMove) {
    // Increase the angle by 1 degree per render frame
    if ( axisX ) {angleX += 1.0};
    if ( axisY ) {angleY += 1.0}
    if ( axisZ ) {angleZ += 1.0}

    // The CTM is the current tranformation matrix for the cube. It includes
    // the concatenation of all trnaforms to be applied. Remember that the 
    // last transform multiplied is the first to be applied to the object.

    CTM = mat4();
    CTM = mult(CTM, translate( 0.5, 0.5, 0.0 ));
    CTM = mult(CTM, scale( 0.8 * canvas.height/ canvas.width, 0.8, 0.8 ))                     // Initialize CTM as the identity matrix.
    CTM = mult(CTM, rotateX(angleX)); // Matrix multiplication
    CTM = mult(CTM, rotateY(angleY));
    CTM = mult(CTM, rotateZ(angleZ));;
    CTM = mult(CTM, translate( -0.5, -0.5, 0.0));

    // Make the current transform available to the vertex shader
    var CTMLoc = gl.getUniformLocation(program, "CTM");
    gl.uniformMatrix4fv(CTMLoc, false, flatten(CTM));
  }

  // An "element" is a collection of arrays of vertex indices.  Drawing  
  // the cube in this way takes care of separating the triangles (instead of 
  // of using TRIANGLE_FAN or TRIANGLE_STRIP) without using a for loop.
  gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );

  requestAnimationFrame( render );
}

function winResize () {
  // Keep the canvas within the window
// ADD CODE HERE TO MAKE THE CANVAS RESIZE PROPERLY

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.viewport( 0, 0, window.innerWidth,  window.innerHeight);
}