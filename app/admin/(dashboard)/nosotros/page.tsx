import { AboutContentForm } from "@/components/admin/AboutContentForm";
import { getAboutContent } from "@/lib/queries/about";

export default async function AdminAboutPage() {
  const content = await getAboutContent();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Página Nosotros</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Historia, misión, visión, valores y creencias que se muestran en /nosotros.
      </p>
      <div className="mt-8">
        <AboutContentForm defaultValues={content} />
      </div>
    </div>
  );
}
