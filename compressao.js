const fs = require('fs');

// ==============================================================
// ALGORITMOS DE COMPRESSÃO
// ==============================================================

// --------------------------------------------------------------
// 1. LZW (Lempel-Ziv-Welch)
// --------------------------------------------------------------
function comprimirLZW(texto) {
    let dicionario = {};
    // Inicializa o dicionário com os 256 caracteres da tabela ASCII
    for (let i = 0; i < 256; i++) {
        dicionario[String.fromCharCode(i)] = i;
    }
    
    let atual = "";
    let resultado = [];
    let proximoCodigo = 256;
    
    for (let i = 0; i < texto.length; i++) {
        let char = texto[i];
        let combinacao = atual + char;
        
        if (dicionario.hasOwnProperty(combinacao)) {
            // Se a combinação já existe no dicionário, apenas guarda na string 'atual'
            atual = combinacao;
        } else {
            // Se não existe, envia o código da string 'atual' para o resultado
            resultado.push(dicionario[atual]);
            // Adiciona a nova combinação ao dicionário
            dicionario[combinacao] = proximoCodigo++;
            // A string 'atual' recomeça a partir deste caractere
            atual = char;
        }
    }
    
    // Adiciona o último caractere/sequência restante
    if (atual !== "") {
        resultado.push(dicionario[atual]);
    }
    
    return resultado; // Retorna um array de números inteiros (códigos)
}

// --------------------------------------------------------------
// 2. Huffman
// --------------------------------------------------------------
class NoHuffman {
    constructor(char, frequencia, esq = null, dir = null) {
        this.char = char;             // Letra (null se for nó interno resultante de soma)
        this.frequencia = frequencia; // Vezes que apareceu
        this.esq = esq;               // Filho esquerdo (receberá bit 0)
        this.dir = dir;               // Filho direito (receberá bit 1)
    }
}

function construirArvoreHuffman(texto) {
    let frequencias = {};
    // 1. Conta a frequência de cada caractere no texto
    for (let i = 0; i < texto.length; i++) {
        let char = texto[i];
        frequencias[char] = (frequencias[char] || 0) + 1;
    }
    
    // 2. Transforma as frequências em Nós da Árvore de Huffman e põe numa fila
    let fila = Object.keys(frequencias).map(char => new NoHuffman(char, frequencias[char]));
    
    // 3. Monta a árvore juntando sempre as duas menores frequências
    while (fila.length > 1) {
        // Ordena para simular uma fila de prioridade
        fila.sort((a, b) => a.frequencia - b.frequencia);
        
        let menor1 = fila.shift(); // Tira o 1º menor
        let menor2 = fila.shift(); // Tira o 2º menor
        
        // Cria um nó pai unindo os dois
        let novoNo = new NoHuffman(null, menor1.frequencia + menor2.frequencia, menor1, menor2);
        fila.push(novoNo);
    }
    
    return fila[0]; // A raiz da árvore construída
}

function gerarCodigosBinarios(no, codigoAtual, dicionario) {
    if (!no) return;
    
    // Se for folha (tem caractere), salva no dicionário o código acumulado (ex: "1011")
    if (no.char !== null) {
        dicionario[no.char] = codigoAtual; 
        return;
    }
    
    // Continua percorrendo a árvore, esquerda = 0, direita = 1
    gerarCodigosBinarios(no.esq, codigoAtual + "0", dicionario);
    gerarCodigosBinarios(no.dir, codigoAtual + "1", dicionario);
}

function comprimirHuffman(texto) {
    if (texto.length === 0) return "";
    
    let raiz = construirArvoreHuffman(texto);
    let dicionarioDeBits = {};
    gerarCodigosBinarios(raiz, "", dicionarioDeBits);
    
    // Converte todo o texto original na nova grande string de bits
    let textoComprimidoBits = "";
    for (let i = 0; i < texto.length; i++) {
        textoComprimidoBits += dicionarioDeBits[texto[i]];
    }
    
    return {
        binarioString: textoComprimidoBits,
        dicionario: dicionarioDeBits // Necessário salvar junto para poder descomprimir
    };
}

// ==============================================================
// EXECUÇÃO DO PROGRAMA
// ==============================================================
if (require.main === module) {
    let argumentos = process.argv.slice(2);
    if (argumentos.length < 2) {
        console.log("Uso correto do comando: npm run compress -- <arquivo.json> <lzw|huffman>");
        console.log("Exemplo manual: node compressao.js arvore_teste_50_ordem_3.json lzw");
        process.exit(1);
    }

    let arquivoEntrada = argumentos[0];
    let algoritmo = argumentos[1].toLowerCase();

    try {
        if (!fs.existsSync(arquivoEntrada)) {
            console.log(`[Erro] O arquivo '${arquivoEntrada}' não foi encontrado.`);
            process.exit(1);
        }

        let textoOriginal = fs.readFileSync(arquivoEntrada, 'utf8');
        let tamanhoOriginalBytes = Buffer.byteLength(textoOriginal, 'utf8');

        // Medidores de performance nativos do Node (performance.now() exigido na atualização)
        let memoriaAntes = process.memoryUsage().heapUsed;
        let tempoInicio = performance.now(); 

        let arquivoSaida = `${arquivoEntrada}.${algoritmo}`;
        let tamanhoComprimidoBytes = 0;

        if (algoritmo === 'lzw') {
            console.log("Processando pelo algoritmo LZW...");
            let arrayCodigos = comprimirLZW(textoOriginal);
            let dadosSalvar = JSON.stringify(arrayCodigos);
            fs.writeFileSync(arquivoSaida, dadosSalvar);
            tamanhoComprimidoBytes = Buffer.byteLength(dadosSalvar, 'utf8');
            
        } else if (algoritmo === 'huffman') {
            console.log("Processando pelo algoritmo Huffman...");
            let resultado = comprimirHuffman(textoOriginal);
            let dadosSalvar = JSON.stringify(resultado);
            fs.writeFileSync(arquivoSaida, dadosSalvar);
            tamanhoComprimidoBytes = Buffer.byteLength(dadosSalvar, 'utf8');
            
        } else {
            console.log("[Erro] Algoritmo desconhecido. Por favor, escolha 'lzw' ou 'huffman'.");
            process.exit(1);
        }

        // Fim da medição de desempenho
        let tempoFim = performance.now();
        let memoriaDepois = process.memoryUsage().heapUsed;
        
        let tempoEmMs = (tempoFim - tempoInicio).toFixed(4);
        let memoriaUsada = Math.abs((memoriaDepois - memoriaAntes) / 1024).toFixed(2);
        let taxaDeCompressao = (1 - (tamanhoComprimidoBytes / tamanhoOriginalBytes)) * 100;

        // Relatório final na tela
        console.log(`\n======================================================`);
        console.log(`          RESULTADOS DA COMPRESSÃO (${algoritmo.toUpperCase()})        `);
        console.log(`======================================================`);
        console.log(`Arquivo Processado   : ${arquivoEntrada}`);
        console.log(`Tamanho Original     : ${(tamanhoOriginalBytes / 1024).toFixed(2)} KB`);
        console.log(`Tamanho Comprimido   : ${(tamanhoComprimidoBytes / 1024).toFixed(2)} KB`);
        console.log(`Taxa de Compressão   : ${taxaDeCompressao.toFixed(2)}% (Quanto maior, melhor a eficiência)`);
        console.log(`\n📊 DESEMPENHO DO ALGORITMO:`);
        console.log(`Tempo de Execução    : ${tempoEmMs} ms`);
        console.log(`Memória Heap Utilizada: ${memoriaUsada} KB`);
        console.log(`\n[✓] O arquivo final foi salvo como: ${arquivoSaida}`);
        console.log(`======================================================\n`);

    } catch (erro) {
        console.log(`\n[X] Ocorreu um erro durante a compressão: ${erro.message}`);
    }
}
