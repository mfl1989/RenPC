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

現在の申込 API にはフロントエンド生成の冪等性キーを付与しており、同一内容の二重送信時は既存の注文 ID を返す実装です。

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

ローカルでメール送信を確認したい場合は、docker-compose.yml に含まれる Mailpit を起動したうえで、次のようにプロファイルを切り替えます。

```powershell
docker compose up -d mailpit
```

```powershell
$env:SPRING_PROFILES_ACTIVE = "localmail"
cd backend
.\gradlew.bat bootRun
```

`localmail` プロファイルでは `localhost:1025` の Mailpit へ送信します。UI は `http://localhost:8025` で確認できます。

この設定では、申込受付メール、ステータス更新メール、正式料金確定メール、問い合わせ受付メールをローカルで確認できます。

## 現状の実装範囲

- 回収申込のマルチステップフォーム
- 注文照会（注文番号 + メールアドレス）
- 管理者ログイン
- 管理画面での注文一覧、詳細、ステータス更新、正式料金確定
- 問い合わせ受付と管理画面での問い合わせ対応
- 申込受付、ステータス更新、正式料金確定、問い合わせ受付の通知メール
- 申込 API の二重送信防止（冪等性キー）

## 未実装・今後の補完候補

- 申込者向けログイン / マイページ
- 完了後のデータ消去証明書ダウンロード
- 本人確認書類アップロードを含む古物営業法対応フロー
- 本番 SMTP を使った実送信確認と運用手順の確定

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