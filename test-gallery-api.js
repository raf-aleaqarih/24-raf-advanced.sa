// اختبار API معرض الصور
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-one-pi-32.vercel.app/api'

async function testGalleryAPI() {
  try {
    console.log('🔍 اختبار API معرض الصور...')
    
    // اختبار جلب صور المشروع
    const response = await fetch(`${API_URL}/media/public/project-images`)
    const data = await response.json()
    
    console.log('📊 استجابة API:', {
      success: data.success,
      dataLength: data.data?.length || 0,
      message: data.message
    })
    
    if (data.success && data.data) {
      console.log('✅ تم جلب الصور بنجاح!')
      console.log('📸 عدد الصور:', data.data.length)
      
      data.data.forEach((image, index) => {
        console.log(`🖼️  صورة ${index + 1}:`, {
          id: image._id,
          title: image.title,
          category: image.category,
          isActive: image.isActive,
          hasFile: !!image.file?.url
        })
      })
    } else {
      console.log('⚠️  لا توجد صور في قاعدة البيانات')
    }
    
  } catch (error) {
    console.error('❌ خطأ في API:', error.message)
    console.log('💡 تأكد من:')
    console.log('   - تشغيل خادم API')
    console.log('   - صحة NEXT_PUBLIC_API_URL')
    console.log('   - إعدادات CORS')
  }
}

// تشغيل الاختبار
testGalleryAPI()
