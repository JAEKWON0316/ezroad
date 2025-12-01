'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Camera } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-gray-900">메뉴 관리</h1>
          </div>
          <Button onClick={openAddModal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            메뉴 추가
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {menus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-4">등록된 메뉴가 없습니다</p>
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4 mr-1" />
              첫 메뉴 추가하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${!menu.isVisible ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center p-4">
                  <div className="flex items-center gap-3 flex-shrink-0 mr-4">
                    <GripVertical className="h-5 w-5 text-gray-300 cursor-move" />
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {menu.thumbnail ? (
                        <img src={menu.thumbnail} alt={menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{menu.name}</h3>
                      {!menu.isVisible && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">숨김</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{menu.description || '설명 없음'}</p>
                    <p className="text-orange-500 font-semibold mt-1">
                      {menu.price.toLocaleString()}원
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleToggleVisibility(menu)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      title={menu.isVisible ? '숨기기' : '표시하기'}
                    >
                      {menu.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(menu)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, id: menu.id })}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
        title={editModal.menu ? '메뉴 수정' : '메뉴 추가'}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">메뉴 이미지</p>
            <label className="block w-full aspect-video bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 overflow-hidden">
              {formData.thumbnail ? (
                <img src={formData.thumbnail} alt="Menu" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  {isUploadingImage ? <Loading size="sm" /> : <Camera className="h-8 w-8 mb-2" />}
                  <span className="text-sm">이미지 업로드</span>
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

          <Input
            label="메뉴명 *"
            placeholder="메뉴 이름을 입력하세요"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label="가격 *"
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={3}
              placeholder="메뉴 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditModal({ isOpen: false, menu: null })}
            >
              취소
            </Button>
            <Button className="flex-1" onClick={handleSubmit} isLoading={isSubmitting}>
              {editModal.menu ? '수정' : '추가'}
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
        <div className="space-y-4">
          <p className="text-gray-600">정말 이 메뉴를 삭제하시겠습니까?</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
            >
              취소
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
