// Função para abrir a câmera
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const foto = document.getElementById('foto');
const abrirCameraBtn = document.getElementById('abrirCamera');
const tirarFotoBtn = document.getElementById('tirarFoto');
const btnAbrirFoto = document.getElementById('btnAbrirFoto');
const inputFotoArquivo = document.getElementById('inputFotoArquivo');
let stream = null;
let fotoData = '';

// Carregar acessos do localStorage ao iniciar
function atualizarAcessos(filtro = '') {
  const acessosDiv = document.getElementById('acessos');
  acessosDiv.innerHTML = '';
  let acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
  if (filtro) {
    const termo = filtro.trim().toLowerCase();
    acessosSalvos = acessosSalvos.filter(a =>
      a.nome.toLowerCase().includes(termo) ||
      a.documento.toLowerCase().includes(termo)
    );
  }
  if (acessosSalvos.length > 0) {
    const h2 = document.createElement('h2');
    h2.className = 'text-lg font-bold text-blue-700 mb-4';
    h2.innerText = 'Acessos Registrados';
    acessosDiv.appendChild(h2);
  }
  acessosSalvos.forEach((acesso, idx) => {
    const div = document.createElement('div');
    div.className = 'acesso-item bg-gray-100 rounded-lg p-4 mb-4 shadow flex flex-col md:flex-row md:items-center gap-4';
    let status = acesso.baixado ? '<span class="text-green-700 font-bold">(Baixado)</span>' : '';
    div.innerHTML = `
      <div class="flex-1">
        <strong>Apartamento:</strong> ${acesso.apartamento}<br>
        <strong>Nome:</strong> ${acesso.nome}<br>
        <strong>Documento:</strong> ${acesso.documento}<br>
        <strong>Quem autorizou:</strong> ${acesso.autorizou}<br>
        <strong>Entrada:</strong> ${acesso.dataEntrada} ${acesso.horaEntrada}<br>
        <strong>Saída:</strong> ${acesso.dataSaida} ${acesso.horaSaida}<br>
        <strong>Empresa:</strong> ${acesso.empresa}<br>
        <strong>Serviço:</strong> ${acesso.servico}<br>
        ${status}
      </div>
      <div class="flex flex-col items-center gap-2">
        ${acesso.foto ? `<img src="${acesso.foto}" alt="Foto do prestador" class="w-24 h-20 object-cover rounded-lg border border-gray-400 cursor-pointer" data-ampliar="${idx}" />` : ''}
        <button class="btn-baixa-individual bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded ${acesso.baixado ? 'opacity-50 cursor-not-allowed' : ''}" data-index="${idx}" ${acesso.baixado ? 'disabled' : ''}>Dar Baixa</button>
      </div>
    `;
    acessosDiv.appendChild(div);
  });
}

window.onload = function() {
  atualizarAcessos();
};

const cameraOptionsDiv = document.createElement('div');
cameraOptionsDiv.className = 'flex gap-2 mb-2';
const btnFrontal = document.createElement('button');
btnFrontal.type = 'button';
btnFrontal.id = 'btnCameraFront';
btnFrontal.textContent = 'Câmera Frontal';
btnFrontal.className = 'bg-blue-400 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded text-xs';
const btnTraseira = document.createElement('button');
btnTraseira.type = 'button';
btnTraseira.id = 'btnCameraBack';
btnTraseira.textContent = 'Câmera Traseira';
btnTraseira.className = 'bg-green-400 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded text-xs';

// Adiciona os botões acima do vídeo
const fotoDiv = document.getElementById('foto').parentElement;
if (fotoDiv && !document.getElementById('btnCameraFront')) {
  fotoDiv.parentElement.insertBefore(cameraOptionsDiv, fotoDiv);
  cameraOptionsDiv.appendChild(btnFrontal);
  cameraOptionsDiv.appendChild(btnTraseira);
}

let cameraFacingMode = 'user'; // padrão frontal

btnFrontal.onclick = async function() {
  cameraFacingMode = 'user';
  await abrirCameraComFacingMode(cameraFacingMode);
};
btnTraseira.onclick = async function() {
  cameraFacingMode = 'environment';
  await abrirCameraComFacingMode(cameraFacingMode);
};

async function abrirCameraComFacingMode(facingMode) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      video.srcObject = stream;
      video.classList.remove('hidden');
      tirarFotoBtn.classList.remove('hidden');
      abrirCameraBtn.classList.add('hidden');
      foto.classList.add('hidden');
    } catch (e) {
      alert('Não foi possível acessar a câmera: ' + e.message);
    }
  }
}

abrirCameraBtn.onclick = async function() {
  cameraFacingMode = 'user';
  await abrirCameraComFacingMode(cameraFacingMode);
};

tirarFotoBtn.onclick = function() {
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  fotoData = canvas.toDataURL('image/png');
  foto.src = fotoData;
  foto.classList.remove('hidden');
  video.classList.add('hidden');
  tirarFotoBtn.classList.add('hidden');
  abrirCameraBtn.classList.remove('hidden');
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

// Botão Abrir Arquivo de Foto
if (btnAbrirFoto && inputFotoArquivo && foto) {
  btnAbrirFoto.onclick = function() {
    inputFotoArquivo.click();
  };
  inputFotoArquivo.onchange = function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        foto.src = evt.target.result;
        foto.classList.remove('hidden');
        fotoData = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
}

// Função para registrar acesso
const form = document.getElementById('acessoForm');
form.onsubmit = function(e) {
  e.preventDefault();
  const acesso = {
    apartamento: document.getElementById('apartamento').value,
    nome: document.getElementById('nome').value,
    documento: document.getElementById('documento').value,
    autorizou: document.getElementById('autorizou').value,
    dataEntrada: document.getElementById('dataEntrada').value,
    horaEntrada: document.getElementById('horaEntrada').value,
    dataSaida: document.getElementById('dataSaida').value,
    horaSaida: document.getElementById('horaSaida').value,
    empresa: document.getElementById('empresa').value,
    servico: document.getElementById('servico').value,
    foto: fotoData,
    baixado: false
  };
  const acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
  acessosSalvos.push(acesso);
  localStorage.setItem('acessos', JSON.stringify(acessosSalvos));
  atualizarAcessos();
  form.reset();
  foto.classList.add('hidden');
  foto.src = '';
  fotoData = '';
};

// Dar baixa individual
const acessosDiv = document.getElementById('acessos');
acessosDiv.addEventListener('click', function(e) {
  if (e.target.classList.contains('btn-baixa-individual')) {
    const idx = e.target.getAttribute('data-index');
    let acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
    if (acessosSalvos[idx]) {
      acessosSalvos[idx].baixado = true;
      // Preencher dataSaida e horaSaida automaticamente ao dar baixa
      const agora = new Date();
      const yyyy = agora.getFullYear();
      const mm = String(agora.getMonth() + 1).padStart(2, '0');
      const dd = String(agora.getDate()).padStart(2, '0');
      const hh = String(agora.getHours()).padStart(2, '0');
      const min = String(agora.getMinutes()).padStart(2, '0');
      acessosSalvos[idx].dataSaida = `${yyyy}-${mm}-${dd}`;
      acessosSalvos[idx].horaSaida = `${hh}:${min}`;
      localStorage.setItem('acessos', JSON.stringify(acessosSalvos));
      atualizarAcessos();
    }
  }
  // Ampliar foto ao clicar
  if (e.target.tagName === 'IMG' && e.target.alt === 'Foto do prestador') {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    const img = document.createElement('img');
    img.src = e.target.src;
    img.className = 'max-w-3xl max-h-[80vh] rounded-lg border-8 border-white shadow-2xl';
    overlay.appendChild(img);
    overlay.onclick = function() { document.body.removeChild(overlay); };
    document.body.appendChild(overlay);
  }
});

// Botão Relatório de Registros (exporta para CSV)
const btnRelatorio = document.getElementById('btnRelatorio');
if (btnRelatorio) {
  btnRelatorio.onclick = function() {
    const acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
    if (acessosSalvos.length === 0) {
      alert('Nenhum registro para exportar!');
      return;
    }
    let csv = 'Apartamento,Nome,Documento,Quem autorizou,Data Entrada,Hora Entrada,Data Saída,Hora Saída,Empresa,Serviço,Baixado\n';
    acessosSalvos.forEach(a => {
      csv += `"${a.apartamento}","${a.nome}","${a.documento}","${a.autorizou}","${a.dataEntrada}","${a.horaEntrada}","${a.dataSaida}","${a.horaSaida}","${a.empresa}","${a.servico}","${a.baixado ? 'Sim' : 'Não'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_acessos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
}

// Botão Exportar PDF
const btnExportarPDF = document.getElementById('btnExportarPDF');
if (btnExportarPDF) {
  btnExportarPDF.onclick = function() {
    const acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
    if (acessosSalvos.length === 0) {
      alert('Nenhum registro para exportar!');
      return;
    }
    let win = window.open('', '', 'width=900,height=700');
    win.document.write('<html><head><title>Relatório de Acessos</title>');
    win.document.write('<style>body{font-family:sans-serif;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:6px;}th{background:#f1f5f9;}</style>');
    win.document.write('</head><body>');
    win.document.write('<h2>Relatório de Acessos</h2>');
    win.document.write('<table><tr><th>Apartamento</th><th>Nome</th><th>Documento</th><th>Quem autorizou</th><th>Data Entrada</th><th>Hora Entrada</th><th>Data Saída</th><th>Hora Saída</th><th>Empresa</th><th>Serviço</th><th>Baixado</th></tr>');
    acessosSalvos.forEach(a => {
      win.document.write(`<tr><td>${a.apartamento}</td><td>${a.nome}</td><td>${a.documento}</td><td>${a.autorizou}</td><td>${a.dataEntrada}</td><td>${a.horaEntrada}</td><td>${a.dataSaida}</td><td>${a.horaSaida}</td><td>${a.empresa}</td><td>${a.servico}</td><td>${a.baixado ? 'Sim' : 'Não'}</td></tr>`);
    });
    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
  };
}

// Botão Arquivo (exporta JSON e permite abrir o arquivo)
const btnExportarArquivo = document.getElementById('btnExportarArquivo');
if (btnExportarArquivo) {
  btnExportarArquivo.onclick = function() {
    const acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
    if (acessosSalvos.length === 0) {
      alert('Nenhum registro para exportar!');
      return;
    }
    const blob = new Blob([JSON.stringify(acessosSalvos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // Abrir o arquivo em nova aba
    window.open(url, '_blank');
    // Também baixar o arquivo
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acessos.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

// Busca por nome ou documento
const btnBuscar = document.getElementById('btnBuscar');
const btnLimparBusca = document.getElementById('btnLimparBusca');
const buscaInput = document.getElementById('buscaInput');

if (btnBuscar && buscaInput) {
  btnBuscar.onclick = function() {
    const termo = buscaInput.value.trim().toLowerCase();
    atualizarAcessos(termo);
    // Preencher automaticamente os campos do formulário se encontrar documento exato
    if (termo) {
      const acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
      const encontrado = acessosSalvos.find(a => a.documento.toLowerCase() === termo);
      if (encontrado) {
        document.getElementById('apartamento').value = encontrado.apartamento;
        document.getElementById('nome').value = encontrado.nome;
        document.getElementById('documento').value = encontrado.documento;
        document.getElementById('autorizou').value = encontrado.autorizou;
        document.getElementById('dataEntrada').value = encontrado.dataEntrada;
        document.getElementById('horaEntrada').value = encontrado.horaEntrada;
        document.getElementById('dataSaida').value = encontrado.dataSaida;
        document.getElementById('horaSaida').value = encontrado.horaSaida;
        document.getElementById('empresa').value = encontrado.empresa;
        document.getElementById('servico').value = encontrado.servico;
        if (encontrado.foto) {
          foto.src = encontrado.foto;
          foto.classList.remove('hidden');
          fotoData = encontrado.foto;
        }
      }
    }
  };
}
if (btnLimparBusca && buscaInput) {
  btnLimparBusca.onclick = function() {
    buscaInput.value = '';
    atualizarAcessos();
  };
}

// Botão Enviar PDF por Email
const btnEnviarEmail = document.getElementById('btnEnviarEmail');
if (btnEnviarEmail) {
  btnEnviarEmail.onclick = function() {
    const acessosSalvos = JSON.parse(localStorage.getItem('acessos')) || [];
    if (acessosSalvos.length === 0) {
      alert('Nenhum registro para exportar!');
      return;
    }
    // Gera o HTML do relatório
    let html = '<h2>Relatório de Acessos</h2>';
    html += '<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif;">';
    html += '<tr><th>Apartamento</th><th>Nome</th><th>Documento</th><th>Quem autorizou</th><th>Data Entrada</th><th>Hora Entrada</th><th>Data Saída</th><th>Hora Saída</th><th>Empresa</th><th>Serviço</th><th>Baixado</th></tr>';
    acessosSalvos.forEach(a => {
      html += `<tr><td>${a.apartamento}</td><td>${a.nome}</td><td>${a.documento}</td><td>${a.autorizou}</td><td>${a.dataEntrada}</td><td>${a.horaEntrada}</td><td>${a.dataSaida}</td><td>${a.horaSaida}</td><td>${a.empresa}</td><td>${a.servico}</td><td>${a.baixado ? 'Sim' : 'Não'}</td></tr>`;
    });
    html += '</table>';
    // Cria um blob PDF usando o print-to-pdf do navegador
    const win = window.open('', '', 'width=900,height=700');
    win.document.write('<html><head><title>Relatório de Acessos</title></head><body>' + html + '</body></html>');
    win.document.close();
    // Solicita o email do usuário
    setTimeout(() => {
      win.print();
      const email = prompt('Digite o e-mail de destino para enviar o PDF:');
      if (email) {
        alert('Para enviar o PDF por e-mail, anexe o arquivo PDF gerado ao e-mail manualmente.\n\nPor questões de segurança, o envio automático só é possível com integração de backend.');
      }
    }, 500);
  };
}
