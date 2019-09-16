#version 300 es
in vec3 position;
in vec3 inColor;
out vec3 color;
uniform mat4 transform;
void main() {
    gl_Position = transform * vec4(position, 1.0);
    color = inColor;
}