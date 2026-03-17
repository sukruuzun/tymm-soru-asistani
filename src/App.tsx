import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Brain, FileQuestion, BookOpen, PenTool, CheckSquare, Wand2, ClipboardList } from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import ScenarioBuilder from './pages/ScenarioBuilder';
import QuestionGenerator from './pages/QuestionGenerator';
import QuestionAuditor from './pages/QuestionAuditor';
import CognitiveInterview from './pages/CognitiveInterview';
import QuestionWorkflow from './pages/QuestionWorkflow';
import TestGenerator from './pages/TestGenerator';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {/* Navbar */}
                <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <Link to="/" className="flex-shrink-0 flex items-center">
                                    <Brain className="h-8 w-8 text-indigo-600" />
                                    <span className="ml-2 text-xl font-bold text-slate-900">
                                        TYMM Soru Asistanı
                                    </span>
                                </Link>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <Link
                                        to="/workflow"
                                        className="border-transparent text-indigo-600 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold"
                                    >
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Soru Sihirbazı
                                    </Link>
                                    <Link
                                        to="/test-generator"
                                        className="border-transparent text-slate-500 hover:border-violet-500 hover:text-violet-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        <ClipboardList className="w-4 h-4 mr-2" />
                                        Test Oluşturucu
                                    </Link>
                                    <Link
                                        to="/scenario"
                                        className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Bağlam Üretici
                                    </Link>
                                    <Link
                                        to="/generate"
                                        className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        <PenTool className="w-4 h-4 mr-2" />
                                        Soru Üretici
                                    </Link>
                                    <Link
                                        to="/audit"
                                        className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        <CheckSquare className="w-4 h-4 mr-2" />
                                        Soru Denetmeni
                                    </Link>
                                    <Link
                                        to="/interview"
                                        className="border-transparent text-slate-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        <FileQuestion className="w-4 h-4 mr-2" />
                                        Bilişsel Görüşme
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/workflow" element={<QuestionWorkflow />} />
                        <Route path="/test-generator" element={<TestGenerator />} />
                        <Route path="/scenario" element={<ScenarioBuilder />} />
                        <Route path="/generate" element={<QuestionGenerator />} />
                        <Route path="/audit" element={<QuestionAuditor />} />
                        <Route path="/interview" element={<CognitiveInterview />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
