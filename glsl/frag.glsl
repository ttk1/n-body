#version 300 es

precision mediump float;

uniform sampler2D m;
uniform sampler2D p;
uniform sampler2D v;
uniform sampler2D a;
layout(location = 0) out vec4 new_p;
layout(location = 1) out vec4 new_v;
layout(location = 2) out vec4 new_a;

const float G = 6.67408e-11;
const float TIME_STEP = 1.0;

void main() {
  vec4 old_p = texelFetch(p, ivec2(gl_FragCoord.x, 0), 0);
  vec4 old_v = texelFetch(v, ivec2(gl_FragCoord.x, 0), 0);
  vec4 old_a = texelFetch(a, ivec2(gl_FragCoord.x, 0), 0);
	int size = textureSize(m, 0).x;
	vec3 force = vec3(0.0, 0.0, 0.0);

	// 万有引力計算
	for (int i = 0; i < size; i++) {
		if (i == int(gl_FragCoord.x)) {
			continue;
		}
		vec4 pos = texelFetch(p, ivec2(i, 0), 0);
		float mass = texelFetch(m, ivec2(i, 0), 0).x;
		vec3 relative = vec3(pos - old_p);
		float norm = length(relative);
		float invnorm = 1.0 / pow(norm, 3.0);
		force += G * mass * invnorm * relative;
	}

	// リープフロッグ法で値を更新
	vec4 middle = old_v + vec4(TIME_STEP / 2.0) * old_a;
	new_a = vec4(force, 0.0);
	new_p = old_p + TIME_STEP * middle;
	new_v = old_v + vec4(TIME_STEP / 2.0) * (old_a + vec4(force, 0.0));
}