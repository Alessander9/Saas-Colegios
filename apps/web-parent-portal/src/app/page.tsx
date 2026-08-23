'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@cole/ui-components';
import { checkoutOrder, getActivities, getMyOrders, getMyStudents, getProducts, login } from '../lib/api';

interface ChildReport {
  id: string;
  name: string;
  gradeSection: string;
  code: string;
  attendancePercent: number;
  gpa: number;
  courses: Array<{ name: string; score: number; level: string }>;
  pendingBills: Array<{ concept: string; dueDate: string; amount: number }>;
}

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

interface SchoolActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  price: number;
  vacancies: number;
  requiresConsent: boolean;
}

interface ApiActivity {
  id: string;
  title: string;
  type: string;
  startDate: string;
  location?: string;
  price: number;
  maxCapacity: number;
  _count?: { registrations: number };
  requiresConsent: boolean;
}

interface ApiProduct {
  id: string;
  name: string;
  category?: { name: string };
  variants: Array<{ id: string; price: number; stock: number; name: string }>;
}

interface ApiStudent {
  id: string;
  firstName: string;
  lastName: string;
}

interface ParentOrder {
  id: string;
  code: string;
  status: string;
  totalAmount: number;
  placedAt: string;
}

const CHILDREN: ChildReport[] = [
  {
    id: 'ch1',
    name: 'Mateo García Morales',
    gradeSection: '1er Grado Primaria - Sección A',
    code: 'ALU-2026-001',
    attendancePercent: 100,
    gpa: 18.5,
    courses: [
      { name: 'Álgebra y Aritmética', score: 18.5, level: 'AD (Destacado)' },
      { name: 'Comprensión Lectora', score: 19.0, level: 'AD (Destacado)' },
      { name: 'Ciencia y Ambiente', score: 18.0, level: 'AD (Destacado)' },
    ],
    pendingBills: [
      { concept: 'Pensión Abril 2026', dueDate: '2026-04-30', amount: 350.0 },
    ],
  },
  {
    id: 'ch2',
    name: 'Luciana García Morales',
    gradeSection: 'Nido 5 Años - Aula Azul',
    code: 'ALU-2026-002',
    attendancePercent: 98.0,
    gpa: 19.0,
    courses: [
      { name: 'Psicomotricidad y Coordinación', score: 19.0, level: 'AD (Destacado)' },
      { name: 'Autonomía y Convivencia Temprana', score: 18.5, level: 'AD (Destacado)' },
      { name: 'Lenguaje y Expresión Artística', score: 18.0, level: 'AD (Destacado)' },
    ],
    pendingBills: [],
  },
  {
    id: 'ch3',
    name: 'Sebastián García Morales',
    gradeSection: 'Ciclo Anual Pre-U - Aula Decano',
    code: 'ALU-2026-088',
    attendancePercent: 97.5,
    gpa: 17.8,
    courses: [
      { name: 'Simulacro DECO (100 Preguntas)', score: 18.0, level: 'Puesto #1 (1588.75 pts)' },
      { name: 'Física y Trigonometría Pre-U', score: 17.5, level: 'A (Logrado)' },
      { name: 'Razonamiento Verbal y Matemático', score: 18.5, level: 'AD (Destacado)' },
    ],
    pendingBills: [],
  },
];

const STORE_PRODUCTS: StoreProduct[] = [
  { id: 'p1', name: 'Polo Oficial de Ed. Física (Talla 12)', category: 'Uniformes', price: 45.0, stock: 35, image: '👕' },
  { id: 'p2', name: 'Buzo Completo Institucional (Talla 12)', category: 'Uniformes', price: 120.0, stock: 20, image: '🏃' },
  { id: 'p3', name: 'Pack Cuadernos Institucionales A4 (x5)', category: 'Útiles', price: 35.0, stock: 150, image: '📚' },
  { id: 'p4', name: 'Libro de Matemática 1er Grado 2026', category: 'Libros', price: 85.0, stock: 40, image: '📖' },
];

const SCHOOL_ACTIVITIES: SchoolActivity[] = [
  {
    id: 'act-1',
    title: 'Taller Extracurricular de Robótica Educativa',
    type: 'Taller',
    date: 'Todos los Sábados (Abril - Junio)',
    location: 'Laboratorio STEM (Pabellón B)',
    price: 80.0,
    vacancies: 12,
    requiresConsent: true,
  },
  {
    id: 'act-2',
    title: 'Visita de Estudio a la Granja Villa',
    type: 'Paseo',
    date: 'Viernes 25 de Abril, 08:30 AM',
    location: 'Chorrillos, Lima',
    price: 65.0,
    vacancies: 8,
    requiresConsent: true,
  },
  {
    id: 'act-3',
    title: 'Torneo Interescolar de Ajedrez',
    type: 'Deportivo',
    date: 'Sábado 10 de Mayo, 09:00 AM',
    location: 'Coliseo Deportivo Central',
    price: 0.0,
    vacancies: 20,
    requiresConsent: true,
  },
];

export default function ParentPortalHomePage() {
  const [activeTab, setActiveTab] = useState<'academics' | 'store' | 'activities'>('academics');
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activitySuccess, setActivitySuccess] = useState(false);
  const [email, setEmail] = useState('padre.garcia@email.com');
  const [password, setPassword] = useState('Cole2026!');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activities, setActivities] = useState<SchoolActivity[]>(SCHOOL_ACTIVITIES);
  const [products, setProducts] = useState<StoreProduct[]>(STORE_PRODUCTS);
  const [linkedStudents, setLinkedStudents] = useState<ApiStudent[]>([]);
  const [orders, setOrders] = useState<ParentOrder[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeChild = CHILDREN[selectedChildIndex]!;

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('cole_access_token');
    if (!token) return;
    setAuthenticated(true);
    Promise.all([getActivities<ApiActivity>(), getProducts<ApiProduct>(), getMyStudents<ApiStudent>(), getMyOrders<ParentOrder>()])
      .then(([remoteActivities, remoteProducts, remoteStudents, remoteOrders]) => {
        setLinkedStudents(remoteStudents);
        setOrders(remoteOrders);
        setActivities(remoteActivities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          type: activity.type,
          date: new Date(activity.startDate).toLocaleString('es-PE'),
          location: activity.location || 'Colegio San Cleo',
          price: Number(activity.price),
          vacancies: Math.max(0, activity.maxCapacity - (activity._count?.registrations || 0)),
          requiresConsent: activity.requiresConsent,
        })));
        setProducts(remoteProducts.flatMap((product) => product.variants.map((variant) => ({
          id: variant.id,
          name: `${product.name} (${variant.name})`,
          category: product.category?.name || 'Tienda',
          price: Number(variant.price),
          stock: variant.stock,
          image: '📦',
        }))));
      })
      .catch(() => setApiError('No se pudo cargar el catálogo real del colegio.'));
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setApiError(null);
    try {
      await login(email, password);
      setAuthenticated(true);
    } catch {
      setApiError('Credenciales inválidas o API no disponible.');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        {/* Ambient background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U
              </div>
              <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Acompaña el progreso y la vida escolar de tus hijos
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                Accede en tiempo real a las calificaciones bimestrales, reportes de asistencia, pagos de pensiones y tienda oficial en una plataforma segura y moderna.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 text-lg">
                  📊
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Notas y Logros de Aprendizaje</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Consulta libretas oficiales con escala vigesimal y niveles de logro (AD, A, B).</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0 text-lg">
                  ⏰
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Control de Asistencia Diario</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Notificaciones y reportes de puntualidad e inasistencias en tiempo real.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 text-lg">
                  💳
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pagos de Pensión Seguros</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cancela pensiones y matrículas en línea con emisión de comprobantes digitales.</p>
                </div>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <span className="text-emerald-400 font-bold text-sm">🛡️</span>
              <span>"La alianza entre familia y colegio es el pilar del desarrollo integral del estudiante."</span>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="w-full lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-100/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] p-6 sm:p-9 relative">
              {/* Header inside form */}
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/30">
                    👨‍👩‍👧‍👦
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Colegio San Cleo
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Portal de Padres</h1>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Ingresa con tu correo de apoderado registrado para acceder al expediente escolar.
                </p>
              </div>

              {/* Demo Credentials Quick-Assist */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <span className="text-amber-500 font-bold">⚡ Demo:</span> padre.garcia@email.com
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('padre.garcia@email.com');
                    setPassword('Cole2026!');
                  }}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                >
                  Autocompletar
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Correo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                      type="email"
                      placeholder="padre.garcia@email.com"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Contraseña
                    </label>
                    <span className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer">
                      ¿Olvidaste tu contraseña?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label="Mostrar contraseña"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {apiError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{apiError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">
                  © 2026 Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handlePayBill = () => {
    setPaymentSuccess(true);
  };

  const handleBuyProduct = async (product: StoreProduct) => {
    try {
      await checkoutOrder({
        studentId: linkedStudents[selectedChildIndex]?.id,
        variantId: product.id,
        quantity: 1,
        idempotencyKey: `portal-${product.id}-${activeChild.id}`,
      });
      setOrderSuccess(true);
      setOrders(await getMyOrders<ParentOrder>());
    } catch {
      setApiError('No se pudo completar la compra. Verifica stock y estado de cuenta.');
    }
  };

  const handleRegisterActivity = () => {
    setActivitySuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row text-slate-100">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Institution Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-600/30">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Colegio San Cleo
                </span>
                <h2 className="text-base font-black text-white tracking-tight mt-0.5">Portal Familiar</h2>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>
          </div>

          {/* Family Profile Card in Sidebar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
              FG
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">Familia García Morales</p>
              <p className="text-[11px] text-slate-400 truncate">Apoderado Titular</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400">2 Hijos Matriculados</span>
              </div>
            </div>
          </div>

          {/* Main Navigation Menu */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Módulos Familiares
            </p>

            <button
              onClick={() => {
                setActiveTab('academics');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'academics'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📊</span>
                <span>Notas & Pensiones</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'academics' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeChild.gpa} / 20
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('activities');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'activities'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏕️</span>
                <span>Talleres y Paseos</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'activities' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {activities.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('store');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'store'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🛒</span>
                <span>Tienda Escolar</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'store' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {products.length}
              </span>
            </button>
          </div>

          {/* Child Fast-Selector in Sidebar */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Seleccionar Hijo
            </p>
            <div className="space-y-1">
              {CHILDREN.map((child, idx) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setSelectedChildIndex(idx);
                    setPaymentSuccess(false);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedChildIndex === idx
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{child.name}</p>
                    <p className="text-[10px] text-slate-400">{child.gradeSection}</p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 ml-2">{child.gpa}</span>
                </button>
              ))}
            </div>
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
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Mobile Hamburger Toggle & Title */}
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
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Familia / Apoderado
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Portal de Padres
                </h1>
              </div>
            </div>

            {/* Navigation Tabs in Header for quick access */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={activeTab === 'academics' ? 'primary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab('academics')}
              >
                📊 Notas y Pensiones
              </Button>
              <Button
                variant={activeTab === 'activities' ? 'primary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab('activities')}
              >
                🏕️ Talleres y Paseos
              </Button>
              <Button
                variant={activeTab === 'store' ? 'primary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab('store')}
              >
                🛒 Tienda Escolar
              </Button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Child Selector Pills in Content */}
          {activeTab === 'academics' && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Estudiante:</span>
                <div className="flex flex-wrap gap-2">
                  {CHILDREN.map((child, idx) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setSelectedChildIndex(idx);
                        setPaymentSuccess(false);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        selectedChildIndex === idx
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>👦</span>
                      <span>{child.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Academic View */}
          {activeTab === 'academics' && (
            <>
              {/* Child Summary Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Estudiante Matriculado
                    </span>
                    <h2 className="text-2xl font-black mt-1">{activeChild.name}</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeChild.gradeSection} | Código: <span className="font-mono text-emerald-300 font-bold">{activeChild.code}</span>
                    </p>
                  </div>
                  <div className="flex gap-6 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 font-medium">Promedio Ponderado</p>
                      <p className="text-3xl font-black text-emerald-400">{activeChild.gpa} <span className="text-xs text-slate-400">/ 20</span></p>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-6">
                      <p className="text-[11px] text-slate-400 font-medium">Asistencia</p>
                      <p className="text-3xl font-black text-teal-300">{activeChild.attendancePercent}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm">
                  <span>✓ Pago registrado exitosamente vía pasarela idempotente. Boleta electrónica emitida a su correo.</span>
                  <Button size="sm" variant="outline" onClick={() => setPaymentSuccess(false)}>
                    Cerrar
                  </Button>
                </div>
              )}

              {/* Grid: Academic Report Card & Financial Bills */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Card (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Boleta de Calificaciones — I Bimestre</h3>
                      <p className="text-xs text-slate-500">Notas oficiales publicadas por dirección académica.</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                      Escala 0 - 20
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Asignatura</th>
                          <th className="px-6 py-3.5">Nota Final</th>
                          <th className="px-6 py-3.5">Nivel de Logro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {activeChild.courses.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                            <td className="px-6 py-4 font-black text-emerald-600 text-base">{c.score.toFixed(1)}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                {c.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Obligations (1 col) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">Estado de Cuenta</h3>
                    <p className="text-xs text-slate-500 mb-4">Pensiones y obligaciones escolares.</p>

                    {activeChild.pendingBills.length > 0 && !paymentSuccess ? (
                      <div className="space-y-4">
                        {activeChild.pendingBills.map((bill, i) => (
                          <div key={i} className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-slate-900 text-sm">{bill.concept}</p>
                              <span className="font-black text-emerald-700 text-lg">${bill.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-amber-800 mb-3 font-medium">Vence: {bill.dueDate}</p>
                            <Button variant="primary" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handlePayBill}>
                              💳 Pagar en Línea
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                        <p className="text-3xl">🎉</p>
                        <p className="font-extrabold text-emerald-800 text-sm">Al día en pensiones</p>
                        <p className="text-xs text-emerald-600 font-medium">No registra deudas pendientes de pago.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <button className="text-xs font-bold text-emerald-600 hover:underline">
                      📄 Descargar Historial de Boletas Electrónicas
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Activities & Workshops View */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900">Talleres, Paseos y Actividades Extracurriculares</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inscribe a tu hijo y firma digitalmente la autorización de participación con cargo directo al Núcleo Financiero.
                </p>
              </div>

              {activitySuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm">
                  <span>✓ ¡Inscripción y consentimiento firmado exitosamente! Se emitió el evento ConsentSigned.v1.</span>
                  <Button size="sm" variant="outline" onClick={() => setActivitySuccess(false)}>
                    Cerrar
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {act.type}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{act.vacancies} cupos libres</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-2">{act.title}</h3>
                      <p className="text-xs text-slate-600 mt-2">📍 {act.location}</p>
                      <p className="text-xs text-slate-500 mt-1">🗓️ {act.date}</p>
                      {act.requiresConsent && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl mt-3 font-medium border border-amber-200">
                          ⚠️ Requiere autorización digital de apoderado
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xl font-black text-slate-900">
                        {act.price > 0 ? `$${act.price.toFixed(2)}` : 'Gratuito'}
                      </span>
                      <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleRegisterActivity}>
                        Autorizar e Inscribir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* School Virtual Store */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Tienda Virtual del Colegio San Cleo</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compra uniformes oficiales, útiles y libros con entrega en secretaría o despacho.
                  </p>
                </div>
              </div>

              {orderSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm">
                  <span>✓ ¡Pedido confirmado! Se procesó el cobro en el Núcleo Financiero y se reservó el stock.</span>
                  <Button size="sm" variant="outline" onClick={() => setOrderSuccess(false)}>
                    Cerrar
                  </Button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-extrabold text-slate-900">Mis pedidos</h3>
                <p className="text-xs text-slate-500 mb-4">Historial actualizado desde Commerce.</p>
                {orders.length ? (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm font-medium">
                        <span className="font-mono font-bold text-emerald-600">{order.code}</span>
                        <span className="font-bold">${Number(order.totalAmount).toFixed(2)}</span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">{order.status}</span>
                        <span className="text-xs text-slate-500">{new Date(order.placedAt).toLocaleDateString('es-PE')}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">Aún no tienes pedidos.</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="text-4xl text-center py-4 bg-slate-50 rounded-2xl mb-4">{prod.image}</div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {prod.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">{prod.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Stock disponible: {prod.stock} unids</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900">${prod.price.toFixed(2)}</span>
                      <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleBuyProduct(prod)}>
                        Comprar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
