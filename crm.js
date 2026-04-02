/**
 * =========================================================================
 * CS CHANDAN - AUTOMATED CRM SYSTEM FOR GOOGLE SHEETS
 * =========================================================================
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Click on Extentions > Apps Script.
 * 3. Delete any code there, paste all of this code, and click the Save (💾) icon.
 * 4. Refresh your Google Sheet. You will now see a new menu called "CS CRM" at the top!
 * 5. Click "CS CRM" > "1. INITIALIZE SETTINGS" to automatically build your dropdowns and colors.
 * 6. To process incoming chatbot leads on autopilot, click the clock icon (⏰) on the left side of Apps Script (Triggers).
 *    -> Add Trigger -> Run: processNewLeads -> Event source: Time-driven -> Minutes timer -> Every minute.
 * =========================================================================
 */

const SHEET_NAME = 'Sheet1'; // Change this if your sheet tab has a different name!

/**
 * Creates the custom menu inside Google Sheets when you open it.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('CS CRM 🚀')
      .addItem('1. INITIALIZE SETTINGS (Run Once)', 'setupCRM')
      .addItem('2. Process New Leads Now', 'processNewLeads')
      .addToUi();
}

/**
 * This function loops through all rows. If it finds a lead that has NO Lead Status yet (a fresh chatbot lead),
 * it will automatically inject the defaults: New, Chatbot, Medium, and Tomorrow's date!
 */
function processNewLeads() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indexes dynamically (Adding 1 because columns are 1-indexed)
  const statusCol = headers.indexOf('Lead Status') + 1;
  const followUpCol = headers.indexOf('Follow-up Date') + 1;
  const sourceCol = headers.indexOf('Source') + 1;
  const priorityCol = headers.indexOf('Priority') + 1;
  const nameCol = headers.indexOf('Name') + 1;
  
  if(statusCol === 0 || nameCol === 0) {
    Logger.log("Could not find 'Lead Status' or 'Name' column. Please check exact names.");
    return;
  }

  // Calculate Tomorrow's Date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Loop through rows (start at row 2 to skip headers)
  for (var i = 1; i < data.length; i++) {
    var rowNum = i + 1;
    var currentName = data[i][nameCol - 1];
    var currentStatus = data[i][statusCol - 1];
    
    // If there is a name (a lead exists) but Status is completely empty (New Lead just landed)
    if (currentName !== "" && currentStatus === "") {
      sheet.getRange(rowNum, statusCol).setValue("New");
      
      if(sourceCol > 0) sheet.getRange(rowNum, sourceCol).setValue("Chatbot");
      if(priorityCol > 0) sheet.getRange(rowNum, priorityCol).setValue("Medium");
      if(followUpCol > 0) {
        sheet.getRange(rowNum, followUpCol).setValue(tomorrow);
        sheet.getRange(rowNum, followUpCol).setNumberFormat("yyyy-mm-dd"); // Format cleaner
      }
    }
  }
}

/**
 * Super Setup Function!
 * Automatically creates Dropdowns mapping and color-codes the entire sheet!
 */
function setupCRM() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const statusCol = headers.indexOf('Lead Status') + 1;
  const priorityCol = headers.indexOf('Priority') + 1;
  const followUpCol = headers.indexOf('Follow-up Date') + 1;
  
  if (statusCol === 0) {
    SpreadsheetApp.getUi().alert("Error: 'Lead Status' column not found. Please add it exactly like that in row 1.");
    return;
  }

  // 1. CREATE STATUS DROPDOWNS
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'Contacted', 'Interested', 'Not Interested', 'Closed'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, statusCol, 999).setDataValidation(statusRule);

  // 2. CREATE PRIORITY DROPDOWNS
  if (priorityCol > 0) {
    const priorityRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['High', 'Medium', 'Low'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, priorityCol, 999).setDataValidation(priorityRule);
  }

  // 3. SET UP CONDITIONAL FORMATTING (COLORS)
  var rules = sheet.getConditionalFormatRules();
  // Clear old rules to avoid duplication
  rules = [];
  
  var statusRange = sheet.getRange(2, statusCol, 999, 1);
  var fullRange = sheet.getRange(2, 1, 999, sheet.getLastColumn());
  
  // Calculate column letter for status (e.g., 'J') and followup (e.g., 'K')
  var statusLetter = sheet.getRange(1, statusCol).getA1Notation().charAt(0);
  var followUpLetter = followUpCol > 0 ? sheet.getRange(1, followUpCol).getA1Notation().charAt(0) : 'Z';
  
  // Rule: New -> Blue
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('New')
    .setBackground('#cfe2f3') // Light blue
    .setFontColor('#0b5394')
    .setRanges([statusRange])
    .build());

  // Rule: Contacted -> Yellow
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Contacted')
    .setBackground('#fff2cc') // Light yellow
    .setFontColor('#b45f06')
    .setRanges([statusRange])
    .build());

  // Rule: Interested -> Orange
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Interested')
    .setBackground('#fce5cd') // Light orange
    .setFontColor('#e69138')
    .setRanges([statusRange])
    .build());

  // Rule: Not Interested -> Red
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Not Interested')
    .setBackground('#f4cccc') // Light red
    .setFontColor('#cc0000')
    .setRanges([statusRange])
    .build());

  // Rule: Closed -> Green
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Closed')
    .setBackground('#d9ead3') // Light green
    .setFontColor('#274e13')
    .setRanges([statusRange])
    .build());

  // Full Row Rule: Closed -> Mark as Completed (Strikethrough row)
  var closedFormula = `=$${statusLetter}2="Closed"`;
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(closedFormula)
    .setFontColor('#888888')
    .setStrikethrough(true)
    .setRanges([fullRange])
    .build());

  // Full Row Rule: Follow-up Date is TODAY -> Highlight Row Bright
  if (followUpCol > 0) {
    var todayFormula = `=$${followUpLetter}2=TODAY()`;
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(todayFormula)
      .setBackground('#ffff00') // Bright Yellow Highlight
      .setRanges([fullRange])
      .build());
  }

  sheet.setConditionalFormatRules(rules);
  
  SpreadsheetApp.getUi().alert("CRM Initialized Successfully! Dropdowns and Auto-colors have been applied! 🚀");
}
