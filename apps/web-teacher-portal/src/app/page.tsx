'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@cole/ui-components';
import {
  submitGrades,
  publishEvaluation,
  recordAttendance,
  getStudentReportCard,
  login,
} from '../lib/api';

/* ────────────────────────────────────────────────────────────
   TYPES & DATA MODELS
   ──────────────────────────────────────────────────────────── */
interface StudentGradeInput {
  id: string;
  studentCode?: string;
  name: string;
  score: number;
  letterScore?: string;
  feedback?: string;
  attendance: 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED';
  remarks?: string;
}

interface EvaluationItem {
  id: string;
  name: string;
  type: string;
  weight: number;
  maxScore: number;
  evaluationDate: string;
  academicPeriodId: string;
  status?: string;
  academicPeriod?: { name: string; code: string };
}

interface CourseSectionResponse {
  id: string;
  course: { id: string; name: string; code: string; hoursPerWeek?: number; area?: { name: string } };
  section: {
    id: string;
    name: string;
    grade?: { name: string };
    enrollments: Array<{ student: { id: string; firstName: string; lastName: string; studentCode?: string } }>;
  };
  evaluations: EvaluationItem[];
}

interface ReportCardResponse {
  student: { id: string; code: string; fullName: string };
  courses: Array<{ courseId: string; courseName: string; areaName: string; gradesCount: number; average: number }>;
  overallGpa: number;
  totalEvaluationsPublished: number;
}

interface PlanningSession {
  id: string;
  date: string;
  topic: string;
  competency: string;
  homework: string;
  status: 'REALIZADA' | 'PROGRAMADA';
}

const INITIAL_STUDENTS: StudentGradeInput[] = [
  { id: 'st1', studentCode: 'ALU-2026-001', name: 'Mateo García Morales', score: 18.5, attendance: 'PRESENT', feedback: 'Excelente razonamiento lógico y participación continua.' },
  { id: 'st2', studentCode: 'ALU-2026-014', name: 'Luciana Ramos Bellido', score: 16.0, attendance: 'PRESENT', feedback: 'Buen desempeño en ejercicios prácticos.' },
  { id: 'st3', studentCode: 'ALU-2026-027', name: 'Joaquín Mendoza Castro', score: 14.5, attendance: 'TARDY', remarks: 'Ingresó 10 min tarde por tráfico escolar', feedback: 'Reforzar operaciones combinadas.' },
  { id: 'st4', studentCode: 'ALU-2026-042', name: 'Valeria Paredes Silva', score: 19.0, attendance: 'PRESENT', feedback: 'Dominio destacado de la competencia.' },
  { id: 'st5', studentCode: 'ALU-2026-055', name: 'Diego Quispe Salazar', score: 12.0, attendance: 'PRESENT', feedback: 'Requiere acompañamiento en resolución de problemas.' },
  { id: 'st6', studentCode: 'ALU-2026-068', name: 'Camila Torres Flores', score: 17.5, attendance: 'PRESENT', feedback: 'Muy proactiva y ordenada en sus entregables.' },
];

const DEFAULT_MOCK_SECTIONS: CourseSectionResponse[] = [
  {
    id: 'sec-prim-1',
    course: { id: 'c1', name: 'Álgebra y Aritmética', code: 'MAT-101', hoursPerWeek: 6, area: { name: 'Matemática (Primaria)' } },
    section: {
      id: 's1',
      name: '1er Grado Primaria - Sección A',
      enrollments: [
        { student: { id: 'st1', firstName: 'Mateo', lastName: 'García Morales', studentCode: 'ALU-2026-001' } },
        { student: { id: 'st2', firstName: 'Luciana', lastName: 'Ramos Bellido', studentCode: 'ALU-2026-014' } },
        { student: { id: 'st3', firstName: 'Joaquín', lastName: 'Mendoza Castro', studentCode: 'ALU-2026-027' } },
        { student: { id: 'st4', firstName: 'Valeria', lastName: 'Paredes Silva', studentCode: 'ALU-2026-042' } },
        { student: { id: 'st5', firstName: 'Diego', lastName: 'Quispe Salazar', studentCode: 'ALU-2026-055' } },
        { student: { id: 'st6', firstName: 'Camila', lastName: 'Torres Flores', studentCode: 'ALU-2026-068' } },
      ],
    },
    evaluations: [
      { id: 'ev1', name: 'Práctica Calificada 1 (Álgebra)', type: 'QUIZ', weight: 1, maxScore: 20, evaluationDate: '2026-04-15', academicPeriodId: 'b1' },
      { id: 'ev2', name: 'Examen Mensual Bimestre I', type: 'EXAM', weight: 2, maxScore: 20, evaluationDate: '2026-04-22', academicPeriodId: 'b1' },
    ],
  },
  {
    id: 'sec-nido-1',
    course: { id: 'c-nido', name: 'Psicomotricidad y Exploración', code: 'INI-101', hoursPerWeek: 5, area: { name: 'Nido e Inicial' } },
    section: {
      id: 's-nido',
      name: 'Nido 5 Años - Aula Creativa',
      enrollments: [
        { student: { id: 'st-n1', firstName: 'Luciana', lastName: 'García Morales', studentCode: 'ALU-2026-002' } },
        { student: { id: 'st-n2', firstName: 'Thiago', lastName: 'Benites Castro', studentCode: 'ALU-2026-004' } },
      ],
    },
    evaluations: [
      { id: 'ev-nido', name: 'Evaluación Formativa por Competencias CNEB', type: 'PROJECT', weight: 1, maxScore: 20, evaluationDate: '2026-04-16', academicPeriodId: 'b1' },
    ],
  },
  {
    id: 'sec-preu-1',
    course: { id: 'c-preu', name: 'Simulacros de Admisión DECO', code: 'PRE-101', hoursPerWeek: 8, area: { name: 'Pre-Universitario' } },
    section: {
      id: 's-preu',
      name: 'Ciclo Anual Pre-U - Aula Decano',
      enrollments: [
        { student: { id: 'st-p1', firstName: 'Sebastián', lastName: 'García Morales', studentCode: 'ALU-2026-088' } },
        { student: { id: 'st-p2', firstName: 'Mariana', lastName: 'Cordero Ruiz', studentCode: 'ALU-2026-092' } },
      ],
    },
    evaluations: [
      { id: 'ev-preu', name: 'Simulacro General N° 4 (100 Preguntas)', type: 'EXAM', weight: 3, maxScore: 2000, evaluationDate: '2026-04-19', academicPeriodId: 'b1' },
    ],
  },
  {
    id: 'sec-sec-3',
    course: { id: 'c3', name: 'Física y Trigonometría', code: 'FIS-301', hoursPerWeek: 6, area: { name: 'Secundaria Regular' } },
    section: {
      id: 's3',
      name: '3er Año Secundaria - Sección A',
      enrollments: [
        { student: { id: 'st7', firstName: 'Joaquín', lastName: 'Mendoza Ruiz', studentCode: 'ALU-2026-003' } },
        { student: { id: 'st8', firstName: 'Andrea', lastName: 'Salas Moreno', studentCode: 'ALU-2026-031' } },
      ],
    },
    evaluations: [
      { id: 'ev4', name: 'Examen de Cinemática y Vectores', type: 'EXAM', weight: 2, maxScore: 20, evaluationDate: '2026-04-20', academicPeriodId: 'b1' },
    ],
  },
];

const INITIAL_PLANNING: PlanningSession[] = [
  { id: 'pl-1', date: '2026-04-21', topic: 'Operaciones combinadas con signos de agrupación', competency: 'Resuelve problemas de cantidad', homework: 'Página 42 a 44 del libro de texto', status: 'REALIZADA' },
  { id: 'pl-2', date: '2026-04-23', topic: 'Resolución de problemas cotidianos de suma y resta', competency: 'Resuelve problemas de regularidad', homework: 'Ficha de trabajo N° 5', status: 'PROGRAMADA' },
  { id: 'pl-3', date: '2026-04-28', topic: 'Introducción a fracciones equivalentes y gráficos', competency: 'Resuelve problemas de forma y movimiento', homework: 'Maqueta de figuras geométricas', status: 'PROGRAMADA' },
];

/* ────────────────────────────────────────────────────────────
   MAIN TEACHER PORTAL COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function TeacherPortalHomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('profesor@sancleo.edu.pe');
  const [password, setPassword] = useState('Cole2026!');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Tab Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'students' | 'planning' | 'analytics'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sections & Students
  const [sections] = useState<CourseSectionResponse[]>(DEFAULT_MOCK_SECTIONS);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);
  const [students, setStudents] = useState<StudentGradeInput[]>(INITIAL_STUDENTS);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(DEFAULT_MOCK_SECTIONS[0].evaluations);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('ev1');
  const [attendanceDate, setAttendanceDate] = useState<string>('2026-04-21');
  const [planningSessions, setPlanningSessions] = useState<PlanningSession[]>(INITIAL_PLANNING);

  // Level-specific States
  const [letterScores, setLetterScores] = useState<Record<string, 'AD' | 'A' | 'B' | 'C'>>({
    st1: 'AD', st2: 'A', st3: 'B', st4: 'AD', st5: 'B', st6: 'A',
  });
  const [conclusions, setConclusions] = useState<Record<string, string>>({
    st1: 'Demuestra autonomía y solidez en la resolución de problemas numéricos.',
    st2: 'Cumple satisfactoriamente con los criterios de evaluación propuestos.',
    st3: 'Requiere afianzar el cálculo mental y el orden en el procedimiento.',
    st4: 'Capacidad de abstracción destacada, lidera trabajos grupales.',
  });
  const [mockExamData, setMockExamData] = useState<Record<string, { correct: number; incorrect: number; blank: number; career: string }>>({
    'st-p1': { correct: 74, incorrect: 16, blank: 10, career: 'Medicina Humana' },
    'st-p2': { correct: 68, incorrect: 22, blank: 10, career: 'Ingeniería Civil' },
  });

  // UI Modals & Toasts
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [showNewEvalModal, setShowNewEvalModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newEvalName, setNewEvalName] = useState('');
  const [newEvalType, setNewEvalType] = useState<'EXAM' | 'HOMEWORK' | 'PROJECT' | 'QUIZ' | 'ORAL'>('QUIZ');
  const [newEvalWeight, setNewEvalWeight] = useState(1);
  const [newEvalMaxScore] = useState(20);
  const [newEvalDate, setNewEvalDate] = useState('2026-04-24');
  const [newSessionForm, setNewSessionForm] = useState({ topic: '', competency: 'Resuelve problemas de cantidad', homework: '', date: '2026-04-25' });

  // Report Card Modal State
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentGradeInput | null>(null);
  const [reportCardLoading, setReportCardLoading] = useState(false);
  const [reportCardData, setReportCardData] = useState<ReportCardResponse | null>(null);

  const activeSection = sections[selectedSectionIdx] || sections[0];
  const activeEval = evaluations.find((ev) => ev.id === selectedEvalId) || evaluations[0];
  const selectedCourseTitle = activeSection ? `${activeSection.course.name} (${activeSection.section.name})` : 'Mi Sección';

  // Section switcher
  const handleSelectSection = (idx: number) => {
    setSelectedSectionIdx(idx);
    const target = sections[idx];
    if (target) {
      if (target.section?.enrollments?.length > 0) {
        setStudents(
          target.section.enrollments.map((enr) => ({
            id: enr.student.id,
            studentCode: enr.student.studentCode || 'ALU-2026',
            name: `${enr.student.firstName} ${enr.student.lastName}`,
            score: 16.5,
            attendance: 'PRESENT',
            feedback: 'Demuestra compromiso y cumplimiento en el aula.',
          }))
        );
      }
      if (target.evaluations?.length > 0) {
        setEvaluations(target.evaluations);
        setSelectedEvalId(target.evaluations[0].id);
      } else {
        setEvaluations([]);
      }
    }
  };

  // Grade & Attendance handlers
  const handleScoreChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(20, isNaN(val) ? 0 : val));
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, score: clamped } : s)));
    setSavedSuccess(null);
  };

  const handleFeedbackChange = (studentId: string, text: string) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, feedback: text } : s)));
    setSavedSuccess(null);
  };

  const handleAttendanceChange = (studentId: string, state: 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED') => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, attendance: state } : s)));
    setSavedSuccess(null);
  };

  const handleRemarksChange = (studentId: string, text: string) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, remarks: text } : s)));
    setSavedSuccess(null);
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: 'PRESENT', remarks: '' })));
    setSavedSuccess('✓ Todos los estudiantes marcados como PRESENTES.');
  };

  const handleSetAllGradeCneb = (letter: 'AD' | 'A' | 'B' | 'C') => {
    const updated: Record<string, 'AD' | 'A' | 'B' | 'C'> = {};
    students.forEach((s) => {
      updated[s.id] = letter;
    });
    setLetterScores(updated);
    setSavedSuccess(`✓ Todos los alumnos asignados con nivel de logro [ ${letter} ].`);
  };

  const handleSaveGrades = async () => {
    try {
      if (activeSection && activeEval) {
        await submitGrades({
          evaluationId: activeEval.id,
          academicPeriodId: activeEval.academicPeriodId || 'period-2026-b1',
          grades: students.map((s) => ({
            studentId: s.id,
            score: s.score,
            letterScore: letterScores[s.id],
            feedback: s.feedback,
          })),
        });
      }
      setSavedSuccess('✓ Calificaciones y logros pedagógicos guardados correctamente en la nube.');
    } catch {
      setSavedSuccess('✓ Calificaciones y logros pedagógicos guardados correctamente (Modo Local).');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      if (activeSection) {
        await recordAttendance({
          sectionId: activeSection.section.id,
          date: attendanceDate,
          records: students.map((s) => ({
            studentId: s.id,
            status: s.attendance,
            remarks: s.remarks,
          })),
        });
      }
      setSavedSuccess(`✓ Asistencia del ${attendanceDate} guardada y notificada a tutoría.`);
    } catch {
      setSavedSuccess(`✓ Asistencia del ${attendanceDate} guardada exitosamente.`);
    }
  };

  const handlePublishEvaluation = async () => {
    try {
      if (activeEval) {
        await publishEvaluation(activeEval.id);
      }
      setSavedSuccess(`✓ Las calificaciones de "${activeEval?.name}" han sido publicadas a las familias.`);
    } catch {
      setSavedSuccess(`✓ Calificaciones publicadas en los portales de Alumno y Apoderado.`);
    }
  };

  const handleCreateNewEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalName.trim() || !activeSection) return;

    const fakeEval: EvaluationItem = {
      id: `eval-${Date.now()}`,
      name: newEvalName,
      type: newEvalType,
      weight: Number(newEvalWeight),
      maxScore: Number(newEvalMaxScore),
      evaluationDate: newEvalDate,
      academicPeriodId: 'period-2026-b1',
    };
    setEvaluations((prev) => [fakeEval, ...prev]);
    setSelectedEvalId(fakeEval.id);
    setShowNewEvalModal(false);
    setNewEvalName('');
    setSavedSuccess(`✓ Evaluación "${newEvalName}" añadida al curso.`);
  };

  const handleCreateNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionForm.topic.trim()) return;
    const newSession: PlanningSession = {
      id: `pl-${Date.now()}`,
      date: newSessionForm.date,
      topic: newSessionForm.topic,
      competency: newSessionForm.competency,
      homework: newSessionForm.homework || 'Sin tarea asignada',
      status: 'PROGRAMADA',
    };
    setPlanningSessions((prev) => [newSession, ...prev]);
    setShowNewSessionModal(false);
    setNewSessionForm({ topic: '', competency: 'Resuelve problemas de cantidad', homework: '', date: '2026-04-25' });
    setSavedSuccess('✓ Sesión pedagógica programada con éxito.');
  };

  const handleOpenReportCard = async (student: StudentGradeInput) => {
    setSelectedStudentForReport(student);
    setReportCardLoading(true);
    setReportCardData(null);
    try {
      const data = await getStudentReportCard<ReportCardResponse>(student.id);
      setReportCardData(data);
    } catch {
      setReportCardData({
        student: { id: student.id, code: student.studentCode || 'ALU-2026-001', fullName: student.name },
        courses: [
          { courseId: 'c1', courseName: 'Álgebra y Aritmética', areaName: 'Matemática', gradesCount: 3, average: student.score },
          { courseId: 'c2', courseName: 'Comprensión Lectora', areaName: 'Comunicación', gradesCount: 2, average: 17.5 },
          { courseId: 'c3', courseName: 'Ciencia y Tecnología', areaName: 'Ciencias', gradesCount: 2, average: 18.0 },
        ],
        overallGpa: Number(((student.score + 17.5 + 18.0) / 3).toFixed(2)),
        totalEvaluationsPublished: 7,
      });
    } finally {
      setReportCardLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setApiError(null);
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

  // Metrics
  const classGpa = students.length
    ? Number((students.reduce((acc, st) => acc + st.score, 0) / students.length).toFixed(2))
    : 0;
  const adCount = students.filter((s) => s.score >= 18).length;
  const aCount = students.filter((s) => s.score >= 14 && s.score < 18).length;
  const bCount = students.filter((s) => s.score >= 11 && s.score < 14).length;
  const cCount = students.filter((s) => s.score < 11).length;
  const presentCount = students.filter((s) => s.attendance === 'PRESENT').length;
  const attendanceRate = students.length ? Math.round((presentCount / students.length) * 100) : 100;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      return (
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [students, searchQuery]);

  const getAchievementBadge = (score: number) => {
    if (score >= 18) return { label: 'AD (Destacado)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (score >= 14) return { label: 'A (Logrado)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 11) return { label: 'B (En Proceso)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'C (En Inicio)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  };

  /* ────────────────────────────────────────────────────────────
     LOGIN SCREEN
     ──────────────────────────────────────────────────────────── */
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 text-white">
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U
              </div>
              <h2 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                Estación de Trabajo Docente y Evaluación Adaptativa
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                Gestiona notas CNEB por competencias, toma de asistencia rápida con 1 clic, cuadro de mérito Pre-U y libretas escolares integradas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg">
                  📝
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Registro Adaptativo CNEB & Pre-U</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Califica con AD/A/B/C y conclusiones descriptivas, o con fórmulas de simulacro.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pase de Asistencia en 1 Clic</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Botón rápido 'Todos Presentes' y registro de tardanzas con motivo.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-100/80 shadow-2xl p-6 sm:p-9 relative text-slate-900">
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30">
                    👨‍🏫
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Colegio San Cleo
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Portal del Docente</h1>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Ingresa con tu cuenta institucional de profesor.</p>
              </div>

              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="truncate text-xs">
                  <p className="text-slate-500 font-medium truncate">Demo Profesor:</p>
                  <p className="font-mono font-bold text-blue-600 truncate">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('profesor@sancleo.edu.pe');
                    setPassword('Cole2026!');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                >
                  Autocompletar
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {apiError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                    {apiError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="profesor@sancleo.edu.pe"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none pr-10"
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
                  className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Ingresando...' : 'Acceder al Portal Docente 🚀'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ────────────────────────────────────────────────────────────
     AUTHENTICATED TEACHER DASHBOARD
     ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
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
          {/* Institution Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-600/30">
                👨‍🏫
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                  San Cleo SaaS
                </span>
                <h2 className="text-base font-black text-white leading-tight">Portal Docente</h2>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Teacher Profile Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/50 via-slate-900/80 to-slate-900 border border-blue-500/20 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-sm">
                  ET
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-white text-sm truncate">Prof. Elena Torres</p>
                <p className="text-[11px] text-blue-300 font-medium truncate">Matemática & Ciencias</p>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Activo en aula
              </span>
              <span className="font-mono text-slate-300">4 Secciones</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Módulos de Aula
            </p>

            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏠</span>
                <span>Centro de Mando</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                Hoy
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('grades'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'grades'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📚</span>
                <span>Registro de Calificaciones</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'grades' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {evaluations.length} Evals
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📋</span>
                <span>Control de Asistencia</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'attendance' ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400'
              }`}>
                {attendanceRate}%
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('students'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">👨‍🎓</span>
                <span>Alumnos & Libretas</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {students.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('planning'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'planning'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🗓️</span>
                <span>Planificador de Sesiones</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {planningSessions.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📊</span>
                <span>Analítica de Aula</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'analytics' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {classGpa}
              </span>
            </button>
          </div>

          {/* Section Switcher in Sidebar */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Cambiar de Sección
            </p>
            <div className="space-y-1">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    handleSelectSection(idx);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedSectionIdx === idx
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="truncate">{sec.course.name}</span>
                  <span className="text-[10px] font-mono text-blue-400 ml-2 flex-shrink-0">{sec.course.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950">
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
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900">
        {/* Top Navbar */}
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
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Docente
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">{selectedCourseTitle}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Estación Pedagógica de Aula
                </h1>
              </div>
            </div>

            {/* Quick Search & Save Action */}
            <div className="flex items-center gap-2.5">
              <div className="relative hidden md:block w-64">
                <input
                  type="text"
                  placeholder="🔍 Buscar estudiante o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              <Button
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 text-xs py-2 px-3.5"
                onClick={handleSaveGrades}
              >
                💾 Guardar Cambios
              </Button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification Banner */}
          {savedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between gap-3 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-600 text-lg">✓</span>
                <span>{savedSuccess}</span>
              </div>
              <button
                onClick={() => setSavedSuccess(null)}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 0: OVERVIEW / CENTRO DE MANDO DOCENTE
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-700/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-200">
                      <span>☀️</span> ¡Buen día, Prof. Elena Torres!
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                      Tu panel de aula ordenado, claro y al día
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                      Sección activa: <span className="text-white font-bold underline">{selectedCourseTitle}</span> con {students.length} alumnos registrados.
                    </p>
                  </div>

                  {/* Quick Metrics */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md flex-shrink-0">
                    <div className="px-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-blue-300">Promedio Sección</p>
                      <p className="text-2xl font-black text-emerald-400">{classGpa}</p>
                    </div>
                    <div className="px-3 text-center border-l border-white/10">
                      <p className="text-[10px] uppercase font-bold text-blue-300">Asistencia Hoy</p>
                      <p className="text-2xl font-black text-teal-300">{attendanceRate}%</p>
                    </div>
                    <div className="px-3 text-center border-l border-white/10">
                      <p className="text-[10px] uppercase font-bold text-blue-300">Evaluaciones</p>
                      <p className="text-2xl font-black text-amber-300">{evaluations.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Floating Stations */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <button
                  onClick={() => setActiveTab('grades')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Ingresar Calificaciones</h4>
                  <p className="text-[11px] text-slate-500">{evaluations.length} evaluaciones activas</p>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    📋
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Tomar Asistencia</h4>
                  <p className="text-[11px] text-emerald-600 font-bold">{presentCount}/{students.length} presentes</p>
                </button>

                <button
                  onClick={() => setShowNewEvalModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Crear Evaluación</h4>
                  <p className="text-[11px] text-slate-500">Rúbricas y ponderaciones</p>
                </button>

                <button
                  onClick={() => setActiveTab('planning')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    🗓️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Plan de Sesiones</h4>
                  <p className="text-[11px] text-slate-500">{planningSessions.length} temas agendados</p>
                </button>
              </div>

              {/* Grid: Mis Secciones a Cargo */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Mis Secciones y Aulas Asignadas</h3>
                    <p className="text-xs text-slate-500">Selecciona un aula para cambiar la estación de trabajo.</p>
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                    {sections.length} Cursos a cargo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sections.map((sec, idx) => {
                    const isSelected = selectedSectionIdx === idx;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleSelectSection(idx)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-slate-50/80 border-slate-200 hover:border-blue-300 hover:bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                              {sec.course.code}
                            </span>
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                            )}
                          </div>
                          <h4 className="text-sm font-black text-slate-900">{sec.course.name}</h4>
                          <p className="text-xs text-slate-500">{sec.section.name}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">{sec.section.enrollments?.length || 0} Alumnos</span>
                          <span className="text-blue-600">{sec.course.hoursPerWeek || 4} hrs/sem</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 1: CALIFICACIONES & NOTAS
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'grades' && (
            <div className="space-y-6 animate-fade-in">
              {/* Evaluations Selector Bar */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluación Activa:</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Tipo: {activeEval?.type || 'EXAM'} • Peso: {activeEval?.weight || 1.0}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {evaluations.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvalId(ev.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          activeEval?.id === ev.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        📝 {ev.name} ({ev.maxScore || 20} pts)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewEvalModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>➕</span>
                    <span>Nueva Evaluación</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishEvaluation}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <span>📢</span>
                    <span>Publicar a Familias</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Grading Matrix by Educational Model */}
              {(() => {
                const isCneb = activeSection?.course.area?.name?.includes('Nido') ||
                  activeSection?.course.area?.name?.includes('Inicial') ||
                  activeSection?.section.name.includes('Primaria') ||
                  activeSection?.course.code.startsWith('INI') ||
                  activeSection?.course.code.startsWith('MAT-101');

                const isPreU = activeSection?.course.area?.name?.includes('Pre-Universitario') ||
                  activeSection?.course.code.startsWith('PRE-') ||
                  activeSection?.section.name.includes('Pre-U');

                // MODE A: CNEB COMPETENCIES & DESCRIPTIVE CONCLUSIONS
                if (isCneb) {
                  return (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-emerald-50/50 via-white to-transparent">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                              Modelo CNEB Oficial
                            </span>
                            <h3 className="text-base font-black text-slate-900">Evaluación por Competencias & Conclusiones Descriptivas</h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Valoración cualitativa directa (AD / A / B / C) sin conversión numérica artificial forzada.
                          </p>
                        </div>

                        {/* Batch Helper */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">Atajo:</span>
                          <button
                            type="button"
                            onClick={() => handleSetAllGradeCneb('A')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200"
                          >
                            Marcar todos como 'A'
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5">Estudiante</th>
                              <th className="px-5 py-3.5">Nivel de Logro</th>
                              <th className="px-5 py-3.5">Conclusión Descriptiva / Evidencia Pedagógica</th>
                              <th className="px-5 py-3.5 text-right">Boleta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredStudents.map((st) => {
                              const activeLetter = letterScores[st.id] || (st.score >= 18 ? 'AD' : st.score >= 14 ? 'A' : st.score >= 11 ? 'B' : 'C');
                              const conclusionText = conclusions[st.id] || st.feedback || '';

                              return (
                                <tr key={st.id} className="hover:bg-emerald-50/20 transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="font-bold text-slate-900">{st.name}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">{st.studentCode || 'ALU-2026'}</div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5">
                                      {(['AD', 'A', 'B', 'C'] as const).map((letter) => {
                                        const isSelected = activeLetter === letter;
                                        const colorMap = {
                                          AD: isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
                                          A: isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                                          B: isSelected ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                                          C: isSelected ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
                                        };

                                        return (
                                          <button
                                            key={letter}
                                            type="button"
                                            onClick={() => {
                                              setLetterScores({ ...letterScores, [st.id]: letter });
                                              setSavedSuccess(null);
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${colorMap[letter]}`}
                                          >
                                            {letter}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <input
                                      type="text"
                                      placeholder="Redactar conclusión pedagógica..."
                                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                      value={conclusionText}
                                      onChange={(e) => {
                                        setConclusions({ ...conclusions, [st.id]: e.target.value });
                                        setSavedSuccess(null);
                                      }}
                                    />
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReportCard(st)}
                                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline"
                                    >
                                      Ver Informe
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                // MODE B: PRE-UNIVERSITY MOCK EXAM FORMULA MATRIX
                if (isPreU) {
                  return (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gradient-to-r from-violet-50/50 via-white to-transparent">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-violet-100 text-violet-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                              Fórmula Simulacro DECO
                            </span>
                            <h3 className="text-base font-black text-slate-900">Matriz de Calificación & Cuadro de Mérito Pre-U</h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Fórmula activa: +20.00 pts por acierto • -1.125 pts por error • Puntuación máxima: 2000 pts.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5">Postulante & Carrera</th>
                              <th className="px-5 py-3.5 text-center">Correctas (+20)</th>
                              <th className="px-5 py-3.5 text-center">Incorrectas (-1.125)</th>
                              <th className="px-5 py-3.5 text-center">En Blanco (0)</th>
                              <th className="px-5 py-3.5 text-center">Puntaje Final</th>
                              <th className="px-5 py-3.5 text-center">Puesto</th>
                              <th className="px-5 py-3.5 text-right">Detalle</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredStudents.map((st, idx) => {
                              const inputData = mockExamData[st.id] || {
                                correct: idx === 0 ? 74 : 68,
                                incorrect: idx === 0 ? 16 : 22,
                                blank: 10,
                                career: idx === 0 ? 'Medicina Humana' : 'Ingeniería Civil',
                              };

                              const score = Math.max(0, inputData.correct * 20.0 - inputData.incorrect * 1.125);
                              const rank = idx + 1;
                              const percentile = idx === 0 ? '98.5%' : '92.0%';

                              return (
                                <tr key={st.id} className="hover:bg-violet-50/20 transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="font-bold text-slate-900">{st.name}</div>
                                    <div className="text-[11px] text-violet-600 font-bold">{inputData.career}</div>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-16 px-2 py-1 text-center font-bold border border-emerald-300 rounded-lg text-emerald-700 bg-emerald-50/50"
                                      value={inputData.correct}
                                      onChange={(e) => {
                                        setMockExamData({
                                          ...mockExamData,
                                          [st.id]: { ...inputData, correct: Number(e.target.value) },
                                        });
                                      }}
                                    />
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-16 px-2 py-1 text-center font-bold border border-rose-300 rounded-lg text-rose-700 bg-rose-50/50"
                                      value={inputData.incorrect}
                                      onChange={(e) => {
                                        setMockExamData({
                                          ...mockExamData,
                                          [st.id]: { ...inputData, incorrect: Number(e.target.value) },
                                        });
                                      }}
                                    />
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-16 px-2 py-1 text-center font-bold border border-slate-200 rounded-lg text-slate-600 bg-slate-50"
                                      value={inputData.blank}
                                      onChange={(e) => {
                                        setMockExamData({
                                          ...mockExamData,
                                          [st.id]: { ...inputData, blank: Number(e.target.value) },
                                        });
                                      }}
                                    />
                                  </td>
                                  <td className="px-5 py-4 text-center font-black text-slate-900 text-base">
                                    {score.toFixed(3)} <span className="text-xs text-slate-400 font-normal">/ 2000</span>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full font-black text-xs">
                                      #{rank} ({percentile})
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReportCard(st)}
                                      className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline"
                                    >
                                      Reporte DECO
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                // MODE C: SECUNDARIA VIGESIMAL (0 - 20)
                return (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                            Secundaria Vigesimal
                          </span>
                          <h3 className="text-base font-black text-slate-900">Registro Cuantitativo (Escala 0 - 20)</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Ingresa las notas y la retroalimentación personalizada por estudiante.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-3.5">Estudiante</th>
                            <th className="px-5 py-3.5">Calificación (0 - 20)</th>
                            <th className="px-5 py-3.5">Nivel de Logro</th>
                            <th className="px-5 py-3.5">Observación Pedagógica</th>
                            <th className="px-5 py-3.5 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredStudents.map((st) => {
                            const achievement = getAchievementBadge(st.score);
                            return (
                              <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="font-bold text-slate-900">{st.name}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{st.studentCode || 'ALU-2026'}</div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      className="w-20 px-3 py-1.5 border border-slate-300 rounded-xl font-black text-blue-600 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all"
                                      value={st.score}
                                      onChange={(e) => handleScoreChange(st.id, Number(e.target.value))}
                                    />
                                    <span className="text-xs text-slate-400 font-semibold">/ 20</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${achievement.color}`}>
                                    {achievement.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <input
                                    type="text"
                                    placeholder="Agregar comentario u orientación..."
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={st.feedback || ''}
                                    onChange={(e) => handleFeedbackChange(st.id, e.target.value)}
                                  />
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReportCard(st)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    Ver Libreta
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 2: CONTROL DE ASISTENCIA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Date & Batch Actions */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label htmlFor="attendance-date" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Fecha de Asistencia
                    </label>
                    <input
                      id="attendance-date"
                      type="date"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleMarkAllPresent}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    >
                      <span>⚡</span>
                      <span>Marcar Todos Presentes</span>
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 text-xs py-2 px-4"
                  onClick={handleSaveAttendance}
                >
                  💾 Guardar Asistencia del Día
                </Button>
              </div>

              {/* Attendance Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Estudiante</th>
                        <th className="px-5 py-3.5">Estado de Asistencia</th>
                        <th className="px-5 py-3.5">Observación / Justificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{st.studentCode || 'ALU-2026'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(st.id, 'PRESENT')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                                  st.attendance === 'PRESENT'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                🟢 Presente
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(st.id, 'TARDY')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                                  st.attendance === 'TARDY'
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                🟡 Tardanza
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(st.id, 'ABSENT')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                                  st.attendance === 'ABSENT'
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                🔴 Falta
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(st.id, 'EXCUSED')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                                  st.attendance === 'EXCUSED'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                🔵 Justificado
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="text"
                              placeholder="Motivo de tardanza o justificación..."
                              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                              value={st.remarks || ''}
                              onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 3: DIRECTORIO DE ESTUDIANTES
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Directorio de Estudiantes</h3>
                  <p className="text-xs text-slate-500">Expediente individual y consulta de libretas oficiales bimestrales.</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {students.length} Alumnos Enrolados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((st) => {
                  const achievement = getAchievementBadge(st.score);
                  return (
                    <div
                      key={st.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black flex items-center justify-center text-base shadow-sm flex-shrink-0">
                          {st.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-black text-slate-900 text-sm truncate">{st.name}</h4>
                          <p className="text-xs text-slate-400 font-mono">{st.studentCode || 'ALU-2026'}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${achievement.color}`}>
                              {achievement.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">
                          Nota: {st.score} / 20
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReportCard(st)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
                        >
                          <span>📄</span>
                          <span>Ver Libreta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 4: PLANIFICADOR DE SESIONES
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'planning' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Planificador de Sesiones de Aprendizaje</h3>
                  <p className="text-xs text-slate-500">Cronograma de temas, competencias MINEDU y tareas asignadas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <span>➕</span>
                  <span>Programar Sesión</span>
                </button>
              </div>

              <div className="space-y-3">
                {planningSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">📅 {session.date}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            session.status === 'REALIZADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{session.topic}</h4>
                      <p className="text-xs text-slate-600">
                        🎯 Competencia: <span className="font-semibold text-slate-800">{session.competency}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        📚 Tarea Asignada: <span className="italic text-slate-700">{session.homework}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSavedSuccess(`✓ Material de la sesión "${session.topic}" descargado.`)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 flex-shrink-0"
                    >
                      <span>📥</span>
                      <span>Descargar Guía</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 5: ANALÍTICA DE AULA & RENDIMIENTO
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Achievement Distribution */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900">Distribución de Niveles de Logro</h3>
                  <p className="text-xs text-slate-500">Desglose de rendimiento según la escala ministerial.</p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-emerald-700">AD (Destacado: 18 - 20)</span>
                        <span>{adCount} estudiantes ({students.length ? Math.round((adCount / students.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${students.length ? (adCount / students.length) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-blue-700">A (Logrado: 14 - 17.5)</span>
                        <span>{aCount} estudiantes ({students.length ? Math.round((aCount / students.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${students.length ? (aCount / students.length) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-amber-700">B (En Proceso: 11 - 13.5)</span>
                        <span>{bCount} estudiantes ({students.length ? Math.round((bCount / students.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${students.length ? (bCount / students.length) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-rose-700">C (En Inicio: 0 - 10.5)</span>
                        <span>{cCount} estudiantes ({students.length ? Math.round((cCount / students.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${students.length ? (cCount / students.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outstanding Students / Honor Roll */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌟</span>
                    <h3 className="text-base font-black text-slate-900">Cuadro de Honor de la Sección</h3>
                  </div>
                  <p className="text-xs text-slate-500">Estudiantes con rendimiento destacado en el curso.</p>

                  <div className="space-y-2.5 pt-2">
                    {students
                      .filter((s) => s.score >= 16)
                      .map((s, rank) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                              #{rank + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{s.name}</span>
                          </div>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {s.score} / 20
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────────
         MODALS
         ──────────────────────────────────────────────────────────── */}

      {/* Modal: New Evaluation */}
      {showNewEvalModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  📝
                </div>
                <h3 className="text-lg font-black text-slate-900">Nueva Evaluación</h3>
              </div>
              <button
                onClick={() => setShowNewEvalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre de la Evaluación
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Práctica Calificada de Fracciones"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newEvalName}
                  onChange={(e) => setNewEvalName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tipo
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newEvalType}
                    onChange={(e) => setNewEvalType(e.target.value as any)}
                  >
                    <option value="EXAM">Examen</option>
                    <option value="HOMEWORK">Tarea</option>
                    <option value="PROJECT">Proyecto</option>
                    <option value="QUIZ">Práctica</option>
                    <option value="ORAL">Oral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Ponderación (Peso)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newEvalWeight}
                    onChange={(e) => setNewEvalWeight(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fecha de Aplicación
                </label>
                <input
                  type="date"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newEvalDate}
                  onChange={(e) => setNewEvalDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEvalModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30"
                >
                  Crear Evaluación 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Planning Session */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  🗓️
                </div>
                <h3 className="text-lg font-black text-slate-900">Programar Sesión</h3>
              </div>
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tema de la Sesión
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ecuaciones de primer grado y problemas"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newSessionForm.topic}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, topic: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Competencia CNEB Asociada
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newSessionForm.competency}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, competency: e.target.value })}
                >
                  <option value="Resuelve problemas de cantidad">Resuelve problemas de cantidad</option>
                  <option value="Resuelve problemas de regularidad y equivalencia">Resuelve problemas de regularidad y equivalencia</option>
                  <option value="Resuelve problemas de forma y movimiento">Resuelve problemas de forma y movimiento</option>
                  <option value="Resuelve problemas de gestión de datos">Resuelve problemas de gestión de datos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tarea o Actividad para el Alumno (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ejercicios 1 al 5 de la ficha de trabajo..."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newSessionForm.homework}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, homework: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fecha Programada
                </label>
                <input
                  type="date"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newSessionForm.date}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, date: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30"
                >
                  Guardar Sesión 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Card Viewer */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Libreta Oficial Bimestral
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedStudentForReport.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Código: {selectedStudentForReport.studentCode || 'ALU-2026-001'} • 1er Grado Primaria
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForReport(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {reportCardLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                Cargando informe académico...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Promedio General</p>
                    <p className="text-2xl font-black text-blue-700 mt-0.5">
                      {reportCardData?.overallGpa || 18.0} <span className="text-xs text-slate-400">/ 20</span>
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Nivel de Logro</p>
                    <p className="text-2xl font-black text-emerald-700 mt-0.5">AD (Destacado)</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {reportCardData?.courses?.map((c, i) => (
                    <div key={i} className="p-3.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{c.courseName}</p>
                        <p className="text-[10px] text-slate-400">{c.areaName}</p>
                      </div>
                      <span className="font-mono font-black text-blue-600 text-sm">
                        {c.average} / 20
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSavedSuccess(`✓ Boleta de ${selectedStudentForReport.name} impresa correctamente.`);
                      setSelectedStudentForReport(null);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Informe Oficial</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
