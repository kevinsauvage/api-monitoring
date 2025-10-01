#!/bin/bash
set -e

echo "🔍 Running local CI validation..."
echo ""

echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🎨 Checking code formatting..."
npm run format:check

echo ""
echo "🧹 Running ESLint..."
npm run lint

echo ""
echo "🔍 Running TypeScript type check..."
npm run type-check

echo ""
echo "🧪 Running tests..."
npm run test:run

echo ""
echo "📊 Running tests with coverage..."
npm run test:coverage

echo ""
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ All CI checks passed locally!"
echo "🚀 Ready for push/PR!"