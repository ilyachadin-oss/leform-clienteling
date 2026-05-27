# Leform — Clienteling Dashboard

Интерактивный дашборд аналитики clienteling-программы. Две вкладки: данные и динамика по месяцам + VIP-стратегия с логикой интервалов, переходов и привилегий.

---

## Локальный запуск

**Требования:** Node.js 18+

```bash
# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
```

Откроется на `http://localhost:5173`

---

## Deploy на Vercel

### Вариант 1 — через интерфейс (проще)

1. Залить репозиторий на GitHub
2. Зайти на [vercel.com](https://vercel.com) → New Project
3. Выбрать репозиторий → Deploy

Vercel автоматически определит Vite и всё настроит.

### Вариант 2 — через CLI

```bash
npm install -g vercel
vercel
```

---

## Структура проекта

```
leform-clienteling/
├── index.html          # точка входа
├── vite.config.js      # конфиг сборщика
├── package.json
└── src/
    ├── main.jsx        # монтирование React
    └── App.jsx         # весь дашборд
```

---

## Стек

- React 18
- Recharts — графики
- Vite — сборка

---

*dthink project — Leform clienteling, 2025-2026*
