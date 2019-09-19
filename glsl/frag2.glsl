#version 300 es

precision mediump float;
out vec4 color;

void main(void) {
	// 円を描画する
    if (distance(gl_PointCoord, vec2(0.5, 0.5)) < 0.5) {
        color = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
		// 円の外側にあるピクセルは破棄
        discard;
    }
}