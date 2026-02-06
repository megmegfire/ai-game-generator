// ===== ゲームコードを実行 =====
function executeGameCode(code) {
    try {
        console.log('🎮 ゲームコード実行開始');
        console.log('コード長:', code.length, '文字');
        
        // Canvasをリセット
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // HTMLコード全体が返ってきた場合の処理
        if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
            console.log('✅ 完全なHTMLコードを検出 - JavaScriptを抽出');
            
            // <script>タグの中身を抽出
            const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
            if (scriptMatch && scriptMatch[1]) {
                code = scriptMatch[1];
                console.log('✅ JavaScriptコードを抽出しました');
            }
        }
        
        // 問題のある関数/コードを削除/置換
        code = code.replace(/\.requestFullscreen\s*\([^)]*\)/g, '/* requestFullscreen removed */');
        code = code.replace(/\.toggleFullscreen\s*\([^)]*\)/g, '/* toggleFullscreen removed */');
        code = code.replace(/document\.fullscreenElement/g, 'false');
        code = code.replace(/\.exitFullscreen\s*\([^)]*\)/g, '/* exitFullscreen removed */');
        
        // canvas 変数の重複宣言を防ぐ
        // const canvas = ... や let canvas = ... を canvas = ... に置換
        code = code.replace(/\b(const|let)\s+canvas\s*=/g, 'canvas =');
        code = code.replace(/\b(const|let)\s+ctx\s*=/g, 'ctx =');
        
        // グローバルスコープでコードを実行
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                try {
                    // Canvas要素とコンテキストを取得
                    let canvas = document.getElementById('gameCanvas');
                    if (!canvas) {
                        console.error('Canvas要素が見つかりません');
                        return;
                    }
                    let ctx = canvas.getContext('2d');
                    
                    // 生成されたコードを実行
                    ${code}
                    
                    console.log('✅ ゲーム実行成功');
                } catch (error) {
                    console.error('❌ ゲーム実行エラー:', error);
                }
            })();
        `;
        document.body.appendChild(script);
        
        console.log('✅ ゲームコード実行完了');
        
    } catch (error) {
        console.error('❌ ゲーム実行エラー:', error);
        showError(`ゲームの実行に失敗しました: ${error.message}`);
    }
}
