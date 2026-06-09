const ArvoreB = require('./arvore_b');
const fs = require('fs');

console.log("=================================================");
console.log("   Bateria de Testes Automatizados - Árvore B    ");
console.log("=================================================");

// Função que executa um cenário de teste completo na Árvore B
function rodarTeste(qtdChaves, ordem) {
    console.log(`\n▶ Iniciando teste com Árvore de Ordem ${ordem} e ${qtdChaves} chaves...`);
    
    let arvore = new ArvoreB(ordem);
    
    // Preparando as variáveis de medição de desempenho
    let tempoInicio = process.hrtime();
    let memoriaAntes = process.memoryUsage().heapUsed;
    let totalNosVisitadosInsercao = 0;

    // ==========================================
    // Teste 1: Inserção de Elementos
    // ==========================================
    for (let i = 0; i < qtdChaves; i++) {
        arvore.nosVisitados = 0; // Zera para cada operação
        arvore.inserir(`chave_${i}`); // Insere chaves em formato de string
        totalNosVisitadosInsercao += arvore.nosVisitados;
    }
    
    let memoriaDepoisInsercao = process.memoryUsage().heapUsed;
    let tempoFimInsercao = process.hrtime(tempoInicio);
    let tempoInsercaoMs = (tempoFimInsercao[0] * 1000) + (tempoFimInsercao[1] / 1000000);

    console.log(`[+] Inserção concluída!`);
    console.log(`    Tempo gasto: ${tempoInsercaoMs.toFixed(2)} ms`);
    console.log(`    Nós visitados (média por chave): ${(totalNosVisitadosInsercao / qtdChaves).toFixed(2)}`);
    console.log(`    Memória alocada: ${(Math.abs(memoriaDepoisInsercao - memoriaAntes) / 1024 / 1024).toFixed(2)} MB`);

    // ==========================================
    // Teste 2: Busca de Elementos (Amostragem)
    // ==========================================
    tempoInicio = process.hrtime();
    let totalNosVisitadosBusca = 0;
    
    // Vamos buscar 10% das chaves (ou no mínimo 1) para ter uma média de desempenho justa
    let qtdBuscas = Math.max(1, Math.floor(qtdChaves * 0.1));
    for (let i = 0; i < qtdBuscas; i++) {
        arvore.nosVisitados = 0;
        arvore.buscar(`chave_${i}`);
        totalNosVisitadosBusca += arvore.nosVisitados;
    }

    let tempoFimBusca = process.hrtime(tempoInicio);
    let tempoBuscaMs = (tempoFimBusca[0] * 1000) + (tempoFimBusca[1] / 1000000);
    
    console.log(`[+] Busca concluída! (Amostra de ${qtdBuscas} buscas)`);
    console.log(`    Tempo gasto: ${tempoBuscaMs.toFixed(2)} ms`);
    console.log(`    Nós visitados (média por busca): ${(totalNosVisitadosBusca / qtdBuscas).toFixed(2)}`);

    // ==========================================
    // Teste 3: Salvamento do arquivo para testar Compressão
    // ==========================================
    let nomeArquivo = `arvore_teste_${qtdChaves}_ordem_${ordem}.json`;
    arvore.salvar(nomeArquivo);
    console.log(`[+] Arquivo da árvore salvo em: ${nomeArquivo}`);
}

// -----------------------------------------------------------
// Execução dos cenários pedidos pelo professor no PDF
// -----------------------------------------------------------

// Teste 1: Pequena quantidade (Dezenas de chaves, ordem pequena)
rodarTeste(50, 3);

// Teste 2: Média quantidade (Milhares de chaves, ordem média)
rodarTeste(5000, 50);

// Teste 3: Grande quantidade (100.000 chaves, ordem alta)
// NOTA IMPORTANTE PARA O PROFESSOR:
// O PDF pede para testar "bilhões de chaves". Porém, as engines do JavaScript (como a V8 do Node.js)
// têm um limite estrito de memória heap (geralmente em torno de 1.5GB - 2GB por padrão).
// Alocar bilhões de objetos de classe iria "estourar" a memória (Out of Memory Error).
// Em um sistema real (Banco de Dados / SO), os nós da árvore B são armazenados em disco (paginação),
// e não completamente na memória RAM.
// Portanto, limitamos este script a 100.000 chaves para simular uma árvore grande sem quebrar a
// máquina na hora da apresentação do trabalho.
rodarTeste(100000, 100);

console.log("\n=================================================");
console.log(" Testes finalizados! Agora, teste a compressão:  ");
console.log("=================================================");
console.log("Digite no terminal:");
console.log("node compressao.js arvore_teste_5000_ordem_50.json lzw");
console.log("node compressao.js arvore_teste_5000_ordem_50.json huffman");
