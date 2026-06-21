# 🦠 RETROVÍRUS

> **Trabalho de Computação Gráfica (EEL882) — 2026.1**  
> Um jogo interativo direto no navegador, onde você controla um patógeno microscópico em uma jornada letal pelo corpo humano!

---

## 🎮 Como Jogar?

O jogo roda 100% no seu navegador, sem precisar instalar nada! 

👉 **[CLIQUE AQUI PARA JOGAR AGORA](https://hugo-antunes19.github.io/EEL882-20261-Comp-Grafica)** 👈

### Controles
É super fácil dominar o hospedeiro:
- **Movimentação:** Use as teclas `W A S D` ou as `Setas` do teclado.
- **Avançar nos menus / Subir (Fase 1):** Pressione `ESPAÇO`.
- **Pausar o jogo:** Aperte `ESC`.

---

## 📖 A Jornada da Infecção

Você controla um vírus letal e seu objetivo é colonizar o hospedeiro passando por dois estágios cruciais:

1. **Fase 1 (Túnel Epitelial):** Você invade a cavidade nasal. O desafio aqui é desviar dos perigosos cílios de defesa do organismo enquanto tenta capturar e infectar células saudáveis.
2. **Fase 2 (Corrente Sanguínea):** Uma fuga alucinante! Você cai num vaso sanguíneo em alta velocidade e precisa desviar freneticamente de hemácias e glóbulos brancos.

---

## 💻 Por Trás dos Panos (Tecnologia)

Embora você só precise clicar no link para jogar, debaixo do capô nós construímos o jogo do zero usando **Python (PyScript)** interagindo diretamente com a placa de vídeo via **WebGL e Shaders GLSL**. 

Alguns dos truques de Computação Gráfica que usamos:
- **Raymarching e SDFs:** A segunda fase do jogo não tem malhas 3D ou polígonos baixados da internet! Tudo é gerado matematicamente com equações de distância (Signed Distance Fields) diretamente na placa de vídeo, criando essas formas biológicas super orgânicas.
- **Curvas de Bézier:** Os cílios da Fase 1 não são linhas duras; nós usamos equações de curvas de Bézier e adicionamos uma "física de chicote" para que eles balancem de forma natural.
- **Iluminação e Shaders:** O brilho do sangue e o formato gelatinoso das hemácias (Subsurface Scattering) foram simulados escrevendo nossas próprias contas de refração e reflexão de luz na GPU.

Se quiser mergulhar fundo na matemática de como fizemos tudo isso, confira o arquivo [`DOCUMENTACAO.md`](DOCUMENTACAO.md) aqui no repositório!

---

## 📂 O que tem no repositório?

Esquecemos a bagunça! Aqui você só encontra o necessário:
- `index.html`: A interface do site onde o jogo roda (Single Page Application).
- `sketch.py`: O "cérebro" do jogo. É aqui que toda a lógica, movimentação e renderização em Py5Script acontece.
- `DOCUMENTACAO.md`: O nosso diário de bordo com todas as fórmulas matemáticas e lógicas dos Shaders.

---

## 👥 Autores

Desenvolvido com muito suor e computação por:
- **Hugo Antunes** — [@hugo-antunes19](https://github.com/hugo-antunes19)
- **Vivian Souza**
