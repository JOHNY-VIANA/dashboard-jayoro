// Utilitários e regras de negócio compartilhadas do dashboard.
const SISTEMAS_OBRIGATORIOS = [
    "SUSPENSÃO", "PNEUMATICO", "ESTRUTURA", "CHASSI", "RODANTE(PNEUS)",
    "FREIO", "ELÉTRICA", "EIXO DIANTEIRO", "EIXO TRASEIRO"
];
const PERIODO_PROJETO = "01/11/2025 — 10/08/2026";

function normalizarTexto(valor) {
    return String(valor ?? "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}

function normalizarSistema(valor) {
    const texto = normalizarTexto(valor).replace(/\s*\(\s*/g, "(").replace(/\s*\)/g, ")");
    const aliases = {
        SUSPENSAO: "SUSPENSÃO", PNEUMATICO: "PNEUMATICO", ESTRUTURA: "ESTRUTURA",
        CHASSI: "CHASSI", "RODANTE(PNEUS)": "RODANTE(PNEUS)", FREIO: "FREIO",
        FREIOS: "FREIO", ELETRICA: "ELÉTRICA", ELETRICO: "ELÉTRICA",
        "EIXO DIANTEIRO": "EIXO DIANTEIRO", "EIXO TRASEIRO": "EIXO TRASEIRO"
    };
    return aliases[texto] || null;
}

function normalizarEquipamento(valor) {
    const exibicao = normalizarTexto(valor);
    if (!exibicao || exibicao === "NAO INFORMADO") return { chave: "", exibicao: "" };
    const semSeparadores = exibicao.replace(/[\s._/-]+/g, "");
    const chave = /^\d+$/.test(semSeparadores)
        ? String(Number(semSeparadores))
        : semSeparadores;
    return { chave, exibicao };
}

function obterValorPorColunas(linha, aliases) {
    const porChave = new Map(Object.entries(linha || {}).map(([chave, valor]) => [normalizarTexto(chave), valor]));
    for (const alias of aliases) {
        const valor = porChave.get(normalizarTexto(alias));
        if (valor !== undefined && valor !== null && String(valor).trim() !== "") return valor;
    }
    return "";
}

function normalizarRegistro(linha) {
    const equipamentoOriginal = obterValorPorColunas(linha, ["EQUIPAMENTO", "PREFIXO", "VAGÃO", "VAGAO"]);
    const equipamento = normalizarEquipamento(equipamentoOriginal);
    const sistemaOriginal = obterValorPorColunas(linha, ["SISTEMA"]);
    return {
        equipamento: equipamento.exibicao || "NÃO INFORMADO",
        equipamentoChave: equipamento.chave,
        sistema: normalizarSistema(sistemaOriginal),
        sistemaOriginal: String(sistemaOriginal || "").trim(),
        os: obterValorPorColunas(linha, ["Nº O.S", "N° O.S", "N O.S", "OS", "ORDEM"]),
        data: obterValorPorColunas(linha, ["DATA"]),
        tarefa: obterValorPorColunas(linha, ["TAREFA"]),
        componente: obterValorPorColunas(linha, ["COMPONENTE"]),
        destino: obterValorPorColunas(linha, ["DESTINO"])
    };
}

function compararEquipamentos(a, b) {
    return a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
}

function converterData(valor) {
    if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;
    const texto = String(valor || "").trim();
    const partes = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const data = partes ? new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1])) : new Date(texto);
    return Number.isNaN(data.getTime()) ? null : data;
}

function gerarResumoDados(dados) {
    const equipamentos = new Map();
    const sistemasExecutados = new Map();
    const datas = [];
    for (const registro of dados) {
        if (!registro.equipamentoChave) continue;
        if (!equipamentos.has(registro.equipamentoChave)) {
            equipamentos.set(registro.equipamentoChave, { equipamento: registro.equipamento, sistemas: new Set(), registros: 0 });
        }
        const item = equipamentos.get(registro.equipamentoChave);
        item.registros += 1;
        if (registro.sistema) {
            item.sistemas.add(registro.sistema);
            sistemasExecutados.set(registro.sistema, (sistemasExecutados.get(registro.sistema) || 0) + 1);
        }
        const data = converterData(registro.data);
        if (data) datas.push(data);
    }
    const resumoVagoes = [...equipamentos.values()].sort((a, b) => compararEquipamentos(a.equipamento, b.equipamento)).map(item => {
        const apontados = item.sistemas.size;
        const faltantes = SISTEMAS_OBRIGATORIOS.filter(sistema => !item.sistemas.has(sistema));
        // Regra explícita: 0 = sem apontamento; 1–3 = crítico; 4–8 = em andamento; 9 = concluído.
        const status = apontados === 0 ? "SEM APONTAMENTO" : apontados <= 3 ? "CRÍTICO" : apontados < SISTEMAS_OBRIGATORIOS.length ? "EM ANDAMENTO" : "CONCLUÍDO";
        return { ...item, apontados, faltantes, percentual: apontados / SISTEMAS_OBRIGATORIOS.length * 100, status };
    });
    const pendenciasPorSistema = Object.fromEntries(SISTEMAS_OBRIGATORIOS.map(sistema => [sistema, resumoVagoes.filter(item => item.faltantes.includes(sistema)).length]));
    const contar = status => resumoVagoes.filter(item => item.status === status).length;
    return {
        total: dados.length,
        equipamentos: resumoVagoes.map(item => item.equipamento),
        resumoVagoes,
        sistemas: SISTEMAS_OBRIGATORIOS.filter(sistema => sistemasExecutados.has(sistema)),
        sistemasExecutados: Object.fromEntries(sistemasExecutados),
        pendenciasPorSistema,
        concluidos: contar("CONCLUÍDO"), emAndamento: contar("EM ANDAMENTO"),
        criticos: contar("CRÍTICO"), semApontamento: contar("SEM APONTAMENTO"),
        periodo: datas.length ? { inicio: new Date(Math.min(...datas)), fim: new Date(Math.max(...datas)) } : null,
        percentualGeral: resumoVagoes.length ? resumoVagoes.reduce((total, item) => total + item.apontados, 0) / (resumoVagoes.length * SISTEMAS_OBRIGATORIOS.length) * 100 : 0
    };
}

function gerarAnalises(resumo) {
    if (!resumo?.resumoVagoes?.length) return {
        sistemas: "Importe um banco válido para gerar a análise dos sistemas.",
        matriz: "Importe um banco válido para gerar a análise da matriz.",
        percentual: "Importe um banco válido para gerar a análise de avanço da frota."
    };
    const maisExecutado = Object.entries(resumo.sistemasExecutados).sort((a, b) => b[1] - a[1])[0];
    const maiorPendencia = Object.entries(resumo.pendenciasPorSistema).sort((a, b) => b[1] - a[1])[0];
    const semApontamento = resumo.resumoVagoes.find(item => item.status === "SEM APONTAMENTO");
    const maiorPendente = [...resumo.resumoVagoes].sort((a, b) => b.faltantes.length - a.faltantes.length)[0];
    const sistemas = [
        maisExecutado ? `Sistema mais registrado: ${maisExecutado[0]} (${maisExecutado[1]} apontamentos).` : "Não há apontamentos nos sistemas obrigatórios.",
        maiorPendencia?.[1] ? `${maiorPendencia[0]} concentra ${maiorPendencia[1]} pendência(s) na frota.` : "Não há pendências nos sistemas obrigatórios."
    ].join(" ");
    const matriz = semApontamento
        ? `Vagão ${semApontamento.equipamento} não possui apontamento registrado nos sistemas obrigatórios. ${maiorPendencia[0]} concentra a maior quantidade de pendências.`
        : maiorPendente.faltantes.length
            ? `${maiorPendente.equipamento} apresenta pendência em ${maiorPendente.faltantes.join(", ")}. ${maiorPendencia[0]} concentra ${maiorPendencia[1]} pendência(s) na frota.`
            : "Todos os vagões possuem apontamento nos nove sistemas obrigatórios.";
    const percentual = `Avanço médio da frota: ${resumo.percentualGeral.toFixed(1)}%. ${resumo.concluidos} vagão(ões) concluído(s), ${resumo.criticos} crítico(s) e ${resumo.semApontamento} sem apontamento.`;
    return { sistemas, matriz, percentual };
}

function validarIntegridadeDados(dados, resumo) {
    const resultado = { valido: Array.isArray(dados) && resumo.total === dados.length, erros: [] };
    if (!Array.isArray(dados) || !dados.length) resultado.erros.push("Não há registros para analisar.");
    if (resumo.equipamentos.length !== resumo.resumoVagoes.length) resultado.erros.push("Total de equipamentos inconsistente.");
    if (resumo.resumoVagoes.some(item => item.apontados + item.faltantes.length !== SISTEMAS_OBRIGATORIOS.length)) resultado.erros.push("Sistemas apontados e pendentes inconsistentes.");
    resultado.valido = resultado.erros.length === 0;
    return resultado;
}

function atualizarTexto(id, valor) { const elemento = document.getElementById(id); if (elemento) elemento.textContent = valor; }
function agruparPor(lista, campo) { return lista.reduce((resultado, item) => { const chave = item[campo] || "NÃO INFORMADO"; resultado[chave] = (resultado[chave] || 0) + 1; return resultado; }, {}); }
function ordenarMaior(objeto) { return Object.fromEntries(Object.entries(objeto).sort((a, b) => b[1] - a[1])); }

Object.assign(window, { SISTEMAS_OBRIGATORIOS, PERIODO_PROJETO, normalizarTexto, normalizarSistema, normalizarEquipamento, normalizarRegistro, gerarResumoDados, gerarAnalises, validarIntegridadeDados, atualizarTexto, agruparPor, ordenarMaior });
