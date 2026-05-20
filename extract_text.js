const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Algo-chan\\Foundation_Care_Network\\fnn_content\\word\\document.xml', 'utf8');
const matches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
if (matches) {
    matches.forEach(match => {
        const text = match.replace(/<[^>]+>/g, '');
        console.log(text);
    });
}
