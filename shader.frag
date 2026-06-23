precision highp float;
#define MAX_OBS 8

#define TUNNEL_BEAT_AMP 0.24   
#define TUNNEL_BEAT_LAG 0.05   
#define TUNNEL_HALF 6.0

#define BEAT_ZOOM      0.12    
#define BEAT_EXPOSURE  0.16    
#define BEAT_REDDEN    0.06    
#define VIGN_BASE      0.16    
#define VIGN_BEAT      0.55    

uniform vec2  uResolution;     
uniform float uTime;           
uniform float uCamZ;           
uniform float uAbsZ;           // Z absoluto para os cálculos da Meta F2
uniform vec2  uPlayer;         
uniform int   uObCount;        
uniform vec3  uObRel[MAX_OBS];
uniform float uObRad[MAX_OBS]; 
uniform float uObType[MAX_OBS];
uniform float uHit;            
uniform float uMetaZ;          // Posição de fim do túnel

uniform float uVirusR;          
uniform float uVirusNSpikes;    
uniform float uVirusSpikeLen;   
uniform float uVirusSpikeW;     
uniform vec3  uVirusBodyCol;    
uniform vec3  uVirusSpikeCol;   

uniform float uLodEnable;       
uniform float uLodStrength;     
uniform float uHeartHz;         
uniform float uPulsePhase;      

float sdSphere(vec3 p, float r){ 
  return length(p) - r; 
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r){
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

mat2 rot(float a){ 
  float c = cos(a), s = sin(a); 
  return mat2(c, -s, s, c); 
}

float hash1(float n){
  float s = mod(floor(abs(n) * 100.0), 65537.0) + 1.0; 
  s = mod(75.0 * s + 74.0, 65537.0);                   
  s = mod(75.0 * s + 74.0, 65537.0);                   
  s = mod(75.0 * s + 74.0, 65537.0);
  return s / 65537.0;
}

float sdHemacia(vec3 p, float r){
  float disc = max(abs(p.y) - r * 0.09, length(p.xz) - r * 0.52);
  vec2 q = vec2(length(p.xz) - r * 0.52, p.y);
  float edge  = length(q) - r * 0.28;
  return min(disc, edge);
}

#define N_MICRO_MAX 24

float sdGlobuloBranco(vec3 p, float r, float seed, float lod){
  float d = sdSphere(p, r * 0.68);
  float lodMix = uLodEnable * uLodStrength;

  if(d <= 0.0) return d;
  if(lodMix > 0.001 && lod < 0.08) return d;
  if(d>r*0.5) return d;

  float hairT = mix(1.0, smoothstep(0.12, 0.82, lod), lodMix);
  int nHair = int(mix(float(N_MICRO_MAX), mix(5.0, float(N_MICRO_MAX), hairT), lodMix));

  for(int i = 0; i < N_MICRO_MAX; i++){
    if(i >= nHair) break;

    float fi = float(i);
    float y = 1.0 - (fi + 0.5) * (2.0 / float(N_MICRO_MAX));
    float w = sqrt(max(0.0, 1.0 - y * y));
    float theta = fi * 2.399963 + seed * 1.37;
    float h0 = hash1(seed + fi * 19.17);
    float h1 = hash1(seed + fi * 41.23);
    
    vec3 dir = normalize(vec3(cos(theta) * w, y, sin(theta) * w)
      + (vec3(h0, h1, fract(h0 + h1)) - 0.5) * 0.22);

    float surf = r * (0.66 + 0.05 * fract(h0 * 7.1));
    float hLen = r * (0.09 + 0.06 * fract(h1 * 11.3));
    float hRad = r * (0.030 + 0.018 * fract(h0 * 13.7));
    vec3 base = dir * surf;
    
    d = min(d, sdCapsule(p, base, base + dir * hLen, hRad));
  }
  return d;
}

float obstacleSDF(vec3 p, vec3 center, float r, float typ){
  vec3 rp = p - center;
  float ph = typ + uTime * 0.7;
  if(typ < 3.14){
    rp.xz = rot(ph * 0.22) * rp.xz;
    rp.yz = rot(ph * 0.14) * rp.yz;
    return sdHemacia(rp, r);
  }
  rp.xy = rot(ph * 0.4) * rp.xy;
  rp.xz = rot(ph * 0.3) * rp.xz;
  float lod = clamp(1.0 - center.z / 65.0, 0.0, 1.0);
  return sdGlobuloBranco(rp, r * 1.2, typ, lod);
}

float thump(float cyc, float center, float w){
  float d = cyc - center;
  return exp(-d * d / (w * w));
}

float heartPulse(float phase){
  float cyc = fract(phase / 6.28318530718);
  float s1 = thump(cyc, 0.10, 0.052);          
  float s2 = thump(cyc, 0.27, 0.048) * 0.55;   
  return clamp(s1 + s2, 0.0, 1.0);
}

float tunnelSDF(vec3 p){
  float wx = p.x + uPlayer.x;
  float wy = p.y + uPlayer.y;
  float wz = p.z + uCamZ;

  float beat = heartPulse(uPulsePhase - wz * TUNNEL_BEAT_LAG);
  // raio diminui com os batimentos
  float r    = TUNNEL_HALF - TUNNEL_BEAT_AMP * beat;

  // 1. Distância para a parede interna do tubo
  float dWall = r - length(vec2(wx, wy));
  
  // 2. Distância para o plano de corte (fim da fase usando o Z absoluto real)
  float absoluteZ = p.z + uAbsZ;
  float dEnd  = absoluteZ - uMetaZ; 

  // 3. CSG Intersection: O tecido só existe se bater nas duas condições
  float exactDist = max(dWall, dEnd);

  return exactDist * 0.9;
}
 
#define VIRUS_Z    8.0
#define MAX_SPIKES 12
 
float sdVirus(vec3 p){
  vec3 vp = p - vec3(0.0, 0.0, VIRUS_Z);
  vp.xy = rot(uTime * 0.18) * vp.xy;
 
  float R   = uVirusR;
  float sL  = uVirusSpikeLen;
  float sW  = uVirusSpikeW;
  float N   = uVirusNSpikes;
  float TAU = 6.28318530718;
 
  float d = sdSphere(vp, R);
 
  for(int i = 0; i < MAX_SPIKES; i++){
    if(float(i) >= N) break;
 
    float a_base = (float(i) / N) * TAU + uTime * 0.12;
    float sway   = sin(uTime * 1.8 + float(i) * 0.9) * 0.18;
    float tip_a  = a_base + sway;
 
    vec3 base_pt = vec3(cos(a_base) * R * 0.88, sin(a_base) * R * 0.88, 0.0);
    vec3 mid_pt  = vec3(cos(a_base + sway*0.5) * (R + sL*0.6),
                        sin(a_base + sway*0.5) * (R + sL*0.6), 0.0);
    vec3 tip_pt  = vec3(cos(tip_a) * (R + sL), sin(tip_a) * (R + sL), 0.0);

    // 1. Primeira metade (Raiz até o Cotovelo)
    d = min(d, sdCapsule(vp, base_pt, mid_pt, sW * 0.55));
    
    // 2. Segunda metade (Cotovelo até a Ponta)
    d = min(d, sdCapsule(vp, mid_pt, tip_pt, sW * 0.55));
  
    // 3. A bolota do receptor na ponta
    d = min(d, sdSphere(vp - tip_pt, sW));
  }
  return d;
}

vec3 virusColor(vec3 p, vec3 n, float dif, float amb, float fresnel){
  vec3 vp  = p - vec3(0.0, 0.0, VIRUS_Z);
  float distN = clamp((length(vp) - uVirusR) / uVirusSpikeLen, 0.0, 1.0);
  vec3 base   = mix(uVirusBodyCol, uVirusSpikeCol, distN);
  vec3 col    = base * (amb + dif * 0.9) + fresnel * uVirusSpikeCol * 0.5;
  return col;
}

float mapScene(vec3 p, out float mat){
  float d = tunnelSDF(p);
  mat = 0.0;
  
  float vd = sdVirus(p);
  if(vd < d){ d = vd; mat = 3.0; }
  
  for(int i = 0; i < MAX_OBS; i++){
    if(i >= uObCount) break;
    float od = obstacleSDF(p, uObRel[i], uObRad[i], uObType[i]);
    if(od < d){ 
      d = od; 
      mat = uObType[i] < 3.14 ? 1.0 : 2.0; 
    }
  }
  return d;
}

float mapDist(vec3 p){
  float m;
  return mapScene(p, m);
}

vec3 calcNormal(vec3 p){
  vec2 e = vec2(0.0025, 0.0); 
  return normalize(vec3(
    mapDist(p + e.xyy) - mapDist(p - e.xyy),
    mapDist(p + e.yxy) - mapDist(p - e.yxy),
    mapDist(p + e.yyx) - mapDist(p - e.yyx)));
}

float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = smoothstep(0.0, 1.0, f);
  float a = hash1(dot(i + vec2(0.0, 0.0), vec2(1.0, 57.0)));
  float b = hash1(dot(i + vec2(1.0, 0.0), vec2(1.0, 57.0)));
  float c = hash1(dot(i + vec2(0.0, 1.0), vec2(1.0, 57.0)));
  float d = hash1(dot(i + vec2(1.0, 1.0), vec2(1.0, 57.0)));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec3 tunnelColor(vec3 p){
  float wx = p.x + uPlayer.x;
  float wy = p.y + uPlayer.y;
  float wz = p.z + uCamZ;
  float ang = atan(wy, wx);

  const float TISSUE_STRENGTH = 0.45; 
  const float FLOW_STRENGTH   = 0.18; 
  const float PULSE_STRENGTH  = 0.26; 

  float tissue = vnoise(vec2(ang * 11.0, wz * 2.4)) * 0.5
               + vnoise(vec2(ang * 23.0, wz * 5.2)) * 0.3
               + vnoise(vec2(ang * 47.0, wz * 10.5)) * 0.2;

  float flow = vnoise(vec2(ang * 8.0, wz * 0.12 - uTime * 0.6));

  float lag    = wz * 0.16 + ang * 0.22;
  float hrNorm = clamp((uHeartHz - 1.10) / 0.90, 0.0, 1.0);
  float pulse  = heartPulse(uPulsePhase - lag) * (0.85 + 0.15 * hrNorm);

  vec3 deep  = vec3(0.32, 0.050, 0.046); 
  vec3 flesh = vec3(0.44, 0.078, 0.058); 
  vec3 col   = mix(deep, flesh, clamp(tissue * TISSUE_STRENGTH + flow * FLOW_STRENGTH + 0.25, 0.0, 1.0));
  col += vec3(0.28, 0.06, 0.045) * (pulse * PULSE_STRENGTH);
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  float beatCam = heartPulse(uPulsePhase);

  vec3 ro = vec3(0.0);                                   
  vec3 rd = normalize(vec3(uv, 1.45 + BEAT_ZOOM * beatCam)); 

  float t = 0.0;        
  float mat = 0.0;      
  bool hit = false;     
  
  for(int i = 0; i < 150; i++){
    vec3 p = ro + rd * t;        
    float d = mapScene(p, mat);  
    if(d < 0.005){               
      hit = true; 
      break; 
    }
    t += d;                      
    if(t > 1000.0) break;         
  }

  vec3 col;
  vec3 brainLight = vec3(0.85, 0.95, 1.0); 
  vec3 darkRed = vec3(0.16, 0.025, 0.025);

  if(hit){
    vec3 p = ro + rd * t;        
    vec3 n = calcNormal(p);      
    
    // Luz apontando direto para frente (eixo Z)
    vec3 lig = normalize(vec3(0.0, 0.0, -1.0)); 
    
    float dif = clamp(dot(n, lig), 0.0, 1.0);  
    // Luz ambiente mais uniforme, dependendo menos do teto/chão
    float amb = 0.4 + 0.1 * n.y;              
    float fresnel = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);

    if(mat < 0.5){
      col = tunnelColor(p) * (amb + dif * 0.5);
    } else if(mat < 1.5){
      vec3 obj_color = vec3(0.85, 0.12, 0.08); 
      float subsurface_scattering = pow(clamp(dot(rd, n), 0.0, 1.0), 2.0) * 0.3;
      col = obj_color * (amb + dif * 0.8 + subsurface_scattering) + fresnel * vec3(0.9, 0.2, 0.1);
    } else if(mat < 2.5){
      vec3 obj_color = vec3(0.86, 0.88, 0.91);
      float rim = pow(fresnel, 1.4);
      float lodMix = uLodEnable * uLodStrength;
      float tex = sin(p.x * 15.0 + p.y * 19.0) * sin(p.y * 17.0 + p.z * 21.0) * 0.5 + 0.5;
      float texAmt = lodMix * 0.10;
      col = obj_color * (1.0 - texAmt + texAmt * tex) * (amb + dif * 0.92) + rim * vec3(0.95, 0.97, 1.0) * 0.45;
    } else {
      col = virusColor(p, n, dif, amb, fresnel);
    }
    
    // Efeito de Névoa normal quando bate em algo
    float fog = 1.0 - exp(-t * 0.05);
    col = mix(col, darkRed, fog);
  } else {
    // Se o raio não bateu em nada, ele escapou pelo FIM DO TÚNEL!
    float distToHole = max(0.0, (uMetaZ - uAbsZ) / max(rd.z, 0.001));
    float fog = 1.0 - exp(-distToHole * 0.022);
    
    // Fundo revela o brilho do cérebro
    col = mix(brainLight, darkRed, fog);
  }

  // Efeito Bloom/Flash: Nos últimos 70 metros, ofusca a tela toda de luz
  float flashOut = clamp((uAbsZ - (uMetaZ - 70.0)) / 70.0, 0.0, 1.0);
  col = mix(col, brainLight, flashOut);

  // Efeito de Flash Vermelho (Dano):
  col = mix(col, vec3(0.9, 0.05, 0.05), uHit * 0.6);

  col *= 1.0 + BEAT_EXPOSURE * beatCam;
  col += vec3(BEAT_REDDEN, 0.0, 0.0) * beatCam;
  float r2 = dot(uv, uv);
  float vignette = 1.0 - VIGN_BASE * r2 - VIGN_BEAT * beatCam * r2;
  col *= clamp(vignette, 0.0, 1.0);

  col = pow(col, vec3(0.4545));   
  gl_FragColor = vec4(col, 1.0);
}