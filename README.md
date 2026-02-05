# AI Game Generator

AIを使ってプロンプトからゲームを生成するWebアプリケーション

## 📁 プロジェクト構造

```
ai-game-generator/
├── package.json          # プロジェクト設定と依存関係
├── .env.example          # 環境変数のテンプレート
├── .gitignore           # Git除外ファイル
├── server.js            # Expressサーバー（次のステップで作成）
├── services/            # バックエンドサービス
│   └── gemini.js       # Gemini API統合
├── public/              # 静的ファイル
│   ├── index.html      # メインページ
│   ├── css/
│   │   └── style.css   # スタイルシート
│   └── js/
│       └── app.js      # フロントエンドロジック
└── data/                # ゲームデータ保存先
    └── games.json      # 生成されたゲーム
```

## 🚀 セットアップ手順

### ステップ1: パッケージインストール（✅ 完了）

```bash
npm install
```

### ステップ2: 環境変数の設定（次のステップ）

```bash
cp .env.example .env
# .envファイルを編集してGemini APIキーを設定
```

### ステップ3: サーバーの起動

```bash
npm start
```

## 📦 インストール済みパッケージ

- **express**: Webサーバーフレームワーク
- **cors**: クロスオリジンリクエスト対応
- **dotenv**: 環境変数管理
- **@google/generative-ai**: Gemini API SDK
- **nodemon**: 開発時の自動再起動（dev用）

## 次のステップ

ステップ2でサーバーの骨組みを作成します！
