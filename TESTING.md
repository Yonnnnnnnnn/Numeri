# Numeri Testing Guide

Complete testing procedures for the Numeri application.

---

## 🧪 Test Environment Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Sample test files

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:3000
```

---

## 📋 Test Scenarios

### Test 1: Application Loads Successfully

**Objective**: Verify the app initializes without errors

**Steps**:
1. Open `http://localhost:3000` in browser
2. Wait for page to fully load
3. Check browser console (F12) for errors

**Expected Results**:
- ✅ Page loads without errors
- ✅ Header "Numeri" is visible
- ✅ Control Panel section appears
- ✅ Empty Data Grid with message
- ✅ No console errors

**Pass/Fail**: ___

---

### Test 2: JSON File Upload

**Objective**: Verify JSON file loading and parsing

**Steps**:
1. Click "Upload JSON" button
2. Select `sample_data.json` from project folder
3. Observe grid update

**Expected Results**:
- ✅ File dialog opens
- ✅ 3 transactions appear in grid
- ✅ Success message displays
- ✅ Data matches sample_data.json
- ✅ Summary stats show: 3 transactions, total amount

**Sample Data Check**:
```json
[
  {
    "id": "a1b2-c3d4-e5f6-g7h8",
    "date": "2023-11-22",
    "description": "IBM Cloud Credits",
    "amount": 1500000,
    "category": "Software",
    "type": "expense"
  },
  // ... 2 more items
]
```

**Pass/Fail**: ___

---

### Test 3: Invalid JSON Upload

**Objective**: Verify error handling for invalid files

**Steps**:
1. Create a file with invalid JSON: `{"invalid": }`
2. Click "Upload JSON"
3. Select the invalid file

**Expected Results**:
- ✅ Error message displays
- ✅ Error text: "Invalid JSON Format"
- ✅ Grid remains empty
- ✅ No crash or freeze

**Pass/Fail**: ___

---

### Test 4: Image Upload

**Objective**: Verify image file handling

**Steps**:
1. Click "Upload Image" button
2. Select any image file (JPG, PNG, etc.)
3. Check status message

**Expected Results**:
- ✅ File dialog opens
- ✅ Status message: "Image loaded. Ready to process."
- ✅ No errors in console
- ✅ Button remains clickable

**Pass/Fail**: ___

---

### Test 5: Process with AI (Image)

**Objective**: Verify mock AI processing with image

**Prerequisites**: Image must be uploaded (Test 4)

**Steps**:
1. Upload an image (Test 4)
2. Click "Process with AI"
3. Wait for processing (1.5 seconds)
4. Observe grid update

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Status: "Analyzing Document..."
- ✅ After 1.5s, processing completes
- ✅ New transaction added to grid
- ✅ New row has:
  - Date: Today's date (YYYY-MM-DD)
  - Description: "Receipt from Image"
  - Amount: Random value (10,000-510,000)
  - Category: "Expense"
  - Type: "expense"
- ✅ AI Response message displays
- ✅ Image input clears

**Pass/Fail**: ___

---

### Test 6: Chat Prompt - "add" Command

**Objective**: Verify text-based modification

**Prerequisites**: Data must be loaded (Test 2)

**Steps**:
1. Upload sample_data.json (Test 2)
2. Type in prompt: `add 500`
3. Click "Process with AI"
4. Wait for processing

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Last transaction amount changes to 500
- ✅ Other transactions unchanged
- ✅ AI Response: "Modified dataset based on command..."
- ✅ Prompt field clears

**Pass/Fail**: ___

---

### Test 7: Chat Prompt - "change" Command

**Objective**: Verify description modification

**Prerequisites**: Data must be loaded (Test 2)

**Steps**:
1. Upload sample_data.json (Test 2)
2. Type in prompt: `change description to Lunch`
3. Click "Process with AI"

**Expected Results**:
- ✅ Last transaction description changes
- ✅ New description contains "Lunch"
- ✅ Other fields unchanged
- ✅ AI Response displays

**Pass/Fail**: ___

---

### Test 8: Process with Empty Data

**Objective**: Verify handling of empty dataset

**Steps**:
1. Don't upload any data
2. Type a prompt: `add 100`
3. Click "Process with AI"

**Expected Results**:
- ✅ Processing completes
- ✅ No new transactions added (no data to modify)
- ✅ AI Response shows: "Processed dataset. Total items: 0"

**Pass/Fail**: ___

---

### Test 9: Download JSON

**Objective**: Verify file download functionality

**Prerequisites**: Data must be loaded (Test 2)

**Steps**:
1. Upload sample_data.json (Test 2)
2. Click "Download JSON" button
3. Check Downloads folder

**Expected Results**:
- ✅ File dialog appears (browser dependent)
- ✅ File named: `transactions_updated.json`
- ✅ File is valid JSON
- ✅ File contains all transactions
- ✅ Status message: "Download Ready"

**Verification**:
```bash
# Verify downloaded file is valid JSON
cat transactions_updated.json | jq .
```

**Pass/Fail**: ___

---

### Test 10: Download and Re-upload

**Objective**: Verify round-trip integrity

**Steps**:
1. Upload sample_data.json (Test 2)
2. Download JSON (Test 9)
3. Upload the downloaded file
4. Verify data matches

**Expected Results**:
- ✅ Downloaded file is valid
- ✅ File can be re-uploaded
- ✅ Data matches original
- ✅ All fields preserved
- ✅ No data loss

**Pass/Fail**: ___

---

### Test 11: Error Message Display

**Objective**: Verify error handling UI

**Steps**:
1. Click "Download JSON" without loading data
2. Observe error message

**Expected Results**:
- ✅ Red error banner appears
- ✅ Error text: "No data to download..."
- ✅ Error icon (alert) displays
- ✅ Message disappears after 3 seconds

**Pass/Fail**: ___

---

### Test 12: Status Message Display

**Objective**: Verify success message UI

**Steps**:
1. Upload sample_data.json (Test 2)
2. Observe success message

**Expected Results**:
- ✅ Green success banner appears
- ✅ Success text: "File loaded successfully"
- ✅ Checkmark icon displays
- ✅ Message disappears after 3 seconds

**Pass/Fail**: ___

---

### Test 13: Data Grid Display

**Objective**: Verify table rendering

**Prerequisites**: Data must be loaded (Test 2)

**Steps**:
1. Upload sample_data.json (Test 2)
2. Examine the data grid table

**Expected Results**:
- ✅ Table has 6 columns: ID, Date, Description, Amount, Category, Type
- ✅ 3 rows of data visible
- ✅ ID column shows first 12 characters
- ✅ Amount formatted as currency (IDR)
- ✅ Category shows as badge
- ✅ Type shows as colored badge (green for income, red for expense)
- ✅ Hover effect on rows

**Pass/Fail**: ___

---

### Test 14: Summary Statistics

**Objective**: Verify stats calculation

**Prerequisites**: Data must be loaded (Test 2)

**Steps**:
1. Upload sample_data.json (Test 2)
2. Check summary section below grid

**Expected Results**:
- ✅ Total Transactions: 3
- ✅ Total Amount: 6,750,000 IDR
- ✅ Last Updated: Today's date
- ✅ Stats update after processing

**Pass/Fail**: ___

---

### Test 15: Responsive Design - Desktop

**Objective**: Verify desktop layout

**Steps**:
1. Open app on desktop (1920x1080)
2. Check layout and spacing
3. Verify all buttons are clickable

**Expected Results**:
- ✅ Layout is centered and readable
- ✅ Control panel is 2 columns
- ✅ Data grid is fully visible
- ✅ No horizontal scrolling needed
- ✅ All text is readable

**Pass/Fail**: ___

---

### Test 16: Responsive Design - Tablet

**Objective**: Verify tablet layout

**Steps**:
1. Resize browser to 768x1024 (iPad size)
2. Check layout adaptation
3. Test all interactions

**Expected Results**:
- ✅ Layout adapts to tablet width
- ✅ Control panel may stack
- ✅ Data grid scrolls horizontally if needed
- ✅ Buttons are still clickable
- ✅ Text remains readable

**Pass/Fail**: ___

---

### Test 17: Responsive Design - Mobile

**Objective**: Verify mobile layout

**Steps**:
1. Resize browser to 375x667 (iPhone size)
2. Check layout adaptation
3. Test all interactions

**Expected Results**:
- ✅ Layout is single column
- ✅ Buttons stack vertically
- ✅ Data grid scrolls horizontally
- ✅ Touch-friendly button sizes
- ✅ Text is readable without zoom

**Pass/Fail**: ___

---

### Test 18: Browser Compatibility

**Objective**: Verify cross-browser support

**Steps**:
1. Test on Chrome
2. Test on Firefox
3. Test on Safari
4. Test on Edge

**Expected Results**:
- ✅ App loads on all browsers
- ✅ All features work identically
- ✅ Styling looks consistent
- ✅ No console errors

**Browsers Tested**:
- [ ] Chrome (version: ___)
- [ ] Firefox (version: ___)
- [ ] Safari (version: ___)
- [ ] Edge (version: ___)

**Pass/Fail**: ___

---

### Test 19: Keyboard Navigation

**Objective**: Verify keyboard accessibility

**Steps**:
1. Use Tab key to navigate buttons
2. Use Enter to activate buttons
3. Use Shift+Tab to go backward

**Expected Results**:
- ✅ All buttons are keyboard accessible
- ✅ Focus indicator is visible
- ✅ Enter key activates buttons
- ✅ Tab order is logical

**Pass/Fail**: ___

---

### Test 20: Performance Test

**Objective**: Verify app performance

**Steps**:
1. Open DevTools (F12)
2. Go to Performance tab
3. Record page load
4. Upload large JSON file (1000+ items)
5. Process with AI

**Expected Results**:
- ✅ Page load < 2 seconds
- ✅ JSON parsing < 500ms
- ✅ Grid rendering < 1 second
- ✅ No memory leaks
- ✅ Smooth animations

**Metrics**:
- Page Load Time: ___ ms
- JSON Parse Time: ___ ms
- Grid Render Time: ___ ms
- Memory Usage: ___ MB

**Pass/Fail**: ___

---

## 🔄 Regression Testing

### After Each Code Change

- [ ] Test 1: Application loads
- [ ] Test 2: JSON upload works
- [ ] Test 5: Image processing works
- [ ] Test 6: Chat commands work
- [ ] Test 9: Download works
- [ ] Test 13: Grid displays correctly

---

## 📊 Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | App Loads | ✅/❌ | |
| 2 | JSON Upload | ✅/❌ | |
| 3 | Invalid JSON | ✅/❌ | |
| 4 | Image Upload | ✅/❌ | |
| 5 | Process Image | ✅/❌ | |
| 6 | Chat "add" | ✅/❌ | |
| 7 | Chat "change" | ✅/❌ | |
| 8 | Empty Data | ✅/❌ | |
| 9 | Download | ✅/❌ | |
| 10 | Round-trip | ✅/❌ | |
| 11 | Error Message | ✅/❌ | |
| 12 | Success Message | ✅/❌ | |
| 13 | Grid Display | ✅/❌ | |
| 14 | Statistics | ✅/❌ | |
| 15 | Desktop Layout | ✅/❌ | |
| 16 | Tablet Layout | ✅/❌ | |
| 17 | Mobile Layout | ✅/❌ | |
| 18 | Browser Compat | ✅/❌ | |
| 19 | Keyboard Nav | ✅/❌ | |
| 20 | Performance | ✅/❌ | |

**Total Tests**: 20
**Passed**: ___
**Failed**: ___
**Pass Rate**: ___%

---

## 🐛 Bug Report Template

If you find an issue, use this template:

```
## Bug: [Title]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Version number]
- OS: [Windows/Mac/Linux]

**Steps to Reproduce**:
1. [First step]
2. [Second step]
3. [Expected result]
4. [Actual result]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[Attach screenshots if applicable]

**Console Errors**:
[Paste any console errors]

**Additional Notes**:
[Any other relevant information]
```

---

## ✅ Acceptance Criteria Verification

### Requirement 1: File Upload
- [ ] System accepts valid transactions.json
- [ ] Data displays in table immediately
- [ ] Invalid JSON shows error message
- [ ] Grid updates correctly

### Requirement 2: Vision-to-Data
- [ ] Image upload converts to Base64
- [ ] Process with AI adds new transaction
- [ ] Amount is realistic (10,000-510,000 IDR)
- [ ] Date is set to today

### Requirement 3: Chat Modification
- [ ] Text prompt "add 100" modifies last item
- [ ] Other prompts update description
- [ ] Changes reflect in grid immediately
- [ ] AI response explains changes

### Requirement 4: Download Integrity
- [ ] Downloaded file is valid JSON
- [ ] File can be re-uploaded successfully
- [ ] All data preserved
- [ ] No data loss or corruption

### Requirement 5: No Local Artifacts
- [ ] No permission prompts
- [ ] No file system access
- [ ] HTML5 File API only
- [ ] No local storage access

---

## 🎯 Success Criteria

All tests must pass for release:

- ✅ 20/20 tests passing
- ✅ No critical bugs
- ✅ All acceptance criteria met
- ✅ Cross-browser compatibility verified
- ✅ Responsive design confirmed
- ✅ Performance acceptable

---

## 📝 Test Sign-Off

**Tested By**: ___________________
**Date**: ___________________
**Result**: ✅ PASS / ❌ FAIL

**Notes**:
_________________________________
_________________________________
_________________________________

---

**Testing Completed**: ___________________
**Ready for Deployment**: ✅ YES / ❌ NO

---

**Last Updated**: November 22, 2025
