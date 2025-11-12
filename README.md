# @zhongyao/heatmap

A flexible and customizable React heatmap component for displaying year-based contribution calendars, similar to GitHub's contribution graph.

## Features

- **Flexible Year Display**: Show any year's calendar in a heatmap format
- **Customizable Week Start**: Choose between Sunday or Monday as the first day of the week
- **Fully Customizable Rendering**: Override default rendering for day cells, month labels, and weekday labels
- **Responsive Sizing**: Configure cell size and gaps to fit your design
- **TypeScript Support**: Full TypeScript definitions included
- **Lightweight**: Built with React and dayjs

## Installation

```bash
npm install @zhongyao/heatmap
```

## Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "react": "^16.18.0",
  "dayjs": "^1.11.19"
}
```

## Basic Usage

```tsx
import { Heatmap } from '@zhongyao/heatmap';

function App() {
  return (
    <Heatmap
      year={2025}
      weekStartDay="sunday"
    />
  );
}
```

## Props

### `HeatmapProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `year` | `number` | `2025` | The year to display |
| `weekStartDay` | `'sunday' \| 'monday'` | `'sunday'` | First day of the week |
| `cellSize` | `number` | `16` | Base size of cells and labels in pixels |
| `gap` | `number` | `4` | Spacing between cells and labels in pixels |
| `containerGap` | `number` | `18` | Gap between weekday labels and the main grid |
| `className` | `string` | `''` | Additional className for the wrapper |
| `renderDay` | `(props: DayCellProps) => React.ReactNode` | `undefined` | Custom day cell renderer |
| `renderMonth` | `(props: MonthLabelProps) => React.ReactNode` | `undefined` | Custom month label renderer |
| `renderWeekday` | `(props: WeekdayLabelProps) => React.ReactNode` | `undefined` | Custom weekday label renderer |
| `weekDayLabelLayout` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of weekday labels |
| `weekDayLabelStyle` | `CSSProperties` | `undefined` | Custom styles for weekday labels |

## Custom Rendering

### Custom Day Cell

The `renderDay` prop allows you to customize how each day cell is rendered. You receive a `DayCellProps` object:

```tsx
interface DayCellProps {
  date: Dayjs | null;           // Date object (null for empty placeholders)
  dayOfYear: number | null;      // Day of year (1-366, null for placeholders)
  colIndex: number;              // 0-indexed column
  rowIndex: number;              // 0-indexed row (0-6)
  isEmpty: boolean;              // True for year start/end placeholders
}
```

**Example:**

```tsx
<Heatmap
  year={2025}
  renderDay={({ date, isEmpty }) => {
    if (isEmpty) return <div style={{ width: 16, height: 16 }} />;

    // Custom logic based on your data
    const contribution = getContributionCount(date);
    const intensity = Math.min(contribution / 10, 1);

    return (
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: `rgba(0, 255, 0, ${intensity})`,
          borderRadius: 2,
        }}
        title={`${date.format('YYYY-MM-DD')}: ${contribution} contributions`}
      />
    );
  }}
/>
```

### Custom Month Label

The `renderMonth` prop customizes month labels:

```tsx
interface MonthLabelProps {
  index: number;      // 0-indexed month (0-11)
  label: string;      // Default label (e.g., "Jan")
  startCol: number;   // 1-indexed starting column
  span: number;       // Number of columns this month spans
}
```

**Example:**

```tsx
<Heatmap
  year={2025}
  renderMonth={({ label, span }) => (
    <div
      style={{
        gridColumn: `span ${span}`,
        height: 16,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: 14,
      }}
    >
      {label}
    </div>
  )}
/>
```

### Custom Weekday Label

The `renderWeekday` prop customizes weekday labels:

```tsx
interface WeekdayLabelProps {
  index: number;                          // 0-indexed weekday (0-6)
  label: string;                          // Default label (e.g., "Mon")
  layout?: 'left' | 'center' | 'right';  // Label alignment
  style?: CSSProperties;                  // Custom styles
}
```

**Example:**

```tsx
<Heatmap
  year={2025}
  weekDayLabelLayout="center"
  renderWeekday={({ label }) => (
    <div
      style={{
        height: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        color: '#374151',
      }}
    >
      {label.charAt(0)} {/* Show only first letter */}
    </div>
  )}
/>
```

## Advanced Example

Here's a complete example with custom styling and data:

```tsx
import { Heatmap, DayCellProps } from '@zhongyao/heatmap';
import { Dayjs } from 'dayjs';

// Your contribution data
const contributions: Record<string, number> = {
  '2025-01-15': 5,
  '2025-01-16': 12,
  '2025-02-01': 8,
  // ... more data
};

function ContributionHeatmap() {
  const renderDay = ({ date, isEmpty }: DayCellProps) => {
    if (isEmpty) {
      return <div style={{ width: 12, height: 12 }} />;
    }

    const dateKey = date!.format('YYYY-MM-DD');
    const count = contributions[dateKey] || 0;

    // Calculate color intensity
    const getColor = (count: number) => {
      if (count === 0) return '#ebedf0';
      if (count < 5) return '#9be9a8';
      if (count < 10) return '#40c463';
      if (count < 15) return '#30a14e';
      return '#216e39';
    };

    return (
      <div
        style={{
          width: 12,
          height: 12,
          backgroundColor: getColor(count),
          borderRadius: 2,
          cursor: 'pointer',
        }}
        title={`${dateKey}: ${count} contributions`}
      />
    );
  };

  return (
    <Heatmap
      year={2025}
      weekStartDay="monday"
      cellSize={12}
      gap={3}
      renderDay={renderDay}
      className="my-heatmap"
    />
  );
}
```

## Styling

The component uses Tailwind CSS classes by default, but you can fully customize styling through:

1. **Props**: Use `cellSize`, `gap`, `containerGap` for spacing
2. **Custom Renderers**: Full control over rendering via `renderDay`, `renderMonth`, `renderWeekday`
3. **CSS Classes**: Add custom classes via the `className` prop

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
