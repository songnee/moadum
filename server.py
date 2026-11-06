#!/usr/bin/env python3
"""
모아둠 (MOADUM) 로컬 웹서버 실행 스크립트
명령어: python3 server.py
"""
import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # 간결한 로그 출력
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} - {args[1]} {args[2]}\n")

def run():
    global PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                url = f"http://localhost:{PORT}"
                print("=" * 60)
                print(" 🌟 모아둠 (MOADUM) 웹사이트가 실행되었습니다!")
                print(f" 👉 브라우저 주소: {url}")
                print("=" * 60)
                print(" 종료하려면 터미널에서 Ctrl + C 를 누르세요.\n")
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e):
                PORT += 1
            else:
                raise e

if __name__ == "__main__":
    run()
