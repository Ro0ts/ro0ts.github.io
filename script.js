// Referências
const lutadorJogador = document.getElementById("lutador-jogador");
const lutadorCPU = document.getElementById("lutador-cpu");
const impacto = document.getElementById("impacto");

const vidaJogadorEl = document.getElementById("vida-jogador");
const vidaCPUel = document.getElementById("vida-cpu");

// Referências para as barras de progresso
const vidaJogadorProgresso = document.getElementById("vida-jogador-progresso");
const vidaCPUProgresso = document.getElementById("vida-cpu-progresso");

// Inicializa os objetos de áudio
const somJab = new Audio("jab.mp3");
const somDireto = new Audio("direto.mp3");
const somGancho = new Audio("gancho.mp3");
const somContagem = new Audio("contagem.mp3"); 
const somKoContagem = new Audio("ko_contagem.mp3"); 


// Variáveis de vida
let vidaJogador = 50;
let vidaCPU = 50;
const HP_RECUPERACAO = 10;
let isCounting = false; // BLOQUEIA golpes durante a contagem de recuperação
let jogadorJaLevantou = false; 
let cpuJaLevantou = false;     
let gameOver = false; // BLOQUEIA o jogo após o KO final


// Função para atualizar o visual da barra de vida
function atualizarBarraVida(elementoProgresso, vidaAtual) {
    const porcentagem = (vidaAtual / 50) * 100;
    elementoProgresso.style.width = `${porcentagem}%`;

    if (porcentagem > 50) {
        elementoProgresso.style.backgroundColor = '#00ff00'; 
    } else if (porcentagem > 20) {
        elementoProgresso.style.backgroundColor = '#ffcc00'; 
    } else {
        elementoProgresso.style.backgroundColor = '#ff0000'; 
    }
}

// Inicializa as barras de vida
atualizarBarraVida(vidaJogadorProgresso, vidaJogador);
atualizarBarraVida(vidaCPUProgresso, vidaCPU);


// Função para reiniciar o jogo
function reiniciarJogo() {
    // 1. Reseta os estados e as flags
    vidaJogador = 50;
    vidaCPU = 50;
    jogadorJaLevantou = false; 
    cpuJaLevantou = false;     
    isCounting = false;        
    gameOver = false; // Permite que o jogo recomece
    
    // 2. Atualiza o placar e as barras visuais
    vidaJogadorEl.textContent = vidaJogador;
    vidaCPUel.textContent = vidaCPU;
    atualizarBarraVida(vidaJogadorProgresso, vidaJogador);
    atualizarBarraVida(vidaCPUProgresso, vidaCPU);

    // 3. Reseta as sprites para o estado 'parado'
    lutadorJogador.src = "jogador_parado.png";
    lutadorCPU.src = "cpu_parado.png";

    // 4. GARANTE QUE OS BOTÕES DE GOLPE APAREÇAM NOVAMENTE
    const botoesContainer = document.getElementById("botoes");
    const acaoBotoes = botoesContainer.querySelector('div');
    
    if (acaoBotoes) {
        acaoBotoes.style.display = 'block'; 
    }

    botoesContainer.style.display = 'block'; 
}


// Função de animação do golpe
function animarGolpe(lutador, tipo, isCPU = false) {
  const base = isCPU ? "cpu" : "jogador";
  lutador.src = `${base}_${tipo}.png`; 
  lutador.style.transform = isCPU ? "translateX(-40px)" : "translateX(40px)";

  setTimeout(() => {
    lutador.src = `${base}_parado.png`;
    lutador.style.transform = "translateX(0)";
  }, 350);
}

// Impacto visual
function mostrarImpacto() {
  impacto.classList.add("ativo");
  setTimeout(() => impacto.classList.remove("ativo"), 300);
}

// Função para determinar resultado do round
function determinarResultado(golpeJ, golpeC) {
  if (golpeJ === golpeC) return "empate";
  if (
    (golpeJ === "jab" && golpeC === "gancho") ||
    (golpeJ === "gancho" && golpeC === "direto") ||
    (golpeJ === "direto" && golpeC === "jab")
  ) {
    return "jogador";
  } else {
    return "cpu";
  }
}

// Função para tocar o som
function tocarSomGolpe(golpe) {
    let som;
    if (golpe === 'jab') { som = somJab; } 
    else if (golpe === 'direto') { som = somDireto; } 
    else if (golpe === 'gancho') { som = somGancho; }
    
    if (som) {
        som.currentTime = 0; 
        som.play().catch(e => {
            console.warn("Navegador bloqueou a reprodução de áudio.", e);
        });
    }
}

// Função para exibir a cena final (Chamada SÓ DEPOIS da contagem KO)
function exibirCenaFinal(vencedor) {
    gameOver = true; // Define o estado de fim de jogo
    isCounting = false; // Apenas para garantir que o estado de contagem seja liberado
    
    const botoes = document.getElementById("botoes");
    botoes.querySelector('div').style.display = 'none'; 
    botoes.style.display = 'block'; 

    // Ocorre a troca de sprites e o alert
    if (vencedor === 'jogador') {
        lutadorJogador.src = "jogador_vencedor.png";
        lutadorCPU.src = "cpu_caido.png"; 
        alert("Você venceu e é o CAMPEÃO! 🏆");
    } else if (vencedor === 'cpu') {
        lutadorCPU.src = "cpu_vencedor.png";
        lutadorJogador.src = "jogador_caido.png"; 
        alert("Você perdeu! O seu oponente é o CAMPEÃO! 🥀");
    }
}

// Função para iniciar a contagem final (KO)
function iniciarContagemFinal(lutadorElemento, isCPU) {
    isCounting = true; 
    const base = isCPU ? "cpu" : "jogador";
    
    // 1. Mostrar imagem tentando levantar
    lutadorElemento.src = `${base}_levantando.png`; 
    
    // 2. Tocar áudio de contagem KO
    somKoContagem.currentTime = 0; 
    somKoContagem.play().catch(e => {
        console.warn("Navegador bloqueou a reprodução de áudio do KO.", e);
    });
    
    // Esconde os botões de ação
    document.getElementById("botoes").querySelector('div').style.display = 'none';
    
    const TEMPO_KO_CONTAGEM = 20000; // <<< VERIFIQUE ESTE VALOR >>>

    // 3. Transição para a cena final (sincronizada com o áudio)
    setTimeout(() => {
        const vencedor = isCPU ? 'jogador' : 'cpu';
        exibirCenaFinal(vencedor); // Chama a função que finaliza o jogo
    }, TEMPO_KO_CONTAGEM); 
}


// Função para iniciar a contagem de recuperação
function iniciarContagem(lutadorElemento, isCPU) {
    isCounting = true; 
    const base = isCPU ? "cpu" : "jogador";
    
    lutadorElemento.src = `${base}_levantando.png`; 
    
    somContagem.currentTime = 0; 
    somContagem.play().catch(e => {
        console.warn("Navegador bloqueou a reprodução de áudio da contagem.", e);
    });
    
    document.getElementById("botoes").querySelector('div').style.display = 'none';
    
    const TEMPO_CONTAGEM = 5000; 

    setTimeout(() => {
        let vidaAtual, vidaEl, progressoEl;
        
        if (isCPU) {
            vidaCPU = HP_RECUPERACAO; 
            vidaAtual = vidaCPU;
            vidaEl = vidaCPUel;
            progressoEl = vidaCPUProgresso;
        } else {
            vidaJogador = HP_RECUPERACAO; 
            vidaAtual = vidaJogador;
            vidaEl = vidaJogadorEl;
            progressoEl = vidaJogadorProgresso;
        }

        lutadorElemento.src = `${base}_parado.png`;
        vidaEl.textContent = vidaAtual;
        atualizarBarraVida(progressoEl, vidaAtual);

        isCounting = false; // Libera a luta para o próximo golpe
        
        document.getElementById("botoes").querySelector('div').style.display = 'block';

        alert(`O lutador ${isCPU ? 'CPU' : 'Jogador'} se levantou! +${HP_RECUPERACAO} HP para continuar!`);

    }, TEMPO_CONTAGEM); 
}


// Executa uma rodada
function executarRodada(golpeJogador) {
  // BLOQUEIO REFORÇADO: Se a contagem estiver ativa OU o jogo tiver terminado, saia.
  if (isCounting || gameOver) return;

  const golpes = ["jab", "direto", "gancho"];
  const golpeCPU = golpes[Math.floor(Math.random() * golpes.length)];

  // Animações
  animarGolpe(lutadorJogador, golpeJogador);
  tocarSomGolpe(golpeJogador); 

  setTimeout(() => {
    animarGolpe(lutadorCPU, golpeCPU, true);
  }, 150);
  
  mostrarImpacto();

  // Resultado após pequena pausa
  setTimeout(() => {
    // Se o jogo acabou durante o golpe (enquanto esperávamos este setTimeout), não faça nada.
    if (gameOver) return;
      
    const vencedor = determinarResultado(golpeJogador, golpeCPU);

    const dano = 10; 

    if (vencedor === "jogador") {
      vidaCPU -= dano;
      if (vidaCPU < 0) vidaCPU = 0;
    } else if (vencedor === "cpu") {
      vidaJogador -= dano;
      if (vidaJogador < 0) vidaJogador = 0;
    }

    // Atualiza HUD (números) e Barras de Vida (visual)
    vidaJogadorEl.textContent = vidaJogador;
    vidaCPUel.textContent = vidaCPU;
    
    atualizarBarraVida(vidaJogadorProgresso, vidaJogador);
    atualizarBarraVida(vidaCPUProgresso, vidaCPU);

    // Verifica Knockdown/Fim de jogo
    if (vidaJogador <= 0) {
        if (!jogadorJaLevantou) {
            // Primeiro knockdown: Inicia contagem de recuperação
            jogadorJaLevantou = true; 
            iniciarContagem(lutadorJogador, false);
        } else {
            // Segundo knockdown: Inicia contagem FINAL (KO)
            iniciarContagemFinal(lutadorJogador, false); 
        }

    } else if (vidaCPU <= 0) {
        if (!cpuJaLevantou) {
            // Primeiro knockdown: Inicia contagem de recuperação
            cpuJaLevantou = true;
            iniciarContagem(lutadorCPU, true);
        } else {
            // Segundo knockdown: Inicia contagem FINAL (KO)
            iniciarContagemFinal(lutadorCPU, true); 
        }
    }
  }, 600);
}