import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";

export default function Heatmap({ dates }: { dates: string[] }) {
  const today = new Date();
  const daysInYear = 365;
  const startDate = startOfWeek(subDays(today, daysInYear));

  // Create a map for quick lookup
  const dateMap = new Set(dates.map(d => d.substring(0, 10)));

  const weeks = [];
  let currentDay = startDate;

  for (let i = 0; i < 53; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const dateStr = format(currentDay, 'yyyy-MM-dd');
      const hasMeditation = dateMap.has(dateStr);
      week.push({
        date: currentDay,
        hasMeditation,
        isFuture: currentDay > today
      });
      currentDay = addDays(currentDay, 1);
    }
    weeks.push(week);
  }

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="flex flex-col gap-2 overflow-x-auto p-2">
      <div className="flex text-xs text-[#9b9a97] mb-1 pl-6">
        {months.map((m, i) => (
          <div key={i} className="flex-1 min-w-[30px]">{m}</div>
        ))}
      </div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] text-[10px] text-[#9b9a97] justify-between pr-2 py-1">
          <span>일</span>
          <span>화</span>
          <span>목</span>
          <span>토</span>
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {week.map((day, j) => (
              <div
                key={j}
                title={format(day.date, 'yyyy년 MM월 dd일')}
                className={`w-[11px] h-[11px] rounded-sm ${
                  day.isFuture 
                    ? 'bg-transparent' 
                    : day.hasMeditation 
                      ? 'bg-[#39d353]' 
                      : 'bg-[#ebedf0] hover:bg-[#e1e4e8]'
                } transition-colors cursor-help`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-2 text-xs text-[#9b9a97] mt-2">
        <span>적음</span>
        <div className="w-[11px] h-[11px] rounded-sm bg-[#ebedf0]"></div>
        <div className="w-[11px] h-[11px] rounded-sm bg-[#39d353]"></div>
        <span>많음</span>
      </div>
    </div>
  );
}
