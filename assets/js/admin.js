/**
 * INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadInscricoes();
    await loadFiltros();
});

/**
 * CARREGA INSCRIÇÕES
 */
async function loadInscricoes(filters = {}) {
    try {
        let url = `${API_URL}?action=getInscricoes&status=Confirmado`;

        if (filters.curso_id) {
            url += `&curso_id=${filters.curso_id}`;
        }

        if (filters.data) {
            url += `&data=${filters.data}`;
        }

        const response = await fetch(url);
        const inscricoes = await response.json();

        renderInscricoes(inscricoes);

    } catch (error) {
        console.error('Erro:', error);
    }
}

/**
 * RENDERIZA INSCRIÇÕES
 */
function renderInscricoes(inscricoes) {
    const tbody = document.getElementById('tabela-inscritos');

    tbody.innerHTML = inscricoes.map(inscricao => `
      <tr>
        <td>${inscricao.nome}</td>
        <td>${inscricao.curso}</td>
        <td>${new Date(inscricao.data).toLocaleDateString('pt-BR')}</td>
        <td><span class="badge bg-success">${inscricao.status}</span></td>
      </tr>
    `).join('');
}

/**
 * CARREGA FILTROS
 */
async function loadFiltros() {
    try {
        const response = await fetch(`${API_URL}?action=getCursos`);
        const cursos = await response.json();

        const select = document.getElementById('filtro-curso');
        cursos.forEach(curso => {
            select.innerHTML += `<option value="${curso.id}">${curso.titulo}</option>`;
        });

        // Event listeners
        document.getElementById('filtro-curso').addEventListener('change', (e) => {
            loadInscricoes({ curso_id: e.target.value });
        });

        document.getElementById('filtro-data').addEventListener('change', (e) => {
            loadInscricoes({ data: e.target.value });
        });

    } catch (error) {
        console.error('Erro:', error);
    }
}