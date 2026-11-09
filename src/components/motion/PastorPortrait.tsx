import Image from "next/image";

/** Portrait du pasteur. */
export function PastorPortrait({ name }: { name: string }) {
  return (
    <figure className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-b from-night-700 to-night-950">
        <Image src="/brand/pasteur-chabi-bouko-youssouf.png" alt={name} fill sizes="(max-width: 640px) 90vw, 384px" className="object-contain object-bottom" />
      </div>
    </figure>
  );
}
