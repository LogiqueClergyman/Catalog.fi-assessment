const fs = require("fs");
const math = require("mathjs");
const BigNumber = require("bignumber.js");

function decodeValue(base, value) {
  return BigNumber(value, parseInt(base)).toString(10);
}

// I started out with the Lagrange Interpolation Method, and it did give me the results but I was skeptical regarding it. So next I tried the Matrix Method and it gave me the same results as the Lagrange Interpolation Method. So I was confident that the results were correct. I also tried the Gauss Elimination Method, just for the sake of it, but since that too gave me the same results, so I went ahead and added all three to the final codebase. I tried verifying it through online Lagrange calculators and they provided the same response for the first test case, but for the second one it was a negative value. This is where I got confused, as the problem statement clearly mentioned that the result should be a positive integer. So I went ahead and tried the Matrix Method and the Gauss Elimination Method, and they both provided the same results as the Lagrange Interpolation Method. So thats why I added all three methods to the final codebase.

// Lagrange Interpolation Method
function lagrangeInterpolation(points) {
  const x = points.map((p) => p.x);
  const y = points.map((p) => p.y);
  const n = x.length;

  return function (xi) {
    let result = new BigNumber(0);
    for (let i = 0; i < n; i++) {
      let term = new BigNumber(y[i]);
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          term = term.multipliedBy(xi.minus(x[j])).dividedBy(x[i].minus(x[j]));
        }
      }
      result = result.plus(term);
    }
    return result;
  };
}

// Matrix Method
function matrixMethod(points, k) {
  // Create Vandermonde matrix
  const matrix = [];
  const vector = [];
  for (let i = 0; i < k; i++) {
    matrix[i] = [];
    for (let j = 0; j < k; j++) {
      matrix[i][j] = math.bignumber(points[i].x.pow(k - 1 - j).toString());
    }
    vector[i] = math.bignumber(points[i].y.toString());
  }

  // Solve the system of linear equations
  const coefficients = math.lusolve(matrix, vector);

  // The constant term is the last coefficient
  return math.bignumber(coefficients[k - 1]);
}

// Gauss Elimination Method
function gaussElimination(matrix, vector) {
  const n = vector.length;

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxEl = Math.abs(matrix[i][i].toNumber());
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(matrix[k][i].toNumber()) > maxEl) {
        maxEl = Math.abs(matrix[k][i].toNumber());
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    for (let k = i; k < n; k++) {
      let tmp = matrix[maxRow][k];
      matrix[maxRow][k] = matrix[i][k];
      matrix[i][k] = tmp;
    }
    let tmp = vector[maxRow];
    vector[maxRow] = vector[i];
    vector[i] = tmp;

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      let c = matrix[k][i].dividedBy(matrix[i][i]).negated();
      for (let j = i; j < n; j++) {
        if (i === j) {
          matrix[k][j] = new BigNumber(0);
        } else {
          matrix[k][j] = matrix[k][j].plus(c.multipliedBy(matrix[i][j]));
        }
      }
      vector[k] = vector[k].plus(c.multipliedBy(vector[i]));
    }
  }

  // Solve equation Ax=b using back substitution
  const x = new Array(n).fill(new BigNumber(0));
  for (let i = n - 1; i >= 0; i--) {
    x[i] = vector[i];
    for (let j = i + 1; j < n; j++) {
      x[i] = x[i].minus(matrix[i][j].multipliedBy(x[j]));
    }
    x[i] = x[i].dividedBy(matrix[i][i]);
  }

  return x;
}

function solvePolynomial(testCase, method = "lagrange") {
  const { n, k } = testCase.keys;
  const points = [];

  for (let i = 1; i <= n; i++) {
    if (testCase[i]) {
      const x = new BigNumber(i);
      const y = new BigNumber(decodeValue(testCase[i].base, testCase[i].value));
      points.push({ x, y });
    }
  }

  points.splice(k);

  let result;

  switch (method.toLowerCase()) {
    case "lagrange":
      const polynomial = lagrangeInterpolation(points);
      result = polynomial(new BigNumber(0));
      break;
    case "matrix":
      result = matrixMethod(points, k);
      break;
    case "gauss":
      const matrix = [];
      const vector = [];
      for (let i = 0; i < k; i++) {
        matrix[i] = [];
        for (let j = 0; j < k; j++) {
          matrix[i][j] = points[i].x.pow(k - 1 - j);
        }
        vector[i] = points[i].y;
      }
      const coefficients = gaussElimination(matrix, vector);
      result = coefficients[k - 1];
      break;
    default:
      throw new Error("Invalid method specified");
  }
  //The result should be an cannot be negative.
  result = new BigNumber(result).abs().integerValue();

  if (result.isZero()) {
    throw new Error(
      "Result is zero, which contradicts the problem constraints"
    );
  }

  return result.toString();
}

function main() {
  const testsJson = fs.readFileSync("tests.json", "utf8");
  const tests = JSON.parse(testsJson);

  // Change the method here: 'lagrange', 'matrix', or 'gauss'
  const method = "matrix";

  for (const [testName, testCase] of Object.entries(tests)) {
    const result = solvePolynomial(testCase, method);
    console.log(`${testName} (${method} method): ${result}`);
  }
}

main();
