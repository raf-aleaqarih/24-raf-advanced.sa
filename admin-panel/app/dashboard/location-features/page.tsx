'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, MapPin, Navigation, Car, Store, Plane, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { locationFeaturesAPI } from '@/lib/api'

interface LocationFeature {
  _id: string
  title: string
  description?: string
  icon: string
  category: 'nearby' | 'minutesFrom' | 'transport' | 'services' | 'entertainment'
  distance?: string
  displayOrder: number
  status: 'active' | 'inactive'
  isVisible: boolean
  additionalInfo?: string
  createdAt: string
  updatedAt: string
}

const categoryLabels = {
  nearby: 'قريب من',
  minutesFrom: 'دقائق من',
  transport: 'المواصلات',
  services: 'الخدمات',
  entertainment: 'الترفيه'
}

const getIcon = (iconName: string) => {
  const iconProps = { className: "h-4 w-4" }
  
  switch (iconName) {
    case 'MapPin':
      return <MapPin {...iconProps} />
    case 'Navigation':
      return <Navigation {...iconProps} />
    case 'Car':
      return <Car {...iconProps} />
    case 'Store':
      return <Store {...iconProps} />
    case 'Plane':
      return <Plane {...iconProps} />
    case 'Star':
      return <Star {...iconProps} />
    default:
      return <MapPin {...iconProps} />
  }
}

export default function LocationFeaturesPage() {
  const [features, setFeatures] = useState<LocationFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // جلب مميزات الموقع
  const fetchLocationFeatures = async () => {
    try {
      setLoading(true)
      const response = await locationFeaturesAPI.getAllFeatures({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter
      })
      
      setFeatures(response.data.data || [])
    } catch (error: any) {
      console.error('خطأ في جلب مميزات الموقع:', error)
      toast.error(error.response?.data?.message || 'فشل في جلب مميزات الموقع')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocationFeatures()
  }, [searchTerm, statusFilter, categoryFilter])

  // حذف ميزة موقع
  const deleteLocationFeature = async (id: string) => {
    try {
      await locationFeaturesAPI.deleteFeature(id)

      toast.success('تم حذف ميزة الموقع بنجاح')
      fetchLocationFeatures()
    } catch (error: any) {
      console.error('خطأ في حذف ميزة الموقع:', error)
      toast.error(error.response?.data?.message || 'فشل في حذف ميزة الموقع')
    }
  }

  // تغيير حالة الرؤية
  const toggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await locationFeaturesAPI.updateFeature(id, { isVisible: !isVisible })

      toast.success('تم تحديث حالة الرؤية بنجاح')
      fetchLocationFeatures()
    } catch (error: any) {
      console.error('خطأ في تحديث حالة الرؤية:', error)
      toast.error(error.response?.data?.message || 'فشل في تحديث حالة الرؤية')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مميزات الموقع</h1>
          <p className="text-muted-foreground">إدارة مميزات الموقع والخدمات المحيطة</p>
        </div>
        <Link href="/dashboard/location-features/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة ميزة موقع
          </Button>
        </Link>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في مميزات الموقع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="nearby">قريب من</SelectItem>
                <SelectItem value="minutesFrom">دقائق من</SelectItem>
                <SelectItem value="transport">المواصلات</SelectItem>
                <SelectItem value="services">الخدمات</SelectItem>
                <SelectItem value="entertainment">الترفيه</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول مميزات الموقع */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الأيقونة</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المسافة</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الرؤية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    لا توجد مميزات موقع
                  </TableCell>
                </TableRow>
              ) : (
                features.map((feature) => (
                  <TableRow key={feature._id}>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
                        {getIcon(feature.icon)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{feature.title}</div>
                        {feature.description && (
                          <div className="text-sm text-muted-foreground">{feature.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[feature.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>{feature.distance || '-'}</TableCell>
                    <TableCell>{feature.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                        {feature.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(feature._id, feature.isVisible)}
                      >
                        {feature.isVisible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/location-features/${feature._id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف ميزة الموقع</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف ميزة الموقع "{feature.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLocationFeature(feature._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
