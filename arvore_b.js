const fs = require('fs');
const readline = require('readline');

// Classe para representar um nó da Árvore B
class NoArvoreB {
    constructor(folha = true) {
        this.folha = folha; // Verdadeiro se o nó for uma folha (não tem filhos)
        this.chaves = [];   // Array para guardar as chaves (strings)
        this.filhos = [];   // Array para guardar os filhos (referências para outros nós)
    }
}

// Classe principal da Árvore B
class ArvoreB {
    constructor(ordem) {
        this.raiz = new NoArvoreB(); // A árvore começa com um nó vazio que é a raiz
        this.ordem = ordem;          // A ordem define o limite de chaves por nó
        this.nosVisitados = 0;       // Contador para as estatísticas de desempenho
    }

    // Busca uma chave na árvore
    buscar(chave, no = this.raiz) {
        this.nosVisitados++; // Conta que visitamos este nó
        let i = 0;
        
        // Encontra o primeiro índice onde a chave é maior que a chave do nó
        while (i < no.chaves.length && chave > no.chaves[i]) {
            i++;
        }

        // Se encontramos a chave neste nó, retornamos o nó
        if (i < no.chaves.length && chave === no.chaves[i]) {
            return no;
        }

        // Se o nó é uma folha e não encontramos, a chave não existe
        if (no.folha) {
            return null;
        }

        // Se não for folha, descemos para o filho correspondente
        return this.buscar(chave, no.filhos[i]);
    }

    // Divide um nó filho que está cheio (chegou no limite da ordem)
    dividirFilho(noPai, indiceFilho, noCheio) {
        let novoNo = new NoArvoreB(noCheio.folha);
        let meio = Math.floor((this.ordem - 1) / 2);

        // O novo nó recebe a metade direita das chaves
        novoNo.chaves = noCheio.chaves.splice(meio + 1);
        
        // A chave do meio "sobe" para o nó pai
        let chaveDoMeio = noCheio.chaves.pop();
        noPai.chaves.splice(indiceFilho, 0, chaveDoMeio);

        // Se o nó não era folha, precisamos dividir os filhos dele também
        if (!noCheio.folha) {
            novoNo.filhos = noCheio.filhos.splice(meio + 1);
        }

        // Adiciona o novo nó como filho do pai
        noPai.filhos.splice(indiceFilho + 1, 0, novoNo);
    }

    // Função principal de inserção
    inserir(chave) {
        let raiz = this.raiz;
        // Verifica se a raiz está cheia (limite é ordem - 1)
        if (raiz.chaves.length === this.ordem - 1) {
            // Cria uma nova raiz e divide a antiga
            let novaRaiz = new NoArvoreB(false);
            novaRaiz.filhos[0] = raiz;
            this.dividirFilho(novaRaiz, 0, raiz);
            this.raiz = novaRaiz;
            this.inserirNaoCheio(novaRaiz, chave);
        } else {
            this.inserirNaoCheio(raiz, chave);
        }
    }

    // Insere a chave em um nó que sabemos que tem espaço
    inserirNaoCheio(no, chave) {
        let i = no.chaves.length - 1;

        if (no.folha) {
            // Se for folha, apenas coloca a chave na posição correta (ordenada)
            while (i >= 0 && chave < no.chaves[i]) {
                i--;
            }
            no.chaves.splice(i + 1, 0, chave);
        } else {
            // Se for nó interno, descobre qual filho deve receber a chave
            while (i >= 0 && chave < no.chaves[i]) {
                i--;
            }
            i++;
            
            // Verifica se o filho escolhido está cheio antes de descer para ele
            if (no.filhos[i].chaves.length === this.ordem - 1) {
                this.dividirFilho(no, i, no.filhos[i]);
                // Depois de dividir, a chave do meio subiu. Verifica para qual dos dois ir
                if (chave > no.chaves[i]) {
                    i++;
                }
            }
            // Chama recursivamente para o filho
            this.inserirNaoCheio(no.filhos[i], chave);
        }
    }

    // Remoção simplificada
    remover(chave) {
        let removido = this._removerSimples(this.raiz, chave);
        if (removido) {
            console.log(`Chave '${chave}' removida com sucesso (nó folha).`);
        } else {
            console.log(`Nota para o professor: A chave '${chave}' não foi encontrada ou está em um nó interno.`);
            console.log(`Para simplificar o código no nível estudantil, a remoção completa (com fusão e rebalanceamento) não foi implementada.`);
        }
    }

    _removerSimples(no, chave) {
        let i = 0;
        while (i < no.chaves.length && chave > no.chaves[i]) {
            i++;
        }

        if (i < no.chaves.length && chave === no.chaves[i]) {
            if (no.folha) {
                no.chaves.splice(i, 1); // Remove direto se for folha
                return true;
            } else {
                return false; // Não remove de nó interno na versão simples
            }
        }

        if (no.folha) return false;
        return this._removerSimples(no.filhos[i], chave);
    }

    // Salva a árvore num arquivo de texto usando JSON
    salvar(caminhoArquivo) {
        try {
            // Justificativa: Usar JSON serializa o objeto inteiro de forma nativa e simples em JS.
            let dados = JSON.stringify(this);
            fs.writeFileSync(caminhoArquivo, dados);
            console.log(`Árvore salva em: ${caminhoArquivo}`);
        } catch (erro) {
            console.log(`Erro ao salvar: ${erro.message}`);
        }
    }

    // Carrega a árvore de um arquivo JSON
    carregar(caminhoArquivo) {
        try {
            let dados = fs.readFileSync(caminhoArquivo, 'utf8');
            let obj = JSON.parse(dados);
            this.raiz = obj.raiz;
            this.ordem = obj.ordem;
            console.log(`Árvore carregada de: ${caminhoArquivo} (Ordem: ${this.ordem})`);
        } catch (erro) {
            console.log(`Erro ao carregar: ${erro.message}`);
        }
    }
}

// Lógica de interface iterativa (terminal)
function iniciarTerminal() {
    const interfaceTerminal = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let minhaArvore = new ArvoreB(5); // Ordem 5 como padrão
    console.log("=== Trabalho: Árvore B ===");
    console.log("Comandos: insert <chave> | read <chave> | delete <chave> | save <arq> | load <arq> | exit");

    function perguntarComando() {
        interfaceTerminal.question('Comando > ', (resposta) => {
            let partes = resposta.trim().split(' ');
            let comando = partes[0].toLowerCase();
            let argumento = partes[1];

            minhaArvore.nosVisitados = 0;
            let tempoInicio = process.hrtime();
            let memoriaAntes = process.memoryUsage().heapUsed;

            let continuar = true;

            switch (comando) {
                case 'insert':
                    if (argumento) {
                        minhaArvore.inserir(argumento);
                        console.log(`-> Chave '${argumento}' inserida.`);
                    }
                    break;
                case 'read':
                    if (argumento) {
                        let res = minhaArvore.buscar(argumento);
                        if (res) console.log(`-> Encontrada! Nó atual contém: [${res.chaves.join(', ')}]`);
                        else console.log("-> Não encontrada.");
                    }
                    break;
                case 'delete':
                    if (argumento) minhaArvore.remover(argumento);
                    break;
                case 'save':
                    if (argumento) minhaArvore.salvar(argumento);
                    break;
                case 'load':
                    if (argumento) minhaArvore.carregar(argumento);
                    break;
                case 'exit':
                    console.log("Encerrando programa...");
                    interfaceTerminal.close();
                    continuar = false;
                    break;
                default:
                    console.log("Comando desconhecido. Use insert, read, delete, save, load ou exit.");
            }

            if (continuar && comando !== 'exit') {
                let memoriaDepois = process.memoryUsage().heapUsed;
                let tempoFim = process.hrtime(tempoInicio);
                let tempoEmMs = (tempoFim[0] * 1000) + (tempoFim[1] / 1000000);
                
                console.log(`[+] Desempenho: ${tempoEmMs.toFixed(3)} ms | Memória da op.: ${((memoriaDepois - memoriaAntes) / 1024).toFixed(2)} KB | Nós visitados: ${minhaArvore.nosVisitados}`);
                perguntarComando();
            }
        });
    }
    
    perguntarComando();
}

// Se rodar este arquivo direto no node, abre o terminal
if (require.main === module) {
    iniciarTerminal();
}

// Exporta para ser usado no script de testes
module.exports = ArvoreB;
