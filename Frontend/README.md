# Frontend - ByteBattle

A modern, responsive web application for the ByteBattle coding platform. Built with React 19, Vite, and Tailwind CSS, featuring a Monaco-based code editor for solving programming problems.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 💻 Monaco Editor integration for code editing
- 🔍 Browse and filter coding problems
- 📝 Submit code solutions and view results
- 🎯 Difficulty-based problem categorization
- 📊 Real-time submission evaluation feedback

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Code Editor**: Monaco Editor
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Local Setup

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Environment Configuration

Create a `.env.development` file in the Frontend directory:

```bash
cp .env.example .env.development
```

Update the environment variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

**Important**: Make sure the Problem Service is running on port 3001 and Submission Service on port 3000 before starting the frontend.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
Frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── LightCodeEditor.tsx
│   │   ├── EvaluationResult.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Problems.tsx  # Problem listing
│   │   ├── Problem.tsx   # Problem detail & editor
│   │   └── ...
│   ├── services/         # API service layer
│   │   ├── problemService.ts
│   │   └── submissionService.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useProblems.ts
│   └── App.tsx           # Main app component
├── public/               # Static assets
├── .env.example          # Environment variables template
└── vite.config.ts        # Vite configuration
```

## Key Features

### 1. Problem Browser
- View all available coding problems
- Filter by difficulty (Easy, Medium, Hard)
- Search problems by title or tags

### 2. Code Editor
- Monaco Editor with syntax highlighting
- Multiple language support (Python, JavaScript, Java, C++, Go)
- Auto-save functionality
- Code execution and submission

### 3. Submission Results
- Real-time evaluation status
- Test case pass/fail information
- Execution time and memory usage
- Error messages and debugging info

## Configuration

### Tailwind CSS

The project uses Tailwind CSS v4 with the Vite plugin. Configuration is managed through:
- `@tailwindcss/vite` plugin in `vite.config.ts`
- Component styling using utility classes

### Path Aliases

TypeScript path alias `@` is configured to point to the `src` directory:

```typescript
import { Button } from "@/components/ui/button";
```

### Monaco Editor

Monaco Editor is integrated via `@monaco-editor/react`. Languages supported:
- Python
- JavaScript
- Java
- C++
- Go

## API Integration

The frontend communicates with backend services through:

### Problem Service API
- Base URL: `${VITE_API_BASE_URL}/problems`
- Endpoints:
  - `GET /problems` - Fetch all problems
  - `GET /problems/:id` - Fetch problem by ID
  - `POST /problems` - Create problem (admin)
  - `POST /problems/:slug/testcases` - Upload testcases (admin)

### Submission Service API
- Base URL: `${VITE_API_BASE_URL}/submissions`
- Endpoints:
  - `POST /submissions` - Submit code solution
  - `GET /submissions/:id` - Get submission result

## Troubleshooting

### Port Already in Use
If port 5173 is occupied:
```bash
# Kill the process using the port (Linux/Mac)
lsof -ti:5173 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3002
```

### API Connection Issues
- Verify backend services are running
- Check `VITE_API_BASE_URL` in `.env.development`
- Check browser console for CORS errors
- Ensure backend services allow `http://localhost:5173` origin

### Build Errors
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

## Development Notes

### Adding UI Components

This project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add [component-name]
```

For more details, see [shadcn/ui with Vite documentation](https://ui.shadcn.com/docs/installation/vite).

### Creating New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Import and use services from `src/services/`

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The production-ready files will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Please ensure your code follows the project's coding standards:
- Run `npm run lint` before committing
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent styling with Tailwind utilities

## License

ISC License
