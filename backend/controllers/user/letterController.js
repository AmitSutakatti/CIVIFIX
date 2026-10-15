import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// @desc    Generate complaint letter using AI
// @route   POST /api/letters/generate
// @access  Private
export const generateLetter = async (req, res) => {
  try {
    const { category, description, user, location, address } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category and description are required',
      });
    }

    // Get category label
    const categoryLabels = {
      road: 'Road Issues',
      drainage: 'Drainage Problems',
      electricity: 'Electricity Issues',
      garbage: 'Garbage Collection',
      water: 'Water Supply',
      streetlight: 'Street Light',
      parks: 'Parks & Recreation',
      other: 'Other Civic Issues',
    };

    const categoryLabel = categoryLabels[category] || category;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to template-based generation if no API key
      const letter = generateTemplateLetter(
        categoryLabel,
        description,
        user,
        location,
        address,
        currentDate
      );
      return res.status(200).json({
        success: true,
        data: { letter },
      });
    }

    // Generate letter using OpenAI
    try {
      const prompt = `Write a formal, professional complaint letter to the Municipal Commissioner about a ${categoryLabel.toLowerCase()} issue. 

User Details:
- Name: ${user?.name || 'Resident'}
- Email: ${user?.email || 'Not provided'}
- Phone: ${user?.phone || 'Not provided'}
- Address: ${address || 'Not specified'}
- Location Coordinates: Latitude ${location?.latitude || 'N/A'}, Longitude ${location?.longitude || 'N/A'}

Issue Details:
- Category: ${categoryLabel}
- Description: ${description}
- Date: ${currentDate}

Requirements:
1. Use formal, respectful language appropriate for official correspondence
2. Include proper letter format with To, Subject, Date, and closing
3. Clearly describe the issue and its impact
4. Request specific actions (inspection, resolution, updates)
5. Include location details
6. Keep it concise but comprehensive (around 200-300 words)
7. End with "Yours faithfully" and include user's name and contact details
8. Add a note that it was submitted via CivicFix Platform

Generate the complete letter:`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Using GPT-3.5-turbo (cheaper) instead of GPT-4
        messages: [
          {
            role: 'system',
            content: 'You are a professional assistant that writes formal complaint letters to municipal authorities. Write clear, respectful, and professional letters.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const letter = completion.choices[0]?.message?.content || '';

      res.status(200).json({
        success: true,
        data: {
          letter: letter.trim(),
        },
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      // Fallback to template if OpenAI fails
      const letter = generateTemplateLetter(
        categoryLabel,
        description,
        user,
        location,
        address,
        currentDate
      );
      res.status(200).json({
        success: true,
        data: { letter },
        warning: 'AI generation failed, using template',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating letter',
      error: error.message,
    });
  }
};

// Fallback template function
const generateTemplateLetter = (
  categoryLabel,
  description,
  user,
  location,
  address,
  currentDate
) => {
  return `To,
The Municipal Commissioner
Municipal Corporation Office
${address || 'City'}

Date: ${currentDate}

Subject: Request for Immediate Action Regarding ${categoryLabel}

Respected Sir/Madam,

I, ${user?.name || 'a resident'}, residing at ${address || 'the area'}, would like to bring to your kind notice a serious ${categoryLabel.toLowerCase()} issue that requires your immediate attention.

DETAILS OF THE ISSUE:

${description}

LOCATION DETAILS:
- Address: ${address || 'As mentioned above'}
- Coordinates: Latitude ${location?.latitude || 'N/A'}, Longitude ${location?.longitude || 'N/A'}

This issue has been causing significant inconvenience to the residents of the area and needs urgent resolution. I request you to kindly:

1. Send an inspection team to verify the issue at the above-mentioned location
2. Take necessary action to resolve the problem at the earliest
3. Keep me informed about the progress and expected resolution timeline

I have attached relevant photographs and location details for your reference. I hope you will take immediate action to address this matter.

Thanking you in anticipation.

Yours faithfully,

${user?.name || 'Resident'}
${user?.email || ''}
${user?.phone ? `Phone: ${user.phone}` : ''}

---
Complaint ID: [Will be assigned after submission]
Submitted via CivicFix Platform`;
};
