# Destiny 2: The Edge of Fate - Patch Notes Parser

A modern, interactive web application for parsing and analyzing Destiny 2's "The Edge of Fate" expansion patch notes. Built with Next.js, TypeScript, and shadcn/ui components.

## Features

🎯 **Modern Design**: Dark theme with Destiny-inspired color scheme and glassmorphism effects
🔍 **Smart Search**: Real-time search across weapon names, abilities, exotic gear, and change descriptions
🏷️ **Advanced Filtering**: Filter by category (Systems, Weapons, Abilities, Exotics, Armor) and change type (Buffs, Nerfs, Reworks, Changes, New Features)
📊 **Statistics Dashboard**: Visual overview showing counts of different change types
🎨 **Interactive UI**: Responsive design with hover effects, color-coded badges, and smooth transitions
📱 **Mobile Friendly**: Fully responsive design that works on all devices

## Categories Covered

- **Systems**: Major gameplay system overhauls (melee damage rework, champion interactions, etc.)
- **Weapons**: Weapon archetypes and perks (machine guns, glaives, reconstruction, etc.)
- **Exotics**: Exotic weapon changes (Vigilance Wing, Dead Man's Tale, Wicked Implement, etc.)
- **Abilities**: Subclass abilities and fragments (Devour, Suspend, Prismatic changes, etc.)
- **Armor**: Exotic armor pieces across all classes (Dragon's Shadow, Starfire Protocol, etc.)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Data**: JSON-based patch notes with structured change tracking

## Getting Started

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd d2changes
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Data Structure

The patch notes are stored in `public/fatepatch.json` with the following structure:

```json
{
  "systemic_changes": { /* Major system overhauls */ },
  "weapon_archetypes": { /* Weapon type changes */ },
  "weapon_perks": { /* Weapon perk modifications */ },
  "exotic_weapons": { /* Exotic weapon updates */ },
  "abilities": { /* Subclass ability changes */ },
  "exotic_armor": { /* Exotic armor modifications */ }
}
```

Each change entry includes:
- **type**: `buff`, `nerf`, `rework`, `change`, or `new`
- **description**: Detailed explanation with citation references

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

- **PatchNotesParser**: Main component handling data loading, filtering, and display
- **Search & Filters**: Real-time search with category and change type filtering
- **Statistics Cards**: Visual summary of patch changes
- **Change Cards**: Individual cards for each item with color-coded badges

## Deployment

This application can be easily deployed on:

- **Vercel**: Click [here](https://vercel.com/new) to deploy
- **Netlify**: Drag and drop the build folder
- **GitHub Pages**: Configure with GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Data Updates

To update patch notes:
1. Modify `public/fatepatch.json` with new changes
2. Follow the existing structure for consistency
3. Include proper change types and descriptions
4. Add citation references where applicable
