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
  vec3 a = vec3(0.9, 0.5, 0.47);
  vec3 b = vec3(0.8, 0.4, 0.6);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.7, 0.416, 0.357);

  return a + b * cos(3.14 * (c * t + d));
}

float circle(vec2 st, float radius) {
  return step(radius * 0.01, dot(st, st) * 3.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 uv0 = uv * 0.3;
  vec3 finalColor = vec3(0.0);
  float speed = 0.02;
  float x = 0.9 * sin(speed * u_time);
  float y = -0.9 * cos(speed * u_time);
  vec2 translate = vec2(x, y);

  vec3 col = vec3(1.0);

  for (float i = 1.0; i < 2.0; i++) {
    uv /= sin(speed * u_time) * circle(uv / x, 0.5);
    // uv /= u_time * 1.5 - 0.5;

    float d = length(uv) * exp(length(uv0));
    col = palette(length(uv0) + i * 0.4 + u_time * 0.4);
    d = sin(d * 4.0 - u_time) / 8.0;
    d = abs(d);
    d = pow(0.03 / d, 1.2);

    finalColor += col * d;

  }


  gl_FragColor = vec4(finalColor, 0.5);
}
`;

const fs1 = `
precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

void main() {
  gl_FragColor = vec4(gl_FragCoord.x / 500.0, gl_FragCoord.y / 500.0, 0.5, 0.5); // Alpha = 0.5 for partial transparency
}
`;

class ShaderSetup {
  constructor(gl, canvas) {
    this.program = null;
    this.gl = gl;
    this.vs = null;
    this.fs = null;
    this.buffers = null;
    this.positions = [];

    this.canvas = canvas;
    this.uTime = '';
    this.time = 2.0;
    this.limit = 12;
    this.id = '';
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initProgram(vsSource, fsSource) {
    this.vs = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
    this.fs = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, this.vs);
    this.gl.attachShader(shaderProgram, this.fs);
    this.gl.linkProgram(shaderProgram);
    this.gl.useProgram(shaderProgram);

    this.program = shaderProgram;
  }

  initBuffers() {
    this.positions = [-1, -1, -1, 3, 3, -1];

    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
  
    this.buffers = {
      position: positionBuffer
    }
  }

  initLocations() {
    this.gl.useProgram(this.program);

    const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);  
    this.gl.enableVertexAttribArray(positionLocation);

    const uResolution = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.gl.uniform3f(uResolution, this.canvas.width, this.canvas.height, 1.0);

    const uniformTime = this.gl.getUniformLocation(this.program, 'u_time');
    this.gl.uniform1f(uniformTime, this.time);

    this.uTime = uniformTime; 
  }

  setup(vs, fs) {
    this.initProgram(vs, fs);
    this.initBuffers();
    this.initLocations();
    this.clear();
    this.render();
  }

  reset(vs, fs) {
    this.initProgram(vs, fs);
    this.initBuffers();
    this.initLocations();
    this.render();
  }

  clear() {
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    // gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  pause() {
    window.cancelAnimationFrame(this.id);
    this.time = 2.0;
  }

  render() {
    this.time += 0.01;

    this.gl.uniform1f(this.uTime, this.time);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);  

    if (this.time >= this.limit) {
      this.pause();
      return;
    }

    this.id = window.requestAnimationFrame(() => this.render());
  }
}