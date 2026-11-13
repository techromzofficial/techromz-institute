const started = Date.now();
const timer = setTimeout(() => { console.error('JSDOM_IMPORT_TIMEOUT_30S'); process.exit(2); },30000);
try { const { JSDOM } = await import('jsdom'); const doc = new JSDOM('<p>fixture</p>'); console.log(JSON.stringify({node:process.version,milliseconds:Date.now()-started,text:doc.window.document.querySelector('p').textContent})); doc.window.close(); }
catch(error) { console.error(error); process.exitCode=1; }
finally { clearTimeout(timer); }
