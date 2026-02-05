// ===== 設定 =====
// 本番環境とローカル環境を自動判定
const API_BASE_URL = 'http://localhost:3000/api';


// ===== DOM要素の取得 =====
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const btnLoading = generateBtn.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');
const gameSection = document.getElementById('gameSection');
const gameTitle = document.getElementById('gameTitle');
const gameDescription = document.getElementById('gameDescription');
const gameCanvas = document.getElementById('gameCanvas');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const newGameBtn = document.getElementById('newGameBtn');
const gameGallery = document.getElementById('gameGallery');

// ===== 現在のゲーム =====
let currentGame = null;

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 AI Game Generator 起動');
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // ギャラリーを読み込み
    loadGallery();
    
    // サーバーの状態確認
    checkServerHealth();
});

// ===== イベントリスナーの設定 =====
function setupEventListeners() {
    // 生成ボタン
    generateBtn.addEventListener('click', generateGame);
    
    // Enter キーで生成（Ctrl/Cmd + Enter）
    promptInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            generateGame();
        }
    });
    
    // サンプルプロンプトボタン
    document.querySelectorAll('.sample-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            promptInput.value = btn.dataset.prompt;
            promptInput.focus();
        });
    });
    
    // フルスクリーンボタン
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // 新しいゲーム生成ボタン
    newGameBtn.addEventListener('click', () => {
        gameSection.style.display = 'none';
        promptInput.value = '';
        promptInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== サーバーヘルスチェック =====
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ サーバー接続成功:', data);
    } catch (error) {
        console.error('❌ サーバー接続失敗:', error);
        showError('サーバーに接続できません。server.js が起動しているか確認してください。');
    }
}

// ===== ゲーム生成 =====
async function generateGame() {
    const prompt = promptInput.value.trim();
    
    // バリデーション
    if (!prompt) {
        showError('ゲームの説明を入力してください');
        promptInput.focus();
        return;
    }
    
    if (prompt.length < 5) {
        showError('もう少し詳しく説明してください（5文字以上）');
        return;
    }
    
    // UIの状態変更
    setGenerating(true);
    hideError();
    gameSection.style.display = 'none';
    
    console.log('🎮 ゲーム生成開始:', prompt);
    
    try {
        // API リクエスト
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'ゲーム生成に失敗しました');
        }
        
        if (data.success && data.game) {
            console.log('✅ ゲーム生成成功:', data.game.id);
            currentGame = data.game;
            displayGame(data.game);
            loadGallery(); // ギャラリーを更新
        } else {
            throw new Error('ゲームデータが不正です');
        }
        
    } catch (error) {
        console.error('❌ ゲーム生成エラー:', error);
        showError(error.message);
    } finally {
        setGenerating(false);
    }
}

// ===== ゲームを表示 =====
function displayGame(game) {
    // タイトルと説明を設定
    gameTitle.textContent = game.title;
    gameDescription.textContent = `プロンプト: ${game.prompt}`;
    
    // ゲームセクションを表示
    gameSection.style.display = 'block';
    
    // スクロール
    gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // ゲームコードを実行
    setTimeout(() => {
        executeGameCode(game.code);
    }, 300);
}

// ===== ゲームコードを実行 =====
function executeGameCode(code) {
    try {
        // Canvasをリセット
        const ctx = gameCanvas.getContext('2d');
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        console.log('🎮 ゲームコード実行開始');
        console.log('コード長:', code.length, '文字');
        
        // 既存のイベントリスナーをクリア
        const newCanvas = gameCanvas.cloneNode(true);
        gameCanvas.parentNode.replaceChild(newCanvas, gameCanvas);
        
        // グローバルスコープでコードを実行
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                const canvas = document.getElementById('gameCanvas');
                const ctx = canvas.getContext('2d');
                
                // 生成されたコードを実行
                ${code}
            })();
        `;
        document.body.appendChild(script);
        
        console.log('✅ ゲームコード実行完了');
        
    } catch (error) {
        console.error('❌ ゲーム実行エラー:', error);
        showError(`ゲームの実行に失敗しました: ${error.message}`);
    }
}

// ===== ギャラリーを読み込み =====
async function loadGallery() {
    try {
        const response = await fetch(`${API_BASE_URL}/games`);
        const data = await response.json();
        
        if (data.success && data.games) {
            displayGallery(data.games);
        }
    } catch (error) {
        console.error('❌ ギャラリー読み込みエラー:', error);
    }
}

// ===== ギャラリーを表示 =====
function displayGallery(games) {
    if (games.length === 0) {
        gameGallery.innerHTML = '<p class="gallery-empty">まだゲームが生成されていません</p>';
        return;
    }
    
    gameGallery.innerHTML = games.map(game => `
        <div class="gallery-item" data-game-id="${game.id}">
            <h3>${escapeHtml(game.title)}</h3>
            <p>${escapeHtml(game.prompt.substring(0, 80))}${game.prompt.length > 80 ? '...' : ''}</p>
            <div class="gallery-meta">
                <span>📅 ${formatDate(game.createdAt)}</span>
                <span>🎮 ${game.playCount || 0}回プレイ</span>
            </div>
        </div>
    `).join('');
    
    // ギャラリーアイテムのクリックイベント
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const gameId = item.dataset.gameId;
            loadGameById(gameId);
        });
    });
}

// ===== IDでゲームを読み込み =====
async function loadGameById(gameId) {
    try {
        const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
        const data = await response.json();
        
        if (data.success && data.game) {
            currentGame = data.game;
            displayGame(data.game);
        }
    } catch (error) {
        console.error('❌ ゲーム読み込みエラー:', error);
        showError('ゲームの読み込みに失敗しました');
    }
}

// ===== フルスクリーン切り替え =====
function toggleFullscreen() {
    const container = gameCanvas.parentElement;
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.error('フルスクリーンエラー:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// ===== UIヘルパー関数 =====
function setGenerating(isGenerating) {
    generateBtn.disabled = isGenerating;
    btnText.style.display = isGenerating ? 'none' : 'inline';
    btnLoading.style.display = isGenerating ? 'inline' : 'none';
}

function showError(message) {
    errorMessage.textContent = `❌ ${message}`;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// ===== ユーティリティ関数 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ===== グローバルエラーハンドリング =====
window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
});

console.log('✅ app.js 読み込み完了');
