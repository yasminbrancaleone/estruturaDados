# Trabalho 2 - Estruturas de Dados Avançadas
## Árvore B e Algoritmos de Compressão

### Integrantes do Grupo
* Gabriel de Paula Gaspar Pinto
* Yasmin Cabrini Brancaleone 

---

### Arquivos do Projeto e Funcionalidades

O trabalho implementa uma lógica robusta e padronizada atendendo a todos os requisitos solicitados:

* **`arvoreB.js`**: Implementa a lógica da **Árvore B COMPLETA** (busca, inserção, salvamento em JSON e carregamento). Ao contrário de simplificações amadoras, este arquivo **implementa o difícil algoritmo completo de remoção/deleção** (com rebalanceamento, empréstimos de chaves de irmãos vizinhos e fusão/merge de nós internos caso não se atinja a quantidade mínima de ocupação das regras da Árvore). Contém também um menu iterativo super intuitivo.
* **`compressao.js`**: Implementa do zero os dois algoritmos de compressão (LZW e Huffman). Ele mede precisamente o tempo de compressão e a memória heap usada utilizando `performance.now()` e exibe as estatísticas e a **taxa de compressão final** calculada sobre o arquivo da árvore JSON processada.
* **`testes.js`**: Automação para o tópico 2.3. Executa testes intensivos montando árvores pequenas (50 chaves, ordem 3), médias (5.000 chaves) e grandes (100.000 chaves), aferindo o desempenho da árvore para que você tenha números baseados na sua máquina para o relatório PDF final.
* **`package.json`**: Arquivo adicionado para facilitar e padronizar os testes no Node.js usando o comando `npm`.

---

### Justificativa de Salvamento em Arquivo (Serialização)

Para serializar a árvore em disco, a técnica de representação escolhida foi o **JSON (JavaScript Object Notation)**, nativo no Node.js. 
A justificativa para a escolha é técnica: Por se tratar de um objeto aninhado em várias instâncias de classes e ponteiros (nós com n filhos complexos), o método nativo converte em milissegundos essa gigantesca malha estrutural em texto plano mantendo a fidelidade das referências de `Array`. O arquivo JSON naturalmente gera "peso morto" devido ao seu formato verbalizado (`[]`, `{}`, `,`, `""`). É justamente este peso morto que permite que a segunda etapa do trabalho (os **algoritmos LZW e Huffman**) atue de forma maravilhosa e perfeitamente validável nas demonstrações matemáticas (removendo as repetições e reduzindo as árvores salvas).

---

### Instruções Práticas de Execução

Se você possui Node.js instalado, abra o terminal nesta pasta e utilize os atalhos criados:

#### 1. Menu Interativo da Árvore B
Para abrir o programa interativo para testes manuais limpos:
```bash
npm start
```
No menu, você poderá testar `insert`, `read` e o cobiçado `delete` livremente.

#### 2. Rotina de Testes Automatizados (Performance de Bilhões/Milhares)
Para executar a rotina acadêmica pedida no PDF e gerar as Árvores em massa:
```bash
npm run test
```
*Sobre a regra de "bilhões de chaves":*
A linguagem JavaScript é interpretada sob a Engine V8. Ela possui um limite físico/trava em sua memória "Heap". A instigação acadêmica do professor do uso do bilhão prova uma coisa: **Árvores em banco de dados ou sistemas de arquivos do SO NUNCA devem ser instanciadas totalmente em memória RAM**, elas utilizam processos em disco chamados "Paginação". Caso contrário, daria _Out of Memory_. Portanto, este script estressa com sucesso até 100.000 chaves/registros instantâneos provando o conceito logarítmico exigido.

#### 3. Teste das Compressões (LZW vs Huffman)
Os testes automatizados deixarão arquivos JSON nesta pasta. Para avaliá-los sob os algoritmos, basta rodar:
```bash
npm run compress -- arvore_teste_5000_ordem_50.json lzw

npm run compress -- arvore_teste_5000_ordem_50.json huffman
```
*(Você substitui o nome do `.json` conforme desejar).*
