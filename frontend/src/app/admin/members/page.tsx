'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, User, Briefcase, Trash2, Settings, Filter, Mail, Calendar, MoreVertical } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { User as UserType, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: '', label: '전체 역할' },
  { value: 'USER', label: '일반 회원' },
  { value: 'BUSINESS', label: '사업자' },
  { value: 'ADMIN', label: '관리자' },
];

const roleIcons = {
  USER: User,
  BUSINESS: Briefcase,
  ADMIN: Shield,
};

const roleColors = {
  USER: 'bg-slate-50 text-slate-600 border-slate-100',
  BUSINESS: 'bg-blue-50 text-blue-600 border-blue-100',
  ADMIN: 'bg-purple-50 text-purple-600 border-purple-100',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionModal, setActionModal] = useState<{ type: 'role' | 'delete'; member: UserType } | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<UserType> = await adminApi.getMembers(
        page,
        12,
        keyword || undefined,
        roleFilter || undefined
      );
      setMembers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('회원 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, roleFilter, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchMembers();
  };

  const handleRoleChange = async () => {
    if (!actionModal || actionModal.type !== 'role' || !newRole) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateMemberRole(actionModal.member.id, newRole);
      toast.success('역할이 변경되었습니다');
      setActionModal(null);
      fetchMembers();
    } catch {
      toast.error('역할 변경에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!actionModal || actionModal.type !== 'delete') return;

    setIsSubmitting(true);
    try {
      await adminApi.deleteMember(actionModal.member.id);
      toast.success('회원이 삭제되었습니다');
      setActionModal(null);
      fetchMembers();
    } catch {
      toast.error('회원 삭제에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">회원 관리</h1>
          <p className="text-gray-500 font-medium mt-1">플랫폼 시스템을 이용하는 모든 회원 정보입니다.</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
            <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100">
              전체 회원
            </div>
          </div>
        </motion.div>
      </header>

      {/* Glassmorphism search area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl shadow-gray-200/50"
      >
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="이름, 닉네임, 이메일 등으로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none font-medium"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                className="w-full pl-11 pr-4 h-12 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-orange-200">
              필터 적용
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Grid display */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <Loading size="lg" />
            <p className="mt-4 text-gray-400 font-bold animate-pulse">데이터를 불러오는 중...</p>
          </motion.div>
        ) : members.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-400 font-medium">검색어나 권한 필터를 조정해 보세요.</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User;
              return (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-orange-100/50 transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {member.profileImage ? (
                        <Image src={member.profileImage} alt={member.nickname} fill className="object-cover" />
                      ) : (
                        <span className="text-orange-600 font-black text-2xl">{member.nickname?.charAt(0)}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors">{member.nickname}</h3>
                      <p className="text-sm font-bold text-gray-400">{member.name}</p>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-orange-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{new Date(member.createdAt).toLocaleDateString()} 가입</span>
                      </div>
                    </div>

                    <div className="w-full pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${roleColors[member.role as keyof typeof roleColors]}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleOptions.find(r => r.value === member.role)?.label.split(' ')[0]}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => { setActionModal({ type: 'role', member }); setNewRole(member.role); }}
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100/50"
                          title="역할 변경"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'delete', member })}
                          className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-100/50"
                          title="회원 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Premium Modals */}
      <Modal
        isOpen={actionModal?.type === 'role'}
        onClose={() => setActionModal(null)}
        title="회원 권한 관리"
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm font-medium text-blue-800 leading-relaxed">
              <span className="font-black underline decoration-2">{actionModal?.member?.nickname}</span>님의 시스템 이용 권한을 변경합니다. 권한 변경 시 즉시 모든 서비스 접근 범위가 조정됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">권한 선택</label>
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.filter(r => r.value).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewRole(option.value)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all border-2 ${newRole === option.value
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100 scale-[1.02]'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200'
                    }`}
                >
                  {option.label}
                  {newRole === option.value && <Shield className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-orange-200" onClick={handleRoleChange} isLoading={isSubmitting}>변경사항 저장</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={actionModal?.type === 'delete'}
        onClose={() => setActionModal(null)}
        title="회원 영구 삭제"
      >
        <div className="space-y-6 py-2">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-2">
            <Trash2 className="w-10 h-10" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900 mb-2">정말 회원을 삭제하시겠습니까?</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              <span className="text-rose-500 font-black">{actionModal?.member?.nickname}</span>님의 모든 데이터가 시스템에서 영구적으로 삭제됩니다.<br />이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1 h-14 rounded-2xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100" onClick={handleDelete} isLoading={isSubmitting}>영구 삭제 승인</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
