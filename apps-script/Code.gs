/**
 * NHMS Apps Script Backend
 * 
 * This script processes form submissions, fetches custom Lead Magnet data from 
 * the Cloudflare D1 API, parses markdown-style text, and sends a branded HTML email.
 * It also pushes the lead back to Cloudflare D1.
 * 
 * NEW: Handles PDF uploads from Admin and creates 'lead maganet pdf dont delete' folder.
 */

const API_BASE_URL = 'https://nhms-lead-engine.pages.dev';
const SENDER_NAME = "John Atkins";
const NOTIFICATION_EMAIL = "john@newhabitsmindsetshifts.com";
const FOLDER_NAME = "lead maganet pdf dont delete";

function doPost(e) {
  try {
    let name = '';
    let email = '';
    let phone = '';
    let magnetType = '';
    
    // Handle File Upload Action
    if (e.parameter && e.parameter.action === 'upload') {
      return handlePdfUpload(e);
    }
    
    // Handle OTP sending action
    if (e.parameter && e.parameter.action === 'sendOtp') {
      return handleSendOtp(e);
    }

    // Handle both form-encoded and JSON data for Leads
    if (e.parameter && e.parameter.name) {
      name = e.parameter.name;
      email = e.parameter.email;
      phone = e.parameter.phone || '';
      magnetType = e.parameter.magnetType;
    } else if (e.postData && e.postData.contents) {
      const data = JSON.parse(e.postData.contents);
      name = data.name;
      email = data.email;
      phone = data.phone || '';
      magnetType = data.magnetType || data.magnet_type;
    }

    if (!name || !email || !magnetType) {
      return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Missing required fields" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Fetch Lead Magnet data from Cloudflare API
    const magnetRes = UrlFetchApp.fetch(`${API_BASE_URL}/api/magnets`, { muteHttpExceptions: true });
    if (magnetRes.getResponseCode() !== 200) {
      throw new Error("Failed to fetch magnets from API: " + magnetRes.getContentText());
    }
    
    const magnets = JSON.parse(magnetRes.getContentText());
    const magnet = magnets.find(m => m.slug === magnetType);

    if (!magnet) {
      throw new Error(`Magnet not found for slug: ${magnetType}`);
    }

    // 2. Format Mail Content
    // Replace *text* with teal spans
    let rawMail = magnet.mail_content || `Hi ${name},\n\nHere is your resource!`;
    let htmlMail = rawMail
      .replace(/\*(.*?)\*/g, '<span style="color: #0d9488; font-weight: 600;">$1</span>')
      .replace(/\n/g, '<br>');

    // Optional: Personalize the email by replacing {name} if the admin used it
    htmlMail = htmlMail.replace(/\{name\}/g, name);
    
    let downloadButton = '';
    if (magnet.pdf_url) {
      downloadButton = `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magnet.pdf_url}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Download Your PDF</a>
        </div>
      `;
    }

    // 3. Build Full HTML Template
    const fullHtmlEmail = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
          <img src="https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_1280.png" alt="NHMS Logo" style="height: 50px;">
        </div>
        
        <div style="font-size: 16px;">
          ${htmlMail}
          ${downloadButton}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p>You received this email because you requested a resource from NHMS.</p>
          <p>&copy; ${new Date().getFullYear()} NHMS. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const plainTextMail = rawMail.replace(/\*(.*?)\*/g, '$1') + (magnet.pdf_url ? `\n\nDownload link: ${magnet.pdf_url}` : '');

    // 4. Send Email to Lead
    const subject = `Your resource is here: ${magnet.title || magnet.header || magnetType}`;
    GmailApp.sendEmail(email, subject, plainTextMail, {
      htmlBody: fullHtmlEmail,
      name: SENDER_NAME
    });

    // 5. Send Alert Email to Admin
    MailApp.sendEmail(
      NOTIFICATION_EMAIL, 
      `🔥 New Lead: ${name} (${magnetType})`, 
      `You got a new lead!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMagnet: ${magnetType}`
    );

    // 6. Save Lead to Cloudflare D1
    const leadPayload = {
      name: name,
      email: email,
      phone: phone,
      magnet_type: magnetType
    };
    
    UrlFetchApp.fetch(`${API_BASE_URL}/api/leads`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(leadPayload),
      muteHttpExceptions: true
    });

    // 7. Return success
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to handle PDF upload from Admin Dashboard
function handlePdfUpload(e) {
  try {
    const fileData = e.parameter.fileData;
    const fileName = e.parameter.fileName || 'lead_magnet.pdf';
    
    if (!fileData) {
       throw new Error("No file data provided.");
    }
    
    // Decode base64
    const decodedData = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(decodedData, MimeType.PDF, fileName);
    
    // Find or create folder
    let folder;
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
    }
    
    // Create file
    const file = folder.createFile(blob);
    
    // Set permission to anyone with link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return the public URL
    const fileUrl = file.getUrl();
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      url: fileUrl 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS for admin upload
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("").setHeaders(headers);
}

function handleSendOtp(e) {
  try {
    const otp = e.parameter.otp;
    if (!otp) throw new Error("No OTP provided.");
    
    MailApp.sendEmail(
      NOTIFICATION_EMAIL,
      "Your Admin Password Reset OTP",
      `Hello John,\n\nSomeone requested an admin password change for the NHMS Lead Engine.\n\nYour OTP is: ${otp}\n\nIf you did not request this, please ignore this email.`
    );
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "OTP sent"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
