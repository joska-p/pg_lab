precision highp float;

out vec4 fragColor;

uniform highp sampler2D u_state;
uniform vec2 u_gridSize;
uniform int u_birth[9];
uniform int u_survive[9];
uniform int u_stateCount;
uniform float u_ageGrowth;
uniform float u_ageDecay;

int cellAt(ivec2 coord) {
    ivec2 p = coord;
    p.x = (p.x + int(u_gridSize.x)) % int(u_gridSize.x);
    p.y = (p.y + int(u_gridSize.y)) % int(u_gridSize.y);
    // Red channel stores state
    return int(texelFetch(u_state, p, 0).r * 255.0 + 0.5);
}

void main() {
    ivec2 coord = ivec2(gl_FragCoord.xy);
    vec4 currentTexel = texelFetch(u_state, coord, 0);
    int current = int(currentTexel.r * 255.0 + 0.5);
    float currentAge = currentTexel.g;

    int neighbors = 0;
    for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
            if (dx == 0 && dy == 0) continue;
            // In Generations, usually state 1 represents active "Alive" neighbors
            if (cellAt(coord + ivec2(dx, dy)) == 1) neighbors++;
        }
    }

    // --- AUTOMATON STATE LOGIC ---
    float nextState = 0.0;
    if (current == 1) {
        nextState = u_survive[neighbors] != 0 ? 1.0 / 255.0 : u_stateCount > 2 ? 2.0 / 255.0 : 0.0;
    } else if (current > 1) {
        int maxState = u_stateCount - 1;
        nextState = float(current == maxState ? 0 : current + 1) / 255.0;
    } else {
        nextState = u_birth[neighbors] != 0 ? 1.0 / 255.0 : 0.0;
    }

    // --- AGE / TRAIL ACCUMULATION LOGIC ---
    float nextAge = currentAge;
    if (nextState == 1.0 / 255.0) {
        nextAge = min(1.0, currentAge + u_ageGrowth);
    } else {
        nextAge = max(0.0, currentAge - u_ageDecay);
    }

    // R = State, G = Age / Heat, B = Unused, A = 1.0
    fragColor = vec4(nextState, nextAge, 0.0, 1.0);
}
