import { Star, CheckCircle, XCircle, Briefcase, Award, Phone, Mail } from 'lucide-react';

const ContractorCard = ({ contractor, isSelected, onSelect, complaintCategory }) => {
  const rating = contractor.rating || contractor.contractorInfo?.rating || 0;
  const availability = contractor.availability !== undefined 
    ? contractor.availability 
    : (contractor.isActive !== false);
  const experience = contractor.experience || 0;
  const workDone = contractor.workDone || contractor.completedJobs || contractor.contractorInfo?.completedJobs || 0;
  const companyName = contractor.companyName || contractor.contractorInfo?.companyName || contractor.name;
  const specialties = contractor.specialties || contractor.contractorInfo?.specialties || [];

  // Check if contractor specializes in the complaint category
  const isSpecialized = complaintCategory && specialties.includes(complaintCategory);

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div
      onClick={() => onSelect(contractor._id)}
      className={`
        relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }
        ${!availability ? 'opacity-60' : ''}
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
          <CheckCircle className="w-4 h-4" />
        </div>
      )}

      {/* Availability Badge */}
      <div className="absolute top-2 left-2">
        {availability ? (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Available
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Unavailable
          </span>
        )}
      </div>

      {/* Specialization Badge */}
      {isSpecialized && (
        <div className="absolute top-2 left-28 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
          Specialized
        </div>
      )}

      <div className="mt-6">
        {/* Company Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{companyName}</h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center gap-1 ${getRatingColor(rating)}`}>
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold text-lg">{rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({workDone} jobs completed)</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Briefcase className="w-4 h-4" />
              <span className="text-xs">Experience</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{experience} years</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs">Work Done</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{workDone} projects</p>
          </div>
        </div>

        {/* Contact Info */}
        {(contractor.phone || contractor.email) && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex flex-col gap-1 text-xs text-gray-600">
              {contractor.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{contractor.phone}</span>
                </div>
              )}
              {contractor.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{contractor.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                >
                  {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-xs text-gray-500">+{specialties.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorCard;

