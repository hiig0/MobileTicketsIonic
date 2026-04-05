# Sistema de Controle de Atendimento

Aplicacao Ionic + Angular no frontend e Node.js + Express no backend, organizada em arquitetura limpa com persistencia em MySQL 8.

## Estrutura

- `frontend/`: frontend Ionic/Angular
- `backend/`: API Node.js com use cases, dominio, infraestrutura e controller HTTP
- `db/`: imagem de inicializacao do MySQL
- `docker-compose.yml`: sobe banco, backend e frontend com um comando

## Como executar

### Docker

```bash
docker compose up --build
```

O `docker compose` aceita um arquivo `.env` na raiz para sobrescrever variáveis como `BACKEND_PORT`, `FRONTEND_PORT` e credenciais do MySQL.

### Frontend

```bash
cd frontend
npm install
npm run start
```

No modo local, o frontend usa `http://localhost:3000/api`.

### Backend

```bash
cd backend
npm install
npm run dev
```

No modo local, o backend lê `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` do ambiente, com valores padrão prontos para desenvolvimento.

## Endpoints principais

- `POST /api/tickets/issue` - emite senha
- `POST /api/tickets/next` - chama a proxima senha
- `GET /api/tickets/overview` - painel diario
- `GET /api/tickets/reports?period=daily|monthly` - relatorios
- `GET /health` - health check da API

## Regras implementadas

- Senhas `SP`, `SG` e `SE`
- Numeracao diaria no formato `YYMMDD-PPSQ`
- Descarte automatico de 5% das senhas
- Chamada em ciclo respeitando prioridade e alternancia
- Relatorio diario e mensal com resumo e detalhamento
- Tempo medio de atendimento por tipo de senha

## Observacao

O projeto esta separado em `frontend/` e `backend/`. A raiz contem apenas orquestracao, banco e documentacao.