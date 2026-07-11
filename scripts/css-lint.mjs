// Finds CSS syntax errors per original style block so each can be fixed the
// way a browser would recover (drop the malformed rule only).
import postcss from 'postcss';
import fs from 'node:fs';

for (const file of ['src/styles/base.css', 'src/styles/patches.css']) {
  const css = fs.readFileSync(file, 'utf8');
  const blocks = css.split(/(?=\/\* ==== style block #)/);
  blocks.forEach((block) => {
    const header = block.match(/style block #(\d+) id="([^"]*)"/);
    try {
      postcss.parse(block);
    } catch (e) {
      console.log(`${file} block #${header?.[1]} (${header?.[2]}): ${e.reason} at block line ${e.line}`);
      const lines = block.split('\n');
      console.log('   >>> ' + lines.slice(Math.max(0, e.line - 3), e.line + 1).join('\n   >>> '));
    }
  });
}
