import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'road',
        'drainage',
        'electricity',
        'garbage',
        'water',
        'streetlight',
        'parks',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    images: [
      {
        url: String,
        publicId: String, // For Cloudinary
      },
    ],
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    // GeoJSON Point for efficient geospatial queries
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - MongoDB GeoJSON format
      },
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Verified',
        'Assigned',
        'In-progress',
        'Completed',
        'Closed',
        'Field-verification',
      ],
      default: 'Submitted',
    },
    requiresReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewFlags: [
      {
        type: {
          type: String,
          enum: ['possible_duplicate', 'high_volume'],
        },
        message: String,
        relatedComplaint: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Complaint',
        },
        distanceMeters: Number,
      },
    ],
    isFake: {
      type: Boolean,
      default: false,
    },
    closedReason: {
      type: String,
      enum: ['fake', 'duplicate', 'other'],
    },
    fakeReason: {
      type: String,
      enum: [
        'fabricated_issue',
        'misleading_information',
        'unrelated_photo',
        'incorrect_location',
        'other',
      ],
    },
    fakeRemarks: {
      type: String,
      trim: true,
    },
    markedFakeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    markedFakeAt: Date,
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    fieldVerification: {
      status: {
        type: String,
        enum: ['none', 'pending', 'completed'],
        default: 'none',
      },
      instructions: String,
      assignedAt: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      result: {
        type: String,
        enum: ['issue_exists', 'issue_not_found', 'unable_to_access'],
      },
      remarks: String,
      photoUrl: String,
      latitude: Number,
      longitude: Number,
      distanceFromReportMeters: Number,
      submittedAt: Date,
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    statusHistory: [
      {
        status: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: String,
        },
        note: String,
      },
    ],
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedContractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for efficient queries
complaintSchema.index({ geoLocation: '2dsphere' });

// Ensure geoLocation is set from latitude/longitude before save
complaintSchema.pre('save', function (next) {
  // Set GeoJSON coordinates from latitude/longitude
  if (this.location && this.location.latitude && this.location.longitude) {
    this.geoLocation = {
      type: 'Point',
      coordinates: [this.location.longitude, this.location.latitude], // GeoJSON: [lng, lat]
    };
  }
  
  // Add initial status to history on creation
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date(),
      note: 'Complaint submitted',
    });
  }
  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;

