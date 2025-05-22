# Study App Sidebar

A modern, feature-rich study application built with Next.js, TypeScript, and Supabase. This application provides a comprehensive set of tools and features to enhance your study experience.

## 🚀 Features

- Modern UI with Radix UI components
- Responsive design with Tailwind CSS
- Authentication with Supabase
- Interactive components with Framer Motion
- Form handling with React Hook Form
- Data visualization with Recharts
- Markdown support with KaTeX for mathematical equations
- Toast notifications
- Theme support (light/dark mode)
- Drag and drop functionality
- Time picker components
- And much more!

## 🛠️ Tech Stack

- **Framework:** Next.js 15.2.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database & Auth:** Supabase
- **Form Handling:** React Hook Form
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Markdown:** React Markdown with KaTeX
- **Notifications:** React Hot Toast & Sonner
- **Date/Time Handling:** date-fns, react-datepicker
- **Drag and Drop:** @hello-pangea/dnd

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd studyapp-sidebar
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
├── app/              # Next.js app directory
├── components/       # Reusable UI components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── public/          # Static assets
├── styles/          # Global styles
└── supabase/        # Supabase related configurations
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 