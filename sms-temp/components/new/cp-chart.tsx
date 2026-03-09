import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Student } from "@/lib/types/database";

const chartConfig = {
  week1: {
    label: "Week 1",
    color: "lightblue"
  },
  week2: {
    label: "Week 2",
    color: "blue"
  },
  week3: {
    label: "Week 3",
    color: "green"
  }
};

interface CPChartProps {
  data: Student[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CPChart({ data }: CPChartProps) {
  const sum_cp_w1 = data.reduce(
    (total, student) => total + (student?.a_lms_activity?.cp_w1 || 0),
    0
  );

  const sum_cp_w2 = data.reduce(
    (total, student) => total + (student?.a_lms_activity?.cp_w2 || 0),
    0
  );

  const sum_cp_w3 = data.reduce(
    (total, student) => total + (student?.a_lms_activity?.cp_w3 || 0),
    0
  );

  const averate_cp_w1 = sum_cp_w1 / data.length;
  const averate_cp_w2 = sum_cp_w2 / data.length;
  const averate_cp_w3 = sum_cp_w3 / data.length;

  const chartData = [
    {
      week: "Week 1",
      cp: averate_cp_w1
    },
    {
      week: "Week 2",
      cp: averate_cp_w2
    },
    {
      week: "Week 3",
      cp: averate_cp_w3
    }
  ];
  return (
    <div>
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 20,
            right: 12
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickFormatter={(item) => item}
          />
          <YAxis dataKey="cp" type="number" />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area dataKey="cp" type="monotone" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
