import os
import re

ignore_dirs = {'.git', 'node_modules', 'venv', '.next', 'dist', 'build', '__pycache__', '.pytest_cache'}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # replacements
        new_content = content
        new_content = re.sub(r'Scope & Hope', 'Scope & Hope', new_content)
        new_content = re.sub(r'Scope & Hope', 'Scope & Hope', new_content)
        new_content = re.sub(r'scope-and-hope', 'scope-and-hope', new_content)
        new_content = re.sub(r'SCOPE_AND_HOPE', 'SCOPE_AND_HOPE', new_content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        pass

def traverse_and_replace(dir_path):
    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if not file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.md', '.json', '.env', '.env.example', '.css', '.txt')):
                continue
            path = os.path.join(root, file)
            replace_in_file(path)

if __name__ == '__main__':
    traverse_and_replace('.')
