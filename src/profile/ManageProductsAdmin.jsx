import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function ManageProductsAdmin({ user }) {
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [prodName, setProdName] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodStock, setProdStock] = useState('')
  const [prodCategory, setProdCategory] = useState('Elektronik')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/admin/monitoring/products', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'ADMIN'
  })

  const productSubmitMutation = useMutation({
    mutationFn: async (payload) => {
      await axios.put(
        `http://localhost:5000/api/admin/products/${editingProduct.id}`,
        payload,
        { withCredentials: true }
      )
    },
    onSuccess: () => {
      setActionSuccess('Produk berhasil diperbarui!')
      setShowModal(false)
      setProdName('')
      setProdDesc('')
      setProdPrice('')
      setProdStock('')
      setProdCategory('Elektronik')
      setEditingProduct(null)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal memperbarui produk')
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, { withCredentials: true })
    },
    onSuccess: () => {
      setActionSuccess('Produk berhasil dihapus!')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menghapus produk')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    clearActions()
    productSubmitMutation.mutate({
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      stock: parseInt(prodStock),
      category: prodCategory
    })
  }

  const handleEditClick = (p) => {
    clearActions()
    setEditingProduct(p)
    setProdName(p.name)
    setProdDesc(p.description || '')
    setProdPrice(p.price.toString())
    setProdStock(p.stock.toString())
    setProdCategory(p.category || 'Elektronik')
    setShowModal(true)
  }

  const handleNumberKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key)
    ) {
      e.preventDefault()
    }
  }

  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setProdPrice(val)
  }

  const handleStockChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setProdStock(val)
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-pulse">
        <div className="h-6 w-48 bg-outline-variant/30 rounded-lg"></div>
        <div className="h-64 bg-outline-variant/10 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-outline-variant rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 w-full">
      <div className="border-b border-outline-variant/10 pb-5">
        <h2 className="font-headline-2xl text-headline-2xl text-primary font-black">Kelola Produk (Admin)</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">Pantau dan ubah atau hapus katalog produk dari seluruh toko.</p>
      </div>

      {actionError && (
        <div className="p-4 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="font-semibold">{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 text-sm text-success-green bg-success-green/10 rounded-xl border border-success-green/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-success-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant text-[11px] font-bold text-outline uppercase tracking-wider">
              <th className="py-4 px-4">Nama Produk</th>
              <th className="py-4 px-4">Toko</th>
              <th className="py-4 px-4">Kategori</th>
              <th className="py-4 px-4">Harga</th>
              <th className="py-4 px-4">Stok</th>
              <th className="py-4 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                <td className="py-4 px-4 font-semibold text-sm">{p.name}</td>
                <td className="py-4 px-4 text-sm text-secondary font-bold">{p.store?.store_name || 'Toko Tidak Diketahui'}</td>
                <td className="py-4 px-4 text-xs font-semibold text-on-surface-variant">{p.category || 'Jelajahi'}</td>
                <td className="py-4 px-4 text-sm font-semibold text-primary">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                <td className="py-4 px-4 text-sm font-semibold">{p.stock} pcs</td>
                <td className="py-4 px-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors outline-none"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus produk ini secara permanen dari toko?')) {
                        deleteProductMutation.mutate(p.id)
                      }
                    }}
                    disabled={deleteProductMutation.isPending}
                    className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors outline-none"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => {
                setShowModal(false)
                setEditingProduct(null)
              }}
              className="absolute right-6 top-6 text-outline hover:text-on-surface outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">Edit Produk</h3>
            <p className="text-body-sm text-on-surface-variant mb-6 font-medium">Ubah rincian katalog produk terpilih.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Nama Produk</label>
                <input
                  required
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Nama Produk"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Deskripsi</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Deskripsi produk..."
                  rows="3"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Harga (Rupiah)</label>
                <input
                  required
                  type="number"
                  value={prodPrice}
                  onKeyDown={handleNumberKeyDown}
                  onChange={handlePriceChange}
                  placeholder="Contoh: 150000"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Stok</label>
                <input
                  required
                  type="number"
                  value={prodStock}
                  onKeyDown={handleNumberKeyDown}
                  onChange={handleStockChange}
                  placeholder="Contoh: 10"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Kategori</label>
                <input
                  required
                  type="text"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  placeholder="Elektronik, Pakaian, Makanan, dll"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={productSubmitMutation.isPending}
                className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2 mt-4"
              >
                {productSubmitMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Perbarui Produk'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
