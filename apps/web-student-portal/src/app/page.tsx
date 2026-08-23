'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@cole/ui-components';
import { login } from '../lib/api';

/* ────────────────────────────────────────────────────────────
   TYPES & MOCK DATA
   ──────────────────────────────────────────────────────────── */
interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  course: string;
  classroom: string;
  teacher: string;
  area: string;
  color: string;
  isNext?: boolean;
}

interface CourseGrade {
  id: string;
  courseName: string;
  area: string;
  teacher: string;
  b1Score: number;
  level: 'AD' | 'A' | 'B' | 'C';
  evaluations: Array<{ name: string; score: number; date: string }>;
  teacherFeedback: string;
}

interface TaskItem {
  id: string;
  title: string;
  course: string;
  teacher: string;
  dueDate: string;
  status: 'PENDIENTE' | 'ENTREGADO' | 'CALIFICADO';
  score?: number;
  instructions: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
}

interface WorkshopItem {
  id: string;
  title: string;
  schedule: string;
  instructor: string;
  category: string;
  enrolled: boolean;
  vacancies: number;
  image: string;
}

interface StudentBadge {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress: string;
  dateUnlocked?: string;
  xp: number;
}

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: 'sch-1', day: 'Lunes', time: '08:00 - 09:30', course: 'Álgebra y Aritmética', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Eduardo Torres', area: 'Matemática', color: 'border-l-indigo-500 bg-indigo-50/40 text-indigo-900', isNext: true },
  { id: 'sch-2', day: 'Lunes', time: '09:45 - 11:15', course: 'Comprensión Lectora y Gramática', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Miguel Ángel Vega', area: 'Comunicación', color: 'border-l-blue-500 bg-blue-50/40 text-blue-900' },
  { id: 'sch-3', day: 'Lunes', time: '11:45 - 13:15', course: 'Educación Física y Deportes', classroom: 'Cancha Polideportiva', teacher: 'Prof. Rodrigo Salazar', area: 'Desarrollo', color: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-900' },
  { id: 'sch-4', day: 'Martes', time: '08:00 - 09:30', course: 'Ciencia y Tecnología', classroom: 'Laboratorio de Ciencias 1', teacher: 'Prof. Carmen Quispe', area: 'Ciencias', color: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-900' },
  { id: 'sch-5', day: 'Martes', time: '09:45 - 11:15', course: 'Personal Social e Historia', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Sandra Rojas', area: 'Sociales', color: 'border-l-amber-500 bg-amber-50/40 text-amber-900' },
  { id: 'sch-6', day: 'Miércoles', time: '08:00 - 09:30', course: 'Álgebra y Aritmética', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Eduardo Torres', area: 'Matemática', color: 'border-l-indigo-500 bg-indigo-50/40 text-indigo-900' },
  { id: 'sch-7', day: 'Miércoles', time: '09:45 - 11:15', course: 'Inglés Comunicativo', classroom: 'Aula de Idiomas', teacher: 'Miss Laura Benites', area: 'Idiomas', color: 'border-l-violet-500 bg-violet-50/40 text-violet-900' },
  { id: 'sch-8', day: 'Jueves', time: '08:00 - 09:30', course: 'Comprensión Lectora y Gramática', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Miguel Ángel Vega', area: 'Comunicación', color: 'border-l-blue-500 bg-blue-50/40 text-blue-900' },
  { id: 'sch-9', day: 'Jueves', time: '09:45 - 11:15', course: 'Ciencia y Tecnología', classroom: 'Laboratorio de Ciencias 1', teacher: 'Prof. Carmen Quispe', area: 'Ciencias', color: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-900' },
  { id: 'sch-10', day: 'Viernes', time: '08:00 - 09:30', course: 'Arte y Expresión Musical', classroom: 'Taller de Arte', teacher: 'Prof. Andrés Morales', area: 'Arte', color: 'border-l-pink-500 bg-pink-50/40 text-pink-900' },
  { id: 'sch-11', day: 'Viernes', time: '09:45 - 11:15', course: 'Tutoría y Convivencia Escolar', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Eduardo Torres', area: 'Tutoría', color: 'border-l-cyan-500 bg-cyan-50/40 text-cyan-900' },
];

const INITIAL_GRADES: CourseGrade[] = [
  {
    id: 'g-1',
    courseName: 'Álgebra y Aritmética',
    area: 'Matemática',
    teacher: 'Prof. Eduardo Torres',
    b1Score: 19,
    level: 'AD',
    evaluations: [
      { name: 'Práctica Calificada 1', score: 20, date: '2026-03-25' },
      { name: 'Examen Mensual', score: 18, date: '2026-04-08' },
      { name: 'Resolución de Problemas y Tareas', score: 19, date: '2026-04-15' },
    ],
    teacherFeedback: 'Excelente capacidad lógica, resuelve problemas complejos con gran autonomía.',
  },
  {
    id: 'g-2',
    courseName: 'Comprensión Lectora y Gramática',
    area: 'Comunicación',
    teacher: 'Prof. Miguel Ángel Vega',
    b1Score: 18,
    level: 'AD',
    evaluations: [
      { name: 'Control de Lectura: El Principito', score: 18, date: '2026-03-28' },
      { name: 'Redacción y Ortografía', score: 19, date: '2026-04-10' },
      { name: 'Exposición Oral', score: 17, date: '2026-04-17' },
    ],
    teacherFeedback: 'Gran vocabulario y fluidez lectora. Muestra mucho entusiasmo en clase.',
  },
  {
    id: 'g-3',
    courseName: 'Ciencia y Tecnología',
    area: 'Ciencias',
    teacher: 'Prof. Carmen Quispe',
    b1Score: 18,
    level: 'AD',
    evaluations: [
      { name: 'Informe de Laboratorio: La Célula', score: 19, date: '2026-04-02' },
      { name: 'Evaluación de Contenidos', score: 17, date: '2026-04-14' },
      { name: 'Feria de Ciencias: Maqueta', score: 19, date: '2026-04-19' },
    ],
    teacherFeedback: 'Muy participativo en los experimentos prácticos de laboratorio.',
  },
  {
    id: 'g-4',
    courseName: 'Educación Física y Deportes',
    area: 'Desarrollo Personal',
    teacher: 'Prof. Rodrigo Salazar',
    b1Score: 20,
    level: 'AD',
    evaluations: [
      { name: 'Acondicionamiento Físico', score: 20, date: '2026-04-05' },
      { name: 'Trabajo en Equipo y Coordinación', score: 20, date: '2026-04-16' },
    ],
    teacherFeedback: 'Destacada coordinación motriz y excelente compañerismo deportivo.',
  },
  {
    id: 'g-5',
    courseName: 'Arte y Música',
    area: 'Arte y Cultura',
    teacher: 'Prof. Andrés Morales',
    b1Score: 18,
    level: 'AD',
    evaluations: [
      { name: 'Proyecto de Dibujo y Color', score: 18, date: '2026-04-06' },
      { name: 'Ejecución de Flauta Dulce', score: 18, date: '2026-04-18' },
    ],
    teacherFeedback: 'Muy creativo y con afinación rítmica precisa.',
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Guía N° 4: Sumas y Restas Combinadas',
    course: 'Álgebra y Aritmética',
    teacher: 'Prof. Eduardo Torres',
    dueDate: '2026-04-26',
    status: 'PENDIENTE',
    priority: 'ALTA',
    instructions: 'Resolver los ejercicios del libro de la página 34 a la 36 en el cuaderno y subir foto clara.',
  },
  {
    id: 'tsk-2',
    title: 'Resumen de Lectura: El Zorro y la Cigüeña',
    course: 'Comprensión Lectora y Gramática',
    teacher: 'Prof. Miguel Ángel Vega',
    dueDate: '2026-04-28',
    status: 'PENDIENTE',
    priority: 'MEDIA',
    instructions: 'Escribir la moraleja del cuento y hacer un dibujo representativo en una carilla.',
  },
  {
    id: 'tsk-3',
    title: 'Informe del Experimento de Fotosíntesis',
    course: 'Ciencia y Tecnología',
    teacher: 'Prof. Carmen Quispe',
    dueDate: '2026-04-20',
    status: 'CALIFICADO',
    priority: 'BAJA',
    score: 19,
    instructions: 'Fotografiar la planta del experimento y anotar las observaciones en la ficha.',
  },
];

const INITIAL_WORKSHOPS: WorkshopItem[] = [
  { id: 'ws-1', title: 'Taller de Robótica & Programación Lego', schedule: 'Miércoles y Viernes 15:30 - 17:00', instructor: 'Ing. Roberto Salas', category: 'Tecnología', enrolled: true, vacancies: 4, image: '🤖' },
  { id: 'ws-2', title: 'Fútbol Menores San Cleo', schedule: 'Martes y Jueves 15:30 - 17:00', instructor: 'Prof. Raúl Huamán', category: 'Deportes', enrolled: false, vacancies: 8, image: '⚽' },
  { id: 'ws-3', title: 'Taller de Pintura y Acuarela Creativa', schedule: 'Sábados 09:00 - 11:00', instructor: 'Prof. Sandra Rojas', category: 'Arte', enrolled: false, vacancies: 6, image: '🎨' },
  { id: 'ws-4', title: 'Club de Ajedrez y Estrategia Escolar', schedule: 'Lunes 15:30 - 17:00', instructor: 'Prof. Carlos Mendoza', category: 'Estrategia', enrolled: false, vacancies: 10, image: '♟️' },
];

const INITIAL_BADGES: StudentBadge[] = [
  { id: 'b-1', title: 'Asistencia Impecable', category: 'Puntualidad', icon: '🏆', description: '100% de asistencia durante el I Bimestre.', unlocked: true, progress: '42/42 días', dateUnlocked: '18 Abr 2026', xp: 150 },
  { id: 'b-2', title: 'Capitán de Matemáticas', category: 'Académico', icon: '🌟', description: 'Nivel AD sostenido en resolución de problemas.', unlocked: true, progress: '100%', dateUnlocked: '15 Abr 2026', xp: 200 },
  { id: 'b-3', title: 'Entregas a Tiempo', category: 'Responsabilidad', icon: '⚡', description: 'Todas las tareas escolares entregadas sin retraso.', unlocked: true, progress: '10/10 tareas', dateUnlocked: '12 Abr 2026', xp: 100 },
  { id: 'b-4', title: 'Lector Estrella', category: 'Comunicación', icon: '📚', description: 'Completar 5 lecturas sugeridas del plan lector.', unlocked: false, progress: '4/5 libros', xp: 120 },
  { id: 'b-5', title: 'Científico Curioso', category: 'Ciencia', icon: '🔬', description: 'Participar activamente en experimentos de laboratorio.', unlocked: false, progress: '2/3 proyectos', xp: 150 },
];

const INITIAL_NOTICES = [
  { id: 'not-1', title: '📢 Materiales para la clase de Ciencia del Jueves', date: '2026-04-21', author: 'Prof. Carmen Quispe', text: 'Recordar traer una lupa pequeña y 2 hojas secas para el taller de observación microscópica.', tag: 'Materiales' },
  { id: 'not-2', title: '🏆 Felicitaciones por el 1er Puesto en Concurso de Cálculo', date: '2026-04-18', author: 'Dirección Académica', text: 'Felicitamos al aula de 1er Grado A por su destacada participación en las Olimpiadas Internas de Matemáticas.', tag: 'Celebración' },
  { id: 'not-3', title: '⚽ Inicio de entrenamientos de fútbol extracurricular', date: '2026-04-15', author: 'Prof. Raúl Huamán', text: 'Los alumnos inscritos deben presentarse con el polo deportivo institucional y zapatillas.', tag: 'Deportes' },
];

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function StudentPortalHomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('alumno@sancleo.edu.pe');
  const [password, setPassword] = useState('Cole2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'grades' | 'tasks' | 'attendance' | 'badges' | 'workshops' | 'notices'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<'TODAS' | 'PENDIENTE' | 'ENTREGADO' | 'CALIFICADO'>('TODAS');

  // Dynamic States
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [badges] = useState<StudentBadge[]>(INITIAL_BADGES);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<CourseGrade | null>(null);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<TaskItem | null>(null);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justificationForm, setJustificationForm] = useState({ date: '2026-04-20', reason: 'Cita Médica Pediátrica', detail: '' });
  const [taskSubmissionNote, setTaskSubmissionNote] = useState('');
  const [reportCardView, setReportCardView] = useState<'cneb' | 'preu' | 'vigesimal'>('cneb');

  const handleStudentLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      setAuthenticated(true);
    } catch {
      // Demo fallback login
      setAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  // Workshop enrollment handler
  const handleToggleWorkshop = (workshop: WorkshopItem) => {
    setWorkshops((curr) =>
      curr.map((w) =>
        w.id === workshop.id
          ? { ...w, enrolled: !w.enrolled, vacancies: w.enrolled ? w.vacancies + 1 : w.vacancies - 1 }
          : w
      )
    );
    setSuccessToast(
      !workshop.enrolled
        ? `✓ ¡Inscripción confirmada en ${workshop.title}! Horario reservado.`
        : `Inscripción cancelada en ${workshop.title}.`
    );
  };

  // Task submit handler
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmit) return;
    setTasks((curr) =>
      curr.map((t) => (t.id === selectedTaskForSubmit.id ? { ...t, status: 'ENTREGADO' } : t))
    );
    setSelectedTaskForSubmit(null);
    setTaskSubmissionNote('');
    setSuccessToast(`✓ Tarea "${selectedTaskForSubmit.title}" entregada con éxito a ${selectedTaskForSubmit.teacher}.`);
  };

  // Justification submit handler
  const handleJustificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowJustificationModal(false);
    setSuccessToast(`✓ Justificación para el ${justificationForm.date} enviada a tutoría y dirección.`);
    setJustificationForm({ date: '2026-04-20', reason: 'Cita Médica Pediátrica', detail: '' });
  };

  // Derived Counts
  const pendingTasksCount = tasks.filter((t) => t.status === 'PENDIENTE').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'CALIFICADO' || t.status === 'ENTREGADO').length;
  const enrolledWorkshopsCount = workshops.filter((w) => w.enrolled).length;
  const totalXp = badges.filter((b) => b.unlocked).reduce((acc, b) => acc + b.xp, 0);

  // Filtered lists
  const filteredSchedule = useMemo(() => {
    return INITIAL_SCHEDULE.filter((item) => {
      const matchesDay = selectedDayFilter === 'Todos' || item.day === selectedDayFilter;
      const matchesSearch = !searchQuery ||
        item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.classroom.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDay && matchesSearch;
    });
  }, [selectedDayFilter, searchQuery]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      const matchesFilter = taskFilter === 'TODAS' || item.status === taskFilter;
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [taskFilter, tasks, searchQuery]);

  /* ────────────────────────────────────────────────────────────
     LOGIN SCREEN
     ──────────────────────────────────────────────────────────── */
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden text-slate-100 font-sans">
        {/* Ambient background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U
              </div>
              <h2 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Tu campus escolar interactivo, ordenado y motivador
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                Consulta tus clases en tiempo real, entrega tus tareas con facilidad, revisa tus logros CNEB y desbloquea medallas de aprendizaje.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 text-lg">
                  🗓️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Horario de Clases y Próxima Sesión</h3>
                  <p className="text-xs text-slate-400 mt-0.5">A qué hora empieza cada materia, qué profesor enseña y en qué aula te toca.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 text-lg">
                  🏆
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Libreta CNEB y Logros Destacados (AD)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sigue tus calificaciones en tiempo real con conclusiones descriptivas claras.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 text-lg">
                  🎮
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gamificación y Medallas de Reconocimiento</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Gana puntos de experiencia (XP) por puntualidad y entrega a tiempo de tus deberes.</p>
                </div>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <span className="text-indigo-400 font-bold text-sm">🎒</span>
              <span>"Aprender con entusiasmo cada día es el camino al éxito personal y académico."</span>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="w-full lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-100/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] p-6 sm:p-9 relative text-slate-900">
              {/* Header inside form */}
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                    🎒
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      Colegio San Cleo
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Campus del Alumno</h1>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Ingresa con tu correo institucional de alumno para consultar tu horario y calificaciones.
                </p>
              </div>

              {/* Demo Credentials Quick-Assist */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg flex-shrink-0">🔑</span>
                  <div className="truncate text-xs">
                    <p className="text-slate-500 font-medium truncate">Demo Alumno:</p>
                    <p className="font-mono font-bold text-indigo-600 truncate">{email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('alumno@sancleo.edu.pe');
                    setPassword('Cole2026!');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex-shrink-0"
                >
                  Autocompletar
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleStudentLogin} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Correo Institucional del Alumno
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumno@sancleo.edu.pe"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Contraseña de Acceso
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar al Campus Escolar</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  ¿Problemas con tu clave? Consulta con tu tutor de aula o en secretaría.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ────────────────────────────────────────────────────────────
     AUTHENTICATED STUDENT DASHBOARD
     ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-950 text-white z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo & School Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                🎒
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                  San Cleo SaaS
                </span>
                <h2 className="text-base font-black text-white leading-tight">Campus Alumno</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Student Profile Quick Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/50 via-slate-900/80 to-slate-900 border border-indigo-500/20 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-base">
                  MG
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-white text-sm truncate">Mateo García</p>
                <p className="text-[11px] text-indigo-300 font-medium">1er Grado Primaria • Aula 101</p>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Nivel Escolar</span>
                <p className="font-bold text-amber-400 flex items-center gap-1">
                  <span>⭐</span> Nivel 5 Explorador
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-medium">Puntos XP</span>
                <p className="font-mono font-bold text-indigo-400">{totalXp} XP</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Mi Espacio Escolar
            </p>

            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏠</span>
                <span>Inicio / Resumen</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                Hoy
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('schedule'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🗓️</span>
                <span>Horario & Clases</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'schedule' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                4 Clases
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('grades'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'grades'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏆</span>
                <span>Libreta & Logros CNEB</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'grades' ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400'
              }`}>
                18.5 AD
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('tasks'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📚</span>
                <span>Mis Tareas</span>
              </div>
              {pendingTasksCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-500 text-slate-950">
                  {pendingTasksCount} por hacer
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⏰</span>
                <span>Asistencia Diaria</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'attendance' ? 'bg-white/20 text-white' : 'bg-slate-800 text-teal-400'
              }`}>
                100%
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('badges'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'badges'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏅</span>
                <span>Medallas & Logros</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {badges.filter((b) => b.unlocked).length} Ganadas
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('workshops'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'workshops'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎨</span>
                <span>Talleres & Clubes</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'workshops' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {enrolledWorkshopsCount} activos
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('notices'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'notices'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">💬</span>
                <span>Avisos del Aula</span>
              </div>
            </button>
          </div>

          {/* Academic Streak Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span>🔥</span> Racha Impecable
              </span>
              <span className="font-mono text-amber-400">15 días</span>
            </div>
            <div className="w-full bg-indigo-900/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-indigo-400 h-full rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-[10px] text-slate-400">Estás a 5 días de la medalla "Mes Perfecto".</p>
          </div>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>Año Lectivo 2026</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              I Bimestre
            </span>
          </div>

          <button
            onClick={() => setAuthenticated(false)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900">
        {/* Top Header with Fast Search */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                aria-label="Abrir menú lateral"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Alumno Activo
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Campus Virtual del Estudiante
                </h1>
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar tareas, materias, profesores o actividades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* User Quick Badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('badges')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <span>🏆</span>
                <span>{totalXp} XP</span>
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                MG
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification Banner */}
          {successToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
              <span className="flex items-center gap-2">
                <span>🎉</span>
                <span>{successToast}</span>
              </span>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-emerald-600 hover:text-emerald-900 font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: OVERVIEW / DASHBOARD INICIO
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Modern Glassmorphic Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200">
                      <span>☀️</span> ¡Buenos días, Mateo!
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                      Listo para un gran día de aprendizaje en San Cleo
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                      Tienes <span className="text-white font-black underline">{pendingTasksCount} tareas por entregar</span> esta semana y tu próxima clase es <span className="text-emerald-300 font-bold">Álgebra en Aula 101</span>.
                    </p>
                  </div>

                  {/* Hero Stats Pill Box */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-black/25 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md flex-shrink-0">
                    <div className="px-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-300">Promedio CNEB</p>
                      <p className="text-2xl font-black text-emerald-400">18.5 AD</p>
                    </div>
                    <div className="px-3 text-center border-l border-white/10">
                      <p className="text-[10px] uppercase font-bold text-indigo-300">Asistencia</p>
                      <p className="text-2xl font-black text-teal-300">100%</p>
                    </div>
                    <div className="px-3 text-center border-l border-white/10">
                      <p className="text-[10px] uppercase font-bold text-indigo-300">Racha</p>
                      <p className="text-2xl font-black text-amber-300">🔥 15d</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    🗓️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Ver Horario</h4>
                  <p className="text-[11px] text-slate-500">4 clases programadas</p>
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    📚
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Entregar Tareas</h4>
                  <p className="text-[11px] text-amber-600 font-bold">{pendingTasksCount} pendientes</p>
                </button>

                <button
                  onClick={() => setActiveTab('grades')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Mi Libreta CNEB</h4>
                  <p className="text-[11px] text-slate-500">Logros y conclusiones</p>
                </button>

                <button
                  onClick={() => setShowJustificationModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    ⏰
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Justificar Falta</h4>
                  <p className="text-[11px] text-slate-500">Mesa de tutoría</p>
                </button>
              </div>

              {/* Grid: Hoy en el Aula & Tareas Urgentes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Schedule Today (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        Agenda de Hoy • Lunes
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">Clases del Día</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Ver Semana Completa →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {INITIAL_SCHEDULE.filter((s) => s.day === 'Lunes').map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                          idx === 0 ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            idx === 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx === 0 ? '▶' : `${idx + 1}`}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{item.course}</h4>
                              {idx === 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md animate-pulse">
                                  En Curso
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.teacher} • <span className="font-semibold text-slate-700">{item.classroom}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                          <span className="font-mono text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Tareas y Deberes Pendientes (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Entregas Pendientes
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">Tareas por Hacer</h3>
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {completedTasksCount}/{tasks.length} Listas
                      </span>
                    </div>

                    <div className="space-y-3">
                      {tasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 hover:border-amber-300 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {t.course}
                            </span>
                            <span className="text-[11px] font-bold text-rose-600">
                              Vence {t.dueDate}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">{t.title}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{t.instructions}</p>

                          <div className="pt-2 border-t border-amber-200/60 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">{t.teacher}</span>
                            <button
                              onClick={() => setSelectedTaskForSubmit(t)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black shadow-sm transition-all"
                            >
                              📤 Entregar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      Ver todas las asignaciones escolares ({tasks.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Badges & Workshops Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Badges Preview */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Mis Medallas & Recompensas</h3>
                      <p className="text-xs text-slate-500">Insignias obtenidas por esfuerzo y puntualidad.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('badges')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Ver todas ({badges.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {badges.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-1.5 hover:border-amber-300 transition-colors"
                      >
                        <div className="text-3xl">{b.icon}</div>
                        <h4 className="text-xs font-black text-slate-900 truncate">{b.title}</h4>
                        <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          +{b.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notices Preview */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Avisos del Aula y Dirección</h3>
                      <p className="text-xs text-slate-500">Comunicaciones recientes de tus profesores.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('notices')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Ver todos ({INITIAL_NOTICES.length}) →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {INITIAL_NOTICES.slice(0, 2).map((n) => (
                      <div key={n.id} className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                            {n.tag}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 1: HORARIO & AGENDA ESCOLAR
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-fade-in">
              {/* Upcoming evaluation banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2 bg-white rounded-xl shadow-sm border border-indigo-100">📌</div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950">Próxima Evaluación: Práctica Calificada de CTA</h3>
                    <p className="text-xs text-indigo-700">Jueves 24 de Abril • 09:45 AM con Prof. Carmen Quispe en Laboratorio 1</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-sm">
                  En 2 días
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Horario de Clases Semanal</h2>
                    <p className="text-xs text-slate-500">1er Grado de Primaria • Sección A • Turno Mañana (08:00 - 13:30)</p>
                  </div>

                  {/* Day filter buttons */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    {['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDayFilter(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedDayFilter === day
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSchedule.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border border-l-4 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors ${item.color}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                            {item.day} • {item.time}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{item.course}</h3>
                          <p className="text-xs text-slate-600">{item.teacher}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-slate-700 font-medium flex items-center gap-1.5">
                          <span className="text-indigo-500">📍</span>
                          {item.classroom}
                        </span>
                        <span className="text-slate-500 font-semibold">{item.area}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 2: LIBRETA & CALIFICACIONES
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'grades' && (
            <div className="space-y-6 animate-fade-in">
              {/* Educational Model Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Vista de Reporte Académico</h3>
                  <p className="text-xs text-slate-800 font-medium">Elige la modalidad para consultar el progreso oficial del estudiante.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setReportCardView('cneb')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      reportCardView === 'cneb'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌱 CNEB (Competencias & Conclusiones)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportCardView('preu')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      reportCardView === 'preu'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🎯 Simulacros Pre-U & Rankings
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportCardView('vigesimal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      reportCardView === 'vigesimal'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📐 Secundaria Vigesimal (0-20)
                  </button>
                </div>
              </div>

              {/* VIEW 1: CNEB COMPETENCIES & DESCRIPTIVE CONCLUSIONS */}
              {reportCardView === 'cneb' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                          Informe de Progreso CNEB
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">Evaluación del Desarrollo de Competencias</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Escala Literal Oficial: AD (Destacado), A (Esperado), B (En Proceso), C (En Inicio).</p>
                    </div>
                    <button
                      onClick={() => setSuccessToast('✓ Informe CNEB descargado en formato oficial.')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <span>📥 Descargar Informe CNEB (PDF)</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Área Curricular</th>
                          <th className="px-6 py-3.5">Competencia Evaluada</th>
                          <th className="px-6 py-3.5 text-center">Nivel de Logro</th>
                          <th className="px-6 py-3.5">Conclusión Descriptiva / Evidencia Pedagógica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Matemática</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Resuelve problemas de cantidad</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                              AD
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "El estudiante demuestra un nivel destacado en la resolución de problemas numéricos, formula hipótesis y argumenta sus procedimientos con solidez."
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Comunicación</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Lee diversos tipos de textos en su lengua materna</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-black text-xs border border-blue-200">
                              A
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "Infiere información relevante a partir del texto leído y explica el propósito comunicativo de la obra literaria."
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Ciencia y Tecnología</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Indaga mediante métodos científicos para construir conocimientos</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                              AD
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "Formula preguntas investigables, diseña estrategias experimentales y sustenta conclusiones con datos empíricos."
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Personal Social</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Convive y participa democráticamente en la búsqueda del bien común</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                              AD
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "Muestra empatía, liderazgo colaborativo y respeto continuo por las normas de convivencia del aula."
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: PRE-UNIVERSITY MOCK EXAMS & ADMISSION LEADERBOARD */}
              {reportCardView === 'preu' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card title="Puesto en Ranking General" subtitle="Ciclo Anual Pre-U 2026">
                      <p className="text-3xl font-black text-violet-600">#1 <span className="text-xs text-slate-400 font-semibold">de 420 postulantes</span></p>
                    </Card>
                    <Card title="Puntaje Último Simulacro" subtitle="DECO 100 Preguntas (UNMSM)">
                      <p className="text-3xl font-black text-emerald-600">1588.75 <span className="text-xs text-slate-400 font-semibold">/ 2000 pts</span></p>
                    </Card>
                    <Card title="Percentil Académico" subtitle="Área de Ciencias e Ingeniería">
                      <p className="text-3xl font-black text-indigo-600">98.5%</p>
                    </Card>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-violet-50/30">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Historial de Simulacros de Admisión</h2>
                        <p className="text-xs text-slate-500">Fórmula San Marcos / UNI: +20 por acierto • -1.125 por error • 0 en blanco.</p>
                      </div>
                      <button
                        onClick={() => setSuccessToast('✓ Cuadro de mérito descargado en Excel.')}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                      >
                        <span>📥 Exportar Resultados (Excel)</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3.5">Simulacro</th>
                            <th className="px-6 py-3.5">Fecha</th>
                            <th className="px-6 py-3.5 text-center">Correctas</th>
                            <th className="px-6 py-3.5 text-center">Incorrectas</th>
                            <th className="px-6 py-3.5 text-center">En Blanco</th>
                            <th className="px-6 py-3.5 text-center">Puntaje Final</th>
                            <th className="px-6 py-3.5 text-center">Puesto</th>
                            <th className="px-6 py-3.5 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr>
                            <td className="px-6 py-4 font-bold text-slate-900">Simulacro Dominical N° 4 (DECO General)</td>
                            <td className="px-6 py-4 text-xs text-slate-500">19 Abr 2026</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-600">82</td>
                            <td className="px-6 py-4 text-center font-bold text-rose-600">10</td>
                            <td className="px-6 py-4 text-center text-slate-400">8</td>
                            <td className="px-6 py-4 text-center font-black text-slate-900 text-base">1588.75</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full font-black text-xs">
                                #1 (98.5%)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                                ✓ Vacante Asegurada
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: SECUNDARIA VIGESIMAL (0 - 20) */}
              {reportCardView === 'vigesimal' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Libreta Oficial de Calificaciones</h2>
                      <p className="text-xs text-slate-500">Año Lectivo 2026 • I Bimestre • Escala Oficial Vigesimal (0 a 20)</p>
                    </div>
                    <button
                      onClick={() => setSuccessToast('✓ Libreta oficial generada en formato imprimible.')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <span>📥 Descargar Boleta Oficial (PDF)</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Asignatura</th>
                          <th className="px-6 py-3.5">Área Curricular</th>
                          <th className="px-6 py-3.5">Docente</th>
                          <th className="px-6 py-3.5">Nota Bimestre I</th>
                          <th className="px-6 py-3.5">Nivel de Logro</th>
                          <th className="px-6 py-3.5 text-right">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {INITIAL_GRADES.map((course) => (
                          <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{course.courseName}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{course.area}</td>
                            <td className="px-6 py-4 text-xs text-slate-700">{course.teacher}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-black text-indigo-700 text-base">{course.b1Score}</span>
                              <span className="text-xs text-slate-400"> / 20</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                🌟 Logro Destacado ({course.level})
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedCourseForDetail(course)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                              >
                                🔍 Ver Evaluaciones
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 3: TAREAS & GUÍAS DE TRABAJO
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Bandeja de Tareas y Asignaciones</h2>
                    <p className="text-xs text-slate-500">Envía tus entregables y revisa las observaciones de tus profesores.</p>
                  </div>

                  {/* Task status filter */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    {(['TODAS', 'PENDIENTE', 'ENTREGADO', 'CALIFICADO'] as const).map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setTaskFilter(filterKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          taskFilter === filterKey
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filterKey === 'TODAS' ? 'Todas' : filterKey === 'PENDIENTE' ? 'Pendientes' : filterKey === 'ENTREGADO' ? 'Entregadas' : 'Calificadas'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {t.course}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t.status === 'PENDIENTE'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : t.status === 'ENTREGADO'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3">{t.instructions}</p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>📅 Límite: {t.dueDate}</span>
                          <span className="font-semibold text-slate-700">{t.teacher}</span>
                        </div>

                        {t.status === 'PENDIENTE' ? (
                          <button
                            onClick={() => setSelectedTaskForSubmit(t)}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>📤 Subir Tarea</span>
                          </button>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 text-center text-xs font-bold text-slate-600">
                            {t.score ? `✓ Calificación: ${t.score} / 20` : '✓ Entregado a tiempo'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 4: ASISTENCIA DIARIA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Asistencia Global" subtitle="I Bimestre 2026">
                  <p className="text-3xl font-black text-emerald-600">100%</p>
                </Card>
                <Card title="Días Asistidos" subtitle="Total del periodo">
                  <p className="text-3xl font-black text-indigo-600">42 Días</p>
                </Card>
                <Card title="Tardanzas / Faltas" subtitle="Sin incidencias">
                  <p className="text-3xl font-black text-slate-700">0 Registros</p>
                </Card>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Control de Puntualidad y Asistencia</h2>
                    <p className="text-xs text-slate-500">Registro biométrico y de tutoría de aula.</p>
                  </div>
                  <button
                    onClick={() => setShowJustificationModal(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                  >
                    <span>📝 Justificar Inasistencia</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Fecha</th>
                        <th className="px-6 py-3.5">Hora de Ingreso</th>
                        <th className="px-6 py-3.5">Estado</th>
                        <th className="px-6 py-3.5">Observación del Tutor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Lunes 21 de Abril, 2026</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">07:48 AM</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            ✓ PRESENTE A TIEMPO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Ingreso regular por puerta principal.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Viernes 18 de Abril, 2026</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">07:50 AM</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            ✓ PRESENTE A TIEMPO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Participación en formación cívica.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Jueves 17 de Abril, 2026</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">07:45 AM</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            ✓ PRESENTE A TIEMPO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Ingreso puntual.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 5: MEDALLAS & LOGROS (GAMIFICACIÓN)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'badges' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-bold">
                    <span>🌟</span> Sistema de Logros Escolares
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">Nivel 5: Explorador Destacado</h2>
                  <p className="text-xs text-amber-100">Has ganado {totalXp} puntos XP y 3 medallas de honor en San Cleo.</p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/20 text-center flex-shrink-0">
                  <p className="text-[10px] uppercase font-bold text-amber-200">Próximo Nivel (Nivel 6)</p>
                  <p className="text-2xl font-black">{totalXp} / 600 XP</p>
                  <div className="w-32 bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      b.unlocked
                        ? 'bg-white border-amber-200 shadow-sm hover:shadow-md'
                        : 'bg-slate-100/70 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-4xl p-3 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm">
                        {b.icon}
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          b.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {b.unlocked ? '✓ Desbloqueada' : '🔒 En Progreso'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1">
                      <h4 className="text-base font-black text-slate-900">{b.title}</h4>
                      <p className="text-xs text-slate-500">{b.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 font-medium">Progreso: {b.progress}</span>
                      <span className="text-amber-600">+{b.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 6: TALLERES & CLUBES EXTRACURRICULARES
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'workshops' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Talleres y Actividades Extracurriculares</h2>
                    <p className="text-xs text-slate-500">Inscríbete libremente en robótica, deportes, arte y clubes de ajedrez.</p>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                    {enrolledWorkshopsCount} talleres activos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workshops.map((w) => (
                    <div
                      key={w.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                        w.enrolled ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{w.image}</span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              w.enrolled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {w.enrolled ? '✓ Inscrito' : `${w.vacancies} vacantes`}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{w.title}</h3>
                        <p className="text-xs text-slate-600">🗓️ {w.schedule}</p>
                        <p className="text-xs text-slate-500">👨‍🏫 Instructor: {w.instructor}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleWorkshop(w)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                          w.enrolled
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {w.enrolled ? 'Cancelar Inscripción' : 'Inscribirme en este Taller'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 7: AVISOS DEL AULA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Mural de Avisos y Comunicados Oficiales</h2>
                  <p className="text-xs text-slate-500">Noticias pedagógicas y anuncios de dirección y profesores.</p>
                </div>

                <div className="space-y-4">
                  {INITIAL_NOTICES.map((n) => (
                    <div key={n.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md">
                          {n.tag}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{n.date}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900">{n.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.text}</p>
                      <p className="text-[11px] font-semibold text-slate-400 pt-1">Publicado por: {n.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────────
         MODALS
         ──────────────────────────────────────────────────────────── */}

      {/* Task Submission Modal */}
      {selectedTaskForSubmit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedTaskForSubmit.course}
                </span>
                <h3 className="text-lg font-black mt-1">{selectedTaskForSubmit.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForSubmit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">Instrucciones del Docente ({selectedTaskForSubmit.teacher}):</p>
              <p>{selectedTaskForSubmit.instructions}</p>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Adjuntar Archivo o Foto del Cuaderno
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 cursor-pointer bg-slate-50 transition-colors">
                  <span className="text-3xl block mb-1">📁</span>
                  <p className="text-xs font-bold text-slate-700">Arrastra tu archivo PDF, Word o foto aquí</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tamaño máximo: 25 MB</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nota o Comentario para el Profesor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Profesor, adjunto el desarrollo de los 10 ejercicios..."
                  value={taskSubmissionNote}
                  onChange={(e) => setTaskSubmissionNote(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForSubmit(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30"
                >
                  Confirmar Entrega 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Justification Modal */}
      {showJustificationModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                  Tutoría & Asistencia
                </span>
                <h3 className="text-lg font-black mt-1">Justificación de Inasistencia o Tardanza</h3>
              </div>
              <button
                onClick={() => setShowJustificationModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJustificationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fecha de Inasistencia
                </label>
                <input
                  type="date"
                  required
                  value={justificationForm.date}
                  onChange={(e) => setJustificationForm({ ...justificationForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Motivo Principal
                </label>
                <select
                  value={justificationForm.reason}
                  onChange={(e) => setJustificationForm({ ...justificationForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                >
                  <option value="Cita Médica Pediátrica">Cita Médica / Salud</option>
                  <option value="Motivos Familiares de Fuerza Mayor">Motivos Familiares</option>
                  <option value="Competencia Deportiva Institucional">Representación Escolar</option>
                  <option value="Problemas de Transporte">Problemas de Transporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Explicación o Detalle
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detallar el motivo y adjuntar certificado si aplica..."
                  value={justificationForm.detail}
                  onChange={(e) => setJustificationForm({ ...justificationForm, detail: e.target.value })}
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJustificationModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30"
                >
                  Enviar Justificación 📨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Grade Details Modal */}
      {selectedCourseForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedCourseForDetail.area}
                </span>
                <h3 className="text-lg font-black mt-1">{selectedCourseForDetail.courseName}</h3>
                <p className="text-xs text-slate-500">Docente: {selectedCourseForDetail.teacher}</p>
              </div>
              <button
                onClick={() => setSelectedCourseForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Nota Bimestre I</p>
                <p className="text-2xl font-black text-indigo-600">{selectedCourseForDetail.b1Score} / 20</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                Logro Destacado ({selectedCourseForDetail.level})
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Desglose de Evaluaciones</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {selectedCourseForDetail.evaluations.map((ev, i) => (
                  <div key={i} className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{ev.name}</p>
                      <p className="text-[10px] text-slate-400">{ev.date}</p>
                    </div>
                    <span className="font-mono font-black text-indigo-700">{ev.score} / 20</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-0.5">Comentario del Docente:</p>
              <p className="italic">"{selectedCourseForDetail.teacherFeedback}"</p>
            </div>

            <button
              onClick={() => setSelectedCourseForDetail(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
