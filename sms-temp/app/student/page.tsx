import { getData } from "./getData";
import { getViewer } from "./get-viewer";
import StudentWorkspace from "./student-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export default async function StudentsPage() {
  const [data, viewer] = await Promise.all([getData(), getViewer()]);

  return (
    <StudentWorkspace
      data={data}
      currentSst={viewer.sst}
      isManager={viewer.isManager}
    />
  );
}
