// ─────────────────────────────────────────────────────────────────────────────
// gradingUtils.js
// Pure grading logic aligned with sms_db `student_grades` columns.
// ─────────────────────────────────────────────────────────────────────────────

export const getTeacherLevel = (classInfo) => {
  // Default kapag naglo-load pa ang data
  if (!classInfo) return 'K-12'; 

  // Primary Check: Basahin mismo ang 'department' galing sa sections table
  if (classInfo.department) {
    if (classInfo.department === 'College') return 'College';
    if (classInfo.department === 'SHS') return 'SHS';
    if (classInfo.department === 'K-10') return 'K-12';
  }

  // Fallback 1: level_category galing sa subjects table
  const category = (classInfo.level_category || '').toLowerCase();
  if (category === 'college') return 'College';
  if (category === 'shs') return 'SHS';

  // Fallback 2: grade_level string
  const gl = (classInfo.grade_level || '').toLowerCase();
  if (gl.includes('year') || gl.includes('college')) return 'College';
  if (gl.includes('11') || gl.includes('12')) return 'SHS';

  // Default fallback
  return 'JHS';
};

/**
 * Returns grading categories matching sms_db `student_grades` columns.
 * K-10 / SHS  → written (30%), performance (50%), exam (20%)  [DepEd]
 * College      → prelim (30%), midterm (30%), finals (40%)
 */
export const getGradingCategories = (level) => {
  if (level === 'College') {
    return [
      { key: 'prelim',      label: 'Prelim',        percentage: '30%', weight: 0.30 },
      { key: 'midterm',     label: 'Midterm',       percentage: '30%', weight: 0.30 },
      { key: 'finals',      label: 'Finals',        percentage: '40%', weight: 0.40 },
    ];
  }
  return [
    { key: 'written',     label: 'Written Work',   percentage: '30%', weight: 0.30 },
    { key: 'performance', label: 'Performance',    percentage: '50%', weight: 0.50 },
    { key: 'exam',        label: 'Quarterly Exam', percentage: '20%', weight: 0.20 },
  ];
};

/**
 * Computes the final grade string.
 * College → 1.0–5.0 scale | K-10/SHS → raw weighted percentage (2 dp).
 */
export const calculateFinalGrade = (student, level) => {
  const cats = getGradingCategories(level);
  const weighted = cats.reduce(
    (sum, cat) => sum + (parseFloat(student[cat.key]) || 0) * cat.weight,
    0
  );

  if (level === 'College') {
    if (weighted >= 97) return '1.00';
    if (weighted >= 94) return '1.25';
    if (weighted >= 91) return '1.50';
    if (weighted >= 88) return '1.75';
    if (weighted >= 85) return '2.00';
    if (weighted >= 82) return '2.25';
    if (weighted >= 79) return '2.50';
    if (weighted >= 76) return '2.75';
    if (weighted >= 75) return '3.00';
    return '5.00';
  }

  return weighted.toFixed(2);
};

/**
 * Returns 'Passed' | 'Failed'.
 */
export const getGradeStatus = (finalGrade, level) => {
  if (level === 'College') return parseFloat(finalGrade) <= 3.00 ? 'Passed' : 'Failed';
  return parseFloat(finalGrade) >= 75 ? 'Passed' : 'Failed';
};

/**
 * Normalises a raw API student record so all grade keys are numbers
 * and `name` / `student_number` are always present.
 */
export const normaliseStudent = (raw) => ({
  ...raw,
  name:           raw.name || `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
  student_number: raw.student_number || raw.student_id || '',
  written:        parseFloat(raw.written)     || 0,
  performance:    parseFloat(raw.performance) || 0,
  exam:           parseFloat(raw.exam)        || 0,
  prelim:         parseFloat(raw.prelim)      || 0,
  midterm:        parseFloat(raw.midterm)     || 0,
  finals:         parseFloat(raw.finals)      || 0,
});

/**
 * Builds the payload for saving a single student.
 */
export const buildStudentPayload = (student, level) => {
  const final   = calculateFinalGrade(student, level);
  const remarks = getGradeStatus(final, level);
  return {
    student_id:  student.student_number || student.student_id, 
    written:     student.written,
    performance: student.performance,
    exam:        student.exam,
    prelim:      student.prelim,
    midterm:     student.midterm,
    finals:      student.finals,
    final_grade: parseFloat(final),
    remarks,
  };
};

/**
 * Clamps a raw input value to [0, 100].
 */
export const clampGrade = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
};