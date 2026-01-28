import { SensitiveFilterFactory } from './SensitiveFilter.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDemo() {
    const jsonPath = path.join(__dirname, 'sensitive_words.json');
    
    console.log('🔄 Initializing Filter...');
    const filter = await SensitiveFilterFactory.createFromFile(jsonPath);
    console.log('✅ Filter Initialized.');

    // Test Cases
    const testCases = [
        "我们可以去玩百家乐吗？", // Should BLOCK (Gambling)
        "这个人真的是个废物。",   // Should REVIEW (Insult) - depending on logic
        "我今天吃了个包子。",     // Should PASS (Common word, if logic works right)
        "老板，我要兼职。",       // Should REVIEW or PASS depending on exact match logic
        "必须打倒独裁暴政！"       // Should BLOCK (Politics)
    ];

    console.log('\n🧪 Running Tests:\n');

    for (const text of testCases) {
        const result = filter.check(text);
        console.log(`📝 Input: "${text}"`);
        console.log(`   ⛔ Blocked: ${result.isBlocked}`);
        console.log(`   👀 Review:  ${result.needReview}`);
        console.log(`   🛡️ Clean:   "${result.sanitizedText}"`);
        if (result.hitWords.length > 0) {
            console.log(`   🔍 Hits:    ${result.hitWords.map(w => `${w.word}[${w.level}]`).join(', ')}`);
        }
        console.log('-'.repeat(40));
    }
}

runDemo().catch(console.error);
