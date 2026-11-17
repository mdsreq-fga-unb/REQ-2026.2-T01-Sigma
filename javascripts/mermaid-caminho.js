/* ==========================================================================
   DIAGRAMAS MERMAID INTERATIVOS (DESTAQUE DE CAMINHO)
   Blocos ```mermaid-caminho são renderizados fora do shadow DOM do Material,
   permitindo destacar, ao passar o mouse sobre um nó, o caminho percorrido
   desde o início do fluxo até ele.
   Blocos que contêm a linha "%% arvore" são desenhados como Árvore de
   Rastreabilidade em colunas, numa janela com zoom e arraste; o destaque
   mostra de onde o item deriva e o que deriva dele.
   Obs.: os IDs dos nós no diagrama não devem conter "_".
   ========================================================================== */
(function () {
  if (typeof mermaid === "undefined") return;
  mermaid.initialize({ startOnLoad: false });

  var contador = 0;

  function tema() {
    var esquema = document.body.getAttribute("data-md-color-scheme");
    return esquema === "slate" ? "dark" : "default";
  }

  function idDoNo(g) {
    var m = /flowchart-(.+)-\d+$/.exec(g.id);
    return m ? m[1] : null;
  }

  function idsDaAresta(dataId) {
    var m = /^L_(.+)_(.+)_\d+$/.exec(dataId || "");
    return m ? { origem: m[1], destino: m[2] } : null;
  }

  function ligarInteracao(container) {
    var svg = container.querySelector("svg");
    if (!svg) return;

    var nos = {};
    svg.querySelectorAll("g.node").forEach(function (g) {
      var id = idDoNo(g);
      if (id) nos[id] = g;
    });

    var arestas = [];
    svg.querySelectorAll("path[data-id]").forEach(function (path) {
      var ids = idsDaAresta(path.getAttribute("data-id"));
      if (!ids) return;
      arestas.push({
        origem: ids.origem,
        destino: ids.destino,
        elementos: [path].concat(
          Array.prototype.slice.call(
            svg.querySelectorAll('.edgeLabel [data-id="' + path.getAttribute("data-id") + '"]')
          )
        ),
      });
    });

    function alcancaveis(inicio, de, para) {
      var visitados = {};
      var fila = [].concat(inicio);
      fila.forEach(function (n) { visitados[n] = true; });
      while (fila.length) {
        var atual = fila.shift();
        arestas.forEach(function (a) {
          if (a[de] === atual && !visitados[a[para]]) {
            visitados[a[para]] = true;
            fila.push(a[para]);
          }
        });
      }
      return visitados;
    }

    // Nó inicial: id "inicio"; na falta dele, todos os nós sem entrada.
    var inicios = nos.inicio ? ["inicio"] : Object.keys(nos).filter(function (n) {
      return !arestas.some(function (a) { return a.destino === n; });
    });
    var doInicio = alcancaveis(inicios, "origem", "destino");

    // Caminho = nós entre o início e o alvo (alcançáveis a partir do início
    // e que chegam ao alvo). Nós fora do fluxo (ex.: entradas pontilhadas
    // como FE02) só destacam a si mesmos e o que vem depois deles.
    var modoArvore = container.classList.contains("mermaid-arvore");

    function ancestrais(alvo) {
      var anteriores = alcancaveis([alvo], "destino", "origem");
      if (modoArvore) {
        var abaixo = alcancaveis([alvo], "origem", "destino");
        Object.keys(abaixo).forEach(function (n) { anteriores[n] = true; });
        return anteriores;
      }
      if (!doInicio[alvo]) return anteriores;
      var caminho = {};
      Object.keys(anteriores).forEach(function (n) {
        if (doInicio[n]) caminho[n] = true;
      });
      return caminho;
    }

    function limpar() {
      container.classList.remove("caminho-ativo");
      svg.querySelectorAll(".no-caminho, .aresta-caminho").forEach(function (el) {
        el.classList.remove("no-caminho", "aresta-caminho");
      });
    }

    Object.keys(nos).forEach(function (id) {
      var g = nos[id];
      g.style.cursor = "pointer";
      g.addEventListener("mouseenter", function () {
        if (container.classList.contains("arrastando")) return;
        limpar();
        var noCaminho = ancestrais(id);
        container.classList.add("caminho-ativo");
        Object.keys(noCaminho).forEach(function (n) {
          if (nos[n]) nos[n].classList.add("no-caminho");
        });
        arestas.forEach(function (a) {
          if (noCaminho[a.origem] && noCaminho[a.destino]) {
            a.elementos.forEach(function (el) { el.classList.add("aresta-caminho"); });
          }
        });
      });
      g.addEventListener("mouseleave", limpar);
    });
  }

  // Janela com zoom (roda do mouse / pinça) e arraste, isolada da página.
  function montarJanela(container, conteudo, largura, altura) {
    var janela = document.createElement("div");
    janela.className = "mermaid-arvore__janela";
    var palco = document.createElement("div");
    palco.className = "mermaid-arvore__palco";
    palco.appendChild(conteudo);
    janela.appendChild(palco);

    var barra = document.createElement("div");
    barra.className = "mermaid-arvore__barra";
    [["+", "Aproximar", "mais"], ["−", "Afastar", "menos"], ["⤢", "Ver a árvore inteira", "ajustar"], ["⛶", "Tela cheia", "cheia"]]
      .forEach(function (b) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = b[0];
        btn.title = b[1];
        btn.setAttribute("aria-label", b[1]);
        btn.dataset.acao = b[2];
        barra.appendChild(btn);
      });
    janela.appendChild(barra);

    var dica = document.createElement("div");
    dica.className = "mermaid-arvore__dica";
    dica.textContent = "Roda: zoom • Arrastar: mover • Mouse sobre um item: caminho • Clique no requisito: detalhes";
    janela.appendChild(dica);

    container.innerHTML = "";
    container.appendChild(janela);

    var x = 0, y = 0, k = 1;
    function aplicar() {
      palco.style.transform = "translate(" + x + "px," + y + "px) scale(" + k + ")";
    }
    function zoom(fator, cx, cy) {
      var novo = Math.min(3, Math.max(0.1, k * fator));
      fator = novo / k;
      x = cx - (cx - x) * fator;
      y = cy - (cy - y) * fator;
      k = novo;
      aplicar();
    }
    // Visão inicial legível (80%), a partir do canto superior esquerdo;
    // se a árvore couber inteira na largura, centraliza.
    function inicio() {
      var w = janela.clientWidth;
      k = Math.min(0.8, Math.max((w - 16) / largura, 0.8));
      x = largura * k < w ? (w - largura * k) / 2 : 8;
      y = 8;
      aplicar();
    }
    function ajustar() {
      var w = janela.clientWidth, h = janela.clientHeight;
      k = Math.min(w / largura, h / altura) * 0.95;
      x = (w - largura * k) / 2;
      y = (h - altura * k) / 2;
      aplicar();
    }

    barra.addEventListener("click", function (e) {
      var acao = e.target.dataset && e.target.dataset.acao;
      var cx = janela.clientWidth / 2, cy = janela.clientHeight / 2;
      if (acao === "mais") zoom(1.25, cx, cy);
      else if (acao === "menos") zoom(0.8, cx, cy);
      else if (acao === "ajustar") ajustar();
      else if (acao === "cheia") {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (janela.requestFullscreen) janela.requestFullscreen();
      }
    });
    document.addEventListener("fullscreenchange", function () {
      if (!document.fullscreenElement || document.fullscreenElement === janela) setTimeout(inicio, 50);
    });

    janela.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = janela.getBoundingClientRect();
      zoom(Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.0015), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    var ponteiros = {}, distInicial = 0, kInicial = 1, moveu = false;
    janela.addEventListener("pointerdown", function (e) {
      if (barra.contains(e.target)) return;
      ponteiros[e.pointerId] = { x: e.clientX, y: e.clientY };
      moveu = false;
      var ids = Object.keys(ponteiros);
      if (ids.length === 2) {
        var a = ponteiros[ids[0]], b = ponteiros[ids[1]];
        distInicial = Math.hypot(a.x - b.x, a.y - b.y);
        kInicial = k;
      }
    });
    janela.addEventListener("pointermove", function (e) {
      var p = ponteiros[e.pointerId];
      if (!p) return;
      var ids = Object.keys(ponteiros);
      if (ids.length === 1) {
        var dx = e.clientX - p.x, dy = e.clientY - p.y;
        if (!moveu && Math.abs(dx) + Math.abs(dy) > 3) {
          moveu = true;
          janela.setPointerCapture(e.pointerId);
          container.classList.add("arrastando");
        }
        if (moveu) { x += dx; y += dy; aplicar(); }
      }
      p.x = e.clientX; p.y = e.clientY;
      if (ids.length === 2) {
        var a = ponteiros[ids[0]], b = ponteiros[ids[1]];
        var r = janela.getBoundingClientRect();
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        zoom((kInicial * d / distInicial) / k, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      }
    });
    function soltar(e) {
      delete ponteiros[e.pointerId];
      if (!Object.keys(ponteiros).length) container.classList.remove("arrastando");
    }
    janela.addEventListener("pointerup", soltar);
    janela.addEventListener("pointercancel", soltar);
    // Um arraste não deve abrir o modal de um requisito ao soltar o mouse.
    janela.addEventListener("click", function (e) {
      if (moveu) { e.stopPropagation(); e.preventDefault(); moveu = false; }
    }, true);

    inicio();
  }

  // ---------------------------------------------------------------------------
  // Árvore de Rastreabilidade: layout em colunas (um nível por coluna).
  // Lê o bloco no formato Mermaid (nós, "-->" e "class") e desenha caixas
  // compactas; os requisitos viram chips com o código, agrupados por tipo.
  // ---------------------------------------------------------------------------
  var NIVEIS = [
    { classes: ["cls_prob"], titulo: "Problema" },
    { classes: ["cls_og"], titulo: "Objetivo Geral" },
    { classes: ["cls_oe"], titulo: "Objetivo Específico" },
    { classes: ["cls_cp"], titulo: "Característica de Produto" },
    { classes: ["cls_uc", "cls_pos", "cls_transv"], titulo: "Caso de Uso" },
    { classes: ["cls_rf", "cls_rnf", "cls_rn"], titulo: "Requisitos (RF • RNF • RN)" }
  ];
  var CAIXA_L = 196, CAIXA_A = 46, COL_ESPACO = 56, CAB_A = 44;
  var CHIP_L = 64, CHIP_A = 26, CHIP_ESPACO = 6, CHIPS_POR_LINHA = 6, GRUPO_ESPACO = 18;

  function lerArvore(codigo) {
    var nos = {}, ordem = [], arestas = [], classeDe = {};
    codigo.split("\n").forEach(function (linha) {
      var m = /^\s*([A-Za-z0-9]+)\["([^"]*)"\]\s*$/.exec(linha);
      if (m) { nos[m[1]] = m[2].replace(/<br\s*\/?>/g, " "); ordem.push(m[1]); return; }
      m = /^\s*([A-Za-z0-9]+)\s*-->\s*([A-Za-z0-9]+)\s*$/.exec(linha);
      if (m) { arestas.push({ origem: m[1], destino: m[2] }); return; }
      m = /^\s*class\s+([A-Za-z0-9,]+)\s+(\w+)\s*$/.exec(linha);
      if (m) m[1].split(",").forEach(function (id) { classeDe[id] = m[2]; });
    });
    return { nos: nos, ordem: ordem, arestas: arestas, classeDe: classeDe };
  }

  function nivelDe(classe) {
    for (var i = 0; i < NIVEIS.length; i++) if (NIVEIS[i].classes.indexOf(classe) >= 0) return i;
    return -1;
  }

  function separarRotulo(rotulo) {
    var m = /^(.+?)\s+-\s+(.+)$/.exec(rotulo);
    return m ? { id: m[1], desc: m[2] } : { id: rotulo, desc: "" };
  }

  function renderArvore(container) {
    var dados = lerArvore(container.getAttribute("data-codigo"));
    var nivel = {}, pai = {}, filhos = {};
    dados.ordem.forEach(function (id) { nivel[id] = nivelDe(dados.classeDe[id]); filhos[id] = []; });
    dados.arestas.forEach(function (a) {
      if (pai[a.destino] === undefined) { pai[a.destino] = a.origem; filhos[a.origem].push(a.destino); }
    });
    var FOLHA = NIVEIS.length - 1;
    var raizes = dados.ordem.filter(function (id) { return pai[id] === undefined; });

    // Posições: cada nó do nível "Caso de Uso" ocupa um bloco com os chips dos requisitos.
    var pos = {}, chipsPos = {}, yAtual = CAB_A;
    function colX(n) { return n * (CAIXA_L + COL_ESPACO); }
    function posicionar(id) {
      var n = nivel[id];
      var subs = filhos[id].filter(function (f) { return nivel[f] < FOLHA; });
      var folhas = filhos[id].filter(function (f) { return nivel[f] === FOLHA; });
      if (folhas.length) {
        var porTipo = {};
        folhas.forEach(function (f) { (porTipo[dados.classeDe[f]] = porTipo[dados.classeDe[f]] || []).push(f); });
        var linha = 0;
        ["cls_rf", "cls_rnf", "cls_rn"].forEach(function (t) {
          (porTipo[t] || []).forEach(function (f, i) {
            if (i && i % CHIPS_POR_LINHA === 0) linha++;
            chipsPos[f] = { x: colX(FOLHA) + (i % CHIPS_POR_LINHA) * (CHIP_L + CHIP_ESPACO), linha: linha };
          });
          if ((porTipo[t] || []).length) linha++;
        });
        var alturaChips = linha * CHIP_A + (linha - 1) * CHIP_ESPACO;
        var altura = Math.max(CAIXA_A, alturaChips);
        var topo = yAtual;
        Object.keys(chipsPos).forEach(function (f) {
          if (pai[f] === id) chipsPos[f].y = topo + (altura - alturaChips) / 2 + chipsPos[f].linha * (CHIP_A + CHIP_ESPACO);
        });
        pos[id] = { x: colX(n), y: topo + (altura - CAIXA_A) / 2 };
        yAtual = topo + altura + GRUPO_ESPACO;
        return;
      }
      if (!subs.length) {
        pos[id] = { x: colX(n), y: yAtual };
        yAtual += CAIXA_A + GRUPO_ESPACO;
        return;
      }
      subs.forEach(posicionar);
      var ys = subs.map(function (f) { return pos[f].y; });
      pos[id] = { x: colX(n), y: (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2 };
    }
    raizes.forEach(posicionar);

    var largura = colX(FOLHA) + CHIPS_POR_LINHA * (CHIP_L + CHIP_ESPACO);
    var altura = yAtual;

    var conteudo = document.createElement("div");
    conteudo.className = "arvore";
    conteudo.style.width = largura + "px";
    conteudo.style.height = altura + "px";

    NIVEIS.forEach(function (nv, i) {
      var cab = document.createElement("div");
      cab.className = "arvore__cabecalho";
      cab.style.left = colX(i) + "px";
      cab.style.width = (i === FOLHA ? CHIPS_POR_LINHA * (CHIP_L + CHIP_ESPACO) : CAIXA_L) + "px";
      cab.textContent = nv.titulo;
      conteudo.appendChild(cab);
    });

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "arvore__ligacoes");
    svg.setAttribute("width", largura);
    svg.setAttribute("height", altura);
    conteudo.appendChild(svg);

    var elementos = {}, linhas = [];
    function curva(x1, y1, x2, y2) {
      var mx = (x1 + x2) / 2;
      return "M" + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2;
    }

    dados.ordem.forEach(function (id) {
      var r = separarRotulo(dados.nos[id]);
      var classe = dados.classeDe[id] || "";
      var el;
      if (nivel[id] === FOLHA) {
        if (!chipsPos[id]) return;
        el = document.createElement("button");
        el.type = "button";
        el.className = "chip chip--" + classe.replace("cls_", "") + " arvore__chip";
        el.textContent = r.id;
        el.title = dados.nos[id];
        if (/^(RF|RNF|RN)\d{2}$/.test(r.id)) el.setAttribute("data-modal-id", r.id);
        el.style.left = chipsPos[id].x + "px";
        el.style.top = chipsPos[id].y + "px";
      } else {
        if (!pos[id]) return;
        el = document.createElement("div");
        el.className = "arvore__no arvore__no--" + classe.replace("cls_", "");
        el.title = dados.nos[id];
        var forte = document.createElement("strong");
        forte.textContent = r.id;
        var desc = document.createElement("span");
        desc.textContent = r.desc;
        el.appendChild(forte);
        el.appendChild(desc);
        el.style.left = pos[id].x + "px";
        el.style.top = pos[id].y + "px";
      }
      el.dataset.no = id;
      conteudo.appendChild(el);
      elementos[id] = el;
    });

    // Ligações: nó -> nó; caso de uso -> primeiro chip de cada linha.
    dados.arestas.forEach(function (a) {
      if (!pos[a.origem]) return;
      var x1 = pos[a.origem].x + CAIXA_L, y1 = pos[a.origem].y + CAIXA_A / 2, x2, y2;
      if (nivel[a.destino] === FOLHA) {
        var c = chipsPos[a.destino];
        if (!c) return;
        var primeiro = Object.keys(chipsPos).some(function (f) {
          return pai[f] === a.origem && chipsPos[f].linha === c.linha && chipsPos[f].x < c.x;
        });
        if (primeiro) { linhas.push({ origem: a.origem, destino: a.destino, el: null }); return; }
        x2 = c.x; y2 = c.y + CHIP_A / 2;
      } else {
        if (!pos[a.destino]) return;
        x2 = pos[a.destino].x; y2 = pos[a.destino].y + CAIXA_A / 2;
      }
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", curva(x1, y1, x2, y2));
      if (pai[a.destino] !== a.origem) path.setAttribute("class", "arvore__secundaria");
      svg.appendChild(path);
      linhas.push({ origem: a.origem, destino: a.destino, el: path });
    });

    // Destaque do caminho: de onde o item deriva e o que deriva dele.
    function alcance(inicio, de, para) {
      var vis = {}; vis[inicio] = true;
      var fila = [inicio];
      while (fila.length) {
        var atual = fila.shift();
        dados.arestas.forEach(function (a) {
          if (a[de] === atual && !vis[a[para]]) { vis[a[para]] = true; fila.push(a[para]); }
        });
      }
      return vis;
    }
    // Um requisito aparece uma vez em cada caso de uso: destaca todas as ocorrências.
    function ocorrencias(id) {
      var codigo = elementos[id] && elementos[id].getAttribute("data-modal-id");
      if (!codigo) return [id];
      return Object.keys(elementos).filter(function (n) {
        return elementos[n].getAttribute("data-modal-id") === codigo;
      });
    }
    function destacar(id) {
      if (container.classList.contains("arrastando")) return;
      var acima = {}, abaixo = {};
      ocorrencias(id).forEach(function (o) {
        Object.assign(acima, alcance(o, "destino", "origem"));
        Object.assign(abaixo, alcance(o, "origem", "destino"));
      });
      var no = {};
      Object.keys(acima).forEach(function (n) { no[n] = true; });
      Object.keys(abaixo).forEach(function (n) { no[n] = true; });
      conteudo.classList.add("arvore--destaque");
      Object.keys(elementos).forEach(function (n) { elementos[n].classList.toggle("arvore--ativo", !!no[n]); });
      linhas.forEach(function (l) {
        if (!l.el) return;
        var ativo = (acima[l.origem] && acima[l.destino]) || (abaixo[l.origem] && abaixo[l.destino]);
        l.el.classList.toggle("arvore--ativo", !!ativo);
      });
    }
    function limpar() {
      conteudo.classList.remove("arvore--destaque");
      conteudo.querySelectorAll(".arvore--ativo").forEach(function (el) { el.classList.remove("arvore--ativo"); });
    }
    Object.keys(elementos).forEach(function (id) {
      elementos[id].addEventListener("mouseenter", function () { destacar(id); });
      elementos[id].addEventListener("mouseleave", limpar);
    });

    montarJanela(container, conteudo, largura, altura);
  }

  function renderizar(container) {
    if (container.classList.contains("mermaid-arvore")) { renderArvore(container); return; }
    var codigo = container.getAttribute("data-codigo");
    var id = "mermaid-caminho-" + contador++;
    // Mede o texto com a mesma fonte da página, para os rótulos não saírem cortados.
    var fonte = getComputedStyle(container).fontFamily;
    var pronto = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    pronto.then(function () {
      mermaid.initialize({ startOnLoad: false, theme: tema(), fontFamily: fonte, themeVariables: { fontFamily: fonte } });
      return mermaid.render(id, codigo);
    }).then(function (resultado) {
      container.innerHTML = resultado.svg;
      ligarInteracao(container);
    }).catch(function (erro) {
      container.textContent = "Erro ao renderizar o diagrama: " + erro;
    });
  }

  function iniciar() {
    document.querySelectorAll("pre.mermaid-caminho").forEach(function (pre) {
      var container = document.createElement("div");
      container.className = "mermaid mermaid-caminho-container";
      if (/^\s*%%\s*arvore\s*$/m.test(pre.textContent)) container.classList.add("mermaid-arvore");
      container.setAttribute("data-codigo", pre.textContent);
      pre.replaceWith(container);
      renderizar(container);
    });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(iniciar);
  } else {
    document.addEventListener("DOMContentLoaded", iniciar);
  }

  new MutationObserver(function () {
    document.querySelectorAll(".mermaid-caminho-container:not(.mermaid-arvore)").forEach(renderizar);
  }).observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
})();
