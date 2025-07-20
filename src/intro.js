// Lesson: Writing your first tests
export function max(a, b) {
  return a > b ? a : b;
}

// Exercise
export function fizzBuzz(n) {
  if (n % 3 === 0 && n % 5 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return n.toString();
}

export function calculateAverage(numbers) {
  if (numbers.length === 0) return NaN;

  const sum = numbers.reduce((sum, current) => sum + current, 0);

  return sum / numbers.length;
}

// my solution
// export function factorial(number) {
//   if (number === 0 || number === 1) return 1;

//   let factorial = 1;

//   for (let i = 1; i <= number; i++) {
//     factorial *= i;
//   }

//   return factorial;
// }

// better one
export function factorial(number) {
  if (number < 0) return undefined;

  if (number === 0 || number === 1) return 1;

  return number * factorial(number - 1);
}
