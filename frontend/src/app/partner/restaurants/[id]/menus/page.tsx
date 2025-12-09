'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit, Trash2, Eye, EyeOff, Camera, Utensils } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { menuApi, fileApi } from '@/lib/api';
import { Menu } from '@/types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

export default function MenuManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; menu: Menu | null }>({
    isOpen: false,
    menu: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    thumbnail: '',
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.getByRestaurant(parseInt(restaurantId));
      setMenus(data);
    } catch {
      toast.error('메뉴 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'BUSINESS') {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      fetchMenus();
    }
  }, [authLoading, isAuthenticated, user, router, fetchMenus]);

  const openAddModal = () => {
    setFormData({ name: '', price: '', description: '', thumbnail: '' });
    setEditModal({ isOpen: true, menu: null });
  };

  const openEditModal = (menu: Menu) => {
    setFormData({
      name: menu.name,
      price: menu.price.toString(),
      description: menu.description || '',
      thumbnail: menu.thumbnail || '',
    });
    setEditModal({ isOpen: true, menu });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await fileApi.upload(file, 'menu');
      setFormData(prev => ({ ...prev, thumbnail: result.url }));
      toast.success('이미지가 업로드되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error('메뉴명과 가격을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const menuData = {
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description || undefined,
        thumbnail: formData.thumbnail || undefined,
        restaurantId: parseInt(restaurantId),
      };

      if (editModal.menu) {
        await menuApi.update(editModal.menu.id, menuData);
        toast.success('메뉴가 수정되었습니다');
      } else {
        await menuApi.create(menuData);
        toast.success('메뉴가 추가되었습니다');
      }

      setEditModal({ isOpen: false, menu: null });
      fetchMenus();
    } catch {
      toast.error(editModal.menu ? '메뉴 수정에 실패했습니다' : '메뉴 추가에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await menuApi.delete(deleteModal.id);
      toast.success('메뉴가 삭제되었습니다');
      setDeleteModal({ isOpen: false, id: null });
      fetchMenus();
    } catch {
      toast.error('메뉴 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async (menu: Menu) => {
    try {
      await menuApi.toggleVisibility(menu.id);
      toast.success(menu.isVisible ? '메뉴가 숨겨졌습니다' : '메뉴가 표시됩니다');
      fetchMenus();
    } catch {
      toast.error('메뉴 상태 변경에 실패했습니다');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/10 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-700"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="font-bold text-xl text-gray-900">메뉴 관리</h1>
          </div>
          <Button onClick={openAddModal} size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/20">
            <Plus className="h-4 w-4 mr-1.5" />
            메뉴 추가
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 glass-card rounded-2xl text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <Utensils className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 메뉴가 없습니다</h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              우리 가게의 맛있는 메뉴를 등록하여 손님들에게 보여주세요!
            </p>
            <Button onClick={openAddModal} className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/20">
              <Plus className="h-5 w-5 mr-2" />
              첫 메뉴 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className={`glass-card rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${!menu.isVisible ? 'opacity-70 grayscale' : ''
                  }`}
              >
                {/* Image Area */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {menu.thumbnail ? (
                    <img
                      src={menu.thumbnail}
                      alt={menu.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50/50">
                      <Utensils className="h-10 w-10 text-gray-300" />
                    </div>
                  )}

                  {/* Status Badge */}
                  {!menu.isVisible && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      숨김 처리됨
                    </div>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <button
                      onClick={() => handleToggleVisibility(menu)}
                      className="p-3 bg-white/90 text-gray-700 hover:text-orange-600 rounded-full hover:bg-white transition-colors shadow-lg"
                      title={menu.isVisible ? '숨기기' : '표시하기'}
                    >
                      {menu.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(menu)}
                      className="p-3 bg-white/90 text-gray-700 hover:text-blue-600 rounded-full hover:bg-white transition-colors shadow-lg"
                      title="수정"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, id: menu.id })}
                      className="p-3 bg-white/90 text-gray-700 hover:text-red-600 rounded-full hover:bg-white transition-colors shadow-lg"
                      title="삭제"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors line-clamp-1">{menu.name}</h3>
                    <div className="text-right">
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 text-lg">
                        {menu.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm font-medium ml-0.5">원</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 h-10 leading-relaxed">
                    {menu.description || '메뉴 설명이 없습니다.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, menu: null })}
        title={editModal.menu ? '메뉴 수정' : '새 메뉴 추가'}
      >
        <div className="space-y-6 pt-2">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 이미지</label>
            <label className={`block w-full aspect-video rounded-xl cursor-pointer overflow-hidden border-2 border-dashed transition-all group relative ${formData.thumbnail ? 'border-transparent' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50/30'
              }`}>
              {formData.thumbnail ? (
                <>
                  <img src={formData.thumbnail} alt="Menu" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-8 w-8" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                  {isUploadingImage ? (
                    <Loading size="sm" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 mb-2" />
                      <span className="text-xs font-medium">클릭하여 이미지 업로드</span>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploadingImage}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="메뉴명"
              placeholder="예: 김치찌개"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}

            />
            <Input
              label="가격"
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}

            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">설명</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
              rows={3}
              placeholder="메뉴에 대한 설명을 입력해주세요 (선택)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 py-3 text-base rounded-xl"
              onClick={() => setEditModal({ isOpen: false, menu: null })}
            >
              취소
            </Button>
            <Button
              className="flex-1 py-3 text-base rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/20"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {editModal.menu ? '수정 완료' : '메뉴 추가'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="메뉴 삭제"
      >
        <div className="space-y-6 pt-2">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">정말 삭제하시겠습니까?</h3>
            <p className="text-gray-500 text-sm">
              삭제된 메뉴는 복구할 수 없습니다.<br />
              신중하게 결정해주세요.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-3 text-base rounded-xl"
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
            >
              취소
            </Button>
            <Button
              className="flex-1 py-3 text-base rounded-xl bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/20"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
