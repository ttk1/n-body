#version 300 es

precision mediump float;

in float index_fs;
in vec4 old_p;
in vec4 old_v;
in vec4 old_a;
uniform sampler2D m;
uniform sampler2D global_p;
layout(location = 0) out vec4 new_p;
layout(location = 1) out vec4 new_v;
layout(location = 2) out vec4 new_a;

const float G = 6.67408e-11;
const float TIME_STEP = 1.0;

void main(void) {
	ivec2 size = textureSize(global_p, 0);
	vec3 f = vec3(0.0, 0.0, 0.0);

	// 万有引力計算
	for (int i = 0; i < size.x; i++) {
		if (i == int(index_fs)) {
			continue;
		}
		ivec2 pos = ivec2(i, 0);
		vec4 j_pos = texelFetch(global_p, pos, 0);
		float mm = texelFetch(m, pos, 0).x;

		vec3 distance = j_pos.xyz - old_p.xyz;
		float norm = sqrt(dot(distance, distance));
		float invnorm = 1.0 / pow(norm, 3.0);
		f += G * mm * invnorm * distance;
	}

	// リープフロッグ法
	vec4 pp_half = old_v + vec4(TIME_STEP / 2.0) * old_a;
	vec4 pp_p = old_p + TIME_STEP * pp_half;
	vec4 pp_v = old_v + vec4(TIME_STEP / 2.0) * (old_a + vec4(f, 0.0));

	new_a = vec4(f, 0.0);
	new_v = pp_v;
	new_p = pp_p;
}