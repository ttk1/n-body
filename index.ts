window.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = 500;
  canvas.height = 500;
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  // floatのテクスチャを有効にする
  gl.getExtension('OES_texture_float_linear');
  gl.getExtension('EXT_color_buffer_float');

  // 質点数
  const N = 10;

  // 背景を白にする
  const white: number[] = [1.0, 1.0, 1.0, 1.0];
  gl.clearBufferfv(gl.COLOR, 0, white);
  gl.viewport(0, 0, N, 1);

  // データを用意する
  const p: number[] = [];
  const v: number[] = [];
  const a: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < N; i++) {
    p.push(2 * Math.random() - 1);
    p.push(2 * Math.random() - 1);
    p.push(0.0);
    p.push(1.0);
    for (let j = 0; j < 4; j++) {
      v.push(0);
      a.push(0);
    }
    m.push(1.0e+2);
    m.push(0.0);
    m.push(0.0);
    m.push(0.0);
  }
  const P = new Float32Array(p);
  const V = new Float32Array(v);
  const A = new Float32Array(a);
  const M = new Float32Array(m);

  // テクスチャの生成
  function createTexture(list: Float32Array,
                         dimension: number, iformat: number,
                         format: number, type: number) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, iformat, list.length / dimension, 1, 0,
      format, type, list);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  const mTex = createTexture(M, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  const pTex: WebGLTexture[] = [];
  const vTex: WebGLTexture[] = [];
  const aTex: WebGLTexture[] = [];
  pTex[0] = createTexture(P, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  vTex[0] = createTexture(V, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  aTex[0] = createTexture(A, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  pTex[1] = createTexture(P, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  vTex[1] = createTexture(V, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);
  aTex[1] = createTexture(A, 4, gl.RGBA32F, gl.RGBA, gl.FLOAT);

  // シェーダプログラムの設定
  function getShader(type: number, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const program = gl.createProgram();
  const vertexShader = getShader(gl.VERTEX_SHADER, require('./glsl/vert.glsl').default);
  gl.attachShader(program, vertexShader);
  const fragmentShader = getShader(gl.FRAGMENT_SHADER, require('./glsl/frag.glsl').default);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const program2 = gl.createProgram();
  const vertexShader2 = getShader(gl.VERTEX_SHADER, require('./glsl/vert2.glsl').default);
  gl.attachShader(program2, vertexShader2);
  const fragmentShader2 = getShader(gl.FRAGMENT_SHADER, require('./glsl/frag2.glsl').default);
  gl.attachShader(program2, fragmentShader2);
  gl.linkProgram(program2);

  // uniform変数に質点数を設定
  gl.useProgram(program);
  const nLoc = gl.getUniformLocation(program, 'N');
  gl.uniform1f(nLoc, N);

  // フレームバッファをバインドする
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // 実行開始!
  step();

  function step() {
    gl.useProgram(program);
    gl.viewport(0, 0, N, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    // テクスチャをレンダーターゲットに指定
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, pTex[1], 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D, vTex[1], 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2,
      gl.TEXTURE_2D, aTex[1], 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1,
    gl.COLOR_ATTACHMENT2]);

    // uniform変数とテクスチャを関連付ける
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pTex[0]);
    gl.uniform1i(gl.getUniformLocation(program, 'p'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, vTex[0]);
    gl.uniform1i(gl.getUniformLocation(program, 'v'), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, aTex[0]);
    gl.uniform1i(gl.getUniformLocation(program, 'a'), 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, mTex);
    gl.uniform1i(gl.getUniformLocation(program, 'm'), 3);

    // 描画処理
    gl.drawArrays(gl.POINTS, 0, N);

    pTex.reverse();
    vTex.reverse();
    aTex.reverse();

    //showResult();

    gl.useProgram(program2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, 500, 500);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pTex[0]);
    gl.uniform1i(gl.getUniformLocation(program2, 'p'), 0);
    gl.drawArrays(gl.POINTS, 0, N);

    setTimeout(step, 10);
  }

  // 結果表示用
  function showResult() {
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    const readingBuffer = new Float32Array(N * 4);
    gl.readPixels(0, 0, N, 1, gl.RGBA, gl.FLOAT, readingBuffer);
    console.log(readingBuffer);
  }
};
