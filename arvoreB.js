const fs = require('fs');
const readline = require('readline');

// ==============================================================
// CLASSES DA ÁRVORE B
// ==============================================================

// Classe para representar um nó da Árvore B
class NoArvoreB {
    constructor(folha = true) {
        this.folha = folha; // Booleano: é folha ou não?
        this.chaves = [];   // Chaves armazenadas no nó (Strings)
        this.filhos = [];   // Ponteiros para os nós filhos
    }
}

// Classe principal da Árvore B
class ArvoreB {
    constructor(ordem) {
        this.raiz = new NoArvoreB(); 
        this.ordem = ordem; // A ordem 'm' (máximo de filhos)
        this.nosVisitados = 0; // Estatística
    }

    // Retorna o mínimo de chaves exigido em um nó para operações de rebalanceamento
    get minChaves() {
        // A lógica do número mínimo varia, mas o padrão para ordem 'm' é t-1 
        // onde t (grau mínimo) = Math.ceil(m/2).
        return Math.floor((this.ordem - 1) / 2);
    }

    // ==========================================
    // BUSCA
    // ==========================================
    buscar(chave, no = this.raiz) {
        this.nosVisitados++;
        let i = 0;
        
        // Encontra o primeiro índice em que a chave é maior
        while (i < no.chaves.length && chave > no.chaves[i]) {
            i++;
        }

        // Verifica se a chave foi encontrada neste nó
        if (i < no.chaves.length && chave === no.chaves[i]) {
            return no;
        }

        // Se chegou na folha e não achou, a chave não existe
        if (no.folha) return null;

        // Desce recursivamente para o filho apropriado
        return this.buscar(chave, no.filhos[i]);
    }

    // ==========================================
    // INSERÇÃO
    // ==========================================
    inserir(chave) {
        let raiz = this.raiz;
        // Se a raiz está cheia, precisa dividir antes de inserir
        if (raiz.chaves.length === this.ordem - 1) {
            let novaRaiz = new NoArvoreB(false);
            novaRaiz.filhos[0] = raiz;
            this.dividirFilho(novaRaiz, 0, raiz);
            this.raiz = novaRaiz;
            this.inserirNaoCheio(novaRaiz, chave);
        } else {
            this.inserirNaoCheio(raiz, chave);
        }
    }

    inserirNaoCheio(no, chave) {
        let i = no.chaves.length - 1;

        if (no.folha) {
            // Empurra as chaves maiores para a direita e insere a nova chave
            while (i >= 0 && chave < no.chaves[i]) {
                i--;
            }
            no.chaves.splice(i + 1, 0, chave);
        } else {
            // Descobre em qual filho descer
            while (i >= 0 && chave < no.chaves[i]) {
                i--;
            }
            i++;
            
            // Verifica se o filho destino está cheio
            if (no.filhos[i].chaves.length === this.ordem - 1) {
                this.dividirFilho(no, i, no.filhos[i]);
                // Ajusta o índice após a divisão
                if (chave > no.chaves[i]) {
                    i++;
                }
            }
            this.inserirNaoCheio(no.filhos[i], chave);
        }
    }

    dividirFilho(noPai, indiceFilho, noCheio) {
        let novoNo = new NoArvoreB(noCheio.folha);
        let meio = Math.floor((this.ordem - 1) / 2);

        // Extrai a metade direita das chaves do nó cheio
        novoNo.chaves = noCheio.chaves.splice(meio + 1);
        
        // A chave do meio sobe para o pai
        let chaveDoMeio = noCheio.chaves.pop();
        noPai.chaves.splice(indiceFilho, 0, chaveDoMeio);

        // Transfere a metade direita dos filhos, se não for folha
        if (!noCheio.folha) {
            novoNo.filhos = noCheio.filhos.splice(meio + 1);
        }

        // Insere o novo nó como filho do pai
        noPai.filhos.splice(indiceFilho + 1, 0, novoNo);
    }

    // ==========================================
    // REMOÇÃO COMPLETA (DELEÇÃO, FUSÃO E REBALANCEAMENTO)
    // ==========================================
    remover(chave) {
        if (!this.raiz) return;

        // Chamada inicial para remoção recursiva
        this._removerChave(this.raiz, chave);

        // Se, após a remoção, a raiz ficar sem chaves, reajusta a árvore
        if (this.raiz.chaves.length === 0) {
            if (this.raiz.folha) {
                this.raiz = new NoArvoreB(); // A árvore ficou vazia
            } else {
                this.raiz = this.raiz.filhos[0]; // O único filho vira a raiz
            }
        }
    }

    // Método auxiliar de encontrar índice
    _encontrarIndiceChave(no, chave) {
        let idx = 0;
        while (idx < no.chaves.length && chave > no.chaves[idx]) {
            idx++;
        }
        return idx;
    }

    _removerChave(no, chave) {
        this.nosVisitados++;
        let idx = this._encontrarIndiceChave(no, chave);

        // Caso a chave exista neste nó
        if (idx < no.chaves.length && no.chaves[idx] === chave) {
            if (no.folha) {
                // Caso 1: Chave está numa folha -> simplesmente deleta da matriz
                no.chaves.splice(idx, 1);
            } else {
                // Caso 2: Chave está em um nó interno
                this._removerDeNoInterno(no, idx);
            }
        } 
        // Caso a chave não esteja neste nó
        else {
            if (no.folha) {
                console.log(`[!] A chave '${chave}' não foi encontrada na árvore.`);
                return;
            }

            // Precisamos descer para o filho onde a chave deve estar
            let desceuProUltimoFilho = (idx === no.chaves.length);
            
            // Caso 3: O filho para onde vamos descer tem o mínimo possível de chaves?
            // Precisamos garantir que ele tenha chaves suficientes para uma possível deleção sem violar a regra.
            if (no.filhos[idx].chaves.length <= this.minChaves) {
                this._preencher(no, idx);
            }

            // O preenchimento pode ter alterado o layout do nó
            if (desceuProUltimoFilho && idx > no.chaves.length) {
                this._removerChave(no.filhos[idx - 1], chave);
            } else {
                this._removerChave(no.filhos[idx], chave);
            }
        }
    }

    _removerDeNoInterno(no, idx) {
        let chave = no.chaves[idx];

        // Caso 2a: O filho anterior tem chaves sobrando (pode emprestar o predecessor)
        if (no.filhos[idx].chaves.length > this.minChaves) {
            let predecessor = this._getPredecessor(no, idx);
            no.chaves[idx] = predecessor;
            this._removerChave(no.filhos[idx], predecessor);
        }
        // Caso 2b: O filho seguinte tem chaves sobrando (pode emprestar o sucessor)
        else if (no.filhos[idx + 1].chaves.length > this.minChaves) {
            let sucessor = this._getSucessor(no, idx);
            no.chaves[idx] = sucessor;
            this._removerChave(no.filhos[idx + 1], sucessor);
        }
        // Caso 2c: Ambos filhos possuem o mínimo estrito. Devemos fundi-los.
        else {
            this._fundirNos(no, idx);
            // Após a fusão, a chave 'desceu' para o filho resultante, deletamos ela lá
            this._removerChave(no.filhos[idx], chave);
        }
    }

    _getPredecessor(no, idx) {
        // Desce tudo para a direita
        let atual = no.filhos[idx];
        while (!atual.folha) {
            atual = atual.filhos[atual.chaves.length];
        }
        return atual.chaves[atual.chaves.length - 1];
    }

    _getSucessor(no, idx) {
        // Desce tudo para a esquerda
        let atual = no.filhos[idx + 1];
        while (!atual.folha) {
            atual = atual.filhos[0];
        }
        return atual.chaves[0];
    }

    // Garante que o filho no índice 'idx' terá pelo menos chaves suficientes para a descida segura
    _preencher(no, idx) {
        // Tenta pegar do irmão anterior
        if (idx > 0 && no.filhos[idx - 1].chaves.length > this.minChaves) {
            this._pegarDoIrmaoAnterior(no, idx);
        }
        // Tenta pegar do próximo irmão
        else if (idx < no.chaves.length && no.filhos[idx + 1].chaves.length > this.minChaves) {
            this._pegarDoIrmaoProximo(no, idx);
        }
        // Se nenhum puder emprestar, fusão (merge) é necessária
        else {
            if (idx !== no.chaves.length) {
                this._fundirNos(no, idx);
            } else {
                this._fundirNos(no, idx - 1);
            }
        }
    }

    _pegarDoIrmaoAnterior(no, idx) {
        let filho = no.filhos[idx];
        let irmao = no.filhos[idx - 1];

        // A chave do pai desce para a frente do filho
        filho.chaves.unshift(no.chaves[idx - 1]);

        // A última chave do irmão sobe para o pai
        no.chaves[idx - 1] = irmao.chaves.pop();

        // Se não for folha, o último filho do irmão vai para a frente do filho
        if (!filho.folha) {
            filho.filhos.unshift(irmao.filhos.pop());
        }
    }

    _pegarDoIrmaoProximo(no, idx) {
        let filho = no.filhos[idx];
        let irmao = no.filhos[idx + 1];

        // A chave do pai desce para o final do filho
        filho.chaves.push(no.chaves[idx]);

        // A primeira chave do irmão sobe para o pai
        no.chaves[idx] = irmao.chaves.shift();

        // Se não for folha, o primeiro filho do irmão vai para o final do filho
        if (!filho.folha) {
            filho.filhos.push(irmao.filhos.shift());
        }
    }

    _fundirNos(no, idx) {
        let filho = no.filhos[idx];
        let irmao = no.filhos[idx + 1];

        // A chave do pai desce e se une aos nós
        filho.chaves.push(no.chaves[idx]);

        // Movemos tudo do irmão para o filho
        filho.chaves = filho.chaves.concat(irmao.chaves);

        if (!filho.folha) {
            filho.filhos = filho.filhos.concat(irmao.filhos);
        }

        // Removemos a chave e o ponteiro do irmão do pai
        no.chaves.splice(idx, 1);
        no.filhos.splice(idx + 1, 1);
    }

    // ==========================================
    // PERSISTÊNCIA EM ARQUIVO (JSON)
    // ==========================================
    salvar(caminhoArquivo) {
        try {
            let dados = JSON.stringify(this);
            fs.writeFileSync(caminhoArquivo, dados);
            console.log(`\n[✓] Árvore salva com sucesso no arquivo: ${caminhoArquivo}`);
        } catch (erro) {
            console.log(`\n[X] Erro ao salvar a árvore: ${erro.message}`);
        }
    }

    carregar(caminhoArquivo) {
        try {
            if (!fs.existsSync(caminhoArquivo)) {
                console.log(`\n[X] Arquivo '${caminhoArquivo}' não encontrado.`);
                return;
            }
            let dados = fs.readFileSync(caminhoArquivo, 'utf8');
            let obj = JSON.parse(dados);
            this.raiz = obj.raiz;
            this.ordem = obj.ordem;
            console.log(`\n[✓] Árvore carregada de '${caminhoArquivo}' (Ordem Restaurada: ${this.ordem})`);
        } catch (erro) {
            console.log(`\n[X] Erro ao carregar a árvore: ${erro.message}`);
        }
    }
}

// ==============================================================
// INTERFACE DO TERMINAL MELHORADA
// ==============================================================
function iniciarTerminal() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let minhaArvore = new ArvoreB(5); // Ordem padrão inicial

    const desenharMenu = () => {
        console.log('\n======================================================');
        console.log('                 ÁRVORE B - MENU                      ');
        console.log('======================================================');
        console.log(' Digite um dos comandos abaixo:');
        console.log('  > insert <chave>   - Inserir nova chave');
        console.log('  > read <chave>     - Buscar chave');
        console.log('  > delete <chave>   - Remover chave (Completo)');
        console.log('  > save <arquivo>   - Salvar árvore em .json');
        console.log('  > load <arquivo>   - Carregar árvore de .json');
        console.log('  > exit             - Sair do programa');
        console.log('======================================================');
    };

    desenharMenu();

    const loop = () => {
        rl.question('\nComando > ', (resposta) => {
            let partes = resposta.trim().split(' ');
            let comando = partes[0].toLowerCase();
            let argumento = partes[1];

            // Medidores de performance
            minhaArvore.nosVisitados = 0;
            let memoriaAntes = process.memoryUsage().heapUsed;
            let tempoInicio = performance.now(); // Usando performance.now() conforme pedido

            let sucesso = true;

            switch (comando) {
                case 'insert':
                    if (argumento) {
                        minhaArvore.inserir(argumento);
                        console.log(`\n[✓] Inserido: ${argumento}`);
                    } else console.log('\n[!] Especifique a chave: insert <chave>');
                    break;
                case 'read':
                    if (argumento) {
                        let res = minhaArvore.buscar(argumento);
                        if (res) console.log(`\n[✓] Encontrada! O nó desta chave contém: [${res.chaves.join(', ')}]`);
                        else console.log(`\n[X] A chave '${argumento}' não existe na árvore.`);
                    } else console.log('\n[!] Especifique a chave: read <chave>');
                    break;
                case 'delete':
                    if (argumento) {
                        minhaArvore.remover(argumento);
                        console.log(`\n[✓] Operação de remoção finalizada para a chave: ${argumento}`);
                    } else console.log('\n[!] Especifique a chave: delete <chave>');
                    break;
                case 'save':
                    if (argumento) minhaArvore.salvar(argumento);
                    else console.log('\n[!] Especifique o arquivo: save arvore.json');
                    break;
                case 'load':
                    if (argumento) minhaArvore.carregar(argumento);
                    else console.log('\n[!] Especifique o arquivo: load arvore.json');
                    break;
                case 'exit':
                case 'sair':
                    console.log('\nFinalizando programa. Até logo!');
                    rl.close();
                    return; // quebra o loop
                case 'menu':
                case 'help':
                    desenharMenu();
                    sucesso = false; // Não imprime performance de menu
                    break;
                default:
                    console.log(`\n[!] Comando inválido: '${comando}'. Digite 'menu' para ajuda.`);
                    sucesso = false;
            }

            if (sucesso) {
                let tempoFim = performance.now();
                let memoriaDepois = process.memoryUsage().heapUsed;
                
                let tempoGasto = (tempoFim - tempoInicio).toFixed(4);
                let memoriaGasta = ((memoriaDepois - memoriaAntes) / 1024).toFixed(2);
                
                console.log(`------------------------------------------------------`);
                console.log(`📊 RELATÓRIO DE DESEMPENHO DA OPERAÇÃO`);
                console.log(`   Tempo de execução : ${tempoGasto} ms`);
                console.log(`   Memória Heap Usada: ${memoriaGasta} KB`);
                console.log(`   Nós Visitados     : ${minhaArvore.nosVisitados}`);
                console.log(`------------------------------------------------------`);
            }

            loop();
        });
    };
    
    loop();
}

if (require.main === module) {
    iniciarTerminal();
}

module.exports = ArvoreB;
