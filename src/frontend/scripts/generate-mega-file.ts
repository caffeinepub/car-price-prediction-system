/**
 * Mega File Generator
 * 
 * This script generates a single "mega file" containing all project source files
 * with clear markers for easy reconstruction. The output includes both frontend
 * and backend code, plus all necessary configuration files.
 * 
 * Usage:
 *   npx tsx scripts/generate-mega-file.ts > mega-export.txt
 * 
 * Or with Node:
 *   node --loader ts-node/esm scripts/generate-mega-file.ts > mega-export.txt
 */

import * as fs from 'fs';
import * as path from 'path';

// File patterns to include
const INCLUDE_PATTERNS = [
  // Frontend source files
  /^frontend\/src\/.*\.(tsx?|css|json)$/,
  /^frontend\/index\.html$/,
  /^frontend\/components\.json$/,
  
  // Frontend config files
  /^frontend\/package\.json$/,
  /^frontend\/tailwind\.config\.js$/,
  /^frontend\/tsconfig\.json$/,
  /^frontend\/vite\.config\.js$/,
  /^frontend\/postcss\.config\.js$/,
  
  // Frontend public assets (metadata only, not binary)
  /^frontend\/public\/sitemap\.xml$/,
  /^frontend\/public\/robots\.txt$/,
  
  // Backend files
  /^backend\/main\.mo$/,
  
  // Root config files
  /^dfx\.json$/,
  /^README\.md$/,
  
  // Documentation
  /^frontend\/README\.md$/,
  /^frontend\/PRODUCTION_DEPLOYMENT\.md$/,
  /^frontend\/MEGA_FILE_EXPORT\.md$/,
  /^frontend\/COLAB_FRONTEND_RUN_GUIDE\.md$/,
];

// File patterns to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.dfx/,
  /\.next/,
  /coverage/,
  /\.cache/,
  /\.env/,
  /\.DS_Store/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
];

// Binary file extensions to skip
const BINARY_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg', '.webp',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  '.woff', '.woff2', '.ttf', '.eot',
  '.zip', '.tar', '.gz',
];

interface FileEntry {
  path: string;
  content: string;
}

/**
 * Check if a file should be included based on patterns
 */
function shouldIncludeFile(filePath: string): boolean {
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Check exclude patterns first
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(normalizedPath))) {
    return false;
  }
  
  // Check if it's a binary file
  const ext = path.extname(normalizedPath).toLowerCase();
  if (BINARY_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Check include patterns
  return INCLUDE_PATTERNS.some(pattern => pattern.test(normalizedPath));
}

/**
 * Recursively walk directory and collect files
 */
function walkDirectory(dir: string, baseDir: string, files: FileEntry[] = []): FileEntry[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    
    if (entry.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDE_PATTERNS.some(pattern => pattern.test(relativePath))) {
        walkDirectory(fullPath, baseDir, files);
      }
    } else if (entry.isFile()) {
      if (shouldIncludeFile(relativePath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({ path: relativePath, content });
        } catch (error) {
          console.error(`Warning: Could not read file ${relativePath}:`, error);
        }
      }
    }
  }
  
  return files;
}

/**
 * Generate the mega file content
 */
function generateMegaFile(files: FileEntry[]): string {
  const lines: string[] = [];
  
  // Header
  lines.push('================================================================================');
  lines.push('CAR PRICE PREDICTION SYSTEM - MEGA FILE EXPORT');
  lines.push('================================================================================');
  lines.push('');
  lines.push('This file contains the complete source code for the Car Price Prediction System.');
  lines.push('');
  lines.push('Project: Car Price Prediction System');
  lines.push('Founder: ASWIN S NAIR');
  lines.push('Contact: aswinjr462005@gmail.com');
  lines.push('');
  lines.push('For reconstruction instructions, see the section at the end of this file,');
  lines.push('or refer to frontend/MEGA_FILE_EXPORT.md');
  lines.push('');
  lines.push('For Google Colab instructions, see frontend/COLAB_FRONTEND_RUN_GUIDE.md');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total files: ${files.length}`);
  lines.push('');
  lines.push('================================================================================');
  lines.push('FILE CONTENTS');
  lines.push('================================================================================');
  lines.push('');
  
  // Sort files by path for consistency
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
  
  // Add each file
  for (const file of sortedFiles) {
    lines.push('===FILE_START===');
    lines.push(`filepath: ${file.path}`);
    lines.push('===CONTENT_START===');
    lines.push(file.content);
    lines.push('===CONTENT_END===');
    lines.push('===FILE_END===');
    lines.push('');
  }
  
  // Footer with reconstruction instructions
  lines.push('================================================================================');
  lines.push('RECONSTRUCTION INSTRUCTIONS');
  lines.push('================================================================================');
  lines.push('');
  lines.push('To reconstruct the project from this mega file:');
  lines.push('');
  lines.push('1. Create a project root directory:');
  lines.push('   mkdir car-price-predictor && cd car-price-predictor');
  lines.push('');
  lines.push('2. For each file block above (between ===FILE_START=== and ===FILE_END===):');
  lines.push('   a. Note the filepath (e.g., "frontend/src/App.tsx")');
  lines.push('   b. Create the directory structure: mkdir -p $(dirname <filepath>)');
  lines.push('   c. Copy content between ===CONTENT_START=== and ===CONTENT_END===');
  lines.push('   d. Save to the file: <filepath>');
  lines.push('');
  lines.push('3. Install frontend dependencies:');
  lines.push('   cd frontend && npm install');
  lines.push('');
  lines.push('4. For local development with backend:');
  lines.push('   - Install dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install/');
  lines.push('   - Run: dfx start --background');
  lines.push('   - Deploy: dfx deploy');
  lines.push('   - Start frontend: npm run start');
  lines.push('');
  lines.push('5. For Google Colab (frontend only):');
  lines.push('   - See frontend/COLAB_FRONTEND_RUN_GUIDE.md for detailed instructions');
  lines.push('   - Note: Backend cannot run in Colab');
  lines.push('');
  lines.push('For detailed instructions, see:');
  lines.push('- frontend/MEGA_FILE_EXPORT.md - Complete reconstruction guide');
  lines.push('- frontend/COLAB_FRONTEND_RUN_GUIDE.md - Google Colab specific guide');
  lines.push('- frontend/README.md - Local development guide');
  lines.push('');
  lines.push('================================================================================');
  lines.push('END OF MEGA FILE');
  lines.push('================================================================================');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  try {
    // Determine project root (go up from scripts directory)
    const projectRoot = path.resolve(__dirname, '../..');
    
    console.error(`Scanning project from: ${projectRoot}`);
    console.error('');
    
    // Collect all files
    const files = walkDirectory(projectRoot, projectRoot);
    
    console.error(`Found ${files.length} files to include`);
    console.error('');
    console.error('Generating mega file...');
    console.error('');
    
    // Generate mega file content
    const megaFileContent = generateMegaFile(files);
    
    // Output to stdout (can be redirected to file)
    console.log(megaFileContent);
    
    console.error('');
    console.error('✅ Mega file generated successfully!');
    console.error('');
    console.error('To save to a file, run:');
    console.error('  npx tsx scripts/generate-mega-file.ts > mega-export.txt');
    
  } catch (error) {
    console.error('Error generating mega file:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateMegaFile, walkDirectory, shouldIncludeFile };
