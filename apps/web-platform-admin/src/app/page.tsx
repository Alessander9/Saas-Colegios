'use client';

import React, { useState } from 'react';
import { Card, Button } from '@cole/ui-components';

interface MockTenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  planName: string;
  studentsCount: number;
  maxStudents: number;
  features: string[];
}

interface MockPlan {
  id: string;
  name: string;
  code: string;
  monthlyPrice: number;
  maxStudents: number;
  maxTeachers: number;
  features: string[];
}

const INITIAL_PLANS: MockPlan[] = [
  {
    id: 'p1',
    name: 'Básico',
    code: 'PLAN_BASIC',
    monthlyPrice: 99,
    maxStudents: 150,
    maxTeachers: 15,
    features: ['academic', 'enrollment', 'notifications'],
  },
  {
    id: 'p2',
    name: 'Profesional',
    code: 'PLAN_PRO',
    monthlyPrice: 199,
    maxStudents: 500,
    maxTeachers: 50,
    features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'],
  },
  {
    id: 'p3',
    name: 'Enterprise',
    code: 'PLAN_ENTERPRISE',
    monthlyPrice: 399,
    maxStudents: 1500,
    maxTeachers: 150,
    features: [
      'academic',
      'enrollment',
      'finance',
      'commerce',
      'activities',
      'hr',
      'payroll',
      'notifications',
      'documents',
      'reporting',
    ],
  },
];

const INITIAL_TENANTS: MockTenant[] = [
  {
    id: 't-1',
    name: 'Colegio San José',
    subdomain: 'sanjose',
    status: 'ACTIVE',
    planName: 'Profesional',
    studentsCount: 380,
    maxStudents: 500,
    features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'],
  },
  {
    id: 't-2',
    name: 'Inmaculada Concepción',
    subdomain: 'inmaculada',
    status: 'ACTIVE',
    planName: 'Enterprise',
    studentsCount: 1120,
    maxStudents: 1500,
    features: [
      'academic',
      'enrollment',
      'finance',
      'commerce',
      'activities',
      'hr',
      'payroll',
      'reporting',
    ],
  },
  {
    id: 't-3',
    name: 'Academia Montessori',
    subdomain: 'montessori',
    status: 'TRIAL',
    planName: 'Básico',
    studentsCount: 45,
    maxStudents: 150,
    features: ['academic', 'enrollment', 'notifications'],
  },
];

export default function PlatformAdminDashboard() {
  const [tenants, setTenants] = useState<MockTenant[]>(INITIAL_TENANTS);
  const [plans] = useState<MockPlan[]>(INITIAL_PLANS);
  const [showModal, setShowModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('p2');

  const totalStudents = tenants.reduce((acc, t) => acc + t.studentsCount, 0);
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;
  const trialTenants = tenants.filter((t) => t.status === 'TRIAL').length;

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newSubdomain) return;

    const plan = plans.find((p) => p.id === selectedPlanId) || plans[1]!;
    const newTenant: MockTenant = {
      id: `t-${Date.now()}`,
      name: newTenantName,
      subdomain: newSubdomain.toLowerCase().trim(),
      status: 'ACTIVE',
      planName: plan.name,
      studentsCount: 0,
      maxStudents: plan.maxStudents,
      features: plan.features,
    };

    setTenants([newTenant, ...tenants]);
    setNewTenantName('');
    setNewSubdomain('');
    setShowModal(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Super Admin Core
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              SaaS Educational Platform
            </h1>
          </div>
          <p className="text-slate-500 mt-1">
            Motor central de multi-tenancy, planes comerciales, suscripciones y control de entitlements.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Crear Nuevo Colegio / Tenant
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card title="Colegios Activos" subtitle="Tenants activos en producción">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-indigo-600">{activeTenants}</p>
            <span className="text-xs text-slate-500 font-medium">({trialTenants} en prueba)</span>
          </div>
        </Card>
        <Card title="Alumnos Totales" subtitle="Suma de matrículas activas">
          <p className="text-3xl font-black text-emerald-600">{totalStudents}</p>
        </Card>
        <Card title="Planes Comerciales" subtitle="Tiers de suscripción activos">
          <p className="text-3xl font-black text-slate-800">{plans.length}</p>
        </Card>
        <Card title="Motor de Entitlements" subtitle="Estado del subsistema">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            🟢 En Línea & Protegido
          </span>
        </Card>
      </div>

      {/* Tenants Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Colegios / Tenants Registrados</h2>
            <p className="text-sm text-slate-500">
              Aislamiento estricto por <code className="text-indigo-600 font-semibold">tenant_id</code> y validación de features en tiempo real.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Institución</th>
                <th className="px-6 py-4">Subdominio</th>
                <th className="px-6 py-4">Plan Activo</th>
                <th className="px-6 py-4">Uso de Alumnos</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Features Habilitadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => {
                const percent = Math.round((t.studentsCount / t.maxStudents) * 100);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {t.subdomain}.cole.app
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {t.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-36">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span>{t.studentsCount} / {t.maxStudents}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'TRIAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {t.features.map((f) => (
                          <span
                            key={f}
                            className="bg-slate-100 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans Catalog Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Catálogo de Planes Comerciales</h2>
        <p className="text-sm text-slate-500 mb-6">
          Definición de features y límites de cuota que alimentan el <code className="text-indigo-600 font-semibold">EntitlementService</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                    {p.code}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">${p.monthlyPrice}</span>
                  <span className="text-slate-500 text-sm font-medium"> / mes</span>
                </div>
                <div className="space-y-2 mb-6 text-xs text-slate-600">
                  <p>👥 Hasta <strong className="text-slate-900">{p.maxStudents}</strong> alumnos</p>
                  <p>👨🏫 Hasta <strong className="text-slate-900">{p.maxTeachers}</strong> docentes</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Módulos Incluidos:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Creating New Tenant */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Registrar Nuevo Colegio</h3>
            <p className="text-xs text-slate-500 mb-6">
              Creará el tenant con aislamiento de datos y suscripción inicial.
            </p>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nombre del Colegio
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Colegio San Agustín"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Subdominio
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="sanagustin"
                    className="w-full px-3 py-2 border border-slate-300 rounded-l-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value)}
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 rounded-r-lg text-xs text-slate-500 font-mono">
                    .cole.app
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Plan Comercial
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.monthlyPrice}/mes - {p.maxStudents} alumnos)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Aprovisionar Tenant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
