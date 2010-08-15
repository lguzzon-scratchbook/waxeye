/*
 * Waxeye Parser Generator
 * www.waxeye.org
 * Copyright (C) 2008-2010 Orlando Hill
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * A commandline arithmetic calculator.
 */
var sys = require('sys');
var waxeye = require('waxeye');
var parser = require('./parser');

var p = new parser.Parser();

var calc = function(input) {
    var ast = p.parse(input);
    if (ast instanceof waxeye.ParseError) {
        return ast;
    }
    else {
        return sum(ast.children[0]);
    }
}


var binOp = function(ast, fn, ch, op1, op2) {
    var chil = ast.children;
    // apply the visitor function to our first sub-tree
    var val = fn(chil[0]);
    var i = 1;
    while (i != chil.length) {
        // choose our operator function
        var operator = chil[i] == ch ? op1 : op2;
        // apply the visitor function to our second sub-tree
        var operand = fn(chil[i + 1]);
        // apply the operator to our current value and the second sub-tree
        val = operator(val, operand);
        // move on to the next operator and sub-tree
        i += 2;
    }
    return val
}

var sum = function(ast) {
    var add = function(a, b){return a + b;};
    var sub = function(a, b){return a - b;};
    return binOp(ast, prod, '+', add, sub);
}

var prod = function(ast) {
    var mult = function(a, b){return a * b;};
    var div = function(a, b){return a / b;};
    return binOp(ast, unary, '*', mult, div);
}

var unary = function(ast) {
    if (ast.type === 'unary') {
        // the unary rule is a pruning non-terminal
        // the only case we will see it is if we have negation
        return - unary(ast.children[1]);
    }
    else {
        if (ast.type === 'sum') {
            return sum(ast);
        }
        else {
            return num(ast);
        }
    }
}

var num = function(ast) {
    return parseFloat(ast.children.join(''));
}


var input = "";
var stdin = process.openStdin();

stdin.setEncoding('utf8');

sys.print('calc> ');

// Read our input
stdin.on('data', function (line) {
    sys.puts(calc(line));
    sys.print('calc> ');
});

stdin.on('end', function () {
    sys.print('\n');
});
