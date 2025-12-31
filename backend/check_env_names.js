const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

console.log('--- Env Var Check ---');
const keys = Object.keys(process.env);
const smtpKeys = keys.filter(k => k.includes('SMTP') || k.includes('SMPT'));
console.log('Found mail related keys:', smtpKeys);
console.log('SMPT_PORT:', process.env.SMPT_PORT);
