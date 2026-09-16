const babel = require('@babel/core');
const path = require('path');
try {
  babel.loadPartialConfigSync({
    filename: path.resolve('./index.ts'),
  });
  console.log("Babel config loaded successfully!");
} catch (e) {
  console.error("BABEL ERROR:", e.message);
}
