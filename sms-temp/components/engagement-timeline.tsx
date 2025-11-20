import { Engagements, Students } from "@/app/student/studentColumns";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "./ui/chart";
import { CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "./ui/card";

const chartConfig2 = {
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
    color: "darkblue"
  },
  noreponse: {
    label: "No Response",
    color: "lightred"
  }
} satisfies ChartConfig;

interface StudentChartProps {
  data: Students[];
}

const filterEngagementsByDate = (
  nov25_engagements: Engagements[],
  targetDate: string
) => {
  return nov25_engagements.filter((engagement) => {
    const engagementDate = new Date(engagement.created_at)
      .toISOString()
      .split("T")[0];
    return engagementDate === targetDate;
  });
};

const filterNoReponseByDate = (
  nov25_engagements: Engagements[],
  targetDate: string
) => {
  return nov25_engagements.filter((engagement) => {
    const engagementDate = new Date(engagement.created_at)
      .toISOString()
      .split("T")[0];
    return (
      engagementDate === targetDate && engagement.outcome === "no_response"
    );
  });
};

export default function EngagementTimeline({ data }: StudentChartProps) {
  const db_students = data as Students[];

  const allEngagements = db_students.flatMap(
    (student) => student.nov25_engagements
  );

  const engagementsOnW1Thursday = filterEngagementsByDate(
    allEngagements,
    "2025-11-03"
  );

  const engagementsOnW1Friday = filterEngagementsByDate(
    allEngagements,
    "2025-11-04"
  );

  const engagementsOnW1Saturday = filterEngagementsByDate(
    allEngagements,
    "2025-11-05"
  );

  const engagementsOnW1Sunday = filterEngagementsByDate(
    allEngagements,
    "2025-11-06"
  );

  const engagementsOnW2Monday = filterEngagementsByDate(
    allEngagements,
    "2025-09-29"
  );

  const engagementsOnW2Tuesday = filterEngagementsByDate(
    allEngagements,
    "2025-09-30"
  );

  const engagementsOnW2Wednesday = filterEngagementsByDate(
    allEngagements,
    "2025-10-01"
  );

  const engagmentsOnW2Thursday = filterEngagementsByDate(
    allEngagements,
    "2025-10-02"
  );

  const engagementsOnW2Friday = filterEngagementsByDate(
    allEngagements,
    "2025-10-03"
  );

  const engagementsOnW2Saturday = filterEngagementsByDate(
    allEngagements,
    "2025-10-04"
  );

  const engagementsOnW2Sunday = filterEngagementsByDate(
    allEngagements,
    "2025-10-05"
  );

  const engagementsOnW3Monday = filterEngagementsByDate(
    allEngagements,
    "2025-10-06"
  );

  const engagementsOnW3Tuesday = filterEngagementsByDate(
    allEngagements,
    "2025-10-07"
  );

  const engagementsOnW3Wednesday = filterEngagementsByDate(
    allEngagements,
    "2025-10-08"
  );

  const engagementsOnW3Thursday = filterEngagementsByDate(
    allEngagements,
    "2025-10-09"
  );

  const engagementsOnW3Friday = filterEngagementsByDate(
    allEngagements,
    "2025-10-10"
  );

  const engagementsOnW3Saturday = filterEngagementsByDate(
    allEngagements,
    "2025-10-11"
  );

  const engagementsOnW3Sunday = filterEngagementsByDate(
    allEngagements,
    "2025-10-12"
  );

  const engaged_week1_monday = 6;

  const engaged_week1_tuesday = 14;

  const engaged_week1_wednesday = 17;

  const no_response_monday = filterNoReponseByDate(
    allEngagements,
    "2025-09-29"
  ).length;
  const no_response_tuesday = filterNoReponseByDate(
    allEngagements,
    "2025-09-30"
  ).length;
  const no_response_wednesday = filterNoReponseByDate(
    allEngagements,
    "2025-10-01"
  ).length;
  const no_response_thursday = filterNoReponseByDate(
    allEngagements,
    "2025-10-02"
  ).length;
  const no_response_friday = filterNoReponseByDate(
    allEngagements,
    "2025-10-03"
  ).length;
  const no_response_saturday = filterNoReponseByDate(
    allEngagements,
    "2025-10-04"
  ).length;
  const no_response_sunday = filterNoReponseByDate(
    allEngagements,
    "2025-10-05"
  ).length;

  const chartData2 = [
    {
      day: "Monday",
      week1: engaged_week1_monday,
      week2: engagementsOnW2Monday.length,
      week3: engagementsOnW3Monday.length,
      noreponse: no_response_monday
    },
    {
      day: "Tuesday",
      week1: engaged_week1_tuesday,
      week2: engagementsOnW2Tuesday.length,
      week3: engagementsOnW3Tuesday.length,
      noreponse: no_response_tuesday
    },
    {
      day: "Wednesday",
      week1: engaged_week1_wednesday,
      week2: engagementsOnW2Wednesday.length,
      week3: engagementsOnW3Wednesday.length,
      noreponse: no_response_wednesday
    },
    {
      day: "Thursday",
      week1: engagementsOnW1Thursday.length,
      week2: engagmentsOnW2Thursday.length,
      week3: engagementsOnW3Thursday.length,
      noreponse: no_response_thursday
    },
    {
      day: "Friday",
      week1: engagementsOnW1Friday.length,
      week2: engagementsOnW2Friday.length,
      week3: engagementsOnW3Friday.length,
      noreponse: no_response_friday
    },
    {
      day: "Saturday",
      week1: engagementsOnW1Saturday.length,
      week2: engagementsOnW2Saturday.length,
      week3: engagementsOnW3Saturday.length,
      noreponse: no_response_saturday
    },
    {
      day: "Sunday",
      week1: engagementsOnW1Sunday.length,
      week2: engagementsOnW2Sunday.length,
      week3: engagementsOnW3Sunday.length,
      noreponse: no_response_sunday
    }
  ];

  const resolved_count = db_students.filter(
    (student) =>
      student.nov25_engagements &&
      student.nov25_engagements.some(
        (engagement) => engagement.outcome === "resolved"
      )
  ).length;

  const no_response_count = db_students.filter(
    (student) =>
      student.nov25_engagements &&
      student.nov25_engagements.some(
        (engagement) => engagement.outcome === "no_response"
      )
  ).length;

  const followups_count = db_students.filter(
    (student) =>
      student.nov25_engagements &&
      student.nov25_engagements.some(
        (engagement) => engagement.outcome === "followup"
      )
  ).length;

  const escalated_count = db_students.filter(
    (student) =>
      student.nov25_engagements &&
      student.nov25_engagements.some(
        (engagement) => engagement.outcome === "escalated"
      )
  ).length;

  const engaged_count = db_students.filter(
    (student) => student.nov25_engagements
  ).length;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Engagement Timeline</CardTitle>
          <CardDescription>
            Track student engagement over the past three weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig2}>
            <LineChart
              accessibilityLayer
              data={chartData2}
              margin={{ top: 30, right: 20, bottom: 30, left: 0 }}
            >
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={5}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="natural"
                dataKey="week1"
                stroke="lightblue"
                strokeWidth={2}
                dot={{ r: 4 }}
              ></Line>
              <Line
                type="natural"
                dataKey="week2"
                stroke="blue"
                strokeWidth={2}
                dot={{ r: 4 }}
              ></Line>
              <Line
                type="natural"
                dataKey="week3"
                stroke="darkblue"
                strokeWidth={2}
                dot={{ r: 4 }}
              ></Line>
              <Line
                type="natural"
                dataKey="noreponse"
                stroke="red"
                strokeWidth={2}
                dot={{ r: 4 }}
              ></Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Outcome Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
            <p className="font-bold">Outcome</p>
            <p className="font-bold">Count</p>
            <p className="font-bold">%</p>
            <p>Engaged</p>
            <p>{engaged_count}</p>
            <p>{((engaged_count / db_students.length) * 100).toFixed(1)}%</p>
            <p>Resolved</p>
            <p>{resolved_count}</p>
            <p>{((resolved_count / db_students.length) * 100).toFixed(1)}%</p>
            <p>No Response</p>
            <p>{no_response_count}</p>
            <p>
              {((no_response_count / db_students.length) * 100).toFixed(1)}%
            </p>
            <p>Follow Up</p>
            <p>{followups_count}</p>
            <p>{((followups_count / db_students.length) * 100).toFixed(1)}%</p>
            <p>Escalated</p>
            <p>{escalated_count}</p>
            <p>{((escalated_count / db_students.length) * 100).toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
