window.onload = () => {
  // WebGL 2.0コンテキストを取得する
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  // floatのテクスチャを有効にする
  gl.getExtension('OES_texture_float_linear');
  gl.getExtension('EXT_color_buffer_float');

  // 定数
  const N = 512;

  // 背景を白にする
  const white: number[] = [1.0, 1.0, 1.0, 1.0];
  gl.clearBufferfv(gl.COLOR, 0, white);

  // データを用意する
  const index: number[] = [];
  const p: number[] = [];
  const v: number[] = [];
  const a: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < N; i++) {
    index.push(i);
    p.push(2 * Math.random() - 1);
    p.push(2 * Math.random() - 1);
    p.push(0.0);
    p.push(1.0);
    for (let j = 0; j < 4; j++) {
      v.push(0);
      a.push(0);
    }
    m.push(1.0e+2);
  }
  const iindex = new Float32Array(index);
  const pp = new Float32Array(p);
  const vv = new Float32Array(v);
  const aa = new Float32Array(a);
  const mm = new Float32Array(m);

  // テクスチャを生成する
  const ppTex: WebGLTexture[] = [];
  const vvTex: WebGLTexture[] = [];
  const aaTex: WebGLTexture[] = [];
  const mmTex: WebGLTexture[] = [];
  ppTex[0] = transfer_data(gl, pp, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  vvTex[0] = transfer_data(gl, vv, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  aaTex[0] = transfer_data(gl, aa, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  mmTex[0] = transfer_data(gl, mm, 1, gl.R32F, gl.RED, gl.FLOAT);
  ppTex[1] = transfer_data(gl, pp, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  vvTex[1] = transfer_data(gl, vv, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  aaTex[1] = transfer_data(gl, aa, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);

  // シェーダをコンパイル
  const vs = compile_shader(gl, gl.VERTEX_SHADER,  require('./glsl/vert.glsl').default);
  const fs = compile_shader(gl, gl.FRAGMENT_SHADER,  require('./glsl/frag.glsl').default);

  // シェーダをリンクする
  const program = link_shader(gl, vs, fs);

  let n = 0;

  swapping();

  function swapping() {
    // GPGPUシェーダを使用
    gl.useProgram(program);

    // in変数をVBOと関連付ける
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, iindex, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'index');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // フレームバッファをバインドする
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);

    // テクスチャをレンダーターゲットに指定
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, ppTex[(n % 2) ? 0 : 1], 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D, vvTex[(n % 2) ? 0 : 1], 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2,
      gl.TEXTURE_2D, aaTex[(n % 2) ? 0 : 1], 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1,
    gl.COLOR_ATTACHMENT2]);

    // uniform変数とテクスチャを関連付ける
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ppTex[(n % 2) ? 1 : 0]);
    gl.uniform1i(gl.getUniformLocation(program, 'p'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, vvTex[(n % 2) ? 1 : 0]);
    gl.uniform1i(gl.getUniformLocation(program, 'v'), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, aaTex[(n % 2) ? 1 : 0]);
    gl.uniform1i(gl.getUniformLocation(program, 'a'), 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, mmTex[0]);
    gl.uniform1i(gl.getUniformLocation(program, 'm'), 3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, ppTex[(n % 2) ? 1 : 0]);
    gl.uniform1i(gl.getUniformLocation(program, 'global_p'), 4);

    // 描画命令
    gl.viewport(0, 0, N, 1);
    gl.drawArrays(gl.POINTS, 0, N);

    if (n === 0) {
      n = 1;
    } else {
      n = 0;
    }
    requestAnimationFrame(swapping);
  }
};

function transfer_data(gl: WebGL2RenderingContext, list: Float32Array,
                       dimension: number, iformat: number,
                       format: number, type: number) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, iformat, list.length / dimension, 1, 0,
    format, type, list);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return tex;
}

function compile_shader(gl: WebGL2RenderingContext,
                        type: number, source: string) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s));
  }
  return s;
}

function link_shader(gl: WebGL2RenderingContext,
                     vs: WebGLShader, fs: WebGLShader) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return p;
}
