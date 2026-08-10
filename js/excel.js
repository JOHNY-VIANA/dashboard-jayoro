// Importação, validação e persistência do último conjunto válido de dados.
let dadosExcel = [];
let resumoExcel = gerarResumoDados([]);
const BANCO_DADOS = "dashboard-jayoro";
const STORE_DADOS = "conjuntos";
const CHAVE_ULTIMO_CONJUNTO = "ultimo-valido";

function abrirBanco() {
    return new Promise((resolve, reject) => {
        const pedido = indexedDB.open(BANCO_DADOS, 1);
        pedido.onupgradeneeded = () => pedido.result.createObjectStore(STORE_DADOS);
        pedido.onsuccess = () => resolve(pedido.result);
        pedido.onerror = () => reject(pedido.error);
    });
}

async function salvarUltimoConjunto(payload) {
    const banco = await abrirBanco();
    await new Promise((resolve, reject) => {
        const transacao = banco.transaction(STORE_DADOS, "readwrite");
        transacao.objectStore(STORE_DADOS).put(payload, CHAVE_ULTIMO_CONJUNTO);
        transacao.oncomplete = resolve;
        transacao.onerror = () => reject(transacao.error);
    });
    banco.close();
}

async function recuperarUltimoConjunto() {
    const banco = await abrirBanco();
    const payload = await new Promise((resolve, reject) => {
        const pedido = banco.transaction(STORE_DADOS, "readonly").objectStore(STORE_DADOS).get(CHAVE_ULTIMO_CONJUNTO);
        pedido.onsuccess = () => resolve(pedido.result);
        pedido.onerror = () => reject(pedido.error);
    });
    banco.close();
    return payload;
}

function validarPlanilha(linhas) {
    if (!Array.isArray(linhas) || !linhas.length) throw new Error("A planilha está vazia.");
    const colunas = new Set(Object.keys(linhas[0]).map(normalizarTexto));
    const possuiEquipamento = ["EQUIPAMENTO", "PREFIXO", "VAGÃO", "VAGAO"].some(coluna => colunas.has(normalizarTexto(coluna)));
    if (!possuiEquipamento || !colunas.has("SISTEMA")) throw new Error("A planilha deve conter as colunas EQUIPAMENTO (ou PREFIXO/VAGÃO) e SISTEMA.");
    const normalizados = linhas.map(normalizarRegistro);
    if (!normalizados.some(linha => linha.equipamentoChave)) throw new Error("Nenhum equipamento válido foi encontrado.");
    if (normalizados.some(linha => !linha.equipamentoChave)) throw new Error("Há registro(s) sem EQUIPAMENTO/PREFIXO; nenhuma substituição foi realizada.");
    return normalizados;
}

async function aplicarLinhas(linhas, origem, persistir) {
    const normalizados = validarPlanilha(linhas);
    const resumo = gerarResumoDados(normalizados);
    const integridade = validarIntegridadeDados(normalizados, resumo);
    if (!integridade.valido) throw new Error(integridade.erros.join(" "));
    if (persistir) await salvarUltimoConjunto({ dados: normalizados, origem, carregadoEm: new Date().toISOString() });
    dadosExcel = normalizados;
    resumoExcel = resumo;
    window.dadosExcel = dadosExcel;
    window.resumoExcel = resumoExcel;
    atualizarDashboard(dadosExcel, resumoExcel, { origem, carregadoEm: new Date().toISOString() });
}

async function importarExcel(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    try {
        const buffer = await arquivo.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const linhas = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
        await aplicarLinhas(linhas, arquivo.name, true);
    } catch (erro) {
        console.error("Importação rejeitada; o último conjunto válido foi preservado.", erro);
        alert(`Não foi possível importar o arquivo: ${erro.message}\nO último conjunto válido foi mantido.`);
    } finally {
        evento.target.value = "";
    }
}

async function restaurarUltimoConjunto() {
    try {
        const payload = await recuperarUltimoConjunto();
        if (payload?.dados?.length) {
            dadosExcel = payload.dados;
            resumoExcel = gerarResumoDados(dadosExcel);
            window.dadosExcel = dadosExcel;
            window.resumoExcel = resumoExcel;
            atualizarDashboard(dadosExcel, resumoExcel, payload);
        }
    } catch (erro) {
        console.warn("Não foi possível restaurar dados persistidos.", erro);
    }
}

window.addEventListener("DOMContentLoaded", restaurarUltimoConjunto);
Object.assign(window, { importarExcel, dadosExcel, resumoExcel, restaurarUltimoConjunto });
