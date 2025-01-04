let canvas = document.querySelector('.the-canvas');

let gl = canvas.getContext('webgl');
const timeLimit = 4;
let time = 2.0;
let uniformTime;
let theProgram;
let id;

const vs = `
precision mediump float;
attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

const fs = `
precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

vec3 palette(float t) {
  vec3 a = vec3(0.9, 0.4, 0.45);
  vec3 b = vec3(0.9, 0.3, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.6, 0.416, 0.357);

  return a + b * cos(3.14 * (c * t + d));
}

float circle(vec2 st, float radius) {
  return step(radius * 0.01, dot(st, st) * 3.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 uv0 = uv * 0.3;
  vec3 finalColor = vec3(0.0);
  float speed = 0.01;
  float x = 0.9 * sin(speed * u_time);
  float y = -0.9 * cos(speed * u_time);
  vec2 translate = vec2(x, y);

  vec3 col = vec3(1.0);

  for (float i = 1.0; i < 2.0; i++) {
    uv /= sin(speed * u_time) * circle(uv / x, 1.0);
    // uv /= u_time * 1.5 - 0.5;

    float d = length(uv) * exp(length(uv0));
    col = palette(length(uv0) + i * 0.4 + u_time * 0.4);
    d = sin(d * 4.0 - u_time) / 8.0;
    d = abs(d);
    d = pow(0.03 / d, 1.2);

    finalColor += col * d;

  }


  gl_FragColor = vec4(finalColor, 1.0);
}
`;


function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initShaderProgram(vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function initBuffers() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 3, 3, -1]), gl.STATIC_DRAW);
}

function initLocation() {
  const positionLocation = gl.getAttribLocation(theProgram, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);  
}

function initUniforms() {
  const uResolution = gl.getUniformLocation(theProgram, 'u_resolution');
  gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);

  const uTime = gl.getUniformLocation(theProgram, 'u_time');
  gl.uniform1f(uTime, time);

  return uTime;
}

function start(theVS, theFS) {
  theProgram = initShaderProgram(theVS, theFS);
  initBuffers();
  initLocation();
  uniformTime = initUniforms();
}

start(vs, fs);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

function render(now) {
  time += 0.01;
  
  gl.uniform1f(uniformTime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);  

  if (time >= timeLimit) {
    window.cancelAnimationFrame(render);
    time = 0.0;
    canvas.style.opacity = '0';
    canvas.style.zIndex = '0';
    return;
  }

  id = window.requestAnimationFrame(render);
}

function pause() {
  window.cancelAnimationFrame(id);
}

function hideCanvas() {
  canvas.style.opacity = '0';
  canvas.style.transform = 'scale(1.0)';
  canvas.style.zIndex = '0';
  time = 2.0;
  pause();
}

function displayCanvas() {    
  canvas.style.opacity = '0.75';
  canvas.style.transform = 'scale(1.25)';
  canvas.style.zIndex = '10';
  render();
}