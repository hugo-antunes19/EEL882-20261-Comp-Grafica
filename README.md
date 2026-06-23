# 🦠 RETROVÍRUS

> **Trabalho de Computação Gráfica (EEL882) — 2026.1**  
> Um jogo interativo direto no navegador, onde você controla um patógeno microscópico em uma jornada letal pelo corpo humano!

---

## 🎮 Como Jogar?

O jogo roda 100% no seu navegador, sem precisar instalar nada! 

**[CLIQUE AQUI PARA JOGAR AGORA](https://hugo-antunes19.github.io/EEL882-20261-Comp-Grafica)**

### Controles
É super fácil dominar o hospedeiro:
- **Movimentação:** Use as teclas `W A S D` ou as `Setas` do teclado.
- **Avançar nos menus / Subir (Fase 1):** Pressione `ESPAÇO`.
- **Pausar o jogo:** Aperte `ESC`.

---

## 📖 A Jornada da Infecção

Você controla um vírus letal e seu objetivo é colonizar o hospedeiro passando por dois estágios cruciais:

1. **Fase 1 (Túnel Epitelial):** Você invade a cavidade nasal. O desafio aqui é desviar dos perigosos cílios de defesa do organismo enquanto tenta capturar e infectar células saudáveis.
2. **Fase 2 (Corrente Sanguínea):** Você cai num vaso sanguíneo em alta velocidade e precisa desviar freneticamente de hemácias e glóbulos brancos.

---

## 💻 Tecnologia

Embora você só precise clicar no link para jogar, nós construímos o jogo do zero usando **Python (PyScript)** interagindo diretamente com a placa de vídeo via **WebGL e Shaders GLSL**. 

Alguns dos conceitos de Computação Gráfica que usamos:
- **Raymarching e SDFs:** A segunda fase do jogo não tem malhas 3D ou polígonos baixados da internet. Tudo é gerado matematicamente com equações de distância (Signed Distance Fields) diretamente na placa de vídeo, criando formas biológicas orgânicas.
- **Curvas de Bézier:** Os cílios da Fase 1 não são linhas duras; nós usamos equações de curvas de Bézier e adicionamos uma "física de chicote" para que eles balancem de forma natural.
- **Iluminação e Shaders:** O brilho do sangue e o formato das hemácias foram simulados escrevendo nossas próprias contas de refração e reflexão de luz na GPU.

---

## 📂 O que tem no repositório?

- `index.html`: A interface do site onde o jogo executa.
- `sketch.py`: O jogo de fato. É aqui que toda a lógica, movimentação e renderização em Py5Script acontece.
- `shader.frag`: Responsável por executar toda a matemática pesada do Raymarching direto na GPU.
- `shader.vert`: Posiciona os vértices e prepara a estrutura 3D básica antes de aplicarmos a arte visual.

---

## 👥 Autores

- **Hugo Antunes** — [@hugo-antunes19](https://github.com/hugo-antunes19)
- **Vivian Souza** — [@mssvivian](https://github.com/mssvivian)
