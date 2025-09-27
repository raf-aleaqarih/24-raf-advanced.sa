'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../../lib/api'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Link from 'next/link'
import { cn } from '../../../lib/utils'

interface User {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'editor'
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  createdAt: string
  updatedAt: string
  permissions: string[]
}

const roles = [
  { value: 'super_admin', label: 'مدير عام', color: 'bg-red-100 text-red-800' },
  { value: 'admin', label: 'مدير', color: 'bg-blue-100 text-blue-800' },
  { value: 'editor', label: 'محرر', color: 'bg-green-100 text-green-800' }
]

const statuses = [
  { value: 'active', label: 'نشط', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'غير نشط', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' }
]

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const queryClient = useQueryClient()

  // جلب قائمة المستخدمين
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', { searchTerm, roleFilter, statusFilter }],
    queryFn: () => usersApi.getAll({
      search: searchTerm,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 50
    }),
  })

  // حذف مستخدم
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // تغيير حالة المستخدم
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    toggleStatusMutation.mutate({ id, status: newStatus })
  }

  const filteredUsers = users?.data?.data || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600">حدث خطأ أثناء تحميل قائمة المستخدمين</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة المستخدمين</h1>
          <p className="page-subtitle">
            إدارة المستخدمين والصلاحيات في النظام
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          إضافة مستخدم
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="section-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pr-10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">جميع الأدوار</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">جميع الحالات</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">المستخدم</th>
              <th className="table-header-cell">الدور</th>
              <th className="table-header-cell">الحالة</th>
              <th className="table-header-cell">آخر دخول</th>
              <th className="table-header-cell">تاريخ الإنشاء</th>
              <th className="table-header-cell">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredUsers.map((user: User) => (
              <tr key={user._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.name ? (
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0)}
                        </span>
                      ) : (
                        <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    roles.find(r => r.value === user.role)?.color || 'bg-gray-100 text-gray-800'
                  )}>
                    {roles.find(r => r.value === user.role)?.label}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    statuses.find(s => s.value === user.status)?.color || 'bg-gray-100 text-gray-800'
                  )}>
                    {statuses.find(s => s.value === user.status)?.label}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-600">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('ar-SA')
                      : 'لم يسجل دخول'
                    }
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </td>
                <td className="table-cell-action">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(user._id, user.status)}
                      className={cn(
                        'btn-ghost btn-sm',
                        user.status === 'active' 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-green-600 hover:text-green-700'
                      )}
                    >
                      {user.status === 'active' ? 'إلغاء تفعيل' : 'تفعيل'}
                    </button>
                    
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/dashboard/users/${user._id}`}
                                  className={cn(
                                    'flex items-center px-4 py-2 text-sm transition-colors',
                                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                  )}
                                >
                                  <UserIcon className="w-4 h-4 ml-3" />
                                  عرض التفاصيل
                                </Link>
                              )}
                            </Menu.Item>
                            
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/dashboard/users/${user._id}/edit`}
                                  className={cn(
                                    'flex items-center px-4 py-2 text-sm transition-colors',
                                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                  )}
                                >
                                  <PencilIcon className="w-4 h-4 ml-3" />
                                  تعديل
                                </Link>
                              )}
                            </Menu.Item>
                            
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/dashboard/users/${user._id}/permissions`}
                                  className={cn(
                                    'flex items-center px-4 py-2 text-sm transition-colors',
                                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                  )}
                                >
                                  <ShieldCheckIcon className="w-4 h-4 ml-3" />
                                  الصلاحيات
                                </Link>
                              )}
                            </Menu.Item>
                            
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className={cn(
                                    'flex items-center w-full px-4 py-2 text-sm transition-colors text-red-600',
                                    active ? 'bg-red-50' : ''
                                  )}
                                >
                                  <TrashIcon className="w-4 h-4 ml-3" />
                                  حذف
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد مستخدمين
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'لم يتم العثور على مستخدمين تطابق معايير البحث'
              : 'ابدأ بإضافة أول مستخدم للنظام'
            }
          </p>
          <Link href="/dashboard/users/new" className="btn-primary">
            إضافة مستخدم جديد
          </Link>
        </div>
      )}
    </div>
  )
}
