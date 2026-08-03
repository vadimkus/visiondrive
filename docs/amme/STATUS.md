# AMMÉ — статус продакшна

Дата: **2026-08-03**

## Вердикт

Пилот **жив на проде**. Учёт смены + CRM работают. E2E на `visiondrive.ae` пройден.

| | |
|---|---|
| URL | https://visiondrive.ae/amme |
| Login | https://visiondrive.ae/amme/login |
| Хостинг | Vercel (VisionDrive) |
| БД | Timescale Postgres (`tsdb`) |
| Ветка | `main` |
| Ключевые коммиты | `e2f8f93` admin · `1af2e3b` upgrade · `495dcea` CRM · `2a15df5` build fix |

---

## Что уже работает (Layer A — MVP)

### Операции смены

1. Записи на день (ручные + импорт текста)
2. Пришёл / не пришёл / вернуть
3. Walk-in без записи (с телефоном → CRM)
4. Визит → счёт → строки меню
5. Автоотправка на кухню (~6 сек) / «Сейчас»
6. Кухня: SENT → DONE, таймер срочности
7. Разделение счетов / перенос позиций
8. Оплата и закрытие счёта
9. Баня как строка + лента «баня сейчас»
10. Отчёты: сегодня / 7д / 30д / свой период, графики, печать
11. Редактор меню (цена, имя, active)
12. Справка (knowledge base на русском)

### CRM (добавлено 3 авг)

- Единый профиль гостя (ключ = телефон)
- Заметки, теги, диета, ДР, VIP / осторожно
- LTV, число визитов, noshow, история
- Сегменты: VIP, постоянные, новые, спят 30д+, баня, high spend, noshow
- Бейджи на записях и счетах; алерт в чеке

---

## E2E проверка (prod)

Прогон `npm run test:amme-e2e`:

```
login → booking+guest → arrive → order→pay→close → crm stats → crm update → crm history
→ ok: true
```

Отдельный ручной прогон цепочки до CRM тоже PASS (выручка/отчёт ок).

---

## Инфра / БД

- Старый Timescale host умер (ENOTFOUND) — переключено на новый.
- Схема: `npx prisma db push`
- Сид админа: `npm run db:seed-amme`
- Backfill CRM по старым визитам: `npm run db:backfill-amme-crm` (уже гоняли: ~10 гостей)

TLS для Timescale: `lib/db-tls.ts` (relaxed SSL локально).

---

## Известные открытые вопросы (не код)

Из ТЗ / передачи — всё ещё на владельце/админе:

1. Воскресенье: слоты или один сеанс?
2. Ресторан в будни: отдельные списки?
3. Цена пилота / ask владельцу
4. Админ откажется от параллельных «Заметок»?

Layer B (Telegram, hotel full suite) — **не в пилоте**.

---

## Локальный запуск

```bash
cd ~/VisionDrive
npx prisma db push
npm run db:seed-amme
npm run db:backfill-amme-crm   # опционально
npm run dev
# http://localhost:3000/amme/login
```

Прод-тест:

```bash
cd ~/VisionDrive
npm run test:amme-e2e
```
