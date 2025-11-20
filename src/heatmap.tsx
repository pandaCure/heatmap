import React, { CSSProperties, useMemo } from "react";

import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

// --- dayjs 插件 & 辅助函数 ---
dayjs.extend(isoWeek);

// (辅助函数 getDaysInYear, getDaysInMonth, getDateFromDayOfYear, getStartColumnForDay 保持不变)
// ... [它们是纯函数，在这里保持原样]
const getDaysInYear = (year: number): number => {
  const startOfYear = dayjs().year(year).startOf("year");
  const startOfNextYear = dayjs()
    .year(year + 1)
    .startOf("year");
  return startOfNextYear.diff(startOfYear, "day");
};
const getDaysInMonth = (year: number, month: number): number => {
  return dayjs().year(year).month(month).daysInMonth();
};
const getDateFromDayOfYear = (year: number, dayOfYear: number): Dayjs => {
  return dayjs(`${year}-01-01`).add(dayOfYear - 1, "day");
};
const getStartColumnForDay = (
  dayOfYear: number,
  firstDayOffset: number
): number => {
  const dayIndex = dayOfYear - 1;
  const gridIndex = dayIndex + firstDayOffset;
  const colIndex = Math.floor(gridIndex / 7);
  return colIndex + 1;
};
// --- 辅助函数结束 ---

// --- 常量 ---
const MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAYS_MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_SUN_START = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- [新] Prop 类型定义 ---

type WeekStartDay = "monday" | "sunday";

/**
 * 传递给 `renderDay` 的 Props。
 */
export interface DayCellProps {
  /** 单元格的日期对象。如果是空占位符，则为 null。 */
  date: Dayjs | null;
  /** 单元格在一年中的第几天 (1-366)。如果是空占位符，则为 null。 */
  dayOfYear: number | null;
  /** 单元格的 0 索引列。 */
  colIndex: number;
  /** 单元格的 0 索引行 (0-6)。 */
  rowIndex: number;
  /** 如果此单元格是年初或年末的占位符，则为 true。 */
  isEmpty: boolean;
}

/**
 * 传递给 `renderWeekday` 的 Props。
 */
export interface WeekdayLabelProps {
  /** 星期的 0 索引 (0-6)。 */
  index: number;
  /** 默认标签 (例如 "Mon")。 */
  label: string;
  /** 星期标签的布局。 */
  layout?: "left" | "center" | "right";
  style?: CSSProperties;
  cellSize: number;
}

/**
 * 传递给 `renderMonth` 的 Props。
 */
export interface MonthLabelProps {
  /** 月份的 0 索引 (0-11)。 */
  index: number;
  /** 默认标签 (例如 "Jan")。 */
  label: string;
  /** 此月份的 1 索引起始列。 */
  startCol: number;
  /** 此月份标签横跨的列数。 */
  span: number;
}

/**
 * Heatmap 组件的 Props。
 */
export interface HeatmapProps {
  /** 要显示的年份。默认为 2025。 */
  year?: number;
  /** 一周的起始日。默认为 'sunday'。 */
  weekStartDay?: WeekStartDay;
  /**
   * 单元格和标签的基础尺寸（像素）。
   * 默认为 16 (px)。
   */
  cellSize?: number;
  /**
   * 单元格和标签之间的间距（像素）。
   * 默认为 4 (px)。
   */
  gap?: number;
  containerGap?: number;
  /** 应用于最外层包装器的额外 className。 */
  className?: string;
  /**
   * [自定义渲染] 渲染一个日期单元格。
   * 如果未提供，将使用 DefaultDayCell。
   */
  renderDay?: (props: DayCellProps) => React.ReactNode;
  /**
   * [自定义渲染] 渲染一个月份标签。
   * 如果未提供，将使用 DefaultMonthLabel。
   */
  renderMonth?: (props: MonthLabelProps) => React.ReactNode;
  /**
   * [自定义渲染] 渲染一个星期标签。
   * 如果未提供，将使用 DefaultWeekdayLabel。
   */
  renderWeekday?: (props: WeekdayLabelProps) => React.ReactNode;
  weekDayLabelLayout?: "left" | "center" | "right";
  weekDayLabelStyle?: CSSProperties;
  monthLabelMarginBottom?: number;
}

// --- [新] 默认渲染器 ---
// 将它们移到组件外部，以获得更好的性能和可重用性。

/** 默认的日期单元格渲染器 */
const DefaultDayCell: React.FC<DayCellProps & { cellSize: number }> = ({
  date,
  isEmpty,
  cellSize,
}) => {
  // 为空占位符渲染一个透明的 div
  if (isEmpty) {
    return <div style={{ width: cellSize, height: cellSize }} />;
  }

  // 为有效日期渲染一个带 Tooltip 的 div
  return (
    <div
      style={{ height: cellSize }}
      // 使用更中性的默认颜色，而不是 'bg-red-200'
      className="bg-gray-200 hover:bg-gray-300 rounded"
    />
  );
};

/** 默认的月份标签渲染器 */
const DefaultMonthLabel: React.FC<MonthLabelProps & { cellSize: number }> = ({
  label,
  span,
  cellSize,
}) => (
  <div
    style={{
      gridColumn: `span ${span} / span ${span}`,
      height: cellSize, // 使用 cellSize 作为高度
    }}
    // 'justify-start' 在视觉上通常比 'justify-center' 更好
    className="flex items-center justify-start text-xs text-gray-500"
  >
    {label}
  </div>
);

/** 默认的星期标签渲染器 */
const DefaultWeekdayLabel: React.FC<WeekdayLabelProps> = ({
  label,
  cellSize,
  layout,
  style,
}) => (
  <div
    style={{
      height: cellSize,
      justifyContent:
        layout === "center"
          ? "center"
          : layout === "right"
          ? "flex-end"
          : "flex-start",
      ...style,
    }} // 使用 cellSize
    className="flex items-center text-xs text-gray-500"
  >
    {label}
  </div>
);

// --- [重构] Heatmap 组件 ---

export const Heatmap: React.FC<HeatmapProps> = ({
  year = 2025,
  weekStartDay = "sunday",
  // 使用 cellSize 和 gap 替换硬编码的 'w-4', 'h-4', 'gap-4'
  cellSize = 16,
  gap = 4,
  containerGap = 18,
  weekDayLabelLayout = "left",
  className = "",
  // 引入自定义渲染 props
  renderDay,
  renderMonth,
  renderWeekday,
  weekDayLabelStyle,
  monthLabelMarginBottom = 4,
}) => {
  // --- 配置（保持不变）---
  const config = useMemo(() => {
    if (weekStartDay === "sunday") {
      return {
        getWeekday: (date: Dayjs): number => date.day(),
        labels: WEEKDAYS_SUN_START,
      };
    }
    return {
      getWeekday: (date: Dayjs): number => date.isoWeekday() - 1,
      labels: WEEKDAYS_MON_START,
    };
  }, [weekStartDay]);

  // --- 核心计算（保持不变）---
  const daysInYear = getDaysInYear(year);
  const firstDayOfYear = dayjs(`${year}-01-01`);
  const firstDayOffset = config.getWeekday(firstDayOfYear);
  const totalCols = Math.ceil((daysInYear + firstDayOffset) / 7);
  const gridTemplate = `repeat(${totalCols}, minmax(0, 1fr))`;

  const daysInMonthArray = Array.from({ length: 12 }).map((_, index) => {
    return getDaysInMonth(year, index);
  });

  const monthStartCols: number[] = [];
  let cumulativeDays = 0;
  for (let i = 0; i < 12; i++) {
    const dayOfYear = cumulativeDays + 1;
    const startCol = getStartColumnForDay(dayOfYear, firstDayOffset);
    monthStartCols.push(startCol);
    cumulativeDays += daysInMonthArray[i];
  }

  const endCol = totalCols + 1;

  return (
    <div className={`flex ${className}`} style={{ gap: containerGap }}>
      <div className="flex flex-col" style={{ gap }}>
        <div style={{ height: cellSize + monthLabelMarginBottom }} />

        {config.labels.map((label, index) => {
          const props: WeekdayLabelProps = {
            index,
            label,
            cellSize,
            layout: weekDayLabelLayout,
            style: weekDayLabelStyle,
          };
          // [新] 使用自定义渲染器（如果提供）
          return (
            <React.Fragment key={index}>
              {renderWeekday ? (
                renderWeekday(props)
              ) : (
                <DefaultWeekdayLabel
                  {...props}
                  cellSize={cellSize}
                  layout={weekDayLabelLayout}
                  style={weekDayLabelStyle}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        className="flex flex-col flex-1"
        style={{ gap: monthLabelMarginBottom }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: gridTemplate, gap }}
        >
          {Array.from({ length: 12 }).map((_, index) => {
            const startCol = monthStartCols[index];
            const nextStartCol =
              index === 11 ? endCol : monthStartCols[index + 1];
            const span = nextStartCol - startCol;
            const props: MonthLabelProps = {
              index,
              label: MONTH_ABBREVIATIONS[index],
              startCol,
              span,
            };

            return (
              <React.Fragment key={index}>
                {renderMonth ? (
                  renderMonth(props)
                ) : (
                  <DefaultMonthLabel {...props} cellSize={cellSize} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div
          className="gap-4"
          style={{ display: "grid", gridTemplateColumns: gridTemplate, gap }}
        >
          {Array.from({ length: totalCols }, (_, colIdx) => (
            // [修改] 内部列也使用 gap prop
            <div className="flex flex-col" style={{ gap }} key={colIdx}>
              {Array.from({ length: 7 }, (_, rowIdx) => {
                const dayOfYear = colIdx * 7 + rowIdx + 1 - firstDayOffset;
                const isEmpty = dayOfYear <= 0 || dayOfYear > daysInYear;
                const date = isEmpty
                  ? null
                  : getDateFromDayOfYear(year, dayOfYear);

                const props: DayCellProps = {
                  date,
                  dayOfYear: isEmpty ? null : dayOfYear,
                  colIndex: colIdx,
                  rowIndex: rowIdx,
                  isEmpty,
                };

                // [新] 使用自定义渲染器（如果提供）
                return (
                  <React.Fragment key={rowIdx}>
                    {renderDay ? (
                      renderDay(props)
                    ) : (
                      <DefaultDayCell {...props} cellSize={cellSize} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
