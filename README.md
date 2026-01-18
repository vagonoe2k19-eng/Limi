# Limi - Prémium Lejárati Idő Követő 🌿

Egy luxus minőségű, intelligens webalkalmazás termékek lejárati idejének nyomon követésére. Öntanuló rendszerrel, valós idejű szinkronizációval és lenyűgöző glassmorphism dizájnnal.

## ✨ Főbb Funkciók

### 🎯 Intelligens Termékkezelés
- **Adaptív Vonalkód Szkennelés**: Automatikus termék felismerés három szinten
  1. Saját tanult adatbázis (leggyorsabb)
  2. Open Food Facts API
  3. Kézi bevitel
- **Öntanuló Rendszer**: Megtanulja a termékeidet és automatikusan kitölti az adatokat
- **Tétel Kezelés**: Több lejárati dátum és mennyiség kezelése termékenkén

### 🚨 Sürgős Figyelmeztetések
- **14 Napos Intelligens Riasztás**: Testreszabható figyelmeztetési időszak
- **Kategorizált Sürgősség**: Lejárt / Kritikus / Figyelmeztetés
- **Vizuális Jelzések**: Színkódolt státusz indikátorok

### 🎨 Prémium Dizájn
- **Glassmorphism 2.0**: Homályosított üveghatású kártyák
- **Zöld Luxus Téma**: Lime és smaragdzöld akcentusok
- **Micro-interactions**: Minden interakcióhoz sima animációk
- **Skeleton Loading**: Elegáns töltési állapotok

### 🔄 Valós Idejű Szinkronizáció
- **Cross-Device Sync**: Azonnali frissítések minden eszközön
- **Supabase Realtime**: Websocket alapú élő adatok
- **Session Persistence**: Soha ne veszítsd el a bejelentkezést

### 🎛️ Teljes Testreszabhatóság
- **Egyedi Kategóriák**: Saját ikonokkal és színekkel
- **Egyedi Tárolóhelyek**: Hűtő, kamra, vagy bármi más
- **Beállítások**: Figyelmeztetési napok, témák, stb.

## 🚀 Telepítés és Futtatás

### Előfeltételek
- Node.js 20.10+ (vagy kompatibilis verzió)
- Supabase fiók ([ingyenes regisztráció](https://supabase.com))

### 1. Projekt Klónozása
```bash
cd "c:\Users\Noe\Documents\Uj kezdet app"
```

### 2. Függőségek Telepítése
```bash
npm install --legacy-peer-deps
```

### 3. Supabase Beállítás

#### A. Projekt Létrehozása
1. Menj a [Supabase Dashboard](https://app.supabase.com)-ra
2. Kattints a "New Project" gombra
3. Adj nevet a projektnek (pl. "limi")
4. Válassz jelszót és régiót

#### B. Adatbázis Séma Futtatása
1. Nyisd meg a Supabase SQL Editor-t
2. Másold be a `supabase/schema.sql` tartalmát
3. Futtasd le a scriptet (Run gomb)

#### C. Környezeti Változók Beállítása
1. Másold át a `.env.example` fájlt `.env` névre:
   ```bash
   copy .env.example .env
   ```

2. Nyisd meg a `.env` fájlt és töltsd ki az adatokat:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Az adatokat a Supabase Dashboard-on találod:
   - Settings → API → Project URL
   - Settings → API → Project API keys → anon public

### 4. Alkalmazás Indítása

#### Fejlesztői Mód
```bash
npm run dev
```

Az alkalmazás elérhető lesz: `http://localhost:5173`

#### Production Build
```bash
npm run build
npm run preview
```

## 📁 Projekt Struktúra

```
limi/
├── src/
│   ├── components/
│   │   ├── auth/              # Bejelentkezés, regisztráció
│   │   ├── home/              # Kezdőlap
│   │   ├── scanner/           # Vonalkód szkenner
│   │   ├── products/          # Termék lista, kártya, űrlap
│   │   ├── layout/            # Navigáció, header
│   │   └── ui/                # Újrafelhasználható komponensek
│   ├── contexts/              # React contexts (Auth)
│   ├── hooks/                 # Custom hooks (useData)
│   ├── lib/                   # Supabase client, utilities
│   ├── App.jsx                # Fő alkalmazás
│   ├── main.jsx               # Belépési pont
│   └── index.css              # Globális stílusok
├── supabase/
│   └── schema.sql             # Adatbázis séma
├── public/
├── package.json
└── README.md
```

## 🎨 Technológiai Stack

- **Frontend**: React 18 + Vite 5
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Styling**: TailwindCSS 3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Barcode**: html5-qrcode
- **Date Utils**: date-fns
- **State**: Zustand

## 🔐 Biztonság

- **Row Level Security (RLS)**: Minden felhasználó csak a saját adatait látja
- **Secure Authentication**: Supabase Auth JWT tokenekkel
- **Environment Variables**: Érzékeny adatok `.env` fájlban

## 📱 Használat

### Első Lépések
1. **Regisztráció**: Hozz létre egy fiókot email és jelszó megadásával
2. **Termék Hozzáadása**: 
   - Kattints az "Új termék" gombra
   - Szkennelj egy vonalkódot VAGY add meg kézzel
   - Töltsd ki a lejárati dátumot és mennyiséget
   - Mentsd el

### Öntanuló Funkció
- Amikor először szkennelsz egy vonalkódot, az alkalmazás megkeresi az Open Food Facts adatbázisban
- Ha szerkeszted a nevet vagy kategóriát, az alkalmazás megjegyzi
- Legközelebb ugyanazt a kódot szkennelve automatikusan kitölti a tanult adatokat

### Sürgős Termékek
- A "Sürgős" nézetben láthatod az összes hamarosan lejáró terméket
- Alapértelmezetten 14 napon belül lejárók jelennek meg
- Ezt a beállításokban módosíthatod

## 🛠️ Fejlesztés

### Új Kategória Hozzáadása
```javascript
// A kategóriák automatikusan létrejönnek az első bejelentkezéskor
// Új kategóriát a useCategories hook-kal adhatsz hozzá
const { addCategory } = useCategories()
await addCategory('Új Kategória', '#a3e635', 'IconName')
```

### Új Tárolóhely Hozzáadása
```javascript
const { addLocation } = useLocations()
await addLocation('Új Tárolóhely')
```

## 🐛 Hibaelhárítás

### "Supabase környezeti változók hiányoznak"
- Ellenőrizd, hogy létrehoztad-e a `.env` fájlt
- Győződj meg róla, hogy a változók neve `VITE_` előtaggal kezdődik
- Indítsd újra a dev szervert a változtatások után

### Kamera nem működik
- Ellenőrizd a böngésző engedélyeket
- HTTPS vagy localhost szükséges a kamera használatához
- Próbáld meg egy másik böngészőben

### Termékek nem jelennek meg
- Ellenőrizd a Supabase kapcsolatot
- Nézd meg a böngésző konzolt hibákért
- Győződj meg róla, hogy az RLS szabályok megfelelően vannak beállítva

## 📄 Licenc

Ez a projekt személyes használatra készült. Minden jog fenntartva.

## 🙏 Köszönetnyilvánítás

- **Open Food Facts** - Termék adatbázis
- **Supabase** - Backend infrastruktúra
- **Lucide** - Gyönyörű ikonok
- **Framer Motion** - Sima animációk

---

**Készítve ❤️ -vel a Limi csapat által**

Ha kérdésed van, nyiss egy issue-t vagy írj nekünk!
