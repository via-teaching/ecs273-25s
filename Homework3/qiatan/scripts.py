#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
from pathlib import Path

def parse_news_file(path: Path) -> dict:
    item = {}
    content_lines = []
    with path.open('r', encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n')
            if line.startswith('Title:'):
                item['title'] = line[len('Title:'):].strip()
            elif line.startswith('Date:'):
                item['date'] = line[len('Date:'):].strip()
            elif line.startswith('URL:'):
                item['url'] = line[len('URL:'):].strip()
            else:
                content_lines.append(line)
    item['content'] = '\n'.join(content_lines).strip()
    return item

def build_stocknews_json(root_dir: Path, output_path: Path):
    result = {}
    for stock_dir in root_dir.iterdir():
        if not stock_dir.is_dir():
            continue
        news_list = []
        for txt_file in stock_dir.glob('*.txt'):
            try:
                news_item = parse_news_file(txt_file)
                news_list.append(news_item)
            except Exception as e:
                print(f"error: {txt_file} -> {e}")
        result[stock_dir.name] = news_list

    with output_path.open('w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"careted：{output_path}")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(
        description='txt to json'
    )
    parser.add_argument(
        'input_dir',
        type=Path,
        help='data/stocknews'
    )
    parser.add_argument(
        'output_file',
        type=Path,
        help='data'
    )
    args = parser.parse_args()

    if not args.input_dir.exists() or not args.input_dir.is_dir():
        parser.error(f"path is wrong：{args.input_dir}")

    build_stocknews_json(args.input_dir, args.output_file)

# python3 scripts.py data/stocknews stocknews_by_stock.json