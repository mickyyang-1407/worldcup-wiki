const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Remove bg-gradient-to-* Tailwind classes, keeping fallback solid colors if they exist,
    // actually, let's just replace `bg-gradient-to-[a-z]+` with `bg-gray-900`
    content = content.replace(/bg-gradient-to-[a-z]{1,2}/g, 'bg-gray-900');
    // Remove from-* and to-* and via-*
    content = content.replace(/\bfrom-[a-z0-9]+-[0-9]+\b/g, '');
    content = content.replace(/\bto-[a-z0-9]+-[0-9]+\b/g, '');
    content = content.replace(/\bvia-[a-z0-9]+-[0-9]+\b/g, '');

    // 2. Replace linear-gradient in style={{ background: '...' }}
    // A safe way is to find linear-gradient and replace it with a solid color from it.
    // E.g., `background: 'linear-gradient(135deg, #d40404 0%, #a00303 100%)'` -> `background: '#d40404'`
    content = content.replace(/linear-gradient\([^)]+,\s*(#[a-fA-F0-9]{3,6}|rgba?\([^)]+\))[^;}'"]*\)/g, '$1');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated", file);
    }
});
