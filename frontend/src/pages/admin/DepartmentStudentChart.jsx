import React from 'react';
import { Activity } from 'lucide-react';
import { getDepartmentColor } from './DepartmentSummaryCards';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const DepartmentStudentChart = ({ chartData, selectedDepartment, onSelectDepartment, chartType = 'bar' }) => {
  const isPieChart = chartType === 'pie';
  const isDashboard = chartType === 'dashboard';
  const selectPieDepartment = (entry) => {
    const department = entry?.department || entry?.payload?.department;
    if (department) onSelectDepartment({ department });
  };

  const chartHeader = (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Enrollment insights</p>
        <h2 id="department-chart-title" className="mt-1 text-lg font-bold text-slate-900">Department-Wise Student Distribution</h2>
        <p className="mt-1 text-sm text-slate-500">Select a bar or donut slice to filter applications.</p>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <Activity className="h-3.5 w-3.5" /> Live database totals
      </span>
    </div>
  );

  const tooltip = (
    <Tooltip
      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, .08)' }}
      formatter={(value, name, item) => [
        `${Number(value).toLocaleString()} students`,
        item?.payload?.department || name
      ]}
      labelStyle={{ color: '#0f172a', fontWeight: 700 }}
    />
  );

  const renderPie = (compact = false) => (
    <div className={`relative w-full ${compact ? 'h-[290px]' : 'h-[340px]'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {tooltip}
          <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          <Pie
            data={chartData}
            dataKey="student_count"
            nameKey="department"
            cx="50%"
            cy="45%"
            innerRadius={compact ? 48 : 64}
            outerRadius={compact ? 82 : 108}
            paddingAngle={2}
            label={({ percent }) => `${Math.round(percent * 100)}%`}
            labelLine={false}
            isAnimationActive
            animationDuration={700}
            onClick={selectPieDepartment}
            cursor="pointer"
          >
            {chartData.map((item, index) => (
              <Cell
                key={item.department}
                fill={getDepartmentColor(index)}
                fillOpacity={selectedDepartment && selectedDepartment !== item.department ? 0.3 : 1}
                stroke={selectedDepartment === item.department ? '#0f172a' : '#fff'}
                strokeWidth={selectedDepartment === item.department ? 3 : 2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-1/2 top-[43%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Students</span>
        <span className="text-xl font-extrabold text-slate-900">
          {(selectedDepartment
            ? chartData.find(item => item.department === selectedDepartment)?.student_count || 0
            : chartData.reduce((sum, item) => sum + Number(item.student_count), 0)
          ).toLocaleString()}
        </span>
      </div>
    </div>
  );

  const renderBar = (compact = false) => (
    <div className={`w-full ${compact ? 'h-[290px]' : 'h-[340px]'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 26, right: 12, left: -18, bottom: 56 }} onClick={onSelectDepartment} barCategoryGap="28%">
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="department"
            interval={0}
            angle={-24}
            textAnchor="end"
            height={70}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          {tooltip}
          <Bar dataKey="student_count" name="Students" radius={[7, 7, 0, 0]} isAnimationActive animationDuration={700} cursor="pointer">
            {chartData.map((item, index) => (
              <Cell
                key={item.department}
                fill={getDepartmentColor(index)}
                fillOpacity={selectedDepartment && selectedDepartment !== item.department ? 0.35 : 1}
                stroke={selectedDepartment === item.department ? '#0f172a' : 'none'}
                strokeWidth={selectedDepartment === item.department ? 2 : 0}
              />
            ))}
            <LabelList dataKey="student_count" position="top" fill="#334155" fontSize={11} fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <section aria-labelledby="department-chart-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {chartHeader}
      {chartData.length === 0 ? (
        <div className="flex h-[280px] flex-col items-center justify-center rounded-xl bg-slate-50 text-center">
          <Activity className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-600">Department chart will appear when student data is available.</p>
        </div>
      ) : isDashboard ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4">
            <h3 className="px-2 pt-1 text-sm font-bold text-slate-800">Students by department</h3>
            {renderBar(true)}
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4">
            <h3 className="px-2 pt-1 text-sm font-bold text-slate-800">Enrollment share</h3>
            {renderPie(true)}
          </div>
        </div>
      ) : isPieChart ? renderPie() : renderBar()}
    </section>
  );
};

export default DepartmentStudentChart;
