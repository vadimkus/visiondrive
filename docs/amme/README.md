# AMMÉ — папка проекта

Единая документация management platform AMMÉ: banya capacity + bookings + POS + station KDS + CRM/RFM + inventory + packages + Owner BI + bilingual Tropical Nocturne UI.

**Живой продукт:** https://visiondrive.ae/amme  
**Код:** репозиторий VisionDrive (`~/VisionDrive`), путь `/amme`

---

## Документы в этой папке

| Файл | Зачем |
|---|---|
| [README.md](./README.md) | Этот индекс |
| [ACCESS.md](./ACCESS.md) | Доступ и роли |
| [STATUS.md](./STATUS.md) | Реализованный scope, тесты и прод |
| [CRM.md](./CRM.md) | CRM 360 и RFM |
| [API.md](./API.md) | API, RBAC и бизнес-цепочка |
| [CODEPATHS.md](./CODEPATHS.md) | Код и ключевые пути |
| [ROADMAP.md](./ROADMAP.md) | Архитектурный аудит и roadmap |
| [screenshots/](./screenshots/) | RU/EN desktop, mobile и public booking после редизайна |

Копии в репо VisionDrive: `docs/2026-08-03_amme-*.md`, `docs/amme/`.

---

## Кому что читать

1. **Таша (админ):** `AMME-доступ.md` → войти → вкладка «Справка» в приложении.
2. **Владелец / продажа:** `AMME-передача-проекта.md` + демо HTML.
3. **Разработка:** `AMME-код-и-пути.md` + `AMME-API-и-цепочка.md` + `AMME-CRM.md`.
4. **Статус «что уже сделано»:** `AMME-статус-продакшн.md`.

---

## Обновлено

2026-08-03 — management-platform rebuild plus Tropical Nocturne redesign and complete RU/EN i18n; 248 tests, type-check, lint and production build PASS.
