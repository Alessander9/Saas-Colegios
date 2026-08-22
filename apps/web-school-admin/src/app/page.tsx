'use client';

import React, { useState } from 'react';
import { Card, Button } from '@cole/ui-components';

interface CampusItem {
  id: string;
  name: string;
  code: string;
  address: string;
  isMain: boolean;
  classroomsCount: number;
}

interface SectionItem {
  id: string;
  levelName: string;
  gradeName: string;
  sectionName: string;
  code: string;
  studentsEnrolled: number;
  maxCapacity: number;
  classroomName: string;
}

const MOCK_CAMPUSES: CampusItem[] = [
  {
    id: 'c1',
    name: 'Sede Principal - San Isidro',
    code: 'SEDE-01',
    address: 'Av. Las Palmeras 450, Lima',
    isMain: true,
    classroomsCount: 18,
  },
  {
    id: 'c2',
    name: 'Campus Deportivo - La Molina',
    code: 'SEDE-02',
    address: 'Av. Rinconada Alta 120, Lima',
    isMain: false,
    classroomsCount: 8,
  },
];

const MOCK_SECTIONS: SectionItem[] = [
  {
    id: 's1',
    levelName: 'Primaria',
    gradeName: '1er Grado',
    sectionName: 'A',
    code: 'PRI-1-A-2026',
    studentsEnrolled: 26,
    maxCapacity: 30,
    classroomName: 'Aula 101 (Pabellón A)',
  },
  {
    id: 's2',
    levelName: 'Primaria',
    gradeName: '1er Grado',
    sectionName: 'B',
    code: 'PRI-1-B-2026',
    studentsEnrolled: 28,
    maxCapacity: 30,
    classroomName: 'Aula 102 (Pabellón A)',
  },
  {
    id: 's3',
    levelName: 'Secundaria',
    gradeName: '5to Año',
    sectionName: 'A',
    code: 'SEC-5-A-2026',
    studentsEnrolled: 30,
    maxCapacity: 30,
    classroomName: 'Aula 301 (Pabellón B)',
  },
];

export default function SchoolAdminDashboard() {
  const [campuses, setCampuses] = useState<CampusItem[]>(MOCK_CAMPUSES);
  const [sections, setSections] = useState<SectionItem[]>(MOCK_SECTIONS);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newGrade, setNewGrade] = useState('2do Grado Primaria');
  const [newSectionName, setNewSectionName] = useState('');
  const [newCapacity, setNewCapacity] = useState(30);

  const totalEnrolled = sections.reduce((acc, s) => acc + s.studentsEnrolled, 0);
  const totalCapacity = sections.reduce((acc, s) => acc + s.maxCapacity, 0);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName) return;

    const newSec: SectionItem = {
      id: `s-${Date.now()}`,
      levelName: newGrade.includes('Primaria') ? 'Primaria' : 'Secundaria',
      gradeName: newGrade,
      sectionName: newSectionName.toUpperCase().trim(),
      code: `SEC-${newSectionName.toUpperCase().trim()}-2026`,
      studentsEnrolled: 0,
      maxCapacity: Number(newCapacity),
      classroomName: 'Aula por Asignar',
    };

    setSections([...sections, newSec]);
    setNewSectionName('');
    setShowSectionModal(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              School Core
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Colegio San José
            </h1>
          </div>
          <p className="text-slate-500 mt-1">
            Gestión Institucional, Sedes/Campus, Periodos Lectivos y Jerarquía Académica.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">⚙️ Configuración Institucional</Button>
          <Button variant="primary" onClick={() => setShowSectionModal(true)}>
            + Nueva Sección
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card title="Año Lectivo Activo" subtitle="Periodo actual en curso">
          <p className="text-2xl font-black text-indigo-600">2026 (I Bimestre)</p>
        </Card>
        <Card title="Capacidad de Aulas" subtitle="Ocupación de secciones">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-600">{totalEnrolled}</p>
            <span className="text-xs text-slate-500 font-medium">/ {totalCapacity} vacantes</span>
          </div>
        </Card>
        <Card title="Sedes / Campus" subtitle="Infraestructura física">
          <p className="text-3xl font-black text-slate-800">{campuses.length}</p>
        </Card>
        <Card title="Secciones Activas" subtitle="Distribución por aulas">
          <p className="text-3xl font-black text-blue-600">{sections.length}</p>
        </Card>
      </div>

      {/* Sedes / Campuses Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Sedes y Campus Físicos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campuses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                  {c.isMain && (
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">{c.address}</p>
                <p className="text-xs text-slate-700 font-semibold">
                  🏢 {c.classroomsCount} aulas habilitadas
                </p>
              </div>
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold">
                {c.code}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Secciones y Aulas del Año Lectivo 2026</h2>
            <p className="text-sm text-slate-500">
              Estructura Jerárquica: Nivel → Grado → Sección → Aula
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nivel</th>
                <th className="px-6 py-4">Grado</th>
                <th className="px-6 py-4">Sección</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Aula Asignada</th>
                <th className="px-6 py-4">Aforo / Vacantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((s) => {
                const percent = Math.round((s.studentsEnrolled / s.maxCapacity) * 100);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{s.levelName}</td>
                    <td className="px-6 py-4">{s.gradeName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-50 text-indigo-700 font-bold rounded-full text-xs">
                        {s.sectionName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500">{s.code}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">{s.classroomName}</td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span>{s.studentsEnrolled} / {s.maxCapacity}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              percent >= 100 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Section */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Aperturar Nueva Sección</h3>
            <p className="text-xs text-slate-500 mb-6">
              Creará la sección en el año escolar activo vinculada al grado académico.
            </p>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Grado Académico
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                >
                  <option value="1er Grado Primaria">1er Grado Primaria</option>
                  <option value="2do Grado Primaria">2do Grado Primaria</option>
                  <option value="3er Grado Primaria">3er Grado Primaria</option>
                  <option value="1er Año Secundaria">1er Año Secundaria</option>
                  <option value="5to Año Secundaria">5to Año Secundaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nombre de la Sección (ej. A, B, C, Única)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. C"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Aforo Máximo de Vacantes
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={50}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowSectionModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar Sección
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
