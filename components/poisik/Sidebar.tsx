import { SidebarNav } from './SidebarNav';

interface SidebarProps {
  usage: { remaining: number | null; limit: number | null; plan: string };
  projects: { id: string; name: string }[];
}

export function Sidebar({ usage, projects }: SidebarProps) {
  return (
    <aside className="fixed top-20 bottom-0 left-0 hidden w-64 flex-col justify-between border-r border-border bg-surface px-md py-lg lg:flex">
      <SidebarNav usage={usage} projects={projects} />
    </aside>
  );
}
