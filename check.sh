#!/bin/bash
# 项目规范自动检查脚本

set -e

echo "🔍 Web Tools 项目规范检查"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
WARNINGS=0
ERRORS=0

# 1. TypeScript 类型检查
echo -e "\n1️⃣ TypeScript 类型检查..."
if command -v npx &> /dev/null; then
  if npx nuxi typecheck; then
    echo -e "${GREEN}✓ TypeScript 检查通过${NC}"
  else
    echo -e "${RED}✗ TypeScript 检查失败${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠ npx 未找到，跳过 TypeScript 检查${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 2. 检查组件样式导入
echo -e "\n2️⃣ 检查 Vue 组件样式..."
MISSING_STYLE=0
for file in app/components/**/*.vue; do
  if [ -f "$file" ]; then
    # 检查是否有 style 标签
    if ! grep -q "<style" "$file"; then
      echo -e "${YELLOW}⚠ $file 缺少 <style> 标签${NC}"
      MISSING_STYLE=$((MISSING_STYLE + 1))
    fi
  fi
done

if [ $MISSING_STYLE -eq 0 ]; then
  echo -e "${GREEN}✓ 所有组件都有样式定义${NC}"
else
  echo -e "${YELLOW}⚠ $MISSING_STYLE 个组件缺少样式${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 3. 检查 console.log (排除注释)
echo -e "\n3️⃣ 检查 console.log..."
CONSOLE_LOGS=$(grep -r "console\.log" app/ --include="*.ts" --include="*.vue" --include="*.js" 2>/dev/null | grep -v "^[[:space:]]*\/\/" || true)
if [ -n "$CONSOLE_LOGS" ]; then
  echo -e "${YELLOW}⚠ 发现 console.log:${NC}"
  echo "$CONSOLE_LOGS"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓ 未发现 console.log${NC}"
fi

# 4. 检查 any 类型使用
echo -e "\n4️⃣ 检查 any 类型使用..."
ANY_USAGE=$(grep -r ": any" app/ --include="*.ts" --include="*.vue" 2>/dev/null || true)
if [ -n "$ANY_USAGE" ]; then
  echo -e "${YELLOW}⚠ 发现 any 类型:${NC}"
  echo "$ANY_USAGE" | head -5
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓ 未发现 any 类型${NC}"
fi

# 5. 检查 BEM 命名规范（基本检查）
echo -e "\n5️⃣ 检查 CSS 类命名..."
NON_BEM=$(grep -r "class=\"[^\"]*[A-Z]" app/components/ --include="*.vue" 2>/dev/null || true)
if [ -n "$NON_BEM" ]; then
  echo -e "${YELLOW}⚠ 发现可能不符合 BEM 规范的类名（包含大写）${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓ CSS 类命名检查通过${NC}"
fi

# 6. 检查未使用的导入（简单检查）
echo -e "\n6️⃣ 检查项目结构..."
if [ ! -d "app/components/tools" ]; then
  echo -e "${RED}✗ app/components/tools 目录不存在${NC}"
  ERRORS=$((ERRORS + 1))
else
  TOOL_COUNT=$(find app/components/tools -name "*.vue" -type f | wc -l)
  echo -e "${GREEN}✓ 找到 $TOOL_COUNT 个工具组件${NC}"
fi

if [ ! -d "app/composables" ]; then
  echo -e "${YELLOW}⚠ app/composables 目录不存在${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  COMPOSABLE_COUNT=$(find app/composables -name "use*.ts" -type f | wc -l)
  echo -e "${GREEN}✓ 找到 $COMPOSABLE_COUNT 个 composable${NC}"
fi

# 7. 检查 package.json 脚本
echo -e "\n7️⃣ 检查必要的 npm 脚本..."
REQUIRED_SCRIPTS=("dev" "build" "generate")
for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\":" package.json; then
    echo -e "${GREEN}✓ $script 脚本存在${NC}"
  else
    echo -e "${RED}✗ 缺少 $script 脚本${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# 8. 构建测试
echo -e "\n8️⃣ 静态生成测试..."
if npm run generate; then
  echo -e "${GREEN}✓ 静态生成成功${NC}"
  
  # 检查输出目录
  if [ -d ".output/public" ]; then
    SIZE=$(du -sh .output/public | cut -f1)
    echo -e "${GREEN}✓ 输出大小: $SIZE${NC}"
  fi
else
  echo -e "${RED}✗ 静态生成失败${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 总结
echo -e "\n================================"
echo -e "检查完成"
echo -e "================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ 所有检查通过！${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ 完成，但有 $WARNINGS 个警告${NC}"
  exit 0
else
  echo -e "${RED}✗ 发现 $ERRORS 个错误和 $WARNINGS 个警告${NC}"
  exit 1
fi
