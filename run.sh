#!/bin/bash
# 모아둠 (MOADUM) 원클릭 실행 스크립트

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo " 🌟 모아둠 (MOADUM) 웹사이트를 시작합니다."
echo "=========================================================="

# 브라우저에서 바로 열기
if command -v open >/dev/null 2>&1; then
    open "file://$DIR/index.html"
    echo " 브라우저로 index.html 을 직접 열었습니다."
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "file://$DIR/index.html"
fi

# 로컬 웹서버 실행
echo " 로컬 웹서버를 구동합니다 (포트 8000)..."
python3 "$DIR/server.py"
