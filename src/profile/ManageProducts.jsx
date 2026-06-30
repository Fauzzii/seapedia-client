import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { supabase } from '../supabase'
import useProfileStore from '../store/useProfileStore'
import { isPlaceholderUrl } from '../utils/imageHelper'

export default function ManageProducts({ user }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    },
    enabled: user?.activeRole === 'SELLER'
  })

  
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [prodName, setProdName] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodStock, setProdStock] = useState('')
  const [prodCategory, setProdCategory] = useState('Elektronik')
  const [prodImages, setProdImages] = useState([])
  const [uploading, setUploading] = useState(false)

  
  const { data: sellerProducts = [], isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/seller/products', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'SELLER'
  })

  
  const productSubmitMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProduct) {
        await axios.put(
          `http://localhost:5000/api/seller/products/${editingProduct.id}`,
          payload,
          { withCredentials: true }
        )
      } else {
        await axios.post(
          'http://localhost:5000/api/seller/products',
          payload,
          { withCredentials: true }
        )
      }
    },
    onSuccess: () => {
      setActionSuccess(editingProduct ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!')
      setShowProductModal(false)
      setProdName('')
      setProdDesc('')
      setProdPrice('')
      setProdStock('')
      setProdImages([])
      setProdCategory('Elektronik')
      setEditingProduct(null)
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menyimpan produk')
    }
  })

  
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:5000/api/seller/products/${id}`, { withCredentials: true })
    },
    onSuccess: () => {
      setActionSuccess('Produk berhasil dihapus!')
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menghapus produk')
    }
  })

  const handleNumberKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key)
    ) {
      e.preventDefault()
    }
  }

  const convertToWebP = (file, maxDim = 1200, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error(`File "${file.name}" bukan gambar.`))
        return
      }
      const MAX_SIZE_MB = 5
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        reject(new Error(`File "${file.name}" terlalu besar. Maksimal ${MAX_SIZE_MB}MB.`))
        return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height / width) * maxDim)
              width = maxDim
            } else {
              width = Math.round((width / height) * maxDim)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, '')
              resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }))
            } else {
              reject(new Error(`Konversi "${file.name}" ke WebP gagal.`))
            }
          }, 'image/webp', quality)
        }
        img.onerror = () => reject(new Error(`Gagal membaca gambar "${file.name}".`))
      }
      reader.onerror = () => reject(new Error(`Gagal membaca file "${file.name}".`))
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const totalCount = prodImages.length + files.length
    if (totalCount > 5) {
      setActionError('Maksimal 5 gambar untuk satu produk.')
      return
    }

    setUploading(true)
    setActionError('')
    const uploadedUrls = []

    for (const file of files) {
      try {
        const webpFile = await convertToWebP(file)

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`

        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, webpFile)

        if (error) {
          setActionError('Gagal mengunggah gambar ke Supabase.')
          console.error(error)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      } catch (err) {
        console.error(err)
        setActionError('Terjadi kesalahan saat mengunggah gambar')
      }
    }
    setProdImages(prev => [...prev, ...uploadedUrls])
    setUploading(false)
  }

  const handleProductSubmit = (e) => {
    e.preventDefault()
    clearActions()
    productSubmitMutation.mutate({
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      stock: parseInt(prodStock),
      images: prodImages,
      category: prodCategory
    })
  }

  const handleEditProductClick = (prod) => {
    clearActions()
    setEditingProduct(prod)
    setProdName(prod.name)
    setProdDesc(prod.description || '')
    setProdPrice(prod.price)
    setProdStock(prod.stock)
    setProdImages(prod.images ? prod.images.map(img => img.image_url) : [])
    setProdCategory(prod.category || 'Elektronik')
    setShowProductModal(true)
  }

  if (isLoading || isSummaryLoading) {
    return (
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-pulse">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-outline-variant/30 rounded-lg"></div>
            <div className="h-4 w-64 bg-outline-variant/20 rounded-md"></div>
          </div>
          <div className="h-10 w-36 bg-outline-variant/30 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/20 bg-background/50 flex flex-col justify-between overflow-hidden">
              <div className="h-40 bg-outline-variant/25 w-full animate-pulse"></div>
              <div className="p-5 flex-grow space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="h-4 w-28 bg-outline-variant/30 rounded-md"></div>
                  <div className="h-4 w-14 bg-outline-variant/35 rounded-full"></div>
                </div>
                <div className="h-3 w-full bg-outline-variant/20 rounded-md"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 w-20 bg-outline-variant/35 rounded-md"></div>
                  <div className="h-4 w-12 bg-outline-variant/20 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-outline-variant/10 p-3">
                <div className="h-6 w-12 bg-outline-variant/20 rounded-md"></div>
                <div className="h-6 w-12 bg-outline-variant/20 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (user?.activeRole === 'SELLER' && !summaryData?.seller) {
    return (
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-12 space-y-6">
        <span className="material-symbols-outlined text-6xl text-warning-orange">storefront</span>
        <h3 className="font-headline-xl text-headline-xl text-primary font-bold">Toko Belum Dibuat</h3>
        <p className="text-body-sm text-on-surface-variant max-w-md">
          Anda belum membuat profil Toko Anda. Profil Toko wajib dibuat sebelum Anda dapat menambahkan dan mengelola produk.
        </p>
        <button
          onClick={() => navigate('/seller/store')}
          className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all outline-none"
        >
          Buat Toko Sekarang
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full relative animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-headline-xl text-headline-xl text-primary font-bold">Kelola Produk Toko</h3>
          <p className="text-body-sm text-on-surface-variant">Tambahkan dan ubah produk yang Anda jual di marketplace.</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setProdName('')
            setProdDesc('')
            setProdPrice('')
            setProdStock('')
            setProdImages([])
            setProdCategory('Elektronik')
            setShowProductModal(true)
            clearActions()
          }}
          className="h-10 px-4 bg-secondary text-white font-bold rounded-xl flex items-center gap-2 text-sm hover:bg-secondary/90 transition-all outline-none animate-fade-in"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Produk Baru
        </button>
      </div>

      {actionError && (
        <div className="p-4 mb-6 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="font-semibold text-on-surface">{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 mb-6 text-sm text-success-green bg-success-green/10 rounded-xl border border-success-green/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-success-green text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-semibold text-on-surface">{actionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {sellerProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant border border-dashed border-outline-variant/60 rounded-2xl w-full">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
            <p className="text-sm font-semibold">Belum ada produk di toko Anda.</p>
          </div>
        ) : (
          sellerProducts.map((prod) => {
             const isDeleting = deleteProductMutation.isPending && deleteProductMutation.variables === prod.id
             const firstImage = prod.images && prod.images.length > 0 ? prod.images[0].image_url : null
             return (
               <div key={prod.id.toString()} className="bg-background rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                 <div className="relative h-40 bg-surface-container-high overflow-hidden shrink-0 flex items-center justify-center">
                   {isPlaceholderUrl(firstImage) ? (
                     <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-2xl select-none">
                       <span>{prod.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
                     </div>
                   ) : (
                     <img
                       alt={prod.name}
                       className="w-full h-full object-cover"
                       src={firstImage}
                     />
                   )}
                   {prod.images && prod.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md font-bold">
                      +{prod.images.length - 1} Gambar
                    </span>
                  )}
                </div>
                <div className="p-5 flex-grow space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-primary line-clamp-1 flex-grow">{prod.name}</h4>
                    <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">{prod.category || 'Jelajahi'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{prod.description}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-extrabold text-sm text-secondary">Rp {Number(prod.price).toLocaleString('id-ID')}</span>
                    <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">Stok: {prod.stock}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-outline-variant/20 p-3 bg-surface-container-lowest">
                  <button
                    disabled={isDeleting}
                    onClick={() => handleEditProductClick(prod)}
                    className="px-3 py-1.5 text-xs text-secondary hover:bg-secondary/10 rounded-lg transition-colors font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Ubah
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={() => deleteProductMutation.mutate(prod.id)}
                    className="px-3 py-1.5 text-xs text-error hover:bg-red-50 rounded-lg transition-colors font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Hapus
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>

    {showProductModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute right-6 top-6 text-outline hover:text-on-surface outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">
              {editingProduct ? 'Ubah Produk' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Lengkapi informasi spesifikasi produk yang Anda tawarkan.</p>

            {actionError && (
              <div className="p-4 mb-6 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span className="font-semibold text-on-surface">{actionError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Nama Produk</label>
                <input
                  required
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Masukan Nama Produk"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Deskripsi Produk</label>
                <textarea
                  required
                  rows="3"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Masukan Deskripsi Produk"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    value={prodPrice}
                    onKeyDown={handleNumberKeyDown}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setProdPrice(val)
                    }}
                    placeholder="Masukan Harga Produk"
                    className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Jumlah Stok</label>
                  <input
                    required
                    type="number"
                    value={prodStock}
                    onKeyDown={handleNumberKeyDown}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setProdStock(val)
                    }}
                    placeholder="Masukan Stok Produk"
                    className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Kategori Produk</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold cursor-pointer"
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Fesyen">Fesyen</option>
                  <option value="Peralatan Rumah">Peralatan Rumah</option>
                  <option value="Logistik">Logistik</option>
                  <option value="Barang Mewah">Barang Mewah</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Jelajahi">Jelajahi</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-outline tracking-wider block px-1">Gambar Produk</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {prodImages.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl border overflow-hidden bg-surface-container">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors select-none">
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-outline">add_a_photo</span>
                        <span className="text-[8px] font-bold text-outline uppercase tracking-wider mt-1">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={productSubmitMutation.isPending || uploading}
                className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2"
              >
                {productSubmitMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Simpan Produk'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
