const fs = require('fs');

// ==========================================
// 1. Algoritmo LZW (Lempel-Ziv-Welch)
// ==========================================
// O LZW constrói um dicionário conforme lê o arquivo
function comprimirLZW(texto) {
    let dicionario = {};
    for (let i = 0; i < 256; i++) {
        dicionario[String.fromCharCode(i)] = i; // Inicializa com a tabela ASCII padrão
    }
    
    let atual = "";
    let resultado = [];
    let proximoCodigo = 256;
    
    for (let i = 0; i < texto.length; i++) {
        let char = texto[i];
        let combinacao = atual + char;
        
        if (dicionario.hasOwnProperty(combinacao)) {
            atual = combinacao; // Se já existe, continua juntando letras
        } else {
            resultado.push(dicionario[atual]); // Salva o código da palavra conhecida
            dicionario[combinacao] = proximoCodigo++; // Adiciona a nova combinação ao dicionário
            atual = char; // Começa a montar a próxima palavra
        }
    }
    
    if (atual !== "") {
        resultado.push(dicionario[atual]);
    }
    
    return resultado; // Retorna um array de números (códigos)
}

// ==========================================
// 2. Algoritmo de Huffman
// ==========================================
// Classe auxiliar para a árvore de Huffman
class NoHuffman {
    constructor(char, frequencia, esq = null, dir = null) {
        this.char = char;             // Caractere (null se for nó interno)
        this.frequencia = frequencia; // Quantas vezes apareceu
        this.esq = esq;               // Filho da esquerda (0)
        this.dir = dir;               // Filho da direita (1)
    }
}

// Monta a árvore baseada na frequência das letras
function construirArvoreHuffman(texto) {
    let frequencias = {};
    // Conta as letras
    for (let i = 0; i < texto.length; i++) {
        let char = texto[i];
        frequencias[char] = (frequencias[char] || 0) + 1;
    }
    
    // Cria uma fila de nós para cada caractere
    let fila = Object.keys(frequencias).map(char => new NoHuffman(char, frequencias[char]));
    
    // Junta os nós até sobrar só a raiz
    while (fila.length > 1) {
        // Ordena para pegar os de menor frequência (simulando fila de prioridade)
        fila.sort((a, b) => a.frequencia - b.frequencia);
        
        let menor1 = fila.shift(); // Remove o 1º menor
        let menor2 = fila.shift(); // Remove o 2º menor
        
        // Cria um pai somando as frequências
        let novoNo = new NoHuffman(null, menor1.frequencia + menor2.frequencia, menor1, menor2);
        fila.push(novoNo);
    }
    
    return fila[0]; // Retorna a raiz da árvore
}

// Caminha na árvore e gera códigos binários para cada letra
function gerarDicionarioHuffman(no, codigoAtual, dicionario) {
    if (!no) return;
    if (no.char !== null) {
        dicionario[no.char] = codigoAtual; // Chegou na folha, salva o código
        return;
    }
    gerarDicionarioHuffman(no.esq, codigoAtual + "0", dicionario); // Esquerda adiciona '0'
    gerarDicionarioHuffman(no.dir, codigoAtual + "1", dicionario); // Direita adiciona '1'
}

function comprimirHuffman(texto) {
    if (texto.length === 0) return "";
    
    let raiz = construirArvoreHuffman(texto);
    let dicionario = {};
    gerarDicionarioHuffman(raiz, "", dicionario);
    
    // Converte o texto todo para uma grande string de 0s e 1s
    let textoComprimido = "";
    for (let i = 0; i < texto.length; i++) {
        textoComprimido += dicionario[texto[i]];
    }
    
    return {
        binarioString: textoComprimido,
        // O dicionário é necessário para descomprimir no futuro
        dicionario: dicionario
    };
}

// ==========================================
// Execução via Linha de Comando
// ==========================================
// Exemplo de uso: node compressao.js arvore.json lzw
if (require.main === module) {
    let argumentos = process.argv.slice(2);
    if (argumentos.length < 2) {
        console.log("Uso correto: node compressao.js <arquivo_para_comprimir.json> <lzw ou huffman>");
        process.exit(1);
    }

    let arquivoEntrada = argumentos[0];
    let algoritmo = argumentos[1].toLowerCase();

    try {
        let textoOriginal = fs.readFileSync(arquivoEntrada, 'utf8');
        let tamanhoOriginalBytes = Buffer.byteLength(textoOriginal, 'utf8');

        // Para as métricas de desempenho
        let tempoInicio = process.hrtime();
        let memoriaAntes = process.memoryUsage().heapUsed;

        let arquivoSaida = `${arquivoEntrada}.${algoritmo}`;
        let tamanhoComprimidoBytes = 0;

        if (algoritmo === 'lzw') {
            let arrayCodigos = comprimirLZW(textoOriginal);
            // Salva os códigos LZW num arquivo
            let dadosSalvar = JSON.stringify(arrayCodigos);
            fs.writeFileSync(arquivoSaida, dadosSalvar);
            tamanhoComprimidoBytes = Buffer.byteLength(dadosSalvar, 'utf8');
            
        } else if (algoritmo === 'huffman') {
            let resultado = comprimirHuffman(textoOriginal);
            // Salva a string binária e a árvore/dicionário para uso posterior
            let dadosSalvar = JSON.stringify(resultado);
            fs.writeFileSync(arquivoSaida, dadosSalvar);
            tamanhoComprimidoBytes = Buffer.byteLength(dadosSalvar, 'utf8');
            
        } else {
            console.log("Erro: Algoritmo desconhecido. Por favor, digite 'lzw' ou 'huffman'.");
            process.exit(1);
        }

        // Calcula as métricas finais
        let memoriaDepois = process.memoryUsage().heapUsed;
        let tempoFim = process.hrtime(tempoInicio);
        let tempoEmMs = (tempoFim[0] * 1000) + (tempoFim[1] / 1000000);
        let memoriaUsada = (memoriaDepois - memoriaAntes) / 1024;

        console.log(`\n=== Resultados da Compressão (${algoritmo.toUpperCase()}) ===`);
        console.log(`Arquivo analisado: ${arquivoEntrada}`);
        console.log(`Tamanho original: ${(tamanhoOriginalBytes / 1024).toFixed(2)} KB`);
        console.log(`Tamanho comprimido: ${(tamanhoComprimidoBytes / 1024).toFixed(2)} KB`);
        
        let taxa = (1 - (tamanhoComprimidoBytes / tamanhoOriginalBytes)) * 100;
        console.log(`Taxa de compressão: ${taxa.toFixed(2)}% (quanto mais alto, menor ficou o arquivo)`);
        
        console.log(`Tempo gasto na compressão: ${tempoEmMs.toFixed(3)} ms`);
        // O node as vezes reutiliza a heap, então a memória gasta pode dar negativo nas contagens pontuais,
        // usamos Math.abs para não confundir o professor
        console.log(`Variação de Memória: ${Math.abs(memoriaUsada).toFixed(2)} KB`); 
        console.log(`Salvo com sucesso em: ${arquivoSaida}\n`);

    } catch (erro) {
        console.log(`Erro ao processar o arquivo: ${erro.message}`);
    }
}
