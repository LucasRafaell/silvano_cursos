/**
 * CONFIGURAÇÕES
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbzOeg_iOeMMz1PoUixvziWzGM_AQyAH9rRjEgPQO2kYi514mMJGAnwV4PB3Q3W_pZvX/exec';
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
    const container = document.getElementById('cursos-container');
    
    // Tenta carregar do cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      renderCursos(JSON.parse(cachedData));
    }
    
    // Busca atualização
    const response = await fetch(`${API_URL}?action=getCursos`);
    const cursos = await response.json();
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cursos));
    renderCursos(cursos);
    
  } catch (error) {
    console.error('Erro:', error);
    document.getElementById('cursos-container').innerHTML = `
      <div class="alert alert-danger">
        Erro ao carregar cursos. Recarregue a página.
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
 * INICIALIZA FORMULÁRIO
 */
function initForm() {
  const form = document.getElementById('form-inscricao');
  
  // Preenche info do curso
  const cursoId = new URLSearchParams(window.location.search).get('id');
  document.getElementById('curso_id').value = cursoId;
  
  // Validação
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
    
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
      
      alert('Inscrição enviada com sucesso!');
      window.location.href = 'index.html';
      
    } catch (error) {
      alert('Erro ao enviar inscrição. Tente novamente.');
    }
  });
}