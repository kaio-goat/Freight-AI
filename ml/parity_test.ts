import fs from 'fs';
import path from 'path';
import { predictBdi } from '../src/services/mlInference';

function main() {
  const parityFile = path.join(process.cwd(), 'ml', 'models', 'v1_5_parity_tests.json');
  const tests = JSON.parse(fs.readFileSync(parityFile, 'utf-8'));
  
  let allPass = true;
  let maxDiff = 0;
  
  const TOLERANCE = 1e-7; // Floating point arithmetic tolerance
  
  console.log("--- PYTHON VS TYPESCRIPT PARITY TEST ---");
  
  for (const test of tests) {
    const { date, features, prediction: pythonPrediction } = test;
    
    try {
      const tsPrediction = predictBdi(features);
      const diff = Math.abs(pythonPrediction - tsPrediction);
      
      maxDiff = Math.max(maxDiff, diff);
      
      const pass = diff <= TOLERANCE;
      if (!pass) allPass = false;
      
      console.log(`\nDate: ${date}`);
      console.log(`Python: ${pythonPrediction}`);
      console.log(`TS    : ${tsPrediction}`);
      console.log(`Diff  : ${diff.toExponential(4)}`);
      console.log(`Status: ${pass ? 'PASS' : 'FAIL'}`);
    } catch (err: any) {
      console.log(`\nDate: ${date} - Error: ${err.message}`);
      allPass = false;
    }
  }
  
  console.log("\n--- SUMMARY ---");
  console.log(`Max Difference: ${maxDiff.toExponential(4)}`);
  console.log(`Parity Passed : ${allPass ? 'YES' : 'NO'}`);
  
  if (!allPass) {
    process.exit(1);
  }
}

main();
