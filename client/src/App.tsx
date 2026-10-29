import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Plus,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Play,
  BarChart3,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ChevronRight,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import { Difficulty, Quiz, CreateQuizInput } from './types/quiz';

// Fallback initial sample quizzes when backend is not yet started
const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'sample-1',
    title: 'TypeScript & Modern JavaScript Essentials',
    description: 'Test your understanding of TypeScript generics, types, async/await, and ES modules.',
    category: 'Computer Science',
    difficulty: 'medium',
    isPublished: true,
    timeLimitSeconds: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 3 },
    questions: [
      {
        id: 'q1',
        text: 'What does the "never" type represent in TypeScript?',
        options: [
          'A value that is null or undefined',
          'Values that never occur or functions that never return',
          'A type that can be anything',
          'An optional parameter',
        ],
        correctIndex: 1,
        explanation: 'The "never" type represents the type of values that never occur, like a function that throws or has an infinite loop.',
        timeLimitSeconds: 30,
      },
      {
        id: 'q2',
        text: 'Which operator is used for optional chaining in modern JavaScript/TypeScript?',
        options: ['??', '?:', '?.', '||'],
        correctIndex: 2,
        explanation: 'The "?." optional chaining operator allows reading properties located deep within chained objects without validating each reference.',
        timeLimitSeconds: 25,
      },
      {
        id: 'q3',
        text: 'What is the return type of an async function in TypeScript?',
        options: ['void', 'Promise<T>', 'any', 'Async<T>'],
        correctIndex: 1,
        explanation: 'All async functions implicitly return a Promise resolving to the value (Promise<T>).',
        timeLimitSeconds: 20,
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Machine Learning & Neural Networks 101',
    description: 'Core concepts of supervised learning, loss functions, and gradient descent.',
    category: 'Artificial Intelligence',
    difficulty: 'hard',
    isPublished: true,
    timeLimitSeconds: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 2 },
    questions: [
      {
        id: 'q4',
        text: 'What is the primary role of the activation function in a neural network layer?',
        options: [
          'To normalize input batches',
          'To introduce non-linearity into the network',
          'To calculate cross-entropy loss',
          'To initialize weights to zero',
        ],
        correctIndex: 1,
        explanation: 'Without non-linear activation functions, a multilayer neural network collapses mathematically into a single linear transformation.',
        timeLimitSeconds: 30,
      },
      {
        id: 'q5',
        text: 'What phenomenon occurs when a model fits noise in training data too closely?',
        options: ['Underfitting', 'Exploding gradients', 'Overfitting', 'Covariate shift'],
        correctIndex: 2,
        explanation: 'Overfitting happens when a model learns training data patterns and noise too well, reducing generalization performance.',
        timeLimitSeconds: 25,
      },
    ],
  },
];

type ViewMode = 'dashboard' | 'quizzes' | 'ai-generate' | 'create' | 'play';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Filter state for Quizzes list
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium');
  const [aiQuestionCount, setAiQuestionCount] = useState(3);
  const [aiCategory, setAiCategory] = useState('Technology');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Play Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(30);

  // New Quiz Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('medium');
  const [newQuestions, setNewQuestions] = useState<
    Array<{
      text: string;
      options: [string, string, string, string];
      correctIndex: number;
      explanation: string;
      timeLimitSeconds: number;
    }>
  >([
    {
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      timeLimitSeconds: 30,
    },
  ]);

  // Check backend server status & fetch quizzes
  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.quizzes)) {
          setQuizzes(json.data.quizzes);
          setServerOnline(true);
          return;
        }
      }
      setServerOnline(false);
    } catch {
      setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Timer for active quiz question
  useEffect(() => {
    if (currentView !== 'play' || !activeQuiz || quizScore !== null) return;
    const questions = activeQuiz.questions || [];
    const q = questions[currentQuestionIndex];
    if (!q) return;

    setTimerRemaining(q.timeLimitSeconds || 30);
    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setShowExplanation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, currentQuestionIndex, activeQuiz, quizScore]);

  // Handle AI Quiz Generation
  const handleGenerateAIQuiz = async () => {
    if (!aiTopic.trim()) {
      setAiError('Please enter a topic to generate questions.');
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          difficulty: aiDifficulty,
          questionCount: aiQuestionCount,
          category: aiCategory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'AI generation failed');
      }

      const responseData = await res.json();
      const generated = responseData.data;

      const formattedQuiz: Quiz = {
        id: `ai-${Date.now()}`,
        title: generated.title || `${aiTopic} Assessment`,
        description: generated.description || `AI-generated quiz about ${aiTopic}`,
        category: generated.category || aiCategory,
        difficulty: aiDifficulty,
        isPublished: true,
        timeLimitSeconds: (generated.questions?.length || 3) * 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { questions: generated.questions?.length || 0 },
        questions: generated.questions || [],
      };

      setQuizzes((prev) => [formattedQuiz, ...prev]);
      setActiveQuiz(formattedQuiz);
      setCurrentView('quizzes');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reach AI service';
      setAiError(`${message}. (Make sure GEMINI_API_KEY is configured in server/.env)`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Manual Quiz Creation
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const quizPayload: CreateQuizInput = {
      title: newTitle,
      description: newDesc,
      category: newCategory || 'General',
      difficulty: newDifficulty,
      isPublished: true,
      timeLimitSeconds: newQuestions.reduce((acc, q) => acc + (q.timeLimitSeconds || 30), 0),
      questions: newQuestions.filter((q) => q.text.trim().length > 0),
    };

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizPayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setQuizzes((prev) => [json.data, ...prev]);
        }
      } else {
        // Local fallback
        const localQuiz: Quiz = {
          id: `local-${Date.now()}`,
          title: quizPayload.title,
          description: quizPayload.description,
          category: quizPayload.category,
          difficulty: quizPayload.difficulty,
          isPublished: true,
          timeLimitSeconds: quizPayload.timeLimitSeconds || 90,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { questions: quizPayload.questions?.length || 0 },
          questions: quizPayload.questions?.map((q, idx) => ({ ...q, id: `q-${idx}` })),
        };
        setQuizzes((prev) => [localQuiz, ...prev]);
      }

      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewCategory('');
      setCurrentView('quizzes');
    } catch {
      // Local fallback
      const localQuiz: Quiz = {
        id: `local-${Date.now()}`,
        title: quizPayload.title,
        description: quizPayload.description,
        category: quizPayload.category,
        difficulty: quizPayload.difficulty,
        isPublished: true,
        timeLimitSeconds: quizPayload.timeLimitSeconds || 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { questions: quizPayload.questions?.length || 0 },
        questions: quizPayload.questions?.map((q, idx) => ({ ...q, id: `q-${idx}` })),
      };
      setQuizzes((prev) => [localQuiz, ...prev]);
      setCurrentView('quizzes');
    }
  };

  const startPlaying = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizScore(null);
    setCurrentView('play');
  };

  const finishQuiz = () => {
    if (!activeQuiz?.questions) return;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
  };

  const categories = ['all', ...Array.from(new Set(quizzes.map((q) => q.category)))];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesSearch && matchesDiff && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">QuizForge</span>
                <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Intelligent Quiz Platform</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'dashboard'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('quizzes')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'quizzes'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Quizzes</span>
            </button>
            <button
              onClick={() => setCurrentView('ai-generate')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'ai-generate'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/60'
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-300" />
              <span className="font-semibold">AI Generator</span>
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'create'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                serverOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              />
              <span>{serverOnline ? 'Server Online' : 'Local Mode'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-brand-900/60 via-slate-900 to-indigo-950/60 p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <span className="text-brand-400 text-xs font-bold uppercase tracking-wider">Welcome back</span>
                <h1 className="text-3xl font-extrabold text-white mt-1">Supercharge Learning with AI Assessments</h1>
                <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                  Generate complete, multiple-choice quizzes with explanations in seconds using Google Gemini AI, or craft
                  custom tests tailored to your curriculum.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => setCurrentView('ai-generate')}
                    className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate with AI</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('quizzes')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Explore Quizzes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-medium">Total Quizzes</span>
                  <BookOpen className="h-5 w-5 text-brand-400" />
                </div>
                <div className="text-3xl font-bold text-white mt-2">{quizzes.length}</div>
                <span className="text-xs text-slate-500 mt-1 block">Ready for practice</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-medium">Questions Bank</span>
                  <HelpCircle className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white mt-2">
                  {quizzes.reduce((acc, q) => acc + (q.questions?.length || q._count?.questions || 0), 0)}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Curated items</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-medium">Categories</span>
                  <Layers className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white mt-2">
                  {new Set(quizzes.map((q) => q.category)).size}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Distinct subjects</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-medium">AI Generator</span>
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <div className="text-sm font-semibold text-white mt-2">Gemini Flash Ready</div>
                <span className="text-xs text-slate-500 mt-1 block">Instant question crafting</span>
              </div>
            </div>

            {/* Recent Quizzes List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Featured Quizzes</h2>
                <button
                  onClick={() => setCurrentView('quizzes')}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium"
                >
                  View All ({quizzes.length}) <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.slice(0, 3).map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition p-5 rounded-xl flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-brand-300 bg-brand-950 px-2.5 py-0.5 rounded-full border border-brand-800">
                          {quiz.category}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium ${
                            quiz.difficulty === 'easy'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : quiz.difficulty === 'medium'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition line-clamp-1">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {quiz.questions?.length || quiz._count?.questions || 0} Qs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {quiz.timeLimitSeconds}s
                        </span>
                      </div>
                      <button
                        onClick={() => startPlaying(quiz)}
                        className="bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: QUIZZES EXPLORER */}
        {currentView === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Quiz Library</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Browse, filter, and practice with your generated & curated quizzes.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchQuizzes}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
                  title="Reload from server"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setCurrentView('ai-generate')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Generate</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search quizzes by title or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as 'all' | Difficulty)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 capitalize"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quiz Cards Grid */}
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <HelpCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-slate-300 font-semibold text-base">No quizzes found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria or create a brand new quiz using our AI generator.
                </p>
                <button
                  onClick={() => setCurrentView('ai-generate')}
                  className="mt-4 bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Generate Quiz with AI
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition p-5 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-brand-300 bg-brand-950 px-2.5 py-0.5 rounded-full border border-brand-800">
                          {quiz.category}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium ${
                            quiz.difficulty === 'easy'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : quiz.difficulty === 'medium'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{quiz.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {quiz.questions?.length || quiz._count?.questions || 0} Qs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {quiz.timeLimitSeconds}s
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setQuizzes((prev) => prev.filter((item) => item.id !== quiz.id));
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                          title="Delete quiz"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => startPlaying(quiz)}
                          className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 shadow"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start Quiz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: AI GENERATOR */}
        {currentView === 'ai-generate' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Powered by Google Gemini</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">AI Quiz Generator</h1>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Type any subject, concept, or curriculum topic. The AI will synthesize questions, realistic answer
                choices, and clear explanations.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Topic or Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. World War II Diplomacy, Quantum Entanglement, React Hooks, Docker Basics..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Questions Count
                  </label>
                  <select
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    placeholder="General"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {aiError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-semibold block">Generation Error</span>
                    <span>{aiError}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateAIQuiz}
                disabled={isGenerating || !aiTopic.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Questions with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Quiz Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: CREATE MANUAL QUIZ */}
        {currentView === 'create' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Create Custom Quiz</h1>
              <p className="text-xs text-slate-400 mt-1">Design your questions and answer choices manually.</p>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Quiz Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Advanced Operating Systems"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of this assessment..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="w-48">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question list editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Questions ({newQuestions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestions((prev) => [
                        ...prev,
                        {
                          text: '',
                          options: ['', '', '', ''],
                          correctIndex: 0,
                          explanation: '',
                          timeLimitSeconds: 30,
                        },
                      ])
                    }
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-brand-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {newQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-400">Question {qIndex + 1}</span>
                      {newQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewQuestions((prev) => prev.filter((_, idx) => idx !== qIndex))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Enter question text..."
                      value={q.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewQuestions((prev) =>
                          prev.map((item, idx) => (idx === qIndex ? { ...item, text: val } : item))
                        );
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 border rounded-lg p-2 ${
                            q.correctIndex === optIndex ? 'border-brand-500 bg-brand-950/20' : 'border-slate-800 bg-slate-950'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctIndex === optIndex}
                            onChange={() => {
                              setNewQuestions((prev) =>
                                prev.map((item, idx) =>
                                  idx === qIndex ? { ...item, correctIndex: optIndex } : item
                                )
                              );
                            }}
                            className="text-brand-500 focus:ring-0"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            value={opt}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewQuestions((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== qIndex) return item;
                                  const opts = [...item.options] as [string, string, string, string];
                                  opts[optIndex] = val;
                                  return { ...item, options: opts };
                                })
                              );
                            }}
                            className="bg-transparent text-xs text-white w-full focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Educational explanation for why this answer is correct..."
                      value={q.explanation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewQuestions((prev) =>
                          prev.map((item, idx) => (idx === qIndex ? { ...item, explanation: val } : item))
                        );
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('quizzes')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow transition"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 5: PLAY / PRACTICE MODE */}
        {currentView === 'play' && activeQuiz && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-brand-400 font-semibold uppercase">{activeQuiz.category}</span>
                <h2 className="text-xl font-bold text-white">{activeQuiz.title}</h2>
              </div>
              <button
                onClick={() => setCurrentView('quizzes')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700"
              >
                Exit
              </button>
            </div>

            {/* If Quiz is Finished */}
            {quizScore !== null ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                  <Award className="h-8 w-8 text-brand-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Quiz Completed!</h3>
                <p className="text-slate-400 text-sm">
                  You scored <span className="text-white font-bold">{quizScore}</span> out of{' '}
                  <span className="text-white font-bold">{activeQuiz.questions?.length || 0}</span> (
                  {Math.round((quizScore / (activeQuiz.questions?.length || 1)) * 100)}%)
                </p>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => startPlaying(activeQuiz)}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setCurrentView('quizzes')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-xl text-sm font-semibold border border-slate-700 transition"
                  >
                    Back to Quizzes
                  </button>
                </div>
              </div>
            ) : (
              /* Active Question */
              (() => {
                const questions = activeQuiz.questions || [];
                const q = questions[currentQuestionIndex];
                if (!q) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-slate-400">No questions found in this quiz.</p>
                      <button
                        onClick={() => setCurrentView('quizzes')}
                        className="mt-4 text-xs bg-brand-600 text-white px-4 py-2 rounded-lg"
                      >
                        Back
                      </button>
                    </div>
                  );
                }

                const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{timerRemaining}s</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-white leading-snug">{q.text}</h3>

                    <div className="space-y-2.5">
                      {q.options.map((option, optIdx) => {
                        const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                        const isCorrect = q.correctIndex === optIdx;

                        let borderBgStyle = 'border-slate-800 bg-slate-950 hover:border-slate-700';

                        if (hasAnswered || showExplanation) {
                          if (isCorrect) {
                            borderBgStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-200';
                          } else if (isSelected && !isCorrect) {
                            borderBgStyle = 'border-rose-500 bg-rose-950/30 text-rose-200';
                          }
                        } else if (isSelected) {
                          borderBgStyle = 'border-brand-500 bg-brand-950/40 text-brand-200';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={hasAnswered}
                            onClick={() => {
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [currentQuestionIndex]: optIdx,
                              }));
                              setShowExplanation(true);
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition flex items-center justify-between ${borderBgStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{option}</span>
                            </div>
                            {hasAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                            {hasAnswered && isSelected && !isCorrect && (
                              <XCircle className="h-4 w-4 text-rose-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {showExplanation && q.explanation && (
                      <div className="bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-xl text-xs text-indigo-200 leading-relaxed space-y-1">
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" /> Explanation
                        </span>
                        <p>{q.explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          setCurrentQuestionIndex((prev) => prev - 1);
                          setShowExplanation(selectedAnswers[currentQuestionIndex - 1] !== undefined);
                        }}
                        className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition px-3 py-1.5"
                      >
                        Previous
                      </button>

                      {currentQuestionIndex < questions.length - 1 ? (
                        <button
                          onClick={() => {
                            setCurrentQuestionIndex((prev) => prev + 1);
                            setShowExplanation(selectedAnswers[currentQuestionIndex + 1] !== undefined);
                          }}
                          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={finishQuiz}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Submit Assessment</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </main>
    </div>
  );
}
