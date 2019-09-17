#version 300 es

uniform sampler2D p;

void main() {
	gl_Position = texelFetch(p, ivec2(gl_VertexID, 0), 0);
	gl_PointSize = 5.0;
}