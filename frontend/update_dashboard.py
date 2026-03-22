import os
file_path = r'c:\Users\deval\OneDrive\Desktop\AskMe-Ai\frontend\src\features\chat\pages\Dashboard.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# targeted replaces for text colors globally matching CSS variables
reps = {
    # Inline styles
    "color: '#e8e8e8'": "color: 'var(--text-main)'",
    "color: '#ffffff'": "color: 'var(--text-main)'",
    "color: '#fff'": "color: 'var(--text-main)'",
    "color: '#888'": "color: 'var(--text-muted)'",
    "color: '#888888'": "color: 'var(--text-muted)'",
    "color: '#666'": "color: 'var(--text-muted)'",
    "color: '#555'": "color: 'var(--text-muted)'",
    "color: '#444'": "color: 'var(--text-hint)'",
    "color: '#333'": "color: 'var(--text-hint)'",
    "background: '#171616'": "background: 'var(--bg-main)'",
    "background: '#1a1a1a'": "background: 'var(--bg-sidebar)'",
    "background: '#1e1e1e'": "background: 'var(--bg-card)'",
    "background: '#111'": "background: 'var(--bg-input)'",
    "background: '#252525'": "background: 'var(--border-color)'",
    "borderColor: '#252525'": "borderColor: 'var(--border-color)'",
    "borderColor: '#2e2e2e'": "borderColor: 'var(--border-input)'",
    "border: '1px solid #252525'": "border: '1px solid var(--border-color)'",
    "border: '1px solid #2e2e2e'": "border: '1px solid var(--border-input)'",
    
    # Tailwind replacements safe to do globally
    "text-[#666]": "text-[var(--text-muted)]",
    "text-[#888]": "text-[var(--text-muted)]",
    "text-[#aaa]": "text-[var(--text-muted)]",
    "text-[#ccc]": "text-[var(--text-main)]",
    "text-[#ddd]": "text-[var(--text-main)]",
    "text-[#555]": "text-[var(--text-muted)]",
    "text-[#444]": "text-[var(--text-hint)]",
    "bg-[#333]": "bg-[var(--border-input)]",
    "bg-[#252525]": "bg-[var(--border-color)]",
    "bg-[#222]": "bg-[var(--border-color)]",
    "border-[#252525]": "border-[var(--border-color)]",
    "border-[#2e2e2e]": "border-[var(--border-input)]",
    "border-[#333]": "border-[var(--border-color)]",
    "border-[#222]": "border-[var(--border-color)]",

    # Targeted Welcome Screen replacements
    'className="text-white">AskMee': 'className="text-[var(--text-main)]">AskMee',
    'text-white mb-2 text-center': 'text-[var(--text-main)] mb-2 text-center',
    'text-white mb-6': 'text-[var(--text-main)] mb-6',
    'text-white outline-none': 'text-[var(--text-main)] outline-none',
    'font-semibold text-white text-[15px]': 'font-semibold text-[var(--text-main)] text-[15px]',
    'text-white mt-4': 'text-[var(--text-main)] mt-4',
    'text-white mt-3': 'text-[var(--text-main)] mt-3',
    'mb-3 text-white': 'mb-3 text-[var(--text-main)]',
    'group-hover:text-white': 'group-hover:text-[var(--text-main)]',
    'text-white/90': 'text-[var(--text-main)]',
    'hover:text-white': 'hover:text-[var(--text-main)]',
    'bg-[rgba(255,255,255,0.03)] text-white': 'bg-[var(--bg-input)] text-[var(--text-main)]'
}

for old, new in reps.items():
    text = text.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Finished updates.")
