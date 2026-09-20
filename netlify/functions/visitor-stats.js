const {createHandler} = require('./lib/visitor-stats.cjs');
const {enabled} = require('./lib/deploy-context.json');
exports.handler = createHandler({enabled});
