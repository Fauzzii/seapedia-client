import useProductDetailsStore from '../../store/useProductDetailsStore'
import { isPlaceholderUrl } from '../../utils/imageHelper'

export default function ProductGallery({ images, fallbackImage, name }) {
  const { activeImageIdx, setActiveImageIdx } = useProductDetailsStore()

  const activeUrl = images[activeImageIdx]?.image_url || fallbackImage

  return (
    <div className="lg:col-span-5 space-y-6">
      <div className="relative group rounded-3xl overflow-hidden bg-white signature-shadow aspect-square border border-outline-variant/20">
        {isPlaceholderUrl(activeUrl) ? (
          <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-6xl select-none">
            <span>{name?.substring(0, 2).toUpperCase() || 'SP'}</span>
          </div>
        ) : (
          <img
            src={activeUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
      </div>

      {images && images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, idx) => {
            const isActive = activeImageIdx === idx
            return (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative rounded-xl overflow-hidden border-2 aspect-square w-20 h-20 shrink-0 transition-all outline-none ${
                  isActive
                    ? 'border-secondary ring-2 ring-secondary/20 shadow-md scale-95'
                    : 'border-outline-variant hover:border-secondary'
                }`}
              >
                {isPlaceholderUrl(img.image_url) ? (
                  <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xl select-none">
                    <span>{name?.substring(0, 2).toUpperCase() || 'SP'}</span>
                  </div>
                ) : (
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
