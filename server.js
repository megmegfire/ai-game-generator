const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const geminiService = require('./services/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// データファイルのパス
const GAMES_FILE = path.join(__dirname, 'data', 'games.json');

// ゲームデータの読み込み
async function loadGames() {
  try {
    const data = await fs.readFile(GAMES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空配列を返す
    return [];
  }
}

// ゲームデータの保存
async function saveGames(games) {
  await fs.mkdir(path.dirname(GAMES_FILE), { recursive: true });
  await fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2));
}

// ===== API エンドポイント =====

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Game Generator API is running',
    timestamp: new Date().toISOString()
  });
});

// ゲーム生成エンドポイント
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'プロンプトが必要です' 
      });
    }

    console.log('🎮 ゲーム生成リクエスト:', prompt);

    // Gemini APIでゲームコードを生成
    const gameCode = await geminiService.generateGame(prompt);

    // 自動保存
    const games = await loadGames();
    const newGame = {
      id: Date.now().toString(),
      title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      prompt: prompt,
      code: gameCode,
      createdAt: new Date().toISOString(),
      playCount: 0
    };
    
    games.push(newGame);
    await saveGames(games);

    console.log('✅ ゲーム生成成功:', newGame.id);

    res.json({
      success: true,
      game: newGame
    });

  } catch (error) {
    console.error('❌ ゲーム生成エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ゲームの生成に失敗しました'
    });
  }
});

// ゲーム一覧取得
app.get('/api/games', async (req, res) => {
  try {
    const games = await loadGames();
    res.json({
      success: true,
      games: games.reverse() // 新しい順に並べる
    });
  } catch (error) {
    console.error('❌ ゲーム一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ゲーム一覧の取得に失敗しました'
    });
  }
});

// 特定のゲーム取得
app.get('/api/games/:id', async (req, res) => {
  try {
    const games = await loadGames();
    const game = games.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'ゲームが見つかりません'
      });
    }

    // プレイ回数を増やす
    game.playCount = (game.playCount || 0) + 1;
    await saveGames(games);

    res.json({
      success: true,
      game: game
    });
  } catch (error) {
    console.error('❌ ゲーム取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ゲームの取得に失敗しました'
    });
  }
});

// ゲーム削除
app.delete('/api/games/:id', async (req, res) => {
  try {
    const games = await loadGames();
    const filteredGames = games.filter(g => g.id !== req.params.id);
    
    if (games.length === filteredGames.length) {
      return res.status(404).json({
        success: false,
        error: 'ゲームが見つかりません'
      });
    }

    await saveGames(filteredGames);

    res.json({
      success: true,
      message: 'ゲームを削除しました'
    });
  } catch (error) {
    console.error('❌ ゲーム削除エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ゲームの削除に失敗しました'
    });
  }
});

// Vercel用のエクスポート
module.exports = app;

// ローカル開発用
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('🚀 AI Game Generator Server');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '設定済み ✅' : '未設定 ❌'}`);
    console.log('');
    console.log('📌 エンドポイント:');
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   POST http://localhost:${PORT}/api/generate`);
    console.log(`   GET  http://localhost:${PORT}/api/games`);
    console.log('');
  });
}
