"use client";

import { useActionState } from "react";
import { createPost, savePost } from "@/actions/posts";
import { FieldError, FormMessage, SubmitButton, formKey, kept, keptCheck } from "../forms/ui";

export const POST_CATEGORIES = ["Conférence", "Formation", "Jeunesse", "Culte spécial", "Évangélisation", "Baptême", "Mariage", "Femmes", "Hommes", "Enfants", "Souvenirs", "Vie de l'église"];

function Categories() {
  return <datalist id="post-categories">{POST_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>;
}

/** Étape 1 : un titre et une catégorie suffisent, le reste se complète sur la page de l'article. */
export function NewPostForm() {
  const [state, action] = useActionState(createPost, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-4">
        <label className="label">Titre du récit</label>
        <input name="title" className="field" placeholder="Baptêmes du dimanche 4 octobre" defaultValue={kept(state, "title")} />
        <FieldError state={state} name="title" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Catégorie</label>
        <input name="category" list="post-categories" className="field" defaultValue={kept(state, "category", "Vie de l'église")} />
        <Categories />
        <FieldError state={state} name="category" />
      </div>
      <div className="flex items-center gap-3 sm:col-span-6">
        <SubmitButton>Créer et ajouter les photos</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export type PostValues = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  place: string;
  excerpt: string;
  body: string;
  verseText: string;
  verseRef: string;
  ministry: string;
  published: boolean;
};

export function PostForm({ post, ministries }: { post: PostValues; ministries: { slug: string; name: string }[] }) {
  const [state, action] = useActionState(savePost, undefined);
  return (
    <form key={formKey(state)} action={action} className="grid gap-4 sm:grid-cols-6">
      <input type="hidden" name="id" value={post.id} />
      <div className="sm:col-span-4">
        <label className="label">Titre</label>
        <input name="title" className="field" defaultValue={kept(state, "title", post.title)} />
        <FieldError state={state} name="title" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Catégorie</label>
        <input name="category" list="post-categories" className="field" defaultValue={kept(state, "category", post.category)} />
        <Categories />
        <FieldError state={state} name="category" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Date de l&apos;activité</label>
        <input name="date" type="date" className="field" defaultValue={kept(state, "date", post.date)} />
        <FieldError state={state} name="date" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Horaire (facultatif)</label>
        <input name="time" className="field" placeholder="9h – 13h" defaultValue={kept(state, "time", post.time)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Lieu (facultatif)</label>
        <input name="place" className="field" placeholder="EBB-JR de Tanmey" defaultValue={kept(state, "place", post.place)} />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Résumé (affiché sur les cartes du blog et de la galerie)</label>
        <textarea name="excerpt" rows={2} maxLength={300} className="field resize-y" defaultValue={kept(state, "excerpt", post.excerpt)} />
        <FieldError state={state} name="excerpt" />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Récit — laissez une ligne vide entre les paragraphes</label>
        <textarea name="body" rows={10} className="field resize-y" defaultValue={kept(state, "body", post.body)} />
        <FieldError state={state} name="body" />
      </div>
      <div className="sm:col-span-4">
        <label className="label">Verset (facultatif)</label>
        <input name="verseText" className="field" placeholder="Tout ce que vous faites, faites-le de bon cœur…" defaultValue={kept(state, "verseText", post.verseText)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Référence</label>
        <input name="verseRef" className="field" placeholder="Colossiens 3:23" defaultValue={kept(state, "verseRef", post.verseRef)} />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Ministère concerné</label>
        <select name="ministry" className="field" defaultValue={kept(state, "ministry", post.ministry)}>
          <option value="">Aucun</option>
          {ministries.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-night-800">
          <input type="checkbox" name="published" defaultChecked={keptCheck(state, "published", post.published)} className="size-4 accent-gold-500" /> Publié sur le blog et dans la galerie
        </label>
        <FieldError state={state} name="published" />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        <SubmitButton>Enregistrer</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
