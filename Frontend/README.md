# Frontend - ByteBattle

A modern, responsive web application for the ByteBattle coding platform. Built with React 19, Vite, and Tailwind CSS, featuring a Monaco-based code editor for solving programming problems.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 💻 Monaco Editor integration for code editing
- 🔍 Browse and filter coding problems
- 📝 Submit code solutions and view results
- 🎯 Difficulty-based problem categorization
- 📊 Real-time submission evaluation feedback
- ⚔️ **Real-time coding battles** with Socket.IO
- 🔐 **Supabase authentication** for user accounts
- ✍️ **Admin: Create and craft new problems**
- 🔧 **Admin: Modify existing problems**
- 📦 **Admin: Upload and download test case files**
- ✅ **Admin: Publish problems to make them visible**

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Code Editor**: Monaco Editor
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Authentication**: Supabase Auth
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
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_API_TIMEOUT=10000

# Submission Service Configuration
VITE_SUBMISSION_SERVICE_URL=http://localhost:3000/api/v1

# Battle WebSocket Service Configuration
VITE_BATTLE_SOCKET_URL=http://localhost:3101

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Make sure the Problem Service is running on port 3001, Submission Service on port 3000, and BattleWS Service on port 3101 before starting the frontend. You also need to set up a Supabase project for authentication.

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
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Problems.tsx  # Problem listing
│   │   ├── Problem.tsx   # Problem detail & editor
│   │   ├── BattlePage.tsx # Real-time coding battles
│   │   ├── CraftProblem.tsx  # Create new problems (Admin)
│   │   └── ModifyProblem.tsx # Modify & manage problems (Admin)
│   ├── services/         # API service layer
│   │   └── problemService.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useProblems.ts
│   ├── config/           # Configuration
│   │   └── config.ts
│   └── App.tsx           # Main app component
├── public/               # Static assets
├── .env.example          # Environment variables template
└── vite.config.ts        # Vite configuration
```

## Key Features

### 1. Home Page
- Welcoming landing page with gradient design
- Overview of ByteBattle features
- Quick navigation to problem sets
- Feature highlights: Coding Practice, Compete & Win, Community

### 2. Problem Browser
- View all available coding problems
- Filter by difficulty (Easy, Medium, Hard)
- Search problems by title or tags
- Problem statistics (submissions, likes)

### 3. Code Editor & Submission
- Monaco Editor with syntax highlighting
- Multiple language support (Python, JavaScript, Java, C++, Go)
- Auto-save functionality
- Code execution and submission
- Real-time evaluation status
- Test case pass/fail information
- Execution time and memory usage
- Error messages and debugging info

### 4. Real-time Battles
- Challenge other users by email
- Real-time challenge notifications via Socket.IO
- Accept/decline challenges in real-time
- Time-limited competitive coding
- Random problem selection based on difficulty
- Live battle status updates

### 5. Admin: Craft Problem (Create New)
- Create new coding problems with rich form interface
- Set problem metadata: title, difficulty, tags
- Add problem statement with Markdown support
- Define examples with input/output/explanation
- Set constraints, time limits, and memory limits
- Save as draft before publishing

### 6. Admin: Modify Problem
- Edit existing problem details
- **Upload test case files** (JSON format)
- **Download test case files** for review
- **Download test case template** for reference
- **Publish problems** to make them visible to users
- Visual feedback for upload/download/publish operations
- View problem status (published/draft)

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

## Application Routes

The application includes the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with features overview |
| `/problems` | Problems | Browse all available problems |
| `/problem/:problemId` | Problem | Solve a specific problem with code editor |
| `/battle` | BattlePage | Real-time coding battles with other users |
| `/craft-problem` | CraftProblem | Create new problems (Admin) |
| `/problem/modify/:problemSlug` | ModifyProblem | Modify problems and manage test cases (Admin) |

## Admin Features

### Creating Problems (`/craft-problem`)

1. Navigate to `/craft-problem`
2. Fill in the problem details:
   - Title and difficulty level
   - Problem statement (supports Markdown)
   - Examples with input/output/explanation
   - Constraints and limits
   - Topic and company tags
3. Click "Create Problem" to save as draft
4. Problem is created but not yet published

### Managing Problems (`/problem/modify/:slug`)

1. Navigate to a problem's modify page
2. **View problem details** - See all problem information
3. **Upload test cases**:
   - Click "Upload Test Cases"
   - Select a JSON file with test cases
   - Format: `[{ "input": "...", "output": "..." }, ...]`
4. **Download test cases**:
   - Click "Download Test Cases" to get the current test case file
   - Click "Download Template" to get a sample format
5. **Publish problem**:
   - Click "Publish Problem" to make it visible to users
   - Problem status changes from draft to published

### Test Case File Format

```json
[
  {
    "input": "5\n",
    "output": "120\n"
  },
  {
    "input": "3\n",
    "output": "6\n"
  }
]
```

## API Integration

The frontend communicates with backend services through:

### Problem Service API
- Base URL: `${VITE_API_BASE_URL}/problems`
- Endpoints:
  - `GET /problems` - Fetch all problems
  - `GET /problems/:slug` - Fetch problem by slug
  - `POST /problems` - Create a new problem (admin)
  - `PATCH /problems/:slug/publish` - Publish a problem (admin)
  - `POST /testcases/upload/:slug` - Upload test cases (admin)
  - `GET /testcases/download/:slug` - Download test cases (admin)

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
