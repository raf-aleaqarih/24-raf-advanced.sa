const ProjectInfo = require('../models/ProjectInfo');
const axios = require('axios');

// الحصول على معلومات المشروع
const getProjectInfo = async (req, res) => {
  try {
    let projectInfo = await ProjectInfo.findOne();
    
    // إنشاء معلومات افتراضية إذا لم توجد
    if (!projectInfo) {
      projectInfo = new ProjectInfo({});
      await projectInfo.save();
    }

    res.json({
      success: true,
      data: projectInfo
    });
  } catch (error) {
    console.error('خطأ في جلب معلومات المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب معلومات المشروع',
      error: error.message
    });
  }
};

// تحديث معلومات المشروع
const updateProjectInfo = async (req, res) => {
  try {
    let projectInfo = await ProjectInfo.findOne();
    
    if (!projectInfo) {
      projectInfo = new ProjectInfo(req.body);
    } else {
      Object.assign(projectInfo, req.body);
    }
    
    await projectInfo.save();

    res.json({
      success: true,
      data: projectInfo,
      message: 'تم تحديث معلومات المشروع بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث معلومات المشروع:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث معلومات المشروع',
      error: error.message
    });
  }
};

// الحصول على إحصائيات المشروع
const getProjectStats = async (req, res) => {
  try {
    const ApartmentModel = require('../models/ApartmentModel');
    const ProjectFeature = require('../models/ProjectFeature');
    const ProjectWarranty = require('../models/ProjectWarranty');
    const ProjectMedia = require('../models/ProjectMedia');
    const Admin = require('../models/Admin');

    const [
      totalApartments,
      activeApartments,
      totalFeatures,
      activeFeatures,
      totalWarranties,
      totalMedia,
      totalAdmins,
      activeAdmins
    ] = await Promise.all([
      ApartmentModel.countDocuments(),
      ApartmentModel.countDocuments({ isActive: true }),
      ProjectFeature.countDocuments(),
      ProjectFeature.countDocuments({ isActive: true }),
      ProjectWarranty.countDocuments(),
      ProjectMedia.countDocuments(),
      Admin.countDocuments(),
      Admin.countDocuments({ isActive: true })
    ]);

    // حساب متوسط السعر
    const apartments = await ApartmentModel.find({ isActive: true });
    const avgPrice = apartments.length > 0 
      ? apartments.reduce((sum, apt) => sum + apt.price.amount, 0) / apartments.length
      : 0;

    const stats = {
      apartments: {
        total: totalApartments,
        active: activeApartments,
        avgPrice: Math.round(avgPrice)
      },
      features: {
        total: totalFeatures,
        active: activeFeatures
      },
      warranties: {
        total: totalWarranties
      },
      media: {
        total: totalMedia
      },
      admins: {
        total: totalAdmins,
        active: activeAdmins
      },
      // إحصائيات وهمية للعرض التوضيحي
      inquiries: {
        total: 156,
        thisWeek: 18,
        thisMonth: 67
      },
      views: {
        total: 12400,
        today: 340,
        thisWeek: 2100
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المشروع',
      error: error.message
    });
  }
};

// الحصول على إحصائيات عامة للموقع العام
const getPublicStats = async (req, res) => {
  try {
    const ApartmentModel = require('../models/ApartmentModel');

    const [
      totalApartments,
      activeApartments
    ] = await Promise.all([
      ApartmentModel.countDocuments(),
      ApartmentModel.countDocuments({ isActive: true })
    ]);

    // حساب متوسط السعر
    const apartments = await ApartmentModel.find({ isActive: true });
    const avgPrice = apartments.length > 0 
      ? apartments.reduce((sum, apt) => sum + apt.price.amount, 0) / apartments.length
      : 0;

    const minPrice = apartments.length > 0 
      ? Math.min(...apartments.map(apt => apt.price.amount))
      : 0;

    const maxPrice = apartments.length > 0 
      ? Math.max(...apartments.map(apt => apt.price.amount))
      : 0;

    const publicStats = {
      totalApartments: activeApartments,
      avgPrice: Math.round(avgPrice),
      priceRange: {
        min: minPrice,
        max: maxPrice
      },
      // إحصائيات عامة للعرض
      totalViews: 12400,
      totalInquiries: 156
    };

    res.json({
      success: true,
      data: publicStats
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات العامة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات العامة',
      error: error.message
    });
  }
};

// استخراج الإحداثيات من رابط Google Maps
const extractCoordinatesFromGoogleMaps = async (req, res) => {
  try {
    const { googleMapsUrl } = req.body;
    
    if (!googleMapsUrl) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال رابط Google Maps'
      });
    }

    // استخراج الإحداثيات من الرابط
    let latitude, longitude;
    
    // معالجة روابط Google Maps المختلفة
    if (googleMapsUrl.includes('@')) {
      // رابط من النوع: https://maps.google.com/maps?q=lat,lng
      const match = googleMapsUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        latitude = parseFloat(match[1]);
        longitude = parseFloat(match[2]);
      }
    } else if (googleMapsUrl.includes('!3d') && googleMapsUrl.includes('!2d')) {
      // رابط embed من النوع: !3d21.60813558568744!2d39.14033718505742
      const latMatch = googleMapsUrl.match(/!3d(-?\d+\.?\d*)/);
      const lngMatch = googleMapsUrl.match(/!2d(-?\d+\.?\d*)/);
      if (latMatch && lngMatch) {
        latitude = parseFloat(latMatch[1]);
        longitude = parseFloat(lngMatch[1]);
      }
    } else if (googleMapsUrl.includes('maps.google.com/maps/place/')) {
      // رابط مكان من Google Maps
      try {
        // استخدام Google Geocoding API للحصول على الإحداثيات
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: googleMapsUrl,
            key: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'
          }
        });
        
        if (response.data.results && response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          latitude = location.lat;
          longitude = location.lng;
        }
      } catch (error) {
        console.error('خطأ في استخدام Google Geocoding API:', error);
      }
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم العثور على إحداثيات صحيحة في الرابط'
      });
    }

    // تحديث معلومات المشروع
    let projectInfo = await ProjectInfo.findOne();
    if (!projectInfo) {
      projectInfo = new ProjectInfo({});
    }

    projectInfo.location.coordinates.latitude = latitude;
    projectInfo.location.coordinates.longitude = longitude;
    projectInfo.location.googleMapsUrl = googleMapsUrl;
    
    // إنشاء رابط embed جديد
    projectInfo.location.mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3709.430667951573!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDM2JzI5LjMiTiAzOcKwMDgnMTcuMyJF!5e0!3m2!1sar!2seg!4v1752662254447!5m2!1sar!2seg&z=${projectInfo.location.mapSettings?.zoom || 15}`;

    await projectInfo.save();

    res.json({
      success: true,
      data: {
        latitude,
        longitude,
        googleMapsUrl,
        mapEmbedUrl: projectInfo.location.mapEmbedUrl
      },
      message: 'تم استخراج الإحداثيات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في استخراج الإحداثيات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في استخراج الإحداثيات',
      error: error.message
    });
  }
};

// تحديث إعدادات الخريطة
const updateMapSettings = async (req, res) => {
  try {
    const { latitude, longitude, zoom, mapType, googleMapsUrl, address, nearbyLandmarks } = req.body;
    
    let projectInfo = await ProjectInfo.findOne();
    if (!projectInfo) {
      projectInfo = new ProjectInfo({});
    }

    if (latitude !== undefined) projectInfo.location.coordinates.latitude = latitude;
    if (longitude !== undefined) projectInfo.location.coordinates.longitude = longitude;
    if (zoom !== undefined) {
      if (!projectInfo.location.mapSettings) projectInfo.location.mapSettings = {};
      projectInfo.location.mapSettings.zoom = zoom;
    }
    if (mapType !== undefined) {
      if (!projectInfo.location.mapSettings) projectInfo.location.mapSettings = {};
      projectInfo.location.mapSettings.mapType = mapType;
    }
    if (googleMapsUrl !== undefined) projectInfo.location.googleMapsUrl = googleMapsUrl;
    if (address !== undefined) projectInfo.location.address = address;
    if (nearbyLandmarks !== undefined) projectInfo.location.nearbyLandmarks = nearbyLandmarks;

    // إنشاء رابط embed جديد
    const lat = projectInfo.location.coordinates.latitude;
    const lng = projectInfo.location.coordinates.longitude;
    const zoomLevel = projectInfo.location.mapSettings?.zoom || 15;
    
    projectInfo.location.mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3709.430667951573!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDM2JzI5LjMiTiAzOcKwMDgnMTcuMyJF!5e0!3m2!1sar!2seg!4v1752662254447!5m2!1sar!2seg&z=${zoomLevel}`;

    await projectInfo.save();

    res.json({
      success: true,
      data: projectInfo,
      message: 'تم تحديث إعدادات الخريطة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث إعدادات الخريطة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الخريطة',
      error: error.message
    });
  }
};

module.exports = {
  getProjectInfo,
  updateProjectInfo,
  getProjectStats,
  getPublicStats,
  extractCoordinatesFromGoogleMaps,
  updateMapSettings
};
