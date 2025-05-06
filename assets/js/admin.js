/**
 * CONFIGURAÇÕES
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbwovUdF_mAi92oYVWSk4J_vp3lqc7LuFwsyXOVI2LKhM2WCc2tx_mQ3ZGVjuzZznKvJtw/exec';

/**
 * INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([loadInscricoes(), loadFiltros()]);
    } catch (error) {
        console.error('Erro na inicialização:', error);
        alert('Erro ao carregar dados. Recarregue a página.');
    }
});

/**
 * CARREGA INSCRIÇÕES
 */
async function loadInscricoes(filters = {}) {
    try {
        const tbody = document.getElementById('tabela-inscritos');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></td></tr>';
        
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
        document.getElementById('tabela-inscritos').innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Erro ao carregar inscrições. Recarregue a página.
                </td>
            </tr>
        `;
    }
}

/**
 * RENDERIZA INSCRIÇÕES
 */
function renderInscricoes(inscricoes) {
    const tbody = document.getElementById('tabela-inscritos');

    if (inscricoes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Nenhuma inscrição encontrada com os filtros atuais.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = inscricoes.map(inscricao => `
        <tr>
            <td>${inscricao.nome}</td>
            <td>${inscricao.curso}</td>
            <td>${new Date(inscricao.data).toLocaleDateString('pt-BR')}</td>
            <td>
                <select class="form-select form-select-sm status-select" data-id="${inscricao.id}">
                    <option value="Pendente" ${inscricao.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="Confirmado" ${inscricao.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="Cancelado" ${inscricao.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
        </tr>
    `).join('');

    // Adiciona event listeners para mudança de status
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            try {
                const button = e.target;
                const originalValue = button.dataset.originalValue;
                button.disabled = true;
                
                const response = await fetch(`${API_URL}?action=updateStatus`, {
                    method: 'POST',
                    body: JSON.stringify({
                        id: e.target.dataset.id,
                        status: e.target.value
                    })
                });
                
                if (!response.ok) throw new Error('Erro ao atualizar status');
                
                // Recarrega os dados após 1 segundo
                setTimeout(() => {
                    loadInscricoes();
                }, 1000);
                
            } catch (error) {
                alert('Erro ao atualizar status: ' + error.message);
                e.target.value = originalValue;
                loadInscricoes(); // Recarrega os dados
            } finally {
                e.target.disabled = false;
            }
        });
    });
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