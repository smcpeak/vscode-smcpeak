// https://stackoverflow.com/questions/51605113/visual-studio-code-meaning-of-syntax-highlight-colors?rq=1
function zeroDarkThirty(num) {
    //debugger;
    if (num === 0) return NaN;
    num = String(num);
    let noZeros = '';
    for (let i = 0; i <= num.length; ++i) {
        if (num[i] === '0');
        else noZeros += String(num[i]);
    }
   return parseFloat(noZeros);
}

// zeroDarkThirty(1023.0456);
