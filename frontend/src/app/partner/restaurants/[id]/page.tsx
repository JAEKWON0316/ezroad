'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Store, Phone, MapPin, Clock, Globe, Camera, FileText, ArrowRight, UploadCloud, Trash2, Utensils, CalendarDays, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, fileApi } from '@/lib/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const restaurantSchema = z.object({
    name: z.string().min(2, '식당명은 2자 이상이어야 합니다'),
    category: z.string().min(1, '카테고리를 선택해주세요'),
    description: z.string().optional(),
    phone: z.string().optional(),
    zipcode: z.string().optional(),
    address: z.string().min(1, '주소를 입력해주세요'),
    addressDetail: z.string().optional(),
    website: z.string().optional(),
    businessHours: z.string().optional(),
    notice: z.string().optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

const categories = [
    '한식', '중식', '일식', '양식', '아시안', '분식', '패스트푸드', '치킨', '피자', '카페', '베이커리', '기타'
];

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: paramId } = use(params);
    const id = Number(paramId);
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [menuBoardImage, setMenuBoardImage] = useState<string | null>(null);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [isUploadingMenuBoard, setIsUploadingMenuBoard] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RestaurantFormData>({
        resolver: zodResolver(restaurantSchema),
    });

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'BUSINESS') {
            router.push('/login');
            return;
        }

        const fetchRestaurant = async () => {
            try {
                const data = await restaurantApi.getById(id);
                reset({
                    name: data.name,
                    category: data.category,
                    description: data.description,
                    phone: data.phone,
                    zipcode: data.zipcode,
                    address: data.address,
                    addressDetail: data.addressDetail,
                    website: data.website,
                    businessHours: data.businessHours,
                    notice: data.notice,
                });
                setThumbnail(data.thumbnail || null);
                setMenuBoardImage(data.menuBoardImage || null);
            } catch (error) {
                toast.error('식당 정보를 불러오는데 실패했습니다');
                router.push('/partner');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchRestaurant();
        }
    }, [id, authLoading, isAuthenticated, user, router, reset]);

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingThumbnail(true);
        try {
            const result = await fileApi.upload(file, 'restaurant');
            setThumbnail(result.url);
            toast.success('대표 이미지가 업데이트되었습니다');
        } catch {
            toast.error('이미지 업로드에 실패했습니다');
        } finally {
            setIsUploadingThumbnail(false);
        }
    };

    const handleMenuBoardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingMenuBoard(true);
        try {
            const result = await fileApi.upload(file, 'menupan');
            setMenuBoardImage(result.url);
            toast.success('메뉴판 이미지가 업데이트되었습니다');
        } catch {
            toast.error('이미지 업로드에 실패했습니다');
        } finally {
            setIsUploadingMenuBoard(false);
        }
    };

    const onSubmit = async (data: RestaurantFormData) => {
        setIsSubmitting(true);
        try {
            await restaurantApi.update(id, {
                ...data,
                thumbnail: thumbnail || undefined,
                menuBoardImage: menuBoardImage || undefined,
            });
            toast.success('식당 정보가 수정되었습니다');
            router.push('/partner'); // Or stay on the page? Usually better to go back to dashboard or stay. Let's go back.
        } catch {
            toast.error('식당 정보 수정에 실패했습니다');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('정말로 이 식당을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            await restaurantApi.delete(id);
            toast.success('식당이 삭제되었습니다');
            router.push('/partner');
        } catch {
            toast.error('식당 삭제에 실패했습니다');
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
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-700"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <h1 className="font-bold text-xl text-gray-900">식당 정보 수정</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex text-sm text-gray-500 font-medium border-r border-gray-300 pr-4 mr-4 gap-6">
                            <button onClick={() => router.push(`/partner/restaurants/${id}/menus`)} className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
                                <Utensils className="w-4 h-4" /> 메뉴 관리
                            </button>
                            <button onClick={() => router.push(`/partner/restaurants/${id}/reservations`)} className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4" /> 예약 관리
                            </button>
                            <button onClick={() => router.push(`/partner/restaurants/${id}/waitings`)} className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
                                <Users className="w-4 h-4" /> 웨이팅 관리
                            </button>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="식당 삭제"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Images */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Camera className="h-5 w-5 text-orange-500" />
                                    <h2 className="font-semibold text-gray-900">가게 이미지</h2>
                                </div>

                                {/* Thumbnail Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">대표 이미지 (필수)</label>
                                    <label className={`block w-full aspect-video rounded-xl cursor-pointer overflow-hidden border-2 border-dashed transition-all group relative ${thumbnail ? 'border-transparent' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
                                        }`}>
                                        {thumbnail ? (
                                            <>
                                                <Image src={thumbnail} alt="Thumbnail" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="text-white h-8 w-8" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                                {isUploadingThumbnail ? (
                                                    <Loading size="sm" />
                                                ) : (
                                                    <>
                                                        <UploadCloud className="h-8 w-8 mb-2" />
                                                        <span className="text-xs font-medium">클릭하여 업로드</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                            disabled={isUploadingThumbnail}
                                        />
                                    </label>
                                </div>

                                {/* Menu Board Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">메뉴판 이미지</label>
                                    <label className={`block w-full aspect-[3/4] rounded-xl cursor-pointer overflow-hidden border-2 border-dashed transition-all group relative ${menuBoardImage ? 'border-transparent' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
                                        }`}>
                                        {menuBoardImage ? (
                                            <>
                                                <Image src={menuBoardImage} alt="Menu Board" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FileText className="text-white h-8 w-8" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                                {isUploadingMenuBoard ? (
                                                    <Loading size="sm" />
                                                ) : (
                                                    <>
                                                        <FileText className="h-8 w-8 mb-2" />
                                                        <span className="text-xs font-medium">메뉴판 업로드</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleMenuBoardChange}
                                            className="hidden"
                                            disabled={isUploadingMenuBoard}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info Card */}
                            <div className="glass-card p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-4">
                                    <Store className="h-5 w-5 text-orange-500" />
                                    <h2 className="font-semibold text-gray-900">기본 정보</h2>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="식당명"
                                        placeholder="손님들에게 보여질 식당 이름을 입력하세요"
                                        error={errors.name?.message}

                                        className="bg-white/50 focus:bg-white"
                                        {...register('name')}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">카테고리</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                                                {...register('category')}
                                            >
                                                <option value="">카테고리 선택</option>
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-500 ml-1">{errors.category.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">식당 소개</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                            rows={4}
                                            placeholder="우리 가게만의 특별한 점을 소개해주세요"
                                            {...register('description')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="전화번호"
                                            leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                            placeholder="02-1234-5678"
                                            className="bg-white/50 focus:bg-white"
                                            {...register('phone')}
                                        />

                                        <Input
                                            label="웹사이트"
                                            leftIcon={<Globe className="h-4 w-4 text-gray-400" />}
                                            placeholder="https://example.com"
                                            className="bg-white/50 focus:bg-white"
                                            {...register('website')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="glass-card p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-4">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    <h2 className="font-semibold text-gray-900">위치 정보</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-1/3">
                                        <Input
                                            label="우편번호"
                                            placeholder="12345"
                                            className="bg-white/50 focus:bg-white"
                                            {...register('zipcode')}
                                        />
                                    </div>

                                    <Input
                                        label="주소"
                                        placeholder="도로명 주소"
                                        error={errors.address?.message}

                                        className="bg-white/50 focus:bg-white"
                                        {...register('address')}
                                    />

                                    <Input
                                        label="상세 주소"
                                        placeholder="동/호수, 층수 등 상세 주소"

                                        className="bg-white/50 focus:bg-white"
                                        {...register('addressDetail')}
                                    />
                                </div>
                            </div>

                            {/* Operations Card */}
                            <div className="glass-card p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-4">
                                    <Clock className="h-5 w-5 text-purple-500" />
                                    <h2 className="font-semibold text-gray-900">운영 정보</h2>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="영업 시간"
                                        placeholder="예: 매일 10:00 - 22:00 (라스트오더 21:00)"

                                        className="bg-white/50 focus:bg-white"
                                        {...register('businessHours')}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">공지사항</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                            rows={3}
                                            placeholder="휴무일, 예약 관련 안내 등 손님에게 알릴 내용을 입력하세요"
                                            {...register('notice')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-4">
                        <Button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-8 rounded-full"
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isSubmitting}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                            className="w-full md:w-auto px-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/20"
                        >
                            수정사항 저장
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
