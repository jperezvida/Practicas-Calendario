import React from 'react';
import { Entry, ViewType } from '../types';
import { DAYS_OF_WEEK, MONTHS, USERS } from '../constants';

interface Props {
  viewType: ViewType;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  entries: Entry[];
  onDateClick: (date: string) => void;
}

const Calendar: React.FC<Props> = ({ viewType, currentDate, setCurrentDate, entries, onDateClick }) => {
  
  const formatLocalYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigate = (amount: number) => {
    const d = new Date(currentDate);
    if (viewType === 'month') d.setMonth(d.getMonth() + amount);
    else d.setDate(d.getDate() + (amount * 7));
    setCurrentDate(d);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1, 12, 0, 0);
    const lastDay = new Date(year, month + 1, 0, 12, 0, 0);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6;
    
    const days = [];
    for (let i = startOffset; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i, 12, 0, 0), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i, 12, 0, 0), isCurrentMonth: true });
    }
    return days;
  };

  const calendarDays = viewType === 'month' ? getDaysInMonth() : (() => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(12, 0, 0, 0); 
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({ date: d, isCurrentMonth: true });
    }
    return days;
  })();

  const getMultiColorBackground = (entry: Entry) => {
    const names = entry.participants && entry.participants.length > 0 ? entry.participants : [entry.person];
    const colors = names.map(name => {
      const u = USERS.find(user => user.name === name);
      return u ? u.color : '#ccc';
    });
    if (colors.length === 1) return colors[0];
    const step = 100 / colors.length;
    let gradient = 'linear-gradient(135deg, ';
    colors.forEach((color, i) => {
      gradient += `${color} ${step * i}%, ${color} ${step * (i + 1)}%`;
      if (i < colors.length - 1) gradient += ', ';
    });
    gradient += ')';
    return gradient;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {viewType === 'month' 
            ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            : `Semana del ${calendarDays[0].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
          }
        </h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition">Hoy</button>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50/50 border-b">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr flex-1 overflow-y-auto">
        {calendarDays.map((day, idx) => {
          const dateStr = formatLocalYMD(day.date);
          const dayEntries = entries.filter(e => e.date === dateStr);
          const isToday = formatLocalYMD(new Date()) === dateStr;
          const isBusy = dayEntries.length >= 4;
          const isVeryBusy = dayEntries.length >= 7;
          const dayOfWeek = day.date.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          let cellClasses = "min-h-[80px] md:min-h-[140px] p-1 md:p-2 border-r border-b border-gray-100 hover:bg-gray-50/80 transition cursor-pointer flex flex-col gap-1 relative ";
          
          if (!day.isCurrentMonth) {
            cellClasses += "bg-gray-50/30 ";
          } else {
            if (isWeekend && !isBusy) cellClasses += "bg-[#FCE4EC] ";
            if (isBusy) cellClasses += "bg-orange-50/40 ";
            if (isVeryBusy) cellClasses += "bg-orange-100/40 ";
          }

          return (
            <div key={idx} onClick={() => onDateClick(dateStr)} className={cellClasses}>
              {isBusy && day.isCurrentMonth && (
                <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse shadow-sm ${isVeryBusy ? 'bg-red-500 shadow-red-200' : 'bg-orange-400 shadow-orange-200'}`} />
              )}
              
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${isToday ? 'w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg' : day.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}`}>
                  {day.date.getDate()}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-1">
                {dayEntries.slice(0, 10).map(entry => {
                  const bgStyle = getMultiColorBackground(entry);
                  const isPlan = entry.type === 'plan';
                  const isFalta = entry.type === 'falta';
                  const primaryUser = USERS.find(u => u.name === entry.person);
                  
                  // LOGICA FALTA: Raya diagonal negra + color de usuario
                  if (isFalta) {
                    return (
                      <div 
                        key={entry.id}
                        title={`Falta: ${entry.person}`}
                        className="h-2 w-2 rounded-full border border-gray-900 shadow-sm"
                        style={{ background: `linear-gradient(135deg, #111827 50%, ${primaryUser?.color || '#ccc'} 50%)` }}
                      />
                    );
                  }

                  return (
                    <div 
                      key={entry.id}
                      className="h-2 w-2 rounded-full"
                      style={{ background: bgStyle, boxShadow: isPlan ? `0 0 0 1px ${primaryUser?.color || '#ccc'}` : 'none' }}
                    />
                  );
                })}
              </div>

              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEntries.slice(0, 5).map(entry => {
                  const bgStyle = getMultiColorBackground(entry);
                  const isPlan = entry.type === 'plan';
                  const isFalta = entry.type === 'falta';
                  const isDone = isPlan && entry.completed;
                  const participantsCount = entry.participants?.length || 1;
                  const primaryUser = USERS.find(u => u.name === entry.person);
                  const isMulti = participantsCount > 1;

                  // 1. SI ES FALTA: Raya de la muerte roja/negra con X
                  if (isFalta) {
                    return (
                       <div 
                        key={entry.id} 
                        className="text-[9px] truncate px-1.5 py-0.5 rounded shadow-sm font-semibold transition-all border border-gray-900 text-white flex items-center gap-1"
                        style={{ background: `linear-gradient(135deg, #111827 30%, ${primaryUser?.color || '#ef4444'} 150%)` }}
                      >
                        ❌ {entry.person}
                      </div>
                    );
                  }

                  // 2. TAREA NORMAL
                  let itemStyle: React.CSSProperties = {
                    opacity: isDone ? 0.4 : 1,
                    textDecoration: isDone ? 'line-through' : 'none'
                  };

                  let itemClasses = "text-[9px] truncate px-1.5 py-0.5 rounded shadow-sm font-semibold transition-all flex items-center gap-1 ";

                  if (isPlan) {
                     if (isMulti) {
                        itemStyle = {
                           ...itemStyle,
                           backgroundImage: `linear-gradient(#fff, #fff), ${bgStyle}`,
                           backgroundOrigin: 'border-box',
                           backgroundClip: 'padding-box, border-box',
                           border: '1px solid transparent', 
                           color: '#374151' 
                        };
                     } else {
                        itemStyle = {
                           ...itemStyle,
                           backgroundColor: '#ffffff',
                           border: `1px solid ${primaryUser?.color}`,
                           color: primaryUser?.color
                        };
                     }
                  } else {
                     itemStyle = {
                        ...itemStyle,
                        background: bgStyle,
                        color: '#ffffff',
                        textShadow: (isMulti) ? '0px 1px 2px rgba(0,0,0,0.3)' : 'none'
                     };
                     itemClasses += "text-white ";
                  }

                  return (
                    <div key={entry.id} className={itemClasses} style={itemStyle}>
                      {isDone && <span>✓</span>}
                      {entry.text}
                    </div>
                  );
                })}
                {dayEntries.length > 5 && (
                  <div className="text-[9px] text-gray-400 font-bold ml-1">+{dayEntries.length - 5}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
