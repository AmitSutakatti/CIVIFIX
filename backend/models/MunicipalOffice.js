import mongoose from 'mongoose';

const municipalOfficeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Municipal office name is required'],
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['City Corporation', 'Municipal Council', 'Town Panchayat'],
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contact: {
      phone: String,
      email: String,
    },
    location: {
      // GeoJSON Point for efficient geospatial queries
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - MongoDB GeoJSON format
        required: true,
        index: '2dsphere', // Create geospatial index
      },
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    jurisdictionRadius: {
      type: Number, // in kilometers
      default: 15, // Default 15km radius
      min: 5,
      max: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for efficient queries
municipalOfficeSchema.index({ location: '2dsphere' });

// Ensure coordinates are set from latitude/longitude before save
municipalOfficeSchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude], // GeoJSON: [lng, lat]
    };
  }
  next();
});

const MunicipalOffice = mongoose.model('MunicipalOffice', municipalOfficeSchema);

export default MunicipalOffice;
