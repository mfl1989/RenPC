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

本システムの申込フローは現時点で会員登録不要です。ユーザーは回収申込フォームから連絡先を送信し、その後のやり取りはメールまたは電話で行う前提です。
管理画面の認証は管理者専用で、申込者向けのログイン機能は持ちません。

### 1. データベースを起動する

最も簡単なのはリポジトリ直下で docker compose を使う方法です。既定では PostgreSQL を起動します。

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

本番向け SMTP を使う場合は、次の環境変数を設定してください。標準案は SendGrid SMTP を想定しており、テンプレートは [backend/.env.smtp.example](backend/.env.smtp.example) にあります。

- MAIL_HOST
- MAIL_PORT
- MAIL_PROTOCOL
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_SMTP_AUTH
- MAIL_SMTP_SSL_ENABLE
- MAIL_SMTP_STARTTLS_ENABLE
- MAIL_SMTP_STARTTLS_REQUIRED
- MAIL_SMTP_CONNECTION_TIMEOUT_MS
- MAIL_SMTP_TIMEOUT_MS
- MAIL_SMTP_WRITE_TIMEOUT_MS
- NOTIFICATION_MAIL_ENABLED
- NOTIFICATION_MAIL_FROM
- NOTIFICATION_MAIL_FROM_NAME
- NOTIFICATION_MAIL_REPLY_TO
- CONTACT_INQUIRY_ADMIN_TO
- NOTIFICATION_COMPANY_NAME
- NOTIFICATION_SUPPORT_DESK_NAME
- NOTIFICATION_SUPPORT_HOURS

SendGrid 以外へ切り替える場合の代表例は次のとおりです。

- Office 365: `MAIL_HOST=smtp.office365.com`, `MAIL_PORT=587`, `MAIL_SMTP_AUTH=true`, `MAIL_SMTP_STARTTLS_ENABLE=true`, `MAIL_SMTP_STARTTLS_REQUIRED=true`
- Google Workspace: `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_SMTP_AUTH=true`, `MAIL_SMTP_STARTTLS_ENABLE=true`, `MAIL_SMTP_STARTTLS_REQUIRED=true`

補足:
Google Workspace を通常の SMTP 認証で使う場合は、運用ポリシーに応じてアプリパスワードまたは許可された認証方式が必要です。この実装は OAuth2 ではなく SMTP 認証ベースです。

補足:
Office 365 と Google Workspace のどちらも、実運用では `NOTIFICATION_MAIL_FROM` と `MAIL_USERNAME` を同一ドメイン配下で揃える構成が安全です。

標準の業務名義は次の想定です。

- 送信者名: RenPCカスタマーサポート
- 返信先: support@renpc.jp
- 管理者通知先: ops@renpc.jp
- 受付時間: 平日 9:00〜18:00（土日祝日・年末年始を除く）

ローカルでメール送信を確認したい場合は、MailDev などのローカル SMTP サーバーを起動し、次のようにプロファイルを切り替えます。

```powershell
$env:SPRING_PROFILES_ACTIVE = "localmail"
cd backend
.\gradlew.bat bootRun
```

`localmail` プロファイルでは `localhost:1025` へ送信します。MailDev の UI は通常 `http://localhost:8025` です。

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