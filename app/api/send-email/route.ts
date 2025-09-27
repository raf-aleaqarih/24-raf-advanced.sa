import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'info@raf-advanced.sa',
    pass: process.env.EMAIL_PASSWORD || 'Yussefali@1234'
  }
});

// Email template
const createEmailTemplate = (name: string, phone: string, message: string, source: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>استفسار جديد - مشروع 24</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            text-align: right;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
            
        .header {
            background: linear-gradient(135deg, #c48765, #34222e);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 15px;
            border-radius: 10px;
        }
        .content {
            padding: 20px;
        }
        .info-item {
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border-right: 4px solid #c48765;
        }
        .label {
            font-weight: bold;
            color: #34222e;
            margin-bottom: 5px;
            font-size: 16px;
        }
        .value {
            color: #666;
            font-size: 16px;
            font-weight: bold;
        }
        .project-info {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .project-info h3 {
            color: #34222e;
            margin-bottom: 10px;
            font-size: 18px;
            text-align: right;
        }
        .project-info p {
            color: #666;
            margin-bottom: 5px;
            font-size: 14px;
            text-align: right;
            padding-right: 15px;
            position: relative;
        }
        .project-info p::before {
            content: "•";
            position: absolute;
            right: 0;
            color: #c48765;
        }
        .contact-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #c48765;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            background-color: #34222e;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 12px;
        }
        .timestamp {
            color: #999;
            font-size: 14px;
            margin-top: 10px;
            font-weight: bold;
            text-align: center;
        }
        * {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://www.raf-advanced.sa/_next/image?url=%2Flogo_2.png&w=64&q=75" alt="شعار مشروع 24" class="logo">
            <h2>استفسار جديد - مشروع 24 حي الزهراء</h2>
        </div>
        <div class="content">
            <div class="info-item">
                <div class="label text-xl">الاسم</div>
                <div class="value text-xl">${name}</div>
            </div>
            <div class="info-item">
                <div class="label text-xl">رقم الهاتف</div>
                <div class="value text-xl">${phone}</div>
            </div>
            <div class="info-item">
                <div class="label text-xl">الرسالة</div>
                <div class="value text-xxl">
                 <p>
                أرغب في الاستفسار عن مشروع رقم 24 حي الزهراء</p>
                ${message || 'لا يوجد رسالة'}</div>
            </div>

             <div class="project-info">
                <h3>معلومات المشروع</h3>
                <p> موقع المشروع: حي الزهراء، جدة</p>
                <p> المساحات: تبدأ من 156 م²</p>
                <p> الأسعار: تبدأ من 830,000 ريال</p>
                <p> عدد الغرف: 4-5 غرف</p>
                <p> عدد دورات المياه: 4-5</p>
                <p> مصدر الزائر: ${source || 'غير محدد'}</p>
            </div>

            <div class="contact-buttons">
                <a href="https://wa.me/966${phone.replace(/\D/g, '')}" class="button">تواصل مع العميل واتساب</a>
                <a href="tel:${phone.replace(/\D/g, '')}" class="button">اتصل بالعميل </a>
            </div>

            <div class="timestamp ">
                تم إرسال الاستفسار في وقت: ${new Date().toLocaleString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </div>
        <div class="footer">
            <h3 class="text-xl text-white">© ${new Date().getFullYear()} مشروع 24. جميع الحقوق محفوظة</h3>
       
        </div>
    </div>
    
   
</body>
</html>
`;

export async function POST(request: Request) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers, status: 200 });
  }
  try {
    const { name, phone, message, source, utmParams } = await request.json();

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'info@raf-advanced.sa',
      to: '24_project@raf-advanced.sa',
      subject: `استفسار جديد من ${name}`,
      html: createEmailTemplate(name, phone, message, source)
    });

    // Save inquiry to database
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-one-pi-32.vercel.app/api';
      const inquiryResponse = await fetch(`${apiUrl}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          message,
          source: 'website',
          platform: source || 'direct',
          status: 'new',
          priority: 'medium',
          utmParams: utmParams
        })
      });

      if (!inquiryResponse.ok) {
        console.error('Failed to save inquiry to database');
      }
    } catch (dbError) {
      console.error('Error saving inquiry to database:', dbError);
      // Continue even if database save fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
