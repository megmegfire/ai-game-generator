const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateGame(prompt) {
    try {
      // ✅ 最新の安定版モデルを使用
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash-latest'
      });

      const systemPrompt = `あなたはHTML5ゲーム開発の専門家です。ユーザーの説明から、ブラウザで動作する完全なゲームを生成してください。

重要な要件：
1. HTML、CSS、JavaScriptを含む完全なコード
2. Canvas APIを使用
3. キーボード操作対応（矢印キー、WASD、スペースキー）
4. スコア表示
5. ゲームオーバー処理
6. 日本語でのUI表示

以下の形式で出力してください：

\`\`\`html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ゲーム</title>
    <style>
        /* ゲームのスタイル */
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script>
        // ゲームのロジック
    </script>
</body>
</html>
\`\`\`

ユーザーの要望: ${prompt}

完全なHTMLコードを生成してください。`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      // コードブロックからHTMLを抽出
      const codeMatch = text.match(/```html\n([\s\S]*?)\n```/);
      
      if (codeMatch && codeMatch[1]) {
        return codeMatch[1];
      }

      // マッチしない場合は全体を返す
      return text;

    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`ゲーム生成エラー: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
