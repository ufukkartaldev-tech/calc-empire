import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src/__tests__');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.test.ts') && !f.includes('math') && !f.includes('formulas'));

for (const file of files) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const categoryName = file.replace('.test.ts', '');
    const outDir = path.join(srcDir, categoryName);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const separator = '// ─────────────────────────────────────────────────────────────────────────────';
    const parts = content.split(separator);

    // Adjust imports for 1 level deeper: '../lib/' -> '../../lib/'
    let header = parts[0].replace(/from '\.\.\/lib/g, "from '../../lib");

    // There are 2 separators per section block, so parts are:
    // parts[0]: imports
    // parts[1]: title comment
    // parts[2]: test code block
    // parts[3]: title comment
    // parts[4]: test code block ...
    for (let i = 1; i < parts.length; i += 2) {
        const titleComment = parts[i];
        const codeBlock = parts[i + 1];
        if (!codeBlock || !codeBlock.trim()) continue;

        // Extract a clean filename from the describe block string
        const match = codeBlock.match(/describe\(['"]([^'"]+)['"]/);
        let fileName = 'test.test.ts';
        if (match) {
            let name = match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
            // trim trailing/leading dashes
            if (name.startsWith('-')) name = name.slice(1);
            if (name.endsWith('-')) name = name.slice(0, -1);
            fileName = name + '.test.ts';
        }

        const newFilePath = path.join(outDir, fileName);
        const fileContent = [header.trim(), '', separator, titleComment, separator, codeBlock].join('\n');

        fs.writeFileSync(newFilePath, fileContent, 'utf-8');
    }

    // Delete the original monolithic file after processing
    fs.unlinkSync(filePath);
}

console.log('✅ Split tests completed successfully.');
