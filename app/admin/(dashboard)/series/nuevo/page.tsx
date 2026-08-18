import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SermonSeriesForm } from "@/components/admin/SermonSeriesForm";
import { createSermonSeries } from "@/lib/actions/sermon-series";

export default function NewSermonSeriesPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Series", href: "/admin/series" }, { label: "Nueva serie" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Nueva serie</h1>
      <div className="mt-8">
        <SermonSeriesForm action={createSermonSeries} />
      </div>
    </div>
  );
}
