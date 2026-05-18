import os
import re

ignore_dirs = {'.git', 'node_modules', 'venv', '.next', 'dist', 'build', '__pycache__', '.pytest_cache'}

def find_scope-and-hope(dir_path):
    results = []
    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if not file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.md', '.json', '.env', '.env.example', '.css', '.txt')):
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if re.search(r'scope-and-hope', content, re.IGNORECASE):
                        results.append(path)
            except Exception as e:
                pass
    return results

if __name__ == '__main__':
    files = find_scope-and-hope('.')
    for f in files:
        print(f)
