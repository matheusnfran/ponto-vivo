
# Ponto Vivo - Global Solution CitizenTech 2026

O **Ponto Vivo** é uma solução digital de participação cidadã desenvolvida para a Global Solution 2026 da FIAP, no curso de Web Design.

O projeto é composto por um aplicativo mobile e um painel de gestão web integrados, permitindo registrar, consultar e acompanhar ocorrências relacionadas à infraestrutura de pontos de ônibus.

A proposta busca tornar os problemas urbanos mais visíveis, facilitar o registro de relatos pela população e oferecer um fluxo transparente de acompanhamento.

**Status do projeto:** MVP acadêmico funcional, com integração implementada e testada em ambiente de desenvolvimento e painel web publicado e validado na Vercel.

O Ponto Vivo não é um canal oficial de atendimento de prefeituras ou órgãos públicos.

## 1. Integrantes

- Matheus do Nascimento Francisco - RM:562553
- Curso: Web Design
- Instituição: FIAP
- Período: 2º semestre de 2026
- Projeto: Global Solution - CitizenTech

## 2. Problema e proposta

Problemas como iluminação insuficiente, estruturas danificadas, falta de acessibilidade e condições inadequadas de segurança podem comprometer a experiência de quem utiliza o transporte coletivo.

Nem sempre o cidadão dispõe de um meio simples para registrar essas condições e acompanhar o andamento do relato.

O Ponto Vivo propõe conectar duas experiências:

- **Aplicativo mobile:** permite ao cidadão consultar e registrar problemas relacionados a pontos de ônibus.
- **Painel web:** permite visualizar, organizar e acompanhar as ocorrências, além de atualizar seus status mediante autenticação administrativa.

As duas interfaces compartilham o mesmo banco de dados, garantindo consistência das informações.

O objetivo do MVP não é executar reparos urbanos, mas demonstrar um fluxo digital de registro e acompanhamento.

## 3. Funcionalidades implementadas

### Aplicativo mobile

- Consulta de ocorrências registradas pela comunidade.
- Registro de novas ocorrências.
- Seleção da categoria do problema.
- Preenchimento de título, localização aproximada e descrição.
- Visualização de informações detalhadas de cada ocorrência.
- Consulta do status atualizado.
- Atualização manual da lista.
- Consulta periódica ao banco de dados.
- Mensagens de confirmação, carregamento e erro.
- Interface adaptada para dispositivos móveis.

### Painel web

- Listagem das ocorrências cadastradas.
- Consulta das informações dos registros.
- Indicadores gerais de ocorrências.
- Organização e filtragem dos relatos.
- Autenticação administrativa.
- Atualização do status por usuários autorizados.
- Sincronização dos dados com o aplicativo.
- Interface responsiva para diferentes tamanhos de tela.

### Status das ocorrências

Cada registro possui um dos seguintes status:

- **Pendente:** ocorrência registrada e aguardando análise.
- **Em análise:** ocorrência em processo de avaliação.
- **Resolvido:** ocorrência marcada como resolvida pelo responsável.

O status inicial de novos registros é `Pendente`.

## 4. Tecnologias utilizadas

### Mobile

- React Native
- Expo SDK 54
- JavaScript
- Expo Linear Gradient
- React Native Animated API
- Supabase JavaScript Client

### Web

- HTML5
- CSS3
- JavaScript
- Supabase JavaScript Client
- Layout responsivo
- Animações e transições CSS

### Backend e banco de dados

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Desenvolvimento e publicação

- Visual Studio Code
- Node.js
- npm
- Git e GitHub
- Vercel

**Hospedagem do painel web:** Vercel, com publicação concluída.

## 5. Estrutura do projeto

```text
ponto-vivo/
|
|-- .gitignore
|
|-- mobile/
|   |-- App.js
|   |-- app.json
|   |-- package.json
|   |-- package-lock.json
|   |-- .env
|   |-- .gitignore
|   |-- logopontovivomb.png
|   |-- robomb.png
|   |-- .expo/
|   |-- node_modules/
|
|-- supabase/
|   |-- schema.sql
|
|-- web/
|   |-- .gitignore
|   |-- index.html
|   |-- style.css
|   |-- app.js
|   |-- config.js
|   |-- logopontovivo.png
|   |-- robo.png
|   |-- paisagem.png
|
|-- README.md
```

As pastas `node_modules/` e `.expo/` contêm arquivos locais ou gerados durante o desenvolvimento e não são versionadas.

O arquivo `mobile/.env` contém a configuração local do Supabase e está excluído do Git por meio do `.gitignore`.

A estrutura apresentada inclui os arquivos locais necessários ao desenvolvimento. Alguns deles não aparecem no repositório público porque são ignorados pelo Git.

## 6. Arquitetura e integração

O aplicativo mobile e o painel web acessam o mesmo projeto Supabase.

A tabela `public.ocorrencias` centraliza os registros.

O fluxo funciona da seguinte maneira:

1. O cidadão registra uma ocorrência pelo aplicativo.
2. O aplicativo envia os dados ao Supabase.
3. O registro é armazenado com status inicial `Pendente`.
4. O painel web consulta e apresenta a ocorrência.
5. Um administrador autorizado acessa o painel.
6. O administrador atualiza o status do registro.
7. A alteração é salva no Supabase.
8. O aplicativo consulta novamente os dados e apresenta o novo status.

### Sincronização

O aplicativo consulta atualizações periodicamente, em intervalos de aproximadamente 12 segundos, além de disponibilizar atualização manual.

A atualização dos dados não depende do Supabase Realtime.

Portanto, a sincronização é periódica, e não instantânea.

### Controle de acesso

A solução utiliza políticas de Row Level Security (RLS).

- Visitantes podem consultar ocorrências.
- Cidadãos podem cadastrar novas ocorrências sem autenticação.
- A alteração de status exige autenticação e autorização administrativa.
- Os administradores autorizados são identificados na tabela `public.administradores`.

A autenticação administrativa é realizada pelo Supabase Authentication.

## 7. Configuração do Supabase

Esta seção documenta a configuração técnica e orienta desenvolvedores ou avaliadores que desejem reproduzir o projeto em seu próprio ambiente. Não representa uma etapa pendente da implementação atual.

### 7.1. Criar o projeto

1. Acesse https://supabase.com.
2. Crie um projeto.
3. Localize a URL do projeto e sua chave pública.
4. Utilize as mesmas informações nas configurações do aplicativo e da plataforma web.

### 7.2. Configurar o banco

No SQL Editor do Supabase, execute o arquivo:

`supabase/schema.sql`

Esse arquivo contém a estrutura do banco e as políticas de acesso do projeto.

Verifique também se as permissões SQL necessárias às operações de leitura, inserção e atualização foram concedidas aos papéis adequados.

As permissões do PostgreSQL e as políticas RLS devem funcionar em conjunto.

### 7.3. Configurar o administrador

1. No Supabase, acesse `Authentication > Users`.
2. Crie ou cadastre um usuário administrativo.
3. Copie o UUID do usuário.
4. Execute no SQL Editor:

```sql
INSERT INTO public.administradores (usuario_id)
VALUES ('UUID-DO-USUARIO');
```

Substitua `UUID-DO-USUARIO` pelo identificador real do usuário.

Somente usuários autorizados devem conseguir alterar os status das ocorrências.

### 7.4. Segurança

Nunca utilize a chave `service_role` ou outras chaves secretas no aplicativo ou no JavaScript executado pelo navegador.

As interfaces utilizam uma chave pública do Supabase, com as permissões efetivas controladas pelo banco de dados e pelas políticas RLS.

A publicação de uma chave pública não elimina a necessidade de configurar corretamente as permissões.

## 8. Executar o aplicativo mobile

As instruções desta seção destinam-se a pessoas que desejam executar o projeto localmente.

### Pré-requisitos

- Node.js instalado.
- npm disponível.
- Projeto Supabase configurado.
- Dependências do aplicativo instaladas.

### Instalação

No terminal, acesse a pasta do aplicativo:

```bash
cd mobile
```

Instale as dependências:

```bash
npm install
```

### Configurar as variáveis de ambiente

Crie ou configure o arquivo `mobile/.env` com as seguintes variáveis:

```env
EXPO_PUBLIC_SUPABASE_URL=SUA_URL_DO_SUPABASE
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Substitua os valores de exemplo pelas credenciais públicas do seu projeto.

Não compartilhe arquivos com credenciais privadas ou informações sensíveis.

### Iniciar o aplicativo

Para executar a versão web do Expo:

```bash
npx expo start --web
```

O aplicativo poderá ser acessado pelo endereço local informado no terminal, geralmente:

`http://localhost:8081`

Para iniciar o servidor Expo com as opções de execução disponíveis:

```bash
npx expo start
```

**Observação:** o MVP foi desenvolvido com Expo SDK 54 e seu fluxo funcional foi testado no navegador por meio do Expo Web.

O funcionamento nativo em dispositivos Android e iOS ainda depende de validação específica em ambiente compatível.

O enunciado da Global Solution exige o código funcional do aplicativo mobile no GitHub, mas não determina a publicação obrigatória de um link público separado para o aplicativo.

## 9. Executar o painel web

O painel web encontra-se publicado e pode ser acessado diretamente:

https://ponto-vivo-web.vercel.app/

Para executar uma cópia localmente, siga as instruções abaixo.

### Servidor local

Acesse a pasta `web`:

```bash
cd web
```

O painel utiliza HTML, CSS e JavaScript e não necessita de um processo de compilação.

Execute:

```bash
npx serve .
```

Abra o endereço exibido no terminal, geralmente:

`http://localhost:3000`

### Configuração

No arquivo `web/config.js`, configure:

- URL do projeto Supabase.
- Chave pública do projeto.

As informações devem corresponder ao mesmo projeto utilizado no aplicativo mobile.

O painel poderá consultar as ocorrências cadastradas no Supabase.

Para atualizar o status de um registro, será necessário autenticar-se com uma conta administrativa autorizada.

## 10. Publicação do painel web

A plataforma web foi publicada na Vercel por meio da integração com o repositório GitHub.

**Endereço público:**

https://ponto-vivo-web.vercel.app/

**Repositório:**

https://github.com/matheusnfran/ponto-vivo

### Configuração utilizada

- Plataforma: Vercel.
- Nome do projeto: `ponto-vivo-web`.
- Repositório GitHub: `matheusnfran/ponto-vivo`.
- Branch de publicação: `master`.
- Root Directory: `web`.
- Application Preset: `Other`.
- Hospedagem: estática.

O diretório `web` foi selecionado para publicar somente a interface de gestão, mantendo o aplicativo React Native e os arquivos SQL no mesmo repositório GitHub.

### Validação após a publicação

Após o deploy, foram verificados:

- Carregamento da página pública.
- Exibição correta da identidade visual e das imagens.
- Consulta de ocorrências armazenadas no Supabase.
- Exibição de um registro cadastrado anteriormente pelo aplicativo.
- Login com conta administrativa.
- Disponibilidade e funcionamento das operações administrativas.

Esses testes confirmaram o funcionamento do painel web publicado e sua conexão com o Supabase.

## 11. Testes de integração realizados

Durante o desenvolvimento, foi realizado um teste funcional do fluxo entre as duas plataformas.

### Cenário de teste

1. Uma ocorrência de iluminação foi cadastrada pelo aplicativo.
2. O registro foi armazenado no Supabase.
3. A ocorrência apareceu no painel web.
4. Foi realizado o login com uma conta administrativa.
5. O status foi alterado de `Pendente` para `Em análise`.
6. O aplicativo consultou novamente os dados.
7. O novo status apareceu na interface mobile.

Esse teste confirmou o funcionamento básico da integração entre aplicativo, painel e banco de dados.

### Testes em ambiente publicado

Após a publicação do painel web na Vercel, também foram confirmados:

- Acesso público à aplicação.
- Consulta aos registros do Supabase.
- Apresentação do status atualizado.
- Autenticação administrativa.
- Funcionamento dos controles de gestão.

O aplicativo mobile foi testado por meio do Expo Web em ambiente local. Os testes nativos em Android e iOS ainda não foram concluídos.

## 12. Design, UX/UI e acessibilidade

O Ponto Vivo utiliza uma identidade visual compartilhada entre aplicativo e painel web.

### Identidade visual

- Verde-petróleo como cor principal.
- Tons de verde-menta e superfícies claras.
- Degradês suaves.
- Cards com transparência e bordas discretas.
- Cantos arredondados.
- Hierarquia tipográfica destacada.
- Identidade visual própria e mascote do projeto.

A proposta busca transmitir clareza, proximidade e confiança.

### Experiência do usuário

No mobile, a navegação prioriza duas ações:

- Ocorrências.
- Registrar.

O formulário utiliza campos essenciais e linguagem direta para facilitar o preenchimento.

No painel web, a interface prioriza a leitura dos registros, a organização das demandas e a alteração dos status.

### Acessibilidade

Entre os cuidados implementados estão:

- Rótulos acessíveis nos componentes mobile.
- Status apresentados por texto, além de cores.
- Campos com identificação clara.
- Botões com áreas de interação confortáveis.
- Mensagens de carregamento, confirmação e erro.
- Estrutura HTML semântica na web.
- Navegação por teclado e indicação de foco na web.
- Layout responsivo.

Essas práticas não substituem uma auditoria completa de acessibilidade.

### Motion design

As interfaces utilizam animações discretas para aprimorar a percepção de interação.

No mobile:

- Microinterações nos cards.
- Feedback visual ao pressionar elementos.
- Estados de carregamento e confirmação.

As microinterações animadas dos cards respeitam a preferência do dispositivo por movimento reduzido.

Na web:

- Animações leves de entrada e interação.
- Transições CSS.
- Movimentação decorativa sutil.
- Tratamento da preferência `prefers-reduced-motion`.

O objetivo do motion design é contribuir para a experiência sem comprometer a usabilidade.

## 13. ODS 11 — Cidades e Comunidades Sustentáveis

O Ponto Vivo está relacionado ao Objetivo de Desenvolvimento Sustentável 11 da Agenda 2030.

A proposta busca contribuir para cidades mais inclusivas, seguras e sustentáveis por meio de:

- Maior visibilidade dos problemas de infraestrutura.
- Incentivo à participação cidadã.
- Organização digital dos relatos.
- Transparência no acompanhamento das ocorrências.
- Possibilidade futura de apoiar decisões relacionadas ao transporte urbano.

O MVP não realiza reparos diretamente nem encaminha automaticamente ocorrências para órgãos públicos.

A contribuição social efetiva dependeria de adoção, validação com usuários, parcerias e processos operacionais reais.

## 14. Limitações do MVP

Por se tratar de um projeto acadêmico, a primeira versão possui limitações definidas.

Não estão implementados:

- Autenticação individual dos cidadãos.
- Verificação automática da veracidade dos relatos.
- Moderação de conteúdo.
- Geolocalização automática.
- Upload de fotografias.
- Notificações push.
- Integração oficial com prefeituras.
- Encaminhamento automático a equipes de manutenção.

O cadastro público de ocorrências também demanda medidas adicionais de segurança para uso em produção.

Entre elas:

- Rate limiting.
- CAPTCHA.
- Moderação.
- Prevenção de spam e abuso.
- Política de privacidade.
- Processo de atendimento e encaminhamento das demandas.

O formulário orienta os usuários a não inserir dados pessoais nos relatos.

## 15. Possíveis evoluções

O projeto poderá ser ampliado futuramente com:

- Localização dos pontos de ônibus em mapas.
- Anexos fotográficos.
- Notificações de mudança de status.
- Histórico de atualizações.
- Indicadores por região.
- Fluxos de moderação.
- Integração com órgãos responsáveis.
- Dashboard com análises e relatórios avançados.

Essas funcionalidades não fazem parte do escopo atual do MVP.

## 16. Evidências e validação com usuários

A documentação acadêmica prevê o registro de uma observação real ou conversa com usuários de transporte coletivo.

**Pendente de preenchimento:**

- Perfil da pessoa entrevistada ou observada.
- Data e contexto.
- Problema observado ou relatado.
- Decisão de UX resultante da pesquisa.

Não devem ser apresentados dados fictícios como resultados de pesquisa real.

## 17. Entregáveis

- Código-fonte do aplicativo mobile.
- Código-fonte do painel web.
- Estrutura SQL e políticas de acesso.
- Documentação técnica e acadêmica.
- Repositório público no GitHub.
- Plataforma web publicada na Vercel.
- Vídeo-pitch de demonstração.

### Links

**Repositório GitHub:** https://github.com/matheusnfran/ponto-vivo

**Plataforma web:** https://ponto-vivo-web.vercel.app/

**Vídeo-pitch (2 a 3 minutos):** [PREENCHER APÓS GRAVAÇÃO]

## 18. Checklist final

### Funcionalidades e entregas verificadas

- [x] Aplicativo inicia e permite navegar pelas telas no Expo Web.
- [x] Aplicativo consulta ocorrências do Supabase.
- [x] Aplicativo registra novas ocorrências.
- [x] Painel web apresenta os registros cadastrados.
- [x] Login administrativo funciona.
- [x] Administrador autorizado altera o status.
- [x] Aplicativo apresenta o status atualizado.
- [x] Identidade visual das interfaces foi finalizada.
- [x] Código-fonte publicado no GitHub.
- [x] Painel web publicado na Vercel.
- [x] Consulta ao Supabase validada na versão publicada.
- [x] Login e funcionalidades administrativas testados na Vercel.
- [x] Links do GitHub e da Vercel adicionados ao README.

### Pendências para a entrega

- [ ] Confirmar integrantes e respectivos RMs.
- [ ] Inserir a evidência de validação real com usuários.
- [ ] Realizar teste nativo do aplicativo em dispositivo compatível, se possível.
- [ ] Produzir e disponibilizar o vídeo-pitch.
- [ ] Adicionar o link definitivo do vídeo-pitch.
- [ ] Concluir a revisão final da documentação acadêmica.

---

**Ponto Vivo — Global Solution CitizenTech 2026**

Projeto acadêmico desenvolvido para o curso de Web Design da FIAP.

A voz do cidadão para pontos de ônibus mais seguros, acessíveis e acolhedores.
