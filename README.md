# FitLife — Personal Fitness & Nutrition App

A comprehensive home & gym workout and nutrition planner, built as a React SPA and packaged as an Android APK via Capacitor.

## Features

- **Push/Pull/Legs+Core split system** with progressive overload across weeks
- **1,324 exercises** with animated GIF demonstrations from [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
- **Equipment-based filtering** — workouts adapt to your available gear (bodyweight, dumbbells, barbell, cable machine, kettlebell, bands, machines, and more)
- **Weekly meal planning** with 7-day variety, calorie/macro targets, and step-by-step cooking instructions
- **Shopping list** aggregated from your actual weekly meal plan
- **Food exclusion system** with smart ingredient replacements
- **Hydration tracking** with daily water intake goals
- **Progress tracking** with weight logging and body analysis (BMI, BMR, TDEE, body fat estimate)
- **Achievement system** and workout streaks
- **Onboarding flow** — personalized setup for goals, equipment, and training schedule

## Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Custom CSS (dark theme)
- **Mobile:** Capacitor (Android APK)
- **Data:** localStorage persistence
- **Exercise GIFs:** [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT)

## Getting Started

### Prerequisites

- Node.js 18+
- (For Android builds) Android Studio with SDK installed

### Setup

```bash
# Clone the repo
git clone https://github.com/MoezRjworx/PersonalSportApp.git
cd PersonalSportApp/app

# Install dependencies
npm install

# Fetch exercise GIFs (123MB)
npm run setup:gifs

# Start dev server
npm run dev
```

### Build Android APK

```bash
npm run build
npx cap sync android

# Open in Android Studio or build via Gradle
cd android
JAVA_HOME="path/to/jbr" ANDROID_HOME="path/to/sdk" ./gradlew assembleDebug
```

## Project Structure

```
PersonalSportApp/
├── app/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── data/           # Exercise database, meals, tips
│   │   ├── hooks/          # App state management
│   │   ├── pages/          # Main app pages
│   │   └── utils/          # Calculations, storage
│   ├── public/
│   │   └── videos/         # Exercise GIFs (gitignored, fetched via setup)
│   ├── android/            # Capacitor Android project
│   └── package.json
├── setup-gifs.sh           # Script to fetch exercise GIFs
├── LICENSE                 # MIT
└── README.md
```

## Exercise GIFs

The 1,324 exercise GIF animations are sourced from [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT licensed). They are not included in this repo due to size (123MB). Run the setup script to fetch them:

```bash
npm run setup:gifs
```

## License

MIT — see [LICENSE](LICENSE).

Exercise GIF animations: MIT — [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset).
