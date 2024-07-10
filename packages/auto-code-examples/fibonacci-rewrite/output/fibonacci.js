/**
 * Calculates the nth number in the Fibonacci sequence.
 * 
 * @param {number} n - The position of the Fibonacci number to calculate (0-based index).
 * @returns {number} The nth Fibonacci number.
 */
function fibonacci(n) {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    
    return b;
}

module.exports = fibonacci;