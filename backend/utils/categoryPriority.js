/**
 * Category to Priority Mapping
 * Defines default priority levels for different complaint categories
 */

export const categoryPriorityMap = {
  // High Priority - Critical infrastructure issues
  electricity: 'high',      // Power outages are critical
  water: 'high',            // Water supply is essential
  drainage: 'high',         // Flooding can cause damage
  
  // Medium Priority - Important but not immediately critical
  road: 'medium',           // Road repairs are important
  garbage: 'medium',        // Waste management is important
  streetlight: 'medium',    // Safety concern but not urgent
  
  // Low Priority - Less critical issues
  parks: 'low',            // Recreational, can wait
  other: 'low',            // Miscellaneous issues
};

/**
 * Get priority for a category
 * @param {string} category - Complaint category
 * @returns {string} - Priority level (low, medium, high)
 */
export const getCategoryPriority = (category) => {
  return categoryPriorityMap[category] || 'medium';
};

/**
 * Get resolution time based on priority
 * @param {string} priority - Priority level (low, medium, high)
 * @returns {string} - Resolution time message
 */
export const getResolutionTime = (priority) => {
  const resolutionTimes = {
    high: '1-2 working days',
    medium: '2-4 working days',
    low: '4-6 working days',
    urgent: '1 working day', // If urgent is used
  };
  
  return resolutionTimes[priority] || resolutionTimes.medium;
};

/**
 * Get priority display name
 * @param {string} priority - Priority level
 * @returns {string} - Formatted priority name
 */
export const getPriorityDisplayName = (priority) => {
  const displayNames = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    urgent: 'Urgent',
  };
  
  return displayNames[priority] || 'Medium';
};

