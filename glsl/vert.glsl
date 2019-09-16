#version 300 es

in float index;
out vec4 old_p;
out vec4 old_v;
out vec4 old_a;
out float index_fs;
uniform sampler2D p;
uniform sampler2D v;
uniform sampler2D a;

void main(void) {
	ivec2 tex_index = ivec2(int(index), 0);
	old_p = texelFetch(p, tex_index, 0);
	old_v = texelFetch(v, tex_index, 0);
	old_a = texelFetch(a, tex_index, 0);

	float max = float(textureSize(p, 0).x);
	float x_coord = (index / (max - 1.0)) * 2.0 - 1.0;
	if (x_coord < 1.0e-5) {
		x_coord += 1.0 / max;
	} else {
		x_coord -= 1.0 / max;
	}
	gl_Position = vec4(x_coord, 0.0, 0.0, 1.0);
	index_fs = index;
}