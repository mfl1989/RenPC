# データベース設計規範 (Database Guidelines)

## 1. 基本方針 (Basic Policy)
- **RDBMS**: PostgreSQL を使用する。
- **マイグレーションツール**: Flyway を使用する。
  - DBeaverやDataGrip等のツールを使用した**手動でのDDL実行（CREATE, ALTER, DROP）は本番・ローカル問わず一切禁止**。
  - 全てのDB変更は `V1__create_users_table.sql` のようなバージョン管理されたSQLスクリプトとして `src/main/resources/db/migration/` に配置し、Spring Boot起動時に自動適用させる。

## 2. ネーミングルール (Naming Conventions)
- **テーブル名**: 複数形のスネークケース (snake_case)。例: `users`, `recycle_orders`, `appliances`
- **カラム名**: 単数形のスネークケース。例: `user_id`, `item_name`, `total_amount`
- **外部キー制約名**: `fk_{自テーブル名}_{参照先テーブル名}`。例: `fk_orders_users`
- **インデックス名**: `idx_{テーブル名}_{カラム名}`。例: `idx_users_email`

## 3. 必須の共通カラム (Audit & Required Columns)
テーブル設計時、ビジネス要件に関わらず全テーブルに以下のカラムを含めること（中間テーブル等は要検討）。

` ` `sql
id         BIGSERIAL PRIMARY KEY, -- または UUID
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
created_by VARCHAR(255),          -- 作成者の識別子
updated_by VARCHAR(255),          -- 更新者の識別子
is_deleted BOOLEAN DEFAULT FALSE NOT NULL -- 論理削除フラグ
` ` `

## 4. 特殊データ型の扱い (Handling Specific Data Types)
日本特有のデータを取り扱う際の基本方針。

- **郵便番号 (Zip Code)**:
  - `VARCHAR(7)` を使用する。
  - ハイフン（-）は除外して保存する。例: `1350061`
- **電話番号 (Phone Number)**:
  - `VARCHAR(15)` 程度を確保する。
  - 検索効率と正規化のため、ハイフンは除外して保存することを推奨する。例: `09012345678`
- **金額 (Money / Currency)**:
  - `INTEGER` または `BIGINT` を使用する。
  - 日本円を扱うため、小数点以下は不要（`DECIMAL`や`FLOAT`は丸め誤差の懸念があるため使用しない）。
- **パスワード (Password)**:
  - 平文保存は絶対禁止。必ず Spring Security の `BCryptPasswordEncoder` 等でハッシュ化して保存し、カラム長は `VARCHAR(255)` を確保する。

## 5. インデックスとパフォーマンス (Indexes & Performance)
- 検索条件として頻繁に使用されるカラム（メールアドレス、注文番号など）には必ずインデックスを付与する。
- 外部キー制約のカラム（例: `user_id`）には原則としてインデックスを付与する。
- 論理削除（`is_deleted = true`）を多用するため、ユニーク制約を設ける場合は `is_deleted = false` のレコードに限定する部分インデックス (Partial Index) の導入を検討すること。