const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    /**
     * permissions[] — one object per Screen the role has access to
     * screenCode matches Screen.code in the Screen collection
     *
     * Example:
     * [
     *   { screenCode: "SCREEN_USERS",      canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
     *   { screenCode: "SCREEN_ROLES",      canView: true,  canCreate: false, canEdit: false, canDelete: false },
     *   { screenCode: "SCREEN_INVENTORY",  canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
     * ]
     */
    permissions: [
      {
        screenCode: {
          type: String,
          required: true,
          uppercase: true,
        },
        canView: { type: Boolean, default: false },
        canCreate: { type: Boolean, default: false },
        canEdit: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
      
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SystemUser',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema);
