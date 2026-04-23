import { useState } from 'react';
import { Calculator, Plus, Trash2, TrendingUp } from 'lucide-react';

const GRADES = [
  { label: 'O (10)', value: 10 },
  { label: 'A+ (9)', value: 9 },
  { label: 'A (8)',  value: 8 },
  { label: 'B+ (7)', value: 7 },
  { label: 'B (6)',  value: 6 },
  { label: 'C (5)',  value: 5 },
  { label: 'F (0)',  value: 0 },
];

const emptySub = () => ({ name: '', credits: '', grade: 10 });
const emptySem = (n) => ({ label: `Semester ${n}`, subjects: [emptySub()] });

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState([emptySem(1)]);

  function addSem() { setSemesters((s) => [...s, emptySem(s.length + 1)]); }
  function removeSem(si) { setSemesters((s) => s.filter((_, i) => i !== si)); }
  function addSub(si) { setSemesters((s) => s.map((sem, i) => i === si ? { ...sem, subjects: [...sem.subjects, emptySub()] } : sem)); }
  function removeSub(si, sj) { setSemesters((s) => s.map((sem, i) => i === si ? { ...sem, subjects: sem.subjects.filter((_, j) => j !== sj) } : sem)); }
  function updateSub(si, sj, field, val) {
    setSemesters((s) => s.map((sem, i) => i === si ? {
      ...sem, subjects: sem.subjects.map((sub, j) => j === sj ? { ...sub, [field]: val } : sub)
    } : sem));
  }

  function calcSGPA(subjects) {
    const valid = subjects.filter((s) => s.credits && !isNaN(s.credits));
    if (!valid.length) return null;
    const totalCredits = valid.reduce((a, s) => a + Number(s.credits), 0);
    const totalPoints = valid.reduce((a, s) => a + Number(s.credits) * Number(s.grade), 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : null;
  }

  function calcCGPA() {
    const allValid = semesters.flatMap((sem) => sem.subjects.filter((s) => s.credits && !isNaN(s.credits)));
    if (!allValid.length) return null;
    const totalCredits = allValid.reduce((a, s) => a + Number(s.credits), 0);
    const totalPoints = allValid.reduce((a, s) => a + Number(s.credits) * Number(s.grade), 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : null;
  }

  const cgpa = calcCGPA();

  const cgpaColor = !cgpa ? 'text-gray-400' : cgpa >= 9 ? 'text-emerald-600' : cgpa >= 7 ? 'text-blue-600' : cgpa >= 5 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <Calculator className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">CGPA Calculator</h1>
              <p className="text-ink-800 text-sm">Calculate your semester GPA and cumulative GPA.</p>
            </div>
          </div>
          <button onClick={addSem} className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
            <Plus className="h-4 w-4" /> Add Semester
          </button>
        </div>

        {/* CGPA display */}
        <div className="bg-white rounded-2xl border border-parchment-200 shadow-sm p-6 mb-6 text-center">
          <p className="text-sm text-ink-800 mb-1">Your CGPA</p>
          <div className={`text-6xl font-extrabold ${cgpaColor}`}>{cgpa ?? '—'}</div>
          <p className="text-xs text-slate-400 mt-2">
            {!cgpa ? 'Add subjects with credits to calculate' : cgpa >= 9 ? '🏆 Outstanding!' : cgpa >= 7 ? '🌟 Great work!' : cgpa >= 5 ? '📚 Keep going!' : '💪 You can do better!'}
          </p>
        </div>

        <div className="space-y-6">
          {semesters.map((sem, si) => {
            const sgpa = calcSGPA(sem.subjects);
            return (
              <div key={si} className="bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-parchment-50 border-b border-parchment-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-ink-900">{sem.label}</h3>
                    {sgpa && <span className="text-xs font-semibold bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full">SGPA: {sgpa}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addSub(si)} className="text-xs text-accent-primary font-semibold hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> Subject
                    </button>
                    {semesters.length > 1 && (
                      <button onClick={() => removeSem(si)} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {sem.subjects.map((sub, sj) => (
                    <div key={sj} className="flex gap-3 items-center">
                      <input value={sub.name} onChange={(e) => updateSub(si, sj, 'name', e.target.value)}
                        placeholder="Subject name" className="flex-1 border border-parchment-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                      <input value={sub.credits} onChange={(e) => updateSub(si, sj, 'credits', e.target.value)}
                        placeholder="Credits" type="number" min="1" max="6"
                        className="w-20 border border-parchment-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                      <select value={sub.grade} onChange={(e) => updateSub(si, sj, 'grade', Number(e.target.value))}
                        className="w-28 border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary">
                        {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                      {sem.subjects.length > 1 && (
                        <button onClick={() => removeSub(si, sj)} className="text-slate-400 hover:text-rose-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-white rounded-xl border border-parchment-200 p-4">
          <div className="flex items-center gap-2 text-sm text-ink-800">
            <TrendingUp className="h-4 w-4 text-accent-primary" />
            <span>Semester-wise SGPA:</span>
            <div className="flex gap-3 ml-2 flex-wrap">
              {semesters.map((sem, i) => {
                const s = calcSGPA(sem.subjects);
                return s ? <span key={i} className="font-semibold text-accent-primary">Sem {i+1}: {s}</span> : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
