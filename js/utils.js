// ======================================================
// UTILS.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// Funções auxiliares globais
// ======================================================



// ======================================================
// FORMATAR NÚMEROS
// ======================================================

function formatarNumero(valor) {

    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }


    return Number(valor).toLocaleString("pt-BR");

}





// ======================================================
// NORMALIZAR TEXTO
// Remove espaços e padroniza letras
// ======================================================

function normalizarTexto(texto) {


    if (!texto) {
        return "";
    }


    return String(texto)
        .trim()
        .toUpperCase();

}





// ======================================================
// REMOVER ACENTOS
// ======================================================

function removerAcentos(texto) {


    if (!texto) {
        return "";
    }


    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}





// ======================================================
// CALCULAR DIAS RESTANTES
// ======================================================

function calcularDiasRestantes(dataFinal) {


    const hoje = new Date();


    const prazo = new Date(dataFinal);



    const diferenca =
        prazo - hoje;



    const dias =
        Math.ceil(
            diferenca /
            (1000 * 60 * 60 * 24)
        );



    return dias > 0 ? dias : 0;

}





// ======================================================
// AGRUPAR DADOS
// Exemplo:
// sistemas, vagões, status
// ======================================================

function agruparPor(lista, campo) {


    const resultado = {};



    lista.forEach(item => {


        const chave =
            item[campo] || "NÃO INFORMADO";



        if (!resultado[chave]) {

            resultado[chave] = 0;

        }


        resultado[chave]++;


    });



    return resultado;

}





// ======================================================
// ORDENAR OBJETO POR VALOR
// ======================================================

function ordenarMaior(objeto) {


    return Object.entries(objeto)

        .sort(
            (a,b) => b[1] - a[1]
        )

        .reduce(
            (acc,[chave,valor]) => {

                acc[chave] = valor;

                return acc;

            },
            {}
        );

}





// ======================================================
// PEGAR ELEMENTO HTML
// ======================================================

function selecionar(id) {


    return document.getElementById(id);

}





// ======================================================
// ATUALIZAR TEXTO HTML
// ======================================================

function atualizarTexto(id, valor) {


    const elemento =
        selecionar(id);



    if(elemento){

        elemento.innerText =
            valor;

    }


}



// ======================================================
// LOG PADRONIZADO
// ======================================================

function logDashboard(mensagem, dados = null) {


    console.log(
        `%c[DASHBOARD JAYORO] ${mensagem}`,
        "color:#2563eb;font-weight:bold;",
        dados || ""
    );


}


// ======================================================
// EXPORTAR FUNÇÕES
// ======================================================

window.formatarNumero = formatarNumero;

window.normalizarTexto = normalizarTexto;

window.removerAcentos = removerAcentos;

window.calcularDiasRestantes = calcularDiasRestantes;

window.agruparPor = agruparPor;

window.ordenarMaior = ordenarMaior;

window.selecionar = selecionar;

window.atualizarTexto = atualizarTexto;

window.logDashboard = logDashboard;