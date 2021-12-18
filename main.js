// Original code by Apoorva Joshi (https://apoorvaj.io/exploring-bump-mapping-with-webgl/)

main().catch(error => {
  console.error(error)
})

async function main () {
  const [frag_src, vert_src] = await Promise.all([loadFile('pom.frag'), loadFile('pom.vert')])
  await domReady()

  const canvas = document.getElementsByTagName("canvas")[0];
  const gl = canvas.getContext("webgl");

  // Init GL flags
  gl.clearColor(...[100, 30, 20].map(channel => channel / 255), 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);

  // Init shaders
  const frag = get_shader(gl, frag_src, true);
  const vert = get_shader(gl, vert_src, false);
  const pgm = gl.createProgram();
  gl.attachShader(pgm, vert);
  gl.attachShader(pgm, frag);
  gl.linkProgram(pgm);

  if (!gl.getProgramParameter(pgm, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shader));
  }

  gl.useProgram(pgm);
  const attr_pos = gl.getAttribLocation(pgm, "vert_pos");
  gl.enableVertexAttribArray(attr_pos);
  const attr_tang = gl.getAttribLocation(pgm, "vert_tang");
  gl.enableVertexAttribArray(attr_tang);
  const attr_bitang = gl.getAttribLocation(pgm, "vert_bitang");
  gl.enableVertexAttribArray(attr_bitang);
  const attr_uv = gl.getAttribLocation(pgm, "vert_uv");
  gl.enableVertexAttribArray(attr_uv);

  // Init meshes

  // Positions
  const vbo_pos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo_pos);

  const verts = [
    // Front
    -1, -1,  1,
     1,  1,  1,
    -1,  1,  1,
     1, -1,  1,

    // Back
    -1, -1, -1,
     1,  1, -1,
    -1,  1, -1,
     1, -1, -1,

    // Right
     1, -1, -1,
     1,  1,  1,
     1, -1,  1,
     1,  1, -1,

    // Left
    -1, -1, -1,
    -1,  1,  1,
    -1, -1,  1,
    -1,  1, -1,

    // Top
    -1,  1, -1,
     1,  1,  1,
    -1,  1,  1,
     1,  1, -1,

    // Bottom
    -1, -1, -1,
     1, -1,  1,
    -1, -1,  1,
     1, -1, -1,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Tangents
  const vbo_tang = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo_tang);

  const tangs = [
    // Front
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,

    // Back
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,

    // Right
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,

    // Left
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,

    // Top
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,

    // Bottom
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangs), gl.STATIC_DRAW);

  // Bitangents
  const vbo_bitang = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo_bitang);

  const bitangs = [
    // Front
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,

    // Back
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,

    // Right
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,

    // Left
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,
    0, -1,  0,

    // Top
    0,  0,  1,
    0,  0,  1,
    0,  0,  1,
    0,  0,  1,

    // Bottom
    0,  0, -1,
    0,  0, -1,
    0,  0, -1,
    0,  0, -1,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitangs), gl.STATIC_DRAW);

  // UVs
  const vbo_uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo_uv);

  const uvs = [
    0,  1,  1,  0,  0,  0,  1,  1, // Front
    1,  1,  0,  0,  1,  0,  0,  1, // Back
    1,  1,  0,  0,  0,  1,  1,  0, // Right
    0,  1,  1,  0,  1,  1,  0,  0, // Left
    0,  0,  1,  1,  0,  1,  1,  0, // Top
    0,  1,  1,  0,  0,  0,  1,  1, // Bottom
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

  const index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

  const indices = [
    0,  1,  2,     0,  3,  1,  // Front
    4,  6,  5,     4,  5,  7,  // Back
    8,  9,  10,    8,  11, 9,  // Right
    12, 14, 13,    12, 13, 15, // Left
    16, 18, 17,    16, 17, 19, // Top
    20, 21, 22,    20, 23, 21, // Bottom
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Init textures
  const tex_depth = load_texture(gl, "bump_depth")
  const tex_diffuse = load_texture(gl, "bump_diffuse")
  const tex_norm = load_texture(gl, "bump_normal")

  const state = {
    attr_bitang,
    attr_pos,
    attr_tang,
    attr_uv,
    index_buffer,
    indices,
    tex_depth,
    tex_diffuse,
    tex_norm,
    vbo_bitang,
    vbo_pos,
    vbo_tang,
    vbo_uv,
  }

  const startTime = Date.now();

  function tick () {
    state.elapsed = Date.now() - startTime;
    update_and_render(canvas, gl, pgm, state);
    requestAnimationFrame(tick);
  }

  tick();
}

function update_and_render (canvas, gl, pgm, state) {
  const targetWidth = window.outerWidth;
  const targetHeight = window.outerHeight;
  const {width, height} = canvas;

  if (width !== targetWidth || height !== targetHeight) {
    canvas.width  = targetWidth;
    canvas.height = targetHeight;
    gl.viewport(0, 0, targetWidth, targetHeight);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const a = mtx_perspective(40, width / height, 0.1, 100);
  const b = mtx_translation(0, 0, -5.5);
  const c = mtx_rotation_x(state.elapsed * 0.001);
  const d = mtx_rotation_y(state.elapsed * 0.001);

  const model = mtx_mul(mtx_mul(b, c), d);

  gl.uniformMatrix4fv(gl.getUniformLocation(pgm, "model_mtx"), false, model);
  gl.uniformMatrix4fv(gl.getUniformLocation(pgm, "norm_mtx"), false, mtx_transpose(mtx_inverse(model)));
  gl.uniformMatrix4fv(gl.getUniformLocation(pgm, "proj_mtx"), false, mtx_mul(a, model));

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.tex_norm);
  gl.uniform1i(gl.getUniformLocation(pgm, "tex_norm"), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, state.tex_diffuse);
  gl.uniform1i(gl.getUniformLocation(pgm, "tex_diffuse"), 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, state.tex_depth);
  gl.uniform1i(gl.getUniformLocation(pgm, "tex_depth"), 2);

  gl.bindBuffer(gl.ARRAY_BUFFER, state.vbo_pos);
  gl.vertexAttribPointer(state.attr_pos, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, state.vbo_tang);
  gl.vertexAttribPointer(state.attr_tang, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, state.vbo_bitang);
  gl.vertexAttribPointer(state.attr_bitang, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, state.vbo_uv);
  gl.vertexAttribPointer(state.attr_uv, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.index_buffer);
  gl.drawElements(gl.TRIANGLES, state.indices.length, gl.UNSIGNED_SHORT, 0);
}

function get_shader (gl, src, is_frag) {
  const shader = gl.createShader(is_frag ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));

    return null;
  }

  return shader;
}

function load_texture (gl, id) {
  const tex = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red

  const img = new Image();

  img.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  img.src = document.getElementById(id).href;

  return tex;
}

/*
  Matrix utility functions

  Note that OpenGL expects column-major arrays, but JavaScript, is row-major.
  So each matrix in code is written as the transpose of its mathematical form.
*/
function mtx_zero () {
  return [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
  ];
}

function mtx_identity () {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

function mtx_mul (a, b) {
  const c = mtx_zero();

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        c[i + j*4] += a[i + k*4] * b[k + j*4];
      }
    }
  }

  return c;
}

function mtx_transpose (a) {
  const b = mtx_zero();

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      b[i + j*4] = a[j + i*4];
    }
  }

  return b;
}

function mtx_inverse (m) {
  const inv = mtx_zero();

  inv[0]  =  m[5] * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
  inv[4]  = -m[4] * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
  inv[8]  =  m[4] * m[9]  * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
  inv[12] = -m[4] * m[9]  * m[14] + m[4]  * m[10] * m[13] + m[8]  * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
  inv[1]  = -m[1] * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
  inv[5]  =  m[0] * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
  inv[9]  = -m[0] * m[9]  * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
  inv[13] =  m[0] * m[9]  * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
  inv[2]  =  m[1] * m[6]  * m[15] - m[1]  * m[7]  * m[14] - m[5]  * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7]  - m[13] * m[3] * m[6];
  inv[6]  = -m[0] * m[6]  * m[15] + m[0]  * m[7]  * m[14] + m[4]  * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7]  + m[12] * m[3] * m[6];
  inv[10] =  m[0] * m[5]  * m[15] - m[0]  * m[7]  * m[13] - m[4]  * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7]  - m[12] * m[3] * m[5];
  inv[14] = -m[0] * m[5]  * m[14] + m[0]  * m[6]  * m[13] + m[4]  * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6]  + m[12] * m[2] * m[5];
  inv[3]  = -m[1] * m[6]  * m[11] + m[1]  * m[7]  * m[10] + m[5]  * m[2] * m[11] - m[5] * m[3] * m[10] - m[9]  * m[2] * m[7]  + m[9]  * m[3] * m[6];
  inv[7]  =  m[0] * m[6]  * m[11] - m[0]  * m[7]  * m[10] - m[4]  * m[2] * m[11] + m[4] * m[3] * m[10] + m[8]  * m[2] * m[7]  - m[8]  * m[3] * m[6];
  inv[11] = -m[0] * m[5]  * m[11] + m[0]  * m[7]  * m[9]  + m[4]  * m[1] * m[11] - m[4] * m[3] * m[9]  - m[8]  * m[1] * m[7]  + m[8]  * m[3] * m[5];
  inv[15] =  m[0] * m[5]  * m[10] - m[0]  * m[6]  * m[9]  - m[4]  * m[1] * m[10] + m[4] * m[2] * m[9]  + m[8]  * m[1] * m[6]  - m[8]  * m[2] * m[5];

  let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

  if (det == 0) {
    console.log("Error: Non-invertible matrix");

    return mtx_zero();
  }

  det = 1 / det;

  for (let i = 0; i < 16; i++) {
    inv[i] *= det;
  }

  return inv;
}

function mtx_translation (x, y, z) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ];
}

function mtx_rotation_x (r) {
  const c = Math.cos(r)
  const s = Math.sin(r)

  return [
    1, 0,  0, 0,
    0, c,  s, 0,
    0, -s, c, 0,
    0, 0,  0, 1,
  ];
}

function mtx_rotation_y (r) {
  const c = Math.cos(r)
  const s = Math.sin(r)

  return [
    c, 0, -s, 0,
    0, 1, 0,  0,
    s, 0, c,  0,
    0, 0, 0,  1,
  ];
}

function mtx_perspective (fov_y, aspect, z_near, z_far) {
  const top = z_near * Math.tan(fov_y * Math.PI / 360);
  const bot = -top;
  const left = bot * aspect;
  const right = top * aspect;

  const X = 2 * z_near / (right - left);
  const Y = 2 * z_near / (top - bot);
  const A = (right + left) / (right - left);
  const B = (top + bot) / (top - bot);
  const C = -(z_far + z_near) / (z_far - z_near);
  const D = -2 * z_far * z_near / (z_far - z_near);

  return [
    X, 0, 0,  0,
    0, Y, 0,  0,
    A, B, C, -1,
    0, 0, D,  0,
  ];
}

function domReady () {
  return new Promise(resolve => {
    if (document.readyState !== 'loading') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', resolve);
    }
  })
}

async function loadFile (url) {
  const response = await fetch(url)

  if (!response.ok) throw new Error(`Failed to load ${url}`)

  return response.text()
}
