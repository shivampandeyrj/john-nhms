/**
 * NHMS Apps Script Backend - MAXIMUM SECURITY
 * 
 * This script now only acts as a secure proxy to send emails and upload PDFs.
 * It expects a `secret` parameter that must match the SECRET_TOKEN below.
 */

const NOTIFICATION_EMAIL = "john@newhabitsmindsetshifts.com";
const SENDER_NAME = "John Atkins";
const FOLDER_NAME = "lead maganet pdf dont delete";

// -------------------------------------------------------------
// IMPORTANT: Set this to a random password. It must exactly match
// the "Apps Script Secret Token" you save in the Admin Dashboard!
// -------------------------------------------------------------
const SECRET_TOKEN = "NHMS_k9$vP2m!L8xQ4wN7y@R5cT_2026"; 

function doPost(e) {
  try {
    // 1. Authenticate Request
    if (!e.parameter || e.parameter.secret !== SECRET_TOKEN) {
        throw new Error("Unauthorized: Invalid Secret Token");
    }

    const action = e.parameter.action;

    // 2. Route Action
    if (action === 'upload') {
      return handlePdfUpload(e);
    } else if (action === 'sendOtp') {
      return handleSendOtp(e);
    } else if (action === 'sendLeadEmail') {
      return handleSendLeadEmail(e);
    } else {
      throw new Error("Unknown action");
    }

  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Action: Send Lead Email
function handleSendLeadEmail(e) {
  const email = e.parameter.email;
  const name = e.parameter.name;
  const phone = e.parameter.phone || '';
  const magnetType = e.parameter.magnetType;
  const subject = e.parameter.subject;
  const plainText = e.parameter.plainText;
  const htmlBody = e.parameter.htmlBody;

  if (!email || !subject || !htmlBody) throw new Error("Missing email parameters");

  // Send Email to Lead
  GmailApp.sendEmail(email, subject, plainText, {
    htmlBody: htmlBody,
    name: SENDER_NAME
  });

  // Add Lead to Google Group
  try {
    const groupEmail = "community@newhabitsmindsetshifts.com";
    AdminDirectory.Members.insert({
      email: email,
      role: "MEMBER"
    }, groupEmail);
  } catch (err) {
    console.error("Failed to add to Google Group:", err);
    // Continue execution even if group add fails (e.g., if they are already a member)
  }

  return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
}

// Action: Send OTP
function handleSendOtp(e) {
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
}

// Action: Upload PDF
function handlePdfUpload(e) {
    const fileData = e.parameter.fileData;
    const fileName = e.parameter.fileName || 'lead_magnet.pdf';
    
    if (!fileData) throw new Error("No file data provided.");
    
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
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      url: file.getUrl() 
    })).setMimeType(ContentService.MimeType.JSON);
}

