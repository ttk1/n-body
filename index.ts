window.onload = () => {
  // Step 1 canvasの取得とサイズの設定
  const cvs = document.getElementById('canvas') as HTMLCanvasElement;
  cvs.width = 500;
  cvs.height = 500;

  // Step 2 描画コンテキストの取得とバッファの初期化
  const gl = cvs.getContext('webgl2');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Step 3 シェーダプログラムの設定
  function getShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const program = gl.createProgram();
  const vertexShader =
    getShader(gl.VERTEX_SHADER, require('./glsl/vert.glsl').default);
  gl.attachShader(program, vertexShader);
  const fragmentShader =
    getShader(gl.FRAGMENT_SHADER, require('./glsl/frag.glsl').default);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Step 4 VBOにデータの転送
  function transferData(data, loc) {
    gl.enableVertexAttribArray(loc);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  }

  gl.useProgram(program);
  const position = [
    0.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  const positionLoc = gl.getAttribLocation(program, 'position');
  transferData(position, positionLoc);

  const color = [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0,
  ];
  const inColorLoc = gl.getAttribLocation(program, 'inColor');
  transferData(color, inColorLoc);

  // Step 5 uniform変数の値を設定
  const transform = [
    0.5, 0, 0, 0,
    0, 0.5, 0, 0,
    0, 0, 0.5, 0,
    0, 0, 0, 1
  ];
  const transformLoc = gl.getUniformLocation(program, 'transform');
  gl.uniformMatrix4fv(transformLoc, false, transform);

  // Step 6 描画
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};
