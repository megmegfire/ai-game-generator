const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * ゲーム生成用のシステムプロンプトを構築
 */
function buildSystemPrompt(userPrompt) {
  return `あなたはHTML5 CanvasとJavaScriptで動作するシンプルなゲームを生成する専門家です。

ユーザーの説明: "${userPrompt}"

以下の要件に従って、完全に動作するゲームコードを生成してください。

【重要な制約】
1. Canvas要素のIDは 'gameCanvas' を使用
2. Canvas サイズは 800x600px
3. すべてのコードは1つのJavaScriptファイルとして動作すること
4. グローバル変数の使用を最小限に
5. 説明文やコメントは不要。コードのみを返すこと

【必須実装】
✅ ゲームループ (requestAnimationFrame)
✅ キーボード操作 (矢印キー、WASD、スペースなど)
✅ 衝突判定
✅ スコア表示
✅ ゲームオーバー判定
✅ リセット機能 (Rキー)
✅ 画面上に操作説明を表示

【ゲームの種類例】
- 避けゲー: プレイヤーが障害物を避ける
- キャッチゲー: 落ちてくるアイテムをキャッチ
- シューティング: 敵を撃って倒す
- ジャンプゲー: 障害物をジャンプで避ける

【コードの形式】
\`\`\`javascript
// Canvas取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲーム変数
let score = 0;
let gameOver = false;

// プレイヤー
const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5
};

// ... ゲームロジック ...

// ゲームループ
function gameLoop() {
  if (!gameOver) {
    // 更新処理
    update();
    // 描画処理
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

// 初期化
gameLoop();
\`\`\`

【出力形式】
\`\`\`javascript で囲んだJavaScriptコードのみを返してください。
説明やマークダウンの追加は不要です。

今すぐゲームコードを生成してください。`;
}

/**
 * ユーザープロンプトからゲームコードを生成
 * @param {string} userPrompt - ユーザーが入力したゲームの説明
 * @returns {Promise<string>} - 生成されたJavaScriptコード
 */
async function generateGame(userPrompt) {
  try {
    // APIキーの確認
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY が設定されていません。.envファイルを確認してください。');
    }

    // Gemini Proモデルを使用
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // システムプロンプトを構築
    const prompt = buildSystemPrompt(userPrompt);

    console.log('🤖 Gemini APIにリクエスト中...');

    // コンテンツ生成
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    console.log('📝 生成されたレスポンス長:', generatedText.length, '文字');

    // コードブロックからJavaScriptコードを抽出
    let gameCode = generatedText;

    // ```javascript ... ``` の形式で囲まれている場合は抽出
    const codeBlockMatch = generatedText.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      gameCode = codeBlockMatch[1];
      console.log('✂️  コードブロックを抽出しました');
    }

    // 余分な空白を削除
    gameCode = gameCode.trim();

    // 最低限のコード検証
    if (gameCode.length < 100) {
      throw new Error('生成されたコードが短すぎます。もう一度お試しください。');
    }

    if (!gameCode.includes('canvas') && !gameCode.includes('gameCanvas')) {
      throw new Error('有効なゲームコードが生成されませんでした。プロンプトを変えてお試しください。');
    }

    console.log('✅ ゲームコード生成完了');

    return gameCode;

  } catch (error) {
    console.error('❌ Gemini API エラー:', error);
    
    // エラーメッセージをわかりやすく
    if (error.message.includes('API key')) {
      throw new Error('Gemini APIキーが無効です。.envファイルを確認してください。');
    } else if (error.message.includes('quota')) {
      throw new Error('APIの使用制限に達しました。しばらく待ってから再試行してください。');
    } else {
      throw new Error(`ゲーム生成エラー: ${error.message}`);
    }
  }
}

module.exports = {
  generateGame
};
