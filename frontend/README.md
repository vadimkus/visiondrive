# Vision Drive Frontend

Professional, minimalistic website for Vision Drive Technologies FZ-LLC - Smart Parking Solutions.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

## Features

- ✅ Responsive design (mobile-first)
- ✅ Professional, minimalistic design
- ✅ Smooth animations and transitions
- ✅ SEO optimized
- ✅ Accessible components
- ✅ Type-safe with TypeScript

## Pages

- **Home** (`/`) - Hero, value proposition, how it works, featured clients
- **Solutions** (`/solutions`) - Technology solutions for communities, municipalities, and RTA
- **The App** (`/app`) - App features, benefits, screenshots, download
- **Data & Analytics** (`/data-analytics`) - B2B data products and analytics
- **About Us** (`/about`) - Vision, mission, compliance, milestones
- **Contact** (`/contact`) - Contact forms and information

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The frontend will run on `http://localhost:3001`

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── solutions/    # Solutions page
│   │   ├── app/          # App page
│   │   ├── data-analytics/ # Analytics page
│   │   ├── about/        # About page
│   │   └── contact/      # Contact page
│   ├── components/
│   │   ├── layout/       # Header, Footer
│   │   ├── common/       # Reusable components
│   │   └── sections/     # Page sections
│   └── assets/          # Images, icons, videos
├── public/              # Static assets
└── package.json
```

## Design System

### Colors

- **Primary**: Blue (`primary-600`)
- **Gray Scale**: Professional grays for text and backgrounds
- **Accent**: Used sparingly for CTAs and highlights

### Typography

- **Font**: Inter (system fallback)
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, comfortable line-height

### Components

- **Button**: Primary, secondary, outline variants
- **Section**: Consistent spacing and backgrounds
- **Container**: Max-width containers for content

## Best Practices

- Minimalistic design with ample white space
- Clear visual hierarchy
- Consistent spacing and typography
- Mobile-first responsive design
- Accessible components (ARIA labels, semantic HTML)
- Performance optimized (lazy loading, code splitting)

## Environment Variables

Create a `.env.local` file for environment-specific variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## License

MIT

