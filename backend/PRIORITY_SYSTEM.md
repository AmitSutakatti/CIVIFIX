# 🎯 Priority System for Complaints

## Overview

The CivicFix system automatically assigns priority levels to complaints based on their category. The priority determines the expected resolution time communicated to users via email.

## Priority Levels

| Priority | Resolution Time | Color Code |
|----------|----------------|------------|
| **High** | 1-2 working days | Red |
| **Medium** | 2-4 working days | Yellow |
| **Low** | 4-6 working days | Green |

## Category to Priority Mapping

### High Priority (1-2 days)
- **Electricity** - Power outages are critical infrastructure issues
- **Water** - Water supply is essential for daily life
- **Drainage** - Flooding can cause significant damage

### Medium Priority (2-4 days)
- **Road** - Road repairs are important for safety and accessibility
- **Garbage** - Waste management is important for public health
- **Streetlight** - Safety concern but not immediately urgent

### Low Priority (4-6 days)
- **Parks** - Recreational issues, can wait
- **Other** - Miscellaneous issues

## How It Works

1. **Complaint Creation**: When a user submits a complaint, the system automatically assigns a priority based on the category using `getCategoryPriority()`.

2. **Verification**: When an officer verifies a complaint:
   - If priority is not set, it's automatically assigned based on category
   - The priority is saved to the complaint document
   - An email is sent to the user with the expected resolution time

3. **Email Notification**: The verification email includes:
   - Priority level (High/Medium/Low) with color-coded badge
   - Expected resolution time based on priority

## Code Files

- **`backend/utils/categoryPriority.js`** - Priority mapping and utility functions
- **`backend/controllers/user/complaintController.js`** - Sets priority on complaint creation
- **`backend/controllers/municipal/municipalController.js`** - Sets priority on verification if missing
- **`backend/services/emailService.js`** - Includes priority and resolution time in email

## Customization

To change priority mappings, edit `backend/utils/categoryPriority.js`:

```javascript
export const categoryPriorityMap = {
  electricity: 'high',
  water: 'high',
  // ... modify as needed
};
```

To change resolution times, edit the `getResolutionTime()` function in the same file.

