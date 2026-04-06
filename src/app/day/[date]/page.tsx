import DayPlanner from "@/components/DayPlanner";

type Params = Promise<{ date: string }>;

export default async function DayPage({ params }: { params: Params }) {
  const { date } = await params;
  // Parse YYYY-MM-DD as local date (noon avoids timezone edge cases)
  const [y, m, d] = date.split("-").map(Number);
  const parsed = new Date(y, m - 1, d, 12);

  return <DayPlanner date={parsed} />;
}
