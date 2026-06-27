import avatar1Img from '../assets/avatar-1.jpg'
import avatar2Img from '../assets/avatar-2.jpg'
import avatar3Img from '../assets/avatar-3.jpg'
import avatar4Img from '../assets/avatar-4.jpg'

const AVATARS = [avatar1Img, avatar2Img, avatar3Img, avatar4Img]

export default function Community() {
  return (
    <section className="py-section-gap-lg">
      <div className="max-w-container-max mx-auto px-gutter text-center">
        <div className="mb-12 flex justify-center -space-x-4 overflow-hidden">
          {AVATARS.map((avatar, idx) => (
            <img 
              key={idx}
              alt={`User ${idx + 1}`}
              className="inline-block h-16 w-16 rounded-full ring-4 ring-white object-cover" 
              src={avatar}
            />
          ))}
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-white ring-4 ring-white font-bold font-label-md text-label-md">
            +2k
          </div>
        </div>

        <h2 className="font-headline-4xl text-headline-4xl text-primary mb-6">
          Dipercaya oleh Komunitas Global
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
          &quot;Seapedia telah mentransformasi rantai pasok kami. Visibilitas dan alat kelas atas yang disediakan tidak tertandingi dalam ruang perdagangan global.&quot;
        </p>

        <div className="flex items-center justify-center gap-2 mb-12">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i}
              className="material-symbols-outlined text-warning-orange" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          ))}
          <span className="font-headline-xl text-headline-xl text-primary font-bold ml-2">
            4.9/5 dari Pengguna Bisnis Terverifikasi
          </span>
        </div>
      </div>
    </section>
  )
}
