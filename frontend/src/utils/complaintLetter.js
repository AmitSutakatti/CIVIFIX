export const buildComplaintLetter = ({
  categoryLabel,
  description,
  user,
  location,
  address,
} = {}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const lat = location?.latitude ?? 'N/A';
  const lng = location?.longitude ?? 'N/A';

  return `To,
The Municipal Commissioner
Municipal Corporation Office
${address || 'City'}

Date: ${currentDate}

Subject: Request for Immediate Action Regarding ${categoryLabel || 'Civic Issue'}

Respected Sir/Madam,

I, ${user?.name || 'a resident'}, residing at ${address || 'the area'}, would like to bring to your kind notice a serious ${(categoryLabel || 'civic issue').toLowerCase()} issue that requires your immediate attention.

DETAILS OF THE ISSUE:

${description || ''}

LOCATION DETAILS:
- Address: ${address || 'As mentioned above'}
- Coordinates: Latitude ${lat}, Longitude ${lng}

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

export const downloadComplaintLetter = (letter, filenamePrefix = 'Complaint_Letter') => {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Complaint Letter</title>
      </head>
      <body>
        <div style='font-family: Arial, sans-serif; padding: 40px; line-height: 1.6;'>
          ${(letter || '')
            .split('\n')
            .map((line) => {
              if (line.trim() === '') return '<p>&nbsp;</p>';
              if (line.includes('Subject:') || line.includes('Dear')) {
                return `<p style='font-weight: bold; margin-top: 20px;'>${line}</p>`;
              }
              return `<p style='margin-top: 10px;'>${line}</p>`;
            })
            .join('')}
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
