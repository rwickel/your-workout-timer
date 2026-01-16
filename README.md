# Timer APP

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/rwickel/your-workout-buddy.git

# Step 2: Navigate to the project directory.
cd your-workout-buddy

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

##Build Android App:

```sh
npm install
npm install @capacitor/android
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

##Delete server settings from loveable

<img width="801" height="262" alt="image" src="https://github.com/user-attachments/assets/af415e6f-7130-4261-9ea9-754a793aea80" />


```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f0a1e4f5b23249eba9e2ad1f828043e6',
  appName: 'Workout Timer',
  webDir: 'dist',  
};

export default config;
```
