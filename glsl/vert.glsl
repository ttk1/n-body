#version 300 es

void main() {
	gl_Position = vec4(float(gl_VertexID) / 2.0 - 1.0 + 0.25, 0.0, 0.0, 1.0);
}