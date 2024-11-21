// B. Kell 2/2024
// Starter file for CSC 372 Assignment 05
"use strict";

var gl;
var program, canvas;

var corners, verts;
var vertBuffer;
var aPosition;
var tFactor;

// Initial vertices for the original equilateral triangle
corners = [
  vec2( 0.0,  0.9),
  vec2( 0.8, -0.5),
  vec2(-0.8, -0.5)
];

// The verts array will hold the vertices for the final figure (initially empty)
verts = [];

// Ask the user to specify the tessellation factor
//
tFactor = 0;
////////////////////// FILL IN HERE

window.onload = function init()
{
  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.84, 0.85, 0.86, 1.0);  // Light Gray

  //  Load shaders
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create the vertices, recursing to 'tFactor' depth.
  // Start with the original corners
  triangle(corners[0], corners[1], corners[2], tFactor);

  //  Initialize the attribute buffer
  vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);

  aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  render();
}

function triangle(a, b, c, count) {
  if (count == 0) {     // BASE CASE
    // push the points of the triangle onto the vertices array such that
    // they define three line segments
    verts.push(
      a, b,
      a, c,
      b, c
    );
  } else {               // RECURSIVE CASE
    // Create the midpoints of the three sides
    var ab = mix(a, b, 0.5);  // mix() is defined in MV.js.  It creates a
    var ac = mix(a, c, 0.5);  // midpoint between the first two arguments
    var bc = mix(b, c, 0.5);

    // Recursively call triangle() to make sub-triangles from those midpoints
    //
    ////////////////////// FILL IN HERE
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, verts.length);
}
