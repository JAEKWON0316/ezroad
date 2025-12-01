'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MoreVertical, Shield, User, Briefcase, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { User as UserType, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: '', label: '전체' },
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
  USER: 'bg-gray-100 text-gray-700',
  BUSINESS: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState<UserType | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'role' | 'delete'; member: UserType } | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<UserType> = await adminApi.getMembers(page, 20, keyword || undefined);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="text-gray-500 mt-1">전체 회원을 관리합니다.</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="이메일 또는 닉네임으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회원</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User;
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {member.profileImage ? (
                            <img src={member.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-orange-500 font-medium">{member.nickname?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.nickname}</p>
                          <p className="text-sm text-gray-500">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role as keyof typeof roleColors]}`}>
                        <RoleIcon className="h-3.5 w-3.5" />
                        {roleOptions.find(r => r.value === member.role)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setActionModal({ type: 'role', member }); setNewRole(member.role); }}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          역할 변경
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'delete', member })}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Role Change Modal */}
      <Modal
        isOpen={actionModal?.type === 'role'}
        onClose={() => setActionModal(null)}
        title="역할 변경"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-medium">{actionModal?.member?.nickname}</span>님의 역할을 변경합니다.
          </p>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {roleOptions.filter(r => r.value).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1" onClick={handleRoleChange} isLoading={isSubmitting}>변경</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={actionModal?.type === 'delete'}
        onClose={() => setActionModal(null)}
        title="회원 삭제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말 <span className="font-medium">{actionModal?.member?.nickname}</span>님을 삭제하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDelete} isLoading={isSubmitting}>삭제</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
