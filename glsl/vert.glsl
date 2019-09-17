#version 300 es

uniform float N;

void main() {
	gl_Position = vec4(2.0 * float(gl_VertexID) / N + 1.0 / N - 1.0, 0.0, 0.0, 1.0);
	gl_PointSize = 1.0;
}