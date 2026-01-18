# Limi - Supabase Adatbázis Beállítási Útmutató

## 🎯 Probléma
"Database error saving new user" hiba jelenik meg regisztrációkor, mert az adatbázis táblák még nem léteznek.

## ✅ Megoldás - Lépésről Lépésre

### 1. Nyisd meg a Supabase Dashboard-ot
Menj a böngészőben: **https://app.supabase.com**

### 2. Válaszd ki a projektedet
- Keresd meg a projektet (ubdkplbbcfwxdowwszbt)
- Kattints rá

### 3. Nyisd meg az SQL Editor-t
- Bal oldali menüben: **SQL Editor**
- Vagy direkt link: https://app.supabase.com/project/ubdkplbbcfwxdowwszbt/sql

### 4. Új Query Létrehozása
- Kattints a **"New query"** gombra
- Vagy a **"+"** ikonra

### 5. Másold be a Schema SQL-t
Nyisd meg ezt a fájlt: `c:\Users\Noe\Documents\Uj kezdet app\supabase\schema.sql`

**Teljes tartalom másolása:**
- Ctrl+A (mindent kijelöl)
- Ctrl+C (másol)

### 6. Illeszd be a Supabase SQL Editor-ba
- Kattints az SQL Editor mezőbe
- Ctrl+V (beilleszt)

### 7. Futtasd le a Script-et
- Kattints a **"Run"** gombra (vagy F5)
- Vagy a zöld ▶ (play) ikonra a jobb felső sarokban

### 8. Ellenőrizd a Sikeres Futást
Látnod kell egy zöld üzenetet: **"Success. No rows returned"**

Ha hibát látsz, másold ki a hibaüzenetet és küldd el nekem!

### 9. Ellenőrizd a Táblákat
- Menj a **"Table Editor"** menüpontra
- Látnod kell az alábbi táblákat:
  - ✅ user_profiles
  - ✅ categories
  - ✅ locations
  - ✅ products
  - ✅ custom_product_knowledge

### 10. Próbáld újra a Regisztrációt
- Menj vissza az alkalmazáshoz: http://localhost:5173
- Próbálj meg regisztrálni
- Most már működnie kell! 🎉

---

## 🔍 Gyors Ellenőrzés

Ha minden rendben van, a regisztráció után:
1. Automatikusan be leszel jelentkezve
2. Látnod kell a kezdőlapot
3. 8 alapértelmezett kategória létrejön (Tejtermékek, Húsok, stb.)
4. 4 alapértelmezett tárolóhely létrejön (Hűtő, Fagyasztó, Kamra, Szekrény)

---

## ❓ Gyakori Problémák

### "relation does not exist" hiba
- A táblák nem jöttek létre
- Futtasd újra a schema.sql-t

### "permission denied" hiba
- RLS szabályok problémája
- Ellenőrizd, hogy a teljes schema.sql lefutott-e

### Továbbra is "Database error"
- Nézd meg a Supabase Dashboard → Logs menüpontot
- Küldd el a hibaüzenetet

---

## 📞 Segítség Kérése

Ha bármi nem működik, küldd el:
1. A Supabase SQL Editor hibaüzenetét (ha van)
2. A böngésző konzol hibáját (F12 → Console)
3. Képernyőképet a problémáról
