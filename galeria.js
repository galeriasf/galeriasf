/* ============================================================
   CAPELA SANTA CLARA · galeria.js
   Álbuns, fotografias por álbum e visualizador ampliado.
   Cadastre álbuns e fotos em SCD.albuns (assets/js/dados.js).
   Cada foto: { arquivo:'assets/img/galeria/pasta/nome.jpg',
                legenda:'', credito:'' }  ou  { chave:'verbete' }
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const D = window.SCD;
  if (!D) return;

  const estado = { busca: '', situacao: '', ordem: 'tema', album: SC.param('album') || '' };
  const gradeAlbuns = document.getElementById('grade-albuns');
  const contador = document.getElementById('contador-albuns');
  const visaoAlbuns = document.getElementById('visao-albuns');
  const visaoAlbum = document.getElementById('visao-album');

  const resolver = f => {
    if (f.chave && D.imagens[f.chave]) {
      const i = D.imagens[f.chave];
      return { src: i.arquivo || i.src, alt: f.legenda || i.alt, legenda: f.legenda || i.alt, credito: f.credito || i.credito };
    }
    return { src: f.arquivo, alt: f.legenda || 'Fotografia do álbum', legenda: f.legenda || '', credito: f.credito || '' };
  };

  /* ---------- Lista de álbuns ---------- */
  function renderAlbuns() {
    let lista = D.albuns.filter(a =>
      (!estado.busca || SC.semAcento(a.titulo + ' ' + a.descricao).includes(SC.semAcento(estado.busca))) &&
      (!estado.situacao || (estado.situacao === 'com' ? a.fotos.length > 0 : a.fotos.length === 0))
    );
    if (estado.ordem === 'az') lista = [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    if (estado.ordem === 'fotos') lista = [...lista].sort((a, b) => b.fotos.length - a.fotos.length);

    const totalFotos = D.albuns.reduce((s, a) => s + a.fotos.length, 0);
    contador.innerHTML = `<strong>${lista.length}</strong> álbum(ns) · <strong>${totalFotos}</strong> imagem(ns) publicada(s) no portal`;

    gradeAlbuns.innerHTML = lista.length ? lista.map(a => `
      <a class="carta-album revelar" href="galeria.html?album=${a.id}" data-album="${a.id}" style="text-decoration:none" aria-label="Abrir álbum ${SC.esc(a.titulo)} — ${a.fotos.length} fotografia(s)">
        ${SC.img(a.capa, { classe: 'moldura moldura--4x3', selo: '' })}
        <span class="album-selo">${SC.ico('album', 'ico--p')}</span>
        <span class="album-contagem">${a.fotos.length ? a.fotos.length + ' fotografia' + (a.fotos.length === 1 ? '' : 's') : 'Aguardando fotografias'}</span>
        <div class="cartao-corpo">
          <div class="meta">${a.periodo ? `<span>${SC.esc(a.periodo)}</span>` : '<span class="etiqueta etiqueta--ambar">Período a cadastrar</span>'}</div>
          <h3>${SC.esc(a.titulo)}</h3>
          <p>${SC.esc(a.descricao)}</p>
          <div class="cartao-rodape">
            <span class="btn-texto">Abrir álbum${SC.ico('direita', 'ico--p')}</span>
            <code style="font-size:.68rem;color:var(--tinta-tenue)">${SC.esc(a.pasta)}/</code>
          </div>
        </div>
      </a>`).join('')
      : SC.vazio({ icone: 'busca', titulo: 'Nenhum álbum encontrado', texto: 'Ajuste a busca ou o filtro de situação para ver outros álbuns.' });
    SC.revelar(gradeAlbuns);
  }

  /* ---------- Álbum aberto ---------- */
  function abrirAlbum(id, atualizarURL = true) {
    const a = D.albuns.find(x => x.id === id);
    if (!a) { fecharAlbum(); return; }
    estado.album = id;
    if (atualizarURL) SC.atualizarURL(`${location.pathname}?album=${id}`);

    visaoAlbuns.hidden = true;
    visaoAlbum.hidden = false;
    document.getElementById('titulo-galeria').textContent = a.titulo;
    document.getElementById('descricao-galeria').textContent = a.descricao;
    document.getElementById('trilha-galeria').innerHTML =
      `<a href="index.html">Início</a> <span>/</span> <a href="galeria.html" id="trilha-voltar">Galeria</a> <span>/</span> <span>${SC.esc(a.titulo)}</span>`;
    document.getElementById('trilha-voltar').addEventListener('click', e => { e.preventDefault(); fecharAlbum(); });
    document.title = `${a.titulo} — Galeria · Capela Santa Clara`;
    document.getElementById('info-album').innerHTML =
      `${SC.ico('album', 'ico--p')}${a.fotos.length} fotografia(s)${a.periodo ? ' · ' + SC.esc(a.periodo) : ''}`;

    const alvo = document.getElementById('conteudo-album');
    if (!a.fotos.length) {
      alvo.innerHTML = `
        <div class="grade grade--2">
          ${SC.espacoFoto('assets/img/galeria/' + a.pasta + '/', 'Álbum aguardando fotografias oficiais')}
          <div class="cartao"><div class="cartao-corpo">
            <span class="etiqueta etiqueta--ambar">Nenhuma fotografia publicada</span>
            <h3>${SC.esc(a.titulo)}</h3>
            <p>${SC.esc(a.descricao)}</p>
            <p>Este álbum já está criado na estrutura do portal. Quando as fotografias forem enviadas e autorizadas, elas aparecerão aqui em grade, com legenda e visualização ampliada.</p>
            <ul class="lista-marcada">
              <li>${SC.ico('camera')}<span><strong>Formato:</strong> JPG, boa resolução, nomes sem espaços ou acentos.</span></li>
              <li>${SC.ico('local')}<span><strong>Pasta:</strong> <code>assets/img/galeria/${SC.esc(a.pasta)}/</code></span></li>
              <li>${SC.ico('check')}<span><strong>Autorização:</strong> necessária para imagens de pessoas, especialmente crianças.</span></li>
            </ul>
            <div class="cartao-rodape">
              <a class="btn btn--ouro btn--p" href="contato.html">Enviar fotografias</a>
              <button class="btn btn--contorno btn--p" type="button" data-voltar>Ver outros álbuns</button>
            </div>
          </div></div>
        </div>`;
    } else {
      const fotos = a.fotos.map(resolver);
      alvo.innerHTML = `
        <div class="grade-fotos" id="grade-fotos-album">
          ${fotos.map((f, i) => `<button class="miniatura" type="button" data-indice="${i}" aria-label="Ampliar fotografia ${i + 1}: ${SC.esc(f.legenda)}">
            <img src="${SC.esc(f.src)}" alt="${SC.esc(f.alt)}" loading="lazy" decoding="async"
              onerror="this.closest('.miniatura').style.display='none'">
          </button>`).join('')}
        </div>
        <p class="legenda-img mt-2">Clique em uma fotografia para ampliar. Use as setas do teclado para navegar e <strong>Esc</strong> para fechar.</p>`;
      document.getElementById('grade-fotos-album').addEventListener('click', e => {
        const b = e.target.closest('[data-indice]');
        if (b) VISUALIZADOR.abrir(fotos, Number(b.dataset.indice), a.titulo);
      });
    }
    alvo.querySelectorAll('[data-voltar]').forEach(b => b.addEventListener('click', () => fecharAlbum()));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fecharAlbum() {
    estado.album = '';
    SC.atualizarURL(location.pathname);
    visaoAlbum.hidden = true;
    visaoAlbuns.hidden = false;
    document.getElementById('titulo-galeria').textContent = 'Galeria de álbuns';
    document.getElementById('descricao-galeria').textContent = 'As fotografias da comunidade são organizadas em álbuns. Escolha um álbum para ver somente as suas imagens. As fotografias oficiais serão publicadas com autorização; até lá, cada álbum indica o espaço reservado.';
    document.getElementById('trilha-galeria').innerHTML = '<a href="index.html">Início</a> <span>/</span> <span>Galeria</span>';
    document.title = 'Galeria de álbuns — Capela Santa Clara | Uberaba/MG';
    renderAlbuns();
  }

  gradeAlbuns.addEventListener('click', e => {
    const b = e.target.closest('[data-album]');
    if (!b) return;
    e.preventDefault();
    abrirAlbum(b.dataset.album);
  });
  document.getElementById('voltar-galeria').addEventListener('click', () => fecharAlbum());
  document.getElementById('busca-albuns').addEventListener('input', e => { estado.busca = e.target.value; renderAlbuns(); });
  document.getElementById('filtro-albuns').addEventListener('change', e => { estado.situacao = e.target.value; renderAlbuns(); });
  document.getElementById('ordem-albuns').addEventListener('change', e => { estado.ordem = e.target.value; renderAlbuns(); });

  renderAlbuns();
  if (estado.album) abrirAlbum(estado.album, false);
});
