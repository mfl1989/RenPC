# RenPC

日本向けの回収申込システムです。バックエンドは Spring Boot、フロントエンドは React + TypeScript + Vite で構成されています。

## 開発環境

- Java 17 以上
- Node.js 20 系以上を推奨
- Docker Desktop（PostgreSQL を docker compose で起動する場合）
- VS Code

## リポジトリ構成

- backend: Spring Boot API
- frontend: React + TypeScript + Vite
- docs: 開発規約・要件定義
- scripts: ローカル DB 初期化補助スクリプト

## クイックスタート

### 1. データベースを起動する

最も簡単なのはリポジトリ直下で docker compose を使う方法です。

```powershell
docker compose up -d
```

既定の接続先は次の通りです。

- Host: localhost
- Port: 5432
- Database: recycle
- Username: recycle
- Password: recycle

ローカルの PostgreSQL を使う場合は、[scripts/setup-recycle-db.sql](scripts/setup-recycle-db.sql) を実行して同じ接続先を作成してください。

### 2. バックエンドを起動する

コマンド実行:

```powershell
cd backend
.\gradlew.bat bootRun
```

または VS Code のタスクから `backend: bootRun` を実行します。

バックエンド既定ポートは `8080` です。

### 3. フロントエンドを起動する

```powershell
cd frontend
npm install
npm run dev
```

または VS Code のタスクから `frontend: dev` を実行します。

フロントエンド既定ポートは `5173` です。開発中の `/api` リクエストは Vite のプロキシ経由で `http://localhost:8080` に転送されます。

## VS Code での実行

### 推奨拡張

ワークスペース推奨拡張は [/.vscode/extensions.json](.vscode/extensions.json) に定義しています。

### タスク

共通タスクは [/.vscode/tasks.json](.vscode/tasks.json) に定義しています。

- frontend: dev
- frontend: build
- frontend: lint
- backend: bootRun
- backend: build
- backend: test

### デバッグ

デバッグ構成は [/.vscode/launch.json](.vscode/launch.json) に定義しています。

- Backend: Spring Boot
- Frontend: Vite + Chrome
- Full Stack: Backend + Frontend

## Copilot ルール

VS Code で利用するプロジェクトルールは次にあります。

- [/.github/copilot-instructions.md](.github/copilot-instructions.md)
- [/.github/instructions](.github/instructions)

旧 Cursor ルールの [/.cursorrules](.cursorrules) は現時点では保管目的で残しています。

## 参考ドキュメント

- [docs/01_dev_standards.md](docs/01_dev_standards.md)
- [docs/02_db_guidelines.md](docs/02_db_guidelines.md)
- [docs/03_frontend_features.md](docs/03_frontend_features.md)
- [docs/04_business_requirements.md](docs/04_business_requirements.md)