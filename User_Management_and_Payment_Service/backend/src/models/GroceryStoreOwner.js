module.exports = {
    businessName: { type: String },
    businessAddress: { type: String },
    taxId: { type: String },
    businessPhoneNo: { type: String },
    ItemTypes: [{ type: String }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}