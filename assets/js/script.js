/**
 * CONFIGURAÇÕES
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbwovUdF_mAi92oYVWSk4J_vp3lqc7LuFwsyXOVI2LKhM2WCc2tx_mQ3ZGVjuzZznKvJtw/exec';
const CACHE_KEY = 'cursos_cache';

/**
 * INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('cursos-container')) {
    await loadCursos();
  }
  
  if (document.getElementById('form-inscricao')) {
    initForm();
  }
});

/**
 * CARREGA CURSOS
 */
async function loadCursos() {
  try {
    // Adiciona timestamp para evitar cache
    const url = `${API_URL}?action=getCursos&t=${Date.now()}`;
    
    // Configuração especial para contornar CORS com Google Apps Script
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    });

    // Verifica se houve redirecionamento
    if (response.redirected) {
      const finalUrl = response.url;
      const finalResponse = await fetch(finalUrl);
      const data = await finalResponse.json();
      renderCursos(data);
    } else {
      const data = await response.json();
      renderCursos(data);
    }
    
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    // Mostra mensagem de erro amigável ao usuário
    document.getElementById('cursos-container').innerHTML = `
      <div class="alert alert-danger">
        <h5>Erro ao carregar cursos</h5>
        <p>${error.message}</p>
        <button onclick="location.reload()" class="btn btn-sm btn-secondary">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

/**
 * RENDERIZA CURSOS
 */
function renderCursos(cursos) {
  const container = document.getElementById('cursos-container');
  
  container.innerHTML = cursos.map(curso => `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <img src="${curso.imagem_url || 'https://via.placeholder.com/300x180?text=Curso'}" 
             class="card-img-top" 
             alt="${curso.titulo}">
        <div class="card-body">
          <h5 class="card-title">${curso.titulo}</h5>
          <p class="card-text">${curso.descricao}</p>
          <p class="text-muted">Vagas: ${curso.vagas_disponiveis}/${curso.vagas_totais}</p>
        </div>
        <div class="card-footer bg-white">
          <a href="curso.html?id=${curso.id}" class="btn btn-primary w-100">
            Inscreva-se
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * CARREGA INFORMAÇÕES DO CURSO
 */
async function loadCursoInfo() {
  const cursoId = new URLSearchParams(window.location.search).get('id');
  if (!cursoId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const container = document.getElementById('curso-info');
    container.innerHTML = '<div class="text-center my-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    const response = await fetch(`${API_URL}?action=getCursos`);
    const cursos = await response.json();
    const curso = cursos.find(c => c.id === cursoId);
    
    if (!curso) {
      window.location.href = 'index.html';
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h2>${curso.titulo}</h2>
          <p>${curso.descricao}</p>
          <p><strong>Vagas disponíveis:</strong> ${curso.vagas_disponiveis}/${curso.vagas_totais}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar curso:', error);
    document.getElementById('curso-info').innerHTML = `
      <div class="alert alert-danger">
        Erro ao carregar informações do curso. Recarregue a página.
      </div>
    `;
  }
}

/**
 * VALIDA CPF
 */
function validarCPF(cpf) { 
  cpf = cpf.replace(/[^\d]+/g,''); 
  if(cpf == '') return false; 
  
  // Elimina CPFs invalidos conhecidos 
  if (cpf.length != 11 || 
      cpf == "00000000000" || 
      cpf == "11111111111" || 
      cpf == "22222222222" || 
      cpf == "33333333333" || 
      cpf == "44444444444" || 
      cpf == "55555555555" || 
      cpf == "66666666666" || 
      cpf == "77777777777" || 
      cpf == "88888888888" || 
      cpf == "99999999999")
      return false; 
      
  // Valida 1o digito 
  let add = 0; 
  for (let i=0; i < 9; i ++) 
      add += parseInt(cpf.charAt(i)) * (10 - i); 
  let rev = 11 - (add % 11); 
  if (rev == 10 || rev == 11) 
      rev = 0; 
  if (rev != parseInt(cpf.charAt(9))) 
      return false; 
      
  // Valida 2o digito 
  add = 0; 
  for (let i = 0; i < 10; i ++) 
      add += parseInt(cpf.charAt(i)) * (11 - i); 
  rev = 11 - (add % 11); 
  if (rev == 10 || rev == 11) 
      rev = 0; 
  if (rev != parseInt(cpf.charAt(10))) 
      return false; 
      
  return true; 
}

/**
 * INICIALIZA FORMULÁRIO
 */
function initForm() {
  loadCursoInfo();
  const form = document.getElementById('form-inscricao');
  
  // Preenche info do curso
  const cursoId = new URLSearchParams(window.location.search).get('id');
  document.getElementById('curso_id').value = cursoId;
  
  // Máscara para CPF
  const cpfInput = document.getElementById('cpf');
  cpfInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
  });

  // Validação customizada de CPF
  cpfInput.addEventListener('blur', function(e) {
    if (!validarCPF(e.target.value.replace(/\D/g, ''))) {
      cpfInput.setCustomValidity('CPF inválido');
    } else {
      cpfInput.setCustomValidity('');
    }
  });

  // Validação
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
    
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    button.disabled = true;
    
    try {
      const formData = {
        curso_id: cursoId,
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        cpf: document.getElementById('cpf').value.replace(/\D/g, '')
      };
      
      const response = await fetch(`${API_URL}?action=addInscricao`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Mostrar modal de sucesso
      const modal = new bootstrap.Modal(document.getElementById('successModal'));
      modal.show();
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
      
    } catch (error) {
      alert('Erro ao enviar inscrição. Tente novamente.');
      button.innerHTML = originalText;
      button.disabled = false;
    }
  });
}