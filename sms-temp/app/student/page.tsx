import { newStudentColumns } from "./studentColumns";
import NewStudentList from "@/components/new/student-list";
import { DataTable } from "./data-table";
import { getData } from "./getData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const intakes = [
  { label: "Nov-25", value: "NOV25" },
  { label: "Jan-26", value: "JAN26" }
];

export const dynamic = "force-dynamic";
export const revalidate = 600;

export default async function DemoPage() {
  const data = await getData();

  const filterIntakes = (intakeCode: string) => {
    const filteredData = data.filter(
      (student) => student.intake_code === intakeCode
    );
    return filteredData;
  };

  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full lg:w-[100vw] items-start justify-start lg:justify-center ">
      <div className="flex flex-row w-full pt-6 pb-2 justify-between">
        <div className="flex flex-row gap-1 items-end justify-between w-full">
          <h4 className="font-bold text-3xl ">SST.MS</h4>
          <h1 className="font-thin text-xl flex justify-between items-center sr-only">
            Student Success Team Management System
          </h1>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="lg:hidden flex">
          <Tabs defaultValue="NOV25">
            <TabsList className="flex gap-2 flex-row items-center justify-between">
              <div className="flex flex-row gap-2 items-center justify-center">
                <p className="text-muted-foreground">Intakes:</p>
                {intakes.map((intake) => (
                  <TabsTrigger key={intake.value} value={intake.value}>
                    {intake.label}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
            {intakes.map((intake) => (
              <TabsContent key={intake.value} value={intake.value}>
                <NewStudentList data={filterIntakes(intake.value)} />
              </TabsContent>
            ))}
          </Tabs>
          {/*           <NewStudentList data={data} />
           */}{" "}
        </div>
        <div className="hidden lg:flex ">
          <Tabs defaultValue="NOV25">
            <TabsList className="flex gap-2 flex-row items-center justify-between ">
              <div className="flex flex-row gap-2 items-center justify-center">
                <p className="text-muted-foreground">Intakes:</p>
                {intakes.map((intake) => (
                  <TabsTrigger key={intake.value} value={intake.value}>
                    {intake.label}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
            {intakes.map((intake) => (
              <TabsContent key={intake.value} value={intake.value}>
                <DataTable
                  data={filterIntakes(intake.value)}
                  columns={newStudentColumns}
                />
              </TabsContent>
            ))}
          </Tabs>

          {/* 
          {intakes.map((intake) => (
            <DataTable
              key={intake.value}
              data={filterIntakes(intake.value)}
              columns={newStudentColumns}
            />
          ))} */}
          {/*  <DataTable data={data} columns={newStudentColumns} /> */}
        </div>
      </div>
    </div>
  );
}
