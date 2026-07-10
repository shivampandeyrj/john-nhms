/**
 * NHMS Apps Script Backend
 * 
 * 1. Create a Google Sheet named "NHMS Leads"
 * 2. Create a tab named "Leads" (Columns: Timestamp, Name, Email, Phone, Magnet Type)
 * 3. Go to Extensions > Apps Script and paste this code.
 * 4. Deploy > New Deployment > Web App (Execute as: Me, Who has access: Anyone)
 * 5. Copy the Web App URL and paste it into js/main.js
 */

const SHEET_NAME = 'Leads';
const NOTIFICATION_EMAIL = 'joel@example.com'; // Change to client's email

function doPost(e) {
  try {
    // Parse the incoming JSON payload
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "No data received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const name = data.name || 'Unknown';
    const email = data.email || 'Unknown';
    const phone = data.phone || 'Unknown';
    const magnetType = data.magnetType || 'Unknown';
    const timestamp = new Date();

    // 1. Log to Google Sheets
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_NAME}' not found.`);
    }
    sheet.appendRow([timestamp, name, email, phone, magnetType]);

    // 2. Send the Resource Email to the User
    sendResourceEmail(name, email, magnetType);

    // 3. Send Alert Email to Joel (Client)
    sendAlertEmail(name, email, phone, magnetType);

    // Return success
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log error and return failure
    console.error(error);
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (e.g., if someone visits the script URL directly)
function doGet(e) {
  return ContentService.createTextOutput("NHMS API is running.");
}

function sendResourceEmail(name, email, magnetType) {
  let subject = "";
  let body = "";
  
  // NOTE: You can attach files from Google Drive here or include direct links.
  if (magnetType === "10k-blueprint") {
    subject = "Here is your 10K Blueprint 🚀";
    body = `Hi ${name},\n\n` +
           `Welcome to NHMS. As promised, here is the link to download your 10K Blueprint:\n\n` +
           `[INSERT LINK TO GOOGLE DRIVE PDF OR HOSTED PDF HERE]\n\n` +
           `If you're serious about scaling, let's map out your custom plan on a 1-on-1 strategy call. You can book a time here:\n` +
           `https://yourdomain.com/call\n\n` +
           `Talk soon,\n` +
           `Joel`;
  } else if (magnetType === "morning-routine") {
    subject = "Your Morning Routine Guide 🌅";
    body = `Hi ${name},\n\n` +
           `Welcome to NHMS. Here is the link to download the Morning Routine guide:\n\n` +
           `[INSERT LINK TO GOOGLE DRIVE PDF OR HOSTED PDF HERE]\n\n` +
           `Want to accelerate your results? Let's chat on a strategy call:\n` +
           `https://yourdomain.com/call\n\n` +
           `Talk soon,\n` +
           `Joel`;
  } else {
    subject = "Your NHMS Resource";
    body = `Hi ${name},\n\nHere is your resource.`;
  }

  // Use GmailApp or MailApp
  GmailApp.sendEmail(email, subject, body, {
    name: "Joel at NHMS"
  });
}

function sendAlertEmail(name, email, phone, magnetType) {
  const subject = `🔥 New Lead: ${name} (${magnetType})`;
  const body = `You got a new lead!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMagnet: ${magnetType}\n\nView Sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;
  
  MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
}
