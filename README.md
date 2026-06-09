# Trabalho 2 - Estruturas de Dados Avançadas
## Árvore B e Algoritmos de Compressão

### Integrantes do Grupo
* [NOME COMPLETO AQUI]
* [NOME COMPLETO AQUI]

---

### Arquivos do Projeto

O trabalho está dividido de forma simples para facilitar o entendimento (nível de estudante):

* **`arvore_b.js`**: Implementa a lógica da Árvore B (inserir, buscar, remover, salvar, carregar). Contém também uma interface iterativa (terminal) para o usuário digitar comandos manuais.
* **`compressao.js`**: Implementa os dois algoritmos de compressão exigidos (LZW e Huffman). Pode ser executado via terminal passando o arquivo e o algoritmo desejado.
* **`testes.js`**: Script de automação. Ao ser rodado, cria três árvores com tamanhos e ordens diferentes (pequena/ordem 3, média/ordem 50, grande/ordem 100), mede tempo, memória e nós visitados, além de gerar os arquivos JSON prontos para a etapa de compressão.

---

### Justificativa de Salvamento em Arquivo

Para representar a árvore em arquivo, escolhemos utilizar o formato **JSON** aliado aos métodos nativos do JavaScript (`JSON.stringify` e `JSON.parse`).
**Motivo:** Em JavaScript, esse método é o mais confiável para serializar a hierarquia inteira dos objetos (raízes, nós e filhos) para texto com poucas linhas de código. Como o texto JSON gerado possui caracteres de estruturação (colchetes, aspas, vírgulas), o arquivo fica maior, o que torna o processo de compressão (LZW/Huffman) visivelmente muito mais efetivo, atingindo perfeitamente os objetivos da segunda etapa do trabalho.

---

### Instruções para Execução

#### 1. Árvore B (Modo Manual/Iterativo)
Para testar inserções e buscas manualmente, abra o terminal na pasta do projeto e rode:
```bash
node arvore_b.js
```
Em seguida, digite os comandos do PDF:
* `insert <chave>`
* `read <chave>`
* `delete <chave>`
* `save arvore_teste.json`
* `load arvore_teste.json`
* `exit`

#### 2. Executar Testes de Desempenho (Automatizado)
Para testar árvores grandes (centenas a milhares de chaves) e medir tempo e memória automaticamente:
```bash
node testes.js
```
**Nota sobre a limitação de "Bilhões" do PDF:**
O script testa a árvore B até 100.000 chaves. Em JavaScript (Node.js), existe um limite máximo para a Heap Memory (~1.5GB a 2GB). Inserir "bilhões" de objetos numa lista em RAM causaria travamento (_Out of Memory_). Bancos de Dados lidam com bilhões de dados porque não guardam a árvore B toda na memória, e sim fazendo paginação em Disco Rígido. Para fim acadêmico deste código, os 100.000 elementos são perfeitos para demonstrar o tempo de busca da Árvore B quase imediato na máquina sem travar.

#### 3. Executar a Compressão
Após usar o modo manual ou o `testes.js`, arquivos `.json` serão criados na sua pasta. Use o programa de compressão assim:
```bash
# Para LZW
node compressao.js arvore_teste_50_ordem_3.json lzw

# Para Huffman
node compressao.js arvore_teste_50_ordem_3.json huffman
```
Você verá as métricas de tempo, memória e a **taxa de compressão** no próprio terminal.
