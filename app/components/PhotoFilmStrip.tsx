"use client";

type Photo = {
  src: string;
  position?: string;
  brightness?: number;
};

const photosCol1: Photo[] = [
  { src: "/gallery/photo1.JPG" },
  { src: "/gallery/photo2.jpeg" },
  { src: "/gallery/photo3.JPG" },
  { src: "/gallery/photo4.jpeg" },
];

const photosCol2: Photo[] = [
  { src: "/gallery/photo5.jpeg" },
  { src: "/gallery/photo6.jpeg", position: "center 15%" },
  { src: "/gallery/photo7.jpg" },
  { src: "/gallery/photo8.jpg" },
];

function PhotoColumn({
  photos,
  reverse = false,
}: {
  photos: Photo[];
  reverse?: boolean;
}) {
  const looped = [...photos, ...photos, ...photos];

  return (
    <div className="overflow-hidden h-full w-64 md:w-72">
      <div
        className={`flex flex-col gap-4 ${
          reverse ? "animate-marquee-vertical-reverse" : "animate-marquee-vertical"
        }`}
      >
        {looped.map((photo, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 md:w-72 h-56 md:h-64 rounded-xl overflow-hidden border border-white/10s"
          >
            <img
              src={photo.src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                objectPosition: photo.position || "center",
                filter: photo.brightness
                  ? `brightness(${photo.brightness})`
                  : undefined,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export default function PhotoFilmStrip() {
  return (
    <div
      className="flex gap-4 h-full pointer-events-none select-none"
      style={{ transform: "rotate(8deg) scale(1.1)" }}
    >
      <PhotoColumn photos={photosCol1} />
      <PhotoColumn photos={photosCol2} reverse />
    </div>
  );
}