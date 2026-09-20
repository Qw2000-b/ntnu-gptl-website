const {writeFileSync} = require('node:fs');
const {join} = require('node:path');
// Only a public boolean is baked into the function; never read API credentials here.
writeFileSync(join(__dirname, '../netlify/functions/lib/deploy-context.json'), JSON.stringify({enabled: process.env.CONTEXT === 'deploy-preview'}));
